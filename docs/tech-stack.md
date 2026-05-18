# Tech Stack

## Frontend

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 19.2.6 (Create React App / react-scripts 5.0.1) |
| 차트 라이브러리 | Recharts 3.8.1 — BarChart(볼륨 추이), PieChart(부위별 분포) |
| 스타일링 | CSS-in-JS (inline style 객체, `buildS(theme)` 팩토리 함수로 테마 분기) |
| 상태 관리 | React `useState` / `useEffect` (외부 라이브러리 없음) |
| 라우팅 | 없음 — 탭 상태(`input` / `records` / `stats`)를 `useState`로 직접 관리 |
| 테마 | 다크/라이트 모드 토글, `localStorage`에 선택값 영속 저장 |

## 백엔드

별도 서버 없음. **순수 클라이언트 사이드 SPA**.

## 데이터 모델 (localStorage)

스토리지 키: `wk_v1`  
저장 형식: JSON 배열 (`Workout[]`)

```
Workout {
  id          string       // Date.now().toString()
  date        string       // "YYYY-MM-DD"
  startTime   string       // "HH:MM"
  endTime     string       // "HH:MM"
  exercises   Exercise[]
}

Exercise {
  name          string     // 운동명 (자유 입력)
  targetMuscle  string     // 가슴 | 등 | 어깨 | 이두 | 삼두 | 하체 | 복근 | 전신
  sets          Set[]
}

Set {
  weight  number           // kg
  reps    number           // 반복 수
}
```

파생 값 (저장 안 함, 렌더링 시 계산):

- `vol(workout)` — 볼륨 합계 (Σ weight × reps)
- `dur(workout)` — 운동 시간 (분)

## 폴더 구조

```
workout-tracker/
├── docs/
│   ├── brand-concept.md      # 브랜드 컨셉 (Levio)
│   └── tech-stack.md         # 이 파일
├── img/
│   ├── logo-v1.png
│   └── logo-v2.png
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── App.js                # 메인 컴포넌트 (전체 기능 단일 파일)
│   ├── App.css
│   ├── App.test.js
│   ├── index.js              # 엔트리 포인트
│   ├── index.css
│   └── reportWebVitals.js
├── build/                    # 프로덕션 빌드 산출물 (git 추적)
├── .gitlab-ci.yml            # GitLab CI — Secret Detection
├── package.json
└── README.md
```

## 배포 및 CI/CD

| 항목 | 내용 |
|------|------|
| 호스팅 | Netlify (netlify-cli 26.0.2) |
| 라이브 URL | https://astonishing-starlight-6975df.netlify.app |
| CI/CD | GitLab CI — Secret Detection 파이프라인 (`.gitlab-ci.yml`) |
| 빌드 명령 | `npm run build` (CRA 기본) |
