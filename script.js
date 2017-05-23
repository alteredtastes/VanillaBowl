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

const getRollingPlayer = (board) => {
  const playerArr = board.players.map((player, i, arr) => {
    if (board.round === 10) board.finalRound = true;

    if (!board.finalRound) {
      if (player.isRolling && !player.rolledTwo) {
        return player;
      }
      if (player.isRolling && player.rolledTwo) {
        player.isRolling = false;
        player.rolledOne = false;
        player.rolledTwo = false;

        const newIndex = ((board.players.length - 1) === i) ? 0 : (i + 1);
        if (newIndex === 0) board.round++; // will need to put before finalRound bool above

        const nextPlayer = board.players[newIndex];
        return nextPlayer;
      }
    }

    // if (board.finalRound) {
    //   if (player.isRolling && player.rolledThree)
    // }

  });
  const rollingPlayers = playerArr.filter(p => p !== undefined);
  if (rollingPlayers.length > 1) throw new Error('More than one rolling players!');
  rollingPlayers[0].isRolling = true;
  return rollingPlayers[0];
}

const rollCurrentPlayer = (board) => {
  return () => {
    const rollingPlayer = getRollingPlayer(board);
    rollingPlayer.roll(board);
  }
}

const createGameControl = (board) => {
  return (e) => {
    const isValidGame = validate('start', { board });
    if (!isValidGame) return;

    board.players[0].isRolling = true;

    const controls = document.getElementById('controls');
    controls.innerHTML = '';

    const rollButton = document.createElement('button');
    rollButton.addEventListener('mousedown', rollCurrentPlayer(board));
    rollButton.textContent = 'Roll!';

    const spareButton = document.createElement('button');
    spareButton.addEventListener('mousedown', rollCurrentPlayer(board));
    spareButton.textContent = 'Roll Spare!';

    const strikeButton = document.createElement('button');
    strikeButton.addEventListener('mousedown', rollCurrentPlayer(board));
    strikeButton.textContent = 'Roll Strike!';

    appendChildren(controls, [ rollButton, spareButton, strikeButton ]);
  }
}

class ScoreBoard {
  constructor() {
    this.players = [];
    this.round = 1;
    this.finalRound = false;
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

  renderPoints(type, round, player) {
    const points = document.createElement('div');
    if (type === 'strike') points.textContent = 'X';
    if (type === 'spare') points.textContent = '/';
    if (type === 'none') points.textContent = player.getCurrentScore() || '#';
    points.setAttribute('class', 'points');
    round.appendChild(points);
    return;
  }

  update(player) {
    if (!this.finalRound) {
      const completedTurn = this.round === player.roundScores.length;
      if (completedTurn) {
        const round = document.getElementById(`${player.name}round${this.round}`);
        const scoreType = player.roundScores[this.round - 1].scoreType;

        if (scoreType === 'strike') {
          const firstRoll = document.getElementById(`${player.name}round${this.round}roll1`);
          firstRoll.textContent = 'X';
          this.renderPoints('strike', round);
        } else if (scoreType === 'spare') {
          const secondRoll = document.getElementById(`${player.name}round${this.round}roll0`);
          secondRoll.textContent = '/';
          this.renderPoints('spare', round);
        } else if (scoreType === 'none') {
          const secondRoll = document.getElementById(`${player.name}round${this.round}roll0`);
          secondRoll.textContent = player.rollTwo.toString();
          this.renderPoints('none', round, player);
        }
        return;
      }
      if (!completedTurn) {
        const firstRoll = document.getElementById(`${player.name}round${this.round}roll1`);
        firstRoll.textContent = player.rollOne.toString();
      }
    }
  }
}

class Player {
  constructor(name) {
    this.name = name;
    this.rollOne = null;
    this.rollTwo = null;
    this.rollThree = null;
    this.rolledOne = false;
    this.rolledTwo = false;
    this.rolledThree = false;
    this.roundScores = [];
    this.totalScore = 'totalScore';
    this.isRolling = false;
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
        const attrs = { id: `${this.name}round${i}`, class: 'round', name: `round${this.name}` };
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
        setAttributes(roll, { id: `${this.name}round${idx}roll${i}`, class: 'roll' });

        // only add 2 rolls for rounds 1-9
        if (i < 2) round.appendChild(roll);

        // add 3rd possible roll for round 10
        if (i === 2 && idx === 10) round.appendChild(roll);
      }
    });
  }

  roll(board) {
    if (!board.finalRound) {

      if (this.rolledOne) {
        this.rollTwo = getRandomIntInclusive(0, (10 - this.rollOne));
        const points = this.rollOne + this.rollTwo;
        const scoreType = points === 10 ? 'spare' : 'none';
        this.roundScores.push({ round: board.round, points , scoreType });
        this.rolledTwo = true;
      } else {
        // non-strike case
        this.rollOne = getRandomIntInclusive(0, 10);
        this.rolledOne = true;
        // strike case
        if (this.rollOne === 10) {
          this.rollTwo = 0;
          this.rolledTwo = true;
          const scoreType = 'strike';
          this.roundScores.push({ round: board.round, points: this.rollOne, scoreType });
        }
      }
    }

    board.update(this);
  }

  getCurrentScore() {
    return 'CrSc';
  }
}

const scoreBoard = new ScoreBoard();
const addPlayerButton = document.getElementById('addPlayerButton');
addPlayerButton.addEventListener('mousedown', ScoreBoard.addPlayerTo(scoreBoard));
startGameButton.addEventListener('mousedown', createGameControl(scoreBoard));
