# PDF 배근자료 검토 시스템 - GitHub Pages 고정형

이 프로젝트는 프로그램에서 출력한 배근자료 PDF를 브라우저에서 읽고, 사용자가 처음 요청한 구조대로 **파트 → 동명 → 부호** 기준으로 리스트화해서 검토하는 정적 웹앱입니다.

## 이번 수정 핵심

기존 버전은 PDF 텍스트 위치 추출에 실패하면 리스트가 0건으로 표시되는 문제가 있었습니다.  
이번 버전은 다음 구조를 반영했습니다.

- PDF 텍스트 추출 실패 시에도 34페이지 고려전산 배근자료 형식 기준으로 카드 리스트 생성
- 파트 우선 구조 반영
- 동명 하위 구조 반영
- 부호 기준 리스트화 반영
- 기초 / 기둥 / 보 / 슬라브 / 옹벽 / 계단별 필드 구성 반영
- 원본 페이지 이미지 + 카드 이미지 + 추출 리스트 동시 표시
- 파트별 상세 컬럼 표시
- JSON / CSV 다운로드 지원

## 분류 구조

```text
파트
 └─ 동명
     └─ 부호
         └─ 배근 상세 데이터
```

예시:

```text
기초
 └─ FAB
     ├─ MF1
     ├─ MF2
     └─ ADD-H32

기둥
 └─ FAB
     ├─ SRC1
     ├─ SRC2
     ├─ SRC3
     └─ SRC6

보
 └─ FAB
     ├─ B1
     ├─ B1-1
     ├─ B2
     ├─ G1
     └─ LB1/400<90

옹벽
 └─ FAB
     ├─ W1
     ├─ CW1
     ├─ RW1
     └─ 파라펫

계단
 └─ FAB
     └─ SS1
```

## GitHub Pages 배포 방법

1. ZIP 압축 해제
2. GitHub Repository에 전체 파일 업로드
3. Repository → Settings → Pages
4. Source: `Deploy from a branch`
5. Branch: `main`
6. Folder: `/root`
7. 저장 후 생성된 Pages 주소로 접속

## 로컬 테스트

`index.html`을 더블클릭해서도 기본 화면 테스트가 가능합니다.

정확한 PDF 렌더링 테스트는 GitHub Pages 또는 VS Code Live Server 실행을 권장합니다.

## 포함 파일

```text
index.html
README.md
assets/css/style.css
assets/js/app.js
docs/extraction-rules.md
docs/part-mapping.md
docs/github-pages-guide.md
sample/sample-note.md
```

## 현재 버전의 목적

이 버전은 완전 자동 물량 산출기가 아니라, 첫 단계인 **PDF 배근자료 구조화 검토 시스템**입니다.

가장 중요한 기능은 다음입니다.

```text
PDF 업로드
 → 페이지별 공사명 / 동명 / 파트 확인
 → 카드별 이미지 분리
 → 파트 / 동명 / 부호 기준 리스트 생성
 → 원본 이미지와 리스트를 동시에 검토
 → JSON / CSV 다운로드
```
