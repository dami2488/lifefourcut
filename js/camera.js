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

// 현재 실시간 영상(video)을 미리보기 화면과 똑같은 3:4 세로 비율로 잘라내어(찌그러짐 없이) 새 도화지(canvas)에 그려 돌려주는 함수입니다.
function captureShot(video) {
  const canvas = document.createElement('canvas');

  // 미리보기 액자 틀(.preview-frame)과 똑같은 3:4 세로 비율로 도화지 크기를 맞춥니다.
  const targetWidth = 720;
  const targetHeight = 960;
  const targetRatio = targetWidth / targetHeight; // 3 / 4 (0.75)

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const srcWidth = video.videoWidth || targetWidth;
  const srcHeight = video.videoHeight || targetHeight;
  const srcRatio = srcWidth / srcHeight;

  // 원본 카메라 영상이 가로로 넓거나 세로로 길어도 사진이 찌그러지지 않도록 가운데 영역만 계산해 잘라냅니다(object-fit: cover 방식).
  let cropWidth = srcWidth;
  let cropHeight = srcHeight;
  let cropX = 0;
  let cropY = 0;

  if (srcRatio > targetRatio) {
    // 카메라 원본이 3:4보다 가로로 넓은 경우 (예: PC 웹캠 16:9, 4:3) -> 좌우 여분을 잘라냄
    cropWidth = srcHeight * targetRatio;
    cropX = (srcWidth - cropWidth) / 2;
  } else if (srcRatio < targetRatio) {
    // 카메라 원본이 3:4보다 세로로 긴 경우 (예: 휴대폰 9:16) -> 위아래 여분을 잘라냄
    cropHeight = srcWidth / targetRatio;
    cropY = (srcHeight - cropHeight) / 2;
  }

  const ctx = canvas.getContext('2d');

  // 카메라 미리보기 화면이 거울처럼 좌우 반전되어 있으므로, 찍힌 사진도 보이는 그대로 좌우 반전해 도화지에 꽉 채워 그립니다.
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
