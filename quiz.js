// 🧠 퀴즈 파일 — 넌센스 퀴즈, 수학 문제, 퀴즈 창 보여주기가 여기 있어!
// (characters.js 다음에 불러와.)

// ============================================
// 🤪 넌센스 퀴즈 (맨 앞이 정답이야! 보기는 게임이 섞어줘)
// ============================================
const NONSENSE = [
  { q: "왕이 넘어지면?",                     a: ["킹콩", "왕창", "킹크랩", "왕눈이"] },
  { q: "세상에서 가장 빠른 닭은?",            a: ["후다닥", "치킨", "꼬꼬댁", "닭강정"] },
  { q: "소가 웃으면?",                       a: ["우하하", "음메", "소소", "소풍"] },
  { q: "바나나가 웃으면?",                    a: ["바나나킥", "바나나우유", "바나나빵", "몽키"] },
  { q: "세상에서 가장 쉬운 숫자는?",          a: ["190000 (십구만)", "1", "100", "0"] },
  { q: "오리가 얼면?",                       a: ["언덕", "얼음", "오리털", "꽥꽥"] },
  { q: "자동차를 톡 치면?",                   a: ["카톡", "빵빵", "쿵", "택시"] },
  { q: "아몬드가 죽으면?",                    a: ["다이아몬드", "호두", "땅콩", "초콜릿"] },
  { q: "도둑이 가장 좋아하는 아이스크림은?",   a: ["보석바", "쌍쌍바", "누가바", "비비빅"] },
  { q: "물고기 중에 가장 공부를 많이 한 물고기는?", a: ["고등어", "초등어", "붕어", "상어"] },
  { q: "개가 사람을 가르치면?",               a: ["개인지도", "개학", "개구리", "멍멍"] },
  { q: "세상에서 가장 뜨거운 과일은?",         a: ["천도복숭아", "수박", "딸기", "귤"] },
  { q: "모든 사람을 일어서게 하는 숫자는?",    a: ["다섯 (다 서!)", "하나", "셋", "열"] },
  { q: "딸기가 회사에서 잘리면?",             a: ["딸기시럽", "딸기잼", "딸기우유", "딸기케이크"] },
  { q: "반성문을 영어로 하면?",               a: ["글로벌", "쏘리", "굿바이", "헬로"] },
];

// ============================================
// 🔢 수학 문제 만들기 (학년마다 다르게!)
// ============================================
function rand(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
function shuffle(list) { return list.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]); }
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

// 정답 근처의 헷갈리는 숫자 3개 만들기
function nearNumbers(ans, step) {
  const wrong = new Set();
  const tries = [1, -1, 2, -2, step, -step, 10, -10, 3, -3];
  for (const t of shuffle(tries)) {
    const n = ans + t;
    if (n > 0 && n !== ans) wrong.add(n);
    if (wrong.size === 3) break;
  }
  return [ans, ...wrong];
}

function mathQuiz(g) {
  let q, ans, step = 1;
  if (g === 1) {
    const type = pick(["+", "-"]);
    if (type === "+") { const a = rand(1, 9), b = rand(1, 9); q = `${a} + ${b} = ?`; ans = a + b; }
    else { const a = rand(10, 18), b = rand(1, 9); q = `${a} - ${b} = ?`; ans = a - b; }
  } else if (g === 2) {
    const type = pick(["+", "-", "×", "×"]);
    if (type === "+") { const a = rand(10, 59), b = rand(10, 39); q = `${a} + ${b} = ?`; ans = a + b; }
    else if (type === "-") { const a = rand(30, 99), b = rand(10, a - 10); q = `${a} - ${b} = ?`; ans = a - b; }
    else { const a = rand(2, 9), b = rand(2, 9); q = `${a} × ${b} = ?`; ans = a * b; step = a; }
  } else if (g === 3) {
    const type = pick(["+", "-", "×", "÷"]);
    if (type === "+") { const a = rand(100, 499), b = rand(100, 499); q = `${a} + ${b} = ?`; ans = a + b; }
    else if (type === "-") { const a = rand(300, 999), b = rand(100, a - 100); q = `${a} - ${b} = ?`; ans = a - b; }
    else if (type === "×") { const a = rand(12, 49), b = rand(2, 9); q = `${a} × ${b} = ?`; ans = a * b; step = b; }
    else { const b = rand(2, 9), c = rand(2, 9); q = `${b * c} ÷ ${b} = ?`; ans = c; }
  } else if (g === 4) {
    const type = pick(["×", "÷", "분수"]);
    if (type === "×") { const a = rand(11, 39), b = rand(11, 29); q = `${a} × ${b} = ?`; ans = a * b; step = a; }
    else if (type === "÷") { const b = rand(2, 9), c = rand(12, 99); q = `${b * c} ÷ ${b} = ?`; ans = c; }
    else {
      const d = rand(4, 12), n1 = rand(1, d - 2), n2 = rand(1, d - 1 - n1);
      return {
        title: "🔢 4학년 수학!",
        q: `${n1}/${d} + ${n2}/${d} = ?`,
        a: [`${n1 + n2}/${d}`, `${n1 + n2}/${d * 2}`, `${n1 + n2 + 1}/${d}`, `${n1 * n2}/${d}`],
      };
    }
  } else if (g === 6) {
    const type = pick(["소수", "백분율", "비례식", "분수", "원"]);
    if (type === "소수") {
      const b = rand(2, 9), qi = rand(11, 49);
      const show = n => (n / 10).toFixed(1);
      return {
        title: "🔢 6학년 수학!",
        q: `${show(b * qi)} ÷ ${b} = ?`,
        a: [show(qi), show(qi + 1), show(qi - 1), String(qi)],
      };
    } else if (type === "백분율") {
      const base = pick([100, 200, 400, 500, 800]), pct = pick([10, 20, 25, 50, 75]);
      q = `${base}의 ${pct}%는?`; ans = base * pct / 100; step = base / 10;
    } else if (type === "비례식") {
      const a = rand(2, 9), b = rand(2, 9), k = rand(2, 5);
      q = `${a} : ${b} = ${a * k} : ?`; ans = b * k; step = b;
    } else if (type === "분수") {
      const d = rand(3, 9), k = rand(2, 4), m = rand(1, d - 1);
      return {
        title: "🔢 6학년 수학!",
        q: `${k * m}/${d} ÷ ${k} = ?`,
        a: [`${m}/${d}`, `${k * m * k}/${d}`, `${m}/${d * k}`, `${m + 1}/${d}`],
      };
    } else {
      const r = rand(2, 10);
      q = `반지름이 ${r}cm인 원의 넓이는? (원주율 3)`; ans = 3 * r * r; step = 3;
    }
  } else {
    const type = pick(["혼합", "괄호", "최대공약수", "최소공배수", "분수"]);
    if (type === "혼합") { const a = rand(2, 20), b = rand(2, 9), c = rand(2, 9); q = `${a} + ${b} × ${c} = ?`; ans = a + b * c; step = c; }
    else if (type === "괄호") { const a = rand(2, 9), b = rand(2, 9), c = rand(2, 9); q = `(${a} + ${b}) × ${c} = ?`; ans = (a + b) * c; step = c; }
    else if (type === "최대공약수") {
      const k = rand(2, 9), x = pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]]);
      const a = k * x[0], b = k * x[1];
      q = `${a}와(과) ${b}의 최대공약수는?`; ans = gcd(a, b);
    } else if (type === "최소공배수") {
      const x = pick([[4, 6], [6, 8], [6, 9], [4, 10], [8, 12], [9, 12], [6, 10]]);
      q = `${x[0]}와(과) ${x[1]}의 최소공배수는?`; ans = x[0] * x[1] / gcd(x[0], x[1]); step = gcd(x[0], x[1]);
    } else {
      const f = pick([
        { q: "1/2 + 1/3", a: ["5/6", "2/5", "2/6", "1/6"] },
        { q: "1/2 + 1/4", a: ["3/4", "2/6", "2/4", "1/8"] },
        { q: "1/3 + 1/6", a: ["1/2", "2/9", "1/9", "2/3"] },
        { q: "1/2 + 1/5", a: ["7/10", "2/7", "2/10", "3/5"] },
        { q: "1/3 + 1/4", a: ["7/12", "2/7", "1/12", "3/4"] },
        { q: "2/3 + 1/6", a: ["5/6", "3/9", "3/6", "1/2"] },
      ]);
      return { title: "🔢 5학년 수학!", q: f.q + " = ?", a: f.a };
    }
  }
  return { title: `🔢 ${g}학년 수학!`, q, a: nearNumbers(ans, step).map(String) };
}

// 넌센스 퀴즈는 한 번씩 다 나온 다음에 다시 나와
let nonsenseDeck = [];
function nonsenseQuiz() {
  if (nonsenseDeck.length === 0) nonsenseDeck = shuffle(NONSENSE);
  const n = nonsenseDeck.pop();
  return { title: "🤪 넌센스 퀴즈!", q: n.q, a: n.a };
}

// ============================================
// 🧠 퀴즈 보여주기
// ============================================
const quizBox = document.getElementById("quiz");
const quizNext = document.getElementById("quizNext");
let quizAnswered = false;

function startQuiz() {
  state = "quiz";
  quizAnswered = false;
  const quiz = Math.random() < 0.5 ? nonsenseQuiz() : mathQuiz(grade);
  const answer = quiz.a[0];

  document.getElementById("quizTitle").textContent = quiz.title;
  document.getElementById("quizQuestion").textContent = quiz.q;
  document.getElementById("quizResult").textContent = "";
  quizNext.style.display = "none";

  const box = document.getElementById("quizChoices");
  box.innerHTML = "";
  for (const choice of shuffle([...new Set(quiz.a)])) {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = choice;
    btn.onclick = () => {
      if (quizAnswered) return;
      quizAnswered = true;
      const result = document.getElementById("quizResult");
      if (choice === answer) {
        btn.classList.add("right");
        result.textContent = `딩동댕! 🎉 보너스 +${QUIZ_BONUS}점`;
        result.style.color = "#2e9e3c";
        score += QUIZ_BONUS * 10;
      } else {
        btn.classList.add("wrong");
        box.querySelectorAll(".choice").forEach(b => { if (b.textContent === answer) b.classList.add("right"); });
        result.textContent = `아쉬워! 정답은 "${answer}"이야 😊`;
        result.style.color = "#e0457b";
      }
      quizNext.style.display = "block";
    };
    box.appendChild(btn);
  }
  quizBox.classList.add("show");
}

function endQuiz() {
  quizBox.classList.remove("show");
  quizNext.blur();
  // 다시 달리기 시작할 때 바로 부딪히지 않게 가까운 장애물은 치워줘
  obstacles = obstacles.filter(o => o.x > 450);
  waitTime = Math.max(waitTime, 40);
  state = "play";
}
quizNext.onclick = (e) => { e.stopPropagation(); endQuiz(); };
