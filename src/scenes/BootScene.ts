import Phaser from "phaser";
import { baseGameConfig } from "../config/gameConfig";

/**
 * BootScene:
 * - Lädt globale Assets & Konfiguration
 * - Wechselt danach ins Hauptmenü
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    this.cameras.main.setBackgroundColor(baseGameConfig.colors.background);
    // Platzhalter: hier später Loader-Bar, Logos, Config-Load etc.
  }

  create(): void {
    console.log("BootScene: Starting, transitioning to MenuScene");
    this.scene.start("MenuScene");
    console.log("BootScene: Transition initiated");
    this.scene.start("MenuScene");
  }
}