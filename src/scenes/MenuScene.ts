import Phaser from "phaser";
import { transitionToGame } from "../core/scene/SceneController";
import { UISystem } from "../core/ui/UISystem";

/**
 * MenuScene:
 * - Enhanced Hauptmenü mit modernem Design und Animationen
 * - Visual Design mit Neon-Theme und Glow-Effekten
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
    // Create neon particle ambience
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);
      const size = Phaser.Math.Between(2, 6);

      const particle = this.add.graphics();
      const colorPalette = [0x40e0ff, 0xff5cf0, 0x8dff57];
      particle.fillStyle(Phaser.Utils.Array.GetRandom(colorPalette), 0.35);
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
    
    // Create floating neon shards
    for (let i = 0; i < 5; i++) {
      const shard = this.add.graphics();
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);

      const shardColors = [0xff66ff, 0x00fff6, 0x8dff57];
      shard.fillStyle(Phaser.Utils.Array.GetRandom(shardColors), 0.12);
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
    
    // Main title with neon glow effect
    this.title = this.uiSystem.createGlowingText("BIESYTOWER", width / 2, height / 2 - 110, {
      fontSize: "64px",
      color: "#39fff3",
      stroke: "#ff2bf2",
      strokeThickness: 8
    });
    this.title.setShadow(0, 0, "#00eaff", 30, true, true);
    this.title.setFontFamily("'Orbitron', 'Segoe UI', sans-serif");
    this.title.setLetterSpacing(4);

    // Subtitle
    this.subtitle = this.uiSystem.createGlowingText("NEON ASCENT EDITION", width / 2, height / 2 - 58, {
      fontSize: "26px",
      color: "#ffe066",
      stroke: "#ff00ff",
      strokeThickness: 4
    });
    this.subtitle.setShadow(0, 0, "#ff6bff", 18, true, true);
    this.subtitle.setFontFamily("'Orbitron', 'Segoe UI', sans-serif");
    this.subtitle.setLetterSpacing(6);
  }

  private createMenuButtons(): void {
    const { width, height } = this.scale;
    
    // Start button
    this.startButton = this.uiSystem.createButton({
      text: "START GAME",
      x: width / 2,
      y: height / 2 + 20,
      fontSize: "18px",
      backgroundColor: 0x140032,
      textColor: "#ffffff",
      borderColor: 0xff2bf2,
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
      backgroundColor: 0x140032,
      textColor: "#39fff3",
      borderColor: 0x00fff6,
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
