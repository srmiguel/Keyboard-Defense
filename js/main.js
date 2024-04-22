import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import { config } from './config.js';

config.scene = [MenuScene, GameScene];

const game = new Phaser.Game(config);
