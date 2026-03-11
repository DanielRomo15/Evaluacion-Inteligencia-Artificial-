let predictionCounter = 0;

function startApp() {

document.getElementById("welcome-screen").style.display = "none";
document.getElementById("app-screen").classList.remove("hidden");

}

function exitApp() {

document.getElementById("app-screen").classList.add("hidden");
document.getElementById("welcome-screen").style.display = "flex";

}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 280;
canvas.height = 280;

ctx.fillStyle = "white";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.strokeStyle = "black";
ctx.lineWidth = 25;
ctx.lineCap = "round";

let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);

canvas.addEventListener("mouseup", () => {

drawing = false;
ctx.beginPath();

});

canvas.addEventListener("mousemove", draw);

function draw(event) {

if(!drawing) return;

ctx.lineTo(event.offsetX,event.offsetY);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(event.offsetX,event.offsetY);

}

function clearCanvas() {

ctx.fillStyle="white";
ctx.fillRect(0,0,canvas.width,canvas.height);

document.getElementById("result").innerHTML="";
document.getElementById("bars").innerHTML="";
document.getElementById("confidence").innerHTML="";
document.getElementById("top3").innerHTML="";

}

function predict() {

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

document.getElementById("result").innerHTML =
"🔢 Número reconocido: " + data.digit;

// confianza del modelo

let confidence = data.probabilities[data.digit];

document.getElementById("confidence").innerHTML =
"📊 Confianza del modelo: " + confidence + "%";

predictionCounter++;

document.getElementById("prediction-count").innerText = predictionCounter;

// barras de probabilidades

let barsHTML="";

for(let i=0;i<10;i++){

barsHTML += `
<div style="margin:5px 0">
<strong>${i}</strong>
<div class="bar">
<div class="fill" id="bar-${i}"></div>
</div>
${data.probabilities[i]}%
</div>
`;

}

document.getElementById("bars").innerHTML = barsHTML;

// animar barras

setTimeout(()=>{

for(let i=0;i<10;i++){

document.getElementById("bar-" + i).style.width = data.probabilities[i] + "%";

}

},100);

// TOP 3

let top3List = document.getElementById("top3");

top3List.innerHTML = "";

if(data.top3){

data.top3.forEach(item =>{

let li = document.createElement("li");

li.innerText = "Número " + item[0] + " → " + item[1] + "%";

top3List.appendChild(li);

});

}

// imagen que ve el modelo

if(data.processed_image){

document.getElementById("processed-image").src =
"data:image/png;base64," + data.processed_image;

}

})

.catch(error => {

console.error("Error en la predicción:", error);

});

}