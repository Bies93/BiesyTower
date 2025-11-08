/**
 * Zentrale Game-Konfiguration für Icy Tower Modern.
 * Entkoppelt Kernparameter von Phaser-spezifischem Code.
 */

export const baseGameConfig = {
  viewport: {
    width: 480,
    height: 800,
  },
  colors: {
    background: "#050814",
    platform: "#3ab4ff",
    player: "#ffffff",
  },
  physics: {
    gravityY: 860,
    jumpVelocity: 480,
    coyoteTimeMs: 130,
    jumpBufferMs: 110,
  },
  rules: {
    deathMargin: 80,
  },
  debug: {
    physicsDebug: false,
  },
} as const;

export type BaseGameConfig = typeof baseGameConfig;
