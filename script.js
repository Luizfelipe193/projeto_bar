let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================= INIT =================
window.onload = () => {
renderCart();
verificarHorario();
}

// ================= NAV =================
function abrirCardapioTela(){
document.getElementById("home").style.display="none";
document.getElementById("cardapio").style.display="block";
}

// ================= CARRINHO =================
function addItem(nome,preco){

let item = cart.find(p=>p.nome===nome);

if(item){ item.qtd++; }
else{ cart.push({nome,preco,qtd:1}); }

localStorage.setItem("cart", JSON.stringify(cart));
renderCart();

document.getElementById("cart").classList.add("open");
mostrarFeedback("Item adicionado!");
}

function alterarQtd(nome,acao){

let item = cart.find(p=>p.nome===nome);
if(!item) return;

if(acao==="mais"){ item.qtd++; }
else{
item.qtd--;
if(item.qtd<=0){
cart = cart.filter(p=>p.nome!==nome);
}
}

localStorage.setItem("cart", JSON.stringify(cart));
renderCart();
}

function removerItem(nome){
cart = cart.filter(p=>p.nome!==nome);
localStorage.setItem("cart", JSON.stringify(cart));
renderCart();
}

// ================= TAXAS =================
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

// ================= RENDER =================
function renderCart(){

let items = document.getElementById("items");
let totalEl = document.getElementById("total");
let count = document.getElementById("count");

if(!items || !totalEl || !count) return;

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

// taxa dinâmica
let tipo = document.getElementById("tipo")?.value;
let bairro = document.getElementById("bairro")?.value;

let taxa = 0;

if(tipo==="Delivery" && bairro && bairro!=="Outro"){
taxa = taxas[bairro] || 0;
}

let total = subtotal + taxa;

items.innerHTML = html;

totalEl.innerHTML = `
Subtotal: R$ ${subtotal.toFixed(2)}<br>
Taxa: R$ ${taxa.toFixed(2)}<br>
<b>Total: R$ ${total.toFixed(2)}</b>
`;

count.innerHTML=qtd;
}

// ================= ATUALIZA AUTOMÁTICO =================
document.addEventListener("change", e=>{
if(e.target.id==="bairro" || e.target.id==="tipo"){
renderCart();
}
});

// ================= UI =================
function toggleCart(){
document.getElementById("cart").classList.toggle("open");
}

// ================= CHECKOUT =================
function abrirCheckout(){

if(cart.length===0){
alert("Adicione produtos");
return;
}

// MOSTRA CHECKOUT
document.getElementById("acoesCarrinho").style.display="none";
document.getElementById("checkoutBox").style.display="block";

// garante render atualizado
renderCart();
}

function voltarCarrinho(){
document.getElementById("checkoutBox").style.display="none";
document.getElementById("acoesCarrinho").style.display="block";
}

// ================= ENDEREÇO =================
function showEndereco(){
let tipo=document.getElementById("tipo").value;

document.getElementById("enderecoBox").style.display =
tipo==="Delivery" ? "block":"none";

renderCart();
}

// ================= PEDIDO =================
function enviarPedido(){

let agora = new Date();
let hora = agora.getHours();
let minuto = agora.getMinutes();

// BLOQUEIO HORÁRIO
if(hora < 18 || (hora===23 && minuto>10) || hora>23){
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
let obs=document.getElementById("observacao")?.value;

// VALIDAÇÃO
if(!nome){ alert("Digite seu nome"); return; }
if(!fone){ alert("Digite seu telefone"); return; }

// DATA E HORA
let data = agora.toLocaleDateString('pt-BR');
let horaAtual = agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});

// CALCULO
let subtotal=0;
let taxa=0;

if(tipo==="Delivery" && bairro!=="Outro"){
taxa = taxas[bairro] || 0;
}

// ================= MENSAGEM ORGANIZADA =================
let msg = `Pedido Bar do Pastel

Data: ${data}
Hora: ${horaAtual}

Tipo de serviço: ${tipo}

Nome: ${nome}
Telefone: ${fone}
`;

// ENTREGA
if(tipo==="Delivery"){
msg += `
Bairro: ${bairro}
Endereço: ${endereco}
`;

if(referencia){
msg += `Referência: ${referencia}
`;
}

msg += bairro==="Outro"
? "Taxa de entrega: A confirmar\n"
: `Taxa de entrega: R$ ${taxa.toFixed(2)}\n`;
}

// PRODUTOS
msg += `
Produtos:
`;

cart.forEach(i=>{
let sub=i.preco*i.qtd;
subtotal+=sub;

msg += `${i.nome} x${i.qtd} - R$ ${sub.toFixed(2)}
`;
});

// OBSERVAÇÃO
if(obs){
msg += `
Observação: ${obs}
`;
}

// TOTAL
let total = subtotal + taxa;

msg += `
Total: R$ ${total.toFixed(2)}

Pagamento: ${pagamento}
`;

// ENVIO
window.open(`https://wa.me/5584987415810?text=${encodeURIComponent(msg)}`);

// RESET
cart=[];
localStorage.removeItem("cart");
renderCart();
voltarCarrinho();
}

// ================= FEEDBACK =================
function mostrarFeedback(msg){
let d=document.createElement("div");
d.innerText=msg;
d.style.position="fixed";
d.style.bottom="80px";
d.style.right="20px";
d.style.background="#25d366";
d.style.color="#fff";
d.style.padding="10px";
d.style.borderRadius="10px";
document.body.appendChild(d);
setTimeout(()=>d.remove(),2000);
}

// ================= HORARIO =================
function verificarHorario(){
let agora = new Date();
let h = agora.getHours();
let m = agora.getMinutes();

let aberto = !(h<18 || (h===23 && m>10) || h>23);

let el=document.getElementById("statusLoja");
if(!el) return;

if(aberto){
el.innerText="🟢 Aberto";
el.className="status-loja aberto";
}else{
el.innerText="🔴 Fechado";
el.className="status-loja fechado";
}
}

setInterval(verificarHorario,30000);

// ================= MODAL =================
let saboresSelecionados=[];
let limite=0;
let nomeAtual="";
let precoAtual=0;

const sabores=["Carne","Frango","Queijo","Catupiry","Calabresa","Presunto","Cheddar"];

function abrirModalSabores(nome,preco,lim){
nomeAtual=nome;
precoAtual=preco;
limite=lim;
saboresSelecionados=[];

let modal=document.getElementById("modalSabores");
if(!modal) return;

modal.style.display="flex";

let html="";
sabores.forEach(s=>{
html+=`<div class="sabor-btn" onclick="toggleSabor(this,'${s}')">${s}</div>`;
});

document.getElementById("listaSabores").innerHTML=html;
document.getElementById("tituloModal").innerText=`Escolha até ${lim} sabores`;
}

function toggleSabor(el,s){

if(saboresSelecionados.includes(s)){
saboresSelecionados=saboresSelecionados.filter(x=>x!==s);
el.classList.remove("active");
return;
}

if(saboresSelecionados.length>=limite){
alert(`Máximo ${limite}`);
return;
}

saboresSelecionados.push(s);
el.classList.add("active");
}

function confirmarSabores(){
if(saboresSelecionados.length===0){
alert("Escolha sabores");
return;
}

addItem(`${nomeAtual} (${saboresSelecionados.join(" + ")})`,precoAtual);
fecharModal();
}

function fecharModal(){
document.getElementById("modalSabores").style.display="none";
}



function fecharCarrinho(){
document.getElementById("cart").classList.remove("open");
}









function mostrarCategoria(id){
  // esconde tudo
  document.querySelectorAll('.categoria-box').forEach(el=>{
    el.classList.remove('active');
  });

  // mostra selecionado
  document.getElementById(id).classList.add('active');

  // botão ativo
  document.querySelectorAll('.menu-categorias button').forEach(btn=>{
    btn.classList.remove('active');
  });

  event.target.classList.add('active');
}





// abre pastel por padrão
window.onload = () => {
  document.getElementById('pasteis').classList.add('active');
  document.querySelector('.menu-categorias button').classList.add('active');
};





function irParaCheckout(){
let checkout = document.getElementById("checkoutBox");

// mostra checkout
checkout.style.display = "block";

// rola até ele
checkout.scrollIntoView({
behavior: "smooth",
block: "start"
});
}





