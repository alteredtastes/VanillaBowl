const validate = (type, o) => {
  let isValid = true;
  if (type === 'player') {
    const playerName = o.newPlayer.value;

    if ((o.board.players.length + 1) > 5) {
      isValid = false;
      window.alert('Too many players! Must be 1 to 5.');
    }

    o.board.players.forEach(existingPlayer => {
      if (existingPlayer.name === playerName) {
        isValid = false;
        window.alert(`Players cannot have the same names! "${playerName}" is already taken.`);
      }
      return;
    });
  }

  return isValid;
}

const getRandomIntInclusive = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class ScoreBoard {
  constructor() {
    this.players = [];
  }

  static addPlayerTo(board) {
    return () => {
      const newPlayer = document.getElementById('playerName');
      const isValidPlayer = validate('player', { newPlayer, board });

      if (!isValidPlayer) {
        newPlayer.value = '';
        return;
      };

      const player = new Player(newPlayer.value);
      board.players.push(player);

      const scoreboard = document.getElementById('scoreboard');
      const id = `${player.name}Lane`;
      const lane = player.createScoreLane();
      scoreboard.appendChild(lane);

      newPlayer.value = '';

    }
  }
}

class Player {
  constructor(name) {
    this.name = name;
    this.firstRoll = null;/*integer between 0-10*/
    this.secondRoll = null;/*integer between 0 and (10 - this.firstRoll)*/
    this.score = 'score';
  }

  createScoreLane() {
    const lane = document.createElement('div');
    lane.setAttribute('id', `${this.name}Lane`);
    lane.setAttribute('class', 'row');

    for (let i = 0; i <= 10; i++) {
      const col = document.createElement('div');
      if (i === 0) {
        col.textContent = `${this.name}`;
        col.setAttribute('class', 'row');
      } else {
        col.textContent = `col${i}`;
        col.setAttribute('id', `col${i}`);
        col.setAttribute('class', 'col');
      }
      lane.appendChild(col);
    }

    return lane;
  }

  roll() {
    if (this.firstRoll === null) {
      this.firstRoll = getRandomIntInclusive(0, 10);
      return;
    }
  }
}

const scoreBoard = new ScoreBoard();
const addPlayerButton = document.getElementById('addPlayerButton');
addPlayerButton.addEventListener('mousedown', ScoreBoard.addPlayerTo(scoreBoard));
