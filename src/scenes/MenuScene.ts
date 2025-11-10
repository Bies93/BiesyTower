import Phaser from "phaser";
import { transitionToGame } from "../core/scene/SceneController";
import { UISystem } from "../core/ui/UISystem";
import { GlassmorphismUI } from "../core/ui/GlassmorphismUI";
import { IMAGE_KEYS } from "../assets/assetManifest";

/**
 * MenuScene:
 * - Enhanced Hauptmenü mit modernem Design und Animationen
 * - Visual Design mit Neon-Theme und Glow-Effekten
 */
export class MenuScene extends Phaser.Scene {
  private uiSystem!: UISystem;
  private glassUI!: GlassmorphismUI;
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
    this.glassUI = new GlassmorphismUI(this);

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
    const palette = [0x0ff7ff, 0xff4bf2, 0x7b2dff, 0x12f7b9];

    // Create neon particles that drift upwards for a cyber look
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);
      const size = Phaser.Math.Between(2, 6);
      const color = Phaser.Utils.Array.GetRandom(palette);

      const particle = this.add.graphics();
      particle.fillStyle(color, Phaser.Math.FloatBetween(0.2, 0.4));
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

      shard.fillStyle(0x7b2dff, 0.12);
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
    
    // Create glassmorphism background for title
    const titleBackground = this.glassUI.createGlassPanel({
      width: 400,
      height: 120,
      backgroundColor: 0x0a1e3e,
      borderColor: 0x12f7ff,
      borderWidth: 2,
      cornerRadius: 20,
      blur: 15,
      alpha: 0.9,
      glowIntensity: 0.6,
      gradientColors: [0x0a1e3e, 0x1a3f63]
    });
    titleBackground.setPosition(width / 2, height / 2 - 110);
    titleBackground.setDepth(0);
    
    // Main title with enhanced glow effect
    this.title = this.uiSystem.createGlowingText("BIESYTOWER", width / 2, height / 2 - 110, {
      fontSize: "56px",
      color: "#12f7ff",
      stroke: "#7b2dff",
      strokeThickness: 8,
      shadowColor: "#7b2dff",
      shadowBlur: 28
    });
    this.title.setOrigin(0.5);
    this.title.setAlpha(1);
    this.title.setDepth(1);

    // Subtitle with glassmorphism panel
    const subtitleBackground = this.glassUI.createGlassPanel({
      width: 300,
      height: 60,
      backgroundColor: 0x132b4d,
      borderColor: 0xff9cf7,
      borderWidth: 1,
      cornerRadius: 12,
      blur: 10,
      alpha: 0.85,
      glowIntensity: 0.4,
      gradientColors: [0x132b4d, 0x2b3c7a]
    });
    subtitleBackground.setPosition(width / 2, height / 2 - 50);
    subtitleBackground.setDepth(0);

    this.subtitle = this.uiSystem.createGlowingText("NEON ASCENT EDITION", width / 2, height / 2 - 50, {
      fontSize: "26px",
      color: "#ffe6ff",
      stroke: "#12f7ff",
      strokeThickness: 4,
      shadowColor: "#12f7ff",
      shadowBlur: 20,
      fontStyle: "bold"
    });
    this.subtitle.setOrigin(0.5);
    this.subtitle.setAlpha(0.92);
    this.subtitle.setDepth(1);

    // Add animated glow particles around title
    const titleGlow = this.glassUI.createAnimatedGlow(width / 2, height / 2 - 110, {
      baseColor: 0x12f7ff,
      glowColor: 0x7b2dff,
      intensity: 0.8,
      pulseSpeed: 2000,
      glowRadius: 60
    });
    titleGlow.setDepth(-1);
  }

  private createMenuButtons(): void {
    const { width, height } = this.scale;
    
    // Enhanced start button with glassmorphism
    this.startButton = this.glassUI.createGlassButton(
      width / 2,
      height / 2 + 20,
      200,
      50,
      "START GAME",
      {
        backgroundColor: 0x0a1e3e,
        borderColor: 0x12f7ff,
        borderWidth: 2,
        cornerRadius: 16,
        blur: 12,
        alpha: 0.9,
        glowIntensity: 0.5,
        gradientColors: [0x0a1e3e, 0x1a3f63]
      }
    );
    this.startButton.setDepth(2);

    // Enhanced settings button with glassmorphism
    this.settingsButton = this.glassUI.createGlassButton(
      width / 2,
      height / 2 + 80,
      180,
      45,
      "SETTINGS",
      {
        backgroundColor: 0x132b4d,
        borderColor: 0x7b2dff,
        borderWidth: 2,
        cornerRadius: 14,
        blur: 10,
        alpha: 0.85,
        glowIntensity: 0.4,
        gradientColors: [0x132b4d, 0x2b3c7a]
      }
    );
    this.settingsButton.setDepth(2);

    // Add hover effects
    this.setupButtonHoverEffects(this.startButton, 0x12f7ff);
    this.setupButtonHoverEffects(this.settingsButton, 0x7b2dff);
  }

  private setupButtonHoverEffects(button: Phaser.GameObjects.Container, glowColor: number): void {
    button.on('pointerover', () => {
      this.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        ease: "Back.easeOut"
      });

      // Add glow effect on hover
      const glow = this.glassUI.createAnimatedGlow(0, 0, {
        baseColor: glowColor,
        glowColor: glowColor,
        intensity: 0.6,
        pulseSpeed: 800,
        glowRadius: 30
      });
      button.add(glow);
    });

    button.on('pointerout', () => {
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: "Back.easeOut"
      });

      // Remove glow effect
      const glow = button.getAt(1);
      if (glow) {
        glow.destroy();
      }
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
    this.startButton.on("pointerup", () => this.startGame());
    this.settingsButton.on("pointerup", () => this.openSettings());
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
    const burst = this.add.particles(0, 0, IMAGE_KEYS.particle, {
      x: this.scale.width / 2,
      y: this.scale.height / 2 + 20,
      quantity: 10,
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 800,
      alpha: { start: 0.8, end: 0 },
      tint: [0x0ff7ff, 0xff4bf2, 0x7b2dff]
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
