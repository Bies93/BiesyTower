import Phaser from "phaser";
import { transitionToGame } from "../core/scene/SceneController";
import { UISystem } from "../core/ui/UISystem";

/**
 * MenuScene:
 * - Enhanced Hauptmenü mit modernem Design und Animationen
 * - Visual Design mit Ice-Theme und Glow-Effekten
 */
export class MenuScene extends Phaser.Scene {
  private uiSystem!: UISystem;
  private startButton!: Phaser.GameObjects.Container;
  private settingsButton!: Phaser.GameObjects.Container;
  private title!: Phaser.GameObjects.Text;
  private subtitle!: Phaser.GameObjects.Text;
  private isStarting = false;

  constructor() {
    super({ key: "MenuScene" });
  }

  create(): void {
    console.log("MenuScene: Creating enhanced menu");
    const { width, height } = this.scale;
    this.uiSystem = new UISystem(this);

    // Animated background fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);
    
    // Create particle background
    this.createParticleBackground();
    
    // Create decorative elements
    this.createBackgroundDecorations();
    
    // Create the beautiful title
    this.createTitle();
    
    // Create menu buttons
    this.createMenuButtons();
    
    // Add floating animation to title
    this.addTitleAnimation();
    
    // Setup input
    this.setupInput();
  }

  private createParticleBackground(): void {
    // Create ice crystal particles
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);
      const size = Phaser.Math.Between(2, 6);
      
      const particle = this.add.graphics();
      particle.fillStyle(0x4adeff, 0.3);
      particle.fillCircle(x, y, size);
      
      // Animate particles
      this.tweens.add({
        targets: particle,
        alpha: 0,
        y: y - Phaser.Math.Between(50, 200),
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
        ease: "Power2.easeInOut"
      });
    }
  }

  private createBackgroundDecorations(): void {
    const { width, height } = this.scale;
    
    // Create floating ice shards
    for (let i = 0; i < 5; i++) {
      const shard = this.add.graphics();
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      
      shard.fillStyle(0x9acbff, 0.1);
      shard.fillTriangle(
        x, y - 20,
        x - 15, y + 15,
        x + 15, y + 15
      );
      
      // Floating animation
      this.tweens.add({
        targets: shard,
        y: y + 20,
        duration: 4000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: i * 800
      });
    }
  }

  private createTitle(): void {
    const { width, height } = this.scale;
    
    // Main title with glow effect
    this.title = this.uiSystem.createGlowingText("ICY TOWER", width / 2, height / 2 - 100, {
      fontSize: "48px",
      color: "#e9f3ff"
    });
    
    // Subtitle
    this.subtitle = this.uiSystem.createGlowingText("MODERN EDITION", width / 2, height / 2 - 60, {
      fontSize: "24px",
      color: "#9acbff"
    });
  }

  private createMenuButtons(): void {
    const { width, height } = this.scale;
    
    // Start button
    this.startButton = this.uiSystem.createButton({
      text: "START GAME",
      x: width / 2,
      y: height / 2 + 20,
      fontSize: "18px",
      backgroundColor: 0x0a1e3e,
      textColor: "#e9f3ff",
      borderColor: 0x4adeff,
      onClick: () => this.startGame(),
      onHover: () => this.playHoverSound(),
      onHoverOut: () => this.playHoverOutSound()
    });
    
    // Settings button
    this.settingsButton = this.uiSystem.createButton({
      text: "SETTINGS",
      x: width / 2,
      y: height / 2 + 80,
      fontSize: "16px",
      backgroundColor: 0x0a1e3e,
      textColor: "#9acbff",
      borderColor: 0x4adeff,
      onClick: () => this.openSettings(),
      onHover: () => this.playHoverSound(),
      onHoverOut: () => this.playHoverOutSound()
    });
  }

  private addTitleAnimation(): void {
    // Add subtle pulsing effect to title
    this.tweens.add({
      targets: [this.title, this.subtitle],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  private setupInput(): void {
    // Keyboard input
    this.input.keyboard?.on("keydown-SPACE", () => this.startGame());
    this.input.keyboard?.on("keydown-ENTER", () => this.startGame());
    
    // Mouse/touch input on buttons
    this.startButton.setInteractive();
    this.settingsButton.setInteractive();
  }

  private startGame(): void {
    if (this.isStarting) return;
    this.isStarting = true;
    
    console.log("MenuScene: Starting game");
    
    // Add start animation
    this.tweens.add({
      targets: [this.startButton, this.settingsButton],
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 150,
      yoyo: true,
      ease: "Power2"
    });
    
    // Camera fade with particle burst
    this.createStartBurst();
    
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      transitionToGame(this);
    });
  }

  private openSettings(): void {
    console.log("MenuScene: Opening settings (TODO)");
    // TODO: Implement settings scene
  }

  private createStartBurst(): void {
    // Particle burst effect
    const burst = this.add.particles(0, 0, 'particle', {
      x: this.scale.width / 2,
      y: this.scale.height / 2 + 20,
      quantity: 10,
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 800,
      alpha: { start: 0.8, end: 0 },
      tint: [0x4adeff, 0x9acbff, 0xe9f3ff]
    });
    
    // Clean up particles after burst
    this.time.delayedCall(1000, () => burst.destroy());
  }

  private playHoverSound(): void {
    // TODO: Add sound effects
    console.log("UI: Hover sound");
  }

  private playHoverOutSound(): void {
    // TODO: Add sound effects
    console.log("UI: Hover out sound");
  }
}
