import Phaser from "phaser";
import { UISystem } from "../core/ui/UISystem";
import { GlassmorphismUI } from "../core/ui/GlassmorphismUI";

/**
 * UIScene / HUD:
 * - Enhanced parallel UI with glassmorphism and modern design
 * - Beautiful score, height displays with animations
 * - Visual feedback and smooth transitions
 * - Empfängt Updates von GameScene via Events
 */
export class UIScene extends Phaser.Scene {
  private uiSystem!: UISystem;
  private glassUI!: GlassmorphismUI;
  private hudContainer!: Phaser.GameObjects.Container;
  private hudBackdrop!: Phaser.GameObjects.Graphics;
  private hudHighlight!: Phaser.GameObjects.Rectangle;
  private heightValue!: Phaser.GameObjects.Text;
  private scoreValue!: Phaser.GameObjects.Text;
  private highScoreValue!: Phaser.GameObjects.Text;
  private heightBackground!: Phaser.GameObjects.Container;
  private scoreBackground!: Phaser.GameObjects.Container;
  private highBackground!: Phaser.GameObjects.Container;
  private metricAccents: Phaser.GameObjects.Rectangle[] = [];
  private currentHeight: number = 0;
  private currentScore: number = 0;
  private highScore: number = 0;
  private highScoreDisplayEl?: HTMLElement;
  private heightDisplayEl?: HTMLElement;
  private scoreDisplayEl?: HTMLElement;
  private scoreBurstContainer!: Phaser.GameObjects.Container;
  private milestoneToast?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "UIScene" });
  }

  create(): void {
    const { width } = this.scale;
    this.uiSystem = new UISystem(this);
    this.glassUI = new GlassmorphismUI(this);

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
    
    // Listen to events from GameScene
    this.game.events.on("heightUpdate", this.onHeightUpdate, this);
    // this.game.events.on("heightProgress", this.onHeightProgress, this);
    this.game.events.on("scoreUpdate", this.onScoreUpdate, this);
    this.game.events.on("comboUpdate", this.onComboUpdate, this);
    this.game.events.on("heightMilestone", this.onHeightMilestone, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off("heightUpdate", this.onHeightUpdate, this);
      // this.game.events.off("heightProgress", this.onHeightProgress, this);
      this.game.events.off("scoreUpdate", this.onScoreUpdate, this);
      this.game.events.off("comboUpdate", this.onComboUpdate, this);
      this.game.events.off("heightMilestone", this.onHeightMilestone, this);
    });
  }


  private createMinimalUI(): void {
    const { width } = this.scale;
    const uiPadding = 12;

    // Create enhanced glassmorphism UI elements
    
    // Height display (top-left) with glassmorphism
    this.heightBackground = this.glassUI.createGlassPanel({
      width: 120,
      height: 30,
      backgroundColor: 0x04122a,
      borderColor: 0x4adeff,
      borderWidth: 1,
      cornerRadius: 8,
      blur: 8,
      alpha: 0.85,
      glowIntensity: 0.3,
      gradientColors: [0x04122a, 0x0a2842]
    });
    this.heightBackground.setPosition(uiPadding + 60, uiPadding + 15);
    this.heightBackground.setDepth(49).setScrollFactor(0);
    
    this.heightValue = this.add.text(uiPadding + 60, uiPadding + 15, "0 m", {
      fontFamily: "'Segoe UI', sans-serif",
      fontSize: "16px",
      color: "#4adeff",
      stroke: "#000000",
      strokeThickness: 1
    }).setDepth(50).setScrollFactor(0).setOrigin(0.5, 0.5);

    // Score display (top-right) with enhanced glassmorphism
    this.scoreBackground = this.glassUI.createGlassPanel({
      width: 120,
      height: 30,
      backgroundColor: 0x04122a,
      borderColor: 0x6be8ff,
      borderWidth: 1,
      cornerRadius: 8,
      blur: 8,
      alpha: 0.85,
      glowIntensity: 0.4,
      gradientColors: [0x04122a, 0x0a2842]
    });
    this.scoreBackground.setPosition(width - uiPadding - 60, uiPadding + 15);
    this.scoreBackground.setDepth(49).setScrollFactor(0);
    
    this.scoreValue = this.add.text(width - uiPadding - 60, uiPadding + 15, "0", {
      fontFamily: "'Segoe UI', sans-serif",
      fontSize: "16px",
      color: "#6be8ff",
      stroke: "#000000",
      strokeThickness: 1
    }).setDepth(50).setScrollFactor(0).setOrigin(0.5, 0.5);

    // High score display (top-center) with special glassmorphism styling
    this.highBackground = this.glassUI.createGlassPanel({
      width: 140,
      height: 30,
      backgroundColor: 0x132b4d,
      borderColor: 0xff9cf7,
      borderWidth: 1,
      cornerRadius: 10,
      blur: 10,
      alpha: 0.9,
      glowIntensity: 0.5,
      gradientColors: [0x132b4d, 0x2b3c7a]
    });
    this.highBackground.setPosition(width / 2, uiPadding + 15);
    this.highBackground.setDepth(49).setScrollFactor(0);
    
    this.highScoreValue = this.add.text(width / 2, uiPadding + 15, "HIGH: 0", {
      fontFamily: "'Segoe UI', sans-serif",
      fontSize: "14px",
      color: "#ff9cf7",
      stroke: "#000000",
      strokeThickness: 1
    }).setDepth(50).setScrollFactor(0).setOrigin(0.5, 0.5);

    // Add ambient glass particles for enhanced visual appeal
    const glassParticles = this.glassUI.createGlassParticles(width / 2, 100, 8);
    glassParticles.setDepth(48).setScrollFactor(0);

    this.updateHighScoreDisplay();
  }



  private createScoreBurstContainer(): void {
    this.scoreBurstContainer = this.add.container(0, 0).setDepth(80).setScrollFactor(0);
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
    if (payload.passive || payload.count <= 1) {
      return;
    }

    this.spawnComboPulse(payload);
  }

  private spawnComboPulse(payload: { count: number; multiplier: number; bonus: number }): void {
    const indicatorX = this.scale.width - 88;
    const indicatorY = 58;
    const comboLabel = this.uiSystem.createGlowingText(
      `COMBO x${payload.count}`,
      indicatorX,
      indicatorY,
      {
        fontSize: "18px",
        color: "#ffe680",
        stroke: "#0a1a33",
        strokeThickness: 3,
        shadowColor: "#fff",
        shadowBlur: 12,
      }
    );
    comboLabel.setOrigin(0.5).setScrollFactor(0).setDepth(90).setAlpha(0);

    this.tweens.add({
      targets: comboLabel,
      alpha: 1,
      y: indicatorY - 8,
      duration: 260,
      ease: "Sine.easeOut",
    });
    this.tweens.add({
      targets: comboLabel,
      y: indicatorY - 44,
      alpha: 0,
      duration: 760,
      delay: 260,
      ease: "Quad.easeIn",
      onComplete: () => comboLabel.destroy(),
    });

    if (payload.bonus > 0) {
      const bonusLabel = this.uiSystem.createGlowingText(
        `+${payload.bonus}`,
        indicatorX,
        indicatorY + 18,
        {
          fontSize: "14px",
          color: "#ffa45a",
          stroke: "#0a1a33",
          strokeThickness: 2,
        }
      );
      bonusLabel.setOrigin(0.5).setScrollFactor(0).setDepth(90).setAlpha(0);
      this.tweens.add({
        targets: bonusLabel,
        alpha: 1,
        y: indicatorY + 2,
        duration: 200,
        ease: "Sine.easeOut",
      });
      this.tweens.add({
        targets: bonusLabel,
        alpha: 0,
        y: indicatorY - 26,
        duration: 640,
        delay: 220,
        ease: "Quad.easeIn",
        onComplete: () => bonusLabel.destroy(),
      });
    }

    for (let i = 0; i < 6; i += 1) {
      const angle = (i / 6) * Phaser.Math.PI2 + Phaser.Math.FloatBetween(-0.2, 0.2);
      const radius = Phaser.Math.Between(28, 46);
      const spark = this.add
        .circle(indicatorX, indicatorY, 3, 0xfff3c1, 0.8)
        .setOrigin(0.5)
        .setDepth(88)
        .setScrollFactor(0);
      this.scoreBurstContainer.add(spark);

      this.tweens.add({
        targets: spark,
        x: indicatorX + Math.cos(angle) * radius,
        y: indicatorY + Math.sin(angle) * radius,
        alpha: 0,
        scale: 0.4,
        duration: 520,
        ease: "Quad.easeOut",
        onComplete: () => spark.destroy(),
      });
    }
  }

  private onHeightMilestone(payload: { height: number; bonus: number }): void {
    this.showMilestoneToast(payload.height, payload.bonus);
    this.createScoreBurst();
  }

  private updateHeightDisplay(): void {
    // Enhanced animation with glassmorphism effects
    this.tweens.add({
      targets: this.heightValue,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: "Back.easeOut",
    });

    // Create enhanced number spark with glow effect
    const heightBounds = this.heightValue.getBounds();
    this.createEnhancedNumberSpark(heightBounds.centerX, heightBounds.centerY, 0x4adeff);

    // Add temporary glow to height panel
    const heightPanel = this.heightBackground.first as Phaser.GameObjects.Graphics;
    if (heightPanel) {
      this.tweens.add({
        targets: heightPanel,
        alpha: 1,
        duration: 150,
        yoyo: true,
        ease: "Sine.easeOut"
      });
    }

    const formatted = `${this.currentHeight} m`;
    this.heightValue.setText(formatted);
    this.updateDomMetric(this.heightDisplayEl, formatted, true);
  }

  private updateScoreDisplay(delta = 0): void {
    const scaleBoost = 1.08 + Math.min(Math.abs(delta) / 120, 0.32);
    this.tweens.add({
      targets: this.scoreValue,
      scaleX: scaleBoost,
      scaleY: scaleBoost,
      duration: 220,
      yoyo: true,
      ease: "Back.easeOut",
    });

    // Add temporary glow effect to score panel
    const scorePanel = this.scoreBackground.first as Phaser.GameObjects.Graphics;
    if (scorePanel && delta > 25) {
      this.tweens.add({
        targets: scorePanel,
        alpha: 1,
        duration: 150,
        yoyo: true,
        ease: "Sine.easeOut"
      });
    }

    const formatted = this.formatScore(this.currentScore);
    this.scoreValue.setText(formatted);
    this.updateDomMetric(this.scoreDisplayEl, formatted, delta > 0);
  }

  private createEnhancedNumberSpark(x: number, y: number, color: number): void {
    const spark = this.add.circle(x, y, 3, color, 0.8)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(85);
    
    // Add glow rings
    for (let i = 1; i <= 2; i++) {
      const ring = this.add.graphics({ x, y }).setDepth(84 - i);
      ring.lineStyle(2, color, 0.4 / i);
      ring.strokeCircle(0, 0, 4 + i * 3);
      
      this.tweens.add({
        targets: ring,
        alpha: 0,
        scaleX: 2 + i,
        scaleY: 1 + i * 0.5,
        duration: 300 + i * 100,
        ease: "Quad.easeOut",
        onComplete: () => ring.destroy()
      });
    }

    // Animate main spark
    this.tweens.add({
      targets: spark,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      y: y - 30,
      duration: 600,
      ease: "Power2",
      onComplete: () => spark.destroy()
    });
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
    // Update glassmorphism panels with dynamic colors
    const heightPanel = this.heightBackground.first as Phaser.GameObjects.Graphics;
    if (heightPanel) {
      heightPanel.clear();
      heightPanel.fillGradientStyle(
        heightFill.r,
        heightFill.g,
        heightFill.b,
        0.82 + progress * 0.1
      );
      heightPanel.fillRoundedRect(-60, -15, 120, 30, 8);
      heightPanel.lineStyle(
        1.6,
        Phaser.Display.Color.GetColor(heightAccent.r, heightAccent.g, heightAccent.b),
        0.52 + progress * 0.25
      );
      heightPanel.strokeRoundedRect(-60, -15, 120, 30, 8);
    }
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
    
    // Update score glassmorphism panel
    const scorePanel = this.scoreBackground.first as Phaser.GameObjects.Graphics;
    if (scorePanel) {
      scorePanel.clear();
      scorePanel.fillGradientStyle(
        scoreFill.r,
        scoreFill.g,
        scoreFill.b,
        0.82 + progress * 0.12
      );
      scorePanel.fillRoundedRect(-60, -15, 120, 30, 8);
      scorePanel.lineStyle(
        1.6,
        Phaser.Display.Color.GetColor(scoreAccent.r, scoreAccent.g, scoreAccent.b),
        0.5 + progress * 0.28
      );
      scorePanel.strokeRoundedRect(-60, -15, 120, 30, 8);
    }
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
    
    // Update high score glassmorphism panel
    const highPanel = this.highBackground.first as Phaser.GameObjects.Graphics;
    if (highPanel) {
      highPanel.clear();
      highPanel.fillGradientStyle(
        highFill.r,
        highFill.g,
        highFill.b,
        0.84 + progress * 0.12
      );
      highPanel.fillRoundedRect(-70, -15, 140, 30, 10);
      highPanel.lineStyle(
        1.8,
        Phaser.Display.Color.GetColor(highAccent.r, highAccent.g, highAccent.b),
        0.6 + progress * 0.25
      );
      highPanel.strokeRoundedRect(-70, -15, 140, 30, 10);
    }
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
