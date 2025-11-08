import Phaser from "phaser";
import { transitionToGame } from "../core/scene/SceneController";

/**
 * MenuScene:
 * - Einfaches Hauptmenü (Start, später Settings/How-To)
 * - Minimal gehalten, um schnell ins Spiel zu kommen
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create(): void {
    console.log("MenuScene: Creating menu");
    const { width, height } = this.scale;
    let isStarting = false;

    this.cameras.main.fadeIn(250, 0, 0, 0);

    const title = this.add.text(width / 2, height / 2 - 40, "ICY TOWER MODERN", {
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: "20px",
      color: "#e9f3ff",
    });
    title.setOrigin(0.5);

    const startText = this.add.text(width / 2, height / 2 + 10, "Press SPACE to start", {
      fontSize: "14px",
      color: "#9fdcff",
    });
    startText.setOrigin(0.5);

    this.input.keyboard?.on("keydown-SPACE", () => {
      if (isStarting) {
        return;
      }
      isStarting = true;
      console.log("MenuScene: Space pressed, starting GameScene");
      this.cameras.main.fadeOut(200, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        transitionToGame(this);
      });
    });
  }
}
