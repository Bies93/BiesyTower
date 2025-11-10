import Phaser from "phaser";
import { IMAGE_KEYS } from "../../assets/assetManifest";

/**
 * Core-Player-Modul (Stub, Phase 0)
 *
 * Ziele:
 * - Kapselt Player-Erstellung von der Scene-Implementierung
 * - Ermöglicht spätere Erweiterungen wie States & Animations
 */

export interface PlayerOptions {
  x: number;
  y: number;
}

export function createPlayerStub(
  scene: Phaser.Scene,
  x: number,
  y: number
): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
  const displaySize = { width: 48, height: 48 };
  const hitboxSize = { width: 32, height: 40 }; // klassische Arcade-Hitbox für stabile Bodenhaftung
  const player = scene.physics.add.sprite(x, y, IMAGE_KEYS.playerIdleLanding);
  player.setOrigin(0.5, 0.5);
  player.setDisplaySize(displaySize.width, displaySize.height);
  player.setCollideWorldBounds(true);
  player.setBounce(0.05);
  player.setDragX(900);
  player.setMaxVelocity(260, 900);
  const FEET_LIFT = 2;
  (player.body as Phaser.Physics.Arcade.Body).setSize(hitboxSize.width, hitboxSize.height, true);
  const offX = (player.displayWidth - hitboxSize.width) / 2;
  const offY = player.displayHeight - hitboxSize.height - FEET_LIFT;
  (player.body as Phaser.Physics.Arcade.Body).setOffset(offX, offY);
  // Unterseite bleibt kollisionsfähig, Oberseite nicht „hakt“
  (player.body as Phaser.Physics.Arcade.Body).checkCollision.up = false;

  player.setDepth(5);

  const poseTextures = {
    idle: IMAGE_KEYS.playerIdleLanding,
    left: IMAGE_KEYS.playerJumpLeft,
    right: IMAGE_KEYS.playerJumpRight,
  } as const;
  type PlayerPose = keyof typeof poseTextures;
  let activePose: PlayerPose = "idle";
  let lastAirFacing: Exclude<PlayerPose, "idle"> = "right";

  const lightTrail = scene.add
    .image(x, y + displaySize.height * 0.1, IMAGE_KEYS.propLightBeam)
    .setBlendMode(Phaser.BlendModes.ADD)
    .setAlpha(0.22)
    .setDisplaySize(displaySize.width * 0.9, displaySize.height * 2.1)
    .setDepth(1);

  const footShadow = scene.add
    .ellipse(x, y + displaySize.height * 0.5, displaySize.width * 0.7, 12, 0x000000, 0.28)
    .setDepth(0)
    .setAlpha(0.35);

  scene.tweens.add({
    targets: lightTrail,
    alpha: { from: 0.12, to: 0.3 },
    duration: 700,
    yoyo: true,
    repeat: -1,
  });

  // Enhanced Particle System for Visual Effects
  const jumpParticles: Phaser.GameObjects.Arc[] = [];
  const landingParticles: Phaser.GameObjects.Arc[] = [];
  const trailParticles: Phaser.GameObjects.Image[] = [];
  const energyParticles: Phaser.GameObjects.Arc[] = [];
  const impactRings: Phaser.GameObjects.Graphics[] = [];
  const motionBlur: Phaser.GameObjects.Image[] = [];

  let previousGroundState = false;
  let lastTrailSpawn = 0;
  const trailSpawnInterval = 80; // ms

  const createJumpParticles = (x: number, y: number) => {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.random() * Math.PI) - (Math.PI / 2);
      const speed = 50 + Math.random() * 100;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const particle = scene.add.circle(x, y, 2, 0x4adeff, 0.8);
      jumpParticles.push(particle);
      
      scene.tweens.add({
        targets: particle,
        x: particle.x + vx,
        y: particle.y + vy,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 400 + Math.random() * 200,
        ease: "Power2",
        onComplete: () => {
          const index = jumpParticles.indexOf(particle);
          if (index > -1) jumpParticles.splice(index, 1);
          particle.destroy();
        }
      });
    }
  };

  const createLandingParticles = (x: number, y: number) => {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 70;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const particle = scene.add.circle(x, y, 3, 0xff9a4a, 0.9);
      landingParticles.push(particle);
      
      scene.tweens.add({
        targets: particle,
        x: particle.x + vx,
        y: particle.y + vy,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 300 + Math.random() * 150,
        ease: "Back.easeOut",
        onComplete: () => {
          const index = landingParticles.indexOf(particle);
          if (index > -1) landingParticles.splice(index, 1);
          particle.destroy();
        }
      });
    }
  };

  const createMovementTrail = (x: number, y: number) => {
    const trail = scene.add.image(x, y, IMAGE_KEYS.propLightBeam)
      .setAlpha(0.15)
      .setDisplaySize(displaySize.width * 0.7, displaySize.height * 0.7)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(0);
    
    trailParticles.push(trail);
    
    scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0.3,
      scaleY: 0.3,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        const index = trailParticles.indexOf(trail);
        if (index > -1) trailParticles.splice(index, 1);
        trail.destroy();
      }
    });
  };

  const syncAttachments = () => {
    lightTrail.x = player.x;
    lightTrail.y = player.y + displaySize.height * 0.1;
    footShadow.x = player.x;
    footShadow.y = player.y + displaySize.height * 0.5;
  };

  const createLandingRing = (x: number, y: number) => {
    const ring = scene.add.graphics({ x, y }).setDepth(3);
    ring.lineStyle(2, 0x9acbff, 0.55);
    ring.strokeEllipse(0, 0, 34, 10);

    scene.tweens.add({
      targets: ring,
      alpha: 0,
      scaleX: 1.7,
      scaleY: 1.7,
      duration: 420,
      ease: "Quart.easeOut",
      onComplete: () => ring.destroy(),
    });
  };

  const createDoubleJumpFlash = (x: number, y: number) => {
    const flash = scene.add.rectangle(x, y, 36, 36, 0x9df5ff, 0.6).setDepth(4);
    flash.setAngle(45);
    flash.setBlendMode(Phaser.BlendModes.ADD);

    scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 250,
      ease: "Cubic.easeOut",
      onComplete: () => flash.destroy(),
    });
  };

  const createEnergyAura = (x: number, y: number, intensity: number) => {
    const aura = scene.add.circle(x, y, 20, 0x4adeff, 0.3 * intensity)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3);
    
    scene.tweens.add({
      targets: aura,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 400,
      ease: "Quad.easeOut",
      onComplete: () => aura.destroy()
    });
  };

  const createMotionTrails = (x: number, y: number, velocity: { x: number; y: number }) => {
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    if (speed < 100) return;

    const trail = scene.add.image(x, y, IMAGE_KEYS.propLightBeam)
      .setAlpha(0.15)
      .setDisplaySize(displaySize.width * 0.8, displaySize.height * 0.3)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(0);
    
    motionBlur.push(trail);
    
    scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0.2,
      scaleY: 0.2,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        const index = motionBlur.indexOf(trail);
        if (index > -1) motionBlur.splice(index, 1);
        trail.destroy();
      }
    });
  };

  const createImpactShockwave = (x: number, y: number, force: number) => {
    const shockwave = scene.add.graphics({ x, y }).setDepth(2);
    const radius = 20 + force * 0.1;
    const color = force > 300 ? 0xff9cf7 : 0x4adeff;
    
    shockwave.lineStyle(3, color, 0.8);
    shockwave.strokeCircle(0, 0, radius);
    
    scene.tweens.add({
      targets: shockwave,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      radius: radius * 2,
      duration: 300 + force * 0.2,
      ease: "Cubic.easeOut",
      onComplete: () => shockwave.destroy()
    });
  };

  const playLandingSquash = () => {
    scene.tweens.killTweensOf(player);
    scene.tweens.add({
      targets: player,
      scaleX: 1.08,
      scaleY: 0.92,
      duration: 90,
      yoyo: true,
      ease: "Quad.easeOut",
    });
    scene.tweens.killTweensOf(footShadow);
    scene.tweens.add({
      targets: footShadow,
      scaleX: 1.35,
      alpha: { from: 0.5, to: 0.3 },
      duration: 140,
      yoyo: true,
      ease: "Quad.easeOut",
    });
  };

  const handleJumpEvent = (payload: { isAirJump: boolean }): void => {
    if (payload.isAirJump) {
      createDoubleJumpFlash(player.x, player.y);
    }
  };
  scene.game.events.on("playerJump", handleJumpEvent);
  const updatePose = () => {
    const body = player.body as Phaser.Physics.Arcade.Body;
    const grounded = body.blocked.down || body.touching.down;
    let nextPose: PlayerPose = "idle";

    if (!grounded) {
      if (body.velocity.x > 40) {
        nextPose = "right";
        lastAirFacing = "right";
      } else if (body.velocity.x < -40) {
        nextPose = "left";
        lastAirFacing = "left";
      } else {
        nextPose = lastAirFacing;
      }
    } else if (Math.abs(body.velocity.x) > 120) {
      nextPose = body.velocity.x > 0 ? "right" : "left";
      lastAirFacing = nextPose === "right" ? "right" : "left";
    }

    if (nextPose !== activePose) {
      activePose = nextPose;
      player.setTexture(poseTextures[activePose]);
      player.setDisplaySize(displaySize.width, displaySize.height);
    }
  };

  const updatePlayerVisuals = () => {
    const body = player.body as Phaser.Physics.Arcade.Body;
    const grounded = body.blocked.down || body.touching.down;
    const currentTime = scene.time.now;
    const speed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);
    
    // Check for landing event (was in air, now on ground with significant impact)
    if (!previousGroundState && grounded && body.velocity.y > 50) {
      createLandingParticles(player.x, player.y + displaySize.height * 0.4);
      createLandingRing(player.x, player.y + displaySize.height * 0.45);
      createImpactShockwave(player.x, player.y + displaySize.height * 0.45, Math.abs(body.velocity.y));
      createEnergyAura(player.x, player.y, Math.min(1, Math.abs(body.velocity.y) / 200));
      playLandingSquash();
      scene.game.events.emit("playerLanded", {
        x: player.x,
        y: player.y + displaySize.height * 0.45,
        velocity: body.velocity.y,
      });
    }
    
    // Create enhanced movement trail when moving fast
    if (grounded && Math.abs(body.velocity.x) > 80 && currentTime - lastTrailSpawn > trailSpawnInterval * 0.7) {
      createMovementTrail(player.x, player.y);
      createMotionTrails(player.x, player.y, { x: body.velocity.x, y: body.velocity.y });
      lastTrailSpawn = currentTime;
    }
    
    // Check for jump event (was on ground, now in air with upward velocity)
    if (previousGroundState && !grounded && body.velocity.y < -100) {
      createJumpParticles(player.x, player.y + displaySize.height * 0.4);
      createEnergyAura(player.x, player.y, 0.5);
    }
    
    // Create motion blur during high-speed movement
    if (speed > 150) {
      createMotionTrails(player.x, player.y, { x: body.velocity.x, y: body.velocity.y });
    }
    
    // Update light trail intensity based on speed
    if (lightTrail) {
      const intensity = Math.min(1, speed / 200);
      lightTrail.setAlpha(0.12 + intensity * 0.18);
      lightTrail.setDisplaySize(
        displaySize.width * (0.9 + intensity * 0.2),
        displaySize.height * (2.1 + intensity * 0.4)
      );
    }
    
    // Update previous state for next frame
    previousGroundState = grounded;
    
    // Update existing visual effects
    syncAttachments();
    updatePose();
  };

  scene.events.on(Phaser.Scenes.Events.UPDATE, updatePlayerVisuals);

  player.on(Phaser.GameObjects.Events.DESTROY, () => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, updatePlayerVisuals);
    scene.game.events.off("playerJump", handleJumpEvent);
    lightTrail.destroy();
    footShadow.destroy();
  });

  return player;
}
