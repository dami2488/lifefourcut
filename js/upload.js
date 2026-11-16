// 도화지(canvas)의 그림을 업로드용 PNG 파일 데이터(Blob)로 변환해 주는 보조 함수입니다.
function canvasToBlob(canvas) {
  return new Promise(function (resolve, reject) {
    if (!canvas || typeof canvas.toBlob !== 'function') {
      reject(new Error('사진 데이터를 변환할 수 없습니다.'));
      return;
    }

    canvas.toBlob(function (blob) {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('PNG 이미지 파일 생성에 실패했습니다.'));
      }
    }, 'image/png');
  });
}

// 완성된 인생네컷 도화지(canvas)를 Supabase Storage의 photos 버킷에 올리고 공개 인터넷 주소(url)를 돌려주는 함수입니다.
async function uploadPhoto(canvas) {
  if (typeof isSupabaseConfigured === 'function' && !isSupabaseConfigured()) {
    throw new Error(
      '아직 js/config.js 파일에 Supabase 프로젝트 주소와 Publishable key(공개 키)가 입력되지 않았습니다. 설정 후 다시 시도해 주세요.'
    );
  }

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    throw new Error('Supabase 외부 도구(CDN)를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.');
  }

  const client = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.publishableKey
  );

  const blob = await canvasToBlob(canvas);
  const bucket = SUPABASE_CONFIG.bucketName || 'photos';
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const fileName = 'lifefourcut-' + Date.now() + '-' + randomSuffix + '.png';

  const uploadResult = await client.storage.from(bucket).upload(fileName, blob, {
    contentType: 'image/png',
    upsert: false
  });

  if (uploadResult.error) {
    throw new Error(
      '클라우드 업로드에 실패했습니다 (' +
        uploadResult.error.message +
        '). Supabase의 photos 버킷과 업로드 정책(SQL)을 확인해 주세요.'
    );
  }

  const publicUrlResult = client.storage.from(bucket).getPublicUrl(fileName);
  const publicUrl =
    publicUrlResult &&
    publicUrlResult.data &&
    publicUrlResult.data.publicUrl;

  if (!publicUrl) {
    throw new Error('업로드된 사진의 공개 인터넷 주소를 가져오지 못했습니다.');
  }

  return publicUrl;
}

// 지정한 화면 요소(element) 안에 사진의 인터넷 주소(url)로 연결되는 네모난 QR코드를 그려 주는 함수입니다.
function drawQrCode(element, url) {
  if (!element || !url) return;

  // 이전에 그려진 QR코드가 있다면 먼저 깨끗이 비웁니다.
  element.innerHTML = '';

  if (typeof window.QRCode !== 'function') {
    throw new Error('QR코드 생성 도구(CDN)를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.');
  }

  new window.QRCode(element, {
    text: url,
    width: 160,
    height: 160,
    colorDark: '#111111',
    colorLight: '#ffffff',
    correctLevel: window.QRCode.CorrectLevel.M
  });
}

