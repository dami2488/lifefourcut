// 화면에 상태 안내 문구를 바꿔 주는 함수입니다.
function setStatusMessage(text) {
  const statusEl = document.getElementById('status-message');
  if (statusEl) {
    statusEl.textContent = text;
  }
}

// 오류가 생겼을 때 화면 안의 오류 상자에 친절한 한국어 안내를 보여 주는 함수입니다.
function showErrorMessage(message) {
  const errorEl = document.getElementById('error-message');
  if (!errorEl) return;

  if (message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  } else {
    errorEl.classList.add('hidden');
  }
}

// 지정한 초(seconds) 동안 화면 중앙에 5, 4, 3, 2, 1 카운트다운 숫자를 차례대로 보여 주는 함수입니다.
function runCountdown(seconds) {
  return new Promise(function (resolve) {
    const overlayEl = document.getElementById('countdown-overlay');
    let remaining = seconds;

    overlayEl.textContent = String(remaining);
    overlayEl.classList.remove('hidden');

    const timerId = setInterval(function () {
      remaining -= 1;
      if (remaining > 0) {
        overlayEl.textContent = String(remaining);
      } else {
        clearInterval(timerId);
        overlayEl.classList.add('hidden');
        resolve();
      }
    }, 1000);
  });
}

// 찍힌 사진 도화지(shotCanvas)를 결과 화면의 도화지(result-canvas)에 옮겨 그리는 함수입니다.
function renderResultCanvas(shotCanvas) {
  const resultCanvas = document.getElementById('result-canvas');
  if (!resultCanvas || !shotCanvas) return;

  resultCanvas.width = shotCanvas.width;
  resultCanvas.height = shotCanvas.height;

  const ctx = resultCanvas.getContext('2d');
  ctx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
  ctx.drawImage(shotCanvas, 0, 0);
}

// [촬영하기] 버튼을 눌렀을 때 5초 카운트다운 후 사진 1장을 찍고 결과 화면을 보여 주는 함수입니다.
async function handleShootClick() {
  const videoEl = document.getElementById('camera-video');
  const shootBtn = document.getElementById('shoot-btn');
  const cameraSection = document.getElementById('camera-section');
  const resultSection = document.getElementById('result-section');

  // 촬영 중에는 중복으로 눌리지 않게 버튼을 잠시 막습니다.
  shootBtn.disabled = true;
  showErrorMessage('');
  setStatusMessage('포즈를 취해 주세요! 곧 사진이 찍힙니다.');

  try {
    // 5초 카운트다운(5 -> 4 -> 3 -> 2 -> 1)을 진행합니다.
    await runCountdown(5);

    // 현재 카메라 화면을 도화지(canvas) 1장으로 찍습니다.
    const shotCanvas = captureShot(videoEl);
    renderResultCanvas(shotCanvas);

    // 카메라 화면을 숨기고 결과 확인 화면을 보여 줍니다.
    cameraSection.classList.add('hidden');
    resultSection.classList.remove('hidden');
    setStatusMessage('사진이 완성되었어요! 마음에 들지 않으면 [다시 찍기]를 눌러 주세요.');
  } catch (error) {
    showErrorMessage('사진 촬영 중 문제가 발생했습니다. 다시 시도해 주세요.');
    setStatusMessage('화면을 보고 포즈를 준비한 뒤 [촬영하기] 버튼을 눌러 주세요!');
  } finally {
    shootBtn.disabled = false;
  }
}

// [다시 찍기] 버튼을 눌렀을 때 결과 화면을 숨기고 다시 카메라 촬영 화면으로 돌아가는 함수입니다.
function handleRetakeClick() {
  const cameraSection = document.getElementById('camera-section');
  const resultSection = document.getElementById('result-section');

  resultSection.classList.add('hidden');
  cameraSection.classList.remove('hidden');
  showErrorMessage('');
  setStatusMessage('화면을 보고 포즈를 준비한 뒤 [촬영하기] 버튼을 눌러 주세요!');
}

// 웹페이지가 처음 열렸을 때 카메라를 켜고 버튼 클릭 동작을 연결하는 시작 함수입니다.
async function initApp() {
  const videoEl = document.getElementById('camera-video');
  const shootBtn = document.getElementById('shoot-btn');
  const retakeBtn = document.getElementById('retake-btn');

  shootBtn.addEventListener('click', handleShootClick);
  retakeBtn.addEventListener('click', handleRetakeClick);

  shootBtn.disabled = true;
  setStatusMessage('카메라를 연결하고 있어요. 잠시만 기다려 주세요...');

  try {
    await startCamera(videoEl);
    shootBtn.disabled = false;
    showErrorMessage('');
    setStatusMessage('화면을 보고 포즈를 준비한 뒤 [촬영하기] 버튼을 눌러 주세요!');
  } catch (error) {
    shootBtn.disabled = true;
    setStatusMessage('카메라 연결을 확인해 주세요.');
    showErrorMessage(
      "카메라를 사용할 수 없습니다. 브라우저 주소창 옆에서 카메라 권한을 '허용'으로 바꾸거나, 안전한 주소(https 또는 localhost)에서 다시 열어 주세요."
    );
  }
}

// 화면 구조(DOM)가 모두 준비되면 포토부스 앱을 시작합니다.
window.addEventListener('DOMContentLoaded', initApp);

