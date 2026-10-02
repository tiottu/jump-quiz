// 🎮 게임 파일 — 점프, 장애물, 점수, 그림 그리기, 게임 시작이 여기 있어!
// (제일 마지막에 불러와. 위의 파일들이 먼저 있어야 해.)

// --------------------------------------------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const GROUND = canvas.height - 40;

let myCharacter = CHARACTERS[0];
let player, obstacles, speed, score, frame, state, waitTime, groundX, dust, nextQuiz, nextFirework;
let fireworks = [], bannerText = "", bannerTime = 0;
let item, nextItem, nextBroom, flyTime, flyType, graceTime;   // 🎈🧹 아이템, 날 수 있는 남은 시간
let testGame = false;   // 🧪 지금이 실험 판인지
let best = Number(localStorage.getItem("jumpBest") || 0);

// 캐릭터 고르는 버튼 만들기
const charBox = document.getElementById("characters");
CHARACTERS.forEach(c => {
  const btn = document.createElement("button");
  btn.className = "char " + CHAR_SHAPES[c];   // 캐릭터 모양 칸
  if (c === "사마귀") {
    // 사마귀 버튼에는 작은 그림판을 넣고 사마귀를 그려
    const mini = document.createElement("canvas");
    mini.width = 44; mini.height = 44;
    mini.style.cssText = "display:block;margin:auto;box-shadow:none;border-radius:0";
    const g = mini.getContext("2d");
    g.translate(20, 43);
    g.scale(0.7, 0.7);
    drawMantis(g, 0, false);
    btn.appendChild(mini);
  } else {
    btn.textContent = c;
  }
  btn.onclick = (e) => {
    e.stopPropagation();
    btn.blur();
    if (state === "play" || state === "quiz") return; // 게임 중에는 못 바꿔
    myCharacter = c;
    document.querySelectorAll(".char").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    jump();   // 캐릭터를 고르면 바로 게임 시작!
  };
  if (c === myCharacter) btn.classList.add("selected");
  charBox.appendChild(btn);
});

// ============================================
// 📖 게임 방법 쓰기 (게임 설정 숫자를 넣어서 쓰니까, 숫자를 바꾸면 설명도 바뀌어!)
// ============================================
const GUIDE = [
  ["🐾", "캐릭터를 골라!", `위에 있는 칸을 누르면 그 캐릭터로 바로 게임이 시작돼! 캐릭터마다 사는 곳(배경)이 달라.`],
  ["📚", "학년을 골라!", `수학 문제가 몇 학년 문제로 나올지 골라. 1학년부터 6학년까지 있어.`],
  ["🦘", "점프해!", `스페이스바나 화면을 누르면 점프해. 공중에서도 또 누르면 한 번 더 뛰어! (땅에 닿기 전까지 ${MAX_JUMPS}번까지)`],
  ["🌵", "장애물을 피해!", `🌵🪨🍄🔥에 부딪히면 게임 끝! 가끔 두 개가 붙어서 나오니까 조심해.`],
  ["🚀", "점점 빨라져!", `점수가 올라갈수록 속도가 빨라져. 오른쪽 위에서 지금 속도를 볼 수 있어.`],
  ["🧠", `${QUIZ_EVERY}점마다 퀴즈!`, `넌센스 퀴즈나 수학 문제가 나와. 맞히면 보너스 +${QUIZ_BONUS}점! 틀려도 점수는 안 깎여.`],
  ["🎆", `${FIREWORK_EVERY}점마다 폭죽!`, `${FIREWORK_EVERY}점, ${FIREWORK_EVERY * 2}점, ${FIREWORK_EVERY * 3}점... 넘을 때마다 하늘에서 폭죽이 펑펑 터져!`],
  ["🎈", `${ITEM_EVERY}점마다 풍선!`, `하늘에 뜬 풍선에 닿으면 ${FLY_TIME}초 동안 날 수 있어. 꾹 누르면 올라가고, 떼면 내려와. 날 때는 장애물에 안 부딪혀!`],
  ["🧹", `${BROOM_EVERY}점마다 마법의 빗자루!`, `빗자루에 닿으면 ${BROOM_TIME}초 동안 날 수 있고, 타는 동안 점수가 2배! ✨`],
  ["🏆", "최고 점수에 도전해!", `제일 높은 점수는 게임이 기억해 둬. 내 최고 점수를 깨 봐!`],
];
document.getElementById("guideText").innerHTML = GUIDE.map(([icon, title, desc]) =>
  `<div class="step"><div class="icon">${icon}</div><div><div class="title">${title}</div><div class="desc">${desc}</div></div></div>`
).join("");

const guideModal = document.getElementById("guideModal");
document.getElementById("guideBtn").onclick = (e) => {
  e.currentTarget.blur();
  if (state === "play") return;        // 게임 중에는 안 열려
  guideModal.classList.add("show");
};
document.getElementById("guideClose").onclick = () => guideModal.classList.remove("show");
guideModal.onclick = (e) => { if (e.target === guideModal) guideModal.classList.remove("show"); };  // 바깥을 눌러도 닫혀

// 학년 고르는 버튼 만들기
let grade = Number(localStorage.getItem("jumpGrade") || 1);
const gradeBox = document.getElementById("grades");
for (let g = 1; g <= 6; g++) {
  const btn = document.createElement("button");
  btn.className = "grade" + (g === grade ? " selected" : "");
  btn.textContent = g + "학년";
  btn.onclick = () => {
    grade = g;
    localStorage.setItem("jumpGrade", g);
    document.querySelectorAll(".grade").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    btn.blur();
  };
  gradeBox.appendChild(btn);
}

function reset() {
  // sx, sy는 캐릭터가 옆으로/위로 얼마나 늘어났는지 (1이면 원래 모양)
  player = { y: GROUND - SIZE, vy: 0, sx: 1, sy: 1, jumpWish: 0, jumps: 0, lift: 99, run: 0 };
  dust = [];
  obstacles = [];
  speed = START_SPEED;
  score = 0;
  frame = 0;
  waitTime = 60;
  groundX = 0;
  nextQuiz = QUIZ_EVERY;
  nextFirework = FIREWORK_EVERY;
  item = null;
  nextItem = ITEM_EVERY;
  nextBroom = BROOM_EVERY;
  flyType = null;
  flyTime = 0;
  graceTime = 0;
}

// ============================================
// 🎆 폭죽 터뜨리기
// ============================================
function launchFireworks() {
  for (let b = 0; b < 5; b++) {                 // 폭죽 5개
    const x = rand(120, canvas.width - 120), y = rand(40, 150);
    const hue = rand(0, 360);
    for (let i = 0; i < 36; i++) {              // 폭죽 하나에 불꽃 36개
      const angle = (Math.PI * 2 * i) / 36, power = 2 + Math.random() * 2.5;
      fireworks.push({
        x, y,
        vx: Math.cos(angle) * power, vy: Math.sin(angle) * power,
        color: `hsl(${hue + rand(-30, 30)}, 100%, 60%)`,
        life: 1, delay: b * 12,                 // 하나씩 차례대로 펑! 펑!
      });
    }
  }
}

function updateFireworks() {
  for (const p of fireworks) {
    if (p.delay > 0) { p.delay--; continue; }
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.05;           // 불꽃도 중력 때문에 천천히 떨어져
    p.vx *= 0.98; p.vy *= 0.98;
    p.life -= 0.015;
  }
  fireworks = fireworks.filter(p => p.life > 0);
  if (bannerTime > 0) bannerTime--;
}

function addObstacle(x) {
  obstacles.push({
    x: x,
    emoji: OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)]
  });
}

function jump() {
  if (guideModal.classList.contains("show")) return;   // 게임 방법 창을 보고 있을 때는 시작 안 해
  if (state === "quiz") {       // 퀴즈 중에는 점프 대신, 답을 고른 다음이면 계속 달리기
    if (quizAnswered) endQuiz();
    return;
  }
  if (state !== "play") {       // 시작 화면이나 끝난 화면이면 → 게임 시작
    reset();
    testGame = false;
    if (TEST_START > 0) {   // 🧪 실험 중에는 매 판마다 높은 점수에서 시작
      testGame = true;
      score = TEST_START * 10;
      nextQuiz = (Math.floor(TEST_START / QUIZ_EVERY) + 1) * QUIZ_EVERY;
      nextFirework = (Math.floor(TEST_START / FIREWORK_EVERY) + 1) * FIREWORK_EVERY;
      nextItem = (Math.floor(TEST_START / ITEM_EVERY) + 1) * ITEM_EVERY;
      nextBroom = (Math.floor(TEST_START / BROOM_EVERY) + 1) * BROOM_EVERY;
    }
    state = "play";
    return;
  }
  // 땅에 닿기 조금 전에 눌러도 기억해뒀다가 닿자마자 점프!
  player.jumpWish = 12;
}

function onGround() {
  return player.y >= GROUND - SIZE;
}

// holding: 지금 버튼을 꾹 누르고 있는지 (날 때 필요해!)
let holding = false;
document.addEventListener("keydown", e => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    holding = true;
    if (!e.repeat) jump();
  }
});
document.addEventListener("keyup", e => {
  if (e.code === "Space" || e.code === "ArrowUp") holding = false;
});
// 게임 화면 말고 다른 곳을 눌러도 점프! (버튼은 빼고)
document.addEventListener("pointerdown", e => {
  if (e.target.closest("button") || e.target.closest("#guideModal")) return;
  holding = true;
  jump();
});
window.addEventListener("pointerup", () => { holding = false; });
window.addEventListener("pointercancel", () => { holding = false; });   // 핸드폰에서 손가락이 화면 밖으로 나가도 OK

function update() {
  frame++;
  score++;
  // 점수가 올라갈수록 점점 빨라져! (실험 판은 시작 점수를 빼고 계산해서 처음엔 느리게)
  const runScore = testGame ? score - TEST_START * 10 : score;
  speed = Math.min(MAX_SPEED, START_SPEED + (runScore / 10) * SPEED_UP);
  groundX += speed;

  // 🧹 빗자루가 날고 있을 때는 점수가 2배!
  if (flyType === "broom" && flyTime > 0) score++;

  // 🧹 마법의 빗자루 만들기 (BROOM_EVERY점마다! 풍선이랑 겹치면 빗자루가 이겨)
  const points = Math.floor(score / 10);
  if (points >= nextBroom) {
    nextBroom = (Math.floor(points / BROOM_EVERY) + 1) * BROOM_EVERY;
    if (flyTime === 0) item = { type: "broom", x: canvas.width + 20, y: GROUND - 95 };
  }
  // 🎈 풍선 아이템 만들기 (ITEM_EVERY점마다 나와! 이미 날고 있을 때는 안 나와)
  if (points >= nextItem) {
    nextItem = (Math.floor(points / ITEM_EVERY) + 1) * ITEM_EVERY;
    if (!item && flyTime === 0) {
      item = { type: "balloon", x: canvas.width + 20, y: GROUND - 95 };
    }
  }
  if (item) {
    item.x -= speed;
    // 풍선에 조금이라도 닿으면 날기 시작! (반짝이는 빛까지 닿아도 OK)
    const bobY = item.y + Math.sin(frame * 0.1) * 6;          // 화면에 보이는 풍선 높이
    const touchX = item.x - 8 < 80 + SIZE && item.x + 44 > 80;  // 옆으로 겹쳤나?
    const touchY = bobY - 26 < player.y + SIZE && bobY + 26 > player.y - 10;  // 위아래로 겹쳤나?
    if (touchX && touchY) {
      flyType = item.type;
      if (flyType === "broom") {
        flyTime = BROOM_TIME * 60;
        bannerText = "🧹 마법의 빗자루! 점수 2배! ✨";
      } else {
        flyTime = FLY_TIME * 60;
        bannerText = "🎈 하늘을 날아라! 꾹 누르면 올라가!";
      }
      item = null;
      bannerTime = 120;
    } else if (item.x < -40) {
      item = null;
    }
  }

  const wasInAir = !onGround();
  if (flyTime > 0) {
    // 🎈 날고 있을 때: 꾹 누르고 있으면 올라가고, 떼면 천천히 내려와
    flyTime--;
    player.jumpWish = 0;
    if (flyType === "broom" && frame % 2 === 0) {
      // 빗자루 뒤로 반짝이 가루가 뿌려져 ✨
      fireworks.push({
        x: 78, y: player.y + SIZE - 2 + rand(-4, 4),
        vx: -2 - speed * 0.3, vy: (Math.random() - 0.5) * 1.5,
        color: `hsl(${rand(260, 330)}, 100%, 70%)`, life: 0.8, delay: 0,
      });
    }
    player.vy += holding ? -0.45 : 0.2;
    player.vy = Math.max(-5, Math.min(3.5, player.vy));
    if (flyTime === 0) graceTime = 60;   // 풍선이 끝나도 1초 동안은 봐주기
  } else {
    // 꾹 누르고 있으면 땅에 닿자마자 또 점프!
    if (holding && onGround()) player.jumpWish = Math.max(player.jumpWish, 1);

    // 점프하기 (땅에서도, 공중에서도! 공중에서는 MAX_JUMPS번까지)
    if (player.jumpWish > 0) {
      player.jumpWish--;
      if (onGround()) player.jumps = 0;
      if (player.jumps < MAX_JUMPS) {
        player.vy = -JUMP_POWER;
        if (onGround()) player.y -= 6;       // 땅에서 뛸 때는 처음에 폴짝! 더 빨리 올라가
        player.jumps++;
        player.lift = 0;
        player.jumpWish = 0;
        player.sx = 0.8; player.sy = 1.25;   // 뛸 때 쭉 늘어나기
        if (player.jumps > 1) {               // 공중 점프할 때 발밑에 반짝 구름
          for (let i = 0; i < 4; i++) {
            dust.push({ x: 105, y: player.y + SIZE, vx: (Math.random() - 0.5) * 3, vy: Math.random() * 1.5, life: 1 });
          }
        }
      }
    }
    // 중력 (제일 높은 곳에서는 중력을 약하게 해서 살짝 둥실~)
    player.vy += Math.abs(player.vy) < 2 ? GRAVITY / 2 : GRAVITY;
  }

  // 캐릭터 움직이기
  player.y += player.vy;
  if (player.y < 55 && flyTime > 0) { player.y = 55; player.vy = 0; }   // 풍선이 하늘 밖으로 안 나가게
  if (player.y < 0) { player.y = 0; player.vy = 0; }   // 하늘 밖으로 날아가지 않게
  if (player.y > GROUND - SIZE) {
    player.y = GROUND - SIZE;
    player.vy = 0;
    player.jumps = 0;
    if (wasInAir) {
      player.sx = 1.25; player.sy = 0.8;   // 내려올 때 납작해지기
      for (let i = 0; i < 6; i++) {         // 먼지 뿅뿅
        dust.push({ x: 105, y: GROUND, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 2, life: 1 });
      }
    }
  }

  // 달리는 다리 움직임 (빠를수록 다리도 빨리 움직여)
  player.run += speed * 0.06;

  // 늘어나고 납작해진 모양이 천천히 원래대로 돌아와
  player.sx += (1 - player.sx) * 0.2;
  player.sy += (1 - player.sy) * 0.2;

  // 먼지 움직이기
  for (const d of dust) { d.x += d.vx - speed * 0.3; d.y += d.vy; d.life -= 0.05; }
  dust = dust.filter(d => d.life > 0);

  // 장애물 만들기 (다음 장애물까지 기다리는 시간을 매번 주사위처럼 새로 정해!)
  waitTime--;
  if (waitTime <= 0) {
    addObstacle(canvas.width + 20);
    // 가끔은 장애물 두 개가 붙어서 나와!
    if (Math.random() < 0.25) addObstacle(canvas.width + 60);
    waitTime = 45 + Math.floor(Math.random() * 90); // 짧게는 45, 길게는 135번 기다려
  }

  // 장애물 움직이기 + 부딪혔는지 확인
  player.lift++;
  const justJumped = player.lift <= 6;  // 방금 뛰었으면 잠깐 봐주기 (바로 앞에서 뛰어도 넘을 수 있게!)
  if (graceTime > 0) graceTime--;
  const safe = justJumped || flyTime > 0 || graceTime > 0;   // 날고 있을 때는 안 부딪혀!
  for (const o of obstacles) {
    o.x -= speed;
    const hitX = o.x + 6 < 80 + SIZE - 15 && o.x + 34 > 80 + 15;   // 장애물 양쪽 끝은 살짝 봐주기
    const hitY = player.y + SIZE > GROUND - 25;                     // 발이 장애물 꼭대기 근처만 넘으면 OK
    if (hitX && hitY && !safe) {
      state = "over";
      if (!testGame && Math.floor(score / 10) > best) {   // 실험 판 점수는 최고 점수에 안 들어가
        best = Math.floor(score / 10);
        localStorage.setItem("jumpBest", best);
      }
    }
  }
  obstacles = obstacles.filter(o => o.x > -60);

  // 100점을 넘을 때마다 폭죽 펑펑! 🎆
  while (Math.floor(score / 10) >= nextFirework) {
    launchFireworks();
    bannerText = speed < MAX_SPEED ? `🎆 ${nextFirework}점 돌파! 더 빨라진다! 🚀` : `🎆 ${nextFirework}점 돌파! 최고 속도! ⚡`;
    bannerTime = 150;
    nextFirework += FIREWORK_EVERY;
  }

  // 퀴즈 시간! (부딪히지 않았을 때만, 폭죽 구경이 끝난 다음에)
  if (state === "play" && bannerTime === 0 && Math.floor(score / 10) >= nextQuiz) {
    nextQuiz += QUIZ_EVERY;
    startQuiz();
  }
}

function draw() {
  const theme = THEMES[myCharacter];
  const W = canvas.width + 100;

  // 하늘 (위에서 아래로 색이 스르륵 바뀌게)
  const skyColor = ctx.createLinearGradient(0, 0, 0, GROUND);
  skyColor.addColorStop(0, theme.sky[0]);
  skyColor.addColorStop(1, theme.sky[1]);
  ctx.fillStyle = skyColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 하늘에 크게 떠 있는 것 (해, 달, 무지개)
  ctx.textBaseline = "alphabetic";
  ctx.font = "60px sans-serif";
  ctx.fillText(theme.big, 30, 80);

  // 천천히 지나가는 것 (구름, 별, 나무...)
  ctx.font = "36px sans-serif";
  for (let i = 0; i < 4; i++) {
    const x = W - ((frame * 0.6 + i * W / 4) % W);
    ctx.fillText(theme.sky2, x, 90 + (i % 2) * 60);
  }

  // 땅
  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, GROUND, canvas.width, canvas.height - GROUND);

  // 땅 위에 있는 작은 것들 (당근, 뼈다귀, 생선...)
  ctx.font = "18px sans-serif";
  for (let i = 0; i < 8; i++) {
    const x = W - ((groundX + i * W / 8) % W);
    ctx.fillText(theme.floor, x, GROUND + 30);
  }

  // 배경 이름
  ctx.fillStyle = theme.text;
  ctx.font = "18px 'Jua', 'Malgun Gothic'";
  ctx.textBaseline = "top";
  ctx.fillText("📍 " + theme.name, 110, 15);

  // 장애물
  ctx.font = "40px sans-serif";
  ctx.textBaseline = "bottom";
  for (const o of obstacles) ctx.fillText(o.emoji, o.x, GROUND + 4);

  // 먼지
  for (const d of dust) {
    ctx.fillStyle = "rgba(255,255,255," + d.life + ")";
    ctx.beginPath();
    ctx.arc(d.x, d.y, 4 + (1 - d.life) * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 🎈🧹 하늘에 떠 있는 아이템 (반짝반짝 빛나면서 둥실둥실)
  if (item) {
    const bobY = item.y + Math.sin(frame * 0.1) * 6;
    const glow = 0.35 + Math.sin(frame * 0.2) * 0.15;
    ctx.fillStyle = item.type === "broom" ? `rgba(200,140,255,${glow})` : `rgba(255,255,150,${glow})`;
    ctx.beginPath(); ctx.arc(item.x + 18, bobY, 26, 0, Math.PI * 2); ctx.fill();
    ctx.font = "36px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.type === "broom" ? "🧹" : "🎈", item.x + 18, bobY);
    ctx.textAlign = "left";
  }

  // 빗자루를 타고 있으면 캐릭터 발밑에 빗자루 그리기 (끝나갈 때는 깜빡깜빡)
  const blink = Math.floor(frame / 5) % 2 === 0;
  if (flyTime > 0 && flyType === "broom" && (flyTime > 120 || blink)) {
    ctx.save();
    ctx.translate(100, player.y + SIZE - 4);
    ctx.rotate(Math.PI / 4);          // 비스듬한 빗자루를 눕혀서 앞으로 쭉!
    ctx.font = "50px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🧹", 0, 0);
    ctx.restore();
  }

  // 날고 있으면 캐릭터 머리 위에 풍선 달기 (끝나갈 때는 깜빡깜빡)
  if (flyTime > 0 && flyType === "balloon" && (flyTime > 120 || blink)) {
    const top = player.y - 5;
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(100, top + 20); ctx.lineTo(112, top - 18); ctx.stroke();
    ctx.font = "34px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("🎈", 114, top - 10);
    ctx.textAlign = "left";
  }

  // 내 캐릭터 (늘어나고 납작해지고, 살짝 기울어지게) - 풍선이 끝난 직후엔 깜빡깜빡
  ctx.save();
  if (graceTime > 0 && !blink) ctx.globalAlpha = 0.4;
  ctx.translate(80 + SIZE / 2, player.y + SIZE);
  ctx.rotate(player.vy * 0.02);
  ctx.scale(player.sx, player.sy);
  drawCharacter(myCharacter);
  ctx.restore();

  // 폭죽 불꽃
  for (const p of fireworks) {
    if (p.delay > 0) continue;
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // "100점 돌파!" 글씨
  if (bannerTime > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, bannerTime / 30);
    ctx.font = "34px 'Jua', 'Malgun Gothic'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "white";
    ctx.strokeText(bannerText, canvas.width / 2, 90);
    ctx.fillStyle = "#ff5fa2";
    ctx.fillText(bannerText, canvas.width / 2, 90);
    ctx.restore();
  }

  // 점수
  ctx.fillStyle = theme.text;
  ctx.font = "22px 'Jua', 'Malgun Gothic'";
  ctx.textBaseline = "top";
  ctx.textAlign = "right";
  ctx.fillText("점수: " + Math.floor((score || 0) / 10) + "   최고: " + best, canvas.width - 20, 15);
  ctx.font = "18px 'Jua', 'Malgun Gothic'";
  ctx.fillText("🚀 속도 " + (speed / START_SPEED).toFixed(1) + "배", canvas.width - 20, 45);
  if (testGame) { ctx.fillStyle = "#e0457b"; ctx.fillText("🧪 실험 판 (최고 점수에 안 들어가)", canvas.width - 20, 95); ctx.fillStyle = theme.text; }
  if (flyTime > 0 && flyType === "broom") ctx.fillText("🧹 빗자루 " + Math.ceil(flyTime / 60) + "초 · 점수 2배! ✨", canvas.width - 20, 70);
  else if (flyTime > 0) ctx.fillText("🎈 날기 " + Math.ceil(flyTime / 60) + "초 남았어!", canvas.width - 20, 70);
  ctx.textAlign = "left";

  // 안내 글씨
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (state === "ready" || state === "over") {
    // 글씨가 잘 보이게 하얀 판 깔기
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 230, canvas.height / 2 - 75, 460, 105, 20);
    ctx.fill();
  }
  if (state === "ready") {
    ctx.font = "32px 'Jua', 'Malgun Gothic'";
    ctx.fillStyle = "#a34bd1";
    ctx.fillText("캐릭터를 고르면 시작! 🚀", canvas.width / 2, canvas.height / 2 - 20);
  } else if (state === "over") {
    ctx.font = "36px 'Jua', 'Malgun Gothic'";
    ctx.fillStyle = "#ff3b6b";
    ctx.fillText("앗! 부딪혔어 😵", canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = "22px 'Jua', 'Malgun Gothic'";
    ctx.fillStyle = "#333";
    ctx.fillText("캐릭터를 바꾸거나, 눌러서 다시 하기!", canvas.width / 2, canvas.height / 2 + 5);
  }
  ctx.textAlign = "left";
}

// 어떤 컴퓨터에서도 1초에 딱 60번씩 움직이게 (빠른 모니터에서도 똑같은 속도!)
let lastTime = performance.now();
let leftover = 0;
function loop(now) {
  leftover += Math.min(now - lastTime, 100);
  lastTime = now;
  while (leftover >= 1000 / 60) {
    if (state === "play") update();
    updateFireworks();      // 폭죽은 게임이 멈춰도 계속 터져
    leftover -= 1000 / 60;
  }
  draw();
  requestAnimationFrame(loop);
}

reset();
state = "ready";
requestAnimationFrame(loop);
