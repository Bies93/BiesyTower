import Phaser from "phaser";

export interface IndustrialUIButtonConfig {
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: string;
  material?: 'steel' | 'rust' | 'iron' | 'concrete';
  wearLevel?: number; // 0-1
  textColor?: string;
  accentColor?: string;
  cornerDamage?: number; // 0-1
  pressDepth?: number;
  hoverBrightness?: number;
  onClick?: () => void;
  onHover?: () => void;
  onHoverOut?: () => void;
  disabled?: boolean;
}

export interface IndustrialUIPanelConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  material?: 'steel' | 'concrete' | 'rust' | 'iron';
  baseColor?: string;
  textureIntensity?: number;
  edgeWear?: number;
  cornerDamage?: number;
  alpha?: number;
  padding?: { x: number; y: number };
}

export interface IndustrialTextConfig {
  fontSize?: string;
  color?: string;
  fontFamily?: string;
  fontStyle?: string;
  material?: 'engraved' | 'raised' | 'flat';
  shadowColor?: string;
  shadowBlur?: number;
  shadowStroke?: boolean;
  isLargeText?: boolean;
}

/**
 * Erweitertes UISystem für industrielle Ästhetik
 * Fokussiert auf Materialität, Lesbarkeit und subtile Effekte
 */
export class IndustrialUISystem {
  private scene: Phaser.Scene;
  private industrialColors = {
    steel: {
      primary: '#4a5568',
      secondary: '#718096',
      dark: '#2d3748',
      light: '#a0aec0'
    },
    rust: {
      primary: '#8b4513',
      secondary: '#cd853f',
      dark: '#654321',
      light: '#daa520'
    },
    iron: {
      primary: '#1a202c',
      secondary: '#2d3748',
      dark: '#0f0f0f',
      light: '#4a5568'
    },
    concrete: {
      primary: '#2d3748',
      secondary: '#4a5568',
      dark: '#1a202c',
      light: '#718096'
    },
    accent: {
      red: '#8b0000',
      black: '#0f0f0f',
      white: '#f0f4f8',
      blue: '#718096'
    }
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Erstellt einen industrielles Button mit Material-Design
   */
  createIndustrialButton(config: IndustrialUIButtonConfig): Phaser.GameObjects.Container {
    const {
      text,
      x,
      y,
      width = 200,
      height = 50,
      fontSize = "16px",
      material = 'steel',
      wearLevel = 0.4,
      textColor = '#f0f4f8',
      accentColor = '#8b4513',
      cornerDamage = 0.3,
      pressDepth = 3,
      hoverBrightness = 0.15,
      onClick,
      onHover,
      onHoverOut,
      disabled = false
    } = config;

    const container = this.scene.add.container(x, y);

    // Material-spezifische Farben
    const materialColors = this.industrialColors[material];
    const baseColor = this.hexToRgb(materialColors.primary);

    // Haupt-Panel mit Material-Effekten
    const background = this.createMaterialPanel(width, height, material, wearLevel, cornerDamage);
    container.add(background);

    // Button-Text mit optimierter Lesbarkeit
    const buttonText = this.createOptimizedText(text, 0, 0, {
      fontSize,
      color: textColor,
      material: 'engraved',
      isLargeText: height > 60
    });
    container.add(buttonText);

    // Interaktive Eigenschaften
    if (!disabled) {
      this.setupIndustrialInteractions(container, {
        width,
        height,
        pressDepth,
        hoverBrightness,
        onClick,
        onHover,
        onHoverOut
      });
    }

    return container;
  }

  /**
   * Erstellt ein industrielles Panel mit Textur-Effekten
   */
  createIndustrialPanel(config: IndustrialUIPanelConfig): Phaser.GameObjects.Container {
    const {
      x,
      y,
      width,
      height,
      material = 'steel',
      baseColor,
      textureIntensity = 0.7,
      edgeWear = 0.3,
      cornerDamage = 0.2,
      alpha = 0.9,
      padding = { x: 0, y: 0 }
    } = config;

    const container = this.scene.add.container(x, y);

    // Haupt-Panel
    const background = this.createMaterialPanel(width, height, material, edgeWear, cornerDamage);
    background.setAlpha(alpha);
    container.add(background);

    // Optionaler Text-Container
    if (padding.x > 0 || padding.y > 0) {
      const textContainer = this.scene.add.container(0, 0);
      container.add(textContainer);
    }

    return container;
  }

  /**
   * Erstellt optimierten Text mit industriellem Material-Effekt
   */
  createOptimizedText(
    text: string,
    x: number,
    y: number,
    config: IndustrialTextConfig = {}
  ): Phaser.GameObjects.Text {
    const {
      fontSize = "16px",
      color = '#f0f4f8',
      fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontStyle = "600",
      material = 'engraved',
      shadowColor = '#000000',
      shadowBlur = 2,
      shadowStroke = true,
      isLargeText = false
    } = config;

    const textObj = this.scene.add.text(x, y, text, {
      fontSize,
      fontFamily,
      color,
      fontStyle
    }).setOrigin(0.5);

    // Material-spezifische Effekte
    this.applyMaterialTextEffect(textObj, material, shadowColor, shadowBlur, shadowStroke);

    return textObj;
  }

  /**
   * Erstellt atmosphärische Staub-Partikel
   */
  createIndustrialDustField(): void {
    const dustColors = [0x8b4513, 0x4a5568, 0x2d3748, 0x654321];
    const { width, height } = this.scene.scale;

    // Mehrere Emitter für unterschiedliche Schichten
    for (let i = 0; i < 3; i++) {
      const emitter = this.scene.add.particles(0, 0, 'particle', {
        x: { min: 0, max: width },
        y: { min: 0, max: height },
        speed: { min: 5, max: 15 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0.3, end: 0 },
        lifespan: 8000,
        quantity: 1,
        frequency: 500 + i * 200,
        tint: dustColors,
        blendMode: Phaser.BlendModes.MULTIPLY
      });
    }
  }

  /**
   * Erstellt einen Staub-Wirbel bei Interaktionen
   */
  createDustSwirl(x: number, y: number): void {
    const swirl = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 20, max: 60 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 2000,
      quantity: 10,
      tint: [0x8b4513, 0x4a5568, 0x2d3748],
      blendMode: Phaser.BlendModes.ADD
    });

    // Automatische Aufräumung
    this.scene.time.delayedCall(2500, () => swirl.destroy());
  }

  /**
   * Erstellt ein industrielles Hintergrund-Panel mit Titel
   */
  createTitlePanel(
    title: string,
    subtitle?: string,
    config: {
      width?: number;
      height?: number;
      material?: 'steel' | 'rust' | 'iron';
      titleSize?: string;
      subtitleSize?: string;
    } = {}
  ): Phaser.GameObjects.Container {
    const {
      width = 450,
      height = 140,
      material = 'steel',
      titleSize = "52px",
      subtitleSize = "24px"
    } = config;

    const container = this.scene.add.container(0, 0);

    // Haupt-Panel
    const background = this.createMaterialPanel(width, height, material, 0.3, 0.2);
    container.add(background);

    // Titel
    const titleText = this.createOptimizedText(title, 0, -20, {
      fontSize: titleSize,
      color: '#f0f4f8',
      material: 'engraved',
      isLargeText: true
    });
    container.add(titleText);

    // Optionaler Subtitle
    if (subtitle) {
      const subtitleText = this.createOptimizedText(subtitle, 0, 25, {
        fontSize: subtitleSize,
        color: '#8b0000',
        material: 'flat',
        isLargeText: false
      });
      container.add(subtitleText);
    }

    return container;
  }

  /**
   * Erstellt ein Material-Panel mit Texturen und Effekten
   */
  private createMaterialPanel(
    width: number,
    height: number,
    material: string,
    wearLevel: number,
    cornerDamage: number
  ): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    const materialColors = this.industrialColors[material];

    // Grundfarbe
    graphics.fillStyle(materialColors.primary, 0.9);
    graphics.fillRoundedRect(-width/2, -height/2, width, height, 8);

    // Material-Textur
    this.addMaterialTexture(graphics, width, height, material);

    // Kanten-Beschädigung
    if (cornerDamage > 0) {
      this.addEdgeDamage(graphics, width, height, cornerDamage);
    }

    // Subtiler Rand für Tiefe
    graphics.lineStyle(1, this.adjustColorBrightness(materialColors.primary, -20), 0.4);
    graphics.strokeRoundedRect(-width/2 + 1, -height/2 + 1, width - 2, height - 2, 7);

    return graphics;
  }

  /**
   * Fügt Material-Textur hinzu
   */
  private addMaterialTexture(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    material: string
  ): void {
    const materialColors = this.industrialColors[material];
    const textureIntensity = 0.1;

    // Material-spezifische Texturen
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width - width/2;
      const y = Math.random() * height - height/2;
      const size = Math.random() * 3 + 1;

      let color = materialColors.primary;
      if (material === 'rust') color = materialColors.light;
      if (material === 'concrete') color = materialColors.dark;
      if (material === 'iron') color = materialColors.secondary;

      graphics.fillStyle(color, textureIntensity);
      graphics.fillCircle(x, y, size);
    }

    // Material-spezifische Muster
    if (material === 'steel') {
      // Vertikale Walzspuren
      for (let i = 0; i < width; i += 8) {
        graphics.strokeStyle = `${materialColors.secondary}33`;
        graphics.lineWidth = Math.random() * 2 + 0.5;
        graphics.beginPath();
        graphics.moveTo(i - width/2, -height/2);
        graphics.lineTo(i - width/2, height/2);
        graphics.stroke();
      }
    }
  }

  /**
   * Fügt Kanten-Beschädigung hinzu
   */
  private addEdgeDamage(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    damageLevel: number
  ): void {
    if (damageLevel > 0) {
      for (let i = 0; i < damageLevel * 15; i++) {
        const x = (Math.random() - 0.5) * width;
        const y = (Math.random() - 0.5) * height;
        const size = Math.random() * 2 + 0.5;

        graphics.fillStyle('#000000', damageLevel * 0.2);
        graphics.fillCircle(x, y, size);
      }
    }
  }

  /**
   * Wendet Material-Text-Effekte an
   */
  private applyMaterialTextEffect(
    text: Phaser.GameObjects.Text,
    material: string,
    shadowColor: string,
    shadowBlur: number,
    shadowStroke: boolean
  ): void {
    switch (material) {
      case 'engraved':
        // Eingravierte Optik
        text.setShadow(1, 1, shadowColor, shadowBlur, shadowStroke, true);
        break;
      case 'raised':
        // Erhöhte Optik
        text.setShadow(-1, -1, '#ffffff', 1, true, false);
        text.setShadow(1, 1, shadowColor, 2, true, true);
        break;
      case 'flat':
        // Flache Optik für maximale Klarheit
        // Kein Shadow
        break;
    }
  }

  /**
   * Richtet industrielle Interaktionen ein
   */
  private setupIndustrialInteractions(
    container: Phaser.GameObjects.Container,
    config: {
      width: number;
      height: number;
      pressDepth: number;
      hoverBrightness: number;
      onClick?: () => void;
      onHover?: () => void;
      onHoverOut?: () => void;
    }
  ): void {
    const hitArea = new Phaser.Geom.Rectangle(
      -config.width/2, -config.height/2, config.width, config.height
    );
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    let isPressed = false;

    container.on('pointerover', () => {
      if (!isPressed) {
        this.scene.tweens.add({
          targets: container,
          alpha: 0.9,
          duration: 300,
          ease: "Power2.easeOut"
        });

        // Subtiler Scheinwerfer-Effekt
        this.addSpotlightEffect(container);
      }
      config.onHover?.();
    });

    container.on('pointerout', () => {
      if (!isPressed) {
        this.scene.tweens.add({
          targets: container,
          alpha: 1,
          duration: 400,
          ease: "Power2.easeOut"
        });

        this.removeSpotlightEffect(container);
      }
      config.onHoverOut?.();
    });

    container.on('pointerdown', () => {
      isPressed = true;
      this.scene.tweens.add({
        targets: container,
        y: container.y + config.pressDepth,
        duration: 100,
        ease: "Power2"
      });

      this.playMechanicalSound();
    });

    container.on('pointerup', () => {
      isPressed = false;
      this.scene.tweens.add({
        targets: container,
        y: container.y - config.pressDepth,
        duration: 150,
        ease: "Back.easeOut"
      });

      config.onClick?.();
    });
  }

  /**
   * Fügt Scheinwerfer-Effekt hinzu
   */
  private addSpotlightEffect(container: Phaser.GameObjects.Container): void {
    const spotlight = this.scene.add.graphics();
    spotlight.fillStyle(0xffffff, 0.05);
    spotlight.fillEllipse(0, 0, container.width * 1.2, container.height * 1.2);
    container.add(spotlight);
  }

  /**
   * Entfernt Scheinwerfer-Effekt
   */
  private removeSpotlightEffect(container: Phaser.GameObjects.Container): void {
    const children = container.list;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child instanceof Phaser.GameObjects.Graphics && child.alpha === 0.05) {
        child.destroy();
        break;
      }
    }
  }

  /**
   * Spielt mechanisches Geräusch (Placeholder)
   */
  private playMechanicalSound(): void {
    // TODO: Implementiere mechanisches Klang-Geräusch
    console.log("Industrial UI: Mechanical sound");
  }

  /**
   * Hilfsfunktionen für Farbmanipulation
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private adjustColorBrightness(color: string, percent: number): string {
    const rgb = this.hexToRgb(color);
    const factor = percent > 0 ? 1 + percent / 100 : 1 - Math.abs(percent) / 100;

    const newR = Math.min(255, Math.max(0, Math.round(rgb.r * factor)));
    const newG = Math.min(255, Math.max(0, Math.round(rgb.g * factor)));
    const newB = Math.min(255, Math.max(0, Math.round(rgb.b * factor)));

    return `rgb(${newR}, ${newG}, ${newB})`;
  }
}