import Phaser from "phaser";
import { LuxuryVisualEffects } from "./LuxuryVisualEffects";

export interface LuxuryConfig {
  width: number;
  height: number;
  materialType: 'platin' | 'silber' | 'tiefblau' | 'gold';
  finishLevel: number; // 0-1, wie hochwertig die Oberfläche ist
  baseColor: string;
  accentColor: string;
  reflectionIntensity: number;
  cornerRadius: number;
}

export interface LuxuryButtonConfig extends LuxuryConfig {
  text: string;
  pressDepth: number;
  hoverBrightness: number;
  textColor?: string;
  fontSize?: string;
  fontFamily?: string;
  onClick?: () => void;
  onHover?: () => void;
  onHoverOut?: () => void;
}

export interface LuxuryPanelConfig extends LuxuryConfig {
  padding?: { x: number; y: number };
  glassEffect?: boolean;
  gradientOverlay?: boolean;
}

export interface LuxuryTextConfig {
  fontSize?: string;
  color?: string;
  fontFamily?: string;
  fontStyle?: string;
  material?: 'engraved' | 'raised' | 'metallic' | 'flat';
  shadowColor?: string;
  shadowBlur?: number;
  letterSpacing?: number;
  lineHeight?: number;
  isTitle?: boolean;
}

export interface LuxuryAnimationConfig {
  duration: number;
  ease: string;
  delay?: number;
  yoyo?: boolean;
  repeat?: number;
}

/**
 * LuxuryUI - Hochwertiges UI-System für luxuriöse Benutzeroberflächen
 * Basiert auf dem IndustrialUI-System aber mit Premium-Materialien und eleganteren Effekten
 */
export class LuxuryUI {
  private scene: Phaser.Scene;
  private textureCache: Map<string, Phaser.Textures.CanvasTexture> = new Map();
  private visualEffects!: LuxuryVisualEffects;
  
  // Luxuriöse Farbpalette
  private luxuryColors = {
    platin: {
      primary: '#E8E8E8',    // Helles Platin
      secondary: '#C0C0C0',  // Mittleres Platin
      dark: '#808080',      // Dunkles Platin
      light: '#F5F5F5',     // Sehr helles Platin
      shimmer: '#FFFFFF',   // Platin-Glanz
      reflection: '#F8F8F8'  // Platin-Reflexion
    },
    silber: {
      primary: '#B8B8B8',   // Mittleres Silber
      secondary: '#A8A8A8', // Silber
      dark: '#696969',     // Dunkles Silber
      light: '#D3D3D3',    // Helles Silber
      reflection: '#E0E0E0', // Silber-Reflexion
      shimmer: '#F0F0F0'   // Silber-Glanz
    },
    tiefblau: {
      primary: '#1E3A5F',   // Haupt-Tiefblau
      secondary: '#2C5282', // Sekundäres Blau
      dark: '#0F2027',     // Dunkelblau
      light: '#3B82C4',    // Helles Blau
      accent: '#60A5FA',   // Blauer Akzent
      shimmer: '#8BB4E7'   // Blauer Glanz
    },
    gold: {
      primary: '#D4AF37',   // Haupt-Gold
      secondary: '#FFD700', // Helles Gold
      dark: '#B8860B',     // Dunkles Gold
      light: '#F0E68C',    // Helles Gold
      shimmer: '#FFF8DC',  // Gold-Glanz
      reflection: '#FFE4B5' // Gold-Reflexion
    },
    akzente: {
      pearl: '#F8F6F0',    // Perlmutt
      shadow: '#1A1A1A',   // Luxus-Schatten
      highlight: '#FFFFFF', // Hochlicht
      glass: '#FFFFFF20'   // Glas-Effekt
    }
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.visualEffects = new LuxuryVisualEffects(scene);
    this.initializeTextures();
  }

  /**
   * Initialisiert alle Luxus-Material-Texturen
   */
  private initializeTextures(): void {
    this.createPlatinTexture();
    this.createSilberTexture();
    this.createTiefblauTexture();
    this.createGoldTexture();
  }

  /**
   * Erstellt einen luxuriösen Button mit Premium-Material-Effekten
   */
  public createLuxuryButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    config: Partial<LuxuryButtonConfig> = {}
  ): Phaser.GameObjects.Container {
    const buttonConfig: LuxuryButtonConfig = {
      width,
      height,
      materialType: 'platin',
      finishLevel: 0.9,
      baseColor: '#E8E8E8',
      accentColor: '#1E3A5F',
      reflectionIntensity: 0.7,
      cornerRadius: 12,
      text,
      pressDepth: 2,
      hoverBrightness: 0.1,
      textColor: '#1A1A1A',
      fontSize: '16px',
      fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      ...config
    };

    const container = this.createLuxuryPanel(buttonConfig);
    container.setPosition(x, y);

    // Button-Text mit luxuriöser Typografie
    const buttonText = this.createLuxuryText(text, 0, 0, {
      fontSize: buttonConfig.fontSize,
      fontFamily: buttonConfig.fontFamily,
      color: buttonConfig.textColor,
      material: 'metallic',
      isTitle: height > 60
    });
    container.add(buttonText);

    // Interaktive Eigenschaften
    this.setupLuxuryButtonInteractions(container, buttonConfig);

    return container;
  }

  /**
   * Erstellt ein luxuriöses Panel mit Premium-Material-Effekten
   */
  public createLuxuryPanel(config: LuxuryPanelConfig): Phaser.GameObjects.Container {
    const {
      width,
      height,
      materialType = 'platin',
      finishLevel = 0.9,
      baseColor = '#E8E8E8',
      accentColor = '#1E3A5F',
      reflectionIntensity = 0.7,
      cornerRadius = 12,
      padding = { x: 0, y: 0 },
      glassEffect = false,
      gradientOverlay = false
    } = config;

    const container = this.scene.add.container(0, 0);

    // Haupt-Panel mit Luxus-Material
    const background = this.createLuxuryMaterialPanel(width, height, materialType, finishLevel, cornerRadius);
    container.add(background);

    // Verbesserte Reflexions-Effekte mit LuxuryVisualEffects
    if (reflectionIntensity > 0) {
      const reflection = this.createReflectionEffect(width, height, materialType, reflectionIntensity);
      container.add(reflection);
      
      // Zusätzliche metallische Reflexionen
      const metallicReflection = this.visualEffects.createMetallicReflection(
        0, -height/4, width * 0.8, height * 0.3,
        { intensity: reflectionIntensity * 0.7, angle: 30, color: this.luxuryColors[materialType].reflection }
      );
      container.add(metallicReflection);
    }

    // Glas-Effekt-Overlay
    if (glassEffect) {
      const glassOverlay = this.createGlassOverlay(width, height, cornerRadius);
      container.add(glassOverlay);
    }

    // Gradient-Overlay für zusätzliche Tiefe
    if (gradientOverlay) {
      const gradientOverlay = this.createGradientOverlay(width, height, materialType);
      container.add(gradientOverlay);
    }

    // Luxuriöse Kanten-Highlights
    this.visualEffects.createLuxuryEdgeHighlights(container, {
      color: this.luxuryColors[materialType].shimmer,
      intensity: 0.3
    });

    return container;
  }

  /**
   * Erstellt luxuriösen Text mit optimierter Typografie
   */
  public createLuxuryText(
    text: string,
    x: number,
    y: number,
    config: LuxuryTextConfig = {}
  ): Phaser.GameObjects.Text {
    const {
      fontSize = '16px',
      color = '#1A1A1A',
      fontFamily = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      fontStyle = '500',
      material = 'metallic',
      shadowColor = '#000000',
      shadowBlur = 2,
      letterSpacing = 0.5,
      lineHeight = 1.2,
      isTitle = false
    } = config;

    const textObj = this.scene.add.text(x, y, text, {
      fontSize,
      fontFamily,
      color,
      fontStyle,
      letterSpacing: `${letterSpacing}px`,
      lineSpacing: lineHeight * 16
    }).setOrigin(0.5);

    // Material-spezifische Effekte
    this.applyLuxuryTextEffect(textObj, material, shadowColor, shadowBlur, isTitle);

    // Luxuriöse Text-Highlights für Titel
    if (isTitle) {
      this.visualEffects.createLuxuryTextHighlight(textObj, {
        color: 0xE8E8E8,
        offset: 3
      });
    }

    return textObj;
  }

  /**
   * Erstellt atmosphärischen luxuriösen Hintergrund
   */
  public createLuxuryBackground(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0);
    const { width, height } = this.scene.scale;

    // Mehrschichtiger Hintergrund mit Tiefblau-Gradient
    const background = this.scene.add.graphics();
    
    // Haupt-Gradient mit Canvas-Kontext
    const gradientCanvas = this.scene.textures.createCanvas(width, height);
    const ctx = gradientCanvas.getContext();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0F2027');
    gradient.addColorStop(0.5, '#1E3A5F');
    gradient.addColorStop(1, '#0F2027');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Textur erstellen und anwenden
    const texture = gradientCanvas.texture;
    background.setTexture(texture);
    background.setSize(width, height);
    container.add(background);

    // Subtile atmosphärische Partikel
    this.createLuxuryParticles(container);

    // Licht-Effekte
    this.createAmbientLighting(container);

    return container;
  }

  /**
   * Erstellt luxuriöse Partikel für atmosphärische Effekte
   */
  private createLuxuryParticles(container: Phaser.GameObjects.Container): void {
    const particleColors = [0xE8E8E8, 0xB8B8B8, 0x3B82C4, 0xF8F6F0];
    const { width, height } = this.scene.scale;

    for (let i = 0; i < 15; i++) {
      const particle = this.scene.add.arc(
        (Math.random() - 0.5) * width,
        (Math.random() - 0.5) * height,
        Math.random() * 2 + 0.5,
        0,
        360,
        false,
        Phaser.Utils.Array.GetRandom(particleColors),
        Math.random() * 0.3 + 0.1
      );
      
      particle.setBlendMode(Phaser.BlendModes.ADD);
      container.add(particle);

      // Sanfte, organische Bewegung
      this.scene.tweens.add({
        targets: particle,
        y: particle.y + (Math.random() - 0.5) * 100,
        x: particle.x + (Math.random() - 0.5) * 50,
        alpha: { from: particle.alpha, to: 0 },
        duration: 4000 + Math.random() * 3000,
        ease: "Sine.easeInOut",
        repeat: -1,
        delay: Math.random() * 2000
      });
    }
  }

  /**
   * Erstellt atmosphärische Beleuchtung
   */
  private createAmbientLighting(container: Phaser.GameObjects.Container): void {
    const { width, height } = this.scene.scale;
    
    // Subtile Lichtkegel wie in hochwertigen Galerien
    const spotlight = this.scene.add.graphics();
    const gradient = spotlight.createRadialGradient(0, 0, 0, 0, 0, width * 0.4);
    gradient.addColorStop(0, '#FFFFFF05');
    gradient.addColorStop(0.5, '#3B82C403');
    gradient.addColorStop(1, '#00000000');
    
    spotlight.fillStyle(gradient);
    spotlight.fillEllipse(0, 0, width * 0.8, height * 0.6);
    spotlight.setBlendMode(Phaser.BlendModes.ADD);
    container.add(spotlight);

    // Langsame, organische Bewegung
    this.scene.tweens.add({
      targets: spotlight,
      alpha: 0.08,
      duration: 15000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  /**
   * Erstellt ein Luxus-Material-Panel
   */
  private createLuxuryMaterialPanel(
    width: number,
    height: number,
    materialType: string,
    finishLevel: number,
    cornerRadius: number
  ): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    const materialColors = this.luxuryColors[materialType];

    // Grundfarbe mit hoher Qualität
    graphics.fillStyle(materialColors.primary, 0.95);
    graphics.fillRoundedRect(-width/2, -height/2, width, height, cornerRadius);

    // Luxus-Material-Textur
    this.addLuxuryMaterialTexture(graphics, width, height, materialType, finishLevel);

    // Subtiler Rand für Tiefe
    graphics.lineStyle(1, materialColors.dark, 0.3);
    graphics.strokeRoundedRect(-width/2 + 1, -height/2 + 1, width - 2, height - 2, cornerRadius - 1);

    return graphics;
  }

  /**
   * Fügt Luxus-Material-Textur hinzu
   */
  private addLuxuryMaterialTexture(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    materialType: string,
    finishLevel: number
  ): void {
    const materialColors = this.luxuryColors[materialType];
    const textureIntensity = 0.05 * finishLevel;

    // Feine Material-Struktur
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width - width/2;
      const y = Math.random() * height - height/2;
      const size = Math.random() * 2 + 0.5;

      let color = materialColors.light;
      if (materialType === 'tiefblau') color = materialColors.accent;
      if (materialType === 'gold') color = materialColors.shimmer;

      graphics.fillStyle(color, textureIntensity);
      graphics.fillCircle(x, y, size);
    }

    // Material-spezifische Muster
    if (materialType === 'platin' || materialType === 'silber') {
      // Feine metallische Linien
      for (let i = 0; i < width; i += 12) {
        graphics.strokeStyle = `${materialColors.reflection}20`;
        graphics.lineWidth = 0.5;
        graphics.beginPath();
        graphics.moveTo(i - width/2, -height/2);
        graphics.lineTo(i - width/2, height/2);
        graphics.stroke();
      }
    }
  }

  /**
   * Erstellt Reflexions-Effekt
   */
  private createReflectionEffect(
    width: number,
    height: number,
    materialType: string,
    intensity: number
  ): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    const materialColors = this.luxuryColors[materialType];

    // Obere Reflexion
    const gradient = graphics.createLinearGradient(0, -height/2, 0, 0);
    gradient.addColorStop(0, materialColors.reflection + Math.floor(intensity * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, materialColors.reflection + '00');
    
    graphics.fillStyle(gradient);
    graphics.fillRoundedRect(-width/2, -height/2, width, height/3, 8);

    return graphics;
  }

  /**
   * Erstellt Glas-Overlay-Effekt
   */
  private createGlassOverlay(width: number, height: number, cornerRadius: number): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    
    // Subtiles Glas-Overlay
    const gradient = graphics.createLinearGradient(0, -height/2, 0, height/2);
    gradient.addColorStop(0, '#FFFFFF15');
    gradient.addColorStop(0.5, '#FFFFFF05');
    gradient.addColorStop(1, '#FFFFFF00');
    
    graphics.fillStyle(gradient);
    graphics.fillRoundedRect(-width/2, -height/2, width, height, cornerRadius);

    return graphics;
  }

  /**
   * Erstellt Gradient-Overlay
   */
  private createGradientOverlay(width: number, height: number, materialType: string): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    const materialColors = this.luxuryColors[materialType];

    // Subtiler Gradient für zusätzliche Tiefe
    const gradient = graphics.createLinearGradient(-width/2, 0, width/2, 0);
    gradient.addColorStop(0, materialColors.dark + '20');
    gradient.addColorStop(0.5, materialColors.light + '10');
    gradient.addColorStop(1, materialColors.dark + '20');
    
    graphics.fillStyle(gradient);
    graphics.fillRoundedRect(-width/2, -height/2, width, height, 8);

    return graphics;
  }

  /**
   * Wendet Luxus-Text-Effekte an
   */
  private applyLuxuryTextEffect(
    text: Phaser.GameObjects.Text,
    material: string,
    shadowColor: string,
    shadowBlur: number,
    isTitle: boolean
  ): void {
    switch (material) {
      case 'metallic':
        // Metallische Optik mit subtilen Reflexionen
        text.setShadow(1, 1, shadowColor, shadowBlur, true, true);
        text.setShadow(-1, -1, '#FFFFFF', 0.5, true, false);
        break;
      case 'engraved':
        // Eingravierte Optik
        text.setShadow(1, 1, shadowColor, shadowBlur, true, true);
        break;
      case 'raised':
        // Erhöhte Optik
        text.setShadow(-1, -1, '#FFFFFF', 1, true, false);
        text.setShadow(1, 1, shadowColor, 2, true, true);
        break;
      case 'flat':
        // Flache Optik für maximale Klarheit
        if (isTitle) {
          text.setShadow(0, 2, shadowColor, shadowBlur, false, true);
        }
        break;
    }
  }

  /**
   * Richtet Luxus-Button-Interaktionen ein
   */
  private setupLuxuryButtonInteractions(
    container: Phaser.GameObjects.Container,
    config: LuxuryButtonConfig
  ): void {
    const hitArea = new Phaser.Geom.Rectangle(-config.width/2, -config.height/2, config.width, config.height);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    let isPressed = false;

    container.on('pointerover', () => {
      if (!isPressed) {
        this.scene.tweens.add({
          targets: container,
          alpha: 0.95,
          duration: 300,
          ease: "Power2.easeOut"
        });

        // Subtiler Luxus-Hover-Effekt
        this.addLuxuryHoverEffect(container);
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

        this.removeLuxuryHoverEffect(container);
      }
      config.onHoverOut?.();
    });

    container.on('pointerdown', () => {
      isPressed = true;
      this.scene.tweens.add({
        targets: container,
        y: container.y + config.pressDepth,
        duration: 150,
        ease: "Power2"
      });

      this.playLuxuryClick();
    });

    container.on('pointerup', () => {
      isPressed = false;
      this.scene.tweens.add({
        targets: container,
        y: container.y - config.pressDepth,
        duration: 200,
        ease: "Back.easeOut"
      });

      config.onClick?.();
    });
  }

  /**
   * Fügt Luxus-Hover-Effekt hinzu
   */
  private addLuxuryHoverEffect(container: Phaser.GameObjects.Container): void {
    const hover = this.scene.add.graphics();
    hover.fillStyle(0xFFFFFF, 0.03);
    hover.fillEllipse(0, 0, container.width * 1.1, container.height * 1.1);
    container.add(hover);
  }

  /**
   * Entfernt Luxus-Hover-Effekt
   */
  private removeLuxuryHoverEffect(container: Phaser.GameObjects.Container): void {
    const children = container.list;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child instanceof Phaser.GameObjects.Graphics && child.alpha === 0.03) {
        child.destroy();
        break;
      }
    }
  }

  /**
   * Spielt luxuriösen Klick-Sound (Placeholder)
   */
  private playLuxuryClick(): void {
    // TODO: Implementiere hochwertiges Klang-Geräusch
    console.log("Luxury UI: Premium click sound");
  }

  /**
   * Erstellt Platin-Textur
   */
  private createPlatinTexture(): void {
    const texture = this.scene.textures.createCanvas('platin-texture', 256, 256);
    const ctx = texture.getContext();
    
    // Grundfarbe
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(0, 0, 256, 256);
    
    // Feine metallische Struktur
    for (let i = 0; i < 256; i += 6) {
      ctx.strokeStyle = `rgba(232, 232, 232, ${Math.random() * 0.3})`;
      ctx.lineWidth = Math.random() * 1 + 0.2;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
    }
    
    // Subtile Reflexionen
    for (let i = 0; i < 30; i++) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
      ctx.lineWidth = Math.random() * 0.5 + 0.1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 256, Math.random() * 256);
      ctx.lineTo(Math.random() * 256, Math.random() * 256);
      ctx.stroke();
    }
    
    texture.refresh();
    this.textureCache.set('platin-texture', texture);
  }

  /**
   * Erstellt Silber-Textur
   */
  private createSilberTexture(): void {
    const texture = this.scene.textures.createCanvas('silber-texture', 256, 256);
    const ctx = texture.getContext();
    
    // Grundfarbe
    ctx.fillStyle = '#B8B8B8';
    ctx.fillRect(0, 0, 256, 256);
    
    // Feine metallische Linien
    for (let i = 0; i < 256; i += 8) {
      ctx.strokeStyle = `rgba(184, 184, 184, ${Math.random() * 0.4})`;
      ctx.lineWidth = Math.random() * 1.5 + 0.3;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
    }
    
    // Subtile Glanzpunkte
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = Math.random() * 2 + 0.5;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(224, 224, 224, ${Math.random() * 0.6})`);
      gradient.addColorStop(1, 'rgba(224, 224, 224, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    texture.refresh();
    this.textureCache.set('silber-texture', texture);
  }

  /**
   * Erstellt Tiefblau-Textur
   */
  private createTiefblauTexture(): void {
    const texture = this.scene.textures.createCanvas('tiefblau-texture', 256, 256);
    const ctx = texture.getContext();
    
    // Grundfarbe
    ctx.fillStyle = '#1E3A5F';
    ctx.fillRect(0, 0, 256, 256);
    
    // Subtile Farbverläufe
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = Math.random() * 30 + 10;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(59, 130, 196, ${Math.random() * 0.3})`);
      gradient.addColorStop(1, 'rgba(59, 130, 196, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    texture.refresh();
    this.textureCache.set('tiefblau-texture', texture);
  }

  /**
   * Erstellt Gold-Textur
   */
  private createGoldTexture(): void {
    const texture = this.scene.textures.createCanvas('gold-texture', 256, 256);
    const ctx = texture.getContext();
    
    // Grundfarbe
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(0, 0, 256, 256);
    
    // Metallische Gold-Struktur
    for (let i = 0; i < 256; i += 10) {
      ctx.strokeStyle = `rgba(212, 175, 55, ${Math.random() * 0.4})`;
      ctx.lineWidth = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
    }
    
    // Goldene Reflexionen
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = Math.random() * 15 + 5;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(255, 248, 220, ${Math.random() * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 248, 220, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    texture.refresh();
    this.textureCache.set('gold-texture', texture);
  }
}