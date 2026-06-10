# GitHub Pages 배포 방법

## 업로드 파일

Repository 루트에 아래 파일을 업로드합니다.

```text
index.html
styles.css
app.js
pageTemplates.js
README.md
docs/
.gitignore
```

## Pages 설정

```text
Settings
→ Pages
→ Source: Deploy from a branch
→ Branch: main
→ Folder: /root
→ Save
```

## 실행

발급된 GitHub Pages 주소로 접속합니다.

```text
PDF 선택
Gemini API Key 입력
API 상태 확인
분석 실행
```

## 무료 쿼터 주의

Gemini 무료 할당량이 낮을 경우 전체 페이지 분석 중 429 오류가 발생할 수 있습니다.

이 경우:

```text
분석 범위: 지정 페이지
예: 1-3, 4-6, 7-9
```

처럼 나누어 분석하세요.
