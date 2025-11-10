import Phaser from "phaser";

type ManagedSceneKey = "BootScene" | "IndustrialMenuScene" | "MenuScene" | "GameScene" | "UIScene";

function stopIfRunning(scenePlugin: Phaser.Scenes.ScenePlugin, key: ManagedSceneKey): void {
  if (scenePlugin.isActive(key) || scenePlugin.isSleeping(key) || scenePlugin.isPaused(key)) {
    scenePlugin.stop(key);
  }
}

export function transitionToMenu(scene: Phaser.Scene): void {
  const manager = scene.scene;
  stopIfRunning(manager, "UIScene");
  if (scene.scene.key === "IndustrialMenuScene") {
    scene.scene.restart();
    return;
  }
  manager.start("IndustrialMenuScene");
}

export function transitionToGame(scene: Phaser.Scene, data?: Record<string, unknown>): void {
  const manager = scene.scene;
  stopIfRunning(manager, "GameScene");
  stopIfRunning(manager, "UIScene");

  manager.start("GameScene", data);
}

export function restartOverlayUi(scene: Phaser.Scene): void {
  const manager = scene.scene;
  if (manager.isActive("UIScene")) {
    manager.stop("UIScene");
  }
  manager.launch("UIScene");
}
