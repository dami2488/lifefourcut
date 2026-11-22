// 앱의 전체 상태(선택한 컷 수, 찍은 원본 사진 목록, 카메라 켜짐 여부, 현재 필터 이름표, 선택한 프레임 이름표, 현재 컷 번호, 완성된 세로 프레임 캔버스)를 state 객체 하나에 모아 관리합니다.
const state = {
  cuts: 4,
  shots: [],
  cameraOn: false,
  filter: 'original',
  frame: 'puppy-booth',
  currentCutIndex: 0,
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

// 촬영 화면(div#camera-box)의 가로:세로 비율을 선택한 프레임의 사진 칸 비율과 일치시키고, 현재 촬영할 컷(cutIndex: 0~3)의 캐릭터 오버레이(img#char-overlay)만 실시간으로 띄워 주는 함수입니다.
function updateLiveCharacterOverlay(cutIndex) {
  const cameraBoxEl = document.getElementById('camera-box');
  const charOverlayEl = document.getElementById('char-overlay');
  state.currentCutIndex = cutIndex || 0;

  if (cameraBoxEl && typeof getFrameSlotAspectRatio === 'function') {
    cameraBoxEl.style.aspectRatio = getFrameSlotAspectRatio(
      state.frame,
      state.cuts
    );
  }

  if (!charOverlayEl || typeof getCutCharacterOverlay !== 'function') return;

  const overlaySrc = getCutCharacterOverlay(
    state.frame,
    state.currentCutIndex,
    state.cuts
  );

  if (overlaySrc) {
    charOverlayEl.src = overlaySrc;
    charOverlayEl.classList.remove('hidden');
  } else {
    charOverlayEl.removeAttribute('src');
    charOverlayEl.classList.add('hidden');
  }
}

// 아래쪽 미리보기 줄(div#thumbs)을 깨끗이 비우는 함수입니다.
function clearThumbs() {
  const thumbsEl = document.getElementById('thumbs');
  if (thumbsEl) {
    thumbsEl.innerHTML = '';
  }
}

// 방금 찍은 사진 캔버스(shotCanvas)에 현재 컷의 캐릭터를 함께 미리보기로 그려 작은 미리보기 줄(div#thumbs)에 추가하는 함수입니다.
function addThumb(shotCanvas, cutIndex) {
  const thumbsEl = document.getElementById('thumbs');
  if (!thumbsEl || !shotCanvas) return;

  const cfg =
    typeof findFrameConfig === 'function' ? findFrameConfig(state.frame) : null;

  // 4컷 캐릭터 프레임이면 해당 컷의 사진 칸 비율과 캐릭터가 합쳐진 미리보기 썸네일을 보여 줍니다.
  if (cfg && cfg.isImageFrame && state.cuts === 4) {
    const slot = cfg.slots[cutIndex || 0] || cfg.slots[0];
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = Math.round(slot.w / 2);
    thumbCanvas.height = Math.round(slot.h / 2);
    const tctx = thumbCanvas.getContext('2d');

    if (typeof drawPhotoCover === 'function') {
      drawPhotoCover(tctx, shotCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
    } else {
      tctx.drawImage(shotCanvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
    }

    const overlaySrc =
      typeof getCutCharacterOverlay === 'function'
        ? getCutCharacterOverlay(state.frame, cutIndex || 0, state.cuts)
        : null;

    const img = document.createElement('img');
    img.className = 'thumb-item';
    img.alt = (cutIndex + 1) + '컷 미리보기';
    thumbsEl.appendChild(img);

    if (overlaySrc) {
      const ovImg = new Image();
      ovImg.onload = function () {
        tctx.drawImage(ovImg, 0, 0, thumbCanvas.width, thumbCanvas.height);
        img.src = thumbCanvas.toDataURL('image/png');
      };
      ovImg.src = overlaySrc;
    } else {
      img.src = thumbCanvas.toDataURL('image/png');
    }
    return;
  }

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
  flash.style.zIndex = '5';
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

// 촬영 전(div#pre-frames)과 촬영 후(div#result-frames) 상자 안에 각 프레임의 미리보기 카드 버튼을 자동으로 생성하는 함수입니다.
function createFrameButtons() {
  if (typeof FRAMES === 'undefined') return;

  const containerIds = ['pre-frames', 'result-frames'];
  const previewCache = {};

  for (let i = 0; i < FRAMES.length; i += 1) {
    const frameItem = FRAMES[i];
    previewCache[frameItem.name] = createFramePreviewDataUrl(frameItem.name);
  }

  for (let c = 0; c < containerIds.length; c += 1) {
    const box = document.getElementById(containerIds[c]);
    if (!box) continue;

    box.innerHTML = '';

    for (let i = 0; i < FRAMES.length; i += 1) {
      const item = FRAMES[i];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'frame-card-btn';
      btn.setAttribute('data-frame', item.name);

      if (item.name === state.frame) {
        btn.classList.add('active');
      }

      const badge = document.createElement('span');
      badge.className = 'frame-category-badge';
      badge.textContent = item.category;

      const thumbImg = document.createElement('img');
      thumbImg.className = 'frame-thumb-img';
      thumbImg.src = previewCache[item.name];
      thumbImg.alt = item.label + ' 미리보기';

      const label = document.createElement('span');
      label.className = 'frame-card-label';
      label.textContent = item.label;

      btn.appendChild(badge);
      btn.appendChild(thumbImg);
      btn.appendChild(label);

      btn.addEventListener('click', function () {
        state.frame = item.name;
        updateActiveFrameButton();
        updateLiveCharacterOverlay(state.currentCutIndex);
        // 촬영이 끝난 상태에서 프레임을 바꾸면 원본 사진(state.shots)을 유지한 채 즉시 새 프레임으로 합성합니다.
        if (state.shots && state.shots.length > 0) {
          renderResult();
        }
      });

      box.appendChild(btn);
    }
  }
}

// 촬영 전·후 프레임 선택 카드 중 현재 선택된 프레임(state.frame)과 일치하는 버튼에만 강조 표시(.active)를 붙여 주는 함수입니다.
function updateActiveFrameButton() {
  const buttons = document.querySelectorAll('.frame-card-btn');
  for (let i = 0; i < buttons.length; i += 1) {
    const btn = buttons[i];
    const isActive = btn.getAttribute('data-frame') === state.frame;
    btn.classList.toggle('active', isActive);
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

// 원본 사진 목록(state.shots)에는 캐릭터를 영구 합성하지 않고 그대로 둔 채, 매번 필터를 입히고 선택한 프레임(state.frame)과 합성해 결과 화면(img#result-photo)과 state.strip을 갱신하는 함수입니다.
function renderResult() {
  const resultPhotoEl = document.getElementById('result-photo');
  if (!resultPhotoEl || !state.shots.length) return;

  updateActiveFrameButton();
  updateActiveFilterButton();

  // 만약 선택한 프레임 이미지가 아직 로딩 중이면 로딩 완료 즉시 다시 그리도록 연결합니다.
  if (
    typeof loadedFrameImages !== 'undefined' &&
    loadedFrameImages[state.frame] &&
    !loadedFrameImages[state.frame].complete
  ) {
    loadedFrameImages[state.frame].onload = function () {
      renderResult();
    };
  }

  // 화질이 나빠지지 않도록 원본(state.shots)에서 매번 새로 applyFilter를 실행해 복사본을 만듭니다.
  const filteredShots = [];
  for (let i = 0; i < state.shots.length; i += 1) {
    const filteredCopy = applyFilter(state.shots[i], state.filter);
    filteredShots.push(filteredCopy);
  }

  // 선택한 프레임과 각 컷의 캐릭터를 사진 위에 합성합니다.
  const stripCanvas = makeStrip(filteredShots, state.frame);
  state.strip = stripCanvas;
  resultPhotoEl.src = stripCanvas.toDataURL('image/png');

  // 프레임이나 필터가 바뀌면 기존 QR 상자를 숨기고 QR 버튼을 다시 풀어 줍니다.
  resetQrState();
}

// [사진 파일로 저장하기] 버튼(button#download-btn)을 누르면 현재 선택한 프레임과 필터가 적용된 완성 사진(state.strip)을 기기에 다운로드하는 함수입니다.
function handleDownloadClick() {
  if (!state.strip) return;

  const link = document.createElement('a');
  const today =
    typeof formatTodayDate === 'function'
      ? formatTodayDate().replace(/\./g, '')
      : 'photo';
  link.download = 'lifefourcut-' + state.frame + '-' + today + '.png';
  link.href = state.strip.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

// 컷 버튼(button.cut-btn)을 누르면 state.cuts를 저장하고, 1컷 캐릭터 오버레이를 미리 카메라 화면에 띄운 뒤, 카메라가 아직 안 켜졌으면 켜는 함수입니다.
async function handleCutSelect(cuts) {
  const videoEl = document.getElementById('video');
  const shootBtn = document.getElementById('shoot-btn');

  state.cuts = cuts;
  state.shots = [];
  state.filter = 'original';
  state.currentCutIndex = 0;
  state.strip = null;
  clearThumbs();
  resetQrState();
  updateProgress(1, state.cuts);

  // 촬영 시작 전부터 1컷 캐릭터(왼쪽 강아지/고양이/햄스터)를 카메라 위에 미리 표시해 위치를 맞출 수 있게 합니다.
  updateLiveCharacterOverlay(0);
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
        state.cuts === 4
          ? '화면에 보이는 1컷 캐릭터 옆에 얼굴을 맞추고 [촬영 시작]을 눌러 주세요!'
          : state.cuts + '컷 촬영 준비 완료! [촬영 시작] 버튼을 눌러 주세요.'
      );
    } else {
      state.cameraOn = false;
      shootBtn.disabled = true;
      setMessage(result);
    }
  } else {
    shootBtn.disabled = false;
    setMessage(
      state.cuts === 4
        ? '화면에 보이는 1컷 캐릭터 옆에 얼굴을 맞추고 [촬영 시작]을 눌러 주세요!'
        : state.cuts + '컷 촬영 준비 완료! [촬영 시작] 버튼을 눌러 주세요.'
    );
  }
}

// [촬영 시작] 버튼을 누르면 컷 수만큼 반복하면서 매 컷마다 해당 컷의 캐릭터 오버레이(1컷 왼쪽 → 2컷 오른쪽 → 3컷 왼쪽 → 4컷 오른쪽 아래)로 자동 전환하고 원본 사진을 찍어 보관하는 함수입니다.
async function handleShootStart() {
  const videoEl = document.getElementById('video');
  const shootBtn = document.getElementById('shoot-btn');

  shootBtn.disabled = true;
  state.shots = [];
  state.filter = 'original';
  state.strip = null;
  clearThumbs();

  const cutPoseGuides = [
    '왼쪽 캐릭터 옆(오른쪽)에 위치를 맞춰 보세요!',
    '오른쪽 캐릭터 옆(왼쪽)에 위치를 맞춰 보세요!',
    '왼쪽 캐릭터 옆(오른쪽)에서 함께 포즈를 취해 보세요!',
    '오른쪽 아래 잠자는 캐릭터와 함께 마지막 포즈!'
  ];

  try {
    for (let i = 1; i <= state.cuts; i += 1) {
      const cutIdx = i - 1;

      // 1. 현재 찍을 컷(1~4컷)에 맞는 실시간 캐릭터 오버레이로 자동 변경 및 진행 표시
      updateLiveCharacterOverlay(cutIdx);
      updateProgress(i, state.cuts);

      if (state.cuts === 4 && cutPoseGuides[cutIdx]) {
        setMessage(i + ' / 4컷 — ' + cutPoseGuides[cutIdx]);
      } else {
        setMessage(i + ' / ' + state.cuts + '번째 촬영 — 포즈를 취해 주세요!');
      }

      // 2. 5초 카운트다운 (촬영자는 실시간 캐릭터 오버레이를 보며 위치를 맞춤)
      await runCountdown(COUNTDOWN_SECONDS);

      // 3. 플래시 효과
      triggerFlash();

      // 4. captureShot으로 원본 사진(캐릭터 미합성본)을 캡처해 state.shots에 보관
      const shotCanvas = captureShot(videoEl);
      state.shots.push(shotCanvas);

      // 5. 미리보기 줄(div#thumbs)에 추가
      addThumb(shotCanvas, cutIdx);

      // 6. 다음 컷으로 넘어가기 전 0.7초 쉬기 (다음 컷 캐릭터가 곧바로 이어서 나타남)
      setMessage('찰칵!');
      await waitPause(PAUSE_BETWEEN_SHOTS_MS);
    }

    // 촬영이 끝나면 원본 사진 4장(state.shots)과 선택한 프레임을 합쳐 결과 화면을 보여 줍니다.
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
  state.currentCutIndex = 0;
  state.strip = null;
  updateActiveFrameButton();
  updateActiveFilterButton();
  clearThumbs();
  resetQrState();
  showSection('select-section');
}

// 웹페이지가 열렸을 때 프레임 미리보기 버튼들과 필터 버튼들을 자동으로 만들고, 각 버튼의 클릭 동작을 연결하는 시작 함수입니다.
function initApp() {
  const cutButtons = document.querySelectorAll('.cut-btn');
  const shootBtn = document.getElementById('shoot-btn');
  const downloadBtn = document.getElementById('download-btn');
  const qrBtn = document.getElementById('qr-btn');
  const restartBtn = document.getElementById('restart-btn');

  // 촬영 전(#pre-frames)과 촬영 후(#result-frames)에 프레임 미리보기 카드들을 자동으로 생성합니다.
  createFrameButtons();

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

  if (downloadBtn) {
    downloadBtn.addEventListener('click', handleDownloadClick);
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
