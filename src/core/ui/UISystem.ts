import Phaser from "phaser";

export interface UIButtonConfig {
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  cornerRadius?: number;
  padding?: { x: number; y: number };
  onClick?: () => void;
  onHover?: () => void;
  onHoverOut?: () => void;
  disabled?: boolean;
}

export interface UIPanelConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  cornerRadius?: number;
  alpha?: number;
  padding?: { x: number; y: number };
}

export class UISystem {
  private scene: Phaser.Scene;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Create a beautiful button with ice-themed styling
  createButton(config: UIButtonConfig): Phaser.GameObjects.Container {
    const {
      text,
      x,
      y,
      width = 200,
      height = 50,
      fontSize = "16px",
      backgroundColor = 0x0a1e3e,
      textColor = "#e9f3ff",
      borderColor = 0x4adeff,
      borderWidth = 2,
      cornerRadius = 12,
      padding = { x: 20, y: 12 },
      onClick,
      onHover,
      onHoverOut,
      disabled = false
    } = config;

    const container = this.scene.add.container(x, y);

    // Background with rounded corners
    const background = this.scene.add.graphics();
    background.fillStyle(backgroundColor, 0.9);
    background.fillRoundedRect(-width/2, -height/2, width, height, cornerRadius);
    background.lineStyle(borderWidth, borderColor, 0.8);
    background.strokeRoundedRect(-width/2, -height/2, width, height, cornerRadius);

    // Glow effect (outer glow)
    const glow = this.scene.add.graphics();
    glow.fillStyle(borderColor, 0.1);
    glow.fillRoundedRect(-width/2 - 4, -height/2 - 4, width + 8, height + 8, cornerRadius + 4);
    glow.setVisible(false);

    // Text
    const textObj = this.scene.add.text(0, 0, text, {
      fontSize,
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: textColor,
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2
    });
    textObj.setOrigin(0.5);

    container.add([glow, background, textObj]);

    // Set interactive
    if (!disabled) {
      background.setInteractive(
        new Phaser.Geom.Rectangle(-width/2, -height/2, width, height),
        Phaser.Geom.Rectangle.Contains
      );

      background.on("pointerover", () => {
        if (!disabled) {
          textObj.setScale(1.05);
          background.setAlpha(0.95);
          textObj.setTint(0xffffff);
          background.setStrokeStyle(borderWidth + 1, borderColor, 1);
          glow.setVisible(true);
          onHover?.();
        }
      });

      background.on("pointerout", () => {
        textObj.setScale(1);
        background.setAlpha(0.9);
        textObj.clearTint();
        background.setStrokeStyle(borderWidth, borderColor, 0.8);
        glow.setVisible(false);
        onHoverOut?.();
      });

      background.on("pointerdown", () => {
        this.scene.tweens.add({
          targets: container,
          scaleX: 0.95,
          scaleY: 0.95,
          duration: 100,
          yoyo: true,
          ease: "Power2"
        });
        onClick?.();
      });
    }

    return container;
  }

  // Create a glassmorphism panel
  createPanel(config: UIPanelConfig): Phaser.GameObjects.Container {
    const {
      x,
      y,
      width,
      height,
      backgroundColor = 0x030d20,
      borderColor = 0x4adeff,
      borderWidth = 1,
      cornerRadius = 16,
      alpha = 0.9,
      padding = { x: 0, y: 0 }
    } = config;

    const container = this.scene.add.container(x, y);

    // Main background with glassmorphism effect
    const background = this.scene.add.graphics();
    background.fillStyle(backgroundColor, alpha);
    background.fillRoundedRect(-width/2, -height/2, width, height, cornerRadius);
    
    // Subtle border
    background.lineStyle(borderWidth, borderColor, 0.3);
    background.strokeRoundedRect(-width/2, -height/2, width, height, cornerRadius);

    // Subtle inner glow
    const innerGlow = this.scene.add.graphics();
    innerGlow.lineStyle(2, borderColor, 0.1);
    innerGlow.strokeRoundedRect(-width/2 + 4, -height/2 + 4, width - 8, height - 8, cornerRadius - 4);

    container.add([background, innerGlow]);

    return container;
  }

  // Create a beautiful text display with glow effect
  createGlowingText(
    text: string,
    x: number,
    y: number,
    style: {
      fontSize?: string;
      color?: string;
      fontStyle?: string;
      stroke?: string;
      strokeThickness?: number;
    } = {}
  ): Phaser.GameObjects.Text {
    const {
      fontSize = "24px",
      color = "#e9f3ff",
      fontStyle = "bold",
      stroke = "#4adeff",
      strokeThickness = 2
    } = style;

    const textObj = this.scene.add.text(x, y, text, {
      fontSize,
      color,
      fontStyle,
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      stroke,
      strokeThickness
    });

    // Add subtle glow animation
    this.scene.tweens.add({
      targets: textObj,
      alpha: 0.8,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    return textObj;
  }

  // Create a particle background for menus
  createParticleBackground(): void {
    const particles = this.scene.add.particles(0, 0, "particle", {
      x: 0,
      y: 0,
      quantity: 3,
      frequency: 200,
      lifespan: 3000,
      speed: { min: 10, max: 30 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.6, end: 0 },
      tint: [0x4adeff, 0x9acbff, 0xe9f3ff],
      blendMode: Phaser.BlendModes.ADD
    });

    // Create invisible emitter that follows screen bounds
    particles.createEmitter({
      follow: this.scene.cameras.main,
      quantity: 2,
      frequency: 150,
      lifespan: 2000,
      speed: { min: 5, max: 15 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.4, end: 0 },
      tint: [0x4adeff, 0x9acbff, 0xe9f3ff]
    });
  }
}