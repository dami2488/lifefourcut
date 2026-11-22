# ARCHITECTURE.md — 인생네컷 (`lifefourcut`) 설계도

이 문서는 **인생네컷 웹 포토부스(`lifefourcut`)**가 어떤 구조와 부품들로 만들어지는지 비전공자도 한눈에 이해할 수 있도록 정리한 전체 설계도입니다.

---

## 1. 프로젝트 목표
- **서버 프로그램 없이 만들기**: 복잡한 별도 서버 프로그램이나 설치 도구 없이, 브라우저가 바로 읽을 수 있는 **정적 파일(내용이 고정된 기본 웹 파일인 HTML·CSS·JS)**만으로 포토부스를 만듭니다.
- **실시간 캐릭터 오버레이 & 원본 프레임 합성**: 촬영 중 카메라 화면 위에 현재 촬영할 컷(`1~4컷`)의 캐릭터만 실시간으로 표시하여 촬영자가 캐릭터에 가려지지 않게 위치를 맞추고, 촬영 후에는 원본 사진 4장을 유지한 채 강아지·고양이·햄스터 프레임을 자유롭게 바꾸거나 저장·QR 공유할 수 있습니다.

---

## 2. 3층 구조 표 (화면 층 / 기능 층 / 저장 층)

| 층 이름 | 맡는 일 (쉬운 설명) | 담당 파일 | 사용 단계 |
| :--- | :--- | :--- | :--- |
| **1. 화면 층** | 촬영 전·후 프레임 미리보기 카드(`#pre-frames`, `#result-frames`), 카메라 화면 위 실시간 캐릭터 오버레이(`img#char-overlay`), 카운트 숫자, 작은 미리보기, 세로 프레임, 필터 버튼, 저장 및 QR 공유 상자를 담당합니다. | `index.html`<br>`style.css`<br>`images/frames/*.png` | 1단계 ~ 확장 D |
| **2. 기능 층** | 컷별 실시간 캐릭터 오버레이 전환(`1컷 왼쪽 → 2컷 오른쪽 → 3컷 왼쪽 → 4컷 오른쪽 아래`), 카메라 화면 비율과 최종 사진 잘림 영역 일치(`drawPhotoCover`), 원본 사진 보존 및 투명 프레임 레이어 합성(`makeStrip`), 필터 적용(`applyFilter`)을 담당합니다. | `js/app.js`<br>`js/camera.js`<br>`js/frame.js`<br>`js/filters.js` | 1단계 ~ 확장 D |
| **3. 저장 층** | 완성된 사진을 인터넷 파일 금고(Supabase Storage)의 `photos` 공개 버킷에 올리고, 휴대폰으로 찍어 받을 수 있는 QR코드를 만듭니다. | `js/config.js`<br>`js/upload.js` | 확장 C ~ |

---

## 3. 화면 흐름 (사용자가 겪는 순서)

1. **화면 ①: 캐릭터 프레임 & 컷 수 고르기** (`section#select-section`)
   - 원본 이미지에서 분리한 **강아지 프레임(화이트·레드)**, **고양이 프레임(퍼플·블랙)**, **햄스터 프레임(베이지·브라운)** 및 기본 프레임(`기본 화이트`, `기본 블랙`) 미리보기 카드 중 원하는 프레임을 고릅니다.
   - **[4컷 촬영 (캐릭터)]** 또는 **[2컷 촬영]** 버튼을 눌러 촬영 화면으로 이동합니다.
2. **화면 ②: 실시간 캐릭터 오버레이 촬영** (`section#shoot-section`)
   - 카메라 화면(`div#camera-box`)의 비율이 선택한 프레임의 사진 칸 비율에 정확히 맞춰지고, 전체 테두리 없이 **현재 촬영할 컷의 캐릭터(`img#char-overlay`)만 카메라 영상 위에 실시간으로 표시**됩니다.
   - **1컷**: 왼쪽 캐릭터 ➔ **2컷**: 오른쪽 캐릭터 ➔ **3컷**: 왼쪽 캐릭터 ➔ **4컷**: 오른쪽 아래 잠자는 캐릭터로 자동 전환되며, 촬영한 원본 사진(캐릭터 미합성본)은 `state.shots`에 보관됩니다.
3. **화면 ③: 결과 확인, 프레임·필터 실시간 변경, 저장 및 QR 공유** (`section#result-section`)
   - 원본 사진 4장 위에 선택한 투명 프레임 레이어가 합성된 완성 인생네컷(`img#result-photo`)을 확인합니다.
   - 촬영 후에도 **강아지 ↔ 고양이 ↔ 햄스터** 프레임을 누르면 재촬영 없이 원본 사진 4장은 그대로 유지된 채 프레임과 캐릭터만 즉시 바뀝니다.
   - **[사진 파일로 저장하기]**(`button#download-btn`) 또는 **[QR코드로 휴대폰에 받기]**(`button#qr-btn`)로 최종 사진을 저장·공유합니다.

---

## 4. 부품 표 (파일별 핵심 함수와 역할)

| 파일 | 함수 / 데이터 이름 | 넣는 것 (입력값) | 돌려받는 것 (결과값) | 하는 일 |
| :--- | :--- | :--- | :--- | :--- |
| `js/config.js` | `SUPABASE_URL`, `SUPABASE_KEY`, `PHOTO_BUCKET` | — (설정 상수) | 주소, 공개용 키, `'photos'` | Supabase 연결 주소, 공개용 키(Publishable key), 버킷 이름을 보관합니다. |
| `js/camera.js` | `startCamera(video)` | `video` (`<video>` 태그) | `true` 또는 한국어 안내 문장 | 기기의 카메라를 켜서 `video`에 연결합니다. |
| `js/camera.js` | `captureShot(video)` | `video` (`<video>` 태그) | `800×600` 좌우 반전 원본 `canvas` | 캐릭터가 합성되지 않은 순수 원본 사진을 좌우 반전하여 캡처합니다. |
| `js/frame.js` | `FRAMES`, `FRAME_LAYER_DATA` | — (데이터 목록) | 프레임별 사진 칸 좌표(`slots`)와 투명 프레임·컷별 캐릭터 레이어 | 첨부된 강아지·고양이·햄스터 원본 이미지의 투명 프레임과 1~4컷 캐릭터 레이어를 보관합니다. |
| `js/frame.js` | `getCutCharacterOverlay(frameName, cutIndex, totalCuts)` | 프레임 이름, 현재 컷 번호(`0~3`), 전체 컷 수 | 해당 컷의 투명 캐릭터 이미지 주소 | 촬영 중 현재 찍을 컷의 캐릭터만 카메라 화면 위에 보여주기 위한 레이어 주소를 돌려줍니다. |
| `js/frame.js` | `drawPhotoCover(ctx, shot, dx, dy, dw, dh)` | 캔버스 컨텍스트, 원본 사진, 목표 영역 좌표 | 없음 | 카메라 미리보기(`object-fit: cover`)와 잘림 영역이 100% 일치하도록 중심 비율을 맞춰 사진을 배치합니다. |
| `js/frame.js` | `makeStrip(shots, frameName)` | `shots` (사진 캔버스 목록), `frameName` | 완성된 세로 프레임 `canvas` | 4개의 투명 영역 좌표에 사진 4장을 먼저 배치하고, 그 위에 투명 처리된 원본 프레임 이미지를 덮어 합성합니다. |
| `js/filters.js` | `FILTERS`, `applyFilter(canvas, filterName)` | 원본 `canvas`, 필터 이름 | 필터가 입혀진 새 `canvas` | 원본 사진을 훼손하지 않고 선택한 색상 필터를 입힌 새 캔버스를 돌려줍니다. |
| `js/upload.js` | `uploadPhoto(canvas)`, `drawQrCode(element, url)` | 최종 `canvas`, QR 표시 요소 | 공개 인터넷 주소 (`url`) | 완성 사진을 JPG(0.9)로 `photos` 버킷에 업로드하고 `200×200` QR코드를 그립니다. |
| `js/app.js` | `updateLiveCharacterOverlay(cutIndex)`, `renderResult()` | `state` 객체 | 화면 갱신 | 촬영 중 컷별 실시간 캐릭터 오버레이를 바꾸고, 결과 화면에서 프레임·필터 변경 및 저장·QR 공유를 제어합니다. |

---

## 5. `<script>` 불러오는 순서 (`index.html` 하단)

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script src="js/config.js"></script>
<script src="js/camera.js"></script>
<script src="js/frame.js"></script>
<script src="js/filters.js"></script>
<script src="js/upload.js"></script>
<script src="js/app.js"></script>
```
