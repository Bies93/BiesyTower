import Phaser from "phaser";
import { transitionToGame } from "../core/scene/SceneController";
import { IndustrialUI } from "../core/ui/IndustrialUI";
import { IndustrialUISystem } from "../core/ui/IndustrialUISystem";

/**
 * IndustrialMenuScene:
 * - Modernes, industrielles Hauptmenü mit Material-Design
 * - Reduzierte Animationen und subtile Effekte
 * - Passend zur Dystopie-Ästhetik des Spiels
 */
export class IndustrialMenuScene extends Phaser.Scene {
  private industrialUI!: IndustrialUI;
  private industrialUISystem!: IndustrialUISystem;
  private startButton!: Phaser.GameObjects.Container;
  private settingsButton!: Phaser.GameObjects.Container;
  private creditsButton!: Phaser.GameObjects.Container;
  private titlePanel!: Phaser.GameObjects.Container;
  private isStarting = false;

  constructor() {
    super({ key: "IndustrialMenuScene" });
  }

  create(): void {
    console.log("IndustrialMenuScene: Creating industrial menu");
    const { width, height } = this.scale;
    
    // UI-Systeme initialisieren
    this.industrialUI = new IndustrialUI(this);
    this.industrialUISystem = new IndustrialUISystem(this);

    // Industrieller Fade-In
    this.cameras.main.fadeIn(800, 26, 32, 44);
    
    // Atmosphärischer Hintergrund
    this.createIndustrialBackground();
    
    // Titel mit industriellem Design
    this.createIndustrialTitle();
    
    // Menü-Buttons mit Material-Design
    this.createIndustrialMenuButtons();
    
    // Subtile Animationen
    this.addIndustrialAnimations();
    
    // Input-Setup
    this.setupInput();
  }

  /**
   * Erstellt atmosphärischen industriellen Hintergrund
   */
  private createIndustrialBackground(): void {
    // Industrieller Nebel
    const fog = this.industrialUI.createIndustrialFog();
    fog.setPosition(this.scale.width / 2, this.scale.height / 2);
    fog.setDepth(-2);

    // Staub-Partikel-Feld
    this.industrialUISystem.createIndustrialDustField();

    // Dekorative industrielle Elemente
    this.createIndustrialDecorations();
  }

  /**
   * Erstellt dekorative industrielle Elemente
   */
  private createIndustrialDecorations(): void {
    const { width, height } = this.scale;
    
    // Rostige Metallstreben im Hintergrund
    for (let i = 0; i < 4; i++) {
      const beam = this.add.graphics();
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      const beamWidth = Phaser.Math.Between(3, 8);
      const beamHeight = Phaser.Math.Between(80, 150);

      beam.fillStyle(0x4a5568, 0.6);
      beam.fillRoundedRect(x - beamWidth/2, y - beamHeight/2, beamWidth, beamHeight, 2);
      
      // Rost-Effekte
      beam.fillStyle(0x8b4513, 0.3);
      beam.fillRoundedRect(x - beamWidth/2, y - beamHeight/2, beamWidth, beamHeight * 0.3, 2);

      // Subtile Animation
      this.tweens.add({
        targets: beam,
        alpha: 0.4,
        duration: 8000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: i * 1000
      });
    }
  }

  /**
   * Erstellt den Titel mit industriellem Design
   */
  private createIndustrialTitle(): void {
    const { width, height } = this.scale;
    
    // Titel-Panel mit Stahl-Design
    this.titlePanel = this.industrialUISystem.createTitlePanel(
      "BIESYTOWER",
      "",
      {
        width: 450,
        height: 120,
        material: 'steel',
        titleSize: "52px",
        subtitleSize: "24px"
      }
    );
    
    this.titlePanel.setPosition(width / 2, height / 2 - 110);
    this.titlePanel.setDepth(1);

    // Subtile Atmungs-Animation
    this.tweens.add({
      targets: this.titlePanel,
      alpha: 0.95,
      duration: 8000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  /**
   * Erstellt die Menü-Buttons mit industriellem Material-Design
   */
  private createIndustrialMenuButtons(): void {
    const { width, height } = this.scale;
    
    // START GAME Button - Stahl-Material
    this.startButton = this.industrialUI.createIndustrialButton(
      width / 2,
      height / 2 + 20,
      220,
      55,
      "START GAME",
      {
        materialType: 'steel',
        wearLevel: 0.4,
        pressDepth: 3,
        hoverBrightness: 0.15,
        cornerDamage: 0.3,
        textColor: '#f0f4f8',
        fontSize: '18px'
      }
    );
    this.startButton.setDepth(2);

    // SETTINGS Button - Rost-Material
    this.settingsButton = this.industrialUI.createIndustrialButton(
      width / 2,
      height / 2 + 85,
      200,
      50,
      "SETTINGS",
      {
        materialType: 'rust',
        wearLevel: 0.6,
        pressDepth: 2,
        hoverBrightness: 0.1,
        cornerDamage: 0.4,
        textColor: '#f0f4f8',
        fontSize: '16px'
      }
    );
    this.settingsButton.setDepth(2);

    // CREDITS Button - Eisen-Material
    this.creditsButton = this.industrialUI.createIndustrialButton(
      width / 2,
      height / 2 + 145,
      180,
      45,
      "CREDITS",
      {
        materialType: 'iron',
        wearLevel: 0.5,
        pressDepth: 2,
        hoverBrightness: 0.12,
        cornerDamage: 0.35,
        textColor: '#f0f4f8',
        fontSize: '16px'
      }
    );
    this.creditsButton.setDepth(2);
  }

  /**
   * Fügt subtile industrielle Animationen hinzu
   */
  private addIndustrialAnimations(): void {
    // Leichte Partikel-Bewegung
    this.createFloatingParticles();
    
    // Atmosphärische Licht-Änderungen
    this.createAmbientLighting();
  }

  /**
   * Erstellt schwebende Partikel
   */
  private createFloatingParticles(): void {
    const particles = this.industrialUI.createIndustrialParticles(
      this.scale.width / 2,
      this.scale.height / 2,
      15
    );
    particles.setDepth(0);
  }

  /**
   * Erstellt atmosphärische Beleuchtung
   */
  private createAmbientLighting(): void {
    const { width, height } = this.scale;
    
    // Subtile Lichtkegel wie Scheinwerfer
    const spotlight = this.add.graphics();
    spotlight.fillStyle(0xffffff, 0.02);
    spotlight.fillEllipse(width / 2, height / 2, width * 0.8, height * 0.6);
    spotlight.setDepth(-1);

    // Langsame Bewegung
    this.tweens.add({
      targets: spotlight,
      alpha: 0.04,
      duration: 12000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
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
   * Startet das Spiel mit industriellem Übergang
   */
  private startGame(): void {
    if (this.isStarting) return;
    this.isStarting = true;
    
    console.log("IndustrialMenuScene: Starting game");
    
    // Mechanische Animation
    this.tweens.add({
      targets: [this.startButton, this.settingsButton, this.creditsButton],
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 150,
      yoyo: true,
      ease: "Power2"
    });
    
    // Industrieller Staub-Wirbel
    this.createIndustrialStartEffect();
    
    // Langsames Verblassen wie alte Industriebeleuchtung
    this.cameras.main.fadeOut(1000, 26, 32, 44);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      transitionToGame(this);
    });
  }

  /**
   * Öffnet Settings (Placeholder)
   */
  private openSettings(): void {
    console.log("IndustrialMenuScene: Opening settings (TODO)");
    // TODO: Implementiere Settings-Szene
  }

  /**
   * Öffnet Credits (Placeholder)
   */
  private openCredits(): void {
    console.log("IndustrialMenuScene: Opening credits (TODO)");
    // TODO: Implementiere Credits-Szene
  }

  /**
   * Erstellt industriellen Start-Effekt
   */
  private createIndustrialStartEffect(): void {
    const { width, height } = this.scale;
    
    // Staub-Aufwirbelung
    this.industrialUISystem.createDustSwirl(width / 2, height / 2 + 20);
    
    // Mechanisches Geräusch (wenn implementiert)
    this.playMechanicalSound();
  }

  /**
   * Spielt mechanisches Geräusch (Placeholder)
   */
  private playMechanicalSound(): void {
    // TODO: Implementiere mechanisches Klang-Geräusch
    console.log("Industrial UI: Mechanical startup sound");
  }
}