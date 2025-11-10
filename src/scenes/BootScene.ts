import Phaser from "phaser";
import { baseGameConfig } from "../config/gameConfig";
import { queueAssetManifest } from "../assets/assetManifest";
import { transitionToMenu } from "../core/scene/SceneController";

/**
 * BootScene handles global preloading and shows a lightweight progress UI so we
 * can guarantee assets exist before the menu or gameplay try to use them.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(baseGameConfig.colors.background);

    const title = this.add
      .text(width / 2, height / 2 - 80, "BIESYTOWER", {
        fontSize: "24px",
        color: "#f0f4f8",
        fontStyle: "bold",
        align: "center",
        stroke: "#4a5568",
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    title.setShadow(1, 1, "#000000", 8, true, true);

    this.add
      .text(width / 2, title.y + 28, "", {
        fontSize: "12px",
        color: "#8b0000",
      })
      .setOrigin(0.5);

    const barWidth = width * 0.6;
    const barX = width / 2;
    const barY = height / 2 + 12;

    this.add
      .rectangle(barX, barY, barWidth, 12, 0x2d3748)
      .setStrokeStyle(2, 0x4a5568, 0.8)
      .setOrigin(0.5);

    const progressBar = this.add
      .rectangle(barX - barWidth / 2, barY, barWidth, 12, 0x4a5568)
      .setOrigin(0, 0.5);
    progressBar.scaleX = 0;

    const percentText = this.add
      .text(barX, barY - 18, "0%", {
        fontSize: "12px",
        color: "#f0f4f8",
      })
      .setOrigin(0.5);

    const statusText = this.add
      .text(barX, barY + 24, "Lade Assets ...", {
        fontSize: "12px",
        color: "#718096",
      })
      .setOrigin(0.5);

    queueAssetManifest(this);

    this.load.on("progress", (value: number) => {
      progressBar.scaleX = Phaser.Math.Clamp(value, 0, 1);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.once("complete", () => {
      statusText.setText("Assets bereit - starte Menü");
    });
  }

  create(): void {
    console.log("BootScene: Assets loaded, transitioning to MenuScene");
    
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
