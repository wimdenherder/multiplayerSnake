const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

const socket = io('https://polar-savannah-16009.herokuapp.com/');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const scoreWon = document.getElementById('scoreWon');
const scoreLost = document.getElementById('scoreLost');


newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);


let canvas, ctx;
let playerNumber;
let gameActive = false;
let won = 0;
let lost = 0;

// source: https://stackoverflow.com/questions/9899372/pure-javascript-equivalent-of-jquerys-ready-how-to-call-a-function-when-t
// and here's the trick (works everywhere)
function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
// use like
r(function(){
    onOpen();
});

function onOpen() {
    const queryString = window.location.search;
    if(!queryString) return;
    console.log(queryString);
    // ?product=shirt&color=blue&newuser&size=m
    const urlParams = new URLSearchParams(queryString);
    const gameCode = urlParams.get('gameCode');
    if(gameCode) {
        console.log('Start game with gameCode: ' + gameCode);
        gameCodeInput.value = gameCode;
        scoreWon.innerText = won;
        scoreLost.innerText = lost;
        joinGame();
    }
}

function newGame() {
  socket.emit('newGame');
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}


function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, 'red');
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    won++;
    alert('You Win!');
  } else {
    lost++;
    alert('You Lose :(');
  }

  setTimeout(() => {
      restartGame();
  }, 2000);
}

function restartGame() {
    gameActive = true;
    socket.emit('restartGame');
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = "https://musing-mcnulty-7de8aa.netlify.app/?gameCode=" + gameCode;
  gameCodeDisplay.href = "https://musing-mcnulty-7de8aa.netlify.app/?gameCode=" + gameCode;
}

function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}
