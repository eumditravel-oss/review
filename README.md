# 배근자료 PDF 데이터 추출 시스템 - GitHub Pages 버전

이 프로젝트는 GitHub Pages에 올려 사용할 수 있는 정적 웹앱입니다.

PDF를 브라우저에서 페이지 이미지로 변환한 뒤, Gemini API가 페이지 전체 이미지를 보고 다음을 동시에 판단합니다.

```text
1. 카드 위치 bbox
2. 카드별 명칭/부호
3. 파트별 배근 상세값
4. bbox 기준 카드 crop 표시
```

## 주요 기능

```text
PDF 업로드
Gemini API Key 직접 입력
Gemini 사용 가능 모델 자동 선택
페이지 단위 분석
카드 bbox 자동 판단
배근값 추출
부호별 리스트
상세 데이터 확인
원본 페이지 + API crop 확인
JSON / CSV 다운로드
브라우저 localStorage 프로젝트 저장
```

## 실행 방법

### 로컬 테스트

브라우저 보안 정책 때문에 파일을 더블클릭해서 여는 방식보다 로컬 서버 실행을 권장합니다.

```bash
python -m http.server 8000
```

브라우저에서 접속:

```text
http://localhost:8000
```

### GitHub Pages 배포

1. GitHub 새 Repository 생성
2. 이 ZIP의 파일 전체 업로드
3. Repository Settings 이동
4. Pages 메뉴 선택
5. Source: Deploy from a branch
6. Branch: main / root 선택
7. 저장
8. 발급된 GitHub Pages 주소로 접속

## API Key 주의

이 버전은 GitHub Pages 단독 정적 웹앱입니다.

따라서 Gemini API Key를 서버에 숨기는 구조가 아닙니다.  
개인 테스트용으로 사용하세요.

운영용으로 전환할 때는 다음 구조를 권장합니다.

```text
브라우저
→ 백엔드 API
→ Gemini API
```

API Key는 백엔드 환경변수에 저장해야 합니다.

## 권장 사용 방식

현재 단계:

```text
GitHub Pages
→ 사용자가 API Key 직접 입력
→ PDF 분석
```

추후 클라우드 스토리지 연동 단계:

```text
웹 프론트엔드
→ 백엔드 API
→ 클라우드 스토리지
→ Gemini API
→ DB 저장
```

## 파일 구성

```text
index.html          화면 구조
styles.css          화면 스타일
app.js              PDF 렌더링 / Gemini API 호출 / 결과 표시
pageTemplates.js    PDF 페이지별 동명·파트·부호 목록
docs/               참고 문서
```

## 분석 방식

기존 카드 단위 방식:

```text
고정 좌표 crop
→ 카드별 API 호출
```

현재 방식:

```text
페이지 전체 이미지
→ Gemini API가 카드 bbox 판단
→ Gemini API가 배근값 추출
→ bbox 기준 crop 표시
```

호출 수 기준:

```text
기존: 카드 약 139회
현재: 페이지 약 34회
```
