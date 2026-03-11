let predictionCounter = 0;

/* INICIAR APP */

function startApp(){

document.getElementById("welcome-screen").style.display = "none";
document.getElementById("app-screen").classList.remove("hidden");

}

/* SALIR */

function exitApp(){

document.getElementById("app-screen").classList.add("hidden");
document.getElementById("welcome-screen").style.display = "flex";

}

/* CANVAS */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 280;
canvas.height = 280;

/* fondo blanco */

ctx.fillStyle = "white";
ctx.fillRect(0,0,canvas.width,canvas.height);

/* estilo de dibujo */

ctx.strokeStyle = "black";
ctx.lineWidth = 25;
ctx.lineCap = "round";

let drawing = false;

/* eventos mouse */

canvas.addEventListener("mousedown", () => drawing = true);

canvas.addEventListener("mouseup", () => {

drawing = false;
ctx.beginPath();

});

canvas.addEventListener("mousemove", draw);

/* dibujar */

function draw(event){

if(!drawing) return;

ctx.lineTo(event.offsetX,event.offsetY);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(event.offsetX,event.offsetY);

}

/* LIMPIAR */

function clearCanvas(){

ctx.fillStyle="white";
ctx.fillRect(0,0,canvas.width,canvas.height);

document.getElementById("result").innerHTML="";
document.getElementById("bars").innerHTML="";
document.getElementById("confidence").innerHTML="";
document.getElementById("top3").innerHTML="";
document.getElementById("processed-image").src="";

}

/* PREDICCIÓN */

function predict(){

let data = canvas.toDataURL("image/png");

document.getElementById("loading").classList.remove("hidden");

fetch("/predict",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({image:data})

})

.then(res => res.json())

.then(data => {

document.getElementById("loading").classList.add("hidden");

/* RESULTADO PRINCIPAL */

document.getElementById("result").innerHTML =
"🔢 Número reconocido: <b>" + data.digit + "</b>";

/* CONFIANZA */

let confidence = data.probabilities[data.digit];

document.getElementById("confidence").innerHTML =
"📊 Confianza del modelo: <b>" + confidence + "%</b>";

/* CONTADOR */

predictionCounter++;

document.getElementById("prediction-count").innerText = predictionCounter;

/* BARRAS DE PROBABILIDAD */

let barsHTML="";

for(let i=0;i<10;i++){

barsHTML += `
<div style="margin:6px 0">

<strong>${i}</strong>

<div class="bar">
<div class="fill" id="bar-${i}"></div>
</div>

${data.probabilities[i]}%

</div>
`;

}

document.getElementById("bars").innerHTML = barsHTML;

/* ANIMACIÓN DE BARRAS */

setTimeout(()=>{

for(let i=0;i<10;i++){

document.getElementById("bar-" + i).style.width =
data.probabilities[i] + "%";

}

},100);

/* TOP 3 EN TARJETAS */

let top3Container = document.getElementById("top3");

top3Container.innerHTML = "";

if(data.top3){

data.top3.forEach((item,index)=>{

let medal = "";

if(index === 0) medal = "🥇";
if(index === 1) medal = "🥈";
if(index === 2) medal = "🥉";

let card = `
<div class="prediction-card">

<div class="digit">${item[0]}</div>

<div class="prob">${item[1]}%</div>

<div class="medal">${medal}</div>

</div>
`;

top3Container.innerHTML += card;

});

}

/* IMAGEN QUE VE LA IA */

if(data.processed_image){

document.getElementById("processed-image").src =
"data:image/png;base64," + data.processed_image;

}

})

.catch(error => {

console.error("Error en la predicción:", error);

document.getElementById("loading").classList.add("hidden");

});

}