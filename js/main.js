// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 900,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game on the browser window's center
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  lives: 3,
  currentWave: 1, // Add a property for the current wave
};

// Game initialization
const game = new Phaser.Game(config);

let words = [];
let currentWord;
let wordTexts = []; // Array to store all word texts
let fallSpeed = 5; // Adjust the fall speed as necessary
let player;
let typingWordIndex = -1; // Index of the word currently being typed by the player

// Function to preload game resources
function preload() {
  this.load.image("sky", "assets/images/sky.png"); // Load the sky image
  this.load.image("player", "assets/images/player.png"); // Load the player image
  loadWords(this, config.currentWave); // Load words for the current wave
}

// Function to load words for the current wave
function loadWords(scene, wave) {
  scene.load.text("words", `assets/words/words${wave}.txt`);
}

// Function to create game elements
function create() {
  const wordsText = this.cache.text.get("words");
  words = wordsText.split("\n");

  // Add the sky
  this.add.image(300, 450, "sky"); // Center the sky horizontally and align it at the top

  // Show the number of lives and current wave
  this.livesText = this.add
    .text(570, 20, "Lives: " + config.lives, { fontSize: "24px", fill: "#fff" })
    .setOrigin(1, 0); // Align at the top right corner
  this.waveText = this.add.text(30, 20, "Wave: " + config.currentWave, {
    fontSize: "24px",
    fill: "#fff",
  }); // Display current wave

  // Add the player
  player = this.physics.add.sprite(300, 800, "player").setScale(0.5); // Create the player at the bottom center

  // Load and display words for the current wave
  for (let i = 0; i < words.length; i++) {
    const x = Phaser.Math.Between(20, 580); // Random x position
    const delay = i * 1000; // Delay between each word appearance
    setTimeout(() => {
      const wordText = this.add
        .text(x, -50, words[i], { fontSize: "32px", fill: "#fff" })
        .setOrigin(0.5);
      this.physics.world.enable(wordText); // Enable physics for the word
      wordText.body.setVelocityY(fallSpeed); // Set the fall speed
      wordTexts.push(wordText); // Add the word text to the array
    }, delay);
  }

  // Handle keyboard events
  this.input.keyboard.on(
    "keydown",
    function (event) {
      const pressedKey = event.key.toLowerCase();
      if (typingWordIndex === -1) {
        // Player is not typing any word, find the word that matches the pressed key
        for (let i = 0; i < wordTexts.length; i++) {
          const wordText = wordTexts[i];
          if (wordText.text.toLowerCase().startsWith(pressedKey)) {
            typingWordIndex = i;
            break;
          }
        }
      } else {
        // Player is currently typing a word
        const currentWordText = wordTexts[typingWordIndex];
        const currentWord = currentWordText.text.toLowerCase();
        const nextLetter = currentWord[0].toLowerCase();

        if (pressedKey === nextLetter) {
          // Remove the first letter of the word
          const updatedWord = currentWord.substring(1);
          currentWordText.setText(updatedWord);

          // If the word is empty, destroy it and update if there are more available
          if (updatedWord === "") {
            currentWordText.destroy();
            wordTexts.splice(typingWordIndex, 1); // Remove the word from the array
            typingWordIndex = -1; // Reset typing index
            if (config.lives > 0 && wordTexts.length > 0) {
              // If there are more words available, allow typing the next word
              typingWordIndex = 0;
            }
          }
        } else {
          // The player made a mistake, add error handling logic here
        }
      }
    },
    this
  );
}

// Game update function
function update() {
  // Check if the game is over
  if (config.lives <= 0) {
    // Show "GAME OVER" in the center of the screen
    this.add
      .text(300, 450, "GAME OVER", {
        fontSize: "64px",
        fill: "#fff",
        align: "center",
      })
      .setOrigin(0.5);

    // Pause the game update
    this.scene.pause();
    return; // Exit the update function early
  }

  // Get the current player position
  const playerX = player.x;
  const playerY = player.y;

  // Check collision with the player
  for (let i = 0; i < wordTexts.length; i++) {
    const wordText = wordTexts[i];
    if (wordText && wordText.body && wordText.body.enable) {
      // Check if the word and its body exist
      // Calculate the direction in which words should move
      const directionX = playerX - wordText.x;
      const directionY = playerY - wordText.y;

      // Normalize the direction
      const length = Math.sqrt(
        directionX * directionX + directionY * directionY
      );
      const wordSpeed = 1; // Define the speed of words
      const velocityX = directionX / length;
      const velocityY = directionY / length;

      // Apply horizontal speed to words to move them towards the player
      wordText.x += velocityX * wordSpeed;
      wordText.y += velocityY * wordSpeed;

      // Check collision with the player
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          player.getBounds(),
          wordText.getBounds()
        )
      ) {
        // Reduce the number of lives
        config.lives--;

        // Update lives text on the screen
        this.livesText.setText("Lives: " + config.lives);

        // Destroy the word
        wordText.destroy();

        // Disable physics for this word to prevent multiple collisions
        if (wordText.body) {
          // Check if the body still exists before accessing its properties
          wordText.body.enable = false;
        }

        // Check if all lives are lost
        if (config.lives <= 0) {
          // Show "GAME OVER" in the center of the screen
          this.add
            .text(300, 450, "GAME OVER", {
              fontSize: "64px",
              fill: "#fff",
              align: "center",
            })
            .setOrigin(0.5);

          // Pause the game update
          this.scene.pause();
          return; // Exit the update function early
        }
      }
    }
  }
}
