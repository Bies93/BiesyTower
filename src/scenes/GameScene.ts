import Phaser from "phaser";
import { baseGameConfig } from "../config/gameConfig";
import { createPlayerStub } from "../core/player/Player";
import { createPlatformManagerStub, PlatformManager } from "../core/world/PlatformManager";
import { restartOverlayUi, transitionToMenu } from "../core/scene/SceneController";
import { BackgroundManager } from "../core/world/BackgroundManager";

/**
 * Core gameplay loop for the vertical runner prototype.
 */
export class GameScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private platformManager!: PlatformManager;
  private currentHeight = 0;
  private startY = 0;
  private isEnding = false;
  private backgroundManager!: BackgroundManager;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    console.log("GameScene: Creating game scene");
    const { width, height } = this.scale;
    this.isEnding = false;

    restartOverlayUi(this);
    this.backgroundManager = new BackgroundManager(this);
    this.backgroundManager.create();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.physics.world.setBounds(0, -Infinity, width, Infinity);

    this.player = createPlayerStub(this, width / 2, height - 80);
    this.startY = this.player.y;

    this.platformManager = createPlatformManagerStub(this);
    this.platformManager.initialize(this.startY);

    this.physics.add.collider(this.player, this.platformManager.getGroup());

    this.cameras.main.startFollow(this.player, false, 0.08, 0.08);
    this.cameras.main.setBackgroundColor(baseGameConfig.colors.background);
    this.cameras.main.fadeIn(250, 0, 0, 0);

    this.currentHeight = 0;
    this.game.events.emit("heightUpdate", this.currentHeight);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.isEnding = false;
      this.backgroundManager?.destroy();
    });
  }

  update(): void {
    if (!this.player || !this.cursors) {
      return;
    }

    this.backgroundManager?.update(this.cameras.main);

    const speed = 180;

    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up!) && this.player.body.blocked.down) {
      this.player.setVelocityY(-baseGameConfig.physics.jumpVelocity);
    }

    this.currentHeight = Math.max(0, this.startY - this.player.y);
    this.platformManager.update(this.cameras.main);
    this.game.events.emit("heightUpdate", this.currentHeight);

    const deathY = this.cameras.main.scrollY + this.scale.height + baseGameConfig.rules.deathMargin;
    if (this.player.y > deathY) {
      this.handleGameOver();
    }
  }

  public getCurrentHeight(): number {
    return this.currentHeight;
  }

  private handleGameOver(): void {
    if (this.isEnding) {
      return;
    }
    this.isEnding = true;
    console.log("GameScene: Player lost, transitioning to menu");
    this.game.events.emit("heightUpdate", 0);
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      transitionToMenu(this);
    });
  }
}
