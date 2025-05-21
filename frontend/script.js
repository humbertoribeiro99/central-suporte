// URL base da API
const apiURL = "http://localhost:3001/api/tickets";

// Código da página de abrir ticket
const ticketForm = document.getElementById("ticketForm");
if (ticketForm) {
  ticketForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const problema = document.getElementById("problema").value;

    const res = await fetch(apiURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, problema }),
    });

    if (res.ok) {
      alert("Ticket enviado com sucesso!");
      ticketForm.reset();
      carregarTickets(); // Caso queira atualizar tickets em outra parte da página
    } else {
      alert("Erro ao enviar ticket.");
    }
  });
}

// Código da página que lista tickets
const ticketList = document.getElementById("ticketList");
if (ticketList) {
  async function carregarTickets() {
    const res = await fetch(apiURL);
    const tickets = await res.json();

    ticketList.innerHTML = "";

    tickets.forEach((ticket) => {
      const item = document.createElement("li");

      item.innerHTML = `
        <strong>${ticket.nome}</strong> (${ticket.email})<br />
        <em>${ticket.problema}</em><br />
        Status: <span id="status-${ticket.id}">${ticket.status}</span> | Criado em: ${ticket.criado_em}
        <br />
      `;

      if (ticket.status !== "resolvido") {
        const btnResolver = document.createElement("button");
        btnResolver.textContent = "Marcar como Resolvido";
        btnResolver.onclick = async () => {
          const res = await fetch(`${apiURL}/${ticket.id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "resolvido" }),
          });

          if (res.ok) {
            document.getElementById(`status-${ticket.id}`).textContent = "resolvido";
            btnResolver.remove();
            carregarRelatorio();
            alert("Status atualizado para resolvido!");
          } else {
            alert("Erro ao atualizar status.");
          }
        };
        item.appendChild(btnResolver);
      }

      ticketList.appendChild(item);
    });
  }

  carregarTickets();
}

// Código da página de relatório
const totalTickets = document.getElementById("totalTickets");
const abertosTickets = document.getElementById("abertosTickets");
const resolvidosTickets = document.getElementById("resolvidosTickets");

if (totalTickets && abertosTickets && resolvidosTickets) {
  async function carregarRelatorio() {
    const res = await fetch(`${apiURL}/relatorio`);
    const dados = await res.json();

    totalTickets.textContent = `Total: ${dados.total}`;
    abertosTickets.textContent = `Abertos: ${dados.abertos}`;
    resolvidosTickets.textContent = `Resolvidos: ${dados.resolvidos}`;
  }

  carregarRelatorio();
}

// Código da página FAQ
const buscaFAQ = document.getElementById("buscaFAQ");
const listaFAQ = document.getElementById("listaFAQ");

if (buscaFAQ && listaFAQ) {
  const perguntasFrequentes = [
    { pergunta: "Como reiniciar o modem?", resposta: "Desligue o modem da tomada, espere 10 segundos e ligue novamente." },
    { pergunta: "Não consigo imprimir", resposta: "Verifique se a impressora está ligada e conectada ao computador." },
    { pergunta: "Esqueci minha senha", resposta: "Clique em 'Esqueci minha senha' na tela de login e siga as instruções." },
    { pergunta: "Como instalar o antivírus?", resposta: "Acesse o portal da empresa e baixe o instalador disponível." },
    { pergunta: "Sem acesso à internet", resposta: "Verifique o cabo de rede ou tente reiniciar o roteador." },
  ];

  buscaFAQ.addEventListener("input", () => {
    const termo = buscaFAQ.value.toLowerCase();
    listaFAQ.innerHTML = "";

    const filtradas = perguntasFrequentes.filter(p =>
      p.pergunta.toLowerCase().includes(termo)
    );

    if (filtradas.length === 0 && termo) {
      listaFAQ.innerHTML = `<li>Nenhuma dúvida encontrada.</li>`;
    } else {
      filtradas.forEach(p => {
        const item = document.createElement("li");
        item.innerHTML = `<strong>${p.pergunta}</strong><br/><em>${p.resposta}</em>`;
        listaFAQ.appendChild(item);
      });
    }
  });
}

// Código do chatbot (presente em página que tenha o elemento 'chatbox')
const chatbox = document.getElementById("chatbox");
if (chatbox) {
  function iniciarChat() {
    chatbox.innerHTML = ""; // limpa conversa

    const perguntas = [
      {
        texto: "Seu computador está ligando?",
        respostas: {
          sim: null,
          nao: "Verifique se o cabo de energia está conectado corretamente.",
        },
      },
      {
        texto: "Você consegue acessar a internet?",
        respostas: {
          sim: null,
          nao: "Tente reiniciar o modem ou roteador.",
        },
      },
    ];

    let passo = 0;

    function perguntar() {
      if (passo >= perguntas.length) {
        chatbox.innerHTML += `<p>🔧 Parece que ainda precisa de ajuda. Recomendamos abrir um ticket abaixo.</p>`;
        return;
      }

      const pergunta = perguntas[passo];
      chatbox.innerHTML += `<p><strong>🤖 ${pergunta.texto}</strong></p>`;

      const btnSim = document.createElement("button");
      btnSim.textContent = "Sim";
      btnSim.onclick = () => {
        chatbox.innerHTML += `<p>👤 Sim</p>`;
        passo++;
        perguntar();
      };

      const btnNao = document.createElement("button");
      btnNao.textContent = "Não";
      btnNao.onclick = () => {
        chatbox.innerHTML += `<p>👤 Não</p>`;
        chatbox.innerHTML += `<p>💡 ${pergunta.respostas.nao}</p>`;
        passo++;
        perguntar();
      };

      chatbox.appendChild(btnSim);
      chatbox.appendChild(btnNao);
    }

    perguntar();
  }

  // Você pode ligar o botão que inicia o chat na própria página:
  const btnIniciarChat = document.querySelector("button[onclick='iniciarChat()']");
  if (btnIniciarChat) {
    btnIniciarChat.addEventListener("click", iniciarChat);
  }

  
}
