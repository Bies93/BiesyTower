# AGENTS.md

This file provides guidance to agents (Ask mode) when reasoning about this repository.

- Environment:
  - All runtime and dev commands must be wrapped with `.\setup_env.bat ...` from project root (e.g. `.\setup_env.bat npm run dev`); direct `npm`/`npx` usage is a known pitfall.
- Execution model:
  - The app is a Phaser + Vite setup; BootScene preloads via [`queueAssetManifest`](src/assets/assetManifest.ts:73) and then routes through [`SceneController`](src/core/scene/SceneController.ts:11).
  - The main menu is intentionally keyed `"IndustrialMenuScene"` even though it now presents a luxury UI; docs/explanations must reflect this for consistency.
- UI/Design context:
  - Industrial and luxury UIs are encapsulated:
    - Industrial stack: [`IndustrialUI`](src/core/ui/IndustrialUI.ts:41), [`IndustrialUISystem`](src/core/ui/IndustrialUISystem.ts:53).
    - Luxury stack: [`LuxuryUI`](src/core/ui/LuxuryUI.ts:58), [`LuxuryAnimations`](src/core/ui/LuxuryAnimations.ts:49), [`LuxuryVisualEffects`](src/core/ui/LuxuryVisualEffects.ts:39).
  - Explanations should point authors to these abstractions instead of suggesting ad-hoc `Graphics` usage for menu or loading screens.
- Assets and loading:
  - Any guidance on adding assets must mention registration via [`queueAssetManifest`](src/assets/assetManifest.ts:73) rather than inline `scene.load` calls in scenes.
- Gotchas to surface in explanations:
  - Phaser `Graphics` lacks `createLinearGradient`; gradients require canvas textures / `fillGradientStyle` as implemented in [`LuxuryUI`](src/core/ui/LuxuryUI.ts:280+).
  - Scene transitions must use the helper functions; recommending direct `scene.start` is incorrect for this project.
