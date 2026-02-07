let estado = JSON.parse(localStorage.getItem("pelada")) || {
  times: [],
  sobrando: []
};

let tempo = 600;
let intervalo = null;

/* TEMA */
if (localStorage.getItem("tema") === "light") {
  document.body.classList.add("light");
}

function alternarTema() {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "tema",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}

/* SALVAR */
function salvar() {
  localStorage.setItem("pelada", JSON.stringify(estado));
}

/* JOGADOR */
function criarJogador(nome) {
  const div = document.createElement("div");
  div.className = "jogador";
  div.draggable = true;
  div.innerHTML = `${nome}<button onclick="removerJogador('${nome}')">×</button>`;

  div.addEventListener("dragstart", e => {
    e.dataTransfer.setData("jogador", nome);
  });

  // mobile
  div.addEventListener("touchend", e => {
    const t = e.changedTouches[0];
    const alvo = document.elementFromPoint(t.clientX, t.clientY);
    const zone = alvo?.closest(".lista");
    if (!zone) return;

    removerJogador(nome, false);

    if (zone.dataset.time) {
      const time = estado.times.find(t => t.nome === zone.dataset.time);
      time.jogadores.length < 5
        ? time.jogadores.push(nome)
        : estado.sobrando.push(nome);
    } else estado.sobrando.push(nome);

    renderizar();
  });

  return div;
}

/* RENDER */
function renderizar() {
  ["jogando","proxima","sobrando","ranking"].forEach(id => {
    document.getElementById(id).innerHTML = "";
  });

  estado.times.forEach(time => {
    const card = document.createElement("div");
    card.className = "time";
    card.draggable = true;

    if (time.destaque) card.classList.add("vencedor");

    card.innerHTML = `
      <h2>${time.nome} <span>${time.vitorias || 0} 🏆</span></h2>
      <div class="lista dropzone" data-time="${time.nome}"></div>
    `;

    // 🔥 DRAG DO TIME (ESSENCIAL)
    card.addEventListener("dragstart", e => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", time.nome);
    });

    const lista = card.querySelector(".lista");
    time.jogadores.forEach(j => lista.appendChild(criarJogador(j)));

    document.getElementById(time.status).appendChild(card);
  });

  estado.sobrando.forEach(j => {
    document.getElementById("sobrando").appendChild(criarJogador(j));
  });

  atualizarRanking();
  ativarDropzones(); // 🔥 NÃO ESQUECER
  salvar();
}

/* DROPZONES */
function ativarDropzones() {

  // jogadores → times
  document.querySelectorAll(".lista").forEach(zone => {
    zone.ondragover = e => e.preventDefault();

    zone.ondrop = e => {
      e.preventDefault();
      const nome = e.dataTransfer.getData("jogador");
      if (!nome) return;

      removerJogador(nome, false);

      const time = estado.times.find(t => t.nome === zone.dataset.time);
      if (time && time.jogadores.length < 5) {
        time.jogadores.push(nome);
      } else {
        estado.sobrando.push(nome);
      }

      renderizar();
    };
  });

  // 🔥 TIMES → jogando / proxima
  ["jogando","proxima"].forEach(id => {
    const area = document.getElementById(id);

    area.ondragover = e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };

    area.ondrop = e => {
      e.preventDefault();
      const nome = e.dataTransfer.getData("text/plain");
      if (!nome) return;

      const time = estado.times.find(t => t.nome === nome);
      if (!time) return;

      time.status = id;

      // manda pro final da fila
      estado.times = estado.times.filter(t => t.nome !== nome);
      estado.times.push(time);

      renderizar();
    };
  });
}

/* RESULTADOS */
function timeGanhou() {
  const jogando = estado.times.filter(t => t.status === "jogando");
  if (jogando.length !== 2) return alert("Devem existir 2 times jogando");

  const escolha = prompt(
    jogando.map((t,i)=>`${i+1} - ${t.nome}`).join("\n")
  );
  const vencedor = jogando[parseInt(escolha)-1];
  if (!vencedor) return;

  const perdedor = jogando.find(t => t !== vencedor);

  estado.times.forEach(t => delete t.destaque);

  vencedor.vitorias = (vencedor.vitorias || 0) + 1;
  vencedor.destaque = true;

  perdedor.status = "proxima";

  const proximo = estado.times.find(
    t => t.status === "proxima" && t !== perdedor
  );
  if (proximo) proximo.status = "jogando";

  resetarTimer();
  renderizar();
}

function empate() {
  const jogando = estado.times.filter(t => t.status === "jogando");
  const proximos = estado.times.filter(t => t.status === "proxima");

  if (proximos.length < jogando.length)
    return alert("Times insuficientes");

  estado.times.forEach(t => delete t.destaque);
  jogando.forEach(t => t.destaque = true);

  jogando.forEach(t => t.status = "proxima");
  proximos.slice(0,2).forEach(t => t.status = "jogando");

  resetarTimer();
  renderizar();
}

/* RANKING */
function atualizarRanking() {
  const rank = document.getElementById("ranking");
  [...estado.times]
    .sort((a,b)=>(b.vitorias||0)-(a.vitorias||0))
    .forEach(t => {
      rank.innerHTML += `<div>${t.nome}: ${t.vitorias||0} 🏆</div>`;
    });
}

/* TIMER */
function iniciarTimer() {
  if (intervalo) return;
  intervalo = setInterval(() => {
    tempo--;
    atualizarTempo();
    if (tempo <= 0) {
      pausarTimer();
      tocarSomFim();
    }
  },1000);
}
function pausarTimer() {
  clearInterval(intervalo);
  intervalo = null;
}
function resetarTimer() {
  pausarTimer();
  tempo = 600;
  atualizarTempo();
}
function atualizarTempo() {
  document.getElementById("tempo").innerText =
    String(Math.floor(tempo/60)).padStart(2,"0") + ":" +
    String(tempo%60).padStart(2,"0");
}

/* OUTROS */
function adicionarJogador() {
  if (!nomeJogador.value) return;
  estado.sobrando.push(nomeJogador.value);
  nomeJogador.value = "";
  renderizar();
}

function adicionarTime() {
  if (!nomeTime.value) return;
  estado.times.push({
    nome:nomeTime.value,
    jogadores:[],
    status:"proxima",
    vitorias:0
  });
  nomeTime.value = "";
  renderizar();
}

function removerJogador(n) {
  estado.sobrando = estado.sobrando.filter(j => j !== n);
  estado.times.forEach(t => t.jogadores = t.jogadores.filter(j => j !== n));
  renderizar();
}

function resetarTudo() {
  if (!confirm("Resetar tudo?")) return;
  estado = { times:[], sobrando:[] };
  localStorage.clear();
  resetarTimer();
  renderizar();
}

function gerarPrintRanking() {
  html2canvas(document.getElementById("ranking")).then(c => {
    const a = document.createElement("a");
    a.download = "ranking.png";
    a.href = c.toDataURL();
    a.click();
  });
}

function tocarSomFim() {
  const audio = document.getElementById("somFim");
  if (!audio) return;
  audio.currentTime = 0;
  audio.play();
}

renderizar();
