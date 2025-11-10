import Phaser from "phaser";

export interface LuxuryEffectConfig {
  intensity?: number;
  color?: number;
  size?: number;
  duration?: number;
  blendMode?: Phaser.BlendModes;
}

export interface LuxuryReflectionConfig {
  width: number;
  height: number;
  intensity: number;
  angle: number;
  color?: number;
}

export interface LuxuryGlowConfig {
  radius: number;
  color: number;
  intensity: number;
  pulseSpeed?: number;
  pulseAmount?: number;
}

/**
 * LuxuryVisualEffects - Hochwertige visuelle Effekte für luxuriöse Benutzeroberflächen
 * Bietet metallische Reflexionen, subtile Glüheffekte und elegante Details
 */
export class LuxuryVisualEffects {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Erstellt eine luxuriöse metallische Reflexion
   */
  public createMetallicReflection(
    x: number,
    y: number,
    width: number,
    height: number,
    config: LuxuryReflectionConfig
  ): Phaser.GameObjects.Graphics {
    const { intensity = 0.6, angle = 45, color = 0xE8E8E8 } = config;

    const reflection = this.scene.add.graphics();
    
    // Gradient für realistische Reflexion
    const gradient = reflection.createLinearGradient(
      x - width/2, y - height/2,
      x + width/2, y + height/2
    );
    
    // Mehrere Farbstufen für realistischen Metall-Effekt
    gradient.addColorStop(0, `${color.toString(16).padStart(6, '0')}00`);
    gradient.addColorStop(0.3, `${color.toString(16).padStart(6, '0')}40`);
    gradient.addColorStop(0.6, `${color.toString(16).padStart(6, '0')}20`);
    gradient.addColorStop(1, `${color.toString(16).padStart(6, '0')}00`);
    
    reflection.fillStyle(gradient);
    
    // Schräge Reflexion basierend auf dem Winkel
    reflection.save();
    reflection.translate(x, y);
    reflection.rotate(angle * Math.PI / 180);
    reflection.fillRect(0, 0, width * 1.5, height * 0.3);
    reflection.restore();
    
    reflection.setAlpha(intensity);
    reflection.setBlendMode(Phaser.BlendModes.ADD);
    
    return reflection;
  }

  /**
   * Erstellt einen luxuriösen Glüheffekt mit Puls-Animation
   */
  public createLuxuryGlow(
    x: number,
    y: number,
    config: LuxuryGlowConfig
  ): Phaser.GameObjects.Container {
    const { 
      radius = 50, 
      color = 0xE8E8E8, 
      intensity = 0.4,
      pulseSpeed = 2000,
      pulseAmount = 0.3
    } = config;

    const container = this.scene.add.container(x, y);

    // Äußere Glöhschicht
    const outerGlow = this.scene.add.circle(0, 0, radius, color, intensity * 0.3);
    outerGlow.setBlendMode(Phaser.BlendModes.ADD);

    // Mittlere Glöhschicht
    const middleGlow = this.scene.add.circle(0, 0, radius * 0.7, color, intensity * 0.5);
    middleGlow.setBlendMode(Phaser.BlendModes.ADD);

    // Innere Glöhschicht
    const innerGlow = this.scene.add.circle(0, 0, radius * 0.4, color, intensity * 0.7);
    innerGlow.setBlendMode(Phaser.BlendModes.ADD);

    // Zentrum
    const core = this.scene.add.circle(0, 0, radius * 0.2, color, 1);
    core.setBlendMode(Phaser.BlendModes.ADD);

    container.add([outerGlow, middleGlow, innerGlow, core]);

    // Puls-Animation
    if (pulseSpeed > 0) {
      this.scene.tweens.add({
        targets: [outerGlow, middleGlow, innerGlow],
        alpha: intensity * (1 - pulseAmount),
        scaleX: 1 + pulseAmount,
        scaleY: 1 + pulseAmount,
        duration: pulseSpeed,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    return container;
  }

  /**
   * Erstellt luxuriöse Lichtstrahlen
   */
  public createLuxuryLightRays(
    x: number,
    y: number,
    count: number = 6,
    config: LuxuryEffectConfig = {}
  ): Phaser.GameObjects.Container {
    const { 
      intensity = 0.3, 
      color = 0xE8E8E8, 
      size = 200,
      duration = 8000
    } = config;

    const container = this.scene.add.container(x, y);

    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i;
      const ray = this.scene.add.graphics();
      
      // Gradient für jeden Lichtstrahl
      const gradient = ray.createLinearGradient(0, 0, 0, size);
      gradient.addColorStop(0, `${color.toString(16).padStart(6, '0')}00`);
      gradient.addColorStop(0.5, `${color.toString(16).padStart(6, '0')}40`);
      gradient.addColorStop(1, `${color.toString(16).padStart(6, '0')}00`);
      
      ray.fillStyle(gradient);
      ray.save();
      ray.rotate(angle * Math.PI / 180);
      ray.fillRect(0, -2, size, 4);
      ray.restore();
      
      ray.setAlpha(intensity);
      ray.setBlendMode(Phaser.BlendModes.ADD);
      container.add(ray);

      // Rotation-Animation
      this.scene.tweens.add({
        targets: ray,
        rotation: angle * Math.PI / 180 + Math.PI * 2,
        duration: duration + i * 1000,
        repeat: -1,
        ease: "Linear"
      });
    }

    return container;
  }

  /**
   * Erstellt luxuriöse atmosphärische Schichten
   */
  public createLuxuryAtmosphere(
    width: number,
    height: number,
    config: { layers?: number; colors?: number[] } = {}
  ): Phaser.GameObjects.Container {
    const { layers = 3, colors = [0x1E3A5F, 0x0F2027, 0x3B82C4] } = config;
    const container = this.scene.add.container(0, 0);

    for (let i = 0; i < layers; i++) {
      const layer = this.scene.add.graphics();
      const layerColor = colors[i % colors.length];
      const alpha = 0.02 + (i * 0.01);
      
      // Gradient für jede Schicht
      const gradient = layer.createRadialGradient(
        width/2, height/2, 0,
        width/2, height/2, Math.max(width, height) * 0.8
      );
      
      gradient.addColorStop(0, `${layerColor.toString(16).padStart(6, '0')}00`);
      gradient.addColorStop(0.5, `${layerColor.toString(16).padStart(6, '0')}20`);
      gradient.addColorStop(1, `${layerColor.toString(16).padStart(6, '0')}00`);
      
      layer.fillStyle(gradient);
      layer.fillRect(0, 0, width, height);
      layer.setAlpha(alpha);
      layer.setBlendMode(Phaser.BlendModes.MULTIPLY);
      
      container.add(layer);

      // Subtile Bewegung für jede Schicht
      this.scene.tweens.add({
        targets: layer,
        alpha: alpha * 1.5,
        duration: 15000 + i * 2000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    return container;
  }

  /**
   * Erstellt luxuriöse Partikel-Schleier
   */
  public createLuxuryParticleVeil(
    x: number,
    y: number,
    config: LuxuryEffectConfig = {}
  ): Phaser.GameObjects.Graphics {
    const { 
      intensity = 0.1, 
      color = 0xE8E8E8, 
      size = 100 
    } = config;

    const veil = this.scene.add.graphics();
    
    // Mehrere überlappende Kreise für Schleier-Effekt
    for (let i = 0; i < 5; i++) {
      const radius = size * (1 - i * 0.15);
      const alpha = intensity * (0.3 - i * 0.05);
      
      veil.fillStyle(color, alpha);
      veil.fillCircle(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, radius);
    }
    
    veil.setBlendMode(Phaser.BlendModes.ADD);
    
    return veil;
  }

  /**
   * Erstellt luxuriöse Kanten-Highlights
   */
  public createLuxuryEdgeHighlights(
    target: Phaser.GameObjects.Container,
    config: { color?: number; intensity?: number } = {}
  ): void {
    const { color = 0xE8E8E8, intensity = 0.4 } = config;
    const { width, height } = target;

    // Oberer Kanten-Highlight
    const topHighlight = this.scene.add.graphics();
    topHighlight.fillStyle(color, intensity);
    topHighlight.fillRect(-width/2, -height/2, width, 2);
    topHighlight.setBlendMode(Phaser.BlendModes.ADD);
    target.add(topHighlight);

    // Linker Kanten-Highlight
    const leftHighlight = this.scene.add.graphics();
    leftHighlight.fillStyle(color, intensity * 0.7);
    leftHighlight.fillRect(-width/2, -height/2, 2, height);
    leftHighlight.setBlendMode(Phaser.BlendModes.ADD);
    target.add(leftHighlight);
  }

  /**
   * Erstellt luxuriöse Text-Highlights
   */
  public createLuxuryTextHighlight(
    text: Phaser.GameObjects.Text,
    config: { color?: number; offset?: number } = {}
  ): void {
    const { color = 0xE8E8E8, offset = 2 } = config;
    
    // Subtiler Text-Glanz
    const highlight = this.scene.add.text(text.x, text.y - offset, text.text, {
      ...text.style,
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: `#${color.toString(16).padStart(6, '0')}`,
      strokeThickness: 1
    });
    
    highlight.setAlpha(0.3);
    highlight.setBlendMode(Phaser.BlendModes.ADD);
    highlight.setOrigin(text.originX, text.originY);
    
    // Puls-Animation
    this.scene.tweens.add({
      targets: highlight,
      alpha: 0.6,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  /**
   * Erstellt luxuriöse Oberflächen-Texturen
   */
  public createLuxurySurfaceTexture(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    material: 'platin' | 'silber' | 'gold' | 'tiefblau'
  ): void {
    const materialColors = {
      platin: { primary: 0xE8E8E8, secondary: 0xC0C0C0, highlight: 0xFFFFFF },
      silber: { primary: 0xB8B8B8, secondary: 0xA8A8A8, highlight: 0xE0E0E0 },
      gold: { primary: 0xD4AF37, secondary: 0xFFD700, highlight: 0xFFF8DC },
      tiefblau: { primary: 0x1E3A5F, secondary: 0x2C5282, highlight: 0x60A5FA }
    };

    const colors = materialColors[material];

    // Feine Oberflächen-Struktur
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width - width/2;
      const y = Math.random() * height - height/2;
      const size = Math.random() * 1.5 + 0.5;
      const alpha = Math.random() * 0.15 + 0.05;
      
      graphics.fillStyle(colors.highlight, alpha);
      graphics.fillCircle(x, y, size);
    }

    // Subtile Linien für Metall-Struktur
    for (let i = 0; i < width; i += 15) {
      graphics.strokeStyle = `${colors.secondary.toString(16).padStart(6, '0')}20`;
      graphics.lineWidth = 0.5;
      graphics.beginPath();
      graphics.moveTo(i - width/2, -height/2);
      graphics.lineTo(i - width/2, height/2);
      graphics.stroke();
    }
  }
}