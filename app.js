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

  checkForDittos() {
    const struggle = {
      id: 165,
      identifier: "struggle",
      generation_id: 1,
      type_id: 1,
      power: 50,
      pp: 1,
      accuracy: null,
      priority: 0,
      target_id: 8,
      damage_class_id: 2,
      effect_id: 255,
      effect_chance: null,
      contest_type_id: 1,
      contest_effect_id: 1,
      super_contest_effect_id: 5,
    };

    if (!this.roundOrder[0].moves.length && !this.roundOrder[1].moves.length) {
      this.roundOrder[0].moves.push(struggle);
      this.roundOrder[1].moves.push(struggle);
    } else if (!this.roundOrder[1].moves.length) {
      this.roundOrder[1].moves = this.roundOrder[0].moves;
    } else if (!this.roundOrder[0].moves.length) {
      this.roundOrder[0].moves = this.roundOrder[1].moves;
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
      }, 4100);
    } else {
      return;
    }
  }

  shuffleMoves(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  updatePokemonOneHealth(pokemon) {
    const healthInfoOne = document.getElementById("health-info-one");
    healthInfoOne.textContent = `${pokemon.current_hp} / ${pokemon.base_hp}`;

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
    healthInfoTwo.textContent = `${pokemon.current_hp} / ${pokemon.base_hp}`;

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
    if (this.moves[0].damage_class_id === 2) {
      this.physicalAttack(defendingPokemon);
    } else {
      this.specialAttack(defendingPokemon);
    }
  }

  physicalAttack(defendingPokemon) {
    let attackPositionX = defendingPokemon.x;
    let attackPositionY = defendingPokemon.y;
    this.x = attackPositionX;
    this.y = attackPositionY;
    let attackingPokemon = document.getElementById(`${this.elementId}`);
    attackingPokemon.style.top = this.y + "px";
    attackingPokemon.style.left = this.x + "px";

    this.handlePhysicalMove(attackPositionX, attackPositionY, this.moves[0].type_id);

    setTimeout(() => {
      this.bounceBackAnimation();
    }, 1000);
  }

  specialAttack(defendingPokemon) {
    let attackPositionX = defendingPokemon.x;
    let attackPositionY = defendingPokemon.y;

    this.handleSpecialMove(attackPositionX, attackPositionY, this.moves[0].type_id);
  }

  handleSpecialMove(x, y, attType) {
    let battleContainer = document.querySelector(".container-battlefield");
    let typeImg = document.createElement("img");
    typeImg.className = "type-img";
    typeImg.src = `./type-images/${attType}.png`;

    typeImg.style.top = this.y + 25 + "px";
    typeImg.style.left = this.x + 25 + "px";

    battleContainer.appendChild(typeImg);

    setTimeout(() => {
      typeImg.style.top = y + 25 + "px";
      typeImg.style.left = x + 25 + "px";
    }, 500);

    setTimeout(() => {
      battleContainer.removeChild(typeImg);
    }, 1500);
  }

  handlePhysicalMove(x, y, attType) {
    let battleContainer = document.querySelector(".container-battlefield");
    let typeImg = document.createElement("img");
    typeImg.className = "type-img";
    typeImg.src = `./type-images/${attType}.png`;

    typeImg.style.top = y + 25 + "px";
    typeImg.style.left = x + 25 + "px";

    setTimeout(() => {
      battleContainer.appendChild(typeImg);
    }, 1000);

    setTimeout(() => {
      battleContainer.removeChild(typeImg);
    }, 1500);
  }

  bounceBackAnimation() {
    let midFieldPosition = containerBattlefield.clientWidth / 2;

    if (this.elementId === "pokemon-one-img") {
      let randomXPosition = randomIntFromInterval(0, midFieldPosition - 100);
      let randomYPosition = randomIntFromInterval(35, containerBattlefield.clientHeight - 125);

      this.x = randomXPosition;
      this.y = randomYPosition;

      let attackingPokemon = document.getElementById(`${this.elementId}`);

      attackingPokemon.style.left = this.x + "px";
      attackingPokemon.style.top = this.y + "px";
    } else {
      let randomXPosition = randomIntFromInterval(
        midFieldPosition,
        containerBattlefield.clientWidth - 100
      );
      let randomYPosition = randomIntFromInterval(35, containerBattlefield.clientHeight - 125);

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

  checkForStab(attackingPokemon) {
    const types = [
      "normal",
      "fighting",
      "flying",
      "poison",
      "ground",
      "rock",
      "bug",
      "ghost",
      "steel",
      "fire",
      "water",
      "grass",
      "electric",
      "psychic",
      "ice",
      "dragon",
      "dark",
      "fairy",
    ];
    const pType = attackingPokemon.type.type;
    const pMove = attackingPokemon.moves[0].type_id;

    for (let i = 0; i < types.length; i++) {
      if (pType.includes(types[i]) && pMove === i + 1) {
        return true;
      }
    }
  }

  rollCriticalChance() {
    const rng = Math.floor(Math.random() * 101);
    let criticalMultiplier = 1;

    if (rng <= 6) {
      criticalMultiplier = 2;
    }

    return criticalMultiplier;
  }

  calculateDamageReceived(attackingPokemon) {
    if (this.isSuccesfullHit(attackingPokemon.moves[0])) {
      let typeMultiplier = 1;

      for (let i = 0; i < this.type.weakTo.length; i++) {
        if (attackingPokemon.moves[0].type_id === this.type.weakTo[i]) {
          typeMultiplier = typeMultiplier * 2;
        }
      }
      for (let i = 0; i < this.type.resistantTo.length; i++) {
        if (attackingPokemon.moves[0].type_id === this.type.resistantTo[i]) {
          typeMultiplier = typeMultiplier * 0.5;
        }
      }

      for (let i = 0; i < this.type.immuneTo.length; i++) {
        if (attackingPokemon.moves[0].type_id === this.type.immuneTo[i]) {
          typeMultiplier = typeMultiplier * 0;
        }
      }

      const stab = this.checkForStab(attackingPokemon) ? 2 : 1;
      const criticalMultiplier = this.rollCriticalChance();
      const baseDamage = this.calculateBaseDamage(attackingPokemon);
      const damageTaken = baseDamage * criticalMultiplier * stab * typeMultiplier;

      const roundedDamage = (Math.round(damageTaken * 100) / 100).toFixed(2);

      this.current_hp = this.current_hp - roundedDamage;
      this.current_hp = (Math.round(this.current_hp * 100) / 100).toFixed(2);

      if (typeMultiplier > 0 && criticalMultiplier > 1) {
        updateTertiaryCommentary("Critical Hit! ");
      } else {
        updateTertiaryCommentary("-");
      }

      if (typeMultiplier > 1) {
        updateSecondaryCommentary(
          `Its super effective! It does ${roundedDamage} dmg to ${this.name}`
        );
      } else if (typeMultiplier === 0) {
        updateSecondaryCommentary(`It doesnt affect ${this.name}...`);
      } else if (typeMultiplier < 1) {
        updateSecondaryCommentary(
          `Its not very effective... It does ${roundedDamage} dmg to ${this.name}`
        );
      } else {
        updateSecondaryCommentary(`It does ${roundedDamage} dmg to ${this.name}`);
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

function handleNotFoundPokemons() {
  containerBattlefield.innerHTML = "";

  const unfoundMsg = document.createElement("span");
  unfoundMsg.id = "unfound-msg";
  unfoundMsg.textContent =
    "One or more pokemons were not found. Please check the Name or Id is correct!";
  containerBattlefield.appendChild(unfoundMsg);
}

async function getPokemon(aPokemonId) {
  const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${aPokemonId}`);
  if (data.status === 404) return;
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

async function createBattleField(aPokemonId, anotherPokemonId, container) {
  const responseOne = await getPokemon(aPokemonId);
  const responseTwo = await getPokemon(anotherPokemonId);

  if (responseOne && responseTwo) {
    const pokemonOne = new Pokemon(responseOne);
    const pokemonTwo = new Pokemon(responseTwo);

    await assignMoves(pokemonOne);
    await assignMoves(pokemonTwo);

    const battle = new Battlefield(pokemonOne, pokemonTwo);
    container.innerHTML = "";
    container.classList.add("fighting");

    battle.determineFastest();
    battle.assignPositions();
    battle.assignElementIds();
    battle.checkForDittos();

    createBattleContainer(battle.roundOrder[0], battle.roundOrder[1]);

    battle.round();
  } else {
    handleNotFoundPokemons();
  }
}

async function getMoves() {
  const data = await fetch("moves.json");
  const response = await data.json();

  return response;
}

///////////////////////////////////////////////////////////////////////////////// DOM STUFF
const containerAll = document.querySelector(".container-all");
const containerDescription = document.querySelector(".container-description");
const inputRandomFrom = document.getElementById("input-random-from");
const inputRandomTo = document.getElementById("input-random-to");
const buttonRandomFight = document.getElementById("button-random-fight");

const inputPickOne = document.getElementById("input-pick-one");
const inputPickTwo = document.getElementById("input-pick-two");
const buttonPickFight = document.getElementById("button-pick-fight");

const containerBattlefield = document.querySelector(".container-battlefield");

const primaryCommentary = document.createElement("span");
primaryCommentary.textContent = "-";
containerDescription.appendChild(primaryCommentary);
const secondaryCommentary = document.createElement("span");
secondaryCommentary.textContent = "-";
containerDescription.appendChild(secondaryCommentary);
const tertiaryCommentary = document.createElement("span");
tertiaryCommentary.textContent = "-";
containerDescription.appendChild(tertiaryCommentary);

function updatePrimaryCommentary(string) {
  primaryCommentary.textContent = string;
}

function updateSecondaryCommentary(string) {
  secondaryCommentary.textContent = string;
}

function updateTertiaryCommentary(string) {
  tertiaryCommentary.textContent = string;
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
  pokemonOneImg.src = pokemonOne.sprite_back;
  containerBattle.appendChild(pokemonOneImg);

  const pokemonTwoImg = document.createElement("img");
  pokemonTwoImg.id = "pokemon-two-img";
  pokemonTwoImg.style.top = pokemonTwo.y + "px";
  pokemonTwoImg.style.left = pokemonTwo.x + "px";
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

buttonRandomFight.addEventListener("click", () => {
  let fromValue = Number(inputRandomFrom.value);
  let toValue = Number(inputRandomTo.value);

  if (
    fromValue > 0 &&
    fromValue < 899 &&
    toValue > 0 &&
    toValue < 899 &&
    !containerBattlefield.classList.contains("fighting")
  ) {
    let firstRandomId = randomIntFromInterval(fromValue, toValue);
    let secondRandomId = randomIntFromInterval(fromValue, toValue);

    createBattleField(firstRandomId, secondRandomId, containerBattlefield);
  }
});

buttonPickFight.addEventListener("click", () => {
  let oneValue = inputPickOne.value;
  let twoValue = inputPickTwo.value;

  let trimmedValueOne = oneValue.trim().toLowerCase();
  let trimmedValueTwo = twoValue.trim().toLowerCase();

  if (!containerBattlefield.classList.contains("fighting")) {
    createBattleField(trimmedValueOne, trimmedValueTwo, containerBattlefield);
  }
});

///////////////
getMoves();
