// 🧸 캐릭터 파일 — 캐릭터 목록, 배경, 몸, 그리는 방법이 여기 있어!
// (settings.js 다음에 불러와.)

// ============================================
// 🎨 캐릭터 목록 (여기에 새 캐릭터를 넣을 수 있어!)
// ============================================
// ("사마귀"는 그림 글자가 없어서 직접 그려!)
const CHARACTERS = ["🦄", "🐰", "🐶", "🐱", "🦊", "🦎", "🐹", "🦖", "사마귀"];

// 🔘 캐릭터 칸 모양 (위쪽 <style>에 모양이 그려져 있어)
const CHAR_SHAPES = {
  "🦄": "unicorn", "🐰": "rabbit", "🐶": "dog", "🐱": "cat", "🦊": "fox",
  "🦎": "lizard", "🐹": "hamster", "🦖": "dino", "사마귀": "mantis",
};

// 🖼️ 캐릭터마다 다른 배경 (하늘 색, 땅 색, 하늘에 뜬 것, 땅에 핀 것)
const THEMES = {
  "🦄": { name: "무지개 나라",   sky: ["#ffd6f5", "#d9c8ff"], ground: "#ffb3de", big: "🌈", sky2: "☁️", floor: "✨", text: "#333" },
  "🐰": { name: "당근 밭",       sky: ["#aee4ff", "#e6f8ff"], ground: "#7ccf5f", big: "☀️", sky2: "☁️", floor: "🥕", text: "#333" },
  "🐶": { name: "공원",          sky: ["#8fd3ff", "#d6f0ff"], ground: "#5fbf4a", big: "☀️", sky2: "🌳", floor: "🦴", text: "#333" },
  "🐱": { name: "별이 뜬 밤",    sky: ["#0b1a4a", "#3a2a7a"], ground: "#4a3d6b", big: "🌙", sky2: "⭐", floor: "🐟", text: "#fff" },
  "🦊": { name: "가을 숲",       sky: ["#ffb36b", "#ffe2b8"], ground: "#a5673f", big: "🌅", sky2: "🍂", floor: "🍁", text: "#333" },
  "🦎": { name: "뜨거운 사막",   sky: ["#ffe27a", "#fff4c4"], ground: "#e8c07a", big: "☀️", sky2: "🌴", floor: "🐚", text: "#333" },
  "🐹": { name: "해바라기 밭",   sky: ["#c8f0ff", "#fffbe0"], ground: "#9ad26b", big: "☀️", sky2: "🌻", floor: "🌰", text: "#333" },
  "🦖": { name: "공룡 화산섬",   sky: ["#ff8a5c", "#ffd6a0"], ground: "#6b4a2b", big: "🌋", sky2: "☄️", floor: "🦴", text: "#333" },
  "사마귀": { name: "풀숲 정글",  sky: ["#b8f0c8", "#effff2"], ground: "#4f9a3a", big: "☀️", sky2: "🦋", floor: "🌿", text: "#333" },
};

// 🧸 캐릭터마다 다른 몸 (몸 색, 배 색, 다리 색, 꼬리 모양, 다리 길이)
// 🦎 도마뱀이랑 🦖 공룡은 원래 몸이 다 있어서 몸을 안 그려!
const BODIES = {
  "🦄": { body: "#ffffff", belly: "#fbe4ff", leg: "#e9d5ff", tail: "rainbow", legLen: 12 },
  "🐰": { body: "#f3e9e9", belly: "#ffffff", leg: "#e6d6d6", tail: "puff",    legLen: 9 },
  "🐶": { body: "#d9a066", belly: "#f7e1bd", leg: "#c48a50", tail: "wag",     legLen: 11 },
  "🐱": { body: "#f7b84b", belly: "#ffe7b3", leg: "#e9a53a", tail: "long",    legLen: 11 },
  "🦊": { body: "#f07a24", belly: "#fff6ee", leg: "#5a3a2a", tail: "bushy",   legLen: 11 },
  "🐹": { body: "#e8b27a", belly: "#fff3e0", leg: "#f2c9a5", tail: "tiny",    legLen: 6 },
};

// 🌵 장애물 목록
const OBSTACLES = ["🌵", "🪨", "🍄", "🔥"];

// ============================================
// 🧸 캐릭터 그리기 (발이 (0, 0)에 있고, 오른쪽으로 달려)
// ============================================
// 🦗 사마귀 그리기 (g는 그림판, 발이 (0, 0)에 있고 오른쪽을 봐)
function drawMantis(g, run, inAir) {
  const green = "#5cc93a", dark = "#3c8f26";
  g.lineCap = "round";
  g.lineJoin = "round";

  // 다리 4개 (무릎이 위로 꺾인 가느다란 다리)
  g.strokeStyle = dark;
  g.lineWidth = 2.5;
  [-10, -4, 2, 6].forEach((hip, i) => {
    const swing = inAir ? 4 : Math.sin(run + i * Math.PI / 2) * 5;
    g.beginPath();
    g.moveTo(hip, -18);
    g.lineTo(hip + (i < 2 ? -7 : 5), -26 + (inAir ? 8 : 0));
    g.lineTo(hip + (i < 2 ? -9 : 7) + swing, inAir ? -6 : 0);
    g.stroke();
  });

  // 배 (길쭉한 초록 몸통, 꼬리 쪽이 살짝 올라가)
  g.save();
  g.translate(-10, -20);
  g.rotate(-0.25);
  g.fillStyle = green;
  g.beginPath(); g.ellipse(0, 0, 15, 6, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = dark; g.lineWidth = 1;
  for (let x = -9; x <= 6; x += 5) { g.beginPath(); g.moveTo(x, -5); g.lineTo(x, 5); g.stroke(); }
  // 날개 (반투명)
  g.fillStyle = "rgba(200,255,180,0.7)";
  g.beginPath(); g.ellipse(-2, -4, 13, 3.5, 0, 0, Math.PI * 2); g.fill();
  g.restore();

  // 가슴 (위로 쭉 뻗은 긴 목)
  g.strokeStyle = green;
  g.lineWidth = 6;
  g.beginPath(); g.moveTo(2, -20); g.lineTo(11, -38); g.stroke();

  // 앞발 (사마귀의 낫 모양 앞발!)
  const punch = inAir ? 4 : Math.sin(run * 0.5) * 1.5;
  g.strokeStyle = dark;
  g.lineWidth = 3.5;
  g.beginPath();
  g.moveTo(9, -33);
  g.lineTo(19 + punch, -27);
  g.lineTo(16 + punch, -37);
  g.stroke();
  g.fillStyle = dark;              // 앞발의 가시
  g.beginPath(); g.moveTo(17 + punch, -32); g.lineTo(21 + punch, -34); g.lineTo(18 + punch, -30); g.fill();

  // 머리 (세모 얼굴)
  g.fillStyle = green;
  g.beginPath();
  g.moveTo(5, -44); g.lineTo(21, -44); g.lineTo(14, -34);
  g.closePath();
  g.fill();

  // 커다란 눈
  [[6, -45], [20, -45]].forEach(([x, y]) => {
    g.fillStyle = "#c8ff5a";
    g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#222";
    g.beginPath(); g.arc(x + 1, y, 1.6, 0, Math.PI * 2); g.fill();
  });

  // 더듬이
  g.strokeStyle = dark;
  g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(11, -46); g.quadraticCurveTo(10, -56, 3, -60); g.stroke();
  g.beginPath(); g.moveTo(15, -46); g.quadraticCurveTo(18, -56, 26, -58); g.stroke();
}

function drawCharacter(c) {
  const b = BODIES[c];
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  if (c === "사마귀") {
    drawMantis(ctx, player ? player.run : 0, player ? !onGround() : false);
    return;
  }

  // 몸이 없는 캐릭터(도마뱀)는 그냥 크게 그려
  if (!b) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.font = SIZE + "px sans-serif";
    ctx.fillText(c, 0, 4);
    ctx.restore();
    return;
  }

  const inAir = player && !onGround();
  const run = player ? player.run : 0;
  const L = b.legLen;
  const bodyY = -L - 9;        // 몸통 가운데 높이

  // 다리 하나 그리기 (앞뒤로 흔들흔들)
  function leg(x, swing, color) {
    ctx.save();
    ctx.translate(x, bodyY + 4);
    ctx.rotate(swing);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-3, 0, 6, L + 5, 3);
    ctx.fill();
    ctx.restore();
  }
  // 땅에서는 번갈아 가며 달리고, 공중에서는 다리를 쭉 뻗어
  const s1 = inAir ? 0.6 : Math.sin(run) * 0.6;
  const s2 = inAir ? -0.6 : -Math.sin(run) * 0.6;

  // 꼬리 (몸 뒤쪽 = 왼쪽)
  ctx.save();
  ctx.translate(-14, bodyY - 2);
  const wag = Math.sin(run * 2) * 0.4;
  if (b.tail === "rainbow") {
    ["#ff7aa8", "#ffc94d", "#7ee07e", "#6ec3ff", "#b58aff"].forEach((col, i) => {
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, i * 2 - 4);
      ctx.quadraticCurveTo(-10, i * 2 - 8 + wag * 6, -16, i * 3 + 2);
      ctx.stroke();
    });
  } else if (b.tail === "puff") {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(-2, 0, 6, 0, Math.PI * 2); ctx.fill();
  } else if (b.tail === "wag") {
    ctx.rotate(-0.8 + wag);
    ctx.fillStyle = b.leg;
    ctx.beginPath(); ctx.roundRect(-3, -14, 6, 14, 3); ctx.fill();
  } else if (b.tail === "long") {
    ctx.strokeStyle = b.leg; ctx.lineWidth = 5; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-14, 0, -12 + wag * 4, -16);
    ctx.stroke();
  } else if (b.tail === "bushy") {
    ctx.rotate(-0.3 + wag * 0.5);
    ctx.fillStyle = b.body;
    ctx.beginPath(); ctx.ellipse(-11, -4, 12, 6, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.ellipse(-20, -8, 4, 3.5, -0.4, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = b.body;
    ctx.beginPath(); ctx.arc(0, 2, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // 뒤에 있는 다리 (조금 어둡게)
  ctx.globalAlpha = 0.75;
  leg(-8, s2, b.leg);
  leg(8, s1, b.leg);
  ctx.globalAlpha = 1;

  // 몸통 + 배
  ctx.fillStyle = b.body;
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, bodyY, 16, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = b.belly;
  ctx.beginPath(); ctx.ellipse(2, bodyY + 4, 10, 5, 0, 0, Math.PI * 2); ctx.fill();

  // 앞에 있는 다리
  leg(-8, s1, b.leg);
  leg(8, s2, b.leg);

  // 머리 (몸 앞쪽 위에, 달릴 때 살짝 통통)
  const bob = inAir ? 0 : Math.abs(Math.sin(run)) * 2;
  ctx.save();
  ctx.translate(11, bodyY + 4 - bob);
  ctx.scale(-1, 1);
  ctx.font = "34px sans-serif";
  ctx.fillText(c, 0, 0);
  ctx.restore();
}
