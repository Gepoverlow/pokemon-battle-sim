const pokemonPool = 151;

class Battlefield {
  constructor(pokemonOne, pokemonTwo) {
    this.pokemonOne = pokemonOne;
    this.pokemonTwo = pokemonTwo;
    this.roundOrder = [pokemonOne, pokemonTwo];
    this.gameOver = false;
  }

  init() {
    this.round();
  }

  assignElementIds() {
    this.roundOrder[0].elementId = "pokemon-one-img";
    this.roundOrder[1].elementId = "pokemon-two-img";
  }

  assignPositions() {
    let boundingClientRect = containerBattlefield.getBoundingClientRect();

    console.log(this.roundOrder);

    let oneStartingY = 165;
    let oneStartingX = 50;
    let twoStartingY = 40;
    let twoStartingX = boundingClientRect.right - 200;

    this.roundOrder[0].x = oneStartingX;
    this.roundOrder[0].y = oneStartingY;

    this.roundOrder[1].x = twoStartingX;
    this.roundOrder[1].y = twoStartingY;
  }

  determineFastest() {
    if (this.pokemonOne.base_speed > this.pokemonTwo.base_speed) {
      this.roundOrder = [this.pokemonOne, this.pokemonTwo];
    } else if (this.pokemonOne.base_speed < this.pokemonTwo.base_speed) {
      this.roundOrder = [this.pokemonTwo, this.pokemonOne];
    }
  }

  round() {
    this.shuffleMoves(this.pokemonOne.moves);
    this.shuffleMoves(this.pokemonTwo.moves);

    let firstPokemon = this.roundOrder[0];
    let secondPokemon = this.roundOrder[1];

    let firstPokemonMove = firstPokemon.moves[0];
    let secondPokemonMove = secondPokemon.moves[0];

    setTimeout(() => {
      if (!this.gameOver) {
        firstPokemon.attackAnimation(secondPokemon);
        updatePrimaryCommentary(`${firstPokemon.name} used ${firstPokemonMove.identifier}!`);
        secondPokemon.calculateDamageReceived(firstPokemon);
      }
      this.gameOver ? null : this.updatePokemonTwoHealth(secondPokemon);
    }, 2000);

    setTimeout(() => {
      if (!this.gameOver) {
        secondPokemon.attackAnimation(firstPokemon);
        updatePrimaryCommentary(`${secondPokemon.name} used ${secondPokemonMove.identifier}!`);
        firstPokemon.calculateDamageReceived(secondPokemon);
      }
      this.gameOver ? null : this.updatePokemonOneHealth(firstPokemon);
    }, 4000);

    if (!this.gameOver) {
      setTimeout(() => {
        this.round();
      }, 4200);
    } else {
      return;
    }
  }
  shuffleMoves = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  };

  updatePokemonOneHealth(pokemon) {
    const healthInfoOne = document.getElementById("health-info-one");
    healthInfoOne.textContent = `${pokemon.current_hp.toFixed(2)} / ${pokemon.base_hp}`;

    const healthBarOne = document.getElementById("bottom-health-bar");
    let newWidth = (pokemon.current_hp / pokemon.base_hp) * 100;
    healthBarOne.style.width = `${newWidth}%`;

    if (pokemon.current_hp <= 0) {
      this.gameOver = true;
      setTimeout(() => {
        containerBattlefield.classList.remove("fighting");
      }, 6000);

      healthInfoOne.textContent = "Fainted";
      healthBarOne.style.width = `0%`;

      setTimeout(() => {
        updatePrimaryCommentary(`${pokemon.name} has fainted`);
        this.checkWinner(this.pokemonOne, this.pokemonTwo);
      }, 2000);
    }
  }
  updatePokemonTwoHealth(pokemon) {
    const healthInfoTwo = document.getElementById("health-info-two");
    healthInfoTwo.textContent = `${pokemon.current_hp.toFixed(2)} / ${pokemon.base_hp}`;

    const healthBarTwo = document.getElementById("top-health-bar");
    let newWidth = (pokemon.current_hp / pokemon.base_hp) * 100;
    healthBarTwo.style.width = `${newWidth}%`;

    if (pokemon.current_hp <= 0) {
      this.gameOver = true;
      setTimeout(() => {
        containerBattlefield.classList.remove("fighting");
      }, 6000);
      healthInfoTwo.textContent = "Fainted";
      healthBarTwo.style.width = `0%`;
      setTimeout(() => {
        updatePrimaryCommentary(`${pokemon.name} has fainted`);
        this.checkWinner(this.pokemonOne, this.pokemonTwo);
      }, 2000);
    }
  }
  checkWinner(pokemonOne, pokemonTwo) {
    if (pokemonOne.current_hp > 0) {
      updateSecondaryCommentary(`${pokemonOne.name} wins!`);
    } else if (pokemonTwo.current_hp > 0) {
      updateSecondaryCommentary(`${pokemonTwo.name} wins!`);
    }
  }
}

class Pokemon {
  constructor(response) {
    this.name = response.name;
    this.sprite_front = response.sprites.front_default;
    this.sprite_back = response.sprites.back_default;
    this.current_hp = response.stats[0].base_stat.toFixed(2);
    this.base_hp = response.stats[0].base_stat.toFixed(2);
    this.base_speed = response.stats[5].base_stat;
    this.base_attack = response.stats[1].base_stat;
    this.base_s_attack = response.stats[3].base_stat;
    this.base_defence = response.stats[2].base_stat;
    this.base_s_defence = response.stats[4].base_stat;
    this.type = handleTypes(response.types);
    this.moves = handleMove(response.moves);
    this.x = undefined;
    this.y = undefined;
    this.elementId = undefined;
  }

  attackAnimation(defendingPokemon) {
    let attackPositionX = defendingPokemon.x;
    let attackPositionY = defendingPokemon.y;

    this.x = attackPositionX;
    this.y = attackPositionY;

    let attackingPokemon = document.getElementById(`${this.elementId}`);

    attackingPokemon.style.top = this.y + "px";
    attackingPokemon.style.left = this.x + "px";

    setTimeout(() => {
      this.bounceBackAnimation();
    }, 1000);
  }

  damageReceivedAnimation() {}

  bounceBackAnimation() {
    const adj = -50;

    let midFieldPosition = containerBattlefield.clientWidth / 2 + adj;

    if (this.elementId === "pokemon-one-img") {
      let randomXPosition = randomIntFromInterval(adj, midFieldPosition);
      let randomYPosition = randomIntFromInterval(adj, containerBattlefield.clientHeight + adj);

      this.x = randomXPosition;
      this.y = randomYPosition;

      let attackingPokemon = document.getElementById(`${this.elementId}`);

      attackingPokemon.style.left = this.x + "px";
      attackingPokemon.style.top = this.y + "px";
    } else {
      let randomXPosition = randomIntFromInterval(
        midFieldPosition + adj,
        containerBattlefield.clientWidth + adj
      );
      let randomYPosition = randomIntFromInterval(adj, containerBattlefield.clientHeight + adj);

      this.x = randomXPosition;
      this.y = randomYPosition;

      let attackingPokemon = document.getElementById(`${this.elementId}`);

      attackingPokemon.style.left = this.x + "px";
      attackingPokemon.style.top = this.y + "px";
    }
  }

  isSuccesfullHit(move) {
    const rng = Math.floor(Math.random() * 100);
    if (rng <= move.accuracy) {
      return true;
    } else if (move.accuracy === null) {
      return true;
    } else {
      return false;
    }
  }

  calculateBaseDamage(attackingPokemon) {
    const attMove = attackingPokemon.moves[0];

    if (attMove.damage_class_id === 2) {
      return (attMove.power * (attackingPokemon.base_attack / this.base_defence)) / 50 + 2;
    } else if (attMove.damage_class_id === 3) {
      return (attMove.power * (attackingPokemon.base_s_attack / this.base_s_defence)) / 50 + 2;
    }
  }

  calculateDamageReceived(attackingPokemon) {
    if (this.isSuccesfullHit(attackingPokemon.moves[0])) {
      let dmgMultiplier = 1;

      for (let i = 0; i < this.type.weakTo.length; i++) {
        if (attackingPokemon.moves[0].type_id === this.type.weakTo[i]) {
          dmgMultiplier = dmgMultiplier * 2;
        }
      }
      for (let i = 0; i < this.type.resistantTo.length; i++) {
        if (attackingPokemon.moves[0].type_id === this.type.resistantTo[i]) {
          dmgMultiplier = dmgMultiplier * 0.5;
        }
      }
      //
      for (let i = 0; i < this.type.immuneTo.length; i++) {
        if (attackingPokemon.moves[0].type_id === this.type.immuneTo[i]) {
          dmgMultiplier = dmgMultiplier * 0;
        }
      }

      //

      const baseDamage = this.calculateBaseDamage(attackingPokemon).toFixed(2);

      const damageTaken = baseDamage * dmgMultiplier;

      this.current_hp = this.current_hp - damageTaken;

      if (dmgMultiplier > 1) {
        updateSecondaryCommentary(
          `Its super effective! It does ${damageTaken} dmg to ${this.name}`
        );
      } else if (dmgMultiplier === 0) {
        updateSecondaryCommentary(`It doesnt affect ${this.name}...`);
      } else if (dmgMultiplier < 1) {
        updateSecondaryCommentary(
          `Its not very effective... It does ${damageTaken} dmg to ${this.name}`
        );
      } else {
        updateSecondaryCommentary(`It does ${damageTaken} dmg to ${this.name}`);
      }
    } else {
      updateSecondaryCommentary(`Oh no! It misses!`);
    }
  }
}
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function handleTypes(responseTypes) {
  const types = [];

  for (let i = 0; i < responseTypes.length; i++) {
    types.push(responseTypes[i].type.name);
  }
  const weaknesses = [];

  for (let i = 0; i < types.length; i++) {
    if (types[i] === "normal") {
      weaknesses.push(2);
    } else if (types[i] === "fighting") {
      weaknesses.push(3, 14, 18);
    } else if (types[i] === "flying") {
      weaknesses.push(13, 15, 6);
    } else if (types[i] === "poison") {
      weaknesses.push(5, 14);
    } else if (types[i] === "ground") {
      weaknesses.push(11, 12, 15);
    } else if (types[i] === "rock") {
      weaknesses.push(11, 12, 2, 5, 9);
    } else if (types[i] === "bug") {
      weaknesses.push(10, 3, 6);
    } else if (types[i] === "ghost") {
      weaknesses.push(8, 17);
    } else if (types[i] === "steel") {
      weaknesses.push(10, 2, 5);
    } else if (types[i] === "fire") {
      weaknesses.push(11, 5, 6);
    } else if (types[i] === "water") {
      weaknesses.push(12, 13);
    } else if (types[i] === "grass") {
      weaknesses.push(10, 15, 4);
    } else if (types[i] === "electric") {
      weaknesses.push(5);
    } else if (types[i] === "psychic") {
      weaknesses.push(7, 8, 17);
    } else if (types[i] === "ice") {
      weaknesses.push(10, 2, 6, 9);
    } else if (types[i] === "dragon ") {
      weaknesses.push(15, 16, 18);
    } else if (types[i] === "dark") {
      weaknesses.push(2, 7, 18);
    } else if (types[i] === "fairy") {
      weaknesses.push(4, 9);
    }
  }

  const resistances = [];

  for (let i = 0; i < types.length; i++) {
    if (types[i] === "normal") {
      resistances.push(null);
    } else if (types[i] === "fighting") {
      resistances.push(7, 6, 17);
    } else if (types[i] === "flying") {
      resistances.push(12, 2, 7);
    } else if (types[i] === "poison") {
      resistances.push(12, 2, 4, 7);
    } else if (types[i] === "ground") {
      resistances.push(4, 6, 18);
    } else if (types[i] === "rock") {
      resistances.push(1, 10, 4, 3);
    } else if (types[i] === "bug") {
      resistances.push(12, 2, 5);
    } else if (types[i] === "ghost") {
      resistances.push(4, 7);
    } else if (types[i] === "steel") {
      resistances.push(1, 12, 15, 3, 14, 7, 6, 16, 9, 18);
    } else if (types[i] === "fire") {
      resistances.push(10, 12, 15, 7, 9, 18);
    } else if (types[i] === "water") {
      resistances.push(10, 11, 15, 9);
    } else if (types[i] === "grass") {
      resistances.push(11, 12, 13, 5);
    } else if (types[i] === "electric") {
      resistances.push(13, 3, 9);
    } else if (types[i] === "psychic") {
      resistances.push(2, 14);
    } else if (types[i] === "ice") {
      resistances.push(15);
    } else if (types[i] === "dragon ") {
      resistances.push(10, 11, 12, 13);
    } else if (types[i] === "dark") {
      resistances.push(8, 17);
    } else if (types[i] === "fairy") {
      resistances.push(2, 7, 17);
    }
  }

  const immunities = [];

  for (let i = 0; i < types.length; i++) {
    if (types[i] === "normal") {
      immunities.push(8);
    } else if (types[i] === "fighting") {
      immunities.push(null);
    } else if (types[i] === "flying") {
      immunities.push(5);
    } else if (types[i] === "poison") {
      immunities.push(null);
    } else if (types[i] === "ground") {
      immunities.push(13);
    } else if (types[i] === "rock") {
      immunities.push(null);
    } else if (types[i] === "bug") {
      immunities.push(null);
    } else if (types[i] === "ghost") {
      immunities.push(1, 2);
    } else if (types[i] === "steel") {
      immunities.push(4);
    } else if (types[i] === "fire") {
      immunities.push(null);
    } else if (types[i] === "water") {
      immunities.push(null);
    } else if (types[i] === "grass") {
      immunities.push(null);
    } else if (types[i] === "electric") {
      immunities.push(null);
    } else if (types[i] === "psychic") {
      immunities.push(null);
    } else if (types[i] === "ice") {
      immunities.push(null);
    } else if (types[i] === "dragon ") {
      immunities.push(null);
    } else if (types[i] === "dark") {
      immunities.push(14);
    } else if (types[i] === "fairy") {
      immunities.push(16);
    }
  }

  return { type: types, weakTo: weaknesses, resistantTo: resistances, immuneTo: immunities };
}

function handleMove(responseMoves) {
  const allResponseMoves = [];

  for (let i = 0; i < responseMoves.length; i++) {
    allResponseMoves.push(responseMoves[i].move.name);
  }

  return allResponseMoves;
}

async function getPokemon() {
  let randomNumber = Math.floor(Math.random() * pokemonPool);

  const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomNumber}`);
  const response = await data.json();

  return response;
}

async function assignMoves(pokemon) {
  const allMoves = await getMoves();
  const possibleMoves = allMoves.filter((move) => {
    return move.power;
  });
  const pokemonMoves = pokemon.moves;

  let commonMoves = possibleMoves.filter((x) => pokemonMoves.includes(x.identifier));

  pokemon.moves = commonMoves;
  // pokemon.moves = randomMoves(commonMoves);
}

async function createBattleField() {
  const pokemonOne = new Pokemon(await getPokemon());
  const pokemonTwo = new Pokemon(await getPokemon());

  await assignMoves(pokemonOne);
  await assignMoves(pokemonTwo);

  const battle = new Battlefield(pokemonOne, pokemonTwo);

  battle.determineFastest();
  battle.assignPositions();
  battle.assignElementIds();

  createBattleContainer(battle.roundOrder[0], battle.roundOrder[1]);

  battle.round();
  console.log(battle);
}

async function getMoves() {
  const data = await fetch("moves.json");
  const response = await data.json();

  return response;
}

///////////////////////////////////////////////////////////////////////////////// DOM STUFF
const containerAll = document.querySelector(".container-all");

const containerBattlefield = document.querySelector(".container-battlefield");
containerBattlefield.textContent = "Click me to start a new match!";

const primaryCommentary = document.createElement("div");
containerAll.appendChild(primaryCommentary);
const secondaryCommentary = document.createElement("div");
containerAll.appendChild(secondaryCommentary);

function updatePrimaryCommentary(string) {
  primaryCommentary.textContent = string;
}

function updateSecondaryCommentary(string) {
  secondaryCommentary.textContent = string;
}

function createBattleContainer(pokemonOne, pokemonTwo) {
  createTopHealthBar(pokemonTwo);

  const containerBattle = document.createElement("div");
  containerBattle.id = "container-battle";
  containerBattlefield.appendChild(containerBattle);

  const pokemonOneImg = document.createElement("img");
  pokemonOneImg.id = "pokemon-one-img";
  pokemonOneImg.style.top = pokemonOne.y + "px";
  pokemonOneImg.style.left = pokemonOne.x + "px";
  // pokemonOneImg.style.top = pokemonOne.x + 115 + "px";
  // pokemonOneImg.style.left = pokemonOne.y + "px";
  pokemonOneImg.src = pokemonOne.sprite_back;
  containerBattle.appendChild(pokemonOneImg);

  const pokemonTwoImg = document.createElement("img");
  pokemonTwoImg.id = "pokemon-two-img";
  pokemonTwoImg.style.top = pokemonTwo.y + "px";
  pokemonTwoImg.style.left = pokemonTwo.x + "px";
  // pokemonTwoImg.style.top = pokemonTwo.x - 15 + "px";
  // pokemonTwoImg.style.left = boundingClientRect.right - 200 + "px";
  pokemonTwoImg.src = pokemonTwo.sprite_front;
  containerBattle.appendChild(pokemonTwoImg);

  createBottomHealthBar(pokemonOne);
}

function createTopHealthBar(pokemon) {
  const healthBar = document.createElement("div");
  healthBar.id = "top-health-bar";
  containerBattlefield.appendChild(healthBar);

  displayPokemonTwoVitals(pokemon, healthBar);
}

function createBottomHealthBar(pokemon) {
  const healthBar = document.createElement("div");
  healthBar.id = "bottom-health-bar";
  containerBattlefield.appendChild(healthBar);

  displayPokemonOneVitals(pokemon, healthBar);
}

function displayPokemonOneVitals(pokemon, bar) {
  const pokemonVitalsContainer = document.createElement("div");
  pokemonVitalsContainer.id = "pokemon-one-vitals";

  const healthBarName = document.createElement("span");
  healthBarName.textContent = pokemon.name;
  healthBarName.style.marginRight = "20px";
  pokemonVitalsContainer.appendChild(healthBarName);

  const healthInfo = document.createElement("span");
  healthInfo.id = "health-info-one";
  healthInfo.textContent = `${pokemon.current_hp} / ${pokemon.base_hp}`;
  pokemonVitalsContainer.appendChild(healthInfo);

  bar.appendChild(pokemonVitalsContainer);
}

function displayPokemonTwoVitals(pokemon, bar) {
  const pokemonVitalsContainer = document.createElement("div");
  pokemonVitalsContainer.id = "pokemon-two-vitals";

  const healthBarName = document.createElement("span");
  healthBarName.textContent = pokemon.name;
  healthBarName.style.marginRight = "20px";
  pokemonVitalsContainer.appendChild(healthBarName);

  const healthInfo = document.createElement("span");
  healthInfo.id = "health-info-two";
  healthInfo.textContent = `${pokemon.current_hp} / ${pokemon.base_hp}`;
  pokemonVitalsContainer.appendChild(healthInfo);

  bar.appendChild(pokemonVitalsContainer);
}

containerBattlefield.addEventListener("click", () => {
  if (!containerBattlefield.classList.contains("fighting")) {
    containerBattlefield.classList.add("fighting");
    containerBattlefield.innerHTML = "";
    createBattleField();
  }
});

///////////////
getMoves();
