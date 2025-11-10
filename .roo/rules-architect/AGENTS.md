# AGENTS.md

This file provides guidance to agents (Architect mode) for this repository.

- Runtime / tooling:
  - All node/vite operations must be invoked via `.\setup_env.bat ...` from project root (e.g. `.\setup_env.bat npm install`, `.\setup_env.bat npm run dev`); this wrapper is mandatory and non-optional.
- Core flow:
  - Boot and transitions are centralized:
    - Boot loads assets via [`queueAssetManifest`](src/assets/assetManifest.ts:73).
    - Scene changes use [`transitionToMenu`](src/core/scene/SceneController.ts:11) / [`transitionToGame`](src/core/scene/SceneController.ts:21).
  - The main menu is intentionally bound to the `"IndustrialMenuScene"` key while presenting a luxury UI; architecture must preserve this key for compatibility.
- UI layering:
  - Industrial stack: [`IndustrialUI`](src/core/ui/IndustrialUI.ts:41), [`IndustrialUISystem`](src/core/ui/IndustrialUISystem.ts:53).
  - Luxury stack: [`LuxuryUI`](src/core/ui/LuxuryUI.ts:58), [`LuxuryAnimations`](src/core/ui/LuxuryAnimations.ts:49), [`LuxuryVisualEffects`](src/core/ui/LuxuryVisualEffects.ts:39).
  - New features (menus, loaders, overlays) should compose these layers instead of introducing parallel ad-hoc systems.
- Assets:
  - All new visual/audio assets must be registered via [`queueAssetManifest`](src/assets/assetManifest.ts:73); bypassing this breaks the centralized loading contract.
- Design constraints:
  - Gradients and advanced effects must respect Phaser limitations (no `createLinearGradient` on `Graphics`); use the canvas-based patterns from [`LuxuryUI`](src/core/ui/LuxuryUI.ts:280+) as the canonical approach.
  - Scene helpers include `isStarting` and other guards; architecture changes must not circumvent these protections.
