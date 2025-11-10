import Phaser from "phaser";
import { PlatformType } from "./platformTypes";

type PlatformPalette = {
  top: number;
  mid: number;
  bottom: number;
  rim: number;
  accent: number;
  sparkle?: number;
  glow?: number;
  emissive?: number;
};

type MaterialProperties = {
  metallic: number;      // 0-1, how metallic the surface looks
  roughness: number;     // 0-1, surface roughness
  emissive: number;      // 0-1, how much it emits light
  transparency: number;  // 0-1, transparency level
  refraction: number;    // 0-1, light refraction effect
};

type PlatformStyle = {
  palette: PlatformPalette;
  pattern?: "ice" | "boost" | "tech" | "crumble" | "neon" | "holographic" | "crystal";
  noiseAlpha?: number;
  material: MaterialProperties;
  animationType?: "pulse" | "wave" | "energy" | "static";
  glowIntensity?: number;
  particleEffect?: boolean;
};

const PLATFORM_STYLES: Record<PlatformType, PlatformStyle> = {
  normal: {
    palette: {
      top: 0x6be1ff,
      mid: 0x3ec2ff,
      bottom: 0x14304d,
      rim: 0x9ef5ff,
      accent: 0x0f1f34,
      glow: 0x4adeff,
      emissive: 0x2db3ff,
    },
    material: {
      metallic: 0.3,
      roughness: 0.4,
      emissive: 0.2,
      transparency: 0.1,
      refraction: 0.05,
    },
    pattern: "neon",
    noiseAlpha: 0.08,
    animationType: "pulse",
    glowIntensity: 0.3,
    particleEffect: true,
  },
  wide: {
    palette: {
      top: 0x7dd8ff,
      mid: 0x4ac9ff,
      bottom: 0x1a3c5f,
      rim: 0xa8ecff,
      accent: 0x0f1f34,
      glow: 0x5ad4ff,
      emissive: 0x3dbfff,
    },
    material: {
      metallic: 0.4,
      roughness: 0.3,
      emissive: 0.25,
      transparency: 0.08,
      refraction: 0.06,
    },
    pattern: "neon",
    noiseAlpha: 0.08,
    animationType: "wave",
    glowIntensity: 0.35,
    particleEffect: true,
  },
  narrow: {
    palette: {
      top: 0x7ff0ff,
      mid: 0x4dc3ff,
      bottom: 0x1a3c5f,
      rim: 0xc2f7ff,
      accent: 0x10233b,
      glow: 0x6adfff,
      emissive: 0x4ac9ff,
    },
    material: {
      metallic: 0.5,
      roughness: 0.2,
      emissive: 0.3,
      transparency: 0.05,
      refraction: 0.08,
    },
    pattern: "holographic",
    noiseAlpha: 0.05,
    animationType: "energy",
    glowIntensity: 0.4,
    particleEffect: true,
  },
  ice: {
    palette: {
      top: 0xd2f5ff,
      mid: 0x7ad8ff,
      bottom: 0x2f6a8f,
      rim: 0xffffff,
      accent: 0x103046,
      sparkle: 0xffffff,
      glow: 0xa8ecff,
      emissive: 0x7dd8ff,
    },
    material: {
      metallic: 0.1,
      roughness: 0.1,
      emissive: 0.4,
      transparency: 0.6,
      refraction: 0.8,
    },
    pattern: "crystal",
    noiseAlpha: 0.12,
    animationType: "pulse",
    glowIntensity: 0.6,
    particleEffect: true,
  },
  boost: {
    palette: {
      top: 0x9df5ff,
      mid: 0x42f0ff,
      bottom: 0x1a3472,
      rim: 0xffffff,
      accent: 0x291354,
      sparkle: 0xfff3a1,
      glow: 0x6be8ff,
      emissive: 0x4adeff,
    },
    material: {
      metallic: 0.6,
      roughness: 0.2,
      emissive: 0.8,
      transparency: 0.3,
      refraction: 0.1,
    },
    pattern: "energy",
    noiseAlpha: 0.14,
    animationType: "energy",
    glowIntensity: 0.8,
    particleEffect: true,
  },
  conveyorRight: {
    palette: {
      top: 0xfff2c1,
      mid: 0xffc472,
      bottom: 0x4a1f0d,
      rim: 0xffffff,
      accent: 0x260e04,
      glow: 0xffd089,
      emissive: 0xffa844,
    },
    material: {
      metallic: 0.7,
      roughness: 0.5,
      emissive: 0.3,
      transparency: 0.0,
      refraction: 0.0,
    },
    pattern: "tech",
    noiseAlpha: 0.08,
    animationType: "wave",
    glowIntensity: 0.4,
    particleEffect: true,
  },
  crumble: {
    palette: {
      top: 0xd3bbff,
      mid: 0x9f7bff,
      bottom: 0x3d1e5e,
      rim: 0xf0d5ff,
      accent: 0x210c34,
      glow: 0xb896ff,
      emissive: 0x8c6bff,
    },
    material: {
      metallic: 0.1,
      roughness: 0.8,
      emissive: 0.2,
      transparency: 0.2,
      refraction: 0.05,
    },
    pattern: "crumble",
    noiseAlpha: 0.2,
    animationType: "static",
    glowIntensity: 0.2,
    particleEffect: false,
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
    
    // Debug: Überprüfe ob style existiert
    if (!style) {
      console.error(`PlatformTextureFactory: No style found for platform type "${type}"`);
      // Fallback zu normal style
      const fallbackStyle = PLATFORM_STYLES.normal;
      if (!fallbackStyle) {
        console.error("PlatformTextureFactory: No fallback style available");
        return;
      }
      console.warn(`PlatformTextureFactory: Using fallback style for "${type}"`);
    }
    
    const gfx = this.scene.make.graphics({ add: false });
    const drawWidth = width * RETINA_SCALE;
    const drawHeight = height * RETINA_SCALE;
    const radius = Math.min(drawHeight * 0.55, 32);

    gfx.clear();
    
    // Enhanced gradient with material properties
    this.drawMaterialGradient(gfx, style, drawWidth, drawHeight, radius);
    
    // Multi-layer rim lighting with glow effects
    this.drawEnhancedRim(gfx, style, drawWidth, drawHeight, radius);
    
    // Depth accent with material shading
    this.drawMaterialAccent(gfx, style, drawWidth, drawHeight, radius);

    // Add enhanced patterns based on type
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
      case "neon":
        this.drawNeonPattern(gfx, drawWidth, drawHeight, style);
        break;
      case "holographic":
        this.drawHolographicPattern(gfx, drawWidth, drawHeight, style);
        break;
      case "crystal":
        this.drawCrystalPattern(gfx, drawWidth, drawHeight, style);
        break;
      case "energy":
        this.drawEnergyPattern(gfx, drawWidth, drawHeight, style);
        break;
      default:
        this.drawStandardStripes(gfx, drawWidth, drawHeight, style.palette.rim);
        break;
    }

    // Enhanced noise and material effects
    if (style.noiseAlpha) {
      this.addMaterialNoise(gfx, drawWidth, drawHeight, style);
    }

    // Add glow layer for emissive materials
    if (style.material.emissive > 0.3) {
      this.addEmissiveGlow(gfx, style, drawWidth, drawHeight, radius);
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

  // Enhanced Material Methods
  private drawMaterialGradient(
    gfx: Phaser.GameObjects.Graphics,
    style: PlatformStyle,
    width: number,
    height: number,
    radius: number
  ): void {
    const { palette, material } = style || PLATFORM_STYLES.normal;
    
    // Base gradient with material influence
    const topColor = this.adjustColorForMaterial(palette.top, material);
    const midColor = this.adjustColorForMaterial(palette.mid, material);
    const bottomColor = this.adjustColorForMaterial(palette.bottom, material);
    
    gfx.fillGradientStyle(topColor, topColor, midColor, bottomColor, 1);
    gfx.fillRoundedRect(0, 0, width, height, radius);
    
    // Add metallic sheen for metallic materials
    if (material.metallic > 0.5) {
      gfx.fillGradientStyle(
        0xffffff,
        0xffffff,
        palette.mid,
        palette.bottom,
        material.metallic * 0.3
      );
      gfx.fillRoundedRect(width * 0.2, 0, width * 0.6, height * 0.7, radius * 0.8);
    }
  }

  private drawEnhancedRim(
    gfx: Phaser.GameObjects.Graphics,
    style: PlatformStyle,
    width: number,
    height: number,
    radius: number
  ): void {
    const { palette, material, glowIntensity = 0.3 } = style || PLATFORM_STYLES.normal;
    
    // Outer glow for emissive materials
    if (material.emissive > 0.2) {
      gfx.lineStyle(6, palette.glow || palette.rim, glowIntensity * material.emissive);
      gfx.strokeRoundedRect(0, 0, width, height, radius);
    }
    
    // Main rim light
    gfx.lineStyle(4, palette.rim, 0.6 + material.metallic * 0.2);
    gfx.strokeRoundedRect(2, 2, width - 4, height - 4, radius - 3);
    
    // Inner highlight for transparent materials
    if (material.transparency > 0.3) {
      gfx.lineStyle(2, palette.rim, 0.3);
      gfx.strokeRoundedRect(4, 4, width - 8, height - 8, radius - 5);
    }
  }

  private drawMaterialAccent(
    gfx: Phaser.GameObjects.Graphics,
    style: PlatformStyle,
    width: number,
    height: number,
    radius: number
  ): void {
    const { palette, material } = style || PLATFORM_STYLES.normal;
    
    // Enhanced depth accent
    gfx.fillStyle(palette.accent, 0.9 - material.transparency * 0.3);
    gfx.fillRoundedRect(0, height - 12, width, 12, { tl: 0, tr: 0, bl: radius, br: radius });
    
    // Add refraction effect for transparent materials
    if (material.refraction > 0.5) {
      gfx.fillStyle(0xffffff, material.refraction * 0.1);
      gfx.fillRoundedRect(width * 0.3, height * 0.2, width * 0.4, height * 0.3, radius * 0.5);
    }
  }

  private adjustColorForMaterial(color: number, material: MaterialProperties): number {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    
    // Adjust brightness based on material properties
    const brightness = 1 + material.metallic * 0.2 - material.roughness * 0.1;
    const newR = Math.min(255, Math.floor(r * brightness));
    const newG = Math.min(255, Math.floor(g * brightness));
    const newB = Math.min(255, Math.floor(b * brightness));
    
    return (newR << 16) | (newG << 8) | newB;
  }

  private addMaterialNoise(
    gfx: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    style: PlatformStyle
  ): void {
    const { material, noiseAlpha } = style;
    
    for (let i = 0; i < 260; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      
      // Vary noise color based on material
      let noiseColor = 0xffffff;
      if (material.metallic > 0.5) {
        noiseColor = 0xe0f7ff; // Blueish for metallic
      } else if (material.transparency > 0.5) {
        noiseColor = 0xfffff0; // Warm for transparent
      }
      
      gfx.fillStyle(noiseColor, Phaser.Math.FloatBetween(noiseAlpha * 0.3, noiseAlpha));
      gfx.fillCircle(x, y, size);
    }
  }

  private addEmissiveGlow(
    gfx: Phaser.GameObjects.Graphics,
    style: PlatformStyle,
    width: number,
    height: number,
    radius: number
  ): void {
    const { palette, material } = style;
    const glowColor = palette.glow || palette.emissive || palette.rim;
    
    // Multi-layer glow effect
    for (let i = 3; i > 0; i--) {
      const alpha = (material.emissive * 0.15) / i;
      const offset = i * 2;
      gfx.lineStyle(offset, glowColor, alpha);
      gfx.strokeRoundedRect(offset, offset, width - offset * 2, height - offset * 2, radius - offset);
    }
  }

  // Enhanced Pattern Methods
  private drawNeonPattern(
    gfx: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    style: PlatformStyle
  ): void {
    const { palette, glowIntensity = 0.3 } = style;
    
    // Neon light strips
    gfx.lineStyle(2, palette.glow || palette.rim, glowIntensity);
    for (let x = 8; x < width; x += 16) {
      gfx.beginPath();
      gfx.moveTo(x, height * 0.2);
      gfx.lineTo(x, height * 0.8);
      gfx.strokePath();
    }
    
    // Neon glow dots
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(10, width - 10);
      const y = Phaser.Math.Between(height * 0.3, height * 0.7);
      gfx.fillStyle(palette.glow || palette.rim, glowIntensity * 0.5);
      gfx.fillCircle(x, y, 2);
    }
  }

  private drawHolographicPattern(
    gfx: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    style: PlatformStyle
  ): void {
    const { palette } = style;
    
    // Holographic grid
    gfx.lineStyle(1, palette.glow || palette.rim, 0.3);
    for (let x = 0; x < width; x += 12) {
      gfx.beginPath();
      gfx.moveTo(x, 0);
      gfx.lineTo(x, height);
      gfx.strokePath();
    }
    for (let y = 0; y < height; y += 12) {
      gfx.beginPath();
      gfx.moveTo(0, y);
      gfx.lineTo(width, y);
      gfx.strokePath();
    }
    
    // Holographic shimmer
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(8, 16);
      gfx.fillStyle(palette.glow || palette.rim, 0.2);
      gfx.fillTriangle(x, y - size, x - size/2, y + size/2, x + size/2, y + size/2);
    }
  }

  private drawCrystalPattern(
    gfx: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    style: PlatformStyle
  ): void {
    const { palette, sparkle } = style;
    
    // Crystal facets
    gfx.lineStyle(1, palette.rim, 0.4);
    for (let i = 0; i < 6; i++) {
      const centerX = Phaser.Math.Between(width * 0.2, width * 0.8);
      const centerY = Phaser.Math.Between(height * 0.2, height * 0.8);
      const size = Phaser.Math.Between(8, 16);
      
      gfx.beginPath();
      gfx.moveTo(centerX, centerY - size);
      gfx.lineTo(centerX - size * 0.866, centerY + size * 0.5);
      gfx.lineTo(centerX + size * 0.866, centerY + size * 0.5);
      gfx.closePath();
      gfx.strokePath();
    }
    
    // Crystal sparkles
    if (sparkle) {
      for (let i = 0; i < 12; i++) {
        const x = Phaser.Math.Between(0, width);
        const y = Phaser.Math.Between(0, height);
        gfx.fillStyle(sparkle, 0.6);
        gfx.fillCircle(x, y, 1);
      }
    }
  }

  private drawEnergyPattern(
    gfx: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    style: PlatformStyle
  ): void {
    const { palette, glowIntensity = 0.3 } = style;
    
    // Energy waves
    for (let i = 0; i < 3; i++) {
      const waveY = height * (0.3 + i * 0.2);
      const amplitude = 4 + i * 2;
      
      gfx.lineStyle(2 - i * 0.5, palette.glow || palette.rim, glowIntensity * (1 - i * 0.2));
      gfx.beginPath();
      
      for (let x = 0; x <= width; x += 4) {
        const y = waveY + Math.sin((x / width) * Math.PI * 2 + i) * amplitude;
        if (x === 0) {
          gfx.moveTo(x, y);
        } else {
          gfx.lineTo(x, y);
        }
      }
      gfx.strokePath();
    }
    
    // Energy particles
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = 1 + Math.random() * 2;
      gfx.fillStyle(palette.sparkle || palette.glow || palette.rim, glowIntensity);
      gfx.fillCircle(x, y, size);
    }
  }
}
