import Phaser from "phaser";
import { IMAGE_KEYS } from "../../assets/assetManifest";

type LayerConfig = {
  key: string;
  factor: number;
  depth: number;
  alpha?: number;
  blendMode?: Phaser.BlendModes;
};

export class BackgroundManager {
  private layers: { sprite: Phaser.GameObjects.TileSprite; factor: number }[] = [];
  private props: Phaser.GameObjects.Image[] = [];
  private gradientOverlay?: Phaser.GameObjects.Graphics;
  private lightColumns: Phaser.GameObjects.Rectangle[] = [];

  constructor(private scene: Phaser.Scene) {}

  create(): void {
    const { width, height } = this.scene.scale;
    const configs: LayerConfig[] = [
      { key: IMAGE_KEYS.backgroundSkyline, factor: 0.1, depth: -30, alpha: 0.9 },
      { key: IMAGE_KEYS.backgroundMidFog, factor: 0.2, depth: -20, alpha: 0.8 },
      { key: IMAGE_KEYS.backgroundNearPillars, factor: 0.35, depth: -10, alpha: 0.95 },
    ];

    configs.forEach((config) => this.createLayer(config, width, height));
    this.createProps(width, height);
    this.createGradientOverlay(width, height);
    this.createLightColumns(width, height);
  }

  update(camera: Phaser.Cameras.Scene2D.Camera, progress = 0): void {
    const cold = Phaser.Display.Color.ValueToColor(0x0a1a33);
    const warm = Phaser.Display.Color.ValueToColor(0x7ce8ff);
    this.layers.forEach((layer, index) => {
      layer.sprite.tilePositionY = camera.scrollY * layer.factor;
      const influence = Phaser.Math.Clamp(progress + index * 0.12, 0, 1);
      const mix = Phaser.Display.Color.Interpolate.ColorWithColor(cold, warm, 100, influence * 100);
      layer.sprite.setTint(Phaser.Display.Color.GetColor(mix.r, mix.g, mix.b));
    });

    this.lightColumns.forEach((column, index) => {
      column.y = camera.scrollY + this.scene.scale.height * 0.3 + index * 120;
      column.alpha = 0.06 + progress * 0.25;
    });

    if (this.gradientOverlay) {
      this.gradientOverlay.setAlpha(0.3 + progress * 0.25);
    }
  }

  destroy(): void {
    this.layers.forEach((layer) => layer.sprite.destroy());
    this.layers = [];
    this.props.forEach((prop) => prop.destroy());
    this.props = [];
    this.gradientOverlay?.destroy();
    this.gradientOverlay = undefined;
    this.lightColumns.forEach((column) => column.destroy());
    this.lightColumns = [];
  }

  private createLayer(config: LayerConfig, width: number, height: number): void {
    const sprite = this.scene.add
      .tileSprite(width / 2, height / 2, width * 2, height * 2, config.key)
      .setScrollFactor(0)
      .setDepth(config.depth)
      .setAlpha(config.alpha ?? 1);

    if (config.blendMode) {
      sprite.setBlendMode(config.blendMode);
    }

    this.layers.push({ sprite, factor: config.factor });
  }

  private createProps(width: number, height: number): void {
    const shardCount = 6;
    for (let i = 0; i < shardCount; i += 1) {
      const shard = this.scene.add
        .image(
          Phaser.Math.Between(width * 0.05, width * 0.95),
          Phaser.Math.Between(height * 0.1, height * 0.9),
          IMAGE_KEYS.propFloatingShards
        )
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0.25 + Math.random() * 0.2)
        .setScrollFactor(0.05 + i * 0.03)
        .setDepth(-5);

      const scale = 0.4 + Math.random() * 0.4;
      shard.setScale(scale);

      this.scene.tweens.add({
        targets: shard,
        angle: { from: -2, to: 2 },
        duration: 2200 + Math.random() * 1200,
        yoyo: true,
        repeat: -1,
      });

      this.props.push(shard);
    }
  }

  private createGradientOverlay(width: number, height: number): void {
    const overlay = this.scene.add.graphics();
    overlay.setScrollFactor(0);
    overlay.setDepth(-25);
    overlay.fillGradientStyle(0x081124, 0x0b1a36, 0x091127, 0x04060c, 0.4);
    overlay.fillRect(-width, -height, width * 3, height * 3);
    this.gradientOverlay = overlay;
  }

  private createLightColumns(width: number, height: number): void {
    const columnCount = 3;
    for (let i = 0; i < columnCount; i++) {
      const column = this.scene.add.rectangle(
        width * (0.25 + i * 0.25),
        0,
        width * 0.15,
        height * 2.2,
        0x7ce8ff,
        0.08
      );
      column.setBlendMode(Phaser.BlendModes.ADD).setDepth(-15).setScrollFactor(0.05 + i * 0.03);
      this.lightColumns.push(column);
    }
  }
}
