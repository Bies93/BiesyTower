# AGENTS.md

This file provides guidance to agents (Code mode) when working with code in this repository.

- Always run Node/Vite commands via `setup_env.bat` from project root, e.g. `.\setup_env.bat npm run dev`; direct `npm`/`npx` is unreliable here.
- Use scene transitions only via [`SceneController.transitionToMenu`](src/core/scene/SceneController.ts:11) and [`transitionToGame`](src/core/scene/SceneController.ts:21); do not call `scene.start` directly for core flows.
- Keep the main menu scene key as `"IndustrialMenuScene"`; it now hosts the luxury menu but other code depends on this key.
- For UI work:
  - Industrial UI: [`IndustrialUI`](src/core/ui/IndustrialUI.ts:41), [`IndustrialUISystem`](src/core/ui/IndustrialUISystem.ts:53).
  - Luxury UI: [`LuxuryUI`](src/core/ui/LuxuryUI.ts:58), [`LuxuryAnimations`](src/core/ui/LuxuryAnimations.ts:49), [`LuxuryVisualEffects`](src/core/ui/LuxuryVisualEffects.ts:39).
  - Prefer these abstractions over ad-hoc Phaser `Graphics` for menu/loading UIs.
- Assets:
  - Register images/audio only via [`queueAssetManifest`](src/assets/assetManifest.ts:73); follow special handling patterns like `propLightBeam` in the same file.
- Typography:
  - Reuse the font stacks from [`GlassmorphismUI`](src/core/ui/GlassmorphismUI.ts:154) and [`IndustrialUI`](src/core/ui/IndustrialUI.ts:131).
  - For luxury labels/titles, use [`LuxuryUI.createLuxuryText`](src/core/ui/LuxuryUI.ts:230) for consistent highlights and shadows.
- Gotchas:
  - Phaser `Graphics` does not support `createLinearGradient`; use canvas textures as in [`LuxuryUI`](src/core/ui/LuxuryUI.ts:280) or `fillGradientStyle`.
  - Respect `isStarting` guards and transition helpers in scenes to avoid double transitions and visual glitches.