import Phaser from "phaser";
import { UISystem } from "../core/ui/UISystem";

/**
 * UIScene / HUD:
 * - Enhanced parallel UI with glassmorphism and modern design
 * - Beautiful score, height displays with animations
 * - Visual feedback and smooth transitions
 * - Empfängt Updates von GameScene via Events
 */
export class UISceneEnhanced extends Phaser.Scene {
  private uiSystem!: UISystem;
  private heightContainer!: Phaser.GameObjects.Container;
  private scoreContainer!: Phaser.GameObjects.Container;
  private heightText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private heightLabel!: Phaser.GameObjects.Text;
  private scoreLabel!: Phaser.GameObjects.Text;
  private currentHeight: number = 0;
  private currentScore: number = 0;
  private scoreBurstContainer!: Phaser.GameObjects.Container;
  private scoreDisplayEl?: HTMLElement;
  private heightDisplayEl?: HTMLElement;
  private highScoreDisplayEl?: HTMLElement;
  private highScore = 0;

  constructor() {
    super({ key: "UIScene" });
  }

  create(): void {
    const { width } = this.scale;
    this.uiSystem = new UISystem(this);

    const scoreElement = document.getElementById("score-display");
    if (scoreElement instanceof HTMLElement) {
      this.scoreDisplayEl = scoreElement;
    }

    const heightElement = document.getElementById("height-display");
    if (heightElement instanceof HTMLElement) {
      this.heightDisplayEl = heightElement;
    }

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
      // Ignore access errors
    }
    this.updateDomValue(this.scoreDisplayEl, this.currentScore.toString());
    this.updateDomValue(this.heightDisplayEl, `${this.currentHeight} m`);
    this.updateDomValue(this.highScoreDisplayEl, this.highScore.toString());

    // Create HUD panels
    this.createHUDPanels();
    
    // Create animated counters
    this.createCounters();
    
    // Create score burst effect
    this.createScoreBurstContainer();
    
    // Listen to events from GameScene
    this.game.events.on("heightUpdate", this.onHeightUpdate, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off("heightUpdate", this.onHeightUpdate, this);
    });
  }

  private createHUDPanels(): void {
    const { width } = this.scale;

    // Height panel (left side)
    this.heightContainer = this.uiSystem.createPanel({
      x: 100,
      y: 50,
      width: 160,
      height: 80,
      backgroundColor: 0x030d20,
      borderColor: 0x4adeff,
      alpha: 0.85
    });

    // Score panel (right side)
    this.scoreContainer = this.uiSystem.createPanel({
      x: width - 100,
      y: 50,
      width: 180,
      height: 80,
      backgroundColor: 0x030d20,
      borderColor: 0x9acbff,
      alpha: 0.85
    });

    // Add floating animation to panels
    this.tweens.add({
      targets: [this.heightContainer, this.scoreContainer],
      y: 52,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  private createCounters(): void {
    const { width } = this.scale;

    // Height label and value
    this.heightLabel = this.uiSystem.createGlowingText("HEIGHT", 100, 35, {
      fontSize: "14px",
      color: "#9acbff"
    });
    this.heightLabel.setOrigin(0.5);

    this.heightText = this.uiSystem.createGlowingText("0", 100, 60, {
      fontSize: "28px",
      color: "#e9f3ff"
    });
    this.heightText.setOrigin(0.5);

    // Score label and value
    this.scoreLabel = this.uiSystem.createGlowingText("SCORE", width - 100, 35, {
      fontSize: "14px",
      color: "#9acbff"
    });
    this.scoreLabel.setOrigin(0.5);

    this.scoreText = this.uiSystem.createGlowingText("0", width - 100, 60, {
      fontSize: "28px",
      color: "#e9f3ff"
    });
    this.scoreText.setOrigin(0.5);

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

  private createScoreBurstContainer(): void {
    this.scoreBurstContainer = this.add.container(0, 0);
  }

  private onHeightUpdate(height: number): void {
    const newHeight = Math.floor(height);
    const newScore = Math.floor(height * 10);

    // Only update if values changed
    if (newHeight !== this.currentHeight) {
      this.currentHeight = newHeight;
      this.currentScore = newScore;

      // Update text with animation
      this.updateHeightDisplay();
      this.updateScoreDisplay();

      if (this.currentScore > this.highScore) {
        this.highScore = this.currentScore;
        try {
          window.localStorage.setItem("biesytower-highscore", this.highScore.toString());
        } catch (error) {
          // Ignore storage errors
        }
        this.updateDomValue(this.highScoreDisplayEl, this.highScore.toString(), true);
      }

      // Create score burst effect for significant changes
      if (newHeight > 0 && newHeight % 50 === 0) {
        this.createScoreBurst();
      }
      this.updateDomValue(this.scoreDisplayEl, this.currentScore.toString(), true);
      this.updateDomValue(this.heightDisplayEl, `${this.currentHeight} m`, true);
    }
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
    this.updateDomValue(this.heightDisplayEl, `${this.currentHeight} m`, true);
    
    // Add spark effect
    this.createNumberSpark(this.heightText.x, this.heightText.y);
  }

  private updateScoreDisplay(): void {
    // Animate text change
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 200,
      yoyo: true,
      ease: "Power2"
    });
    
    this.scoreText.setText(this.currentScore.toString());
    this.updateDomValue(this.scoreDisplayEl, this.currentScore.toString(), true);
  }

  private createScoreBurst(): void {
    const burstX = this.scoreText.x;
    const burstY = this.scoreText.y;
    
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

  private updateDomValue(element: HTMLElement | undefined, value: string, pulse = false): void {
    if (!element) {
      return;
    }

    if (element.textContent === value) {
      if (pulse) {
        element.classList.remove("is-updated");
        void element.offsetWidth;
        element.classList.add("is-updated");
      }
      return;
    }

    element.textContent = value;
    element.classList.remove("is-updated");

    if (pulse) {
      void element.offsetWidth;
      element.classList.add("is-updated");
    }
  }
}