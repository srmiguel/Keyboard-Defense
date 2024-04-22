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
    scene: [],
    lives: 3,
    currentWave: 1,
  };
  
  const words = [];
  const wordTexts = [];
  const player = null;
  let typingWordIndex = -1;
  let isTyping = false;
  
  export { config, words, wordTexts, player, typingWordIndex, isTyping };
  
