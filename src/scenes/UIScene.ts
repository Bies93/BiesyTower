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
  private hudContainer!: Phaser.GameObjects.Container;
  private hudBackdrop!: Phaser.GameObjects.Graphics;
  private hudHighlight!: Phaser.GameObjects.Rectangle;
  private heightValue!: Phaser.GameObjects.Text;
  private scoreValue!: Phaser.GameObjects.Text;
  private highScoreValue!: Phaser.GameObjects.Text;
  private heightBackground!: Phaser.GameObjects.Rectangle;
  private scoreBackground!: Phaser.GameObjects.Rectangle;
  private highBackground!: Phaser.GameObjects.Rectangle;
  private metricAccents: Phaser.GameObjects.Rectangle[] = [];
  private currentHeight: number = 0;
  private currentScore: number = 0;
  private highScore: number = 0;
  private highScoreDisplayEl?: HTMLElement;
  private heightDisplayEl?: HTMLElement;
  private scoreDisplayEl?: HTMLElement;
  private scoreBurstContainer!: Phaser.GameObjects.Container;
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
    const heightElement = document.getElementById("height-display");
    if (heightElement instanceof HTMLElement) {
      this.heightDisplayEl = heightElement;
    }
    const scoreElement = document.getElementById("score-display");
    if (scoreElement instanceof HTMLElement) {
      this.scoreDisplayEl = scoreElement;
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

    this.createMinimalUI();
    
    // Create score burst effect
    this.createScoreBurstContainer();
    this.createComboIndicator();
    
    // Listen to events from GameScene
    this.game.events.on("heightUpdate", this.onHeightUpdate, this);
    // this.game.events.on("heightProgress", this.onHeightProgress, this);
    this.game.events.on("scoreUpdate", this.onScoreUpdate, this);
    this.game.events.on("comboUpdate", this.onComboUpdate, this);
    this.game.events.on("comboEnded", this.onComboEnded, this);
    this.game.events.on("heightMilestone", this.onHeightMilestone, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off("heightUpdate", this.onHeightUpdate, this);
      // this.game.events.off("heightProgress", this.onHeightProgress, this);
      this.game.events.off("scoreUpdate", this.onScoreUpdate, this);
      this.game.events.off("comboUpdate", this.onComboUpdate, this);
      this.game.events.off("comboEnded", this.onComboEnded, this);
      this.game.events.off("heightMilestone", this.onHeightMilestone, this);
    });
  }


  private createMinimalUI(): void {
    const { width } = this.scale;

    // Create semi-transparent backgrounds for UI elements
    const uiAlpha = 0.75;
    const uiPadding = 12;
    const uiCornerRadius = 8;
    
    // Height display (top-left)
    this.heightBackground = this.add.rectangle(uiPadding + 60, uiPadding + 15, 120, 30, 0x04122a, uiAlpha)
      .setStrokeStyle(1, 0x4adeff, 0.6)
      .setOrigin(0.5, 0.5)
      .setDepth(49)
      .setScrollFactor(0);
    
    this.heightValue = this.add.text(uiPadding + 60, uiPadding + 15, "0 m", {
      fontFamily: "'Segoe UI', sans-serif",
      fontSize: "16px",
      color: "#4adeff",
      stroke: "#000000",
      strokeThickness: 1
    }).setDepth(50).setScrollFactor(0).setOrigin(0.5, 0.5);

    // Score display (top-right)
    this.scoreBackground = this.add.rectangle(width - uiPadding - 60, uiPadding + 15, 120, 30, 0x04122a, uiAlpha)
      .setStrokeStyle(1, 0x6be8ff, 0.6)
      .setOrigin(0.5, 0.5)
      .setDepth(49)
      .setScrollFactor(0);
    
    this.scoreValue = this.add.text(width - uiPadding - 60, uiPadding + 15, "0", {
      fontFamily: "'Segoe UI', sans-serif",
      fontSize: "16px",
      color: "#6be8ff",
      stroke: "#000000",
      strokeThickness: 1
    }).setDepth(50).setScrollFactor(0).setOrigin(0.5, 0.5);

    // High score display (top-center)
    this.highBackground = this.add.rectangle(width / 2, uiPadding + 15, 140, 30, 0x132b4d, uiAlpha)
      .setStrokeStyle(1, 0xff9cf7, 0.6)
      .setOrigin(0.5, 0.5)
      .setDepth(49)
      .setScrollFactor(0);
    
    this.highScoreValue = this.add.text(width / 2, uiPadding + 15, "HIGH: 0", {
      fontFamily: "'Segoe UI', sans-serif",
      fontSize: "14px",
      color: "#ff9cf7",
      stroke: "#000000",
      strokeThickness: 1
    }).setDepth(50).setScrollFactor(0).setOrigin(0.5, 0.5);

    this.updateHighScoreDisplay();
  }



  private createScoreBurstContainer(): void {
    this.scoreBurstContainer = this.add.container(0, 0).setDepth(80).setScrollFactor(0);
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
    this.tweens.add({
      targets: this.heightValue,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 180,
      yoyo: true,
      ease: "Power2",
    });

    const formatted = `${this.currentHeight} m`;
    this.heightValue.setText(formatted);
    this.updateDomMetric(this.heightDisplayEl, formatted, true);

    const heightBounds = this.heightValue.getBounds();
    this.createNumberSpark(heightBounds.centerX, heightBounds.centerY);
  }

  private updateScoreDisplay(delta = 0): void {
    const scaleBoost = 1.08 + Math.min(Math.abs(delta) / 120, 0.32);
    this.tweens.add({
      targets: this.scoreValue,
      scaleX: scaleBoost,
      scaleY: scaleBoost,
      duration: 220,
      yoyo: true,
      ease: "Power2",
    });

    const formatted = this.formatScore(this.currentScore);
    this.scoreValue.setText(formatted);
    this.updateDomMetric(this.scoreDisplayEl, formatted, delta > 0);
  }

  private updateHighScoreDisplay(pulse = false): void {
    const formatted = this.formatScore(this.highScore);
    if (this.highScoreValue) {
      this.highScoreValue.setText(formatted);
      if (pulse) {
        this.tweens.add({
          targets: this.highScoreValue,
          scaleX: 1.12,
          scaleY: 1.12,
          duration: 220,
          yoyo: true,
          ease: "Sine.easeOut",
        });
      }
    }

    this.updateDomMetric(this.highScoreDisplayEl, formatted, pulse);
  }

  private formatScore(value: number): string {
    return value.toLocaleString("de-DE");
  }

  private updateDomMetric(element: HTMLElement | undefined, value: string, pulse = false): void {
    if (!element) {
      return;
    }

    element.textContent = value;

    if (pulse) {
      element.classList.remove("is-updated");
      void element.offsetWidth;
      element.classList.add("is-updated");
    }
  }

  private createScoreBurst(): void {
    const { centerX: burstX, centerY: burstY } = this.scoreValue.getBounds();
    
    // Create multiple particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Phaser.Math.PI2;
      const distance = 40;
      
      const x = burstX + Math.cos(angle) * distance;
      const y = burstY + Math.sin(angle) * distance;
      
      const particle = this.add.circle(x, y, 3, 0x4adeff, 0.8).setScrollFactor(0).setDepth(85);
      this.scoreBurstContainer.add(particle);

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
    const spark = this.add.circle(x, y, 2, 0x9acbff, 0.6).setScrollFactor(0).setDepth(85);
    this.scoreBurstContainer.add(spark);

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
    const { width } = this.scale;
    const margin = 12;
    const topOffset = 18;
    const bannerWidth = width - margin * 2;

    const topLeft = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x040b18),
      Phaser.Display.Color.ValueToColor(0x153b5c),
      100,
      progress * 100
    );
    const topRight = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x07162a),
      Phaser.Display.Color.ValueToColor(0x1a3f63),
      100,
      progress * 100
    );
    const bottomLeft = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x0b2440),
      Phaser.Display.Color.ValueToColor(0x1c4f70),
      100,
      progress * 100
    );
    const bottomRight = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x0a2746),
      Phaser.Display.Color.ValueToColor(0x1f587c),
      100,
      progress * 100
    );

    this.hudBackdrop.clear();
    this.hudBackdrop.fillGradientStyle(
      Phaser.Display.Color.GetColor(topLeft.r, topLeft.g, topLeft.b),
      Phaser.Display.Color.GetColor(topRight.r, topRight.g, topRight.b),
      Phaser.Display.Color.GetColor(bottomLeft.r, bottomLeft.g, bottomLeft.b),
      Phaser.Display.Color.GetColor(bottomRight.r, bottomRight.g, bottomRight.b),
      0.88,
      0.92,
      0.9,
      0.88
    );
    this.hudBackdrop.fillRoundedRect(margin, topOffset, bannerWidth, 76, 24);

    const borderColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x4adeff),
      Phaser.Display.Color.ValueToColor(0xbdf4ff),
      100,
      progress * 100
    );
    this.hudBackdrop.lineStyle(
      2,
      Phaser.Display.Color.GetColor(borderColor.r, borderColor.g, borderColor.b),
      0.22 + progress * 0.25
    );
    this.hudBackdrop.strokeRoundedRect(margin, topOffset, bannerWidth, 76, 24);

    const highlightColor = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x58dfff),
      Phaser.Display.Color.ValueToColor(0xff8df0),
      100,
      progress * 100
    );
    this.hudHighlight.setFillStyle(
      Phaser.Display.Color.GetColor(highlightColor.r, highlightColor.g, highlightColor.b),
      0.16 + progress * 0.28
    );

    const heightFill = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x0c1f36),
      Phaser.Display.Color.ValueToColor(0x155280),
      100,
      progress * 100
    );
    const heightAccent = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x4adeff),
      Phaser.Display.Color.ValueToColor(0xb6f2ff),
      100,
      progress * 100
    );
    this.heightBackground.setFillStyle(
      Phaser.Display.Color.GetColor(heightFill.r, heightFill.g, heightFill.b),
      0.82 + progress * 0.1
    );
    this.heightBackground.setStrokeStyle(
      1.6,
      Phaser.Display.Color.GetColor(heightAccent.r, heightAccent.g, heightAccent.b),
      0.52 + progress * 0.25
    );
    if (this.metricAccents[0]) {
      this.metricAccents[0].setFillStyle(
        Phaser.Display.Color.GetColor(heightAccent.r, heightAccent.g, heightAccent.b),
        0.35 + progress * 0.25
      );
    }

    const scoreFill = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x0d233a),
      Phaser.Display.Color.ValueToColor(0x145c88),
      100,
      progress * 100
    );
    const scoreAccent = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x6be8ff),
      Phaser.Display.Color.ValueToColor(0xaef2ff),
      100,
      progress * 100
    );
    this.scoreBackground.setFillStyle(
      Phaser.Display.Color.GetColor(scoreFill.r, scoreFill.g, scoreFill.b),
      0.82 + progress * 0.12
    );
    this.scoreBackground.setStrokeStyle(
      1.6,
      Phaser.Display.Color.GetColor(scoreAccent.r, scoreAccent.g, scoreAccent.b),
      0.5 + progress * 0.28
    );
    if (this.metricAccents[1]) {
      this.metricAccents[1].setFillStyle(
        Phaser.Display.Color.GetColor(scoreAccent.r, scoreAccent.g, scoreAccent.b),
        0.32 + progress * 0.24
      );
    }

    const highFill = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x132b4d),
      Phaser.Display.Color.ValueToColor(0x2b3c7a),
      100,
      progress * 100
    );
    const highAccent = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0xff9cf7),
      Phaser.Display.Color.ValueToColor(0xffd3ff),
      100,
      progress * 100
    );
    this.highBackground.setFillStyle(
      Phaser.Display.Color.GetColor(highFill.r, highFill.g, highFill.b),
      0.84 + progress * 0.12
    );
    this.highBackground.setStrokeStyle(
      1.8,
      Phaser.Display.Color.GetColor(highAccent.r, highAccent.g, highAccent.b),
      0.6 + progress * 0.25
    );
    if (this.metricAccents[2]) {
      this.metricAccents[2].setFillStyle(
        Phaser.Display.Color.GetColor(highAccent.r, highAccent.g, highAccent.b),
        0.38 + progress * 0.28
      );
    }

    this.hudContainer.setAlpha(0.9 + progress * 0.08);
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
      targets: [this.hudContainer, this.hudHighlight],
      alpha: 0.35,
      duration: 500
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
