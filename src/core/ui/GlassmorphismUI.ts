import Phaser from "phaser";

export interface GlassmorphismConfig {
  width: number;
  height: number;
  backgroundColor?: number;
  borderColor?: number;
  borderWidth?: number;
  cornerRadius?: number;
  blur?: number;
  alpha?: number;
  glowIntensity?: number;
  gradientColors?: number[];
}

export interface AnimatedGlowConfig {
  baseColor: number;
  glowColor: number;
  intensity: number;
  pulseSpeed: number;
  glowRadius: number;
}

export class GlassmorphismUI {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Creates a glassmorphism panel with enhanced visual effects
   */
  public createGlassPanel(config: GlassmorphismConfig): Phaser.GameObjects.Container {
    const {
      width,
      height,
      backgroundColor = 0x0a1e3e,
      borderColor = 0x4adeff,
      borderWidth = 1,
      cornerRadius = 16,
      blur = 12,
      alpha = 0.85,
      glowIntensity = 0.3,
      gradientColors = [0x0a1e3e, 0x1a3f63]
    } = config;

    const container = this.scene.add.container(0, 0);

    // Main glass background with gradient
    const background = this.scene.add.graphics();
    background.fillGradientStyle(
      gradientColors[0],
      gradientColors[1],
      gradientColors[2] || gradientColors[1],
      gradientColors[3] || gradientColors[0],
      alpha
    );
    background.fillRoundedRect(-width/2, -height/2, width, height, cornerRadius);

    // Glass blur effect simulation
    const blurLayer = this.scene.add.graphics();
    blurLayer.fillStyle(0x4adeff, blur * 0.01);
    blurLayer.fillRoundedRect(-width/2 + 2, -height/2 + 2, width - 4, height - 4, cornerRadius - 2);

    // Border with glow
    const border = this.scene.add.graphics();
    border.lineStyle(borderWidth, borderColor, 0.6 + glowIntensity);
    border.strokeRoundedRect(-width/2, -height/2, width, height, cornerRadius);

    // Inner glow for depth
    const innerGlow = this.scene.add.graphics();
    innerGlow.lineStyle(1, borderColor, glowIntensity * 0.3);
    innerGlow.strokeRoundedRect(-width/2 + 4, -height/2 + 4, width - 8, height - 8, cornerRadius - 4);

    // Add subtle noise texture
    this.addNoiseTexture(background, width, height, 0.05);

    container.add([background, blurLayer, border, innerGlow]);
    return container;
  }

  /**
   * Creates an animated glow effect for UI elements
   */
  public createAnimatedGlow(x: number, y: number, config: AnimatedGlowConfig): Phaser.GameObjects.Container {
    const {
      baseColor,
      glowColor,
      intensity,
      pulseSpeed,
      glowRadius
    } = config;

    const container = this.scene.add.container(x, y);

    // Base glow layer
    const baseGlow = this.scene.add.circle(0, 0, glowRadius, glowColor, intensity * 0.3);
    baseGlow.setBlendMode(Phaser.BlendModes.ADD);

    // Pulsing glow layer
    const pulseGlow = this.scene.add.circle(0, 0, glowRadius * 0.7, glowColor, intensity * 0.5);
    pulseGlow.setBlendMode(Phaser.BlendModes.ADD);

    // Core element
    const core = this.scene.add.circle(0, 0, glowRadius * 0.3, baseColor, 1);

    container.add([baseGlow, pulseGlow, core]);

    // Animate the pulse effect
    this.scene.tweens.add({
      targets: pulseGlow,
      alpha: intensity * 0.2,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: pulseSpeed,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    return container;
  }

  /**
   * Creates a glassmorphism button with enhanced hover effects
   */
  public createGlassButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    config: Partial<GlassmorphismConfig> = {}
  ): Phaser.GameObjects.Container {
    const buttonConfig: GlassmorphismConfig = {
      width,
      height,
      backgroundColor: 0x0a1e3e,
      borderColor: 0x4adeff,
      borderWidth: 2,
      cornerRadius: 12,
      blur: 8,
      alpha: 0.9,
      glowIntensity: 0.4,
      gradientColors: [0x0a1e3e, 0x1a3f63],
      ...config
    };

    const container = this.createGlassPanel(buttonConfig);
    container.setPosition(x, y);

    // Button text with glow effect
    const buttonText = this.scene.add.text(0, 0, text, {
      fontSize: "16px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#e9f3ff",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Text glow
    const textGlow = this.scene.add.text(0, 0, text, {
      fontSize: "16px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#4adeff",
      fontStyle: "bold"
    }).setOrigin(0.5).setAlpha(0.3).setBlendMode(Phaser.BlendModes.ADD);

    container.add([buttonText, textGlow]);

    // Make interactive
    const hitArea = new Phaser.Geom.Rectangle(-width/2, -height/2, width, height);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    return container;
  }

  /**
   * Creates a glassmorphism progress bar with animated fill
   */
  public createGlassProgressBar(
    x: number,
    y: number,
    width: number,
    height: number,
    progress: number = 0,
    config: Partial<GlassmorphismConfig> = {}
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // Background panel
    const bgConfig: GlassmorphismConfig = {
      width,
      height,
      backgroundColor: 0x0a1e3e,
      borderColor: 0x4adeff,
      borderWidth: 1,
      cornerRadius: 8,
      blur: 6,
      alpha: 0.8,
      glowIntensity: 0.2,
      ...config
    };

    const background = this.createGlassPanel(bgConfig);
    container.add(background);

    // Progress fill with gradient
    const fillWidth = Math.max(0, (width - 8) * Math.min(1, Math.max(0, progress)));
    const fillHeight = height - 8;

    const progressFill = this.scene.add.graphics();
    progressFill.fillGradientStyle(
      0x4adeff,
      0x6be8ff,
      0x9ef5ff,
      0x4adeff,
      0.9
    );
    progressFill.fillRoundedRect(
      -width/2 + 4,
      -fillHeight/2,
      fillWidth,
      fillHeight,
      4
    );

    // Progress glow
    const progressGlow = this.scene.add.graphics();
    progressGlow.fillStyle(0x4adeff, 0.3);
    progressGlow.fillRoundedRect(
      -width/2 + 4,
      -fillHeight/2,
      fillWidth,
      fillHeight,
      4
    );
    progressGlow.setBlendMode(Phaser.BlendModes.ADD);

    container.add([progressFill, progressGlow]);

    // Store reference for updates
    container.setData('progressFill', progressFill);
    container.setData('progressGlow', progressGlow);
    container.setData('width', width);
    container.setData('height', height);

    return container;
  }

  /**
   * Updates the progress bar fill
   */
  public updateProgressBar(progressBar: Phaser.GameObjects.Container, progress: number): void {
    const progressFill = progressBar.getData('progressFill');
    const progressGlow = progressBar.getData('progressGlow');
    const width = progressBar.getData('width');
    const height = progressBar.getData('height');

    if (progressFill && progressGlow) {
      const fillWidth = Math.max(0, (width - 8) * Math.min(1, Math.max(0, progress)));
      const fillHeight = height - 8;

      progressFill.clear();
      progressFill.fillGradientStyle(
        0x4adeff,
        0x6be8ff,
        0x9ef5ff,
        0x4adeff,
        0.9
      );
      progressFill.fillRoundedRect(
        -width/2 + 4,
        -fillHeight/2,
        fillWidth,
        fillHeight,
        4
      );

      progressGlow.clear();
      progressGlow.fillStyle(0x4adeff, 0.3);
      progressGlow.fillRoundedRect(
        -width/2 + 4,
        -fillHeight/2,
        fillWidth,
        fillHeight,
        4
      );
    }
  }

  /**
   * Creates floating glass particles for ambient effects
   */
  public createGlassParticles(
    x: number,
    y: number,
    count: number = 10
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const particles: Phaser.GameObjects.Arc[] = [];

    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.arc(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        Math.random() * 3 + 1,
        0,
        360,
        false,
        0x4adeff,
        Math.random() * 0.3 + 0.1
      );
      
      particle.setBlendMode(Phaser.BlendModes.ADD);
      particles.push(particle);

      // Animate particle
      this.scene.tweens.add({
        targets: particle,
        y: particle.y + (Math.random() - 0.5) * 50,
        alpha: { from: particle.alpha, to: 0 },
        duration: 2000 + Math.random() * 2000,
        ease: "Sine.easeInOut",
        repeat: -1,
        delay: Math.random() * 1000
      });
    }

    container.add(particles);
    return container;
  }

  /**
   * Adds noise texture to graphics for enhanced glass effect
   */
  private addNoiseTexture(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    intensity: number
  ): void {
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 0.5;
      const alpha = Math.random() * intensity;
      
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(x - width/2, y - height/2, size);
    }
  }
}