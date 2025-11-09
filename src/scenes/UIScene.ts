import Phaser from "phaser";
import { UISystem } from "../core/ui/UISystem";

/**
 * UIScene / HUD:
 * - Enhanced parallel UI with glassmorphism and modern design
 * - Beautiful score, height displays with animations
 * - Visual feedback and smooth transitions
 * - Empfängt Updates von GameScene via Events
 */
export class UIScene extends Phaser.Scene {
  private uiSystem!: UISystem;
  private topBanner!: Phaser.GameObjects.Container;
  private bannerBackground!: Phaser.GameObjects.Rectangle;
  private bannerShine!: Phaser.GameObjects.Rectangle;
  private heightText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private bannerGlow!: Phaser.GameObjects.Graphics;
  private currentHeight: number = 0;
  private currentScore: number = 0;
  private highScore: number = 0;
  private highScoreDisplayEl?: HTMLElement;
  private scoreBurstContainer!: Phaser.GameObjects.Container;
  private bannerAccent!: Phaser.GameObjects.Graphics;
  private comboContainer!: Phaser.GameObjects.Container;
  private comboText!: Phaser.GameObjects.Text;
  private comboMultiplierText!: Phaser.GameObjects.Text;
  private comboProgress!: Phaser.GameObjects.Rectangle;
  private comboActive = false;
  private milestoneToast?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "UIScene" });
  }

  create(): void {
    const { width } = this.scale;
    this.uiSystem = new UISystem(this);

    const highScoreElement = document.getElementById("high-score-display");
    if (highScoreElement instanceof HTMLElement) {
      this.highScoreDisplayEl = highScoreElement;
    }

    try {
      const storedHighScore = window.localStorage.getItem("biesytower-highscore");
      if (storedHighScore) {
        const parsedHighScore = Number(storedHighScore);
        if (!Number.isNaN(parsedHighScore)) {
          this.highScore = parsedHighScore;
        }
      }
    } catch (error) {
      // Access to localStorage can fail in privacy modes; ignore gracefully
    }
    this.updateHighScoreDisplay();

    this.createTopBanner();

    // Create score burst effect
    this.createScoreBurstContainer();
    this.createComboIndicator();
    
    // Listen to events from GameScene
    this.game.events.on("heightUpdate", this.onHeightUpdate, this);
    this.game.events.on("heightProgress", this.onHeightProgress, this);
    this.game.events.on("scoreUpdate", this.onScoreUpdate, this);
    this.game.events.on("comboUpdate", this.onComboUpdate, this);
    this.game.events.on("comboEnded", this.onComboEnded, this);
    this.game.events.on("heightMilestone", this.onHeightMilestone, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off("heightUpdate", this.onHeightUpdate, this);
      this.game.events.off("heightProgress", this.onHeightProgress, this);
      this.game.events.off("scoreUpdate", this.onScoreUpdate, this);
      this.game.events.off("comboUpdate", this.onComboUpdate, this);
      this.game.events.off("comboEnded", this.onComboEnded, this);
      this.game.events.off("heightMilestone", this.onHeightMilestone, this);
    });
  }

  private createTopBanner(): void {
    const { width } = this.scale;
    const bannerWidth = width - 40;

    this.topBanner = this.add.container(width / 2, 42).setDepth(100).setScrollFactor(0);

    this.bannerGlow = this.add.graphics();
    this.bannerGlow.fillStyle(0x102b4b, 0.8);
    this.bannerGlow.fillRoundedRect(-bannerWidth / 2, -30, bannerWidth, 60, 20);
    this.bannerGlow.lineStyle(2, 0x3cb9ff, 0.5);
    this.bannerGlow.strokeRoundedRect(-bannerWidth / 2, -30, bannerWidth, 60, 20);
    this.bannerGlow.setAlpha(0.92);

    this.bannerBackground = this.add
      .rectangle(0, 0, bannerWidth - 16, 52, 0x051022, 0.92)
      .setStrokeStyle(1.2, 0x1b4d8c, 0.6)
      .setDepth(0.95);

    this.bannerShine = this.add
      .rectangle(0, -12, bannerWidth - 24, 20, 0xffffff, 0.05)
      .setBlendMode(Phaser.BlendModes.SCREEN);

    const accentLine = this.add
      .rectangle(0, 24, bannerWidth - 60, 4, 0x3cb9ff, 0.35)
      .setOrigin(0.5, 1)
      .setDepth(1.1);

    const brandGroup = this.add.container(-bannerWidth / 2 + 90, -2);
    const brandGlow = this.add
      .rectangle(-20, 0, 46, 46, 0x0b5cff, 0.32)
      .setStrokeStyle(2, 0x7ce8ff, 0.55)
      .setAngle(45)
      .setDepth(1.2);
    brandGlow.setBlendMode(Phaser.BlendModes.ADD);

    const brandText = this.uiSystem
      .createGlowingText("BIESY TOWER", 10, -6, {
        fontSize: "18px",
        color: "#f5fbff",
      })
      .setOrigin(0, 0.5);
    brandText.setShadow(0, 6, "rgba(13, 80, 140, 0.65)", 12);

    const brandSub = this.uiSystem
      .createGlowingText("Skyscraper Prototype", 10, 12, {
        fontSize: "11px",
        color: "#8dc7ff",
      })
      .setOrigin(0, 0.5);
    brandSub.setAlpha(0.85);

    brandGroup.add([brandGlow, brandText, brandSub]);

    const metricsStartX = -bannerWidth / 2 + 220;
    const metricSpacing = 130;

    this.heightText = this.createMetricBlock(metricsStartX, "HEIGHT", "0");
    this.scoreText = this.createMetricBlock(metricsStartX + metricSpacing, "SCORE", "0");
    this.highScoreText = this.createMetricBlock(metricsStartX + metricSpacing * 2, "HIGH", this.highScore.toString());

    this.bannerAccent = this.add.graphics();
    this.bannerAccent.lineStyle(1, 0x3cb9ff, 0.4);
    this.bannerAccent.strokeRoundedRect(-bannerWidth / 2 + 12, -26, bannerWidth - 24, 52, 18);

    this.topBanner.add([
      this.bannerGlow,
      this.bannerBackground,
      this.bannerShine,
      accentLine,
      this.bannerAccent,
      brandGroup,
      this.heightText,
      this.scoreText,
      this.highScoreText,
    ]);

    this.highScoreText.setText(this.highScore.toString());

    this.tweens.add({
      targets: [this.bannerShine],
      y: { from: -18, to: -8 },
      alpha: { from: 0.08, to: 0.22 },
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private createMetricBlock(x: number, label: string, initialValue: string): Phaser.GameObjects.Text {
    const labelText = this.uiSystem.createGlowingText(label, x, -12, {
      fontSize: "11px",
      color: "#80bfff",
    });
    labelText.setOrigin(0.5);

    const valueText = this.uiSystem.createGlowingText(initialValue, x, 10, {
      fontSize: "26px",
      color: "#f6fbff",
    });
    valueText.setOrigin(0.5);

    this.topBanner.add([labelText, valueText]);

    this.tweens.add({
      targets: valueText,
      alpha: { from: 0.9, to: 1 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return valueText;
  }

  private redrawHUDFrame(progress: number): void {
    const { width } = this.scale;
    const accent = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x123154),
      Phaser.Display.Color.ValueToColor(0x7ce8ff),
      100,
      progress * 100
    );
    const accentColor = Phaser.Display.Color.GetColor(accent.r, accent.g, accent.b);

    this.bannerGlow.clear();
    this.bannerGlow.fillStyle(0x08192f, 0.88 + progress * 0.05);
    this.bannerGlow.fillRoundedRect(-width / 2 + 20, -30, width - 40, 60, 20);
    this.bannerGlow.lineStyle(2, accentColor, 0.4 + progress * 0.2);
    this.bannerGlow.strokeRoundedRect(-width / 2 + 20, -30, width - 40, 60, 20);

    this.bannerAccent.clear();
    this.bannerAccent.lineStyle(1, accentColor, 0.35 + progress * 0.25);
    this.bannerAccent.strokeRoundedRect(-width / 2 + 32, -24, width - 64, 48, 16);

    const backgroundColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x051022),
      Phaser.Display.Color.ValueToColor(0x0f2f4f),
      100,
      progress * 100
    );
    this.bannerBackground.setFillStyle(
      Phaser.Display.Color.GetColor(backgroundColor.r, backgroundColor.g, backgroundColor.b),
      0.92
    );

    this.bannerShine.setAlpha(0.08 + progress * 0.12);
  }

  private createScoreBurstContainer(): void {
    this.scoreBurstContainer = this.add.container(0, 0);
  }

  private createComboIndicator(): void {
    const { width } = this.scale;
    this.comboContainer = this.add.container(width / 2, 118).setDepth(1.2);

    const background = this.add
      .rectangle(0, 0, 220, 54, 0x04122a, 0.95)
      .setStrokeStyle(1, 0x58dfff, 0.6);
    const progressTrack = this.add.rectangle(0, 14, 180, 8, 0xffffff, 0.15);
    this.comboProgress = this.add.rectangle(-90, 14, 180, 8, 0x58dfff, 0.9).setOrigin(0, 0.5);
    this.comboProgress.displayWidth = 0;

    this.comboText = this.uiSystem.createGlowingText("COMBO X1", 0, -8, {
      fontSize: "16px",
      color: "#e9f3ff",
    });
    this.comboText.setOrigin(0.5);

    this.comboMultiplierText = this.uiSystem.createGlowingText("1.0x", 0, 12, {
      fontSize: "14px",
      color: "#9af7ff",
    });
    this.comboMultiplierText.setOrigin(0.5);

    this.comboContainer.add([background, progressTrack, this.comboProgress, this.comboText, this.comboMultiplierText]);
    this.comboContainer.setVisible(false).setAlpha(0);
  }

  private onHeightUpdate(height: number): void {
    const newHeight = Math.floor(height);
    if (newHeight === this.currentHeight) {
      return;
    }
    this.currentHeight = newHeight;
    this.updateHeightDisplay();

    if (newHeight > 0 && newHeight % 100 === 0) {
      this.createScoreBurst();
    }
  }

  private onScoreUpdate(score: number): void {
    if (score === this.currentScore) {
      return;
    }
    const delta = score - this.currentScore;
    this.currentScore = score;
    this.updateScoreDisplay(delta);
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      try {
        window.localStorage.setItem("biesytower-highscore", this.highScore.toString());
      } catch (error) {
        // Ignore storage write errors
      }
      this.updateHighScoreDisplay(true);
    }
    if (delta >= 25) {
      this.createScoreBurst();
    }
  }

  private onComboUpdate(payload: { count: number; multiplier: number; bonus: number; progress: number; passive?: boolean }): void {
    if (payload.count <= 1) {
      this.onComboEnded();
      return;
    }

    if (!this.comboActive) {
      this.comboActive = true;
      this.comboContainer.setVisible(true);
      this.tweens.add({
        targets: this.comboContainer,
        alpha: 1,
        duration: 200,
        ease: "Sine.easeOut",
      });
    }

    this.comboText.setText(`COMBO X${payload.count}`);
    this.comboMultiplierText.setText(`${payload.multiplier.toFixed(2)}x`);
    const progress = Phaser.Math.Clamp(payload.progress, 0, 1);
    this.comboProgress.displayWidth = 180 * progress;

    if (!payload.passive) {
      this.tweens.add({
        targets: this.comboContainer,
        scaleX: { from: 1, to: 1.03 },
        scaleY: { from: 1, to: 1.03 },
        duration: 160,
        yoyo: true,
        ease: "Quad.easeOut",
      });
    }
  }

  private onComboEnded(): void {
    if (!this.comboActive) {
      return;
    }
    this.comboActive = false;
    this.comboContainer.setScale(1);
    this.comboProgress.displayWidth = 0;
    this.tweens.add({
      targets: this.comboContainer,
      alpha: 0,
      duration: 220,
      ease: "Sine.easeIn",
      onComplete: () => this.comboContainer.setVisible(false),
    });
  }

  private onHeightMilestone(payload: { height: number; bonus: number }): void {
    this.showMilestoneToast(payload.height, payload.bonus);
    this.createScoreBurst();
  }

  private updateHeightDisplay(): void {
    // Animate text change
    this.tweens.add({
      targets: this.heightText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true,
      ease: "Power2"
    });
    
    this.heightText.setText(this.currentHeight.toString());

    // Add spark effect
    const heightBounds = this.heightText.getBounds();
    this.createNumberSpark(heightBounds.centerX, heightBounds.centerY);
  }

  private updateScoreDisplay(delta = 0): void {
    // Animate text change
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.1 + Math.min(Math.abs(delta) / 80, 0.3),
      scaleY: 1.1 + Math.min(Math.abs(delta) / 80, 0.3),
      duration: 200,
      yoyo: true,
      ease: "Power2"
    });

    this.scoreText.setText(this.currentScore.toString());
  }

  private updateHighScoreDisplay(pulse = false): void {
    if (!this.highScoreDisplayEl) {
      this.highScoreText?.setText(this.highScore.toString());
      return;
    }

    this.highScoreDisplayEl.textContent = this.highScore.toString();

    if (pulse) {
      this.highScoreDisplayEl.classList.remove("is-updated");
      // Force reflow so the animation can restart when the class is re-added
      void this.highScoreDisplayEl.offsetWidth;
      this.highScoreDisplayEl.classList.add("is-updated");
    }

    if (this.highScoreText) {
      this.highScoreText.setText(this.highScore.toString());
      if (pulse) {
        this.tweens.add({
          targets: this.highScoreText,
          scaleX: { from: 1, to: 1.1 },
          scaleY: { from: 1, to: 1.1 },
          yoyo: true,
          duration: 200,
          ease: "Sine.easeOut",
        });
      }
    }
  }

  private createScoreBurst(): void {
    const { centerX: burstX, centerY: burstY } = this.scoreText.getBounds();
    
    // Create multiple particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Phaser.Math.PI2;
      const distance = 40;
      
      const x = burstX + Math.cos(angle) * distance;
      const y = burstY + Math.sin(angle) * distance;
      
      const particle = this.add.circle(x, y, 3, 0x4adeff, 0.8);
      
      this.tweens.add({
        targets: particle,
        x: burstX,
        y: burstY,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 500,
        ease: "Power2",
        onComplete: () => particle.destroy()
      });
    }
  }

  private createNumberSpark(x: number, y: number): void {
    const spark = this.add.circle(x, y, 2, 0x9acbff, 0.6);
    
    this.tweens.add({
      targets: spark,
      y: y - 30,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 600,
      ease: "Power2",
      onComplete: () => spark.destroy()
    });
  }

  private onHeightProgress(payload: { progress: number }): void {
    const progress = Phaser.Math.Clamp(payload?.progress ?? 0, 0, 1);
    this.redrawHUDFrame(progress);
    const heightColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x4adeff),
      Phaser.Display.Color.ValueToColor(0xfff3c1),
      100,
      progress * 100
    );
    const scoreColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x9acbff),
      Phaser.Display.Color.ValueToColor(0xff8dd9),
      100,
      progress * 100
    );
    const heightColorValue = Phaser.Display.Color.GetColor(heightColor.r, heightColor.g, heightColor.b);
    const scoreColorValue = Phaser.Display.Color.GetColor(scoreColor.r, scoreColor.g, scoreColor.b);
    this.heightText.setTint(heightColorValue);
    this.scoreText.setTint(scoreColorValue);
    const highScoreColor = Phaser.Display.Color.GetColor(
      Math.round(240 - progress * 40),
      Math.round(248 - progress * 30),
      255
    );
    this.highScoreText.setTint(highScoreColor);
  }

  private showMilestoneToast(height: number, bonus: number): void {
    this.milestoneToast?.destroy();
    const { width } = this.scale;
    this.milestoneToast = this.add.container(width / 2, 160).setDepth(2);

    const background = this.add
      .rectangle(0, 0, 280, 58, 0x0b1f3f, 0.95)
      .setStrokeStyle(1.5, 0xfff3c1, 0.85);
    const title = this.uiSystem.createGlowingText(`${height.toFixed(0)}m REACHED`, 0, -10, {
      fontSize: "16px",
      color: "#fff4d1",
    }).setOrigin(0.5);
    const bonusText = this.uiSystem.createGlowingText(`+${bonus} bonus`, 0, 12, {
      fontSize: "14px",
      color: "#9af7ff",
    }).setOrigin(0.5);

    this.milestoneToast.add([background, title, bonusText]);
    this.milestoneToast.setAlpha(0).setScale(0.95);

    this.tweens.add({
      targets: this.milestoneToast,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      y: 150,
      duration: 220,
      ease: "Back.easeOut",
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          if (!this.milestoneToast) {
            return;
          }
          this.tweens.add({
            targets: this.milestoneToast,
            alpha: 0,
            y: 130,
            duration: 260,
            ease: "Sine.easeIn",
            onComplete: () => {
              this.milestoneToast?.destroy();
              this.milestoneToast = undefined;
            },
          });
        });
      },
    });
  }

  // Public API for GameScene & Core-Logic:
  public updateHeight(height: number): void {
    this.onHeightUpdate(height);
  }

  public getCurrentHeight(): number {
    return this.currentHeight;
  }

  public getCurrentScore(): number {
    return this.currentScore;
  }

  // Enhanced API for game over screen
  public showGameOver(finalScore: number, finalHeight: number): void {
    // Create game over overlay
    const { width, height } = this.scale;
    
    // Fade out HUD temporarily
    this.tweens.add({
      targets: this.topBanner,
      alpha: 0.45,
      duration: 500,
      yoyo: true,
      ease: "Sine.easeInOut",
    });
    
    // Show final stats
    this.createFinalStats(finalScore, finalHeight);
  }

  private createFinalStats(score: number, height: number): void {
    const { width, height: sceneHeight } = this.scale;
    
    // Create final score display
    const finalScoreText = this.uiSystem.createGlowingText(`FINAL SCORE: ${score}`, width / 2, sceneHeight / 2 - 30, {
      fontSize: "24px",
      color: "#e9f3ff"
    });
    
    const finalHeightText = this.uiSystem.createGlowingText(`HEIGHT: ${height}`, width / 2, sceneHeight / 2 + 20, {
      fontSize: "18px",
      color: "#9acbff"
    });
    
    // Animate in
    this.tweens.add({
      targets: [finalScoreText, finalHeightText],
      alpha: 1,
      y: sceneHeight / 2 - 35,
      duration: 800,
      ease: "Power2"
    });
  }
}
