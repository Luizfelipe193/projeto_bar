const WHATSAPP_NUMBER = "5584987415810";
const PRINT_API_URL = "http://192.168.1.253:3000/pedido";
const OPEN_MINUTES = (17 * 60) + 40;
const CLOSE_MINUTES = (23 * 60) + 20;
const CLOSED_WEEKDAY = 1; // Segunda-feira.

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const taxas = {
  "Alecrim": 5,
  "Bairro Nazaré": 6,
  "Bairro Nordeste": 6,
  "Barro Vermelho": 7,
  "Bom Pastor": 6,
  "Candelária": 8,
  "Capim Macio": 15,
  "Cidade Alta": 7,
  "Cidade Esperança": 7,
  "Cidade Nova": 8,
  "Cidade Satélite": 15,
  "Dix-Sept Rosado": 5,
  "Felipe Camarão": 10,
  "Jardim América": 7,
  "Lagoa Nova": 7,
  "Lagoa Seca": 7,
  "Mãe Luiza": 12,
  "Neópolis": 15,
  "Parnamirim": 20,
  "Petrópolis": 10,
  "Pitimbu": 18,
  "Planalto": 15,
  "Ponta Negra": 20,
  "Potilândia": 10,
  "Praia do Meio": 12,
  "Quintas": 5,
  "Ribeira": 10,
  "Rocas": 10,
  "Tirol": 8
};

const sabores = ["Carne", "Frango", "Queijo", "Catupiry", "Calabresa", "Presunto", "Cheddar"];

let saboresSelecionados = [];
let limite = 0;
let nomeAtual = "";
let precoAtual = 0;
let textoModalAtual = "sabores";

window.onload = () => {
  renderCart();
  verificarHorario();
  showEndereco();
  showTroco();
  atualizarTaxaAviso();
  configurarBusca();
  configurarMascaraTelefone();

  const cat = document.getElementById("pasteis");
  if (cat) cat.classList.add("active");

  const btn = document.querySelector(".menu-categorias button");
  if (btn) btn.classList.add("active");
};

document.addEventListener("change", e => {
  if (e.target.id === "bairro" || e.target.id === "tipo") {
    renderCart();
    atualizarTaxaAviso();
  }

  if (e.target.id === "pagamento") {
    showTroco();
  }
});

setInterval(verificarHorario, 30000);

function salvarCarrinho() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function formatarMoeda(valor) {
  return `R$ ${valor.toFixed(2)}`;
}

function limparBuscaCardapio() {
  const busca = document.getElementById("buscaCardapio");
  if (busca) busca.value = "";
  filtrarCardapio("");
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getHorarioFuncionamento(agora = new Date()) {
  const dia = agora.getDay();
  const minutos = (agora.getHours() * 60) + agora.getMinutes();

  if (dia === CLOSED_WEEKDAY) {
    return {
      aberto: false,
      motivo: "Segunda-feira é nossa folga.",
      mensagem: "Estamos fechados hoje. Segunda-feira é nossa folga."
    };
  }

  const aberto = minutos >= OPEN_MINUTES && minutos <= CLOSE_MINUTES;

  return {
    aberto,
    motivo: "Funcionamos das 17:40 às 23:20.",
    mensagem: aberto
      ? "Estamos abertos até 23:20."
      : "Estamos fechados. Funcionamos das 17:40 às 23:20."
  };
}

function getTaxaEntrega(tipo, bairro) {
  if (tipo !== "Delivery" || !bairro || bairro === "Outro") return 0;
  return taxas[bairro] || 0;
}

function calcularPedido() {
  const subtotal = cart.reduce((total, item) => total + (item.preco * item.qtd), 0);
  const tipo = document.getElementById("tipo")?.value;
  const bairro = document.getElementById("bairro")?.value;
  const taxa = getTaxaEntrega(tipo, bairro);

  return {
    subtotal,
    taxa,
    total: subtotal + taxa
  };
}

function abrirCardapioTela() {
  document.getElementById("home").style.display = "none";
  document.getElementById("cardapio").style.display = "block";
  limparBuscaCardapio();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function voltarMenuInicial() {
  fecharCarrinho();
  fecharModal();
  document.getElementById("checkoutBox").style.display = "none";
  document.getElementById("acoesCarrinho").style.display = "block";
  document.getElementById("cardapio").style.display = "none";
  document.getElementById("home").style.display = "flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function addItem(nome, preco) {
  const horario = getHorarioFuncionamento();

  if (!horario.aberto) {
    alert(horario.mensagem);
    verificarHorario();
    return;
  }

  const item = cart.find(p => p.nome === nome && p.preco === preco);

  if (item) {
    item.qtd++;
  } else {
    cart.push({ nome, preco, qtd: 1 });
  }

  salvarCarrinho();
  renderCart();
  const cartEl = document.getElementById("cart");
  const cartBtn = document.querySelector(".cart-btn");

  cartEl.classList.add("open");
  if (cartBtn) {
    cartBtn.classList.remove("cart-pulse");
    void cartBtn.offsetWidth;
    cartBtn.classList.add("cart-pulse");
  }

  mostrarFeedback("Item adicionado!");
}

function alterarQtd(index, acao) {
  const item = cart[index];
  if (!item) return;

  if (acao === "mais") {
    item.qtd++;
  } else {
    item.qtd--;

    if (item.qtd <= 0) {
      cart.splice(index, 1);
    }
  }

  salvarCarrinho();
  renderCart();
}

function removerItem(index) {
  cart.splice(index, 1);
  salvarCarrinho();
  renderCart();
}

function renderCart() {
  const items = document.getElementById("items");
  const totalEl = document.getElementById("total");
  const count = document.getElementById("count");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const bottomCount = document.getElementById("bottomCount");

  if (!items || !totalEl || !count) return;

  let html = "";
  let qtd = 0;

  cart.forEach((item, index) => {
    const sub = item.preco * item.qtd;
    qtd += item.qtd;

    html += `
<div class="cart-item">
<b>${item.nome}</b><br>

<button onclick="alterarQtd(${index},'menos')">-</button>
${item.qtd}
<button onclick="alterarQtd(${index},'mais')">+</button>

<br>${formatarMoeda(sub)}

<br><button onclick="removerItem(${index})">Remover</button>
</div>
`;
  });

  const pedido = calcularPedido();

  items.innerHTML = html || "<p>Seu carrinho está vazio.</p>";
  totalEl.innerHTML = `
Subtotal: ${formatarMoeda(pedido.subtotal)}<br>
Taxa: ${formatarMoeda(pedido.taxa)}<br>
<b>Total: ${formatarMoeda(pedido.total)}</b>
`;
  count.innerHTML = qtd;
  if (bottomCount) bottomCount.innerHTML = qtd;
  if (cartSubtotal) cartSubtotal.innerHTML = formatarMoeda(pedido.subtotal);
}

function toggleCart() {
  document.getElementById("cart").classList.toggle("open");
}

function abrirCheckout() {
  const horario = getHorarioFuncionamento();

  if (!horario.aberto) {
    alert(horario.mensagem);
    verificarHorario();
    return;
  }

  if (cart.length === 0) {
    alert("Adicione produtos ao carrinho antes de fechar o pedido.");
    return;
  }

  document.getElementById("acoesCarrinho").style.display = "none";
  document.getElementById("checkoutBox").style.display = "block";
  renderCart();

  setTimeout(() => {
    document.getElementById("checkoutBox").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 200);
}

function voltarCarrinho() {
  document.getElementById("checkoutBox").style.display = "none";
  document.getElementById("acoesCarrinho").style.display = "block";
}

function showEndereco() {
  const tipo = document.getElementById("tipo")?.value;
  const enderecoBox = document.getElementById("enderecoBox");

  if (!tipo || !enderecoBox) return;

  if (tipo === "Retirada") {
    enderecoBox.style.display = "none";
    document.getElementById("bairro").value = "";
    document.getElementById("endereco").value = "";
    document.getElementById("referencia").value = "";
  } else {
    enderecoBox.style.display = "block";
  }

  renderCart();
}

function showTroco() {
  const pagamento = document.getElementById("pagamento")?.value;
  const trocoBox = document.getElementById("trocoBox");

  if (!trocoBox) return;

  trocoBox.style.display = pagamento === "Dinheiro" ? "block" : "none";

  if (pagamento !== "Dinheiro") {
    const troco = document.getElementById("troco");
    if (troco) troco.value = "";
  }
}

function atualizarTaxaAviso() {
  const aviso = document.getElementById("taxaAviso");
  const tipo = document.getElementById("tipo")?.value;
  const bairro = document.getElementById("bairro")?.value;

  if (!aviso) return;

  if (tipo !== "Delivery") {
    aviso.innerText = "Retirada no local, sem taxa de entrega.";
    aviso.className = "taxa-aviso taxa-ok";
    return;
  }

  if (!bairro) {
    aviso.innerText = "Selecione o bairro para ver a taxa de entrega.";
    aviso.className = "taxa-aviso";
    return;
  }

  if (bairro === "Outro") {
    aviso.innerText = "Taxa de entrega a confirmar pelo WhatsApp.";
    aviso.className = "taxa-aviso taxa-alerta";
    return;
  }

  aviso.innerText = `Taxa de entrega: ${formatarMoeda(getTaxaEntrega(tipo, bairro))}`;
  aviso.className = "taxa-aviso taxa-ok";
}

function configurarMascaraTelefone() {
  const fone = document.getElementById("fone");
  if (!fone) return;

  fone.addEventListener("input", () => {
    let numeros = fone.value.replace(/\D/g, "").slice(0, 11);

    if (numeros.length > 10) {
      fone.value = numeros.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
      return;
    }

    if (numeros.length > 6) {
      fone.value = numeros.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
      return;
    }

    if (numeros.length > 2) {
      fone.value = numeros.replace(/(\d{2})(\d{0,5})/, "($1) $2");
      return;
    }

    fone.value = numeros;
  });
}

function configurarBusca() {
  const busca = document.getElementById("buscaCardapio");
  if (!busca) return;

  busca.addEventListener("input", () => {
    filtrarCardapio(busca.value);
  });
}

function filtrarCardapio(termo) {
  const busca = normalizarTexto(termo.trim());
  const categorias = document.querySelectorAll(".categoria-box");

  if (!busca) {
    const ativo = document.querySelector(".menu-categorias button.active");
    const categoriaAtiva = ativo?.dataset.categoriaBtn || "pasteis";

    categorias.forEach(cat => {
      cat.classList.remove("search-active");
      cat.classList.toggle("active", cat.id === categoriaAtiva);
      cat.style.display = "";
      cat.querySelectorAll(".card").forEach(card => {
        card.style.display = "";
      });
    });
    return;
  }

  categorias.forEach(cat => {
    let encontrouNaCategoria = false;

    cat.classList.add("active", "search-active");
    cat.querySelectorAll(".card").forEach(card => {
      const texto = normalizarTexto(card.innerText);
      const encontrou = texto.includes(busca);
      card.style.display = encontrou ? "" : "none";
      if (encontrou) encontrouNaCategoria = true;
    });

    cat.style.display = encontrouNaCategoria ? "block" : "none";
  });
}

function validarCheckout(dados) {
  if (cart.length === 0) return "Adicione produtos ao carrinho antes de finalizar.";
  if (!dados.nome) return "Digite seu nome.";
  if (!dados.fone) return "Digite seu telefone.";

  const apenasNumeros = dados.fone.replace(/\D/g, "");
  if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
    return "Digite um telefone válido com DDD.";
  }

  if (dados.tipo === "Delivery") {
    if (!dados.bairro) return "Selecione seu bairro.";
    if (!dados.endereco) return "Digite seu endereço.";
  }

  return "";
}

function getDadosCheckout() {
  return {
    nome: document.getElementById("nome").value.trim(),
    fone: document.getElementById("fone").value.trim(),
    tipo: document.getElementById("tipo").value,
    bairro: document.getElementById("bairro").value,
    endereco: document.getElementById("endereco").value.trim(),
    referencia: document.getElementById("referencia").value.trim(),
    pagamento: document.getElementById("pagamento").value,
    troco: document.getElementById("troco")?.value.trim() || "",
    observacao: document.getElementById("observacao")?.value.trim() || ""
  };
}

function montarMensagemPedido(dados, pedido) {
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR");
  const horaAtual = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  let msg = `Pedido Bar do Pastel

Data: ${data}
Hora: ${horaAtual}

Tipo de serviço: ${dados.tipo}

Nome: ${dados.nome}
Telefone: ${dados.fone}
`;

  if (dados.tipo === "Delivery") {
    msg += `
Bairro: ${dados.bairro}
Endereço: ${dados.endereco}
`;

    if (dados.referencia) {
      msg += `Referência: ${dados.referencia}
`;
    }

    msg += dados.bairro === "Outro"
      ? "Taxa de entrega: A confirmar\n"
      : `Taxa de entrega: ${formatarMoeda(pedido.taxa)}\n`;
  }

  msg += `
Produtos:
`;

  cart.forEach(item => {
    const sub = item.preco * item.qtd;
    msg += `${item.nome} x${item.qtd} - ${formatarMoeda(sub)}
`;
  });

  if (dados.observacao) {
    msg += `
Observação: ${dados.observacao}
`;
  }

  msg += `
Total: ${formatarMoeda(pedido.total)}

Pagamento: ${dados.pagamento}
`;

  if (dados.pagamento === "Dinheiro") {
    msg += `Troco: ${dados.troco || "Não informado"}
`;
  }

  return msg;
}

function enviarParaImpressao(dados, pedido) {
  return fetch(PRINT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...dados,
      obs: dados.observacao,
      itens: cart,
      subtotal: pedido.subtotal,
      taxa: pedido.taxa,
      total: pedido.total
    })
  })
    .then(res => res.json())
    .then(() => console.log("Pedido enviado para impressão"))
    .catch(err => console.log("Erro ao enviar para impressão:", err));
}

function enviarPedido() {
  const horario = getHorarioFuncionamento();

  if (!horario.aberto) {
    alert(horario.mensagem);
    verificarHorario();
    return;
  }

  const dados = getDadosCheckout();
  const erro = validarCheckout(dados);

  if (erro) {
    alert(erro);
    return;
  }

  const pedido = calcularPedido();
  const msg = montarMensagemPedido(dados, pedido);

  enviarParaImpressao(dados, pedido);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);

  cart = [];
  localStorage.removeItem("cart");
  renderCart();
  voltarCarrinho();
}

function mostrarFeedback(msg) {
  const d = document.createElement("div");
  d.innerText = msg;
  d.style.position = "fixed";
  d.style.bottom = "80px";
  d.style.right = "20px";
  d.style.background = "#25d366";
  d.style.color = "#fff";
  d.style.padding = "10px";
  d.style.borderRadius = "10px";
  d.style.zIndex = "10000";
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2000);
}

function verificarHorario() {
  const horario = getHorarioFuncionamento();
  const el = document.getElementById("statusLoja");

  if (!el) return;

  if (horario.aberto) {
    el.innerText = "🟢 Aberto até 23:20";
    el.className = "status-loja aberto";
  } else {
    el.innerText = horario.motivo.includes("Segunda")
      ? "🔴 Fechado hoje - folga"
      : "🔴 Fechado - abre às 17:40";
    el.className = "status-loja fechado";
  }
}

function abrirModalSabores(nome, preco, lim) {
  abrirModalSelecao(nome, preco, sabores, lim, "sabores");
}

function abrirModalOpcoes(nome, preco, opcoes) {
  abrirModalSelecao(nome, preco, opcoes, 1, "opção");
}

function abrirModalSelecao(nome, preco, opcoes, lim, textoModal) {
  const horario = getHorarioFuncionamento();

  if (!horario.aberto) {
    alert(horario.mensagem);
    verificarHorario();
    return;
  }

  nomeAtual = nome;
  precoAtual = preco;
  limite = lim;
  textoModalAtual = textoModal;
  saboresSelecionados = [];

  const modal = document.getElementById("modalSabores");
  if (!modal) return;

  modal.style.display = "flex";

  let html = "";
  opcoes.forEach(s => {
    html += `<div class="sabor-btn" onclick="toggleSabor(this,'${s}')">${s}</div>`;
  });

  document.getElementById("listaSabores").innerHTML = html;
  document.getElementById("tituloModal").innerText = lim === 1
    ? `Escolha 1 ${textoModal}`
    : `Escolha até ${lim} ${textoModal}`;
}

function toggleSabor(el, sabor) {
  if (saboresSelecionados.includes(sabor)) {
    saboresSelecionados = saboresSelecionados.filter(x => x !== sabor);
    el.classList.remove("active");
    return;
  }

  if (saboresSelecionados.length >= limite) {
    alert(`Máximo ${limite}`);
    return;
  }

  saboresSelecionados.push(sabor);
  el.classList.add("active");
}

function confirmarSabores() {
  if (saboresSelecionados.length === 0) {
    const mensagem = textoModalAtual === "opção"
      ? "Escolha uma opção."
      : "Escolha pelo menos um sabor.";
    alert(mensagem);
    return;
  }

  addItem(`${nomeAtual} (${saboresSelecionados.join(" + ")})`, precoAtual);
  fecharModal();
}

function fecharModal() {
  document.getElementById("modalSabores").style.display = "none";
}

function fecharCarrinho() {
  document.getElementById("cart").classList.remove("open");
}

function mostrarCategoria(id, botao) {
  const busca = document.getElementById("buscaCardapio");
  if (busca) busca.value = "";

  document.querySelectorAll(".categoria-box").forEach(el => {
    el.classList.remove("active");
    el.classList.remove("search-active");
    el.style.display = "";
    el.querySelectorAll(".card").forEach(card => {
      card.style.display = "";
    });
  });

  const categoria = document.getElementById(id);
  if (categoria) categoria.classList.add("active");

  document.querySelectorAll(".menu-categorias button").forEach(btn => {
    btn.classList.remove("active");
  });

  if (botao) botao.classList.add("active");
}
