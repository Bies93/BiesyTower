import Phaser from "phaser";
import { baseGameConfig } from "../config/gameConfig";
import { createPlayerStub } from "../core/player/Player";
import { createPlatformManagerStub, PlatformManager } from "../core/world/PlatformManager";
import { PlatformType } from "../core/world/platformTypes";
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
  private sidePillars: Phaser.GameObjects.Container[] = [];
  private score = 0;
  private passiveHeightScore = 0;
  private comboCount = 1;
  private comboTimerMs = 0;
  private readonly comboWindowMs = 1400;
  private lastLandingTimestamp = 0;
  private nextMilestone = 100;
  private milestoneStep = 100;
  private cameraFollowOffsetStart = 0;
  private cameraFollowOffsetEnd = 0;

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

    // Starte knapp oberhalb des unteren Viewport-Randes, damit die Plattformen von unten beginnen
    const bottomBuffer = Math.max(32, Math.round(height * 0.02)); // ~2-3 cm über dem Rand
    const startPlayerY = height - bottomBuffer;
    this.player = createPlayerStub(this, width / 2, startPlayerY);
    this.startY = this.player.y;

    // Plattformen direkt von ganz unten aus generieren lassen (neue Startposition)
    this.platformManager = createPlatformManagerStub(this);
    this.platformManager.initialize(this.startY);

    // Create visual boundaries for left and right edges
    this.createVisualBoundaries();

    // Add environmental particle effects
    this.createEnvironmentalParticles();

    this.physics.add.collider(
      this.player,
      this.platformManager.getGroup(),
      this.handlePlatformCollision,
      undefined,
      this
    );

    // Kamera: Start an fixierter niedriger Position, dann sanft zum Spieler übergehen
    const cameraOffsetStart = -Math.round(Math.max(180, height * 0.18));
    const cameraOffsetEnd = -Math.round(Math.max(32, height * 0.04));
    this.cameraFollowOffsetStart = cameraOffsetStart;
    this.cameraFollowOffsetEnd = cameraOffsetEnd;
    const startScrollY = Math.max(0, startPlayerY - height + Math.round(bottomBuffer * 0.6));

    const cam = this.cameras.main;
    cam.setZoom(1); // Standardzoom behalten, Fokus auf Spielfläche
    cam.setLerp(0.06, 0.06); // Grund-Lerp für sanftes Folgen
    cam.roundPixels = true;
    cam.setBackgroundColor(baseGameConfig.colors.background);
    cam.setScroll(0, startScrollY);
    cam.setFollowOffset(0, cameraOffsetStart);
    cam.fadeIn(250, 0, 0, 0);

    // Kamera startet unten und folgt mit sanfter Verzögerung
    cam.startFollow(this.player, false, 0.06, 0.06);

    this.currentHeight = 0;
    this.game.events.emit("heightUpdate", this.currentHeight);
    this.jumpKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.jumpBufferTimer = 0;
    this.coyoteTimer = 0;
    this.canDoubleJump = true;
    this.score = 0;
    this.passiveHeightScore = 0;
    this.comboCount = 1;
    this.comboTimerMs = 0;
    this.lastLandingTimestamp = 0;
    this.nextMilestone = 100;
    this.milestoneStep = 100;
    this.game.events.on("playerLanded", this.handlePlayerLanding, this);
    this.game.events.on("bonusPoints", this.handleBonusPoints, this);
    this.game.events.on("playerDamage", this.handlePlayerDamage, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.isEnding = false;
      this.backgroundManager?.destroy();
      this.game.events.off("playerLanded", this.handlePlayerLanding, this);
    });

    // Provide initial progress feedback
    this.game.events.emit("heightProgress", { progress: 0 });
    this.game.events.emit("scoreUpdate", this.score);
    this.game.events.emit("comboEnded");
  }

  private createVisualBoundaries(): void {
    const { width, height } = this.scale;
    const pillarWidth = 28;
    const pillarHeight = height * 2.4;
    const xPositions = [pillarWidth / 2, width - pillarWidth / 2];

    this.sidePillars.forEach((pillar) => pillar.destroy());
    this.sidePillars = [];

    xPositions.forEach((x, index) => {
      const pillar = this.add.container(x, height / 2).setDepth(0);
      const body = this.add.graphics();
      body.fillGradientStyle(0x0a1424, 0x0f2741, 0x03070f, 0x03070f, 0.92);
      body.fillRoundedRect(-pillarWidth / 2, -pillarHeight / 2, pillarWidth, pillarHeight, 18);

      const highlight = this.add
        .rectangle(index === 0 ? -pillarWidth / 2 + 2 : pillarWidth / 2 - 2, 0, 4, pillarHeight, 0x4adeff, 0.25)
        .setBlendMode(Phaser.BlendModes.ADD);

      const rails = this.add.graphics();
      rails.lineStyle(1.3, 0x1d3f63, 0.85);
      for (let i = -pillarHeight / 2 + 30; i < pillarHeight / 2; i += 110) {
        rails.strokeRoundedRect(-pillarWidth / 2 + 4, i, pillarWidth - 8, 16, 6);
      }

      pillar.add([body, rails, highlight]);
      this.sidePillars.push(pillar);

      this.tweens.add({
        targets: highlight,
        alpha: { from: 0.2, to: 0.55 },
        duration: 2400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: index * 200,
      });
    });

    const bridge = this.add.graphics().setDepth(0);
    bridge.lineStyle(2, 0x1a4c72, 0.65);
    bridge.strokeRoundedRect(36, -this.scale.height * 0.02, width - 72, 32, 16);
    bridge.setAlpha(0.85);
  }

  private createEnvironmentalParticles(): void {
    const { width, height } = this.scale;
    
    // Create floating dust particles
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 2 - height; // Start above screen
      const size = Math.random() * 2 + 0.5;
      const alpha = Math.random() * 0.3 + 0.1;
      
      const particle = this.add.circle(x, y, size, 0xffffff, alpha).setDepth(0);
      
      // Random floating animation
      const moveDuration = 3000 + Math.random() * 4000;
      const targetY = y + height * 2 + Math.random() * 200; // Move down screen
      
      this.tweens.add({
        targets: particle,
        y: targetY,
        x: x + (Math.random() - 0.5) * 50, // Slight horizontal drift
        alpha: 0,
        duration: moveDuration,
        ease: "Linear",
        onComplete: () => {
          // Respawn particle at top
          particle.setPosition(Math.random() * width, -20);
          particle.setAlpha(Math.random() * 0.3 + 0.1);
          this.tweens.add({
            targets: particle,
            y: targetY,
            x: particle.x + (Math.random() - 0.5) * 50,
            alpha: 0,
            duration: moveDuration,
            ease: "Linear",
            onComplete: () => particle.destroy()
          });
        }
      });
    }
    
    // Create energy sparkles
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 1.5;
      const sparkle = this.add.star(x, y, 3, 1, 2, 0x4adeff, 0.4)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(0);
      
      // Twinkling animation
      this.tweens.add({
        targets: sparkle,
        alpha: { from: 0.1, to: 0.6 },
        scaleX: { from: 0.5, to: 1.2 },
        scaleY: { from: 0.5, to: 1.2 },
        duration: 1500 + Math.random() * 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: i * 200
      });
    }
  }

  update(time: number, delta: number): void {
    const cam = this.cameras.main;
    if (!this.player || !this.cursors) {
      return;
    }

    const progress = this.getHeightProgress();
    this.backgroundManager?.update(cam, progress);
    this.game.events.emit("heightProgress", { progress });
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
    this.platformManager.update(cam, time, delta);
    this.game.events.emit("heightUpdate", this.currentHeight);
    this.updateScoreFromHeight();
    this.handleComboDecay(delta);
    this.checkHeightMilestones();

    // Dynamische Kamera-Anpassung basierend auf Spielerhöhe
    const ascendProgress = Phaser.Math.Clamp(
      this.currentHeight / (this.scale.height * 0.65),
      0,
      1
    );
    const cameraEase = ascendProgress * ascendProgress;
    const baseLerp = Phaser.Math.Linear(0.05, 0.22, cameraEase);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const velocityLead = Phaser.Math.Clamp(body.velocity.y * 0.04, -60, 60);
    const leadInfluence = Phaser.Math.Linear(1, 0.3, cameraEase);
    const baseOffset = Phaser.Math.Linear(
      this.cameraFollowOffsetStart,
      this.cameraFollowOffsetEnd,
      cameraEase
    );
    const offsetMin = Math.min(this.cameraFollowOffsetStart, this.cameraFollowOffsetEnd) - 60;
    const offsetMax = Math.max(this.cameraFollowOffsetStart, this.cameraFollowOffsetEnd) + 40;
    cam.setLerp(baseLerp, baseLerp);
    cam.setFollowOffset(
      0,
      Phaser.Math.Clamp(baseOffset + velocityLead * leadInfluence, offsetMin, offsetMax)
    );

    const deathY = cam.scrollY + this.scale.height + baseGameConfig.rules.deathMargin;
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

    // Handle existing boost platform behavior
    if (type === "boost") {
      this.triggerBoostPlatform(platform);
    }

    // Handle new platform behaviors
    this.platformManager.handlePlatformLanding(
      { sprite: platform, y: platform.y, width: platform.displayWidth, type },
      this.player
    );

    // Emit landing event for combo system
    this.game.events.emit("playerLanded", {
      x: this.player.x,
      y: this.player.y,
      velocity: this.player.body.velocity.y
    });
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
    this.score = 0;
    this.passiveHeightScore = 0;
    this.game.events.emit("scoreUpdate", this.score);
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
    this.game.events.emit("playerJump", { isAirJump });
    this.createJumpBurst(isAirJump);
  }

  private createJumpBurst(isAirJump: boolean): void {
    const color = isAirJump ? 0xffffff : 0x4adeff;
    const radius = isAirJump ? 12 : 8;
    const burst = this.add.circle(this.player.x, this.player.y, radius, color, 0.35);
    burst.setBlendMode(Phaser.BlendModes.ADD).setDepth(4);

    this.tweens.add({
      targets: burst,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: isAirJump ? 280 : 220,
      ease: "Quad.easeOut",
      onComplete: () => burst.destroy(),
    });
  }

  private handlePlayerLanding(payload: { x: number; y: number; velocity: number }): void {
    if (this.isEnding) {
      return;
    }
    this.createLandingShockwave(payload.x, payload.y, payload.velocity);
    this.processComboLanding(payload);
  }

  private createLandingShockwave(x: number, y: number, velocity: number): void {
    const ring = this.add.graphics({ x, y }).setDepth(4);
    ring.lineStyle(2, 0x4adeff, 0.55);
    ring.strokeRoundedRect(-20, -6, 40, 12, 6);

    this.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.3,
      duration: Phaser.Math.Clamp(Math.abs(velocity) * 1.5, 220, 520),
      ease: "Cubic.easeOut",
      onComplete: () => ring.destroy(),
    });
    if (Math.abs(velocity) > 320) {
      this.cameras.main.shake(100, 0.0035);
    }
  }

  private getHeightProgress(): number {
    return Phaser.Math.Clamp(this.currentHeight / 12000, 0, 1);
  }

  private updateScoreFromHeight(): void {
    const passiveScoreTarget = Math.floor(this.currentHeight * 0.4);
    if (passiveScoreTarget > this.passiveHeightScore) {
      const delta = passiveScoreTarget - this.passiveHeightScore;
      this.passiveHeightScore = passiveScoreTarget;
      this.incrementScore(delta);
    }
  }

  private incrementScore(amount: number): void {
    if (amount === 0) {
      return;
    }
    this.score += amount;
    this.game.events.emit("scoreUpdate", this.score);
  }

  private processComboLanding(payload: { velocity: number }): void {
    const now = this.time.now;
    if (now - this.lastLandingTimestamp <= this.comboWindowMs) {
      this.comboCount += 1;
    } else {
      this.comboCount = 1;
    }
    this.lastLandingTimestamp = now;
    this.comboTimerMs = this.comboWindowMs;

    const impact = Phaser.Math.Clamp(Math.abs(payload.velocity) * 0.15, 6, 90);
    const multiplier = 1 + Math.min(this.comboCount - 1, 8) * 0.15;
    const bonus = Math.round(impact * multiplier);
    this.incrementScore(bonus);

    this.game.events.emit("comboUpdate", {
      count: this.comboCount,
      multiplier,
      bonus,
      progress: 1,
    });
  }

  private handleComboDecay(delta: number): void {
    if (this.comboCount <= 1 || this.comboTimerMs <= 0) {
      return;
    }
    this.comboTimerMs = Math.max(0, this.comboTimerMs - delta);
    const progress = Phaser.Math.Clamp(this.comboTimerMs / this.comboWindowMs, 0, 1);
    this.game.events.emit("comboUpdate", {
      count: this.comboCount,
      multiplier: 1 + Math.min(this.comboCount - 1, 8) * 0.15,
      bonus: 0,
      progress,
      passive: true,
    });

    if (this.comboTimerMs === 0) {
      this.comboCount = 1;
      this.comboTimerMs = 0;
      this.game.events.emit("comboEnded");
    }
  }

  private checkHeightMilestones(): void {
    while (this.currentHeight >= this.nextMilestone) {
      this.triggerHeightMilestone(this.nextMilestone);
      this.milestoneStep = Math.min(400, this.milestoneStep + 50);
      this.nextMilestone += this.milestoneStep;
    }
  }

  private triggerHeightMilestone(heightMark: number): void {
    const bonus = 50 + Math.floor(heightMark * 0.1);
    this.incrementScore(bonus);
    this.game.events.emit("heightMilestone", { height: heightMark, bonus });
    this.createMilestoneCelebration(heightMark);
  }

  private createMilestoneCelebration(heightMark: number): void {
    const { width, height } = this.scale;
    const banner = this.add
      .text(width / 2, height * 0.22, `${heightMark.toFixed(0)} M`, {
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#0a1a33",
        strokeThickness: 6,
      })
      .setDepth(30)
      .setScrollFactor(0);
    banner.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: banner,
      alpha: 0,
      y: banner.y - 40,
      duration: 900,
      ease: "Cubic.easeOut",
      onComplete: () => banner.destroy(),
    });

    for (let i = 0; i < 16; i++) {
      const spark = this.add
        .circle(this.player.x, this.player.y - 10, 4, 0xfff3c1, 0.85)
        .setDepth(6);
      const angle = (i / 16) * Phaser.Math.PI2;
      const distance = 70 + Math.random() * 40;
      this.tweens.add({
        targets: spark,
        x: this.player.x + Math.cos(angle) * distance,
        y: this.player.y + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.3,
        duration: 820,
        ease: "Cubic.easeOut",
        onComplete: () => spark.destroy(),
      });
    }
  }

  private handleBonusPoints(amount: number): void {
    this.incrementScore(amount);
    
    // Visual feedback for bonus points
    const bonusText = this.add.text(this.player.x, this.player.y - 50, `+${amount}`, {
      fontSize: "24px",
      color: "#ffd700",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(100);
    
    this.tweens.add({
      targets: bonusText,
      y: bonusText.y - 50,
      alpha: 0,
      duration: 1000,
      ease: "Quad.easeOut",
      onComplete: () => bonusText.destroy()
    });
  }

  private handlePlayerDamage(amount: number): void {
    // Flash red tint
    this.player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      this.player.clearTint();
    });
    
    // Screen shake for damage feedback
    this.cameras.main.shake(200, 0.01);
    
    // Could add health system here
    console.log(`Player took ${amount} damage`);
  }
}
