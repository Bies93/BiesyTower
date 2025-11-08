import Phaser from "phaser";
import { baseGameConfig } from "../../config/gameConfig";

/**
 * Core-Player-Modul (Stub, Phase 0)
 *
 * Ziele:
 * - Kapselt Player-Erstellung von der Scene-Implementierung
 * - Ermöglicht später:
 *   - States (Idle, Run, Jump, Wall-Jump, Fall)
 *   - Input-Abstraktion (Keyboard/Gamepad/Touch)
 *   - Animations- und Physik-Tuning zentral zu steuern
 */

export interface PlayerOptions {
  x: number;
  y: number;
}

export function createPlayerStub(
  scene: Phaser.Scene,
  x: number,
  y: number
): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
  const player = scene.physics.add
    .sprite(x, y, undefined as unknown as string)
    .setDisplaySize(24, 32);

  player.setTintFill(0xffffff);
  player.setCollideWorldBounds(true);
  player.setBounce(0);
  player.setDragX(800);
  player.setMaxVelocity(260, 900);
  player.body.setSize(16, 28).setOffset(4, 4);

  // Platzhalterfarbe via Graphics-Texture für klaren visuelle Marker
  const gfxKey = "__player_placeholder";
  if (!scene.textures.exists(gfxKey)) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(0, 0, 24, 32, 4);
    g.generateTexture(gfxKey, 24, 32);
    g.destroy();
  }
  player.setTexture(gfxKey);
  player.setTintFill(
    Phaser.Display.Color.HexStringToColor(baseGameConfig.colors.player).color
  );

  return player;
}