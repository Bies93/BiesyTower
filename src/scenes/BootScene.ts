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
        color: "#12f7ff",
        fontStyle: "bold",
        align: "center",
        stroke: "#7b2dff",
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    title.setShadow(0, 0, "#7b2dff", 16, true, true);

    this.add
      .text(width / 2, title.y + 28, "Pre-Alpha Build", {
        fontSize: "12px",
        color: "#ffe6ff",
      })
      .setOrigin(0.5);

    const barWidth = width * 0.6;
    const barX = width / 2;
    const barY = height / 2 + 12;

    this.add
      .rectangle(barX, barY, barWidth, 12, 0x0b1730)
      .setStrokeStyle(2, 0x17315a, 0.9)
      .setOrigin(0.5);

    const progressBar = this.add
      .rectangle(barX - barWidth / 2, barY, barWidth, 12, 0x12f7ff)
      .setOrigin(0, 0.5);
    progressBar.scaleX = 0;

    const percentText = this.add
      .text(barX, barY - 18, "0%", {
        fontSize: "12px",
        color: "#e9f3ff",
      })
      .setOrigin(0.5);

    const statusText = this.add
      .text(barX, barY + 24, "Lade Assets ...", {
        fontSize: "12px",
        color: "#12f7ff",
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
    this.time.delayedCall(200, () => transitionToMenu(this));
  }
}
