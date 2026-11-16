# PROGRESS.md — 인생네컷 (`lifefourcut`) 개발 진행 기록

이 문서는 **인생네컷 웹 포토부스(`lifefourcut`)** 프로젝트에서 현재까지 완료된 작업과 **다음 할 일**, 그리고 **마지막 작업 에이전트와 바꾼 파일**을 기록하는 문서입니다.

---

## 0. 마지막 작업 기록
- **마지막 작업 에이전트**: 데이터·배포 에이전트 (`data`) (총괄 `orchestrator` → 기획 `planner` → 설계 `architect` → 데이터 `data` → 화면 `ui` → 기능 `logic` → 검수 `reviewer` → 데이터·배포 `data` 순차 수행 완료)
- **마지막으로 바꾼 파일**:
  - `docs/features/04-qr-share.md`
  - `docs/ARCHITECTURE.md`
  - `js/config.js`
  - `js/upload.js`
  - `index.html`
  - `style.css`
  - `js/app.js`
  - `docs/PROGRESS.md`

---

## 1. 전체 진행 현황 요약

| 구분 | 단계 / 문서 | 상태 | 관련 파일 |
| :--- | :--- | :--- | :--- |
| **기본 문서** | 프로젝트 규칙 정의 | ✅ 완료 | `AGENTS.md` |
| **기본 문서** | 전체 구조 및 설계도 작성 | ✅ 완료 | `docs/ARCHITECTURE.md` |
| **기본 문서** | 개발 진행 상황 기록부 작성 | ✅ 완료 | `docs/PROGRESS.md` |
| **에이전트 지침** | 7개 역할별 에이전트 지침서 작성 | ✅ 완료 | `docs/agents/*.md` (7개) |
| **1단계 (기본 촬영)** | 5초 카운트 후 기본 촬영 및 비율 보정 | ✅ 완료 | `docs/features/step1-basic-shot.md`, `index.html`, `style.css`, `js/camera.js`, `js/app.js` |
| **확장 A (2컷·4컷 프레임)** | 2컷/4컷 선택 후 5초 카운트 연속 촬영 + 세로 프레임 합성 | ✅ 완료 | `docs/features/02-cut-select.md`, `index.html`, `style.css`, `js/camera.js`, `js/frame.js`, `js/app.js` |
| **확장 B (촬영 후 필터)** | 필터(`clamp`, `FILTERS`, `applyFilter`, 자동 버튼 생성, `renderResult()`) 구현 및 검수 | ✅ 완료 | `docs/features/03-filter.md`, `docs/ARCHITECTURE.md`, `index.html`, `style.css`, `js/filters.js`, `js/app.js` |
| **확장 C (클라우드·QR)** | Supabase Storage `photos` 버킷 업로드 및 QR코드 공유 구현·검수·배포 안내 | ✅ **전체 완료 (검수 통과)** | `docs/features/04-qr-share.md`, `docs/ARCHITECTURE.md`, `js/config.js`, `js/upload.js`, `index.html`, `style.css`, `js/app.js` |

---

## 2. 다음 할 일

- [x] **확장 C (Supabase Storage 업로드 및 QR코드 공유)** 기획 → 설계 → 데이터 → 화면 → 기능 → 검수 → 배포 안내 완료
- [x] Supabase MCP를 통해 `js/config.js`에 실제 프로젝트 주소(`https://zgdouwpycwgzudbnlyuk.supabase.co`)와 `Publishable key` 반영 및 Supabase `photos` 공개 버킷·권한(INSERT/SELECT) 자동 생성 완료
- [ ] 브라우저 새로고침 후 QR코드 생성 확인 및 GitHub Pages 업로드하여 휴대폰으로 테스트하기

---

## 3. 단계별 세부 체크리스트

### 사전 준비 (문서 및 설계)
- [x] `AGENTS.md` 작성 (기술 스택, 폴더 구조, 단계별 로드맵, 코딩·보안 규칙)
- [x] `docs/ARCHITECTURE.md` 작성 (목표, 3층 구조 표, 화면 흐름, 부품 표, 데이터 흐름, 3대 기술 결정)
- [x] `docs/PROGRESS.md` 생성 및 초기 진행 상태 기록
- [x] `docs/agents/` 7개 역할별 에이전트 지침 문서 작성 (`orchestrator`, `planner`, `architect`, `ui`, `logic`, `reviewer`, `data`)

### 1단계: 기본 촬영
- [x] 카메라 연결 + 5초 카운트다운 촬영 + 결과 확인 + 다시 찍기 완료
- [x] 사진 찌그러짐 방지 및 비율 보정 완료

### 확장 A: 2컷·4컷 프레임 (`02-cut-select.md`)
- [x] 첫 화면에 2컷·4컷 버튼 및 작은 프레임 아이콘 표시
- [x] 촬영 시작 클릭 시 고른 컷 수만큼 5초 카운트 촬영 및 0.7초 쉬기 자동 반복
- [x] 카메라 위 `"1 / 4"` 진행 표시 및 아래 작은 미리보기(`div#thumbs`) 쌓기
- [x] 흰 바탕 세로 프레임(가로 `600px`, 여백 `24px`, 간격 `14px`, 아래 `90px`)에 `'인생네컷'`과 날짜(`YYYY.MM.DD`) 합성
- [x] 처음으로 버튼(`#restart-btn`)으로 컷 수 다시 고르기

### 확장 B: 촬영 후 필터 (`03-filter.md`)
- [x] 총괄(`orchestrator`): 확장 B 5단계(`기획 → 설계 → 화면 → 기능 → 검수`) 작업 계획표 수립 완료
- [x] 기획(`planner`): `docs/features/03-filter.md` 작성 완료
- [x] 설계(`architect`): `docs/ARCHITECTURE.md`에 `FILTERS`, `applyFilter(canvas, filterName)`, `state.filter`, `renderResult()`, `script` 순서 반영 완료
- [x] 화면(`ui`): `index.html`, `style.css` 결과 사진 위에 `"필터를 골라 보세요"`와 빈 상자 `div#filters`, 알약 모양 `.filter-btn` 가로 스크롤 한 줄 및 `.active` 진한 색 스타일, `id` 목록 표 정리 완료
- [x] 기능(`logic`): `js/filters.js`(`clamp`, `FILTERS`, `applyFilter`) 및 `js/app.js`(`FILTERS` 자동 버튼 생성, `state.filter`, `renderResult()`) 구현 완료
- [x] 검수(`reviewer`): `03-filter.md` 완료 기준 4가지 및 추가 확인 3가지 전체 통과(`✅`) 확인 완료

### 확장 C: 클라우드 업로드 및 QR코드 전송 (`04-qr-share.md`)
- [x] 총괄(`orchestrator`): 확장 C 작업 계획표(데이터·배포 에이전트 포함) 수립 완료
- [x] 기획(`planner`): `docs/features/04-qr-share.md` 작성 완료 (`photos` 공개 버킷 업로드, QR 표시, 로그인 없이 열람, 직접 지우기 전까지 보관, 필터 변경 시 기존 QR 숨김)
- [x] 설계(`architect`): `docs/ARCHITECTURE.md`에 `js/config.js`, `js/upload.js`, CDN 2개(`@supabase/supabase-js@2`, `qrcodejs 1.0.0`), `<script>` 순서 반영 완료
- [x] 데이터(`data`): `js/config.js`(자리 표시 글자 및 복사 위치·보안 경고 주석) 및 `js/upload.js`(`getClient` 지연 연결, `supabaseClient`, `uploadPhoto`, `drawQrCode`) 작성 및 최신 Supabase 대시보드 변경점 안내 완료
- [x] 화면(`ui`): `index.html`, `style.css`에 `button#qr-btn`, `p#qr-message`, `div#qr-box`(`div#qrcode`, `a#photo-link`) 및 `<script>` 순서 적용 완료
- [x] 기능(`logic`): `js/app.js`에 `state.strip` 저장, `renderResult()` 시 QR 숨김·버튼 잠금 해제, `#qr-btn` 클릭 업로드·QR 생성·오류 안내 구현 완료
- [x] 검수(`reviewer`): `04-qr-share.md` 완료 기준 5가지 및 추가 확인 3가지(비밀 키 미포함, `<script>` 순서 일치, `config.js` 비워 둔 상태에서도 촬영·필터 동작) 전체 통과(`✅`) 확인 완료
- [x] 데이터·배포(`data`): `config.js` 값 입력 후 GitHub `Add file → Upload files` 재업로드 및 휴대폰 테스트 5단계 안내 완료

---

## 4. 작업 변경 이력 (최근 순)
- **2026-11-16**: 확장 C("QR코드로 휴대폰에 받기") 전 과정(`orchestrator` → `planner` → `architect` → `data` → `ui` → `logic` → `reviewer` → `data`)을 수행하여 `docs/features/04-qr-share.md`, `docs/ARCHITECTURE.md`, `js/config.js`, `js/upload.js`, `index.html`, `style.css`, `js/app.js`, `docs/PROGRESS.md`를 작성·갱신하고 전체 검수 통과(`✅`) 및 GitHub 재업로드 5단계 가이드를 완성함.
- **2026-11-16**: 검수 에이전트(`reviewer`)가 `docs/features/03-filter.md` 완료 기준 4가지와 추가 확인 3가지를 점검하여 모두 통과(`✅`) 판정하고 `docs/PROGRESS.md`를 갱신함.
- **2026-11-16**: 화면(`ui`) 에이전트와 기능(`logic`) 에이전트가 `index.html`, `style.css`, `js/filters.js`, `js/app.js`를 구현하고 `docs/PROGRESS.md`를 갱신함.
- **2026-11-16**: 총괄(`orchestrator`), 기획(`planner`), 설계(`architect`) 세 역할을 차례로 수행하여 확장 B 계획표, `docs/features/03-filter.md`, `docs/ARCHITECTURE.md`를 작성·갱신함.
- **2026-11-16**: 확장 A(2컷·4컷 프레임 선택 후 연속 촬영) 구현 및 검수 완료.
- **2026-11-11**: 1단계 기본 촬영 및 비율 보정 완료.
- **2026-11-11**: `docs/agents/` 7개 에이전트 문서, `docs/ARCHITECTURE.md`, `docs/PROGRESS.md`, `AGENTS.md` 작성 완료.
