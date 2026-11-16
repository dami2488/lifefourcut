// 앱의 전체 상태(선택한 컷 수, 찍은 원본 사진 목록, 카메라 켜짐 여부, 현재 필터 이름표, 완성된 세로 프레임 캔버스)를 state 객체 하나에 모아 관리합니다.
const state = {
  cuts: 4,
  shots: [],
  cameraOn: false,
  filter: 'original',
  strip: null
};

// 5초 카운트다운 시간과 컷 사이 쉬는 시간(0.7초 = 700밀리초) 설정입니다.
const COUNTDOWN_SECONDS = 5;
const PAUSE_BETWEEN_SHOTS_MS = 700;

// 촬영 화면의 안내 문장(p#message)을 바꿔 주는 함수입니다.
function setMessage(text) {
  const messageEl = document.getElementById('message');
  if (messageEl) {
    messageEl.textContent = text;
  }
}

// 결과 화면의 QR 안내 문장(p#qr-message)을 바꿔 주는 함수입니다.
function setQrMessage(text) {
  const qrMessageEl = document.getElementById('qr-message');
  if (qrMessageEl) {
    qrMessageEl.textContent = text;
  }
}

// 기존 QR 상자(div#qr-box)를 숨기고, 안내 문장을 비우며, [QR코드로 휴대폰에 받기] 버튼(button#qr-btn)의 잠금을 다시 풀어 주는 함수입니다.
function resetQrState() {
  const qrBoxEl = document.getElementById('qr-box');
  const qrBtnEl = document.getElementById('qr-btn');

  if (qrBoxEl) {
    qrBoxEl.classList.add('hidden');
  }
  if (qrBtnEl) {
    qrBtnEl.disabled = false;
  }
  setQrMessage('');
}

// 카메라 위 왼쪽 위의 진행 표시(div#progress)를 "1 / 4" 형태로 바꿔 주는 함수입니다.
function updateProgress(currentShot, totalShots) {
  const progressEl = document.getElementById('progress');
  if (progressEl) {
    progressEl.textContent = currentShot + ' / ' + totalShots;
  }
}

// 아래쪽 미리보기 줄(div#thumbs)을 깨끗이 비우는 함수입니다.
function clearThumbs() {
  const thumbsEl = document.getElementById('thumbs');
  if (thumbsEl) {
    thumbsEl.innerHTML = '';
  }
}

// 방금 찍은 사진 캔버스(shotCanvas)를 작은 미리보기 줄(div#thumbs)에 추가하는 함수입니다.
function addThumb(shotCanvas) {
  const thumbsEl = document.getElementById('thumbs');
  if (!thumbsEl || !shotCanvas) return;

  const img = document.createElement('img');
  img.className = 'thumb-item';
  img.src = shotCanvas.toDataURL('image/png');
  img.alt = '찍은 사진 미리보기';
  thumbsEl.appendChild(img);
}

// 사진이 찍히는 순간 카메라 영역(div#camera-box)에 잠깐 하얀 플래시 효과를 주는 함수입니다.
function triggerFlash() {
  const cameraBox = document.getElementById('camera-box');
  if (!cameraBox) return;

  const flash = document.createElement('div');
  flash.style.position = 'absolute';
  flash.style.inset = '0';
  flash.style.backgroundColor = '#ffffff';
  flash.style.opacity = '0.85';
  flash.style.pointerEvents = 'none';
  flash.style.zIndex = '4';
  cameraBox.appendChild(flash);

  setTimeout(function () {
    if (flash.parentNode) {
      flash.parentNode.removeChild(flash);
    }
  }, 140);
}

// 정해진 밀리초(ms) 동안 잠깐 쉬어 가는(0.7초 대기) 함수입니다.
function waitPause(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

// 지정한 초(seconds) 동안 화면 중앙(div#countdown)에 5, 4, 3, 2, 1 숫자를 1초 간격으로 보여 주는 함수입니다.
function runCountdown(seconds) {
  return new Promise(function (resolve) {
    const countdownEl = document.getElementById('countdown');
    let remaining = seconds;

    countdownEl.textContent = String(remaining);
    countdownEl.classList.remove('hidden');

    const timerId = setInterval(function () {
      remaining -= 1;
      if (remaining > 0) {
        countdownEl.textContent = String(remaining);
      } else {
        clearInterval(timerId);
        countdownEl.classList.add('hidden');
        resolve();
      }
    }, 1000);
  });
}

// 화면 ①(select-section), 화면 ②(shoot-section), 화면 ③(result-section) 중 하나만 보여주고 나머지는 숨기는 함수입니다.
function showSection(sectionId) {
  const ids = ['select-section', 'shoot-section', 'result-section'];
  for (let i = 0; i < ids.length; i += 1) {
    const el = document.getElementById(ids[i]);
    if (el) {
      el.classList.toggle('hidden', ids[i] !== sectionId);
    }
  }
}

// FILTERS 목록을 돌며 빈 상자(div#filters) 안에 알약 모양 필터 버튼(.filter-btn)들을 자동으로 만드는 함수입니다.
function createFilterButtons() {
  const filtersBox = document.getElementById('filters');
  if (!filtersBox || typeof FILTERS === 'undefined') return;

  filtersBox.innerHTML = '';

  for (let i = 0; i < FILTERS.length; i += 1) {
    const item = FILTERS[i];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn';
    btn.setAttribute('data-filter', item.name);
    btn.textContent = item.label;

    if (item.name === state.filter) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', function () {
      state.filter = item.name;
      renderResult();
    });

    filtersBox.appendChild(btn);
  }
}

// 현재 선택된 필터(state.filter)와 일치하는 버튼에만 진한 색(.active) 클래스를 붙여 주는 함수입니다.
function updateActiveFilterButton() {
  const buttons = document.querySelectorAll('#filters .filter-btn');
  for (let i = 0; i < buttons.length; i += 1) {
    const btn = buttons[i];
    const isActive = btn.getAttribute('data-filter') === state.filter;
    btn.classList.toggle('active', isActive);
  }
}

// 원본 사진 목록(state.shots)에서 매번 새로 필터를 입혀 makeStrip으로 합친 뒤, 완성 프레임 캔버스를 state.strip에 저장하고 기존 QR 상자를 숨기며 버튼을 다시 풀어 주는 함수입니다.
function renderResult() {
  const resultPhotoEl = document.getElementById('result-photo');
  if (!resultPhotoEl || !state.shots.length) return;

  updateActiveFilterButton();

  // 화질이 나빠지지 않도록 원본(state.shots)에서 매번 새로 applyFilter를 실행해 복사본을 만듭니다.
  const filteredShots = [];
  for (let i = 0; i < state.shots.length; i += 1) {
    const filteredCopy = applyFilter(state.shots[i], state.filter);
    filteredShots.push(filteredCopy);
  }

  // 프레임 흰 바탕과 글씨에는 필터가 입혀지지 않도록 필터 입힌 사진들을 makeStrip으로 합칩니다.
  const stripCanvas = makeStrip(filteredShots);
  state.strip = stripCanvas;
  resultPhotoEl.src = stripCanvas.toDataURL('image/png');

  // 필터가 바뀌거나 새 결과가 그려지면 기존 QR 상자를 숨기고 QR 버튼을 다시 풀어 줍니다.
  resetQrState();
}

// [QR코드로 휴대폰에 받기] 버튼(button#qr-btn)을 누르면 완성 프레임(state.strip)을 업로드하고 QR코드와 새 창 링크를 보여 주는 함수입니다.
async function handleQrClick() {
  const qrBtnEl = document.getElementById('qr-btn');
  const qrBoxEl = document.getElementById('qr-box');
  const qrcodeEl = document.getElementById('qrcode');
  const photoLinkEl = document.getElementById('photo-link');

  if (!state.strip) return;

  if (qrBtnEl) {
    qrBtnEl.disabled = true;
  }
  if (qrBoxEl) {
    qrBoxEl.classList.add('hidden');
  }
  setQrMessage('사진을 올리는 중이에요...');

  try {
    const publicUrl = await uploadPhoto(state.strip);
    drawQrCode(qrcodeEl, publicUrl);

    if (photoLinkEl) {
      photoLinkEl.href = publicUrl;
    }
    if (qrBoxEl) {
      qrBoxEl.classList.remove('hidden');
    }
    setQrMessage('');
  } catch (error) {
    const errorText =
      error && error.message ? error.message : String(error);
    setQrMessage('올리지 못했어요: ' + errorText);
    if (qrBtnEl) {
      qrBtnEl.disabled = false;
    }
  }
}

// 컷 버튼(button.cut-btn)을 누르면 state.cuts를 저장하고, 사진 목록을 비우고, 촬영 화면으로 전환한 뒤, 카메라가 아직 안 켜졌으면 켜는 함수입니다.
async function handleCutSelect(cuts) {
  const videoEl = document.getElementById('video');
  const shootBtn = document.getElementById('shoot-btn');

  state.cuts = cuts;
  state.shots = [];
  state.filter = 'original';
  state.strip = null;
  clearThumbs();
  resetQrState();
  updateProgress(1, state.cuts);
  showSection('shoot-section');

  // 카메라는 한 번 켜면 계속 켜 두어 다시 권한을 묻지 않게 합니다.
  if (!state.cameraOn) {
    shootBtn.disabled = true;
    setMessage('카메라를 연결하고 있어요. 잠시만 기다려 주세요...');

    const result = await startCamera(videoEl);
    if (result === true) {
      state.cameraOn = true;
      shootBtn.disabled = false;
      setMessage(
        state.cuts + '컷 촬영 준비 완료! [촬영 시작] 버튼을 눌러 주세요.'
      );
    } else {
      state.cameraOn = false;
      shootBtn.disabled = true;
      setMessage(result);
    }
  } else {
    shootBtn.disabled = false;
    setMessage(
      state.cuts + '컷 촬영 준비 완료! [촬영 시작] 버튼을 눌러 주세요.'
    );
  }
}

// [촬영 시작] 버튼을 누르면 컷 수만큼 반복(진행 표시 → 5초 카운트 → 플래시 → captureShot → 미리보기 추가 → 0.7초 쉬기)한 뒤 원본 필터로 renderResult()를 실행하는 함수입니다.
async function handleShootStart() {
  const videoEl = document.getElementById('video');
  const shootBtn = document.getElementById('shoot-btn');

  shootBtn.disabled = true;
  state.shots = [];
  state.filter = 'original';
  state.strip = null;
  clearThumbs();

  try {
    for (let i = 1; i <= state.cuts; i += 1) {
      // 1. 진행 표시 ("1 / 4" 등)
      updateProgress(i, state.cuts);
      setMessage(i + ' / ' + state.cuts + '번째 촬영 — 포즈를 취해 주세요!');

      // 2. 5초 카운트다운
      await runCountdown(COUNTDOWN_SECONDS);

      // 3. 플래시 효과
      triggerFlash();

      // 4. captureShot으로 800×600 좌우 반전 사진 캡처 후 원본(state.shots)에 보관
      const shotCanvas = captureShot(videoEl);
      state.shots.push(shotCanvas);

      // 5. 미리보기 줄(div#thumbs)에 추가
      addThumb(shotCanvas);

      // 6. 0.7초 쉬기
      setMessage('찰칵!');
      await waitPause(PAUSE_BETWEEN_SHOTS_MS);
    }

    // 촬영이 끝나면 원본 필터('original')로 renderResult()를 실행해 결과 화면을 보여 줍니다.
    state.filter = 'original';
    renderResult();
    showSection('result-section');
  } catch (error) {
    setMessage('촬영 중 문제가 발생했습니다. 다시 시도해 주세요.');
  } finally {
    shootBtn.disabled = false;
  }
}

// [처음으로] 버튼(button#restart-btn)을 누르면 컷 수 고르기 화면(section#select-section)으로 돌아가는 함수입니다.
function handleRestart() {
  state.shots = [];
  state.filter = 'original';
  state.strip = null;
  updateActiveFilterButton();
  clearThumbs();
  resetQrState();
  showSection('select-section');
}

// 웹페이지가 열렸을 때 필터 버튼들을 자동으로 만들고, 각 버튼의 클릭 동작을 연결하는 시작 함수입니다.
function initApp() {
  const cutButtons = document.querySelectorAll('.cut-btn');
  const shootBtn = document.getElementById('shoot-btn');
  const qrBtn = document.getElementById('qr-btn');
  const restartBtn = document.getElementById('restart-btn');

  // FILTERS 목록을 돌며 div#filters 안에 버튼들을 자동으로 생성합니다.
  createFilterButtons();

  for (let i = 0; i < cutButtons.length; i += 1) {
    const btn = cutButtons[i];
    btn.addEventListener('click', function () {
      const cuts = Number(btn.getAttribute('data-cuts')) || 4;
      handleCutSelect(cuts);
    });
  }

  if (shootBtn) {
    shootBtn.addEventListener('click', handleShootStart);
  }

  if (qrBtn) {
    qrBtn.addEventListener('click', handleQrClick);
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', handleRestart);
  }

  showSection('select-section');
}

// 화면 구조(DOM)가 준비되면 앱을 시작합니다.
window.addEventListener('DOMContentLoaded', initApp);
