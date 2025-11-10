import Phaser from "phaser";
import { baseGameConfig } from "../config/gameConfig";
import { queueAssetManifest } from "../assets/assetManifest";
import { transitionToMenu } from "../core/scene/SceneController";
import { LuxuryUI } from "../core/ui/LuxuryUI";

/**
 * BootScene handles global preloading and shows a luxurious progress UI so we
 * can guarantee assets exist before the menu or gameplay try to use them.
 */
export class BootScene extends Phaser.Scene {
  private luxuryUI!: LuxuryUI;
  private progressBar!: Phaser.GameObjects.Container;
  private percentText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    const { width, height } = this.scale;
    
    // Initialize LuxuryUI
    this.luxuryUI = new LuxuryUI(this);
    
    // Luxuriöser Hintergrund
    this.cameras.main.setBackgroundColor("#0F2027");
    
    // Atmosphärischer Luxus-Hintergrund
    const luxuryBackground = this.luxuryUI.createLuxuryBackground();
    luxuryBackground.setPosition(width / 2, height / 2);
    luxuryBackground.setDepth(-1);

    // Luxuriöser Titel mit Platin-Effekt
    const titlePanel = this.luxuryUI.createLuxuryPanel({
      width: 400,
      height: 100,
      materialType: 'platin',
      finishLevel: 0.95,
      baseColor: '#E8E8E8',
      accentColor: '#1E3A5F',
      reflectionIntensity: 0.8,
      cornerRadius: 16,
      glassEffect: true,
      gradientOverlay: true
    });
    titlePanel.setPosition(width / 2, height / 2 - 100);
    titlePanel.setDepth(1);

    const title = this.luxuryUI.createLuxuryText("BIESYTOWER", 0, 0, {
      fontSize: "32px",
      fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      color: "#0F2027",
      fontStyle: "600",
      material: 'metallic',
      isTitle: true
    });
    titlePanel.add(title);

    // Luxuriöser Untertitel
    const subtitle = this.luxuryUI.createLuxuryText("LUXURY EDITION", 0, 35, {
      fontSize: "14px",
      fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      color: "#1E3A5F",
      fontStyle: "500",
      material: 'engraved'
    });
    titlePanel.add(subtitle);

    // Luxuriöser Fortschrittsbalken
    this.progressBar = this.luxuryUI.createLuxuryPanel({
      width: width * 0.6,
      height: 24,
      materialType: 'silber',
      finishLevel: 0.9,
      baseColor: '#B8B8B8',
      accentColor: '#1E3A5F',
      reflectionIntensity: 0.6,
      cornerRadius: 12,
      glassEffect: true
    });
    this.progressBar.setPosition(width / 2, height / 2 + 20);
    this.progressBar.setDepth(1);

    // Fortschritts-Container
    const progressContainer = this.add.container(0, 0);
    this.progressBar.add(progressContainer);

    // Fortschritts-Füllung
    const progressFill = this.add.graphics();
    progressFill.fillStyle(0x1E3A5F, 0.9);
    progressFill.fillRoundedRect(-width * 0.3, -10, 0, 18, 8);
    progressContainer.add(progressFill);

    // Fortschritts-Glanz
    const progressGlow = this.add.graphics();
    progressGlow.fillStyle(0x60A5FA, 0.3);
    progressGlow.fillRoundedRect(-width * 0.3, -10, 0, 18, 8);
    progressGlow.setBlendMode(Phaser.BlendModes.ADD);
    progressContainer.add(progressGlow);

    // Prozent-Text mit Luxus-Typografie
    this.percentText = this.luxuryUI.createLuxuryText("0%", 0, 0, {
      fontSize: "14px",
      fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      color: "#F8F6F0",
      material: 'flat'
    });
    this.percentText.setPosition(width / 2, height / 2 - 15);
    this.percentText.setDepth(2);

    // Status-Text mit Luxus-Typografie
    this.statusText = this.luxuryUI.createLuxuryText("Lade Assets...", 0, 0, {
      fontSize: "12px",
      fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
      color: "#E8E8E8",
      material: 'flat'
    });
    this.statusText.setPosition(width / 2, height / 2 + 50);
    this.statusText.setDepth(2);

    // Store references for updates
    this.progressBar.setData('progressFill', progressFill);
    this.progressBar.setData('progressGlow', progressGlow);
    this.progressBar.setData('width', width * 0.6);

    queueAssetManifest(this);

    this.load.on("progress", (value: number) => {
      this.updateProgressBar(value);
      this.percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.once("complete", () => {
      this.statusText.setText("Assets bereit - starte Menü");
    });
  }

  /**
   * Updated den luxuriösen Fortschrittsbalken
   */
  private updateProgressBar(progress: number): void {
    const progressFill = this.progressBar.getData('progressFill');
    const progressGlow = this.progressBar.getData('progressGlow');
    const width = this.progressBar.getData('width');

    if (progressFill && progressGlow) {
      const fillWidth = Math.max(0, (width - 8) * Math.min(1, Math.max(0, progress)));

      progressFill.clear();
      progressFill.fillStyle(0x1E3A5F, 0.9);
      progressFill.fillRoundedRect(-width/2 + 4, -10, fillWidth, 18, 8);

      progressGlow.clear();
      progressGlow.fillStyle(0x60A5FA, 0.3);
      progressGlow.fillRoundedRect(-width/2 + 4, -10, fillWidth, 18, 8);
      progressGlow.setBlendMode(Phaser.BlendModes.ADD);
    }
  }

  create(): void {
    console.log("BootScene: Assets loaded, transitioning to MenuScene");
    
    // Luxuriöser Fade-Out
    this.cameras.main.fadeOut(800, 15, 32, 47);
    
    // Handle AudioContext initialization for modern browsers
    if (this.sound && this.sound.context && this.sound.context.state === 'suspended') {
      console.log("BootScene: Resuming suspended AudioContext");
      
      // Create a one-time click handler to resume audio
      const resumeAudio = () => {
        this.sound.context.resume().then(() => {
          console.log("BootScene: AudioContext resumed successfully");
        }).catch((error: any) => {
          console.warn("BootScene: Failed to resume AudioContext:", error);
        });
        
        // Remove the listener after first interaction
        this.input.once('pointerdown', resumeAudio);
        this.input.keyboard?.once('keydown', resumeAudio);
      };
      
      // Set up the resume handler
      this.input.once('pointerdown', resumeAudio);
      this.input.keyboard?.once('keydown', resumeAudio);
    }
    
    this.time.delayedCall(200, () => transitionToMenu(this));
  }
}
