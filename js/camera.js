// 기기의 카메라를 켜서 video 요소에 연결하고, 성공하면 true, 실패하면 한국어 안내 문장을 돌려주는 함수입니다.
async function startCamera(video) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return '이 브라우저에서는 카메라를 사용할 수 없습니다. 안전한 주소(https 또는 localhost)에서 열어 주세요.';
  }

  try {
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.muted = true;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 960 }
      },
      audio: false
    });

    video.srcObject = stream;

    await new Promise(function (resolve) {
      if (video.readyState >= 1) {
        resolve();
      } else {
        video.onloadedmetadata = function () {
          resolve();
        };
      }
    });

    await video.play();
    return true;
  } catch (error) {
    return "카메라를 켤 수 없습니다. 브라우저 주소창 옆에서 카메라 권한을 '허용'으로 바꿔 주세요.";
  }
}

// 현재 카메라 영상(video)의 가운데를 4:3 비율로 잘라 좌우 반전된 800×600 캔버스 한 장으로 돌려주는 함수입니다.
function captureShot(video) {
  const canvas = document.createElement('canvas');
  const targetWidth = 800;
  const targetHeight = 600;
  const targetRatio = 4 / 3;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const srcWidth = video.videoWidth || targetWidth;
  const srcHeight = video.videoHeight || targetHeight;
  const srcRatio = srcWidth / srcHeight;

  // 가로가 남으면 가로 양옆을 잘라내고, 세로가 남으면 세로 위아래를 잘라내어 가운데 4:3 영역만 구합니다.
  let cropWidth = srcWidth;
  let cropHeight = srcHeight;
  let cropX = 0;
  let cropY = 0;

  if (srcRatio > targetRatio) {
    cropWidth = srcHeight * targetRatio;
    cropX = (srcWidth - cropWidth) / 2;
  } else if (srcRatio < targetRatio) {
    cropHeight = srcWidth / targetRatio;
    cropY = (srcHeight - cropHeight) / 2;
  }

  const ctx = canvas.getContext('2d');

  // 거울처럼 좌우 반전하여 800×600 도화지에 그립니다.
  ctx.save();
  ctx.translate(targetWidth, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(
    video,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );
  ctx.restore();

  return canvas;
}
