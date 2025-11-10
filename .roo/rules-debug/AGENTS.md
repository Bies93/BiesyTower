# AGENTS.md

This file provides guidance to agents (Debug mode) when working with this repository.

- Always reproduce and run locally via `.\setup_env.bat ...` from project root (e.g. `.\setup_env.bat npm run dev`); direct `npm`/`npx` can fail in this environment.
- If dev server fails with "Port 5173 is already in use":
  - Check for an existing Vite instance instead of blindly switching ports.
  - Any alternative port must still be started through `setup_env.bat`.
- Scene flow gotchas:
  - Use [`SceneController.transitionToMenu`](src/core/scene/SceneController.ts:11) / [`transitionToGame`](src/core/scene/SceneController.ts:21); bypassing them can leave scenes running or break overlays.
  - The menu scene key `"IndustrialMenuScene"` is intentional; changing it without updating transitions will break returns from game/boot.
- UI debugging:
  - Menu and loading visuals are composed via [`LuxuryUI`](src/core/ui/LuxuryUI.ts:58), [`LuxuryAnimations`](src/core/ui/LuxuryAnimations.ts:49), and [`LuxuryVisualEffects`](src/core/ui/LuxuryVisualEffects.ts:39); bugs here often stem from bypassing these helpers.
  - If gradients fail at runtime, check for incorrect use of Canvas APIs on Phaser `Graphics`. Reference the canvas-based workaround in [`LuxuryUI`](src/core/ui/LuxuryUI.ts:280+).
- Assets:
  - Loading issues should be traced through [`queueAssetManifest`](src/assets/assetManifest.ts:73); missing entries or skipping this manifest are common root causes.
