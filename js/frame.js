// 오늘 날짜를 '2026.10.25' 같은 'YYYY.MM.DD' 형식으로 만들어 돌려주는 함수입니다.
function formatTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return year + '.' + month + '.' + day;
}

// 찍은 캔버스 목록(shots)을 받아 흰 바탕 세로 프레임 캔버스 한 장(가로 600px, 바깥 여백 24px, 사진 사이 14px, 아래 글자 영역 90px)으로 합쳐 돌려주는 함수입니다.
function makeStrip(shots) {
  const stripCanvas = document.createElement('canvas');
  const count = shots && shots.length ? shots.length : 4;

  // 프레임 가로 600px, 바깥 여백 24px, 사진 사이 14px, 아래 글자 영역 90px
  const totalWidth = 600;
  const outerPadding = 24;
  const gap = 14;
  const footerHeight = 90;

  // 사진 1장이 들어갈 가로·세로 크기 (4:3 비율: 552 x 414)
  const photoWidth = totalWidth - outerPadding * 2;
  const photoHeight = Math.round((photoWidth * 3) / 4);

  // 전체 세로 길이 = 위 여백(24px) + 사진들 높이 + 사진 사이 간격들(14px) + 아래 글자 영역(90px)
  const totalHeight =
    outerPadding + photoHeight * count + gap * (count - 1) + footerHeight;

  stripCanvas.width = totalWidth;
  stripCanvas.height = totalHeight;

  const ctx = stripCanvas.getContext('2d');

  // 1. 전체 바탕을 흰색(#ffffff)으로 칠합니다.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // 2. 사진을 위에서부터 순서대로 붙입니다.
  for (let i = 0; i < count; i += 1) {
    const shot = shots[i];
    if (!shot) continue;

    const x = outerPadding;
    const y = outerPadding + i * (photoHeight + gap);

    ctx.drawImage(shot, x, y, photoWidth, photoHeight);
  }

  // 3. 아래 글자 영역(90px)에 굵은 '인생네컷'과 '2026.10.25' 형식의 오늘 날짜를 적습니다.
  const footerTop = totalHeight - footerHeight;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 굵은 '인생네컷' 글자
  ctx.fillStyle = '#111111';
  ctx.font =
    'bold 28px -apple-system, BlinkMacSystemFont, "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  ctx.fillText('인생네컷', totalWidth / 2, footerTop + 34);

  // 오늘 날짜 (예: 2026.10.25)
  ctx.fillStyle = '#666666';
  ctx.font =
    '500 18px -apple-system, BlinkMacSystemFont, "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  ctx.fillText(formatTodayDate(), totalWidth / 2, footerTop + 66);

  return stripCanvas;
}
