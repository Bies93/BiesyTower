import Phaser from "phaser";
import { transitionToGame } from "../core/scene/SceneController";
import { LuxuryUI } from "../core/ui/LuxuryUI";
import { LuxuryAnimations } from "../core/ui/LuxuryAnimations";

/**
 * LuxuryMenuScene:
 * - Luxuriöses Hauptmenü mit Premium-Material-Design
 * - Hochwertige Animationen und subtile Effekte
 * - Moderne Eleganz mit Platin, Silber und Tiefblau
 */
export class IndustrialMenuScene extends Phaser.Scene {
  private luxuryUI!: LuxuryUI;
  private luxuryAnimations!: LuxuryAnimations;
  private startButton!: Phaser.GameObjects.Container;
  private settingsButton!: Phaser.GameObjects.Container;
  private creditsButton!: Phaser.GameObjects.Container;
  private titlePanel!: Phaser.GameObjects.Container;
  private isStarting = false;

  constructor() {
    super({ key: "IndustrialMenuScene" });
  }

  create(): void {
    console.log("IndustrialMenuScene: Creating luxury menu");
    const { width, height } = this.scale;
    
    // LuxuryUI und LuxuryAnimations initialisieren
    this.luxuryUI = new LuxuryUI(this);
    this.luxuryAnimations = new LuxuryAnimations(this);

    // Luxuriöser Fade-In
    this.cameras.main.fadeIn(1000, 15, 32, 47);
    
    // Atmosphärischer Luxus-Hintergrund
    this.createLuxuryBackground();
    
    // Titel mit luxuriösem Design
    this.createLuxuryTitle();
    
    // Menü-Buttons mit Premium-Material-Design
    this.createLuxuryMenuButtons();
    
    // Subtile luxuriöse Animationen
    this.addLuxuryAnimations();
    
    // Input-Setup
    this.setupInput();
  }

  /**
   * Erstellt atmosphärischen luxuriösen Hintergrund
   */
  private createLuxuryBackground(): void {
    // Luxuriöser Hintergrund
    const luxuryBackground = this.luxuryUI.createLuxuryBackground();
    luxuryBackground.setPosition(this.scale.width / 2, this.scale.height / 2);
    luxuryBackground.setDepth(-2);

    // Dekorative luxuriöse Elemente
    this.createLuxuryDecorations();
  }

  /**
   * Erstellt dekorative luxuriöse Elemente
   */
  private createLuxuryDecorations(): void {
    const { width, height } = this.scale;
    
    // Luxuriöse metallische Elemente im Hintergrund
    for (let i = 0; i < 3; i++) {
      const decoration = this.luxuryUI.createLuxuryPanel({
        width: 60,
        height: 120,
        materialType: i === 0 ? 'platin' : i === 1 ? 'silber' : 'tiefblau',
        finishLevel: 0.8,
        reflectionIntensity: 0.6,
        cornerRadius: 8,
        glassEffect: true
      });
      
      const x = Phaser.Math.Between(80, width - 80);
      const y = Phaser.Math.Between(80, height - 80);
      decoration.setPosition(x, y);
      decoration.setDepth(-1);
      decoration.setAlpha(0.3);

      // Subtile luxuriöse Animation
      this.tweens.add({
        targets: decoration,
        alpha: 0.5,
        duration: 10000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: i * 1500
      });
    }
  }

  /**
   * Erstellt den Titel mit luxuriösem Design
   */
  private createLuxuryTitle(): void {
    const { width, height } = this.scale;
    
    // Titel-Panel mit Platin-Design
    this.titlePanel = this.luxuryUI.createLuxuryPanel({
      width: 480,
      height: 140,
      materialType: 'platin',
      finishLevel: 0.95,
      baseColor: '#E8E8E8',
      accentColor: '#1E3A5F',
      reflectionIntensity: 0.8,
      cornerRadius: 20,
      glassEffect: true,
      gradientOverlay: true
    });
    
    this.titlePanel.setPosition(width / 2, height / 2 - 120);
    this.titlePanel.setDepth(1);

    // Haupttitel
    const title = this.luxuryUI.createLuxuryText("BIESYTOWER", 0, -20, {
      fontSize: "48px",
      fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      color: "#0F2027",
      fontStyle: "700",
      material: 'metallic',
      isTitle: true
    });
    this.titlePanel.add(title);

    // Luxuriöser Untertitel
    const subtitle = this.luxuryUI.createLuxuryText("PREMIUM COLLECTION", 0, 30, {
      fontSize: "16px",
      fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      color: "#1E3A5F",
      fontStyle: "600",
      material: 'engraved'
    });
    this.titlePanel.add(subtitle);

    // Subtile Atmungs-Animation
    this.tweens.add({
      targets: this.titlePanel,
      alpha: 0.98,
      duration: 12000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  /**
   * Erstellt die Menü-Buttons mit luxuriösem Material-Design
   */
  private createLuxuryMenuButtons(): void {
    const { width, height } = this.scale;
    
    // START GAME Button - Platin-Material
    this.startButton = this.luxuryUI.createLuxuryButton(
      width / 2,
      height / 2 + 30,
      240,
      60,
      "START GAME",
      {
        materialType: 'platin',
        finishLevel: 0.95,
        baseColor: '#E8E8E8',
        accentColor: '#1E3A5F',
        reflectionIntensity: 0.8,
        cornerRadius: 16,
        pressDepth: 2,
        hoverBrightness: 0.1,
        textColor: '#0F2027',
        fontSize: '18px',
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
      }
    );
    this.startButton.setDepth(2);

    // SETTINGS Button - Silber-Material
    this.settingsButton = this.luxuryUI.createLuxuryButton(
      width / 2,
      height / 2 + 100,
      220,
      55,
      "SETTINGS",
      {
        materialType: 'silber',
        finishLevel: 0.9,
        baseColor: '#B8B8B8',
        accentColor: '#1E3A5F',
        reflectionIntensity: 0.7,
        cornerRadius: 14,
        pressDepth: 2,
        hoverBrightness: 0.08,
        textColor: '#0F2027',
        fontSize: '16px',
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
      }
    );
    this.settingsButton.setDepth(2);

    // CREDITS Button - Tiefblau-Material
    this.creditsButton = this.luxuryUI.createLuxuryButton(
      width / 2,
      height / 2 + 165,
      200,
      50,
      "CREDITS",
      {
        materialType: 'tiefblau',
        finishLevel: 0.85,
        baseColor: '#1E3A5F',
        accentColor: '#E8E8E8',
        reflectionIntensity: 0.6,
        cornerRadius: 12,
        pressDepth: 2,
        hoverBrightness: 0.12,
        textColor: '#F8F6F0',
        fontSize: '16px',
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
      }
    );
    this.creditsButton.setDepth(2);
  }

  /**
   * Fügt subtile luxuriöse Animationen hinzu
   */
  private addLuxuryAnimations(): void {
    // Leichte Partikel-Bewegung
    this.createLuxuryFloatingParticles();
    
    // Atmosphärische Licht-Änderungen
    this.createLuxuryAmbientLighting();
    
    // Subtile Button-Animationen
    this.addLuxuryButtonAnimations();
    
    // Luxuriöse atmosphärische Animationen
    this.luxuryAnimations.createLuxuryAtmosphericAnimations();
    
    // Titel-Animationen
    this.addTitleAnimations();
  }

  /**
   * Erstellt schwebende luxuriöse Partikel
   */
  private createLuxuryFloatingParticles(): void {
    const { width, height } = this.scale;
    
    // Luxuriöse Partikel
    for (let i = 0; i < 20; i++) {
      const particle = this.add.arc(
        (Math.random() - 0.5) * width,
        (Math.random() - 0.5) * height,
        Math.random() * 2 + 0.5,
        0,
        360,
        false,
        Phaser.Utils.Array.GetRandom([0xE8E8E8, 0xB8B8B8, 0x3B82C4, 0xF8F6F0]),
        Math.random() * 0.2 + 0.1
      );
      
      particle.setBlendMode(Phaser.BlendModes.ADD);
      particle.setDepth(0);

      // Sanfte, organische Bewegung
      this.tweens.add({
        targets: particle,
        y: particle.y + (Math.random() - 0.5) * 80,
        x: particle.x + (Math.random() - 0.5) * 40,
        alpha: { from: particle.alpha, to: 0 },
        duration: 5000 + Math.random() * 3000,
        ease: "Sine.easeInOut",
        repeat: -1,
        delay: Math.random() * 2000
      });
    }
  }

  /**
   * Erstellt atmosphärische luxuriöse Beleuchtung
   */
  private createLuxuryAmbientLighting(): void {
    const { width, height } = this.scale;
    
    // Subtile Lichtkegel wie in hochwertigen Galerien
    const spotlight = this.add.graphics();
    const gradient = spotlight.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.4);
    gradient.addColorStop(0, '#FFFFFF08');
    gradient.addColorStop(0.5, '#3B82C404');
    gradient.addColorStop(1, '#00000000');
    
    spotlight.fillStyle(gradient);
    spotlight.fillEllipse(width / 2, height / 2, width * 0.8, height * 0.6);
    spotlight.setBlendMode(Phaser.BlendModes.ADD);
    spotlight.setDepth(-1);

    // Langsame, organische Bewegung
    this.tweens.add({
      targets: spotlight,
      alpha: 0.12,
      duration: 15000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  /**
   * Fügt subtile Button-Animationen hinzu
   */
  private addLuxuryButtonAnimations(): void {
    // Subtile Puls-Animation für den Start-Button mit LuxuryAnimations
    this.luxuryAnimations.createPulseAnimation(this.startButton, {
      duration: 4000,
      scaleX: 1.02,
      scaleY: 1.02
    });

    // Leichte Hover-Animation für Settings-Button
    this.luxuryAnimations.createFadeAnimation(this.settingsButton, 1, 0.95, {
      duration: 3000,
      yoyo: true,
      repeat: -1
    });

    // Subtile Rotation für Credits-Button
    this.luxuryAnimations.createRotationAnimation(this.creditsButton, {
      duration: 5000,
      rotation: 0.02
    });
  }

  /**
   * Fügt luxuriöse Titel-Animationen hinzu
   */
  private addTitleAnimations(): void {
    if (this.titlePanel) {
      // Subtile Puls-Animation für den Titel
      this.luxuryAnimations.createPulseAnimation(this.titlePanel, {
        duration: 6000,
        scaleX: 1.01,
        scaleY: 1.01
      });

      // Leichte Alpha-Animation
      this.luxuryAnimations.createFadeAnimation(this.titlePanel, 1, 0.98, {
        duration: 4000,
        yoyo: true,
        repeat: -1
      });
    }
  }

  /**
   * Richtet Input-Events ein
   */
  private setupInput(): void {
    // Keyboard input
    this.input.keyboard?.on("keydown-SPACE", () => this.startGame());
    this.input.keyboard?.on("keydown-ENTER", () => this.startGame());
    
    // Button-Interaktionen
    this.startButton.setInteractive();
    this.settingsButton.setInteractive();
    this.creditsButton.setInteractive();
    
    this.startButton.on("pointerup", () => this.startGame());
    this.settingsButton.on("pointerup", () => this.openSettings());
    this.creditsButton.on("pointerup", () => this.openCredits());
  }

  /**
   * Startet das Spiel mit luxuriösem Übergang
   */
  private startGame(): void {
    if (this.isStarting) return;
    this.isStarting = true;
    
    console.log("IndustrialMenuScene: Starting luxury game");
    
    // Luxuriöse Animation
    this.tweens.add({
      targets: [this.startButton, this.settingsButton, this.creditsButton],
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 200,
      yoyo: true,
      ease: "Power2"
    });
    
    // Luxuriöser Start-Effekt
    this.createLuxuryStartEffect();
    
    // Elegantes Verblassen wie hochwertige Beleuchtung
    this.cameras.main.fadeOut(1200, 15, 32, 47);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      transitionToGame(this);
    });
  }

  /**
   * Öffnet Settings (Placeholder)
   */
  private openSettings(): void {
    console.log("IndustrialMenuScene: Opening luxury settings (TODO)");
    // TODO: Implementiere Settings-Szene
  }

  /**
   * Öffnet Credits (Placeholder)
   */
  private openCredits(): void {
    console.log("IndustrialMenuScene: Opening luxury credits (TODO)");
    // TODO: Implementiere Credits-Szene
  }

  /**
   * Erstellt luxuriösen Start-Effekt
   */
  private createLuxuryStartEffect(): void {
    const { width, height } = this.scale;
    
    // Luxuriöse Partikel-Aufwirbelung
    this.createLuxuryStartParticles(width / 2, height / 2 + 30);
    
    // Luxuriöser Klang (wenn implementiert)
    this.playLuxurySound();
  }

  /**
   * Erstellt luxuriöse Start-Partikel
   */
  private createLuxuryStartParticles(x: number, y: number): void {
    // Verwende die neuen LuxuryAnimations für hochwertige Partikel-Effekte
    const particleExplosion = this.luxuryAnimations.createLuxuryParticleExplosion(x, y, {
      count: 30,
      colors: [0xE8E8E8, 0xB8B8B8, 0x3B82C4, 0xF8F6F0],
      minSize: 1,
      maxSize: 4,
      minSpeed: 80,
      maxSpeed: 250,
      minLifespan: 1200,
      maxLifespan: 2000,
      blendMode: Phaser.BlendModes.ADD
    });

    // Automatische Aufräumung nach der Animation
    this.time.delayedCall(2500, () => particleExplosion.destroy());
  }

  /**
   * Spielt luxuriösen Klang (Placeholder)
   */
  private playLuxurySound(): void {
    // TODO: Implementiere hochwertiges Klang-Geräusch
    console.log("Luxury UI: Premium startup sound");
  }

  /**
   * Spielt mechanisches Geräusch (Placeholder)
   */
  private playMechanicalSound(): void {
    // TODO: Implementiere mechanisches Klang-Geräusch
    console.log("Industrial UI: Mechanical startup sound");
  }
}