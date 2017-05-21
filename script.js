const validate = (type, o) => {
  let isValid = true;

  if (type === 'player') {
    const playerName = o.newPlayer.value;

    if ((o.board.players.length + 1) > 5) {
      isValid = false;
      window.alert('Too many players! Must be 1 to 5.');
    }

    o.board.players.forEach((existingPlayer) => {
      if (existingPlayer.name === playerName) {
        isValid = false;
        window.alert('Players cannot have the same names!');
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
    return (e) => {
      const newPlayer = document.getElementById('playerName');

      const isValidPlayer = validate('player', { newPlayer, board });

      if (isValidPlayer) {
        const player = new Player(newPlayer.value);
        board.players.push(player);
      }
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
