# GitHub Pages 배포 가이드

## 1. Repository 생성

GitHub에서 새 Repository를 생성한다.

예시:

```text
rebar-pdf-reader
```

## 2. 파일 업로드

이 ZIP 파일을 압축 해제한 뒤, 아래 파일과 폴더를 그대로 업로드한다.

```text
index.html
README.md
assets/
docs/
sample/
.gitignore
```

## 3. Pages 설정

Repository에서 다음 메뉴로 이동한다.

```text
Settings → Pages
```

Source 설정:

```text
Deploy from a branch
```

Branch 설정:

```text
main
/root
```

저장 후 GitHub Pages URL이 생성된다.

## 4. 접속

예시:

```text
https://사용자명.github.io/rebar-pdf-reader/
```

## 5. 테스트

생성된 페이지에서 PDF 파일을 업로드하고 `분석 실행`을 누른다.

## 6. 주의사항

- 이 프로젝트는 정적 웹앱이므로 서버 설치가 필요 없다.
- 모든 분석은 사용자의 브라우저에서 실행된다.
- 업로드한 PDF는 외부 서버에 저장되지 않는다.
- GitHub Pages는 서버 코드를 실행하지 못하므로 Python, FastAPI, Node 서버 방식은 사용할 수 없다.
