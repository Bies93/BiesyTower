import Phaser from "phaser";
import { PlatformType } from "./platformTypes";
import { PlatformTextureFactory, PlatformStyle } from "./PlatformTextureFactory";

export interface PlatformAnimationConfig {
  type: PlatformType;
  sprite: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  style: PlatformStyle;
  width: number;
  height: number;
}

export class PlatformAnimator {
  private animatedPlatforms: Map<string, PlatformAnimationConfig> = new Map();
  private animationTime: number = 0;

  constructor(private scene: Phaser.Scene) {
    // Start animation loop
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  public addPlatform(config: PlatformAnimationConfig): void {
    const key = `${config.sprite.x}-${config.sprite.y}`;
    this.animatedPlatforms.set(key, config);
    
    // Initialize platform-specific animations
    this.initializePlatformAnimations(config);
  }

  public removePlatform(sprite: Phaser.Types.Physics.Arcade.ImageWithStaticBody): void {
    const key = `${sprite.x}-${sprite.y}`;
    const config = this.animatedPlatforms.get(key);
    if (config) {
      this.cleanupPlatformAnimations(config);
      this.animatedPlatforms.delete(key);
    }
  }

  private update(time: number, delta: number): void {
    this.animationTime += delta;
    
    this.animatedPlatforms.forEach((config) => {
      this.updatePlatformAnimation(config, this.animationTime);
    });
  }

  private initializePlatformAnimations(config: PlatformAnimationConfig): void {
    const { sprite, style, type } = config;

    // Add glow effect for emissive materials
    if (style.material.emissive > 0.3) {
      this.createGlowEffect(config);
    }

    // Add particle effects for specific types
    if (style.particleEffect) {
      this.createParticleEffect(config);
    }

    // Add floating animation for certain types
    if (style.animationType === "pulse" || style.animationType === "wave") {
      this.createFloatingAnimation(config);
    }

    // Add energy flow for energy types
    if (style.animationType === "energy") {
      this.createEnergyFlow(config);
    }
  }

  private createGlowEffect(config: PlatformAnimationConfig): void {
    const { sprite, style } = config;
    const glowColor = style.palette.glow || style.palette.rim;
    
    // Create multiple glow layers for depth
    const glowLayers: Phaser.GameObjects.Rectangle[] = [];
    
    for (let i = 3; i > 0; i--) {
      const glow = this.scene.add.rectangle(
        sprite.x,
        sprite.y,
        sprite.displayWidth + (i * 8),
        sprite.displayHeight + (i * 4),
        glowColor,
        (style.material.emissive * 0.1) / i
      );
      
      glow.setBlendMode(Phaser.BlendModes.ADD);
      glow.setDepth(sprite.depth - 1);
      glow.setScrollFactor(sprite.scrollFactor);
      
      glowLayers.push(glow);
    }

    // Store glow layers for cleanup
    sprite.setData('glowLayers', glowLayers);
  }

  private createParticleEffect(config: PlatformAnimationConfig): void {
    const { sprite, style, type } = config;
    
    // Create particle emitter based on platform type
    const emitter = this.scene.add.particles(0, 0, 'particle', {
      x: sprite.x,
      y: sprite.y - sprite.displayHeight * 0.3,
      speed: { min: 10, max: 30 },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 2000,
      frequency: type === 'boost' ? 200 : 500,
      quantity: 1,
      blendMode: Phaser.BlendModes.ADD,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(
          -sprite.displayWidth * 0.4,
          -sprite.displayHeight * 0.2,
          sprite.displayWidth * 0.8,
          sprite.displayHeight * 0.1
        )
      }
    });

    // Set particle colors based on platform type
    this.setParticleColors(emitter, style);
    
    emitter.setDepth(sprite.depth + 1);
    emitter.setScrollFactor(sprite.scrollFactor);
    
    // Store emitter for cleanup
    sprite.setData('particleEmitter', emitter);
  }

  private createFloatingAnimation(config: PlatformAnimationConfig): void {
    const { sprite, style } = config;
    
    // Create subtle floating effect
    this.scene.tweens.add({
      targets: sprite,
      y: sprite.y + 2,
      duration: 2000 + Math.random() * 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      delay: Math.random() * 1000
    });

    // Add subtle rotation for holographic materials
    if (style.pattern === "holographic") {
      this.scene.tweens.add({
        targets: sprite,
        angle: 2,
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  }

  private createEnergyFlow(config: PlatformAnimationConfig): void {
    const { sprite, style } = config;
    
    // Create energy flow particles
    const energyParticles: Phaser.GameObjects.Circle[] = [];
    
    for (let i = 0; i < 3; i++) {
      const particle = this.scene.add.circle(
        sprite.x + (Math.random() - 0.5) * sprite.displayWidth,
        sprite.y - sprite.displayHeight * 0.3,
        2,
        style.palette.glow || style.palette.rim,
        0.8
      );
      
      particle.setBlendMode(Phaser.BlendModes.ADD);
      particle.setDepth(sprite.depth + 2);
      particle.setScrollFactor(sprite.scrollFactor);
      
      // Animate particle movement
      this.animateEnergyParticle(particle, sprite, style);
      
      energyParticles.push(particle);
    }
    
    // Store particles for cleanup
    sprite.setData('energyParticles', energyParticles);
  }

  private animateEnergyParticle(
    particle: Phaser.GameObjects.Circle,
    platform: Phaser.Types.Physics.Arcade.ImageWithStaticBody,
    style: PlatformStyle
  ): void {
    const startY = particle.y;
    const endY = platform.y + platform.displayHeight * 0.3;
    
    this.scene.tweens.add({
      targets: particle,
      y: endY,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 2,
      duration: 1500 + Math.random() * 1000,
      ease: "Power2.easeOut",
      onComplete: () => {
        // Reset particle and restart animation
        particle.y = startY;
        particle.alpha = 0.8;
        particle.scaleX = 1;
        particle.scaleY = 1;
        particle.x = platform.x + (Math.random() - 0.5) * platform.displayWidth;
        
        // Restart animation with delay
        this.scene.time.delayedCall(Math.random() * 500, () => {
          this.animateEnergyParticle(particle, platform, style);
        });
      }
    });
  }

  private setParticleColors(
    emitter: Phaser.GameObjects.Particles.ParticleEmitter,
    style: PlatformStyle
  ): void {
    const colors = [
      style.palette.glow || style.palette.rim,
      style.palette.sparkle || style.palette.rim,
      style.palette.emissive || style.palette.rim
    ].filter(Boolean);
    
    emitter.setTint(colors);
  }

  private updatePlatformAnimation(config: PlatformAnimationConfig, time: number): void {
    const { sprite, style } = config;
    
    // Update glow intensity based on animation type
    if (style.animationType === "pulse") {
      this.updatePulseAnimation(config, time);
    } else if (style.animationType === "wave") {
      this.updateWaveAnimation(config, time);
    }
    
    // Update energy flow
    if (style.animationType === "energy") {
      this.updateEnergyFlow(config, time);
    }
  }

  private updatePulseAnimation(config: PlatformAnimationConfig, time: number): void {
    const { sprite, style } = config;
    const glowLayers = sprite.getData('glowLayers');
    
    if (glowLayers) {
      const pulseIntensity = (Math.sin(time * 0.002) + 1) * 0.5;
      glowLayers.forEach((glow: Phaser.GameObjects.Rectangle, index: number) => {
        const baseAlpha = (style.material.emissive * 0.1) / (index + 1);
        glow.setAlpha(baseAlpha * (0.5 + pulseIntensity * 0.5));
      });
    }
  }

  private updateWaveAnimation(config: PlatformAnimationConfig, time: number): void {
    const { sprite, style } = config;
    const glowLayers = sprite.getData('glowLayers');
    
    if (glowLayers) {
      const waveIntensity = (Math.sin(time * 0.001 + sprite.x * 0.01) + 1) * 0.5;
      glowLayers.forEach((glow: Phaser.GameObjects.Rectangle, index: number) => {
        const baseAlpha = (style.material.emissive * 0.1) / (index + 1);
        glow.setAlpha(baseAlpha * (0.3 + waveIntensity * 0.7));
      });
    }
  }

  private updateEnergyFlow(config: PlatformAnimationConfig, time: number): void {
    const { sprite, style } = config;
    const particleEmitter = sprite.getData('particleEmitter');
    
    if (particleEmitter) {
      // Vary emission rate based on time
      const emissionRate = 300 + Math.sin(time * 0.003) * 200;
      particleEmitter.setFrequency(emissionRate);
    }
  }

  private cleanupPlatformAnimations(config: PlatformAnimationConfig): void {
    const { sprite } = config;
    
    // Clean up glow layers
    const glowLayers = sprite.getData('glowLayers');
    if (glowLayers) {
      glowLayers.forEach((glow: Phaser.GameObjects.Rectangle) => glow.destroy());
    }
    
    // Clean up particle emitter
    const particleEmitter = sprite.getData('particleEmitter');
    if (particleEmitter) {
      particleEmitter.destroy();
    }
    
    // Clean up energy particles
    const energyParticles = sprite.getData('energyParticles');
    if (energyParticles) {
      energyParticles.forEach((particle: Phaser.GameObjects.Circle) => particle.destroy());
    }
    
    // Kill any active tweens
    this.scene.tweens.killTweensOf(sprite);
  }

  public destroy(): void {
    // Clean up all platform animations
    this.animatedPlatforms.forEach((config) => {
      this.cleanupPlatformAnimations(config);
    });
    this.animatedPlatforms.clear();
    
    // Remove update listener
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
  }
}