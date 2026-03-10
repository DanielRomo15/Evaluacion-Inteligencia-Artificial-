const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 280;
canvas.height = 280;

ctx.fillStyle = "white";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.strokeStyle = "black";

let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);

canvas.addEventListener("mouseup", () => {
drawing = false;
ctx.beginPath();
});

canvas.addEventListener("mousemove", draw);

function draw(event){

if(!drawing) return;

ctx.lineWidth = 25;
ctx.lineCap = "round";

ctx.lineTo(event.offsetX,event.offsetY);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(event.offsetX,event.offsetY);

}

function clearCanvas(){

ctx.fillStyle = "white";
ctx.fillRect(0,0,canvas.width,canvas.height);

document.getElementById("result").innerHTML = "";
document.getElementById("bars").innerHTML = "";

}

function predict(){

let data = canvas.toDataURL("image/png");

fetch("/predict",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({image:data})

})

.then(res => res.json())

.then(data =>{

document.getElementById("result").innerHTML =
"Numero reconocido: " + data.digit;

let barsHTML = "";

for(let i=0;i<10;i++){

barsHTML += `
<div style="margin:5px 0;">
${i}
<div style="
background:#ddd;
width:100%;
height:20px;
border-radius:5px;
overflow:hidden;
">
<div style="
background:#007BFF;
width:${data.probabilities[i]}%;
height:100%;
"></div>
</div>
${data.probabilities[i]}%
</div>
`

}

document.getElementById("bars").innerHTML = barsHTML;

})

}