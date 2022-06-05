const pokemonPool = 151;

class Battlefield {
  constructor(pokemonOne, pokemonTwo) {
    this.pokemonOne = pokemonOne;
    this.pokemonTwo = pokemonTwo;
    this.roundOrder = this.determineFastest();
    this.gameOver = false;
  }

  init() {
    this.round();
  }

  determineFastest() {
    if (this.pokemonOne.base_speed > this.pokemonTwo.base_speed) {
      return [this.pokemonOne, this.pokemonTwo];
    } else if (this.pokemonOne.base_speed < this.pokemonTwo.base_speed) {
      return [this.pokemonTwo, this.pokemonOne];
    }
  }

  round() {
    console.log(this.roundOrder);

    this.shuffleMoves(this.pokemonOne.moves);
    this.shuffleMoves(this.pokemonTwo.moves);

    let pokemoOneMove = this.pokemonOne.moves[0];
    let pokemoTwoMove = this.pokemonTwo.moves[0];

    setTimeout(() => {
      if (!this.gameOver) {
        updatePrimaryCommentary(`${this.roundOrder[0].name} used ${pokemoOneMove.identifier}!`);
        this.roundOrder[1].calculateDamageReceived(pokemoOneMove);
      }
      this.gameOver ? null : this.updatePokemonTwoHealth(this.roundOrder[1]);
    }, 3000);

    setTimeout(() => {
      if (!this.gameOver) {
        updatePrimaryCommentary(`${this.roundOrder[1].name} used ${pokemoTwoMove.identifier}!`);
        this.roundOrder[0].calculateDamageReceived(pokemoTwoMove);
      }
      this.gameOver ? null : this.updatePokemonOneHealth(this.roundOrder[0]);
    }, 6000);

    // else {
    //   setTimeout(() => {
    //     if (!this.gameOver) {
    //       updatePrimaryCommentary(`${this.pokemonTwo.name} used ${pokemoTwoMove.identifier}!`);
    //       this.pokemonOne.calculateDamageReceived(pokemoTwoMove);
    //     }
    //     this.gameOver ? null : this.updatePokemonOneHealth(this.pokemonOne);
    //   }, 3000);

    //   setTimeout(() => {
    //     if (!this.gameOver) {
    //       updatePrimaryCommentary(`${this.pokemonOne.name} used ${pokemoOneMove.identifier}!`);
    //       this.pokemonTwo.calculateDamageReceived(pokemoOneMove);
    //     }
    //     this.gameOver ? null : this.updatePokemonTwoHealth(this.pokemonTwo);
    //   }, 6000);
    // }

    if (!this.gameOver) {
      setTimeout(() => {
        this.round();
      }, 7000);
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
    this.current_hp = response.stats[0].base_stat * 7;
    this.base_hp = response.stats[0].base_stat * 7;
    this.base_speed = response.stats[5].base_stat;
    this.type = handleTypes(response.types);
    this.moves = handleMove(response.moves);
    this.x = 50;
    this.y = 50;
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

  calculateDamageReceived(move) {
    if (this.isSuccesfullHit(move)) {
      let dmgMultiplier = 1;

      for (let i = 0; i < this.type.weakTo.length; i++) {
        if (move.type_id === this.type.weakTo[i]) {
          dmgMultiplier = dmgMultiplier * 2;
        }
      }
      for (let i = 0; i < this.type.resistantTo.length; i++) {
        if (move.type_id === this.type.resistantTo[i]) {
          dmgMultiplier = dmgMultiplier * 0.5;
        }
      }

      let damageTaken = move.power * dmgMultiplier;

      this.current_hp = this.current_hp - damageTaken;

      if (dmgMultiplier > 1) {
        updateSecondaryCommentary(
          `Its super effective! It does ${damageTaken} dmg to ${this.name}`
        );
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

  return { type: types, weakTo: weaknesses, resistantTo: resistances };
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

  createBattleContainer(battle.roundOrder[0], battle.roundOrder[1]);

  battle.round();
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
  let boundingClientRect = containerBattlefield.getBoundingClientRect();

  createTopHealthBar(pokemonTwo);

  const containerBattle = document.createElement("div");
  containerBattle.id = "container-battle";
  containerBattlefield.appendChild(containerBattle);

  const pokemonOneImg = document.createElement("img");
  pokemonOneImg.id = "pokemon-one-img";
  pokemonOneImg.style.top = pokemonOne.x + 115 + "px";
  pokemonOneImg.style.left = pokemonOne.y + "px";
  pokemonOneImg.src = pokemonOne.sprite_back;
  containerBattle.appendChild(pokemonOneImg);

  const pokemonTwoImg = document.createElement("img");
  pokemonTwoImg.id = "pokemon-two-img";
  pokemonTwoImg.style.top = pokemonTwo.x - 15 + "px";
  pokemonTwoImg.style.left = boundingClientRect.right - 200 + "px";
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
