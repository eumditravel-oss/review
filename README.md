# Rebar PDF Reader - GitHub Pages Version

배근자료 PDF를 브라우저에서 직접 읽고, **파트 → 동명 → 부호** 기준으로 리스트화하여 검토하는 정적 웹앱입니다.

이 버전은 **Python 서버 없이 GitHub Pages에 바로 올려서 테스트**할 수 있도록 구성했습니다.

## 실행 방식

- GitHub Pages 정적 호스팅
- HTML / CSS / JavaScript만 사용
- PDF.js를 이용해 브라우저에서 PDF를 직접 분석
- 서버 설치 불필요
- `pip install`, `python server.py` 불필요

## GitHub 업로드 후 실행 방법

1. 이 ZIP 파일을 압축 해제합니다.
2. 압축 해제한 파일 전체를 GitHub Repository에 업로드합니다.
3. GitHub Repository에서 아래 메뉴로 이동합니다.

```text
Settings → Pages
```

4. Source를 아래처럼 설정합니다.

```text
Deploy from a branch
Branch: main
Folder: /root
```

5. 저장 후 1~3분 정도 기다리면 GitHub Pages 주소가 생성됩니다.

예시:

```text
https://사용자명.github.io/repository-name/
```

## 로컬 테스트 방법

압축 해제 후 `index.html`을 더블클릭해서도 기본 테스트가 가능합니다.

다만 브라우저 보안 정책 때문에 PDF.js worker가 제한될 수 있으므로, 정확한 테스트는 GitHub Pages 또는 VS Code Live Server로 실행하는 것을 권장합니다.

## 주요 기능

- PDF 업로드
- PDF 페이지 텍스트 추출
- 페이지 이미지 렌더링
- 3열 × 2행 카드 영역 자동 분할
- 카드별 이미지 미리보기
- 공사명 / 동명 / 파트 / Page 추출
- 카드별 명칭 / 부호 추출
- 파트 / 동명 / 상태 / 부호 검색 필터
- JSON 다운로드
- CSV 다운로드
- 원본 카드 이미지 + 추출 데이터 동시 검토

## 현재 한계

이 버전은 GitHub Pages에서 실행되는 정적 웹앱입니다.

따라서 서버 기반 저장, 사용자 계정, DB 저장, 고성능 OCR은 포함하지 않았습니다.

현재는 PDF 텍스트 레이어와 카드 이미지 분리를 우선 구현했습니다. 카드 내부 철근 상세값은 추출 정확도 향상을 위해 추후 OCR 또는 좌표 기반 인식 로직을 추가해야 합니다.

## 폴더 구조

```text
rebar-pdf-reader-github-pages/
├─ index.html
├─ README.md
├─ .gitignore
├─ assets/
│  ├─ css/
│  │  └─ style.css
│  └─ js/
│     └─ app.js
├─ docs/
│  ├─ extraction-rules.md
│  ├─ part-mapping.md
│  └─ github-pages-guide.md
└─ sample/
   └─ sample-note.md
```

## 개발 방향

1차 목표는 **PDF를 읽어 카드별로 구조화하고 사람이 검토할 수 있는 화면**을 만드는 것입니다.

이후 단계에서 다음 기능을 추가합니다.

- 기초 상세 철근 자동 추출
- 기둥 상세 철근 자동 추출
- 보 하단 표 좌표 기반 추출
- 슬라브 상/하부 주근·부근 자동 추출
- 옹벽 실선/파선 판독 보조
- 계단 참부/계단부 자동 분리
- 검토 결과 저장 기능
