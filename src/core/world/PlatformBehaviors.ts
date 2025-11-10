import Phaser from "phaser";
import { PlatformBehavior, PlatformType } from "./platformTypes";

export class PlatformBehaviors {
  private static behaviors: Map<PlatformType, PlatformBehavior> = new Map();

  static {
    // Magnetic Platform - pulls player toward center
    this.behaviors.set("magnetic", {
      onUpdate: (platform: any, delta: number) => {
        const player = platform.scene.children.getByName("player");
        if (player && Math.abs(player.y - platform.y) < 50) {
          const dx = platform.x - player.x;
          const force = Math.min(Math.abs(dx) * 0.002, 0.5);
          player.setVelocityX(dx > 0 ? force : -force);
        }
      }
    });

    // Spring Platform - automatic jump
    this.behaviors.set("spring", {
      onLand: (platform: any, player: any) => {
        if (!platform.getData("springUsed")) {
          platform.setData("springUsed", true);
          player.setVelocityY(-400);
          
          // Visual feedback
          platform.scene.tweens.add({
            targets: platform,
            scaleY: 0.7,
            duration: 150,
            yoyo: true,
            ease: "Quad.easeOut"
          });
        }
      }
    });

    // Fragile Platform - breaks after landing
    this.behaviors.set("fragile", {
      onLand: (platform: any, player: any) => {
        const landCount = platform.getData("landCount") || 0;
        platform.setData("landCount", landCount + 1);
        
        if (landCount >= 1) {
          // Break animation
          platform.scene.tweens.add({
            targets: platform,
            alpha: 0,
            scaleX: 0.8,
            duration: 300,
            ease: "Quad.easeIn",
            onComplete: () => {
              platform.destroy();
              // Remove from platform list
              const platformManager = platform.scene.platformManager;
              if (platformManager) {
                platformManager.removePlatform(platform);
              }
            }
          });
        }
      }
    });

    // Moving Platform - horizontal movement
    this.behaviors.set("moving", {
      onUpdate: (platform: any, delta: number) => {
        const time = platform.scene.time.now;
        const speed = 50; // pixels per second
        const amplitude = 100;
        
        if (!platform.getData("moveStart")) {
          platform.setData("moveStart", time);
          platform.setData("moveCenter", platform.x);
        }
        
        const elapsed = (time - platform.getData("moveStart")) / 1000;
        const newX = platform.getData("moveCenter") + Math.sin(elapsed * speed * 0.01) * amplitude;
        platform.x = newX;
        
        // Update physics body
        platform.body.x = newX - platform.width / 2;
      }
    });

    // Disappearing Platform - fades out after time
    this.behaviors.set("disappearing", {
      onLand: (platform: any, player: any) => {
        if (!platform.getData("disappearStarted")) {
          platform.setData("disappearStarted", true);
          
          platform.scene.tweens.add({
            targets: platform,
            alpha: 0.2,
            duration: 3000,
            ease: "Quad.easeIn",
            onComplete: () => {
              // Make platform non-collidable
              platform.body.enable = false;
              
              // Restore after 5 seconds
              platform.scene.time.delayedCall(5000, () => {
                platform.scene.tweens.add({
                  targets: platform,
                  alpha: 1,
                  duration: 1000,
                  ease: "Quad.easeOut",
                  onComplete: () => {
                    platform.body.enable = true;
                    platform.setData("disappearStarted", false);
                  }
                });
              });
            }
          });
        }
      }
    });

    // Golden Platform - bonus points
    this.behaviors.set("golden", {
      onLand: (platform: any, player: any) => {
        if (!platform.getData("goldenUsed")) {
          platform.setData("goldenUsed", true);
          
          // Award bonus points
          const gameScene = platform.scene;
          gameScene.game.events.emit("bonusPoints", 500);
          
          // Visual celebration
          for (let i = 0; i < 20; i++) {
            const particle = gameScene.add.circle(
              platform.x + (Math.random() - 0.5) * platform.width,
              platform.y,
              3,
              0xffd700,
              1
            ).setBlendMode(Phaser.BlendModes.ADD);
            
            gameScene.tweens.add({
              targets: particle,
              x: particle.x + (Math.random() - 0.5) * 100,
              y: particle.y - Math.random() * 50,
              alpha: 0,
              scale: 0,
              duration: 1000 + Math.random() * 500,
              ease: "Quad.easeOut",
              onComplete: () => particle.destroy()
            });
          }
          
          // Change platform to normal after use
          platform.setTint(0x888888);
        }
      }
    });

    // Toxic Platform - damages player
    this.behaviors.set("toxic", {
      onLand: (platform: any, player: any) => {
        if (!platform.getData("toxicDamageApplied")) {
          platform.setData("toxicDamageApplied", true);
          
          // Apply damage
          const gameScene = platform.scene;
          gameScene.game.events.emit("playerDamage", 10);
          
          // Visual effect
          player.setTint(0xff0000);
          gameScene.time.delayedCall(500, () => {
            player.clearTint();
          });
          
          // Toxic particles
          for (let i = 0; i < 10; i++) {
            const particle = gameScene.add.circle(
              player.x + (Math.random() - 0.5) * 30,
              player.y,
              2,
              0x00ff00,
              0.8
            ).setBlendMode(Phaser.BlendModes.ADD);
            
            gameScene.tweens.add({
              targets: particle,
              y: particle.y - Math.random() * 30,
              alpha: 0,
              duration: 800,
              ease: "Quad.easeOut",
              onComplete: () => particle.destroy()
            });
          }
        }
      }
    });

    // Teleport Platform - teleports player
    this.behaviors.set("teleport", {
      onLand: (platform: any, player: any) => {
        if (!platform.getData("teleportUsed")) {
          platform.setData("teleportUsed", true);
          
          // Find next platform above
          const gameScene = platform.scene;
          const platforms = gameScene.platformManager?.getCurrentPlatforms() || [];
          const higherPlatforms = platforms.filter((p: any) => p.y < platform.y && p !== platform);
          
          if (higherPlatforms.length > 0) {
            const targetPlatform = higherPlatforms[0];
            
            // Teleport effect
            gameScene.tweens.add({
              targets: player,
              alpha: 0,
              scale: 0,
              duration: 300,
              ease: "Quad.easeIn",
              onComplete: () => {
                player.x = targetPlatform.x;
                player.y = targetPlatform.y - 50;
                
                gameScene.tweens.add({
                  targets: player,
                  alpha: 1,
                  scale: 1,
                  duration: 300,
                  ease: "Quad.easeOut"
                });
              }
            });
            
            // Portal effects
            this.createPortalEffect(gameScene, platform.x, platform.y);
            this.createPortalEffect(gameScene, targetPlatform.x, targetPlatform.y);
          }
        }
      }
    });
  }

  private static createPortalEffect(scene: Phaser.Scene, x: number, y: number): void {
    const portal = scene.add.graphics({ x, y });
    portal.lineStyle(3, 0x00ffff, 0.8);
    portal.strokeCircle(0, 0, 30);
    portal.lineStyle(2, 0xffffff, 0.6);
    portal.strokeCircle(0, 0, 20);
    
    scene.tweens.add({
      targets: portal,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 500,
      ease: "Quad.easeOut",
      onComplete: () => portal.destroy()
    });
  }

  public static getBehavior(type: PlatformType): PlatformBehavior | undefined {
    return this.behaviors.get(type);
  }

  public static hasBehavior(type: PlatformType): boolean {
    return this.behaviors.has(type);
  }
}