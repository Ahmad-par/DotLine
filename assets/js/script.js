//Initialization
const boardWrapElem = document.getElementById("board-wrapper");
const userWrapElem = document.getElementById("username-wrapper");
const selectWrapElem = document.getElementById("select-wrapper");
const formElem = document.querySelector("#username-wrapper form");
const inputElem = document.querySelector("#username-wrapper input");
const warnMessage = document.querySelector("input ~ p");
const dimsWrapElem = document.querySelector(".dims--wrapper");
const playersElem = document.querySelector(".players");
const scoresElem = document.querySelector(".scores");
const resButton = document.getElementById("restart");
const changeButton = document.getElementById("change-user");

let username;
let dimension;

let cells = {};
let playersObj = {};
let scoresObj = {};

const colors = ['red', 'blue'];
let colorIdx = Math.round(Math.random());
let currentColor = colors[colorIdx];
let otherColor = colors[colors.findIndex(c => c != currentColor)];

//Check if the user already exists
if (localStorage.user){
    username = localStorage.getItem('user');
    userWrapElem.style.display = "none";
    selectWrapElem.style.display = "flex";
}

// Handle username submission
formElem.onsubmit = function(event){
    event.preventDefault();
    if (inputElem.value){
        let val = inputElem.value;
        if (/[^0-9a-zA-Z_.ا-ی]/.test(val)){
            inputElem.style.outline = "1px red solid";
            warnMessage.style.color = "red";
            warnMessage.style.fontWeight = "bold";
            warnMessage.textContent = 'نام انتخابی میتواند تنها شامل حروف، اعداد و کاراکترهای "_" و "." باشد';
        }else{
            username = val;
            localStorage.setItem('user', username);
            inputElem.style.outline = "1px green solid";
            warnMessage.style.color = "green";
            warnMessage.style.fontWeight = "bold";
            warnMessage.textContent = "خوش آمدید!";
            setTimeout(()=>{
                userWrapElem.style.display = "none";
                selectWrapElem.style.display = "";
            }, 800);
        }
    }else{
        inputElem.style.outline = "1px red solid";
        warnMessage.style.color = "red";
        warnMessage.style.fontWeight = "bold";
        warnMessage.textContent = "نام کاربری نمیتواند خالی باشد";
    }
};

inputElem.oninput = function(event){
    if (warnMessage.style.color){
        warnMessage.innerHTML = "<br/>";
        inputElem.style.outline = "";
    }
};

// Grab the number of dots
dimsWrapElem.onclick = function(event){
    if (event.target.tagName.toLowerCase = 'span'){
        dimension = parseInt(event.target.textContent.split('*')[0]);
        selectWrapElem.style.display = "none";
        renderBoard(dimension);
        fillCells();
        renderPlayers(username);
        renderScores();
        playersObj[`player-${currentColor}`].style.border = `2px ${currentColor} solid`;
        if (playersObj[`player-${currentColor}`].textContent == username){
            boardWrapElem.onclick = boardWrapHandler; 
        }else{
            computerTurn();
        }
    }
};

//Game logic
// boardWrapElem.onclick = boardWrapHandler;

//Buttons' handlers
resButton.onclick = function(event){
    location.reload();
}

changeButton.onclick = function(event){
    localStorage.removeItem('user');
    location.reload();
}

// Render board part of the game in a function
function renderBoard(dims){
    let rowDot;
    let rowCell;

    for (let y=0; y<dims; y++){
        rowDot = document.createElement('div');
        rowDot.className = "row";

        rowCell = document.createElement('div');
        rowCell.className = "row";

        for (let x=0; x<dims; x++){
            rowDot.innerHTML += `<div class="dot"></div>`;
            if (x != dims - 1){
                if (y == 0){
                    rowDot.innerHTML += `<div class="line--h" connectedTo="${'c'+y+x}"></div>`;
                }else if (y == dims - 1){
                    rowDot.innerHTML += `<div class="line--h" connectedTo="${'c'+(y-1)+x}"></div>`;
                }else{
                    rowDot.innerHTML += `<div class="line--h" connectedTo="${'c'+(y-1)+x} ${'c'+y+x}"></div>`;
                }
            }
            if (x == 0){
                rowCell.innerHTML += `<div class="line--v" connectedTo="${'c'+y+x}"></div>`;
                rowCell.innerHTML += `<div class="cell" id="${'c'+y+x}"></div>`;
            }else if (x == dims - 1){
               rowCell.innerHTML += `<div class="line--v" connectedTo="${'c'+y+(x-1)}"></div>`; 
            }else{
                rowCell.innerHTML += `<div class="line--v" connectedTo="${'c'+y+x} ${'c'+y+(x-1)}"></div>`;
                rowCell.innerHTML += `<div class="cell" id="${'c'+y+x}"></div>`;
            }
        }
        boardWrapElem.append(rowDot);
        if (y != dims - 1) boardWrapElem.append(rowCell);
    }
}

//Initialize cells object
function fillCells(){
    let cellObjs = document.querySelectorAll(".cell");
    for (let c of cellObjs){
        cells[c.id] = 0;
    }
}

function renderPlayers(){
    let blue = document.createElement('span');
    blue.id = "player-blue";

    let red = document.createElement('span');
    red.id = "player-red";

    if(Math.round(Math.random())){
        red.textContent = username;
        blue.textContent = "کامپیوتر";
    }else{
        blue.textContent = username;
        red.textContent = "کامپیوتر";
    }
    playersObj["player-red"] = red;
    playersObj["player-blue"] = blue;

    playersElem.append(blue);
    playersElem.append(red);
}

function renderScores(){
    let blue = document.createElement('span');
    blue.id = "score-blue";
    blue.textContent = '0';
    scoresObj["score-blue"] = blue;

    let red = document.createElement('span');
    red.id = "score-red";
    red.textContent = '0';
    scoresObj["score-red"] = red;

    scoresElem.append(blue);
    scoresElem.append(red);
}

function boardWrapHandler(event){
    if (event.target.className == 'line--v' || event.target.className == 'line--h'){
        if (!event.target.style.backgroundColor){
            event.target.style.backgroundColor = `${currentColor}`;
            if (updateGame(event.target)){
                updatePlayer();
                setTimeout(computerTurn, 300);
            }                       
        }
    }
}

function computerTurn(){
    boardWrapElem.onclick = null;
    let selectedCell;
    let lineObj;
    const tmp = ['line--v', 'line--h'];
    let l1 = tmp[Math.round(Math.random())];
    let l2 = tmp[tmp.findIndex(i => i != l1)];
    let  oneFill = [], twoFill = [], threeFill = [], zeroFill = [];
    for (let c in cells){
        switch(cells[c]){
            case 3:
                threeFill.push(c);
                break;
            case 0:
                zeroFill.push(c);
                break;
            case 1:
                oneFill.push(c);
                break;
            case 2:
                twoFill.push(c);
                break;
        }
    }
    if (threeFill.length > 0){
        selectedCell = threeFill[Math.floor(Math.random() * threeFill.length)];
    }else if (zeroFill.length > 0){
        selectedCell = zeroFill[Math.floor(Math.random() * zeroFill.length)]; 
    }else if (oneFill.length > 0){
        selectedCell = oneFill[Math.floor(Math.random() * oneFill.length)];
    }else{
        selectedCell = twoFill[Math.floor(Math.random() * twoFill.length)];
    }
    let chk = true;
    for (let obj of document.querySelectorAll('.'+l1)){
        if (obj.getAttribute('connectedTo').includes(selectedCell)){
            if (obj.style.backgroundColor) continue;
            lineObj = obj;
            lineObj.style.backgroundColor = `${currentColor}`;
            chk = false;
            break;
        }
    }
    if (chk){
        for (let obj of document.querySelectorAll('.'+l2)){
            if (obj.getAttribute('connectedTo').includes(selectedCell)){
                if (obj.style.backgroundColor) continue;
                lineObj = obj;
                lineObj.style.backgroundColor = `${currentColor}`;
                break;
            }
        }
    }
    if (updateGame(lineObj)){
        updatePlayer();
        boardWrapElem.onclick = boardWrapHandler;
    }
}

function updateGame(line){
    let connectedCells = line.getAttribute("connectedTo").split(' ');
    for (let cid of connectedCells){
        if (cells[cid] < 4){
            cells[cid] += 1;
            if (cells[cid] == 4){
                document.getElementById(cid).style.backgroundColor = `${currentColor}`;
                scoresObj[`score-${currentColor}`].textContent = parseInt(scoresObj[`score-${currentColor}`].textContent) + 1;
                if (Object.values(cells).every(c => c == 4)){
                    if (parseInt(scoresObj[`score-${currentColor}`].textContent) > parseInt(scoresObj[`score-${otherColor}`].textContent)){
                        let tmPlayer = playersObj[`player-${currentColor}`];
                        let tmscore = scoresObj[`score-${currentColor}`];
                        tmPlayer.style.fontSize = "25pt";
                        tmPlayer.style.border = "";
                        tmPlayer.style.color = "white";
                        tmPlayer.style.backgroundColor = "gold";
                        tmscore.style.color = "gold";
                    }else if (parseInt(scoresObj[`score-${currentColor}`].textContent) < parseInt(scoresObj[`score-${otherColor}`].textContent)){
                        let tmPlayer = playersObj[`player-${otherColor}`];
                        let tmscore = scoresObj[`score-${otherColor}`];
                        tmPlayer.style.fontSize = "25pt";
                        tmPlayer.style.border = "";
                        tmPlayer.style.color = "white";
                        tmPlayer.style.backgroundColor = "gold";
                        tmscore.style.color = "gold";
                    }else{
                        let tmpObj = document.createElement('span');
                        tmpObj.textContent = "مساوی";
                        tmpObj.style.backgroundColor = "gold";
                        tmpObj.style.color = "white";
                        tmpObj.style.padding = "15px";
                        tmpObj.style.borderRadius = "5px";
                        tmpObj.style.fontSize = "20pt";
                        tmpObj.style.fontWeight = "bold";
                        document.getElementById('score-blue').after(tmpObj);

                    }
                    boardWrapElem.onclick = null;
                    return 0;
                }
            }
        }
    }
    return 1;
}
function updatePlayer(){
    colorIdx = (colorIdx + 1) % 2;
    currentColor = colors[colorIdx];
    otherColor = colors[colors.findIndex(c => c != currentColor)];
    playersObj[`player-${otherColor}`].style.border = "";
    playersObj[`player-${currentColor}`].style.border = `2px ${currentColor} solid`;
}