// 색상 값(빨강 R, 초록 G, 파랑 B)을 0~255 범위 안의 정수로 맞춰 주는 함수입니다.
function clamp(value) {
  if (value < 0) return 0;
  if (value > 255) return 255;
  return Math.round(value);
}

// 7가지 필터의 이름표(name), 화면 이름(label), 색 바꾸는 방법(apply(r, g, b))을 담은 FILTERS 목록입니다.
const FILTERS = [
  {
    name: 'original',
    label: '원본',
    apply: function (r, g, b) {
      return [r, g, b];
    }
  },
  {
    name: 'grayscale',
    label: '흑백',
    apply: function (r, g, b) {
      const gray = clamp(0.299 * r + 0.587 * g + 0.114 * b);
      return [gray, gray, gray];
    }
  },
  {
    name: 'sepia',
    label: '세피아',
    apply: function (r, g, b) {
      return [
        clamp(0.393 * r + 0.769 * g + 0.189 * b),
        clamp(0.349 * r + 0.686 * g + 0.168 * b),
        clamp(0.272 * r + 0.534 * g + 0.131 * b)
      ];
    }
  },
  {
    name: 'warm',
    label: '따뜻하게',
    apply: function (r, g, b) {
      return [clamp(r + 22), clamp(g + 8), clamp(b - 18)];
    }
  },
  {
    name: 'cool',
    label: '시원하게',
    apply: function (r, g, b) {
      return [clamp(r - 16), clamp(g + 6), clamp(b + 24)];
    }
  },
  {
    name: 'bright',
    label: '화사하게',
    apply: function (r, g, b) {
      return [clamp(r * 1.12 + 14), clamp(g * 1.12 + 14), clamp(b * 1.12 + 14)];
    }
  },
  {
    name: 'vintage',
    label: '빈티지',
    apply: function (r, g, b) {
      // 필름 카메라처럼 채도와 대비를 살짝 낮추고, 어두운 부분은 부드럽게 띄우며 따뜻한 크림빛을 더합니다.
      const avg = 0.299 * r + 0.587 * g + 0.114 * b;
      const softR = r * 0.75 + avg * 0.25;
      const softG = g * 0.75 + avg * 0.25;
      const softB = b * 0.75 + avg * 0.25;

      return [
        clamp((softR - 128) * 0.88 + 128 + 18),
        clamp((softG - 128) * 0.88 + 128 + 8),
        clamp((softB - 128) * 0.82 + 128 - 10)
      ];
    }
  }
];

// 필터 이름표(filterName)로 FILTERS 목록에서 해당 필터 객체를 찾아 돌려주는 보조 함수입니다.
function findFilter(filterName) {
  for (let i = 0; i < FILTERS.length; i += 1) {
    if (FILTERS[i].name === filterName) {
      return FILTERS[i];
    }
  }
  return FILTERS[0];
}

// 원본 캔버스(canvas)는 건드리지 않고, getImageData로 점마다 색을 계산해 putImageData로 입힌 "새" 캔버스를 돌려주는 함수입니다.
function applyFilter(canvas, filterName) {
  const newCanvas = document.createElement('canvas');
  const width = canvas.width;
  const height = canvas.height;

  newCanvas.width = width;
  newCanvas.height = height;

  const ctx = newCanvas.getContext('2d');
  ctx.drawImage(canvas, 0, 0);

  // 원본('original' 또는 'none')이면 픽셀 계산 없이 새 캔버스를 그대로 돌려줍니다.
  if (!filterName || filterName === 'original' || filterName === 'none') {
    return newCanvas;
  }

  const filterObj = findFilter(filterName);
  if (!filterObj || filterObj.name === 'original') {
    return newCanvas;
  }

  // getImageData로 모든 점(픽셀)의 R, G, B 값을 꺼내어 계산한 뒤 putImageData로 다시 넣습니다.
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const rgb = filterObj.apply(data[i], data[i + 1], data[i + 2]);
    data[i] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
  }

  ctx.putImageData(imageData, 0, 0);
  return newCanvas;
}
