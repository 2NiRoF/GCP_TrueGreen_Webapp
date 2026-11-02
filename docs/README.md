# TrueGreen

경희대학교 세계와시민 GCP - 소비자를 위한 그린워싱 진단 가이드 웹앱.
빌드 도구·서버 없이 HTML/CSS/JS만으로 동작하는 정적 사이트입니다.

## 구성

| 페이지 | 주소 | 내용 |
| --- | --- | --- |
| 홈 | `#/` | 세 가지 질문(무엇이·얼마나·누가), 기능 바로가기 |
| 알아보기 | `#/learn` | 정의·법적 근거, 현황 수치, 8대 원칙, 법적 4유형, TerraChoice 7가지 죄악, 소비·기업·환경 3축, 확인 방법, 규제 현황 |
| 사례 | `#/cases` | 국내외 실제 사례 (국내/해외 필터) |
| 퀴즈 | `#/quiz` | 가상 광고 문항 풀(현재 20개)에서 무작위 10문항 출제 |
| 판독기 | `#/check` | 실제 광고에 적용하는 12문항 체크리스트 → 위험도 점수 |
| 소개 | `#/about` | 프로젝트 목적, 참고 기준, 설문 링크 |

```
docs/                ← GitHub Pages가 이 폴더를 사이트로 배포
├─ .nojekyll         빈 파일 (지우지 말 것)
├─ index.html        뼈대 (메뉴, 푸터)
├─ css/style.css     디자인 (색상은 맨 위 :root 변수)
├─ js/app.js         화면 로직 (보통 수정할 필요 없음)
└─ data/             ★ 내용 수정은 여기만
   ├─ config.js      사이트 이름, 설문 링크, 방문 통계, 모둠 정보
   ├─ content.js     현황 수치, 8대 원칙, 법적 유형, 7가지 죄악, 3축, 확인 방법, 규제
   ├─ cases.js       실제 사례
   ├─ quiz.js        퀴즈 문항 풀, 출제 수, 점수별 결과 문구
   └─ checklist.js   판독기 문항, 배점, 위험도 기준
```

## 실행

`index.html`을 더블클릭하면 브라우저에서 바로 열립니다.

## 내용 수정 방법

- **사이트 이름**: `data/config.js`의 `siteName`
- **설문 링크**: `data/config.js`의 `surveys` - Google Forms 주소를 넣으면 퀴즈 시작/결과 화면과 소개 페이지에 버튼이 생깁니다.
  - `pre`: 강연 전 사전 조사 / `post`: 강연 후 사후 조사·만족도 / `general`: 일반 인식 설문
- **설문 결과 표시**: `data/content.js` → `axes`의 소비 항목 `survey: []`에 `{ value: "62%", label: "설명" }` 추가
- **사례 추가**: `data/cases.js`에서 객체 하나를 복사해 붙여넣고 수정. 출처는 반드시 넣기
- **퀴즈 수정**: `data/quiz.js`의 `pool`에 문항 추가. `correct: true`는 하나만, `id`는 겹치지 않게
  - `drawCount`: 한 번에 출제할 문항 수 (기본 10) / `minGood`: 매번 포함할 정상 광고(`signal: null`) 최소 개수 (기본 2)
  - 문항이 많을수록 다시 풀 때 겹치는 문제가 줄어듭니다.
- **원칙 id** (바꾸지 말 것): `truth` `clarity` `scope` `significance` `voluntary` `completeness` `relevance` `evidence`
- **판독기 배점**: `data/checklist.js`의 `weight`, 등급 경계는 `levels`의 `min`(%)

수정 후 따옴표·쉼표가 빠지면 화면이 비게 됩니다. 그럴 땐 브라우저에서 F12 → Console의 빨간 오류 줄 번호를 확인하세요.

## 판독기 점수 계산

```
점수(%) = Σ(문항 배점 × 응답 계수) / Σ(문항 배점) × 100
응답 계수: 예 = 1, 잘 모르겠음 = 0.5, 아니요 = 0
등급: 55 이상 높음 / 25 이상 주의 / 그 외 낮음
```

'잘 모르겠음'에 절반을 주는 이유: 광고에서 그 정보를 찾을 수 없다는 것 자체가 근거 부족의 신호이기 때문입니다.

## 배포 (GitHub Pages)

사이트 파일은 저장소의 `docs/` 폴더에 있습니다.

1. 저장소를 Public으로 설정 (무료 계정은 Public 저장소만 Pages 사용 가능)
2. Settings → Pages → Source: "Deploy from a branch" → Branch: `main` / `/docs` → Save
3. 1-2분 후 `https://<계정명>.github.io/<저장소명>/` 으로 접속
4. 이후 `main`에 push하면 자동으로 다시 배포됩니다 (진행 상황: 저장소 Actions 탭)

Vercel을 쓸 경우: Import Project → 저장소 선택 → Framework Preset "Other" → Root Directory를 `docs`로 지정 → Deploy.

## 방문 통계 (선택)

결과보고서에 쓸 방문 수·퀴즈 완료 수를 보려면 [GoatCounter](https://www.goatcounter.com)에 무료 가입 후,
`data/config.js`의 `goatcounter`에 `https://<코드>.goatcounter.com/count`를 넣습니다.
페이지별 방문 수와 `quiz-complete`, `check-complete-high/mid/low` 이벤트 수가 집계됩니다. 개인정보·쿠키는 수집하지 않습니다.

## 인계 시 전달할 것

- 저장소 관리자 권한 (Settings → Collaborators)
- GoatCounter 계정
- 이 README
