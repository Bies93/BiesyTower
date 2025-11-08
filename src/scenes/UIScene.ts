import Phaser from "phaser";

/**
 * UIScene / HUD:
 * - Läuft parallel zur GameScene
 * - Zeigt Score, Höhe, später Combos etc.
 * - Empfängt Updates von GameScene via Events
 */
export class UIScene extends Phaser.Scene {
  private heightText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private currentHeight: number = 0;
  private currentScore: number = 0;

  constructor() {
    super({ key: "UIScene" });
  }

  create(): void {
    const { width } = this.scale;

    // Score display (top right)
    this.scoreText = this.add.text(width - 16, 8, "Score: 0", {
      fontSize: "12px",
      color: "#e9f3ff",
    });
    this.scoreText.setOrigin(1, 0);

    // Height display (top left)
    this.heightText = this.add.text(16, 8, "Height: 0", {
      fontSize: "12px",
      color: "#e9f3ff",
    });
    this.heightText.setOrigin(0, 0);

    // Listen to events from GameScene
    this.game.events.on('heightUpdate', this.onHeightUpdate, this);
  }

  private onHeightUpdate(height: number): void {
    this.currentHeight = Math.floor(height);
    this.currentScore = Math.floor(height * 10); // Simple scoring: height * 10
    
    this.heightText.setText(`Height: ${this.currentHeight}`);
    this.scoreText.setText(`Score: ${this.currentScore}`);

    // Update DOM element if it exists
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
      scoreElement.textContent = this.currentScore.toString();
    }
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
}