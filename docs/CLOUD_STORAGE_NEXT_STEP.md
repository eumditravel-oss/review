# 추후 클라우드 스토리지 전환 구조

GitHub Pages 버전은 프론트엔드 검증용입니다.

운영 단계에서는 아래 구조를 권장합니다.

```text
웹 프론트엔드
→ 로그인
→ 프로젝트 생성
→ PDF 업로드
→ 클라우드 스토리지 저장
→ 백엔드 작업 큐
→ Gemini API 페이지 분석
→ DB 저장
→ 결과 검토/수정
→ Excel/CSV/PDF 출력
```

## 필요한 구성

```text
Frontend: React / Vue / Next.js 등
Backend: Node.js / Python FastAPI
Storage: Google Cloud Storage / Cloudflare R2 / AWS S3
DB: PostgreSQL / Firestore / Supabase
Queue: Cloud Tasks / Celery / BullMQ
AI: Gemini API
```

## 왜 백엔드가 필요한가

```text
API Key 보호
파일 업로드 권한 관리
프로젝트별 데이터 저장
분석 이력 관리
사용자 권한 관리
대용량 PDF 처리
작업 실패 재시도
```

## 현재 GitHub 버전에서 재사용 가능한 부분

```text
Gemini Page API 프롬프트
페이지별 템플릿
결과 표 구조
JSON/CSV 데이터 구조
검토 UI 방향
```
