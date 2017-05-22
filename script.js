const validate = (type, o) => {
  let isValid = true;
  const errors = [];

  switch (type) {
    case 'player':

      const playerName = o.newPlayer.value;
      if (!playerName) {
        isValid = false;
        return;
      }
      if (playerName.length > 10) {
        isValid = false;
        errors.push('Too many letters. Names must be less than 10 letters.');
      }
      if ((o.board.players.length + 1) > 5) {
        isValid = false;
        errors.push('Too many players! Must be 1 to 5.');
      }
      o.board.players.forEach(existingPlayer => {
        if (existingPlayer.name === playerName) {
          isValid = false;
          errors.push(`Players cannot have the same names. "${playerName}" is already taken.`);
        }
        return;
      });
      break;

    case 'start':
      if (o.board.players < 1) {
        isValid = false;
      }
      break;
  }

  const errMessage = `Error(s):\n- ${errors.join('\n- ')}`;
  if (errors.length > 0) window.alert(errMessage);
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

const appendChildren = (el, children) => {
  for (let i = 0; i < children.length; i++) {
    el.appendChild(children[i]);
  }
}

const rollCurrentPlayer = () => {
  return (e) => {
    console.log('roll current player')
  }
}

const createGameControl = (board) => {
  return (e) => {
    const isValidGame = validate('start', { board });
    if (!isValidGame) return;

    const controls = document.getElementById('controls');
    controls.innerHTML = '';

    const rollButton = document.createElement('button');
    rollButton.addEventListener('mousedown', rollCurrentPlayer);
    rollButton.textContent = 'Roll Random!';

    const spareButton = document.createElement('button');
    spareButton.addEventListener('mousedown', rollCurrentPlayer);
    spareButton.textContent = 'Roll Spare!';

    const strikeButton = document.createElement('button');
    strikeButton.addEventListener('mousedown', rollCurrentPlayer);
    strikeButton.textContent = 'Roll Strike!';

    appendChildren(controls, [ rollButton, spareButton, strikeButton ]);
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
    };
  }
}

class Player {
  constructor(name) {
    this.name = name;
    this.firstRoll = null;
    this.secondRoll = null;
    this.score = 'score';
  }

  createScoreLane() {
    const lane = document.createElement('div');
    const attrs = { id: `${this.name}Lane`, class: 'lane' };
    setAttributes(lane, attrs);

    for (let i = 0; i <= 10; i++) {
      const round = document.createElement('div');

      if (i === 0) {
        // create player name and control in first column
        setAttributes(round, { class: 'playerName' });
        round.textContent = `${this.name}`;
      } else {
        // create player's 10 rounds to be played
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

        // player name might not need sub lane. if so, could alternatively use let i = 1
        if (idx === 0) break;

        const roll = document.createElement('div');
        setAttributes(roll, { id: `round${idx}roll${i}`, class: 'roll' });

        // only add 2 rolls for rounds 1-9
        if (i < 2) round.appendChild(roll);

        // add 3rd possible roll for round 10
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
startGameButton.addEventListener('mousedown', createGameControl(scoreBoard));
