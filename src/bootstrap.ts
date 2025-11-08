/**
 * Projekt-Bootstrap für "Icy Tower Modern"
 *
 * Dieses Modul kapselt die Erstellung der Phaser.Game-Instanz
 * und bindet die vorgesehenen Szenen und Basis-Konfiguration ein.
 */

import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { UIScene } from "./scenes/UIScene";
import { baseGameConfig } from "./config/gameConfig";

export function createGame(parentId: string = "app"): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: parentId,
    width: baseGameConfig.viewport.width,
    height: baseGameConfig.viewport.height,
    backgroundColor: baseGameConfig.colors.background,
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: baseGameConfig.physics.gravityY },
        debug: baseGameConfig.debug.physicsDebug,
      },
    },
    scene: [BootScene, MenuScene, GameScene, UIScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };

  // eslint-disable-next-line no-new
  return new Phaser.Game(config);
}