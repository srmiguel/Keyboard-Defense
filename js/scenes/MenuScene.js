class MenuScene extends Phaser.Scene {
    constructor() {
      super({ key: 'MenuScene' });
    }
  
    create() {
      this.add.text(300, 200, 'Keyboard Defense', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
  
      this.add.text(300, 300, 'Type the words to destroy them before they reach the bottom!', {
        fontSize: '24px',
        fill: '#fff',
        align: 'center',
        wordWrap: { width: 550, useAdvancedWrap: true },
      }).setOrigin(0.5);
  
      const startButton = this.add.text(300, 400, 'Start', { fontSize: '32px', fill: '#0f0', fontStyle: 'bold' })
        .setOrigin(0.5)
        .setInteractive();
  
      startButton.on('pointerover', () => startButton.setFill('#fff'));
      startButton.on('pointerout', () => startButton.setFill('#0f0'));
      startButton.on('pointerdown', () => this.scene.start('GameScene'));
    }
  }
  
  export default MenuScene;
  
