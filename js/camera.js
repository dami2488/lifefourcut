// 기기의 카메라를 켜서 화면의 video 태그에 실시간 모습을 연결하는 함수입니다.
async function startCamera(video) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('이 브라우저에서는 카메라 기능을 지원하지 않습니다. 안전한 주소(https 또는 localhost)에서 열어 주세요.');
  }

  // 휴대폰 전면 카메라(셀프 카메라)를 우선으로 요청하고, 세로 화면에 잘 맞게 영상을 받아옵니다.
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 720 },
      height: { ideal: 960 }
    },
    audio: false
  });

  video.srcObject = stream;
  await video.play();
  return stream;
}

// 현재 실시간 영상(video)의 한 장면을 순간 포착해 새 도화지(canvas)에 그려 돌려주는 함수입니다.
function captureShot(video) {
  const canvas = document.createElement('canvas');
  const width = video.videoWidth || 720;
  const height = video.videoHeight || 960;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  // 카메라 미리보기 화면이 거울처럼 좌우 반전되어 있으므로, 찍힌 사진도 보이는 그대로 좌우 반전해 그립니다.
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, width, height);
  ctx.restore();

  return canvas;
}

