# 추후 클라우드 스토리지 전환 구조

현재 GitHub Pages 버전은 프론트엔드 검증용입니다.

운영 단계에서는 아래 구조를 권장합니다.

```text
웹 프론트엔드
→ 백엔드 API
→ 클라우드 스토리지
→ Gemini API
→ DB 저장
```

## 필요한 구성

```text
Frontend: React / Vue / Next.js
Backend: Node.js / Python FastAPI
Storage: Google Cloud Storage / Cloudflare R2 / AWS S3
DB: PostgreSQL / Firestore / Supabase
Queue: Cloud Tasks / Celery / BullMQ
AI: Gemini API
```

## GitHub 버전에서 재사용할 부분

```text
프롬프트
페이지 템플릿
결과 JSON 구조
부호별 리스트 UI
상세 데이터 UI
CSV/JSON 내보내기
```
