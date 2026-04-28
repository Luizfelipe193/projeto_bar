let cart = JSON.parse(localStorage.getItem("cart")) || [];

// =========================
// INIT
// =========================

window.onload = () => {
renderCart();
};

// =========================
// NAVEGAÇÃO
// =========================

function abrirCardapioTela(){
document.getElementById("home").style.display="none";
document.getElementById("cardapio").style.display="block";
}

// =========================
// CARRINHO
// =========================

function addItem(nome,preco){

let item = cart.find(p=>p.nome===nome);

if(item){
item.qtd++;
}else{
cart.push({nome,preco,qtd:1});
}

localStorage.setItem("cart", JSON.stringify(cart));

renderCart();
document.getElementById("cart").classList.add("open");

mostrarFeedback("Item adicionado!");
}

function alterarQtd(nome,acao){

let item = cart.find(p=>p.nome===nome);

if(!item) return;

if(acao === "mais"){
item.qtd++;
}else{
item.qtd--;
if(item.qtd <= 0){
cart = cart.filter(p=>p.nome !== nome);
}
}

localStorage.setItem("cart", JSON.stringify(cart));
renderCart();
}

function removerItem(nome){
cart = cart.filter(p=>p.nome !== nome);
localStorage.setItem("cart", JSON.stringify(cart));
renderCart();
}

// =========================
// TAXAS FIXAS
// =========================

const taxas = {
"Alecrim":5,
"Bairro Nazaré":6,
"Bairro Nordeste":6,
"Barro Vermelho":7,
"Bom Pastor":6,
"Candelária":8,
"Capim Macio":15,
"Cidade Alta":7,
"Cidade Esperança":7,
"Cidade Nova":8,
"Cidade Satélite":15,
"Dix-Sept Rosado":5,
"Felipe Camarão":10,
"Jardim América":7,
"Lagoa Nova":7,
"Lagoa Seca":6,
"Mãe Luiza":12,
"Neópolis":15,
"Parnamirim":20,
"Petrópolis":10,
"Pitimbu":18,
"Planalto":15,
"Ponta Negra":20,
"Potilândia":10,
"Praia do Meio":12,
"Quintas":5,
"Ribeira":10,
"Rocas":10,
"Tirol":8
};

// =========================
// RENDER COM TAXA AO VIVO
// =========================

function renderCart(){

let html='';
let subtotal=0;
let qtd=0;

cart.forEach(item=>{

let sub=item.preco*item.qtd;
subtotal+=sub;
qtd+=item.qtd;

html+=`
<div class="cart-item">
<b>${item.nome}</b><br>

<button onclick="alterarQtd('${item.nome}','menos')">-</button>
${item.qtd}
<button onclick="alterarQtd('${item.nome}','mais')">+</button>

<br>R$ ${sub.toFixed(2)}

<br><button onclick="removerItem('${item.nome}')">❌ Remover</button>
</div>
`;
});

// pegar dados do form
let tipo = document.getElementById("tipo")?.value;
let bairro = document.getElementById("bairro")?.value;

let taxa = 0;

if(tipo === "Delivery" && bairro && bairro !== "Outro"){
taxa = taxas[bairro] || 0;
}

let total = subtotal + taxa;

// render final
document.getElementById("items").innerHTML = html;

document.getElementById("total").innerHTML = `
Subtotal: R$ ${subtotal.toFixed(2)}<br>
Taxa: R$ ${taxa.toFixed(2)}<br>
<b>Total: R$ ${total.toFixed(2)}</b>
`;

document.getElementById("count").innerHTML=qtd;
}

// =========================
// ATUALIZA AUTOMÁTICO
// =========================

document.addEventListener("change", function(e){
if(e.target.id === "bairro" || e.target.id === "tipo"){
renderCart();
}
});

// =========================
// CARRINHO UI
// =========================

function toggleCart(){
document.getElementById("cart").classList.toggle("open");
}

// =========================
// CHECKOUT
// =========================

function abrirCheckout(){

if(cart.length===0){
alert("Adicione produtos");
return;
}

document.getElementById("acoesCarrinho").style.display="none";
document.getElementById("checkoutBox").style.display="block";
}

function showEndereco(){
let tipo=document.getElementById("tipo").value;
document.getElementById("enderecoBox").style.display =
tipo==="Delivery" ? "block":"none";
}

// =========================
// ENVIAR PEDIDO COM HORÁRIO
// =========================

function enviarPedido(){

let agora = new Date();
let hora = agora.getHours();
let minuto = agora.getMinutes();

// BLOQUEIO
if(
hora < 18 ||
(hora === 23 && minuto > 10) ||
hora > 23
){
alert("Estamos fechados. Funcionamos das 18:00 às 23:10.");
return;
}

// DADOS
let nome=document.getElementById("nome").value.trim();
let fone=document.getElementById("fone").value.trim();
let tipo=document.getElementById("tipo").value;
let bairro=document.getElementById("bairro").value;
let endereco=document.getElementById("endereco").value;
let referencia=document.getElementById("referencia").value;
let pagamento=document.getElementById("pagamento").value;

// VALIDAÇÃO
if(!nome){ alert("Digite seu nome"); return; }
if(!fone){ alert("Digite seu telefone"); return; }

if(tipo==="Delivery"){
if(!bairro){ alert("Selecione o bairro"); return; }
if(!endereco){ alert("Digite o endereço"); return; }
}

// CALCULO
let subtotal=0;
let taxa=0;

if(tipo==="Delivery" && bairro !== "Outro"){
taxa = taxas[bairro] || 0;
}

// DATA/HORA
let data=new Date().toLocaleDateString('pt-BR');
let horaAtual=new Date().toLocaleTimeString('pt-BR',{
hour:'2-digit',
minute:'2-digit'
});

// MENSAGEM ORGANIZADA
let mensagem=`Pedido Bar do Pastel

Data: ${data}
Hora: ${horaAtual}

Tipo de serviço: ${tipo}

Nome: ${nome}
Telefone: ${fone}
`;

// ENTREGA
if(tipo==="Delivery"){

mensagem+=`
Bairro: ${bairro}
Endereço: ${endereco}
`;

if(referencia){
mensagem+=`Referência: ${referencia}
`;
}

if(bairro === "Outro"){
mensagem+=`Taxa de entrega: A confirmar
`;
}else{
mensagem+=`Taxa de entrega: R$ ${taxa.toFixed(2)}
`;
}
}

// PRODUTOS
mensagem+=`
Produtos:
`;

cart.forEach(item=>{
let sub=item.preco*item.qtd;
subtotal+=sub;

mensagem+=`${item.nome} x${item.qtd} - R$ ${sub.toFixed(2)}
`;
});

// TOTAL FINAL
let total = subtotal + taxa;

mensagem+=`
Total: R$ ${total.toFixed(2)}

Pagamento: ${pagamento}
`;

// ENVIO
window.open(`https://wa.me/5584987415810?text=${encodeURIComponent(mensagem)}`);

// LIMPAR
cart=[];
localStorage.removeItem("cart");
renderCart();
}

// =========================
// FEEDBACK
// =========================

function mostrarFeedback(msg){

let div = document.createElement("div");

div.innerText = msg;

div.style.position = "fixed";
div.style.bottom = "80px";
div.style.right = "20px";
div.style.background = "#25d366";
div.style.color = "#fff";
div.style.padding = "12px 20px";
div.style.borderRadius = "10px";
div.style.fontWeight = "bold";
div.style.zIndex = "9999";

document.body.appendChild(div);

setTimeout(()=>{
div.remove();
},2000);
}


function verificarHorario(){

let agora = new Date();
let hora = agora.getHours();
let minuto = agora.getMinutes();

let aberto = true;

// regra: 18:00 até 23:10
if(
hora < 18 ||
(hora === 23 && minuto > 10) ||
hora > 23
){
aberto = false;
}

let statusDiv = document.getElementById("statusLoja");

if(!statusDiv) return;

if(aberto){
statusDiv.innerText = "🟢 Aberto agora";
statusDiv.className = "status-loja aberto";
}else{
statusDiv.innerText = "🔴 Fechado agora (abre às 18:00)";
statusDiv.className = "status-loja fechado";
}

}

// roda ao carregar
verificarHorario();

// atualiza a cada 30s
setInterval(verificarHorario, 30000);