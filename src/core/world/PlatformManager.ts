import Phaser from "phaser";
import { IMAGE_KEYS } from "../../assets/assetManifest";

export type PlatformType =
  | "normal"
  | "wide"
  | "narrow"
  | "ice"
  | "boost"
  | "conveyorRight"
  | "crumble";

export interface Platform {
  sprite: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  y: number;
  width: number;
  type: PlatformType;
}

type PlatformVisualConfig = {
  texture: string;
  widthMultiplier: number;
  height: number;
  alpha?: number;
  blendMode?: Phaser.BlendModes;
};

const PLATFORM_CONFIG: Record<PlatformType, PlatformVisualConfig> = {
  normal: { texture: IMAGE_KEYS.platformBase, widthMultiplier: 1, height: 24 },
  wide: { texture: IMAGE_KEYS.platformBase, widthMultiplier: 1.35, height: 24 },
  narrow: { texture: IMAGE_KEYS.platformNarrow, widthMultiplier: 0.8, height: 26 },
  ice: { texture: IMAGE_KEYS.platformIce, widthMultiplier: 1.05, height: 24, alpha: 0.95 },
  boost: {
    texture: IMAGE_KEYS.platformBoost,
    widthMultiplier: 1.05,
    height: 24,
    blendMode: Phaser.BlendModes.ADD,
  },
  conveyorRight: { texture: IMAGE_KEYS.platformConveyorRight, widthMultiplier: 1.1, height: 24 },
  crumble: { texture: IMAGE_KEYS.platformCrumble, widthMultiplier: 1, height: 22 },
};

/**
 * PlatformManager - Infinite Platform Generation for Icy Tower
 */
export class PlatformManager extends Phaser.Events.EventEmitter {
  private readonly scene: Phaser.Scene;
  private readonly platformsGroup: Phaser.Physics.Arcade.StaticGroup;
  private platformList: Platform[] = [];
  private lastGeneratedY = 0;
  private startY = 0;
  private readonly generationOffset = 100;

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
    this.platformsGroup = this.scene.physics.add.staticGroup();
  }

  public initialize(startY: number): void {
    this.clearAll();
    this.startY = startY;
    this.lastGeneratedY = startY;

    this.createBasePlatform(this.scene.scale.width / 2, startY, this.scene.scale.width * 0.8);
    this.generatePlatformsUpTo(startY - 2000);
  }

  public update(camera: Phaser.Cameras.Scene2D.Camera): void {
    const cameraBottom = camera.scrollY + this.scene.scale.height;
    const targetGenerationY = cameraBottom - this.generationOffset;
    if (this.lastGeneratedY > targetGenerationY) {
      this.generatePlatformsUpTo(targetGenerationY);
    }
    this.cleanupOldPlatforms(cameraBottom + 500);
  }

  public createBasePlatform(
    x: number,
    y: number,
    width: number = this.scene.scale.width * 0.8
  ): Phaser.Types.Physics.Arcade.ImageWithStaticBody {
    const platform = this.createPlatform(x, y, width, "normal");
    platform.sprite.setDepth(3);
    return platform.sprite;
  }

  public getGroup(): Phaser.Physics.Arcade.StaticGroup {
    return this.platformsGroup;
  }

  public getCurrentPlatforms(): Platform[] {
    return this.platformList;
  }

  public getLastGeneratedY(): number {
    return this.lastGeneratedY;
  }

  private clearAll(): void {
    this.platformList.forEach((platform) => platform.sprite.destroy());
    this.platformList = [];
    this.platformsGroup.clear(true, true);
  }

  private generatePlatformsUpTo(targetY: number): void {
    let currentY = this.lastGeneratedY;

    while (currentY > targetY) {
      const height = this.startY - currentY;
      const platformData = this.getPlatformDataForHeight(height);
      const platform = this.createPlatform(platformData.x, currentY, platformData.width, platformData.type);
      this.platformList.push(platform);
      currentY -= platformData.spacing;
    }

    this.lastGeneratedY = currentY;
  }

  private getPlatformDataForHeight(height: number): {
    x: number;
    width: number;
    spacing: number;
    type: PlatformType;
  } {
    const progress = Phaser.Math.Clamp(height / 10000, 0, 1);
    const baseSpacing = 110;
    const maxSpacing = 190;
    const spacing = Phaser.Math.Linear(baseSpacing, maxSpacing, progress * 0.7);

    const baseWidth = this.scene.scale.width * 0.75;
    const minWidth = 90;
    const width = Phaser.Math.Linear(baseWidth, minWidth, progress);

    let type: PlatformType = "normal";
    const random = Math.random();
    if (progress > 0.65 && random < 0.12) {
      type = "crumble";
    } else if (progress > 0.55 && random < 0.18) {
      type = "conveyorRight";
    } else if (progress > 0.45 && random < 0.25) {
      type = "boost";
    } else if (progress > 0.35 && random < 0.25) {
      type = "ice";
    } else if (progress > 0.25 && random < 0.35) {
      type = "narrow";
    } else if (random < 0.15) {
      type = "wide";
    }

    const padding = 50;
    const minX = padding + width / 2;
    const maxX = this.scene.scale.width - padding - width / 2;
    let x = Phaser.Math.Between(minX, maxX);

    if (this.platformList.length > 0) {
      const lastPlatform = this.platformList[this.platformList.length - 1];
      const minDistance = 120;
      if (Math.abs(x - lastPlatform.sprite.x) < minDistance) {
        x = x < this.scene.scale.width / 2 ? Math.max(minX, x - minDistance) : Math.min(maxX, x + minDistance);
      }
    }

    return { x, width, spacing, type };
  }

  private createPlatform(x: number, y: number, width: number, type: PlatformType): Platform {
    const config = PLATFORM_CONFIG[type];
    const actualWidth = width * config.widthMultiplier;

    const platform = this.scene.physics.add.staticImage(x, y, config.texture);
    platform
      .setOrigin(0.5, 0.5)
      .setDisplaySize(actualWidth, config.height)
      .setAlpha(config.alpha ?? 1)
      .setDepth(2);

    platform.setBlendMode(config.blendMode ?? Phaser.BlendModes.NORMAL);
    const body = platform.body as Phaser.Physics.Arcade.StaticBody;
    body.checkCollision.down = false;
    body.checkCollision.left = true;
    body.checkCollision.right = true;
    platform.refreshBody();
    this.platformsGroup.add(platform);

    return {
      sprite: platform,
      y,
      width: actualWidth,
      type,
    };
  }

  private cleanupOldPlatforms(maxY: number): void {
    const keepPlatforms: Platform[] = [];
    for (const platform of this.platformList) {
      if (platform.y <= maxY) {
        keepPlatforms.push(platform);
      } else {
        platform.sprite.destroy();
      }
    }
    this.platformList = keepPlatforms;
  }
}

export function createPlatformManagerStub(scene: Phaser.Scene): PlatformManager {
  return new PlatformManager(scene);
}
