import Phaser from "phaser";
import { PlatformTextureFactory } from "./PlatformTextureFactory";
import { PlatformType } from "./platformTypes";

export interface Platform {
  sprite: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  y: number;
  width: number;
  type: PlatformType;
}

type PlatformVisualConfig = {
  widthMultiplier: number;
  height: number;
  alpha?: number;
  blendMode?: Phaser.BlendModes;
};

const PLATFORM_CONFIG: Record<PlatformType, PlatformVisualConfig> = {
  normal: { widthMultiplier: 1, height: 24 },
  wide: { widthMultiplier: 1.35, height: 24 },
  narrow: { widthMultiplier: 0.8, height: 26 },
  ice: { widthMultiplier: 1.05, height: 24, alpha: 0.95 },
  boost: {
    widthMultiplier: 1.05,
    height: 24,
    blendMode: Phaser.BlendModes.ADD,
  },
  conveyorRight: { widthMultiplier: 1.1, height: 24 },
  crumble: { widthMultiplier: 1, height: 22 },
};

type PlatformPhase = {
  progressStart: number;
  spacingRange: { min: number; max: number };
  widthRange: { min: number; max: number };
  patternChance: number;
  weights: Partial<Record<PlatformType, number>>;
};

type PlatformPatternStep = {
  spacing: number;
  offsetX: number;
  widthFactor?: number;
  type?: PlatformType;
};

type PlatformPattern = {
  steps: PlatformPatternStep[];
};

const DIFFICULTY_HEIGHT = 12000;

const PLATFORM_PHASES: PlatformPhase[] = [
  {
    progressStart: 0,
    spacingRange: { min: 90, max: 125 },
    widthRange: { min: 0.55, max: 0.75 },
    patternChance: 0.08,
    weights: { normal: 5, wide: 3, narrow: 1 },
  },
  {
    progressStart: 0.25,
    spacingRange: { min: 105, max: 145 },
    widthRange: { min: 0.48, max: 0.65 },
    patternChance: 0.12,
    weights: { normal: 4, wide: 2, narrow: 2, ice: 1 },
  },
  {
    progressStart: 0.5,
    spacingRange: { min: 120, max: 170 },
    widthRange: { min: 0.38, max: 0.58 },
    patternChance: 0.18,
    weights: { normal: 3, narrow: 3, ice: 2, boost: 1, conveyorRight: 1 },
  },
  {
    progressStart: 0.75,
    spacingRange: { min: 135, max: 195 },
    widthRange: { min: 0.32, max: 0.5 },
    patternChance: 0.24,
    weights: { narrow: 4, ice: 2, boost: 2, conveyorRight: 2, crumble: 2 },
  },
];

/**
 * PlatformManager - Infinite Platform Generation for BiesyTower
 */
export class PlatformManager extends Phaser.Events.EventEmitter {
  private readonly scene: Phaser.Scene;
  private readonly platformsGroup: Phaser.Physics.Arcade.StaticGroup;
  private platformList: Platform[] = [];
  private lastGeneratedY = 0;
  private startY = 0;
  private readonly generationOffset = 100;
  private readonly safePlatformCount = 5;
  private readonly safeSpacing = 90;
  private activePattern: { pattern: PlatformPattern; index: number } | null = null;
  private readonly textureFactory: PlatformTextureFactory;

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
    this.platformsGroup = this.scene.physics.add.staticGroup();
    this.textureFactory = new PlatformTextureFactory(scene);
  }

  public initialize(startY: number): void {
    this.clearAll();
    this.startY = startY;
    this.lastGeneratedY = startY;

    this.createBasePlatform(this.scene.scale.width / 2, startY, this.scene.scale.width * 0.8);
    this.generateSafeRunway();
    this.generatePlatformsUpTo(this.lastGeneratedY - 2000);
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
    this.activePattern = null;
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

  private generateSafeRunway(): void {
    const baseX = this.scene.scale.width / 2;
    let currentY = this.startY - this.safeSpacing;

    for (let i = 0; i < this.safePlatformCount; i += 1) {
      const width = Phaser.Math.Linear(this.scene.scale.width * 0.75, this.scene.scale.width * 0.55, i / this.safePlatformCount);
      const offset = Phaser.Math.Between(-70, 70);
      const clampedX = Phaser.Math.Clamp(baseX + offset, width * 0.5 + 20, this.scene.scale.width - width * 0.5 - 20);
      const type: PlatformType = i < 2 ? "wide" : "normal";
      const platform = this.createPlatform(clampedX, currentY, width, type);
      this.platformList.push(platform);
      currentY -= this.safeSpacing;
    }

    this.lastGeneratedY = currentY;
  }

  private getPlatformDataForHeight(height: number): {
    x: number;
    width: number;
    spacing: number;
    type: PlatformType;
  } {
    const progress = Phaser.Math.Clamp(height / DIFFICULTY_HEIGHT, 0, 1);

    const patternData = this.consumePatternStep(progress);
    if (patternData) {
      return patternData;
    }

    if (!this.activePattern && Math.random() < this.getPhaseForProgress(progress).patternChance) {
      this.activePattern = { pattern: this.createPattern(progress), index: 0 };
      const seededData = this.consumePatternStep(progress);
      if (seededData) {
        return seededData;
      }
    }

    return this.buildFreeformPlatform(progress);
  }

  private buildFreeformPlatform(progress: number): {
    x: number;
    width: number;
    spacing: number;
    type: PlatformType;
  } {
    const phase = this.getPhaseForProgress(progress);
    let width = this.rollWidth(phase);
    const spacing = this.rollSpacing(phase);

    let type = this.rollPlatformType(progress, phase.weights);

    if (type === "wide") {
      width = Math.min(width * 1.15, this.scene.scale.width * 0.85);
    } else if (type === "narrow") {
      width = Math.max(width * 0.75, 60);
    }

    if (Math.random() < 0.18) {
      const modifier = Phaser.Math.FloatBetween(0.75, 1.25);
      width = Phaser.Math.Clamp(width * modifier, 60, this.scene.scale.width * 0.85);
      if (modifier < 0.85 && Math.random() < 0.5) {
        type = "narrow";
      }
    }

    const x = this.rollPlatformX(width);
    return { x, width, spacing, type };
  }

  private rollSpacing(phase: PlatformPhase): number {
    const base = Phaser.Math.FloatBetween(phase.spacingRange.min, phase.spacingRange.max);
    let spacing = base * Phaser.Math.FloatBetween(0.92, 1.15);

    if (Math.random() < 0.12) {
      spacing *= 1.35;
    } else if (Math.random() < 0.2) {
      spacing *= 0.78;
    }

    return Phaser.Math.Clamp(spacing, 70, 240);
  }

  private rollWidth(phase: PlatformPhase): number {
    const multiplier = Phaser.Math.FloatBetween(phase.widthRange.min, phase.widthRange.max);
    return Phaser.Math.Clamp(this.scene.scale.width * multiplier, 60, this.scene.scale.width * 0.85);
  }

  private rollPlatformX(width: number): number {
    const lastPlatform = this.platformList[this.platformList.length - 1];
    const lastX = lastPlatform?.sprite.x ?? this.scene.scale.width / 2;
    const padding = 40;
    const minX = padding + width / 2;
    const maxX = this.scene.scale.width - padding - width / 2;

    let x = lastX + Phaser.Math.FloatBetween(-220, 220);
    if (Math.random() < 0.35) {
      const swingToRight = lastX < (minX + maxX) / 2;
      const swingMin = swingToRight ? Math.min(lastX + 80, maxX) : minX;
      const swingMax = swingToRight ? maxX : Math.max(lastX - 80, minX);
      if (swingMax > swingMin) {
        x = Phaser.Math.FloatBetween(swingMin, swingMax);
      }
    }

    if (Math.random() < 0.15) {
      x = Phaser.Math.FloatBetween(minX, maxX);
    }

    if (Math.abs(x - lastX) < 50) {
      x += x < lastX ? -70 : 70;
    }

    return this.clampPlatformX(x, width);
  }

  private clampPlatformX(x: number, width: number): number {
    const padding = 40;
    const minX = padding + width / 2;
    const maxX = this.scene.scale.width - padding - width / 2;
    return Phaser.Math.Clamp(x, minX, maxX);
  }

  private getPhaseForProgress(progress: number): PlatformPhase {
    for (let i = PLATFORM_PHASES.length - 1; i >= 0; i -= 1) {
      if (progress >= PLATFORM_PHASES[i].progressStart) {
        return PLATFORM_PHASES[i];
      }
    }
    return PLATFORM_PHASES[0];
  }

  private rollPlatformType(
    progress: number,
    weightOverrides?: Partial<Record<PlatformType, number>>
  ): PlatformType {
    const baseWeights: Record<PlatformType, number> = {
      normal: Phaser.Math.Linear(3, 1.2, progress),
      wide: Phaser.Math.Linear(1.3, 0.3, progress),
      narrow: Phaser.Math.Linear(0.5, 1.7, progress),
      ice: progress > 0.2 ? Phaser.Math.Linear(0.15, 1.2, progress) : 0,
      boost: progress > 0.3 ? Phaser.Math.Linear(0.1, 1.3, progress) : 0,
      conveyorRight: progress > 0.55 ? Phaser.Math.Linear(0.05, 1, progress) : 0,
      crumble: progress > 0.65 ? Phaser.Math.Linear(0.05, 0.9, progress) : 0,
    };

    this.applyWeightOverrides(baseWeights, this.getPhaseForProgress(progress).weights);
    this.applyWeightOverrides(baseWeights, weightOverrides);

    const entries = Object.entries(baseWeights).filter(([, weight]) => weight > 0) as Array<
      [PlatformType, number]
    >;
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = Math.random() * total;
    for (const [type, weight] of entries) {
      roll -= weight;
      if (roll <= 0) {
        return type;
      }
    }
    return "normal";
  }

  private applyWeightOverrides(
    target: Record<PlatformType, number>,
    overrides?: Partial<Record<PlatformType, number>>
  ): void {
    if (!overrides) {
      return;
    }
    Object.entries(overrides).forEach(([key, value]) => {
      const typedKey = key as PlatformType;
      if (value && value > 0) {
        target[typedKey] = (target[typedKey] ?? 0) + value;
      }
    });
  }

  private consumePatternStep(
    progress: number
  ): { x: number; width: number; spacing: number; type: PlatformType } | null {
    if (!this.activePattern) {
      return null;
    }
    const { pattern, index } = this.activePattern;
    const step = pattern.steps[index];
    this.activePattern.index += 1;
    if (this.activePattern.index >= pattern.steps.length) {
      this.activePattern = null;
    }

    const width =
      step.widthFactor !== undefined
        ? Phaser.Math.Clamp(this.scene.scale.width * step.widthFactor, 60, this.scene.scale.width * 0.85)
        : this.rollWidth(this.getPhaseForProgress(progress));
    const x = this.clampPlatformX(this.getLastPlatformX() + step.offsetX, width);
    const spacing = Phaser.Math.Clamp(step.spacing, 65, 260);
    const type = step.type ?? this.rollPlatformType(progress);

    return { x, width, spacing, type };
  }

  private getLastPlatformX(): number {
    return this.platformList[this.platformList.length - 1]?.sprite.x ?? this.scene.scale.width / 2;
  }

  private createPattern(progress: number): PlatformPattern {
    if (progress < 0.35) {
      return {
        steps: [
          { spacing: 85, offsetX: -120, widthFactor: 0.6, type: "wide" },
          { spacing: 75, offsetX: 150, widthFactor: 0.5 },
          { spacing: 80, offsetX: -110, widthFactor: 0.45 },
        ],
      };
    }

    if (progress < 0.65) {
      const shift = Phaser.Math.Between(-40, 40);
      return {
        steps: [
          { spacing: 110, offsetX: shift, widthFactor: 0.52 },
          { spacing: 135, offsetX: 80, widthFactor: 0.42, type: "narrow" },
          { spacing: 190, offsetX: -60, widthFactor: 0.5, type: "boost" },
        ],
      };
    }

    return {
      steps: [
        { spacing: 105, offsetX: -90, widthFactor: 0.4, type: "ice" },
        { spacing: 125, offsetX: 150, widthFactor: 0.36, type: "conveyorRight" },
        { spacing: 160, offsetX: -180, widthFactor: 0.34, type: "crumble" },
        { spacing: 140, offsetX: 120, widthFactor: 0.38 },
      ],
    };
  }

  private createPlatform(x: number, y: number, width: number, type: PlatformType): Platform {
    const config = PLATFORM_CONFIG[type];
    const actualWidth = width * config.widthMultiplier;

    const textureKey = this.textureFactory.getTextureKey(type, actualWidth, config.height);
    const platform = this.scene.physics.add.staticImage(x, y, textureKey);
    platform
      .setOrigin(0.5, 0.5)
      .setDisplaySize(actualWidth, config.height)
      .setAlpha(config.alpha ?? 1)
      .setDepth(2);

    platform.setBlendMode(config.blendMode ?? Phaser.BlendModes.NORMAL);
    
    // Enhanced collision box alignment
    const body = platform.body as Phaser.Physics.Arcade.StaticBody;
    body.checkCollision.down = false;
    body.checkCollision.left = true;
    body.checkCollision.right = true;

    // Raise and slim the collider so the player stands visually on top of the platform
    const colliderHeight = Math.max(6, config.height * 0.3);
    body.setSize(actualWidth * 0.96, colliderHeight);
    body.setOffset((actualWidth - body.width) / 2, -config.height * 0.45);
    
    platform.setData("platformType", type);
    platform.refreshBody();
    this.platformsGroup.add(platform);

    // Add visual enhancements for special platform types
    this.addPlatformVisualEffects(platform, type, textureKey);

    return {
      sprite: platform,
      y,
      width: actualWidth,
      type,
    };
  }

  private addPlatformVisualEffects(
    platform: Phaser.Types.Physics.Arcade.ImageWithStaticBody,
    type: PlatformType,
    textureKey: string
  ): void {
    const { x, y } = platform;
    const glowAlpha = type === "normal" ? 0.12 : 0.26;
    const glow = this.scene.add
      .image(x, y, textureKey)
      .setDisplaySize(platform.displayWidth * 1.05, platform.displayHeight * 1.18)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(glowAlpha)
      .setDepth(1);

    this.scene.tweens.add({
      targets: glow,
      alpha: { from: glowAlpha * 0.7, to: glowAlpha * 1.3 },
      scaleX: { from: 1.02, to: 1.06 },
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    platform.once(Phaser.GameObjects.Events.DESTROY, () => glow.destroy());

    if (type === "boost" || type === "conveyorRight" || type === "ice") {
      this.createPlatformParticles(platform, type);
    }
  }

  private createPlatformParticles(platform: Phaser.Types.Physics.Arcade.ImageWithStaticBody, type: PlatformType): void {
    const { x, y } = platform;
    const particleCount = type === "boost" ? 4 : 3;
    const particleColor = type === "boost" ? 0x4adeff : 0xffaa44;
    
    for (let i = 0; i < particleCount; i++) {
      const offsetX = (Math.random() - 0.5) * platform.displayWidth;
      const offsetY = -platform.displayHeight * 0.3;
      const particle = this.scene.add
        .circle(x + offsetX, y + offsetY, 1.5, particleColor, 0.6)
        .setDepth(1);
      
      const moveDistance = 20 + Math.random() * 20;
      const duration = 1500 + Math.random() * 1000;
      
      this.scene.tweens.add({
        targets: particle,
        y: y + offsetY - moveDistance,
        alpha: 0,
        scaleX: 2,
        scaleY: 2,
        duration: duration,
        repeat: -1,
        ease: "Power2",
        delay: i * 200,
        onComplete: () => particle.destroy(),
      });

      platform.once(Phaser.GameObjects.Events.DESTROY, () => particle.destroy());
    }
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
