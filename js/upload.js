// CDN으로 불러온 전역 변수 supabase와 이름이 겹치지 않도록 연결 객체 이름을 supabaseClient로 사용합니다.
let supabaseClient = null;

// 처음 사진을 업로드할 때 한 번만 Supabase 연결(supabaseClient)을 만들고, config.js에 자리 표시 글자가 그대로면 친절한 오류를 내는 함수입니다.
function getClient() {
  if (
    typeof SUPABASE_URL !== 'string' ||
    typeof SUPABASE_KEY !== 'string' ||
    !SUPABASE_URL.trim() ||
    !SUPABASE_KEY.trim() ||
    SUPABASE_URL.indexOf('여기에-') !== -1 ||
    SUPABASE_KEY.indexOf('여기에-') !== -1
  ) {
    throw new Error('js/config.js 에 내 Supabase 주소와 키를 먼저 넣어 주세요');
  }

  if (!supabaseClient) {
    if (typeof supabase === 'undefined' || !supabase.createClient) {
      throw new Error('Supabase 라이브러리를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.');
    }
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  return supabaseClient;
}

// 완성된 캔버스(canvas)를 화질 0.9의 JPG 데이터(Blob)로 바꾸어 주는 보조 함수입니다.
function canvasToJpegBlob(canvas) {
  return new Promise(function (resolve, reject) {
    if (!canvas || !canvas.toBlob) {
      reject(new Error('사진 데이터를 만들 수 없어요.'));
      return;
    }

    canvas.toBlob(
      function (blob) {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('JPG 이미지 변환에 실패했어요.'));
        }
      },
      'image/jpeg',
      0.9
    );
  });
}

// 업로드할 사진 파일 이름을 '날짜시간-무작위6글자.jpg'(예: 20261116153000-a1b2c3.jpg) 형식으로 만들어 주는 보조 함수입니다.
function makePhotoFileName() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const dateTimePart = yyyy + mm + dd + hh + min + ss;

  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i += 1) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomPart += chars.charAt(randomIndex);
  }

  return dateTimePart + '-' + randomPart + '.jpg';
}

// 완성된 프레임 캔버스(canvas)를 JPG(화질 0.9)로 만들어 Supabase Storage의 photos 버킷에 올리고 공개 인터넷 주소를 돌려주는 함수입니다.
async function uploadPhoto(canvas) {
  const client = getClient();
  const blob = await canvasToJpegBlob(canvas);
  const fileName = makePhotoFileName();
  const bucketName = typeof PHOTO_BUCKET === 'string' && PHOTO_BUCKET ? PHOTO_BUCKET : 'photos';

  const uploadResult = await client.storage
    .from(bucketName)
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: false
    });

  if (uploadResult.error) {
    throw uploadResult.error;
  }

  const publicUrlResult = client.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  if (
    !publicUrlResult ||
    !publicUrlResult.data ||
    !publicUrlResult.data.publicUrl
  ) {
    throw new Error('공개 사진 주소를 가져오지 못했어요.');
  }

  return publicUrlResult.data.publicUrl;
}

// QR코드를 그릴 요소(element) 안을 깨끗이 비우고 new QRCode로 200×200 크기의 QR코드를 그려 주는 함수입니다.
function drawQrCode(element, url) {
  if (!element) return;

  element.innerHTML = '';

  if (typeof QRCode === 'undefined') {
    throw new Error('QR코드 라이브러리를 불러오지 못했어요.');
  }

  new QRCode(element, {
    text: url,
    width: 200,
    height: 200
  });
}
