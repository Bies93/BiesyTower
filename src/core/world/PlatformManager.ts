import Phaser from "phaser";
import { baseGameConfig } from "../../config/gameConfig";

export interface Platform {
  sprite: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  y: number;
  width: number;
  type: 'normal' | 'wide' | 'narrow';
}

/**
 * PlatformManager - Infinite Platform Generation for Icy Tower
 * 
 * Responsibilities:
 * - Generate infinite platforms as player moves up
 * - Scale difficulty based on height
 * - Manage platform types and spacing
 * - Recycle old platforms for performance
 */
export class PlatformManager extends Phaser.Events.EventEmitter {
  private scene: Phaser.Scene;
 private platforms: Phaser.Physics.Arcade.StaticGroup;
  private platformList: Platform[] = [];
  private lastGeneratedY: number = 0;
  private startY: number = 0;
  private generationOffset: number = 100; // How far above camera to pre-generate

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
    this.platforms = this.scene.physics.add.staticGroup();
  }

  /**
   * Initialize platform manager with starting position
   */
  public initialize(startY: number): void {
    this.startY = startY;
    this.lastGeneratedY = startY;
    
    // Create initial platforms
    this.createBasePlatform(this.scene.scale.width / 2, startY, this.scene.scale.width * 0.8);
    this.generatePlatformsUpTo(startY - 2000);
 }

  /**
   * Generate platforms up to a target Y coordinate
   */
  private generatePlatformsUpTo(targetY: number): void {
    let currentY = this.lastGeneratedY;
    const camera = this.scene.cameras.main;
    
    while (currentY > targetY) {
      const height = this.getStartY() - currentY;
      const platformData = this.getPlatformDataForHeight(height);
      
      const platform = this.createPlatform(
        platformData.x,
        currentY,
        platformData.width,
        platformData.type
      );
      
      this.platformList.push(platform);
      
      // Next platform position
      currentY -= platformData.spacing;
    }
    
    this.lastGeneratedY = currentY;
  }

  /**
   * Get platform data based on current height (difficulty scaling)
   */
  private getPlatformDataForHeight(height: number): { x: number; width: number; spacing: number; type: 'normal' | 'wide' | 'narrow' } {
    const progress = Math.min(height / 10000, 1); // 0 to 1 over first 10,000 units
    
    // Base spacing increases with height
    const baseSpacing = 100;
    const maxSpacing = 180;
    const spacing = Phaser.Math.Linear(baseSpacing, maxSpacing, progress * 0.7);
    
    // Platform width decreases with height
    const baseWidth = this.scene.scale.width * 0.8;
    const minWidth = 60;
    const width = Phaser.Math.Linear(baseWidth, minWidth, progress);
    
    // Platform type based on height
    let type: 'normal' | 'wide' | 'narrow' = 'normal';
    const random = Math.random();
    
    if (progress > 0.3) {
      type = random < 0.1 ? 'wide' : random < 0.3 ? 'narrow' : 'normal';
    }
    
    // Platform X position (keep within screen bounds)
    const padding = 40;
    const minX = padding + width / 2;
    const maxX = this.scene.scale.width - padding - width / 2;
    
    // Try to place platforms reasonably (not too close to previous)
    let x = Phaser.Math.Between(minX, maxX);
    
    if (this.platformList.length > 0) {
      const lastPlatform = this.platformList[this.platformList.length - 1];
      const minDistance = 100;
      
      if (Math.abs(x - lastPlatform.sprite.x) < minDistance) {
        x = x < this.scene.scale.width / 2 
          ? Math.max(minX, x - minDistance) 
          : Math.min(maxX, x + minDistance);
      }
    }
    
    return { x, width, spacing, type };
  }

  /**
   * Create a platform at specified position
   */
  private createPlatform(
    x: number, 
    y: number, 
    width: number, 
    type: 'normal' | 'wide' | 'narrow'
  ): Platform {
    // Adjust width based on type
    const typeMultiplier = type === 'wide' ? 1.3 : type === 'narrow' ? 0.7 : 1;
    const actualWidth = width * typeMultiplier;
    
    // Platform color based on type
    const color = type === 'wide' ? 0x4ac6ff : type === 'narrow' ? 0x2a9eff : 0x3ab4ff;
    
    const platform = this.scene.add.rectangle(
      x,
      y,
      actualWidth,
      16,
      color
    );
    
    const body = this.scene.physics.add.existing(platform, true) as Phaser.Physics.Arcade.StaticBody;
    if (body) {
      body.checkCollision.down = false;
      body.checkCollision.left = true;
      body.checkCollision.right = true;
    }

    this.platforms.add(platform);
    
    return {
      sprite: platform as unknown as Phaser.Types.Physics.Arcade.ImageWithStaticBody,
      y,
      width: actualWidth,
      type
    };
  }

  /**
   * Create a base platform (for ground/start)
   */
  public createBasePlatform(
    x: number,
    y: number,
    width: number = this.scene.scale.width * 0.8
  ): Phaser.Types.Physics.Arcade.ImageWithStaticBody {
    const platform = this.scene.add.rectangle(
      x,
      y,
      width,
      16,
      Phaser.Display.Color.HexStringToColor(baseGameConfig.colors.platform).color
    );
    
    const body = this.scene.physics.add.existing(platform, true) as Phaser.Physics.Arcade.StaticBody;
    if (body) {
      body.checkCollision.down = false;
      body.checkCollision.left = true;
      body.checkCollision.right = true;
    }

    this.platforms.add(platform);
    return platform as unknown as Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  }

  /**
   * Update platform generation based on camera position
   */
  public update(camera: Phaser.Cameras.Scene2D.Camera): void {
    const cameraBottom = camera.scrollY + this.scene.scale.height;
    
    // Generate platforms above camera if needed
    const targetGenerationY = cameraBottom - this.generationOffset;
    if (this.lastGeneratedY > targetGenerationY) {
      this.generatePlatformsUpTo(targetGenerationY);
    }
    
    // Remove platforms that are far below the camera
    this.cleanupOldPlatforms(cameraBottom + 500);
  }

  /**
   * Remove platforms that are no longer needed
   */
  private cleanupOldPlatforms(maxY: number): void {
    const keepPlatforms: Platform[] = [];
    
    for (const platform of this.platformList) {
      if (platform.y > maxY) {
        // Keep platforms that are still visible or above
        keepPlatforms.push(platform);
      } else {
        // Remove old platforms
        this.platforms.remove(platform.sprite, true, true);
      }
    }
    
    this.platformList = keepPlatforms;
  }

  /**
   * Get the highest generated platform Y coordinate
   */
  public getLastGeneratedY(): number {
    return this.lastGeneratedY;
  }

 /**
   * Get current starting Y (ground level)
   */
  public getStartY(): number {
    return this.startY;
  }

  public getGroup(): Phaser.Physics.Arcade.StaticGroup {
    return this.platforms;
  }

  public getAllPlatforms(): Platform[] {
    return this.platformList;
  }
}

/**
 * Helper function for creating PlatformManager instance
 */
export function createPlatformManagerStub(scene: Phaser.Scene): PlatformManager {
  const manager = new PlatformManager(scene);
  return manager;
}