# PROGRESS.md — 인생네컷 (`lifefourcut`) 개발 진행 기록

이 문서는 **인생네컷 웹 포토부스(`lifefourcut`)** 프로젝트에서 현재까지 완료된 작업과 **다음 할 일**, 그리고 **마지막 작업 에이전트와 바꾼 파일**을 기록하는 문서입니다.

---

## 0. 마지막 작업 기록
- **마지막 작업 에이전트**: 검수 에이전트 (`reviewer`)
- **마지막으로 바꾼 파일**:
  - 없음 — 검수 결과만 기록 (`docs/PROGRESS.md` 진행 기록만 갱신)

---

## 1. 전체 진행 현황 요약

| 구분 | 단계 / 문서 | 상태 | 관련 파일 |
| :--- | :--- | :--- | :--- |
| **기본 문서** | 프로젝트 규칙 정의 | ✅ 완료 | `AGENTS.md` |
| **기본 문서** | 전체 구조 및 설계도 작성 | ✅ 완료 | `docs/ARCHITECTURE.md` |
| **기본 문서** | 개발 진행 상황 기록부 작성 | ✅ 완료 | `docs/PROGRESS.md` |
| **에이전트 지침** | 7개 역할별 에이전트 지침서 작성 | ✅ 완료 | `docs/agents/*.md` (7개) |
| **1단계 (기본 촬영)** | 5초 카운트다운 후 사진 1장 촬영 및 확인 | ✅ **전체 완료 (검수 통과)** | `docs/features/step1-basic-shot.md`, `index.html`, `style.css`, `js/camera.js`, `js/app.js` |
| **확장 A** | 2컷·4컷 연속 촬영 및 세로 프레임 합치기 | ⏳ 대기 중 | `js/frame.js`, `js/camera.js`, `js/app.js` |
| **확장 B** | 사진 색상 필터 입히기 | ⏳ 대기 중 | `js/filters.js`, `js/app.js` |
| **확장 C** | Supabase Storage 업로드 및 QR코드 공유 | ⏳ 대기 중 | `js/config.js`, `js/upload.js`, `js/app.js` |

---

## 2. 다음 할 일

- [ ] **총괄 (`orchestrator`)**: **확장 A (2컷·4컷 연속 촬영 및 세로 프레임 합치기)** 작업 계획표 수립

---

## 3. 단계별 세부 체크리스트

### 사전 준비 (문서 및 설계)
- [x] `AGENTS.md` 작성 (기술 스택, 폴더 구조, 단계별 로드맵, 코딩·보안 규칙)
- [x] `docs/ARCHITECTURE.md` 작성 (목표, 3층 구조 표, 화면 흐름, 부품 표, 데이터 흐름, 3대 기술 결정)
- [x] `docs/PROGRESS.md` 생성 및 초기 진행 상태 기록
- [x] `docs/agents/` 7개 역할별 에이전트 지침 문서 작성 (`orchestrator`, `planner`, `architect`, `ui`, `logic`, `reviewer`, `data`)

### 1단계: 기본 촬영 (카메라 연결 + 5초 카운트다운 + 사진 1장 촬영·확인)
- [x] 총괄(`orchestrator`): 1단계 5개 작업 계획표 수립
- [x] 기획(`planner`): `docs/features/step1-basic-shot.md` 작성 완료
- [x] 설계(`architect`): `docs/ARCHITECTURE.md` 1단계 부품 및 `<script>` 순서 확정 완료
- [x] 화면(`ui`): `index.html`, `style.css` 작성 및 `id` 표 정리 완료
- [x] 기능(`logic`): `js/camera.js`, `js/app.js` 작성 완료
- [x] 검수(`reviewer`): 1단계 완료 기준 6개 및 필수 기술 규칙 전체 통과(`✅`) 확인 완료

### 확장 A: 2컷·4컷 연속 촬영 및 세로 프레임
- [ ] 1컷 / 2컷 / 4컷 선택 화면 추가 및 연속 촬영
- [ ] `js/frame.js`: `makeStrip(shots)`로 여러 장의 사진을 세로 프레임 한 장으로 합치기

### 확장 B: 사진 필터
- [ ] `js/filters.js`: `applyFilter(canvas, filterName)` 구현 (원본, 흑백, 따뜻한 느낌, 차가운 느낌 등)
- [ ] 결과 화면에서 필터 선택 버튼 연결 및 미리보기 반영

### 확장 C: 클라우드 업로드 및 QR코드 전송
- [ ] `index.html`: Supabase 및 QR코드 생성 외부 도구(CDN 링크) 연결
- [ ] `js/config.js`: Supabase 주소 및 공개용 키(`Publishable key` / `anon`) 설정 (`Secret key` 금지)
- [ ] `js/upload.js`: `uploadPhoto(canvas)` 및 `drawQrCode(element, url)` 구현
- [ ] 결과 화면에 사진 보관 정책 안내 문구 및 QR코드 표시

---

## 4. 작업 변경 이력 (최근 순)
- **2026-11-11**: 검수 에이전트(`reviewer`)가 1단계 기본 촬영 완료 기준 6개와 필수 기술 규칙(`<script>` 순서, `id` 일치, 한국어 주석, 비밀 키 미노출)을 점검하여 전체 통과(`✅`) 판정하고 `docs/PROGRESS.md`에 1단계 완료를 기록함.
- **2026-11-11**: 기능 에이전트(`logic`)가 `js/camera.js`(`startCamera`, `captureShot`)와 `js/app.js`(5초 카운트다운, 촬영·다시 찍기 화면 전환, 한국어 오류 안내)를 구현하고 `docs/PROGRESS.md`를 갱신함.
- **2026-11-11**: 화면 에이전트(`ui`)가 1단계 기본 촬영용 `index.html`과 `style.css`를 작성하고 화면 요소 `id` 목록을 확정한 뒤 `docs/PROGRESS.md`를 갱신함.
- **2026-11-11**: 설계 에이전트(`architect`)가 `docs/ARCHITECTURE.md`에 1단계 세부 설계 명세(새 파일 4개, `startCamera`·`captureShot` 입출력, 1단계 `<script>` 순서)를 추가하고 `docs/PROGRESS.md`를 갱신함.
- **2026-11-11**: 기획 에이전트(`planner`)가 `docs/features/step1-basic-shot.md`에 1단계 기본 촬영 요구사항을 작성하고 `docs/PROGRESS.md`를 갱신함.
- **2026-11-11**: 총괄 에이전트(`orchestrator`)가 1단계(기본 촬영) 5단계 작업 계획을 수립하고 `docs/PROGRESS.md`의 '다음 할 일'을 갱신함.
- **2026-11-11**: `docs/agents/` 서브 에이전트 문서 6개(`planner.md`, `architect.md`, `ui.md`, `logic.md`, `reviewer.md`, `data.md`) 생성 및 `orchestrator.md` 포함 총 7개 에이전트 체계 완성.
- **2026-11-11**: `docs/agents/orchestrator.md` 생성 — 총괄 에이전트(프로젝트 매니저)의 6가지 행동 지침 작성 완료.
- **2026-11-11**: `docs/PROGRESS.md` 생성 — 프로젝트 전체 진행 단계 표와 세부 체크리스트 작성 완료.
- **2026-11-11**: `docs/ARCHITECTURE.md` 작성 — 3층 구조 표, 부품 표, 데이터 흐름 등 6개 핵심 설계 항목 정리 완료.
- **2026-11-11**: `AGENTS.md` 작성 — 교재 P-01 요구사항에 맞춘 프로젝트 규칙 정의 완료.
