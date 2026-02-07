let estado = JSON.parse(localStorage.getItem("pelada")) || {
  times: [],
  sobrando: []
};

function salvar() {
  localStorage.setItem("pelada", JSON.stringify(estado));
}

function criarJogador(nome) {
  const div = document.createElement("div");
  div.className = "jogador";
  div.draggable = true;
  div.innerHTML = `${nome}<button onclick="removerJogador('${nome}')">×</button>`;

  div.addEventListener("dragstart", e => {
    e.dataTransfer.setData("jogador", nome);
  });

  return div;
}

function renderizar() {
  const jogando = document.getElementById("jogando");
  const proxima = document.getElementById("proxima");
  const sob = document.getElementById("sobrando");

  jogando.innerHTML = "";
  proxima.innerHTML = "";
  sob.innerHTML = "";

  estado.times.forEach(time => {
    const card = document.createElement("div");
    card.className = "time";
    card.draggable = true;

    card.innerHTML = `
      <h2>
        <span contenteditable="true"
          onblur="renomearTime('${time.nome}', this.innerText)">
          ${time.nome}
        </span>
        <span>${time.jogadores.length}/5</span>
      </h2>
      <div class="lista dropzone" data-time="${time.nome}"></div>
    `;

    card.addEventListener("dragstart", e => {
      e.dataTransfer.setData("time", time.nome);
    });

    const lista = card.querySelector(".lista");
    time.jogadores.forEach(j => lista.appendChild(criarJogador(j)));

    (time.status === "jogando" ? jogando : proxima).appendChild(card);
  });

  estado.sobrando.forEach(j => sob.appendChild(criarJogador(j)));

  ativarDropzones();
  salvar();
}

function ativarDropzones() {
  document.querySelectorAll(".lista").forEach(zone => {
    zone.ondragover = e => e.preventDefault();
    zone.ondrop = e => {
      e.preventDefault();
      const nome = e.dataTransfer.getData("jogador");
      if (!nome) return;

      removerJogador(nome, false);

      if (zone.dataset.time) {
        const time = estado.times.find(t => t.nome === zone.dataset.time);
        if (time.jogadores.length < 5) {
          time.jogadores.push(nome);
        } else {
          estado.sobrando.push(nome);
        }
      } else {
        estado.sobrando.push(nome);
      }

      renderizar();
    };
  });

  ["jogando", "proxima"].forEach(id => {
    const area = document.getElementById(id);
    area.ondragover = e => e.preventDefault();
    area.ondrop = e => moverTime(e, id);
  });
}

function moverTime(e, status) {
  const nome = e.dataTransfer.getData("time");
  const time = estado.times.find(t => t.nome === nome);
  if (time) {
    time.status = status;
    renderizar();
  }
}

function adicionarJogador() {
  const input = document.getElementById("nomeJogador");
  const nome = input.value.trim();
  if (!nome) return;

  if (
    estado.sobrando.includes(nome) ||
    estado.times.some(t => t.jogadores.includes(nome))
  ) {
    alert("Jogador já existe");
    return;
  }

  estado.sobrando.push(nome);
  input.value = "";
  renderizar();
}

function removerJogador(nome, render = true) {
  estado.sobrando = estado.sobrando.filter(j => j !== nome);
  estado.times.forEach(t => {
    t.jogadores = t.jogadores.filter(j => j !== nome);
  });
  if (render) renderizar();
}

function adicionarTime() {
  const input = document.getElementById("nomeTime");
  const nome = input.value.trim();
  if (!nome) return;

  estado.times.push({
    nome,
    jogadores: [],
    status: "proxima"
  });

  input.value = "";
  renderizar();
}

function renomearTime(antigo, novo) {
  const time = estado.times.find(t => t.nome === antigo);
  if (time) time.nome = novo;
  renderizar();
}

renderizar();
