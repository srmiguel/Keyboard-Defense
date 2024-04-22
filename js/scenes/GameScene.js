import { loadWords } from '../utilities/wordLoader.js';
import { config, words, wordTexts, player, typingWordIndex, isTyping } from '../config.js';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.image("sky", "assets/images/sky.png");
    this.load.image("player", "assets/images/player.png");
    loadWords(this, config.currentWave);
  }

  create() {
    const wordsText = this.cache.text.get("words");
    words = wordsText.split("\n");

    this.add.image(300, 450, "sky");

    this.livesText = this.add.text(570, 20, "Lives: " + config.lives, { fontSize: "24px", fill: "#fff" })
      .setOrigin(1, 0);

    this.waveText = this.add.text(30, 20, "Wave: " + config.currentWave, { fontSize: "24px", fill: "#fff" });

    player = this.physics.add.sprite(300, 800, "player").setScale(0.5);

    this.input.keyboard.on(
      "keydown",
      function (event) {
        const pressedKey = event.key.toLowerCase();

        if (!isTyping) {
          for (let i = 0; i < wordTexts.length; i++) {
            const wordText = wordTexts[i];
            if (wordText.text.toLowerCase().startsWith(pressedKey)) {
              typingWordIndex = i;
              isTyping = true;
              break;
            }
          }
        }

        if (isTyping && typingWordIndex !== -1) {
          const currentWordText = wordTexts[typingWordIndex];
          const currentWord = currentWordText.text.toLowerCase();
          const nextLetter = currentWord[0].toLowerCase();

          if (pressedKey === nextLetter) {
            const updatedWord = currentWord.substring(1);

            if (updatedWord === "") {
              currentWordText.destroy();
              wordTexts.splice(typingWordIndex, 1);
              typingWordIndex = -1;
              isTyping = false;
            }
          }
        }
      },
      this
    );

    for (let i = 0; i < words.length; i++) {
      const x = Phaser.Math.Between(20, 580);
      const delay = i * 1000;

      setTimeout(() => {
        const wordText = this.add.text(x, -50, words[i], { fontSize: "32px", fill: "#fff" })
          .setOrigin(0.5);

        this.physics.world.enable(wordText);
        wordText.body.setVelocityY(5);
        wordTexts.push(wordText);
      }, delay);
    }
  }

  update() {
    if (config.lives <= 0) {
      this.add.text(300, 450, "GAME OVER", { fontSize: "64px", fill: "#fff", align: "center" }).setOrigin(0.5);
      this.scene.pause();
      return;
    }

    const playerX = player.x;
    const playerY = player.y;

    for (let i = 0; i < wordTexts.length; i++) {
      const wordText = wordTexts[i];

      if (wordText.body && wordText.body.enable) {
        const directionX = playerX - wordText.x;
        const directionY = playerY - wordText.y;

        const length = Math.sqrt(directionX * directionX + directionY * directionY);

        wordText.x += directionX / length;
        wordText.y += directionY / length;

        if (Phaser.Geom.Intersects.RectangleToRectangle(player.getBounds(), wordText.getBounds())) {
          config.lives--;

          this.livesText.setText("Lives: " + config.lives);
          wordText.destroy();

          if (wordText.body) {
            wordText.body.enable = false;
          }

          if (config.lives <= 0) {
            this.add.text(300, 450, "GAME OVER", {
              fontSize: "64px",
              fill: "#fff",
            }).setOrigin(0.5);

            this.scene.pause();
            return;
          }
        }
      }
    }
  }
}

export default GameScene;
