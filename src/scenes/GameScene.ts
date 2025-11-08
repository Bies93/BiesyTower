import Phaser from "phaser";
import { baseGameConfig } from "../config/gameConfig";
import { createPlayerStub } from "../core/player/Player";
import { createPlatformManagerStub, PlatformManager } from "../core/world/PlatformManager";

/**
 * GameScene:
 * - Lauffähiger Icy Tower Prototyp:
 *   - Player-Platzhalter mit echter Bewegung
 *   - Infinite Platform Generation via PlatformManager
 *   - Kamera folgt vertikal
 *   - Death-Logic und Restart
 * - Alle "echten" Mechaniken werden in core/* abstrahiert.
 */
export class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private platformManager!: PlatformManager;
  private currentHeight: number = 0;
  private startY: number = 0;

  constructor() {
    super({ key: "GameScene" });
 }

  create(): void {
    console.log("GameScene: Creating game scene");
    const { width, height } = this.scale;

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Unlimited vertical world
    this.physics.world.setBounds(0, -Infinity, width, Infinity);

    // Player-Stub aus Core-Layer
    this.player = createPlayerStub(this, width / 2, height - 80);
    this.startY = this.player.y;

    // Platform Manager mit initialer Generierung
    this.platformManager = createPlatformManagerStub(this);
    this.platformManager.initialize(this.startY);

    // Kollision mit allen generierten Plattformen
    this.physics.add.collider(this.player, this.platformManager.getGroup());

    // Kamera folgt dem Spieler
    this.cameras.main.startFollow(this.player, false, 0.08, 0.08);
    this.cameras.main.setBackgroundColor(baseGameConfig.colors.background);

    // Score system
    this.currentHeight = 0;
  }

  update(): void {
    const speed = 180;

    // Movement
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // Jump
    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up!) &&
      this.player.body.blocked.down
    ) {
      this.player.setVelocityY(-baseGameConfig.physics.jumpVelocity);
    }

    // Update height tracking
    this.currentHeight = Math.max(0, this.startY - this.player.y);

    // Update platform manager
    this.platformManager.update(this.cameras.main);

    // Game Over: Wenn Spieler zu weit nach unten fällt
    const deathY = this.cameras.main.scrollY + this.scale.height + baseGameConfig.rules.deathMargin;
    if (this.player.y > deathY) {
      this.scene.start("MenuScene");
    }

    // Update UI (传递到 UIScene via Event-System)
    this.events.emit('heightUpdate', this.currentHeight);
  }

  public getCurrentHeight(): number {
    return this.currentHeight;
  }
}