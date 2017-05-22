const validate = (type, o) => {
  let isValid = true;
  if (type === 'player') {
    const playerName = o.newPlayer.value;

    if (!playerName) {
      isValid = false;
      return;
    }

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

const setAttributes = (el, attrs) => {
  for (let key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
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
    const attrs = { id: `${this.name}Lane`, class: 'lane' };
    setAttributes(lane, attrs);

    for (let i = 0; i <= 10; i++) {
      const round = document.createElement('div');

      if (i === 0) {
        setAttributes(round, { class: 'playerName' });
        round.textContent = `${this.name}`;
      } else {
        const attrs = { id: `round${i}`, class: 'round', name: `round${this.name}` };
        setAttributes(round, attrs);
        round.textContent = `${i}`;
      }
      lane.appendChild(round);
    }

    this.createSubLanes(lane);
    return lane;
  }

  createSubLanes(lane) {
    lane.childNodes.forEach((round, idx) => {
      for (let i = 0; i <= 2; i++) {
        if (idx === 0) break;
        const roll = document.createElement('div');
        setAttributes(roll, { id: `round${idx}roll${i}`, class: 'roll' });
        if (i < 2) round.appendChild(roll);
        if (i === 2 && idx === 10) round.appendChild(roll);
      }
    });
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
