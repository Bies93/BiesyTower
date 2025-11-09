import Phaser from "phaser";
import "./style.css";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { UIScene } from "./scenes/UIScene";
import { baseGameConfig } from "./config/gameConfig";

function createGame() {
  console.log("main.ts: Creating Phaser game");
  const isDebug = new URLSearchParams(window.location.search).has("debug");
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "phaser-container",
    width: baseGameConfig.viewport.width,
    height: baseGameConfig.viewport.height,
    backgroundColor: baseGameConfig.colors.background,
    pixelArt: true,
    render: { pixelArt: true, antialias: false, roundPixels: true },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: baseGameConfig.physics.gravityY },
        debug: isDebug,
      },
    },
    scene: [BootScene, MenuScene, GameScene, UIScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  // eslint-disable-next-line no-new
  new Phaser.Game(config);
  console.log("Phaser.Game created");
}

createGame();
console.log("Game initialization complete");