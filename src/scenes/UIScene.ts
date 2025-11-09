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
  private currentHeight: number = 0;
  private currentScore: number = 0;
  private highScore: number = 0;
  private highScoreDisplayEl?: HTMLElement;
  private highScorePillEl?: HTMLElement;
  private heightValueEl?: HTMLElement;
  private scoreValueEl?: HTMLElement;
  private heightPillEl?: HTMLElement;
  private scorePillEl?: HTMLElement;
  private hudBarEl?: HTMLElement;
  private heightAnchor!: Phaser.GameObjects.Zone;
  private scoreAnchor!: Phaser.GameObjects.Zone;
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
    this.uiSystem = new UISystem(this);

    const hudBar = document.querySelector(".hud-bar");
    if (hudBar instanceof HTMLElement) {
      this.hudBarEl = hudBar;
      this.hudBarEl.classList.remove("is-dimmed");
    }

    const heightValueElement = document.getElementById("hud-height-value");
    if (heightValueElement instanceof HTMLElement) {
      this.heightValueEl = heightValueElement;
      this.heightPillEl = heightValueElement.closest(".hud-pill") ?? undefined;
    }

    const scoreValueElement = document.getElementById("hud-score-value");
    if (scoreValueElement instanceof HTMLElement) {
      this.scoreValueEl = scoreValueElement;
      this.scorePillEl = scoreValueElement.closest(".hud-pill") ?? undefined;
    }

    const highScoreElement = document.getElementById("high-score-display");
    if (highScoreElement instanceof HTMLElement) {
      this.highScoreDisplayEl = highScoreElement;
      this.highScorePillEl = highScoreElement.closest(".hud-pill") ?? undefined;
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

    this.heightAnchor = this.add.zone(140, 84, 1, 1).setDepth(1.05);
    this.scoreAnchor = this.add.zone(this.scale.width - 140, 84, 1, 1).setDepth(1.05);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layoutAnchors, this);
    this.layoutAnchors();

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
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layoutAnchors, this);
    });
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

  private layoutAnchors(): void {
    const { width } = this.scale;
    const horizontalPadding = Phaser.Math.Clamp(width * 0.22, 96, 196);
    const anchorY = 84;

    if (this.heightAnchor) {
      this.heightAnchor.setPosition(horizontalPadding, anchorY);
    }

    if (this.scoreAnchor) {
      this.scoreAnchor.setPosition(width - horizontalPadding, anchorY);
    }
  }

  private pulseDomValue(valueEl?: HTMLElement, pillEl?: HTMLElement, scale = 1.16): void {
    if (!valueEl) {
      return;
    }

    valueEl.style.setProperty("--pulse-scale", scale.toFixed(2));
    valueEl.classList.remove("is-updated");
    void valueEl.offsetWidth;
    valueEl.classList.add("is-updated");

    if (pillEl) {
      pillEl.classList.remove("is-updated");
      void pillEl.offsetWidth;
      pillEl.classList.add("is-updated");
    }
  }

  private updateHudAccent(progress: number): void {
    if (!this.hudBarEl) {
      return;
    }

    const accent = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x4adeff),
      Phaser.Display.Color.ValueToColor(0xff8dd9),
      100,
      progress * 100
    );
    const softAccent = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x1c3c5b),
      Phaser.Display.Color.ValueToColor(0x62e2ff),
      100,
      progress * 100
    );

    const accentColor = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${(0.68 + progress * 0.22).toFixed(2)})`;
    const softColor = `rgba(${softAccent.r}, ${softAccent.g}, ${softAccent.b}, ${(0.2 + progress * 0.3).toFixed(2)})`;

    this.hudBarEl.style.setProperty("--hud-accent", accentColor);
    this.hudBarEl.style.setProperty("--hud-accent-soft", softColor);

    const pills = [this.heightPillEl, this.scorePillEl, this.highScorePillEl];
    pills.forEach((pill) => pill?.style.setProperty("--hud-pill-border", accentColor));
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
    if (this.heightValueEl) {
      this.heightValueEl.textContent = this.currentHeight.toString();
      this.pulseDomValue(this.heightValueEl, this.heightPillEl, 1.14);
    }

    // Add spark effect near the DOM anchored height display
    if (this.heightAnchor) {
      this.createNumberSpark(this.heightAnchor.x, this.heightAnchor.y);
    }
  }

  private updateScoreDisplay(delta = 0): void {
    const intensity = 1.16 + Math.min(Math.abs(delta) / 220, 0.24);

    if (this.scoreValueEl) {
      this.scoreValueEl.textContent = this.currentScore.toString();
      this.pulseDomValue(this.scoreValueEl, this.scorePillEl, intensity);
    }

    if (this.scoreAnchor) {
      const originalY = this.scoreAnchor.y;
      this.tweens.add({
        targets: this.scoreAnchor,
        y: originalY - Math.min(10, 4 + Math.abs(delta) * 0.05),
        duration: 140,
        yoyo: true,
        ease: "Sine.easeOut",
        onComplete: () => {
          this.scoreAnchor.setY(originalY);
        }
      });
    }
  }

  private updateHighScoreDisplay(pulse = false): void {
    if (!this.highScoreDisplayEl) {
      return;
    }

    this.highScoreDisplayEl.textContent = this.highScore.toString();

    if (pulse) {
      this.pulseDomValue(this.highScoreDisplayEl, this.highScorePillEl, 1.22);
    }
  }

  private createScoreBurst(): void {
    if (!this.scoreAnchor) {
      return;
    }

    const { x: burstX, y: burstY } = this.scoreAnchor;

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
    this.updateHudAccent(progress);
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
    if (this.hudBarEl) {
      this.hudBarEl.classList.add("is-dimmed");
    }

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
