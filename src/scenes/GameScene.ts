import Phaser from "phaser";
import { baseGameConfig } from "../config/gameConfig";
import { createPlayerStub } from "../core/player/Player";
import {
  createPlatformManagerStub,
  PlatformManager,
  PlatformType,
} from "../core/world/PlatformManager";
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
  private jumpBufferTimer = 0;
  private coyoteTimer = 0;
  private canDoubleJump = true;
  private jumpKey!: Phaser.Input.Keyboard.Key;

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

    this.physics.add.collider(
      this.player,
      this.platformManager.getGroup(),
      this.handlePlatformCollision,
      undefined,
      this
    );

    this.cameras.main.startFollow(this.player, false, 0.08, 0.08);
    this.cameras.main.setBackgroundColor(baseGameConfig.colors.background);
    this.cameras.main.fadeIn(250, 0, 0, 0);

    this.currentHeight = 0;
    this.game.events.emit("heightUpdate", this.currentHeight);
    this.jumpKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.jumpBufferTimer = 0;
    this.coyoteTimer = 0;
    this.canDoubleJump = true;

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.isEnding = false;
      this.backgroundManager?.destroy();
    });
  }

  update(_time: number, delta: number): void {
    if (!this.player || !this.cursors) {
      return;
    }

    this.backgroundManager?.update(this.cameras.main);
    this.handleJumpLogic(delta);

    const speed = 180;

    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
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

  private handlePlatformCollision(
    _player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    platformSprite: Phaser.GameObjects.GameObject
  ): void {
    const platform = platformSprite as Phaser.Types.Physics.Arcade.ImageWithStaticBody;
    const type = platform.getData("platformType") as PlatformType | undefined;
    if (!type) {
      return;
    }

    if (type === "boost") {
      this.triggerBoostPlatform(platform);
    }
  }

  private triggerBoostPlatform(platform: Phaser.Types.Physics.Arcade.ImageWithStaticBody): void {
    if (platform.getData("boostConsumed")) {
      return;
    }

    platform.setData("boostConsumed", true);
    const boostVelocity = baseGameConfig.physics.jumpVelocity * 1.45;
    this.player.setVelocityY(-boostVelocity);
    this.tweens.add({
      targets: platform,
      alpha: { from: platform.alpha, to: 0.35 },
      duration: 220,
      yoyo: true,
      onComplete: () => platform.setAlpha(1),
    });
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

  private handleJumpLogic(delta: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const grounded = body.blocked.down || body.touching.down;

    if (grounded) {
      this.coyoteTimer = baseGameConfig.physics.coyoteTimeMs;
      this.canDoubleJump = true;
    } else if (this.coyoteTimer > 0) {
      this.coyoteTimer -= delta;
    }

    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up!) ||
      Phaser.Input.Keyboard.JustDown(this.jumpKey);

    if (jumpPressed) {
      this.jumpBufferTimer = baseGameConfig.physics.jumpBufferMs;
    } else if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= delta;
    }

    if (this.jumpBufferTimer <= 0) {
      return;
    }

    if (this.coyoteTimer > 0) {
      this.executeJump(false);
    } else if (this.canDoubleJump) {
      this.executeJump(true);
      this.canDoubleJump = false;
    }
  }

  private executeJump(isAirJump: boolean): void {
    const multiplier = isAirJump ? 0.92 : 1;
    this.player.setVelocityY(-baseGameConfig.physics.jumpVelocity * multiplier);
    this.jumpBufferTimer = 0;
    this.coyoteTimer = 0;
  }
}
