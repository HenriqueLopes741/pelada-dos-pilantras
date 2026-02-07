let estado = JSON.parse(localStorage.getItem("pelada")) || {
  times: [],
  sobrando: []
};

let jogadorSelecionado = null;
const isMobile = window.matchMedia("(pointer: coarse)").matches;

function salvar() {
  localStorage.setItem("pelada", JSON.stringify(estado));
}

/* -------- ADD -------- */

function adicionarJogador() {
  const input = document.getElementById("nomeJogador");
  if (!input.value.trim()) return;

  estado.sobrando.push(input.value.trim());
  input.value = "";
  renderizar();
}

function adicionarTime() {
  const input = document.getElementById("nomeTime");
  if (!input.value.trim()) return;

  estado.times.push({
    nome: input.value.trim(),
    jogadores: [],
    status: "proxima"
  });

  input.value = "";
  renderizar();
}

/* -------- JOGADOR -------- */

function criarJogador(nome) {
  const div = document.createElement("div");
  div.className = "jogador";
  div.textContent = nome;

  if (!isMobile) {
    div.draggable = true;
    div.ondragstart = e => {
      e.dataTransfer.setData("jogador", nome);
    };
  } else {
    div.onclick = () => selecionarJogador(nome, div);
  }

  return div;
}

function selecionarJogador(nome, el) {
  document.querySelectorAll(".jogador").forEach(j =>
    j.classList.remove("selecionado")
  );

  jogadorSelecionado = nome;
  el.classList.add("selecionado");
}

/* -------- MOVE -------- */

function moverJogador(nome, destino) {
  estado.sobrando = estado.sobrando.filter(j => j !== nome);
  estado.times.forEach(t => {
    t.jogadores = t.jogadores.filter(j => j !== nome);
  });

  if (destino) {
    if (destino.jogadores.length < 5) {
      destino.jogadores.push(nome);
    } else {
      estado.sobrando.push(nome);
    }
  } else {
    estado.sobrando.push(nome);
  }

  jogadorSelecionado = null;
}

/* -------- RENDER -------- */

function renderizar() {
  const jogando = document.getElementById("jogando");
  const proxima = document.getElementById("proxima");
  const sobrando = document.getElementById("sobrando");

  jogando.innerHTML = proxima.innerHTML = sobrando.innerHTML = "";

  estado.times.forEach(time => {
    const card = document.createElement("div");
    card.className = "time";

    card.innerHTML = `
      <h3>${time.nome} (${time.jogadores.length}/5)</h3>
      <div class="lista"></div>
    `;

    const lista = card.querySelector(".lista");

    time.jogadores.forEach(j =>
      lista.appendChild(criarJogador(j))
    );

    if (!isMobile) {
      lista.ondragover = e => e.preventDefault();
      lista.ondrop = e => {
        const jogador = e.dataTransfer.getData("jogador");
        moverJogador(jogador, time);
        renderizar();
      };
    } else {
      lista.onclick = () => {
        if (jogadorSelecionado) {
          moverJogador(jogadorSelecionado, time);
          renderizar();
        }
      };
    }

    (time.status === "jogando" ? jogando : proxima)
      .appendChild(card);
  });

  estado.sobrando.forEach(j =>
    sobrando.appendChild(criarJogador(j))
  );

  if (!isMobile) {
    sobrando.ondragover = e => e.preventDefault();
    sobrando.ondrop = e => {
      const jogador = e.dataTransfer.getData("jogador");
      moverJogador(jogador, null);
      renderizar();
    };
  } else {
    sobrando.onclick = () => {
      if (jogadorSelecionado) {
        moverJogador(jogadorSelecionado, null);
        renderizar();
      }
    };
  }

  salvar();
}

renderizar();
