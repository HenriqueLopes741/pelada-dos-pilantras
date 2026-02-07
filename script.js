let estado = JSON.parse(localStorage.getItem("pelada")) || {
  times: [],
  sobrando: []
};

function salvar() {
  localStorage.setItem("pelada", JSON.stringify(estado));
}

function adicionarJogador() {
  const input = document.getElementById("nomeJogador");
  const nome = input.value.trim();
  if (!nome) return;

  estado.sobrando.push(nome);
  input.value = "";
  renderizar();
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

function criarJogador(nome) {
  const div = document.createElement("div");
  div.className = "jogador";
  div.textContent = nome;
  div.draggable = true;

  // Corrige problema de seleção no mobile
  div.addEventListener("touchstart", e => {
    e.preventDefault();
  }, { passive: false });

  div.addEventListener("dragstart", e => {
    e.dataTransfer.setData("jogador", nome);
  });

  return div;
}

function renomearTime(antigo, novo) {
  const time = estado.times.find(t => t.nome === antigo);
  if (time) time.nome = novo;
  renderizar();
}

function renderizar() {
  const jogando = document.getElementById("jogando");
  const proxima = document.getElementById("proxima");
  const sobrando = document.getElementById("sobrando");

  jogando.innerHTML = "";
  proxima.innerHTML = "";
  sobrando.innerHTML = "";

  estado.times.forEach(time => {
    const card = document.createElement("div");
    card.className = "time";
    card.draggable = true;

    card.innerHTML = `
      <h3>
        <span contenteditable="true"
          onblur="renomearTime('${time.nome}', this.innerText)">
          ${time.nome}
        </span>
        <span>${time.jogadores.length}/5</span>
      </h3>
      <div class="lista dropzone" data-time="${time.nome}"></div>
    `;

    const lista = card.querySelector(".lista");

    time.jogadores.forEach(j =>
      lista.appendChild(criarJogador(j))
    );

    card.addEventListener("dragstart", e => {
      e.dataTransfer.setData("time", time.nome);
    });

    (time.status === "jogando" ? jogando : proxima)
      .appendChild(card);
  });

  estado.sobrando.forEach(j =>
    sobrando.appendChild(criarJogador(j))
  );

  ativarDropzones();
  salvar();
}

function ativarDropzones() {
  document.querySelectorAll(".dropzone").forEach(zone => {
    zone.ondragover = e => e.preventDefault();

    zone.ondrop = e => {
      const jogador = e.dataTransfer.getData("jogador");
      const timeNome = zone.dataset.time;

      if (jogador) {
        estado.sobrando = estado.sobrando.filter(j => j !== jogador);

        estado.times.forEach(t => {
          t.jogadores = t.jogadores.filter(j => j !== jogador);
        });

        if (timeNome) {
          const time = estado.times.find(t => t.nome === timeNome);
          if (time && time.jogadores.length < 5) {
            time.jogadores.push(jogador);
          } else {
            estado.sobrando.push(jogador);
          }
        } else {
          estado.sobrando.push(jogador);
        }

        renderizar();
      }

      const timeArrastado = e.dataTransfer.getData("time");
      if (timeArrastado) {
        const time = estado.times.find(t => t.nome === timeArrastado);
        if (time) {
          time.status = zone.id === "jogando" ? "jogando" : "proxima";
          renderizar();
        }
      }
    };
  });
}

renderizar();
