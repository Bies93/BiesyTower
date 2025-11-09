import Phaser from "phaser";
import { PlatformType } from "./platformTypes";

type PlatformPalette = {
  top: number;
  mid: number;
  bottom: number;
  rim: number;
  accent: number;
  sparkle?: number;
};

type PlatformStyle = {
  palette: PlatformPalette;
  pattern?: "ice" | "boost" | "tech" | "crumble";
  noiseAlpha?: number;
};

const PLATFORM_STYLES: Record<PlatformType, PlatformStyle> = {
  normal: {
    palette: {
      top: 0x6be1ff,
      mid: 0x3ec2ff,
      bottom: 0x14304d,
      rim: 0x9ef5ff,
      accent: 0x0f1f34,
    },
    noiseAlpha: 0.08,
  },
  wide: {
    palette: {
      top: 0x6be1ff,
      mid: 0x3ec2ff,
      bottom: 0x14304d,
      rim: 0x9ef5ff,
      accent: 0x0f1f34,
    },
    noiseAlpha: 0.08,
  },
  narrow: {
    palette: {
      top: 0x7ff0ff,
      mid: 0x4dc3ff,
      bottom: 0x1a3c5f,
      rim: 0xc2f7ff,
      accent: 0x10233b,
    },
    noiseAlpha: 0.05,
  },
  ice: {
    palette: {
      top: 0xd2f5ff,
      mid: 0x7ad8ff,
      bottom: 0x2f6a8f,
      rim: 0xffffff,
      accent: 0x103046,
      sparkle: 0xffffff,
    },
    pattern: "ice",
    noiseAlpha: 0.12,
  },
  boost: {
    palette: {
      top: 0x9df5ff,
      mid: 0x42f0ff,
      bottom: 0x1a3472,
      rim: 0xffffff,
      accent: 0x291354,
      sparkle: 0xfff3a1,
    },
    pattern: "boost",
    noiseAlpha: 0.14,
  },
  conveyorRight: {
    palette: {
      top: 0xfff2c1,
      mid: 0xffc472,
      bottom: 0x4a1f0d,
      rim: 0xffffff,
      accent: 0x260e04,
    },
    pattern: "tech",
    noiseAlpha: 0.08,
  },
  crumble: {
    palette: {
      top: 0xd3bbff,
      mid: 0x9f7bff,
      bottom: 0x3d1e5e,
      rim: 0xf0d5ff,
      accent: 0x210c34,
    },
    pattern: "crumble",
    noiseAlpha: 0.2,
  },
};

const WIDTH_BUCKET = 24;
const RETINA_SCALE = 2;

export class PlatformTextureFactory {
  private readonly cache = new Map<string, string>();

  constructor(private readonly scene: Phaser.Scene) {}

  public getTextureKey(type: PlatformType, width: number, height: number): string {
    const bucketWidth = Math.max(WIDTH_BUCKET, Math.ceil(width / WIDTH_BUCKET) * WIDTH_BUCKET);
    const cacheKey = `${type}-${bucketWidth}x${height}`;
    if (!this.cache.has(cacheKey)) {
      this.cache.set(cacheKey, cacheKey);
      this.createTexture(cacheKey, type, bucketWidth, height);
    }
    return cacheKey;
  }

  private createTexture(key: string, type: PlatformType, width: number, height: number): void {
    const style = PLATFORM_STYLES[type];
    const gfx = this.scene.make.graphics({ add: false });
    const drawWidth = width * RETINA_SCALE;
    const drawHeight = height * RETINA_SCALE;
    const radius = Math.min(drawHeight * 0.55, 32);

    gfx.clear();
    gfx.fillGradientStyle(
      style.palette.top,
      style.palette.top,
      style.palette.mid,
      style.palette.bottom,
      1
    );
    gfx.fillRoundedRect(0, 0, drawWidth, drawHeight, radius);

    // Rim light
    gfx.lineStyle(4, style.palette.rim, 0.6);
    gfx.strokeRoundedRect(2, 2, drawWidth - 4, drawHeight - 4, radius - 3);

    // Accent bottom line for depth
    gfx.fillStyle(style.palette.accent, 0.9);
    gfx.fillRoundedRect(0, drawHeight - 12, drawWidth, 12, { tl: 0, tr: 0, bl: radius, br: radius });

    // Add optional patterns
    switch (style.pattern) {
      case "ice":
        this.drawIcePattern(gfx, drawWidth, drawHeight);
        break;
      case "boost":
        this.drawBoostPattern(gfx, drawWidth, drawHeight, style.palette.sparkle ?? style.palette.rim);
        break;
      case "tech":
        this.drawTechPattern(gfx, drawWidth, drawHeight);
        break;
      case "crumble":
        this.drawCrumblePattern(gfx, drawWidth, drawHeight);
        break;
      default:
        this.drawStandardStripes(gfx, drawWidth, drawHeight, style.palette.rim);
        break;
    }

    if (style.noiseAlpha) {
      this.addNoise(gfx, drawWidth, drawHeight, style.noiseAlpha);
    }

    gfx.generateTexture(key, drawWidth, drawHeight);
    gfx.destroy();
  }

  private drawStandardStripes(
    gfx: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    color: number
  ): void {
    gfx.lineStyle(2, color, 0.2);
    for (let x = 6; x < width; x += 18) {
      gfx.beginPath();
      gfx.moveTo(x, height * 0.25);
      gfx.lineTo(x + 12, height * 0.5);
      gfx.lineTo(x, height * 0.75);
      gfx.strokePath();
    }
  }

  private drawIcePattern(gfx: Phaser.GameObjects.Graphics, width: number, height: number): void {
    gfx.lineStyle(3, 0xffffff, 0.4);
    for (let i = 0; i < 5; i++) {
      const startX = Phaser.Math.Between(10, width - 10);
      gfx.beginPath();
      gfx.moveTo(startX, height * 0.1);
      gfx.lineTo(startX + Phaser.Math.Between(-18, 18), height * 0.6);
      gfx.strokePath();
    }
  }

  private drawBoostPattern(
    gfx: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    color: number
  ): void {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    gfx.fillStyle(color, 0.45);
    gfx.fillCircle(centerX, centerY, radius);
    gfx.fillStyle(color, 0.25);
    gfx.fillCircle(centerX, centerY, radius * 1.4);
  }

  private drawTechPattern(gfx: Phaser.GameObjects.Graphics, width: number, height: number): void {
    gfx.lineStyle(4, 0xffd089, 0.5);
    gfx.strokeRoundedRect(12, height * 0.25, width - 24, height * 0.5, 12);
    gfx.lineStyle(2, 0xffffff, 0.5);
    for (let x = 20; x < width - 20; x += 22) {
      gfx.beginPath();
      gfx.moveTo(x, height * 0.3);
      gfx.lineTo(x + 8, height * 0.7);
      gfx.strokePath();
    }
  }

  private drawCrumblePattern(gfx: Phaser.GameObjects.Graphics, width: number, height: number): void {
    gfx.fillStyle(0x000000, 0.4);
    for (let i = 0; i < 40; i++) {
      const w = Phaser.Math.Between(4, 18);
      const h = Phaser.Math.Between(2, 8);
      gfx.fillRect(
        Phaser.Math.Between(0, width - w),
        Phaser.Math.Between(4, height - h - 6),
        w,
        h
      );
    }
  }

  private addNoise(gfx: Phaser.GameObjects.Graphics, width: number, height: number, alpha: number): void {
    for (let i = 0; i < 260; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      gfx.fillStyle(0xffffff, Phaser.Math.FloatBetween(alpha * 0.3, alpha));
      gfx.fillCircle(x, y, size);
    }
  }
}
