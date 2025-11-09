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
  private heightContainer!: Phaser.GameObjects.Container;
  private scoreContainer!: Phaser.GameObjects.Container;
  private heightText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private heightLabel!: Phaser.GameObjects.Text;
  private scoreLabel!: Phaser.GameObjects.Text;
  private currentHeight: number = 0;
  private currentScore: number = 0;
  private highScore: number = 0;
  private highScoreDisplayEl?: HTMLElement;
  private scoreBurstContainer!: Phaser.GameObjects.Container;
  private hudFrame!: Phaser.GameObjects.Graphics;
  private connectorGraphic!: Phaser.GameObjects.Graphics;
  private hudBackdrop!: Phaser.GameObjects.Graphics;
  private heightIcon!: Phaser.GameObjects.Rectangle;
  private scoreIcon!: Phaser.GameObjects.Star;
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

    this.createHUDBackdrop();
    // Create HUD panels
    this.createHUDPanels();
    
    // Create animated counters
    this.createCounters();
    this.createHUDDecorations();
    
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

  private createHUDBackdrop(): void {
    const { width } = this.scale;
    this.hudBackdrop = this.add.graphics().setDepth(50);
    this.hudBackdrop.fillStyle(0x071225, 0.55);
    // schlanker Streifen direkt am oberen Rand des Canvas
    this.hudBackdrop.fillRoundedRect(16, 12, width - 32, 56, 16);
    this.hudBackdrop.lineStyle(1, 0x102339, 0.85);
    this.hudBackdrop.strokeRoundedRect(16, 12, width - 32, 56, 16);
    this.hudBackdrop.setScrollFactor(0);
  }

  private createHUDPanels(): void {
    const { width } = this.scale;

    // Height panel (left side)
    this.heightContainer = this.uiSystem.createPanel({
      x: 120,
      y: 40,
      width: 150,
      height: 56,
      backgroundColor: 0x030d20,
      borderColor: 0x4adeff,
      alpha: 0.95
    })
      .setDepth(100)
      .setScrollFactor(0);

    // Score panel (right side)
    this.scoreContainer = this.uiSystem.createPanel({
      x: width - 120,
      y: 40,
      width: 150,
      height: 56,
      backgroundColor: 0x030d20,
      borderColor: 0x9acbff,
      alpha: 0.95
    })
      .setDepth(100)
      .setScrollFactor(0);

    // keine Float-Animation mehr; feste, ruhige HUD
  }

  private createCounters(): void {
    // Height label and value
    this.heightLabel = this.uiSystem.createGlowingText("HEIGHT", this.heightContainer.x, this.heightContainer.y - 15, {
      fontSize: "14px",
      color: "#9acbff"
    });
    this.heightLabel.setOrigin(0.5);
    this.heightContainer.add(this.heightLabel);
    this.heightLabel.setPosition(0, -12);

    this.heightText = this.uiSystem.createGlowingText("0", this.heightContainer.x, this.heightContainer.y + 10, {
      fontSize: "28px",
      color: "#e9f3ff"
    });
    this.heightText.setOrigin(0.5);
    this.heightContainer.add(this.heightText);
    this.heightText.setPosition(0, 6);

    // Score label and value
    this.scoreLabel = this.uiSystem.createGlowingText("SCORE", this.scoreContainer.x, this.scoreContainer.y - 15, {
      fontSize: "14px",
      color: "#9acbff"
    });
    this.scoreLabel.setOrigin(0.5);
    this.scoreContainer.add(this.scoreLabel);
    this.scoreLabel.setPosition(0, -12);

    this.scoreText = this.uiSystem.createGlowingText("0", this.scoreContainer.x, this.scoreContainer.y + 10, {
      fontSize: "28px",
      color: "#e9f3ff"
    });
    this.scoreText.setOrigin(0.5);
    this.scoreContainer.add(this.scoreText);
    this.scoreText.setPosition(0, 6);

    // Add subtle glow pulsing
    this.tweens.add({
      targets: [this.heightText, this.scoreText],
      alpha: 0.9,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  private createHUDDecorations(): void {
    this.hudFrame = this.add.graphics().setDepth(0.4);
    this.connectorGraphic = this.add.graphics().setDepth(0.35);
    this.redrawHUDFrame(0);

    // Iconography to anchor panels
    this.heightIcon = this.add
      .rectangle(58, 60, 12, 12, 0x4adeff, 0.5)
      .setDepth(0.5)
      .setAngle(45)
      .setStrokeStyle(2, 0xffffff, 0.4);

    this.scoreIcon = this.add
      .star(this.scale.width - 58, 60, 5, 4, 9, 0x9acbff, 0.45)
      .setDepth(0.5)
      .setStrokeStyle(1, 0xffffff, 0.35);

    this.heightIcon.setBlendMode(Phaser.BlendModes.ADD);
    this.scoreIcon.setBlendMode(Phaser.BlendModes.ADD);
  }

  private redrawHUDFrame(progress: number): void {
    const { width } = this.scale;
    const accent = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x1c3c5b),
      Phaser.Display.Color.ValueToColor(0x7ce8ff),
      100,
      progress * 100
    );
    const accentColor = Phaser.Display.Color.GetColor(accent.r, accent.g, accent.b);

    this.hudFrame.clear();
    this.hudFrame.fillStyle(0x01040b, 0.22);
    this.hudFrame.fillRoundedRect(30, 18, width - 60, 96, 24);
    this.hudFrame.lineStyle(2, accentColor, 0.28 + progress * 0.2);
    this.hudFrame.strokeRoundedRect(30, 18, width - 60, 96, 24);

    this.connectorGraphic.clear();
    this.connectorGraphic.lineStyle(1, accentColor, 0.35 + progress * 0.2);
    this.connectorGraphic.beginPath();
    this.connectorGraphic.moveTo(58, 92);
    this.connectorGraphic.lineTo(58, 140);
    this.connectorGraphic.moveTo(width - 58, 92);
    this.connectorGraphic.lineTo(width - 58, 140);
    this.connectorGraphic.strokePath();
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
      return;
    }

    this.highScoreDisplayEl.textContent = this.highScore.toString();

    if (pulse) {
      this.highScoreDisplayEl.classList.remove("is-updated");
      // Force reflow so the animation can restart when the class is re-added
      void this.highScoreDisplayEl.offsetWidth;
      this.highScoreDisplayEl.classList.add("is-updated");
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
    this.hudBackdrop.setAlpha(0.45 + progress * 0.25);
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
    this.heightIcon.setFillStyle(
      Phaser.Display.Color.GetColor(heightColor.r, heightColor.g, heightColor.b),
      0.45 + progress * 0.3
    );
    this.scoreIcon.setFillStyle(
      Phaser.Display.Color.GetColor(scoreColor.r, scoreColor.g, scoreColor.b),
      0.4 + progress * 0.25
    );
    const panelAlpha = 0.78 + progress * 0.15;
    this.heightContainer.setAlpha(panelAlpha);
    this.scoreContainer.setAlpha(panelAlpha);
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
      targets: [this.heightContainer, this.scoreContainer],
      alpha: 0.3,
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
