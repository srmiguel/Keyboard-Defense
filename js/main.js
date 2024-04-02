// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 900,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 0 },
          debug: false
      }
  },

  autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game on the browser window's center
  scene: {
      preload: preload,
      create: create,
      update: update
  },
  lives: 3
};

// Game initialization
const game = new Phaser.Game(config);

let words = [];
let currentWord;
let wordText;
let fallSpeed = 20; // Adjust the fall speed as necessary
let lastWordTime = 0;
let player;

// Function to preload game resources
function preload() {
  this.load.image('sky', 'assets/images/sky.png'); // Load the sky image
  this.load.text('words', 'assets/words.txt'); // Load the word list
  this.load.image('player', 'assets/images/player.png'); // Load the player image
}

// Function to create game elements
function create() {
  const wordsText = this.cache.text.get('words');
  words = wordsText.split('\n');

  // Add the sky
  this.add.image(300, 450, 'sky'); // Center the sky horizontally and align it at the top

  // Show the number of lives
  this.livesText = this.add.text(570, 20, 'Lives: ' + config.lives, { fontSize: '24px', fill: '#fff' }).setOrigin(1, 0); // Align at the top right corner

  // Add the player
  player = this.physics.add.sprite(300, 800, 'player').setScale(0.5); // Create the player at the bottom center

  // Handle keyboard events
  this.input.keyboard.on('keydown', function (event) {
    const pressedKey = event.key.toLowerCase();
    const nextLetter = currentWord[0].toLowerCase();

    if (pressedKey === nextLetter) {
      // Remove the first letter of the word
      currentWord = currentWord.substring(1);
      wordText.setText(currentWord);

      // If the word is empty, destroy it and update if there are more available
      if (currentWord === '') {
        wordText.destroy();
        if (config.lives > 0) {
          updateWord(this);
        }
      }
    } else {
      // The player made a mistake, add error handling logic here
    }
  }, this);

  updateWord(this);
}

// Function to update the game state
function update() {
    // Get the current player position
    const playerX = player.x;
    const playerY = player.y;

    // Check if there's a word on screen
    if (wordText) {
        // Calculate the direction the words should move towards
        const directionX = playerX - wordText.x;
        const directionY = playerY - wordText.y;

        // Normalize the direction
        const length = Math.sqrt(directionX * directionX + directionY * directionY);
        const wordSpeed = 1; // Define the speed of the words
        const speedX = directionX / length;
        const speedY = directionY / length;

        // Apply horizontal speed to move the words towards the player
        wordText.x += speedX * wordSpeed;
        wordText.y += speedY * wordSpeed;

        // Check collision with the player
        if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), wordText.getBounds())) {
            // Reduce the number of lives
            config.lives--;

            // Update the lives text on screen
            this.livesText.setText('Lives: ' + config.lives);

            // Destroy the word
            wordText.destroy();

            // Restart the game if the player runs out of lives
            if (config.lives <= 0) {
                // Show "GAME OVER" in the center of the screen
                this.add.text(300, 450, 'GAME OVER', { fontSize: '64px', fill: '#fff', align: 'center' }).setOrigin(0.5);
                
                // Stop updating the game
                this.scene.pause();
            } else {
                // Create a new word if the player still has lives
                updateWord(this);
            }
        }
    }
}

// Function to get a random word
function getRandomWord() {
  const index = Phaser.Math.RND.between(0, words.length - 1);
  return words[index];
}

// Function to update the displayed word
function updateWord(scene) {
  currentWord = getRandomWord();
  if (wordText) {
    wordText.destroy();
  }
  wordText = scene.add.text(Phaser.Math.Between(20, 580), -50, currentWord, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5); 
  scene.physics.world.enable(wordText); // Enable physics for the word
  wordText.body.setVelocityY(fallSpeed); // Set the fall speed
}
