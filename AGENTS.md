# AGENTS.md

This file provides guidance to agents when working with code in this repository.

Non-obvious, project-specific rules:

- Runtime environment:
  - Always start commands via `setup_env.bat` from the project root, e.g.:
    - `.\setup_env.bat npm install`
    - `.\setup_env.bat npm run dev`
  - Direct `npm`/`npx` calls may fail in this environment; treat `setup_env.bat` as mandatory bootstrap.
- Dev server:
  - Default dev uses Vite on port `5173`. If it is already in use, either:
    - Stop the existing dev server, or
    - Run Vite on an alternative port via `setup_env.bat` wrapper if you adjust scripts.
- Scenes and flow:
  - Scene transitions are centralized in [`SceneController.transitionToMenu`](src/core/scene/SceneController.ts:11) and [`transitionToGame`](src/core/scene/SceneController.ts:21); always use these helpers instead of calling `scene.start` directly for core flows.
  - The main menu key is still `"IndustrialMenuScene"` for compatibility, even though it now implements a luxury-style menu. Do not rename the scene key without updating all transitions.
- UI architecture:
  - Industrial-style and luxury-style UIs are separated:
    - Industrial: [`IndustrialUI`](src/core/ui/IndustrialUI.ts:41), [`IndustrialUISystem`](src/core/ui/IndustrialUISystem.ts:53)
    - Luxury (custom): [`LuxuryUI`](src/core/ui/LuxuryUI.ts:58), [`LuxuryAnimations`](src/core/ui/LuxuryAnimations.ts:49), [`LuxuryVisualEffects`](src/core/ui/LuxuryVisualEffects.ts:39)
  - When extending the menu or loading UI, prefer using these abstractions instead of drawing raw `Graphics`; they encapsulate project-specific visual language and interactions.
- Asset loading:
  - All core assets are queued exclusively via [`queueAssetManifest`](src/assets/assetManifest.ts:73). If you add assets, register them there rather than loading ad-hoc inside scenes.
  - Some assets (e.g. `propLightBeam`) have special fallback handling in [`queueAssetManifest`](src/assets/assetManifest.ts:81); follow that pattern for unstable assets.
- Styling and typography:
  - Use `"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"` or the existing font stacks from [`GlassmorphismUI`](src/core/ui/GlassmorphismUI.ts:154) and [`IndustrialUI`](src/core/ui/IndustrialUI.ts:131) when adding text; avoid introducing inconsistent fonts.
  - For luxury text, use [`LuxuryUI.createLuxuryText`](src/core/ui/LuxuryUI.ts:230) so highlights and material-specific shadows stay consistent.
- Error handling / gotchas:
  - Phaser `Graphics` objects do not support `createLinearGradient`; when you need gradients, use canvas textures as done in [`LuxuryUI`](src/core/ui/LuxuryUI.ts:280) or simple `fillGradientStyle` where appropriate.
  - Do not bypass the existing start/transition helpers in scenes; they often include visual effects and safety flags (`isStarting`) that prevent double transitions.
