let cart = JSON.parse(localStorage.getItem("cart")) || [];

let taxas = JSON.parse(localStorage.getItem("taxas")) || {
"Alecrim": 5,
"Lagoa Nova": 7,
"Centro": 6
};

window.onload = () => {
renderCart();
renderBairros();
carregarSelectBairros();
};

function abrirCardapioTela(){
document.getElementById("home").style.display="none";
document.getElementById("cardapio").style.display="block";
}

function addItem(nome,preco){

let item = cart.find(p=>p.nome===nome);

if(item){ item.qtd++; }
else{ cart.push({nome,preco,qtd:1}); }

localStorage.setItem("cart", JSON.stringify(cart));

renderCart();
document.getElementById("cart").classList.add("open");
}

function renderCart(){

let html='';
let total=0;
let qtd=0;

cart.forEach(item=>{
let sub=item.preco*item.qtd;
total+=sub;
qtd+=item.qtd;

html+=`${item.nome} x${item.qtd} - R$ ${sub.toFixed(2)}<br>`;
});

document.getElementById("items").innerHTML=html;
document.getElementById("total").innerHTML="Total: R$ "+total.toFixed(2);
document.getElementById("count").innerHTML=qtd;
}

function toggleCart(){
document.getElementById("cart").classList.toggle("open");
}

function abrirCheckout(){
if(cart.length===0){ alert("Adicione produtos"); return; }

document.getElementById("acoesCarrinho").style.display="none";
document.getElementById("checkoutBox").style.display="block";
}

function showEndereco(){
let tipo=document.getElementById("tipo").value;
document.getElementById("enderecoBox").style.display =
tipo==="Delivery" ? "block":"none";
}

function calcularTaxa(bairro){
return taxas[bairro] || 0;
}

function enviarPedido(){

let nome=document.getElementById("nome").value;
let fone=document.getElementById("fone").value;
let tipo=document.getElementById("tipo").value;
let bairro=document.getElementById("bairro").value;
let endereco=document.getElementById("endereco").value;
let pagamento=document.getElementById("pagamento").value;

let total=0;

let mensagem=`Pedido Bar do Pastel\n\n`;

cart.forEach(item=>{
let sub=item.preco*item.qtd;
total+=sub;
mensagem+=`${item.nome} x${item.qtd} - R$ ${sub.toFixed(2)}\n`;
});

let taxa=0;

if(tipo==="Delivery"){
taxa = calcularTaxa(bairro);
total += taxa;

mensagem+=`\nBairro: ${bairro}\nEndereço: ${endereco}\nTaxa: R$ ${taxa}`;
}

mensagem+=`\n\nTotal: R$ ${total}\nPagamento: ${pagamento}`;

window.open(`https://wa.me/5584987415810?text=${encodeURIComponent(mensagem)}`);

cart=[];
localStorage.removeItem("cart");
renderCart();
}

function salvarBairro(){

let nome = document.getElementById("bairroNome").value;
let taxa = parseFloat(document.getElementById("bairroTaxa").value);

if(!nome || isNaN(taxa)){ alert("Preencha"); return; }

taxas[nome]=taxa;

localStorage.setItem("taxas", JSON.stringify(taxas));

renderBairros();
carregarSelectBairros();
}

function renderBairros(){

let html="";
for(let b in taxas){
html+=`${b} - R$ ${taxas[b]}<br>`;
}

document.getElementById("listaBairros").innerHTML=html;
}

function carregarSelectBairros(){

let select=document.getElementById("bairro");

if(!select) return;

select.innerHTML='<option value="">Selecione seu bairro</option>';

for(let b in taxas){
select.innerHTML+=`<option>${b}</option>`;
}
}