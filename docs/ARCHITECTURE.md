# ARCHITECTURE.md — 인생네컷 (`lifefourcut`) 설계도

이 문서는 **인생네컷 웹 포토부스(`lifefourcut`)**가 어떤 구조와 부품들로 만들어지는지 비전공자도 한눈에 이해할 수 있도록 정리한 전체 설계도입니다.

---

## 1. 프로젝트 목표
- **서버 프로그램 없이 만들기**: 복잡한 별도 서버 프로그램이나 설치 도구 없이, 브라우저가 바로 읽을 수 있는 **정적 파일(내용이 고정된 기본 웹 파일인 HTML·CSS·JS)**만으로 포토부스를 만듭니다.
- **사진 보관만 클라우드 사용**: 사진 찍기, 프레임 합치기, 필터 입히기는 모두 사용자의 웹 브라우저 안에서 처리하고, 완성된 사진을 휴대폰으로 전달하기 위한 **사진 보관만 Supabase Storage(인터넷 파일 금고)**를 사용합니다.

---

## 2. 3층 구조 표 (화면 층 / 기능 층 / 저장 층)

우리 프로그램은 역할을 깔끔하게 나누기 위해 **3층 구조**로 나누어 짓습니다.

| 층 이름 | 맡는 일 (쉬운 설명) | 담당 파일 | 사용 단계 |
| :--- | :--- | :--- | :--- |
| **1. 화면 층** | 사용자 눈에 보이는 화면 뼈대와 예쁜 디자인(컷 수 선택 버튼, 카운트 숫자, 작은 미리보기, 세로 프레임, 가로 한 줄 필터 버튼, QR코드 공유 상자)을 담당합니다. | `index.html`<br>`style.css` | 1단계 ~ 확장 C |
| **2. 기능 층** | 2컷/4컷을 고르고, 버튼을 눌렀을 때 카메라를 켜서 5초 카운트 후 사진을 찍어 합치고, 분위기 있는 색상 필터를 입히고, QR 공유 버튼을 연결하는 실제 동작을 담당합니다. | `js/app.js` (화면 전환·반복 촬영·`renderResult()`·QR 버튼 연결)<br>`js/camera.js` (카메라·촬영)<br>`js/frame.js` (세로 프레임 합성)<br>`js/filters.js` (`FILTERS` 목록·`applyFilter`) | 1단계 ~ 확장 C<br>1단계, 확장 A<br>확장 A ~<br>확장 B ~ |
| **3. 저장 층** | 완성된 사진을 인터넷 파일 금고(Supabase Storage)의 `photos` 공개 버킷에 올리고, 휴대폰으로 찍어 받을 수 있는 QR코드를 만듭니다. | `js/config.js` (`SUPABASE_URL`, `SUPABASE_KEY`, `PHOTO_BUCKET`)<br>`js/upload.js` (`getClient`, `uploadPhoto`, `drawQrCode`) | 확장 C |

---

## 3. 화면 흐름 (사용자가 겪는 순서)

사용자가 앱을 켜서 사진을 찍고 결과를 확인하기까지의 3단계 화면 흐름입니다.

1. **화면 ①: 컷 수 고르기** (`section#select-section`)
   - 작은 프레임 그림이 그려진 **[2컷]** 버튼 또는 **[4컷]** 버튼을 눌러 오늘 찍을 사진 장수를 고릅니다.
2. **화면 ②: 촬영** (`section#shoot-section`)
   - **[촬영 시작] 버튼**을 한 번 누르면 **5초 카운트다운(`5 → 4 → 3 → 2 → 1`)** 후 사진이 찍히고, 아래쪽 **작은 미리보기**에 한 장씩 쌓이며, **0.7초 쉬기** 후 다음 촬영이 고른 컷 수만큼 자동으로 이어집니다.
3. **화면 ③: 결과 및 QR 공유** (`section#result-section`)
   - 흰 바탕 세로 프레임 한 장(사진은 `4:3` 비율로 위에서부터 배치, 맨 아래에 **`'인생네컷'`과 오늘 날짜** 표시)을 화면에서 확인합니다.
   - 가로 한 줄로 놓인 **필터 버튼**을 눌러 사진 분위기를 바로 바꿀 수 있습니다. (필터를 바꾸면 기존 QR 상자는 숨겨집니다.)
   - 사진 아래의 **[QR코드로 휴대폰에 받기]** 버튼(`button#qr-btn`)을 누르면 완성 사진이 Supabase Storage의 `photos` 버킷에 올라가고 `200×200` QR코드(`div#qrcode`)와 새 창 링크(`a#photo-link`)가 담긴 상자(`div#qr-box`)가 열립니다.

---

## 4. 부품 표 (파일별 핵심 함수와 역할)

각 자바스크립트(`js/`) 파일에 들어가는 핵심 부품(함수, 특정 일을 처리하는 명령 묶음) 목록입니다. *(기존 함수 이름은 바꾸지 않고 그대로 유지합니다.)*

| 파일 | 함수 / 데이터 이름 | 넣는 것 (입력값) | 돌려받는 것 (결과값) | 하는 일 | 사용 단계 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `js/config.js` | `SUPABASE_URL`,<br>`SUPABASE_KEY`,<br>`PHOTO_BUCKET` | — (설정 상수) | 프로젝트 주소 문자열, 공개용 키(Publishable key) 문자열, `'photos'` | Supabase 연결 주소, 브라우저 공개용 키(Publishable key), 사진을 저장할 버킷 이름(`'photos'`)을 보관합니다. | 확장 C |
| `js/camera.js` | `startCamera(video)` | `video` (카메라 화면을 비출 HTML `<video>` 태그) | 성공하면 `true`, 실패하면 **한국어 안내 문장**(문자열) | 기기의 카메라를 켜서 `video`에 연결하고, 성공 여부(`true`) 또는 실패 시 화면에 보여 줄 한국어 안내 문장을 돌려줍니다. | 1단계 ~ |
| `js/camera.js` | `captureShot(video)` | `video` (현재 실시간 화면이 나오는 `<video>` 태그) | **`800×600` 크기**의 `canvas` (도화지) 한 장 | 화면 가운데를 `4:3` 비율로 잘라 **좌우 반전**된 `800×600` 캔버스 한 장을 만들어 돌려줍니다. | 1단계 ~ |
| `js/frame.js` | `makeStrip(shots)` | `shots` (찍은 사진 `canvas` 목록/배열) | 세로 프레임 `canvas` (도화지) 한 장 | 캔버스 목록(2장 또는 4장)을 받아 흰 바탕 위에서부터 차례대로 배치하고 아래에 `'인생네컷'`과 오늘 날짜를 적은 세로 프레임 캔버스 한 장을 돌려줍니다. | 확장 A ~ |
| `js/filters.js` | `FILTERS` | — (데이터 목록) | 필터 정의 목록 (`name`, `label`, `apply(r,g,b)`) | 각 필터의 이름표, 화면에 보여 줄 이름(`label`), 픽셀 한 점의 색을 바꾸는 함수(`apply(r, g, b)`)를 담아 둡니다. | 확장 B ~ |
| `js/filters.js` | `applyFilter(canvas, filterName)` | `canvas` (원본 사진 `canvas` 한 장),<br>`filterName` (필터 이름표) | 필터를 입힌 **"새" `canvas` 한 장** | **원본 캔버스는 건드리지 않고**, 새 캔버스에 `FILTERS`의 `apply(r, g, b)`로 점(픽셀)마다 색을 바꿔 그린 뒤 돌려줍니다. | 확장 B ~ |
| `js/upload.js` | `uploadPhoto(canvas)` | `canvas` (최종 완성된 인생네컷 도화지 `state.strip`) | 업로드된 사진의 공개 인터넷 주소 (`url` 문자열) | 처음 업로드할 때 `getClient()`로 `supabaseClient` 연결을 만들고, 완성된 도화지를 JPG(화질 `0.9`)로 변환해 `photos` 버킷에 올린 뒤 공개 주소를 돌려줍니다. | 확장 C |
| `js/upload.js` | `drawQrCode(element, url)` | `element` (QR코드를 그릴 화면 영역 태그),<br>`url` (사진의 공개 인터넷 주소) | 없음 (`element` 안을 비우고 `200×200` QR코드 표시) | `element` 안을 깨끗이 비우고 `new QRCode`로 `200×200` 크기의 QR코드를 그려 줍니다. | 확장 C |
| `js/app.js` | `renderResult()` 및 흐름 제어 | `state` 객체 (`cuts`, `shots`, `cameraOn`, `filter`, `strip`) | 없음 (`img#result-photo` 갱신, `state.strip` 저장, QR 상자 초기화) | `state.shots`(원본 사진들)에 `state.filter`를 입혀 `makeStrip`으로 합친 캔버스를 `state.strip`에 저장하고, 기존 QR 상자를 숨기며 QR 업로드 버튼 클릭을 처리합니다. | 1단계 ~ 확장 C |

---

## 5. 데이터 흐름 (한 줄 요약)

> **컷 수 선택(`state.cuts`)** ➔ **카메라 실시간 영상(`startCamera(video)`)** ➔ **5초 카운트 & 0.7초 쉬기로 찍은 `800×600` 좌우 반전 원본 보관(`captureShot(video)` → `state.shots`)** ➔ **`renderResult()`에서 원본마다 새 캔버스로 필터 적용(`applyFilter`) 후 세로 프레임 합성(`makeStrip` → `state.strip` 저장 및 기존 QR 숨김)** ➔ **[QR코드로 휴대폰에 받기] 클릭 시 `uploadPhoto(state.strip)`으로 공개 주소 받아 `drawQrCode(element, url)`로 `200×200` QR코드 표시**

---

## 6. 꼭 지켜야 할 기술 결정 3가지

1. **카메라는 보안 컨텍스트(`HTTPS` 또는 `localhost`)에서만 사용**
2. **일반 `<script>` 태그를 정해진 순서대로 불러오기** (`<script type="module">` 사용 금지)
3. **사진 보관 정책을 사용자가 확인할 수 있게 화면과 문서에 명시** (로그인 없이 열람 가능, 직접 지우기 전까지 보관)

---

## 7. 확장 C (`docs/features/04-qr-share.md`) 세부 설계 명세

### 7-1. 새로 만들거나 고치는 파일
| 파일 경로 | 구분 | 역할 요약 |
| :--- | :---: | :--- |
| `js/config.js` | **새로 만듦** | `SUPABASE_URL`, `SUPABASE_KEY`(Publishable key), `PHOTO_BUCKET = 'photos'` 설정 상수 보관 |
| `js/upload.js` | **새로 만듦** | 지연 연결 생성(`getClient` → `supabaseClient`), `uploadPhoto(canvas)`(JPG 0.9 변환 후 `photos` 버킷 업로드 및 공개 주소 반환), `drawQrCode(element, url)`(`200×200` QR코드 그리기) |
| `index.html`, `style.css` | **수정** | 결과 화면 사진 아래에 `button#qr-btn`, `p#qr-message`, `div#qr-box`(`div#qrcode`, `a#photo-link`) 추가 및 `<script>` 순서 변경 |
| `js/app.js` | **수정** | `state.strip` 저장, `renderResult()` 시 기존 QR 상자 숨김 및 버튼 잠금 해제, `#qr-btn` 클릭 시 업로드·QR 생성·오류 표시 처리 |

### 7-2. 바깥 라이브러리 (CDN 2개)
- **Supabase JS v2 (`@supabase/supabase-js@2`)**: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- **QRCode.js 1.0.0 (`qrcodejs`)**: `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`

### 7-3. `<script>` 불러오는 순서 (`index.html` 하단)
CDN 두 개를 맨 앞에 두고, 이어서 `config.js` → `camera.js` → `frame.js` → `filters.js` → `upload.js` → `app.js` 순서로 불러옵니다.

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
