import Phaser from "phaser";

export interface IndustrialConfig {
  width: number;
  height: number;
  materialType: 'steel' | 'rust' | 'concrete' | 'iron';
  wearLevel: number; // 0-1, wie stark abgenutzt
  baseColor: number;
  accentColor: number;
  textureIntensity: number;
  cornerDamage: number; // 0-1, wie stark die Kanten beschädigt sind
}

export interface IndustrialButtonConfig extends IndustrialConfig {
  text: string;
  pressDepth: number; // Wie tief der Knopf eindrückt
  hoverBrightness: number; // Helligkeitsänderung bei Hover
  textColor?: string;
  fontSize?: string;
  onClick?: () => void;
  onHover?: () => void;
  onHoverOut?: () => void;
}

export interface IndustrialPanelConfig extends IndustrialConfig {
  padding?: { x: number; y: number };
}

export interface AnimatedGlowConfig {
  baseColor: number;
  glowColor: number;
  intensity: number;
  pulseSpeed: number;
  glowRadius: number;
}

/**
 * Industrielle UI-Komponenten mit Material-Design für Dystopie-Ästhetik
 * Ersetzt das Glassmorphism-Design durch robuste, industrielle Elemente
 */
export class IndustrialUI {
  private scene: Phaser.Scene;
  private textureCache: Map<string, Phaser.Textures.CanvasTexture> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initializeTextures();
  }

  /**
   * Initialisiert alle Material-Texturen
   */
  private initializeTextures(): void {
    this.createSteelTexture();
    this.createRustTexture();
    this.createConcreteTexture();
    this.createIronTexture();
  }

  /**
   * Erstellt ein industrielles Panel mit Material-Textur
   */
  public createIndustrialPanel(config: IndustrialPanelConfig): Phaser.GameObjects.Container {
    const {
      width,
      height,
      materialType = 'steel',
      wearLevel = 0.3,
      baseColor = 0x4a5568,
      accentColor = 0x8b4513,
      textureIntensity = 0.7,
      cornerDamage = 0.2,
      padding = { x: 0, y: 0 }
    } = config;

    const container = this.scene.add.container(0, 0);

    // Haupt-Panel mit Material-Textur
    const background = this.scene.add.graphics();
    
    // Grundfarbe
    background.fillStyle(baseColor, 0.9);
    background.fillRoundedRect(-width/2, -height/2, width, height, 8);

    // Material-Textur anwenden
    this.applyMaterialTexture(background, width, height, materialType, textureIntensity);

    // Kanten-Beschädigung
    this.addEdgeDamage(background, width, height, cornerDamage);

    // Subtiler Rand für Tiefe
    background.lineStyle(1, this.adjustColorBrightness(baseColor, -20), 0.4);
    background.strokeRoundedRect(-width/2 + 1, -height/2 + 1, width - 2, height - 2, 7);

    container.add(background);
    return container;
  }

  /**
   * Erstellt einen industriellen Button mit mechanischem Verhalten
   */
  public createIndustrialButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    config: Partial<IndustrialButtonConfig> = {}
  ): Phaser.GameObjects.Container {
    const buttonConfig: IndustrialButtonConfig = {
      width,
      height,
      materialType: 'steel',
      wearLevel: 0.4,
      baseColor: 0x4a5568,
      accentColor: 0x8b4513,
      textureIntensity: 0.7,
      cornerDamage: 0.3,
      text,
      pressDepth: 3,
      hoverBrightness: 0.15,
      textColor: '#f0f4f8',
      fontSize: '16px',
      ...config
    };

    const container = this.createIndustrialPanel(buttonConfig);
    container.setPosition(x, y);

    // Button-Text mit eingravierter Optik
    const buttonText = this.scene.add.text(0, 0, text, {
      fontSize: buttonConfig.fontSize,
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: buttonConfig.textColor,
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Eingravierter Schatten-Effekt
    buttonText.setShadow(1, 1, "rgba(0, 0, 0, 0.8)", 2);

    container.add(buttonText);

    // Interaktive Eigenschaften
    this.setupIndustrialButtonInteractions(container, buttonConfig);

    return container;
  }

  /**
   * Erstellt industrielle Partikel für atmosphärische Effekte
   */
  public createIndustrialParticles(
    x: number,
    y: number,
    count: number = 10
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    const particles: Phaser.GameObjects.Arc[] = [];

    // Industrielle Farben für Staub und Schmutz
    const dustColors = [0x8b4513, 0x4a5568, 0x2d3748, 0x654321];

    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.arc(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        Math.random() * 2 + 0.5,
        0,
        360,
        false,
        Phaser.Utils.Array.GetRandom(dustColors),
        Math.random() * 0.3 + 0.1
      );
      
      particle.setBlendMode(Phaser.BlendModes.MULTIPLY);
      particles.push(particle);

      // Langsames, organisches Schweben
      this.scene.tweens.add({
        targets: particle,
        y: particle.y + (Math.random() - 0.5) * 30,
        alpha: { from: particle.alpha, to: 0 },
        duration: 3000 + Math.random() * 2000,
        ease: "Sine.easeInOut",
        repeat: -1,
        delay: Math.random() * 1000
      });
    }

    container.add(particles);
    return container;
  }

  /**
   * Erstellt einen atmosphärischen Nebel-Effekt
   */
  public createIndustrialFog(): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, 0);
    const { width, height } = this.scene.scale;

    // Mehrere Nebel-Schichten für Tiefe
    for (let i = 0; i < 3; i++) {
      const fog = this.scene.add.graphics();
      const alpha = 0.02 + (i * 0.01);
      const color = [0x4a5568, 0x8b4513, 0x2d3748][i];

      fog.fillStyle(color, alpha);
      fog.fillEllipse(0, 0, width * 1.5, height * 1.5);

      // Langsame Bewegung
      this.scene.tweens.add({
        targets: fog,
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        duration: 20000 + i * 5000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });

      container.add(fog);
    }

    return container;
  }

  /**
   * Wendet Material-Textur auf eine Graphics-Objekt an
   */
  private applyMaterialTexture(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    materialType: string,
    intensity: number
  ): void {
    const textureKey = `${materialType}-texture`;
    const texture = this.textureCache.get(textureKey);
    
    if (texture) {
      // Textur-Muster mit geringer Intensität überlagern
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * width - width/2;
        const y = Math.random() * height - height/2;
        const size = Math.random() * 3 + 1;
        
        let color = 0x4a5568;
        if (materialType === 'rust') color = 0x8b4513;
        if (materialType === 'concrete') color = 0x2d3748;
        if (materialType === 'iron') color = 0x1a202c;
        
        graphics.fillStyle(color, intensity * 0.1);
        graphics.fillCircle(x, y, size);
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
    console.log('IndustrialUI.addEdgeDamage: Adding edge damage with level:', damageLevel);
    console.log('IndustrialUI.addEdgeDamage: graphics type:', typeof graphics);
    console.log('IndustrialUI.addEdgeDamage: graphics constructor:', graphics.constructor.name);
    
    if (damageLevel > 0) {
      const damage = this.scene.add.graphics();
      damage.fillStyle(0x000000, damageLevel * 0.2);

      // Zufällige Beschädigungen an den Kanten
      for (let i = 0; i < damageLevel * 15; i++) {
        const x = (Math.random() - 0.5) * width;
        const y = (Math.random() - 0.5) * height;
        const size = Math.random() * 2 + 0.5;

        damage.fillCircle(x, y, size);
      }

      // FIX: Graphics objects don't have add() method - draw directly on graphics instead
      // graphics.add(damage); // This was the error!
      
      // Alternative approach: Draw damage directly on the graphics object
      for (let i = 0; i < damageLevel * 15; i++) {
        const x = (Math.random() - 0.5) * width;
        const y = (Math.random() - 0.5) * height;
        const size = Math.random() * 2 + 0.5;

        graphics.fillStyle(0x000000, damageLevel * 0.2);
        graphics.fillCircle(x, y, size);
      }
      
      // Clean up the unused damage graphics object
      damage.destroy();
      console.log('IndustrialUI.addEdgeDamage: Edge damage applied successfully');
    }
  }

  /**
   * Richtet Interaktionen für industrielle Buttons ein
   */
  private setupIndustrialButtonInteractions(
    container: Phaser.GameObjects.Container,
    config: IndustrialButtonConfig
  ): void {
    const hitArea = new Phaser.Geom.Rectangle(-config.width/2, -config.height/2, config.width, config.height);
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

      // Mechanisches Klang-Geräusch (wenn implementiert)
      this.playMechanicalClick();
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
   * Fügt einen Scheinwerfer-Effekt hinzu
   */
  private addSpotlightEffect(container: Phaser.GameObjects.Container): void {
    const spotlight = this.scene.add.graphics();
    spotlight.fillStyle(0xffffff, 0.05);
    spotlight.fillEllipse(0, 0, container.width * 1.2, container.height * 1.2);
    container.add(spotlight);
  }

  /**
   * Entfernt den Scheinwerfer-Effekt
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
   * Spielt einen mechanischen Klick-Sound (Placeholder)
   */
  private playMechanicalClick(): void {
    // TODO: Implementiere mechanisches Klang-Geräusch
    console.log("Industrial UI: Mechanical click sound");
  }

  /**
   * Passt die Helligkeit einer Farbe an
   */
  private adjustColorBrightness(color: number, percent: number): number {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    const factor = percent > 0 ? 1 + percent / 100 : 1 - Math.abs(percent) / 100;

    const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
    const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
    const newB = Math.min(255, Math.max(0, Math.round(b * factor)));

    return (newR << 16) | (newG << 8) | newB;
  }

  /**
   * Erstellt Stahl-Textur
   */
  private createSteelTexture(): void {
    const texture = this.scene.textures.createCanvas('steel-texture', 256, 256);
    const ctx = texture.getContext();
    
    // Grundfarbe
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(0, 0, 256, 256);
    
    // Vertikale Walzspuren
    for (let i = 0; i < 256; i += 8) {
      ctx.strokeStyle = `rgba(113, 128, 150, ${Math.random() * 0.3})`;
      ctx.lineWidth = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
    }
    
    // Zufällige Kratzer
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = `rgba(45, 55, 72, ${Math.random() * 0.5})`;
      ctx.lineWidth = Math.random() * 1 + 0.2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 256, Math.random() * 256);
      ctx.lineTo(Math.random() * 256, Math.random() * 256);
      ctx.stroke();
    }
    
    texture.refresh();
    this.textureCache.set('steel-texture', texture);
  }

  /**
   * Erstellt Rost-Textur
   */
  private createRustTexture(): void {
    const texture = this.scene.textures.createCanvas('rust-texture', 256, 256);
    const ctx = texture.getContext();
    
    // Grundfarbe
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, 0, 256, 256);
    
    // Korrosions-Flecken
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = Math.random() * 20 + 5;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(205, 133, 63, ${Math.random() * 0.6})`);
      gradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    texture.refresh();
    this.textureCache.set('rust-texture', texture);
  }

  /**
   * Erstellt Beton-Textur
   */
  private createConcreteTexture(): void {
    const texture = this.scene.textures.createCanvas('concrete-texture', 256, 256);
    const ctx = texture.getContext();
    
    // Grundfarbe
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, 256, 256);
    
    // Poröse Struktur
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 3 + 1;
      
      ctx.fillStyle = `rgba(26, 32, 44, ${Math.random() * 0.6})`;
      ctx.fillRect(x, y, size, size);
    }
    
    texture.refresh();
    this.textureCache.set('concrete-texture', texture);
  }

  /**
   * Erstellt Eisen-Textur
   */
  private createIronTexture(): void {
    const texture = this.scene.textures.createCanvas('iron-texture', 256, 256);
    const ctx = texture.getContext();
    
    // Grundfarbe
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, 256, 256);
    
    // Metallische Reflexionen
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const size = Math.random() * 2 + 0.5;
      
      ctx.fillStyle = `rgba(74, 85, 104, ${Math.random() * 0.3})`;
      ctx.fillRect(x, y, size, size);
    }
    
    texture.refresh();
    this.textureCache.set('iron-texture', texture);
  }
}