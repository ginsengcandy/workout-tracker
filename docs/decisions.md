# Design Decisions

## 1. 단일 컴포넌트 아키텍처 (App.js 단일 파일)

**결정:** 모든 UI, 상태, 로직을 `src/App.js` 하나에 담는다.

**이유:** 앱의 규모가 작고 화면 간 상태 공유가 밀접하다(입력 폼, 기록 목록, 통계가 모두 같은 `workouts` 배열을 바라본다). 이 시점에 파일을 분리하면 props drilling이나 Context 설정 비용이 생기고, 실질적인 이점 없이 파일 탐색 횟수만 늘어난다. 컴포넌트 분리는 재사용이 필요하거나 단일 파일이 진짜 읽기 어려워졌을 때 하면 된다.

---

## 2. 백엔드 없음 — localStorage 단독 저장

**결정:** 서버, DB, API를 두지 않고 `localStorage`(`wk_v1` 키)에 JSON 배열을 직접 저장한다.

**이유:** 개인 단독 사용 앱이다. 서버를 도입하면 인증, CORS, 배포 인프라, 비용이 따라온다. localStorage는 단일 기기·단일 사용자 시나리오에서 영속 저장소로 충분하다. 데이터 구조 변경이 필요해지면 `wk_v2`처럼 키 버전을 올려 마이그레이션할 수 있도록 처음부터 버전 접미사를 키에 포함시켰다.

---

## 3. CSS 프레임워크 없이 CSS-in-JS (inline style 객체)

**결정:** Tailwind, Bootstrap, styled-components 대신 순수 inline style 객체를 사용한다. 스타일은 `buildS(theme)` 팩토리 함수가 테마 토큰을 받아 생성한다.

**이유:** 가장 큰 이유는 **Recharts와의 연동** 때문이다. Recharts의 axis tick, tooltip 등은 React props로 색상을 받기 때문에 CSS 변수(CSS custom properties)를 그대로 전달할 수 없다. JS 객체로 테마 토큰을 관리하면 차트에도 동일한 값을 직접 넘길 수 있어 테마 전환 시 차트까지 일관성 있게 바뀐다. 추가로 외부 CSS 라이브러리 번들이 없어 빌드 크기도 최소화된다.

**트레이드오프:** 미디어 쿼리나 pseudo-class(`:hover`, `:focus`)를 inline style로 처리하기 어렵다. 지금은 모바일 단일 뷰이고 hover 효과가 없어서 문제가 없지만, 반응형 레이아웃이나 인터랙션 효과가 필요해지면 CSS Modules나 다른 방식으로 전환을 고려해야 한다.

---

## 4. 테마 시스템: CSS 변수 대신 JS 토큰 객체

**결정:** 다크/라이트 모드를 CSS `prefers-color-scheme`이나 CSS custom properties가 아니라 `THEME` 상수 객체와 `buildS(t)` 함수로 구현한다. 선택값은 `localStorage`에 저장해 새로고침 후에도 유지한다.

**이유:** 위 3번의 연장선이다. 또한 초기 테마를 렌더 전에 `localStorage.getItem`으로 읽어 `useState` lazy initializer에 넣기 때문에 FOUC(flash of unstyled content)가 발생하지 않는다. CSS 변수 방식은 JS 상태와 동기화 로직이 별도로 필요하다.

---

## 5. 라우팅 라이브러리 없음 — tab state로 뷰 전환

**결정:** React Router를 쓰지 않고 `useState`의 `tab` 값(`"input"` / `"records"` / `"stats"`)으로 렌더링할 뷰를 결정한다.

**이유:** 세 개의 탭이 URL 구조를 필요로 하지 않는다. 뒤로가기 탐색, 딥링크, 공유 URL 같은 요구사항이 없는 앱이다. React Router를 추가하면 라우트 정의, Link 컴포넌트 교체, history 관리가 따라오는데 이 앱에서는 순수한 오버헤드다.

---

## 6. 상태 관리 라이브러리 없음 — useState/useEffect 단독

**결정:** Redux, Zustand, Recoil 등 외부 상태 관리 라이브러리를 도입하지 않는다.

**이유:** 전체 상태가 단일 컴포넌트 안에 있고, 컴포넌트 트리를 가로질러 상태를 공유할 필요가 없다. 외부 라이브러리는 store 설정, provider 감싸기, selector 정의 같은 보일러플레이트가 따라오는데, 이 규모에서는 useState가 직접적이고 유지보수하기 쉽다.

---

## 7. 차트 라이브러리: Recharts

**결정:** Chart.js, Victory, D3 대신 Recharts를 사용한다.

**이유:** Recharts는 React 컴포넌트 방식으로 선언적으로 조합할 수 있어 React 코드 흐름에 자연스럽게 녹아든다. `<BarChart>`, `<PieChart>`, `<Cell>`, `<Tooltip>` 등 필요한 컴포넌트가 모두 있고, props로 색상·스타일을 직접 제어할 수 있어 JS 테마 토큰과 연동이 쉽다. Chart.js는 canvas 기반 명령형 API라 React와 통합 시 ref를 통한 우회가 필요하고, D3는 이 용도에 비해 학습 곡선이 가파르다.

---

## 8. 파생 값을 저장하지 않고 렌더링 시 계산

**결정:** 볼륨 합계(`vol`), 운동 시간(`dur`) 같은 파생 값을 localStorage에 저장하지 않고 렌더링마다 원본 데이터에서 계산한다.

**이유:** 파생 값을 저장하면 원본과 불일치할 가능성이 생긴다(예: 기록 수정 시 파생 값 업데이트를 빠뜨리는 버그). 이 앱의 데이터 규모에서 매 렌더마다 계산하는 비용은 무시할 수 있다.

---

## 9. ID 생성: Date.now().toString()

**결정:** uuid 라이브러리 대신 `Date.now().toString()`을 레코드 ID로 사용한다.

**이유:** 단일 사용자·단일 기기 앱에서 같은 밀리초에 두 건을 저장하는 시나리오가 없다. uuid 패키지 의존성을 추가할 이유가 없다.

---

## 10. `persist` 함수를 async 시그니처로 유지

**결정:** 현재는 동기 저장소(localStorage)만 사용하지만 `persist` 함수를 `async`로 선언한다.

**이유:** 나중에 IndexedDB나 서버 API로 교체할 때 `persist`를 호출하는 쪽(`handleSave`, `delW`)의 코드를 건드리지 않아도 된다. 인터페이스를 안정적으로 유지하면서 구현만 교체할 수 있도록 미리 async 경계를 만들어 뒀다.

---

## 11. Create React App (Next.js 미사용)

**결정:** Next.js 대신 Create React App을 사용한다.

**이유:** 이 앱은 SSR, SSG, API Routes가 필요 없는 순수 CSR SPA다. `npm run build`로 생성된 정적 파일을 Netlify에 올리는 것으로 충분하다. Next.js의 파일 기반 라우팅, 서버 컴포넌트, hydration 복잡성을 도입할 근거가 없다.

---

## 12. TypeScript 미사용

**결정:** TypeScript를 쓰지 않고 JavaScript로 작성한다.

**이유:** 단일 파일, 빠른 프로토타이핑 단계에서 tsconfig 설정, 타입 정의 작성 비용이 이득보다 크다. 데이터 모델이 단순하고(Workout → Exercise → Set) 외부 API 경계가 없어 타입 오류 발생 가능성이 낮다. 앱이 커져서 파일이 분리되거나 외부 API가 생기면 도입을 재검토할 수 있다.
