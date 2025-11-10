import Phaser from "phaser";
import { PlatformManager } from "./PlatformManager";

export interface DebugMetrics {
  totalPlatforms: number;
  activePlatforms: number;
  generationTime: number;
  memoryUsage: number;
  fps: number;
  lastGeneratedY: number;
  cameraY: number;
  gaps: number;
}

export class PlatformDebugSystem {
  private debugText: Phaser.GameObjects.Text | null = null;
  private metrics: DebugMetrics = {
    totalPlatforms: 0,
    activePlatforms: 0,
    generationTime: 0,
    memoryUsage: 0,
    fps: 60,
    lastGeneratedY: 0,
    cameraY: 0,
    gaps: 0
  };
  private lastUpdateTime: number = 0;
  private enabled: boolean = false;

  constructor(private scene: Phaser.Scene, private platformManager: PlatformManager) {
    // Toggle debug with F1 key
    this.scene.input.keyboard?.on('keydown-F1', () => {
      this.enabled = !this.enabled;
      if (this.enabled) {
        this.createDebugOverlay();
      } else if (this.debugText) {
        this.debugText.destroy();
        this.debugText = null;
      }
    });
  }

  private createDebugOverlay(): void {
    if (this.debugText) {
      this.debugText.destroy();
    }

    this.debugText = this.scene.add.text(10, 10, '', {
      fontSize: '12px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 },
      fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(1000);
  }

  public update(time: number, delta: number): void {
    if (!this.enabled || !this.debugText) return;

    // Update metrics every 100ms
    if (time - this.lastUpdateTime < 100) return;
    this.lastUpdateTime = time;

    this.collectMetrics();
    this.updateDebugDisplay();
  }

  private collectMetrics(): void {
    const platforms = this.platformManager.getCurrentPlatforms();
    const camera = this.scene.cameras.main;

    this.metrics.totalPlatforms = platforms.length;
    this.metrics.activePlatforms = platforms.filter(p => 
      Math.abs(p.y - camera.scrollY) < 1000
    ).length;
    this.metrics.lastGeneratedY = this.platformManager.getLastGeneratedY();
    this.metrics.cameraY = camera.scrollY;
    this.metrics.fps = this.scene.game.loop.actualFps;
    
    // Check for gaps
    this.metrics.gaps = this.detectPlatformGaps(platforms);
    
    // Estimate memory usage (simplified)
    this.metrics.memoryUsage = platforms.length * 1024; // Rough estimate
  }

  private detectPlatformGaps(platforms: any[]): number {
    if (platforms.length < 2) return 0;
    
    let gaps = 0;
    const sortedPlatforms = [...platforms].sort((a, b) => b.y - a.y);
    
    for (let i = 1; i < sortedPlatforms.length; i++) {
      const gap = sortedPlatforms[i-1].y - sortedPlatforms[i].y;
      if (gap > 300) { // Consider gaps larger than 300px
        gaps++;
      }
    }
    
    return gaps;
  }

  private updateDebugDisplay(): void {
    if (!this.debugText) return;

    const debugInfo = [
      `=== PLATFORM DEBUG ===`,
      `Total Platforms: ${this.metrics.totalPlatforms}`,
      `Active Platforms: ${this.metrics.activePlatforms}`,
      `Last Generated Y: ${this.metrics.lastGeneratedY.toFixed(0)}`,
      `Camera Y: ${this.metrics.cameraY.toFixed(0)}`,
      `Platform Gaps: ${this.metrics.gaps}`,
      `FPS: ${this.metrics.fps.toFixed(1)}`,
      `Memory Est: ${(this.metrics.memoryUsage / 1024).toFixed(1)}KB`,
      ``,
      `=== WARNINGS ===`,
      this.getWarnings()
    ].join('\n');

    this.debugText.setText(debugInfo);
  }

  private getWarnings(): string {
    const warnings: string[] = [];
    
    if (this.metrics.gaps > 0) {
      warnings.push(`⚠️ ${this.metrics.gaps} platform gaps detected`);
    }
    
    if (this.metrics.activePlatforms < 5) {
      warnings.push(`⚠️ Low active platform count`);
    }
    
    if (this.metrics.fps < 30) {
      warnings.push(`⚠️ Low FPS: ${this.metrics.fps.toFixed(1)}`);
    }
    
    if (this.metrics.memoryUsage > 10240) { // > 10MB
      warnings.push(`⚠️ High memory usage`);
    }
    
    return warnings.length > 0 ? warnings.join('\n') : '✓ No issues detected';
  }

  public logPlatformGeneration(type: string, x: number, y: number): void {
    if (!this.enabled) return;
    
    console.log(`[PlatformGen] ${type} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
  }

  public logEmergency(reason: string, data?: any): void {
    if (!this.enabled) return;
    
    console.warn(`[PlatformEmergency] ${reason}`, data);
  }

  public destroy(): void {
    if (this.debugText) {
      this.debugText.destroy();
      this.debugText = null;
    }
  }
}