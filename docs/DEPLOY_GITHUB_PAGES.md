# GitHub Pages 배포 방법

## 1. Repository 생성

GitHub에서 새 저장소를 생성합니다.

예:

```text
rebar-pdf-extractor
```

## 2. 파일 업로드

ZIP 압축을 풀고 아래 파일을 Repository 루트에 업로드합니다.

```text
index.html
styles.css
app.js
pageTemplates.js
README.md
docs/
```

## 3. GitHub Pages 설정

```text
Settings
→ Pages
→ Build and deployment
→ Source: Deploy from a branch
→ Branch: main
→ Folder: /root
→ Save
```

## 4. 접속

몇 분 후 GitHub Pages 주소가 생성됩니다.

예:

```text
https://계정명.github.io/rebar-pdf-extractor/
```

## 5. 사용

```text
PDF 선택
Gemini API Key 입력
API 상태 확인
분석 실행
```

## 주의

이 방식은 개인용/테스트용입니다.  
API Key가 브라우저에서 사용되므로 운영용으로는 백엔드 API가 필요합니다.
