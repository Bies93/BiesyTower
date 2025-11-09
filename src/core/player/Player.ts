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
  const displaySize = { width: 44, height: 44 };
  const player = scene.physics.add.sprite(x, y, IMAGE_KEYS.playerIdleLanding);
  player.setDisplaySize(displaySize.width, displaySize.height);
  player.setCollideWorldBounds(true);
  player.setBounce(0.05);
  player.setDragX(900);
  player.setMaxVelocity(260, 900);
  player.body
    .setSize(displaySize.width * 0.6, displaySize.height * 0.8)
    .setOffset(displaySize.width * 0.2, displaySize.height * 0.2);

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

  scene.tweens.add({
    targets: lightTrail,
    alpha: { from: 0.12, to: 0.3 },
    duration: 700,
    yoyo: true,
    repeat: -1,
  });

  const syncTrail = () => {
    lightTrail.x = player.x;
    lightTrail.y = player.y + displaySize.height * 0.1;
  };
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
    syncTrail();
    updatePose();
  };

  scene.events.on(Phaser.Scenes.Events.UPDATE, updatePlayerVisuals);

  player.on(Phaser.GameObjects.Events.DESTROY, () => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, updatePlayerVisuals);
    lightTrail.destroy();
  });

  return player;
}
