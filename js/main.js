// Menu Scene
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Display the game title
    this.add.text(300, 200, 'Keyboard Defense', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

    // Display game instructions with wrapping
    this.add.text(300, 300, 'Type the words to destroy them before they reach the bottom!', { 
      fontSize: '24px', 
      fill: '#fff', 
      align: 'center',
      wordWrap: { width: 550, useAdvancedWrap: true } // Wrap within the game width
    }).setOrigin(0.5);

    // Start button with hover effect
    const startButton = this.add.text(300, 400, 'Start', { 
      fontSize: '32px', 
      fill: '#0f0', 
      fontStyle: 'bold' // Make the text bold
    }).setOrigin(0.5);
    startButton.setInteractive();

    // Add hover effect
    startButton.on('pointerover', () => {
      startButton.setFill('#fff'); // Change text color to white on hover
    });

    startButton.on('pointerout', () => {
      startButton.setFill('#0f0'); // Change text color back to green when not hovered
    });

    // Add event listener to start button
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene'); // Start the game scene when the button is clicked
    });
  }
}

// Game Scene
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image("sky", "assets/images/sky.png"); // Load the sky image
    this.load.image("player", "assets/images/player.png"); // Load the player image
    loadWords(this, config.currentWave); // Load words for the current wave
  }

  create() {
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

    // Handle keyboard events
    this.input.keyboard.on(
      "keydown",
      function (event) {
        const pressedKey = event.key.toLowerCase();

        // Check if the player is currently typing any word
        if (!isTyping) {
          // Player is not typing any word, allow typing only if the pressed key matches the first letter of any word
          for (let i = 0; i < wordTexts.length; i++) {
            const wordText = wordTexts[i];
            if (wordText.text.toLowerCase().startsWith(pressedKey)) {
              // Found a word that starts with the pressed key
              typingWordIndex = i;
              isTyping = true; // Set the typing flag
              break;
            }
          }
        }

        if (isTyping && typingWordIndex !== -1) {
          // Player is currently typing a word
          const currentWordText = wordTexts[typingWordIndex];
          const currentWord = currentWordText.text.toLowerCase();
          const nextLetter = currentWord[0].toLowerCase();

          if (pressedKey === nextLetter || currentWord.length === 1) {
            // Remove the first letter of the word
            const updatedWord = currentWord.substring(1);
            currentWordText.setText(updatedWord);

            // If the word is empty, destroy it and update if there are more available
            if (updatedWord === "") {
              currentWordText.destroy();
              wordTexts.splice(typingWordIndex, 1); // Remove the word from the array
              typingWordIndex = -1; // Reset typing index
              isTyping = false; // Reset typing flag
              if (config.lives > 0 && wordTexts.length > 0) {
                // If there are more words available, allow typing any word
                return;
              }
            }
          } else {
            // The player made a mistake, add error handling logic here
          }
        } else {
          // The player pressed a key that doesn't match the first letter of any word
          // Handle the error or display a message to the player
        }
      },
      this
    );

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
  }

  update() {
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
        const wordSpeed = 1; // Define the (horizontal) speed of words
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
}

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
  autoCenter: Phaser.Scale.CENTER_BOTH,
  scene: [MenuScene, GameScene],
  lives: 3,
  currentWave: 1,
};

// Function to load words for the current wave
function loadWords(scene, wave) {
  scene.load.text("words", `assets/words/words${wave}.txt`);
}

// Global variables
let words = [];
let currentWord;
let wordTexts = [];
let fallSpeed = 5;
let player;
let typingWordIndex = -1;
let isTyping = false;

// Game initialization
const game = new Phaser.Game(config);
