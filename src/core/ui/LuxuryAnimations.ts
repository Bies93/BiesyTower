import Phaser from "phaser";

export interface LuxuryAnimationConfig {
  duration?: number;
  ease?: string;
  delay?: number;
  yoyo?: boolean;
  repeat?: number;
  hold?: number;
  alpha?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  x?: number;
  y?: number;
}

export interface LuxuryParticleConfig {
  count?: number;
  colors?: number[];
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
  minLifespan?: number;
  maxLifespan?: number;
  blendMode?: Phaser.BlendModes;
}

/**
 * LuxuryAnimations - Hochwertige Animationen für luxuriöse Benutzeroberflächen
 * Bietet subtile, elegante Animationen und Übergänge
 */
export class LuxuryAnimations {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Erstellt eine subtile Puls-Animation
   */
  public createPulseAnimation(
    target: Phaser.GameObjects.GameObject,
    config: LuxuryAnimationConfig = {}
  ): Phaser.Tweens.Tween {
    const {
      duration = 3000,
      ease = "Sine.easeInOut",
      delay = 0,
      yoyo = true,
      repeat = -1,
      scaleX = 1.05,
      scaleY = 1.05
    } = config;

    return this.scene.tweens.add({
      targets: target,
      scaleX,
      scaleY,
      duration,
      ease,
      delay,
      yoyo,
      repeat
    });
  }

  /**
   * Erstellt eine elegante Fade-Animation
   */
  public createFadeAnimation(
    target: Phaser.GameObjects.GameObject,
    fromAlpha: number,
    toAlpha: number,
    config: LuxuryAnimationConfig = {}
  ): Phaser.Tweens.Tween {
    const {
      duration = 1000,
      ease = "Power2.easeInOut",
      delay = 0,
      hold = 0,
      onComplete
    } = config;

    return this.scene.tweens.add({
      targets: target,
      alpha: { from: fromAlpha, to: toAlpha },
      duration,
      ease,
      delay,
      hold,
      onComplete
    });
  }

  /**
   * Erstellt eine luxuriöse Gleit-Animation
   */
  public createSlideAnimation(
    target: Phaser.GameObjects.GameObject,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    config: LuxuryAnimationConfig = {}
  ): Phaser.Tweens.Tween {
    const {
      duration = 800,
      ease = "Back.easeOut",
      delay = 0
    } = config;

    target.setPosition(fromX, fromY);

    return this.scene.tweens.add({
      targets: target,
      x: toX,
      y: toY,
      duration,
      ease,
      delay
    });
  }

  /**
   * Erstellt eine Rotation-Animation mit Luxus-Charakter
   */
  public createRotationAnimation(
    target: Phaser.GameObjects.GameObject,
    config: LuxuryAnimationConfig = {}
  ): Phaser.Tweens.Tween {
    const {
      duration = 4000,
      ease = "Sine.easeInOut",
      delay = 0,
      yoyo = true,
      repeat = -1,
      rotation = 0.05
    } = config;

    return this.scene.tweens.add({
      targets: target,
      rotation,
      duration,
      ease,
      delay,
      yoyo,
      repeat
    });
  }

  /**
   * Erstellt luxuriöse Partikel-Explosion
   */
  public createLuxuryParticleExplosion(
    x: number,
    y: number,
    config: LuxuryParticleConfig = {}
  ): Phaser.GameObjects.Particles.ParticleEmitter {
    const {
      count = 20,
      colors = [0xE8E8E8, 0xB8B8B8, 0x3B82C4, 0xF8F6F0],
      minSize = 1,
      maxSize = 4,
      minSpeed = 50,
      maxSpeed = 200,
      minLifespan = 1000,
      maxLifespan = 2500,
      blendMode = Phaser.BlendModes.ADD
    } = config;

    return this.scene.add.particles(x, y, 'particle', {
      quantity: count,
      speed: { min: minSpeed, max: maxSpeed },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: { min: minLifespan, max: maxLifespan },
      tint: colors,
      blendMode
    });
  }

  /**
   * Erstellt luxuriöse schwebende Partikel
   */
  public createLuxuryFloatingParticles(
    x: number,
    y: number,
    config: LuxuryParticleConfig = {}
  ): Phaser.GameObjects.Container {
    const {
      count = 15,
      colors = [0xE8E8E8, 0xB8B8B8, 0x3B82C4, 0xF8F6F0],
      minSize = 0.5,
      maxSize = 2,
      minSpeed = 20,
      maxSpeed = 60,
      minLifespan = 4000,
      maxLifespan = 8000,
      blendMode = Phaser.BlendModes.ADD
    } = config;

    const container = this.scene.add.container(x, y);

    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.arc(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        Math.random() * (maxSize - minSize) + minSize,
        0,
        360,
        false,
        Phaser.Utils.Array.GetRandom(colors),
        Math.random() * 0.3 + 0.1
      );
      
      particle.setBlendMode(blendMode);
      container.add(particle);

      // Sanfte, organische Bewegung
      this.scene.tweens.add({
        targets: particle,
        y: particle.y + (Math.random() - 0.5) * 50,
        x: particle.x + (Math.random() - 0.5) * 30,
        alpha: { from: particle.alpha, to: 0 },
        duration: Math.random() * (maxLifespan - minLifespan) + minLifespan,
        ease: "Sine.easeInOut",
        repeat: -1,
        delay: Math.random() * 2000
      });
    }

    return container;
  }

  /**
   * Erstellt einen luxuriösen Kamera-Übergang
   */
  public createLuxuryCameraTransition(
    camera: Phaser.Cameras.Scene2D.Camera,
    duration: number = 1000,
    color: { r: number; g: number; b: number } = { r: 15, g: 32, b: 47 }
  ): Promise<void> {
    return new Promise((resolve) => {
      camera.fadeOut(duration, color.r, color.g, color.b);
      camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        resolve();
      });
    });
  }

  /**
   * Erstellt eine luxuriöse Text-Animation
   */
  public createLuxuryTextAnimation(
    text: Phaser.GameObjects.Text,
    config: LuxuryAnimationConfig = {}
  ): Phaser.Tweens.Tween[] {
    const tweens: Phaser.Tweens.Tween[] = [];
    
    // Subtile Skalierungs-Animation
    tweens.push(this.createPulseAnimation(text, {
      duration: 4000,
      scaleX: 1.02,
      scaleY: 1.02,
      ...config
    }));

    // Leichte Alpha-Animation
    tweens.push(this.createFadeAnimation(text, 1, 0.95, {
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ...config
    }));

    return tweens;
  }

  /**
   * Erstellt einen luxuriösen Hover-Effekt
   */
  public createLuxuryHoverEffect(
    target: Phaser.GameObjects.Container,
    config: { glowColor?: number; glowSize?: number } = {}
  ): void {
    const { glowColor = 0xE8E8E8, glowSize = 30 } = config;

    // Glüheffekt erstellen
    const glow = this.scene.add.graphics();
    glow.fillStyle(glowColor, 0.1);
    glow.fillCircle(0, 0, glowSize);
    glow.setBlendMode(Phaser.BlendModes.ADD);
    target.add(glow);

    // Subtile Animation
    this.scene.tweens.add({
      targets: glow,
      alpha: 0.2,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  /**
   * Entfernt den luxuriösen Hover-Effekt
   */
  public removeLuxuryHoverEffect(target: Phaser.GameObjects.Container): void {
    const children = target.list;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (child instanceof Phaser.GameObjects.Graphics && child.alpha <= 0.2) {
        this.scene.tweens.killTweensOf(child);
        child.destroy();
        break;
      }
    }
  }

  /**
   * Erstellt eine luxuriöse Button-Press-Animation
   */
  public createLuxuryButtonPressAnimation(
    button: Phaser.GameObjects.Container,
    config: { pressDepth?: number; duration?: number } = {}
  ): void {
    const { pressDepth = 3, duration = 150 } = config;

    // Drück-Animation
    this.scene.tweens.add({
      targets: button,
      y: button.y + pressDepth,
      duration,
      ease: "Power2"
    });

    // Loslass-Animation
    this.scene.tweens.add({
      targets: button,
      y: button.y - pressDepth,
      duration: duration * 1.5,
      ease: "Back.easeOut",
      delay: duration
    });
  }

  /**
   * Erstellt eine luxuriöse Sequenz-Animation
   */
  public createLuxurySequenceAnimation(
    targets: Phaser.GameObjects.GameObject[],
    config: LuxuryAnimationConfig = {}
  ): void {
    const {
      duration = 500,
      ease = "Power2.easeInOut",
      delay = 100
    } = config;

    targets.forEach((target, index) => {
      this.scene.tweens.add({
        targets: target,
        alpha: { from: 0, to: 1 },
        y: target.y - 10,
        duration,
        ease,
        delay: index * delay
      });
    });
  }

  /**
   * Erstellt luxuriöse atmosphärische Animationen
   */
  public createLuxuryAtmosphericAnimations(): void {
    const { width, height } = this.scene.scale;

    // Atmosphärischer Lichtstrahl
    const lightBeam = this.scene.add.graphics();
    const gradient = lightBeam.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#FFFFFF02');
    gradient.addColorStop(0.5, '#3B82C403');
    gradient.addColorStop(1, '#00000000');
    
    lightBeam.fillStyle(gradient);
    lightBeam.fillRect(width * 0.3, 0, width * 0.4, height);
    lightBeam.setBlendMode(Phaser.BlendModes.ADD);
    lightBeam.setDepth(-2);

    // Langsame Bewegung
    this.scene.tweens.add({
      targets: lightBeam,
      alpha: 0.08,
      x: width * 0.1,
      duration: 20000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }
}