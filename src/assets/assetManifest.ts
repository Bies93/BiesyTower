import Phaser from "phaser";

type ImageAsset = {
  key: string;
  url: string;
};

type AudioAsset = {
  key: string;
  urls: string[];
  config?: Phaser.Types.Loader.FileTypes.AudioFileConfig;
};

interface AssetManifest {
  images: ImageAsset[];
  audio: AudioAsset[];
}

const assetUrl = (relativePath: string): string =>
  new URL(relativePath, import.meta.url).toString();

const WHITE_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAuMBgOb7nc8AAAAASUVORK5CYII=";

export const IMAGE_KEYS = {
  uiPill: "ui-pill",
  platformSeed: "platform-seed",
  playerPrototype: "player-prototype",
  playerJumpRight: "player-jump-right",
  playerJumpLeft: "player-jump-left",
  playerIdleLanding: "player-idle-landing",
  backgroundSkyline: "background-skyline",
  backgroundMidFog: "background-mid-fog",
  backgroundNearPillars: "background-near-pillars",
  propFloatingShards: "prop-floating-shards",
  propLightBeam: "prop-light-beam",
  particle: "particle",
  platformBase: "platform-base",
  platformIce: "platform-ice",
  platformBoost: "platform-boost",
  platformConveyorRight: "platform-conveyor-right",
  platformCrumble: "platform-crumble",
  platformNarrow: "platform-narrow",
  backgroundDystopiaConcepts: "background-dystopia-concepts",
} as const;

export type ImageKey = (typeof IMAGE_KEYS)[keyof typeof IMAGE_KEYS];

const UI_PING = "/audio/ui-confirm.wav";

export const assetManifest: AssetManifest = {
  images: [
    { key: IMAGE_KEYS.uiPill, url: WHITE_PIXEL },
    { key: IMAGE_KEYS.platformSeed, url: WHITE_PIXEL },
    { key: IMAGE_KEYS.playerPrototype, url: assetUrl("./Character/ancap_ball.png") },
    { key: IMAGE_KEYS.playerJumpRight, url: assetUrl("./Character/ancap_ball_rechts.png") },
    { key: IMAGE_KEYS.playerJumpLeft, url: assetUrl("./Character/ancap_ball_links.png") },
    { key: IMAGE_KEYS.playerIdleLanding, url: assetUrl("./Character/ancap_ball_pressed.png") },
    { key: IMAGE_KEYS.backgroundDystopiaConcepts, url: assetUrl("./Backgrounds/dystopia_concepts_set.png") },
    { key: IMAGE_KEYS.propFloatingShards, url: assetUrl("./Props/prop_floating_shards_150x150.png") },
    { key: IMAGE_KEYS.propLightBeam, url: assetUrl("./Props/prop_energy_stream_300x600.png") },
    { key: IMAGE_KEYS.particle, url: WHITE_PIXEL },
    { key: IMAGE_KEYS.platformBase, url: assetUrl("./Platforms/platform_base_128x64.png") },
    { key: IMAGE_KEYS.platformIce, url: assetUrl("./Platforms/platform_ice_128x64.png") },
    { key: IMAGE_KEYS.platformBoost, url: assetUrl("./Platforms/platform_boost_01_128x64.png") },
    { key: IMAGE_KEYS.platformConveyorRight, url: assetUrl("./Platforms/platform_conveyor_right_128x64.png") },
    { key: IMAGE_KEYS.platformCrumble, url: assetUrl("./Platforms/platform_crumble_01_128x64.png") },
    { key: IMAGE_KEYS.platformNarrow, url: assetUrl("./Platforms/platform_narrow_64x64.png") },
  ],
  audio: [{ key: "sfx-ui-confirm", urls: [UI_PING] }],
};

export function queueAssetManifest(scene: Phaser.Scene): void {
  console.log('AssetManifest: Starting to queue assets');
  
  assetManifest.images.forEach(({ key, url }) => {
    if (!scene.textures.exists(key)) {
      console.log(`AssetManifest: Loading image ${key} from ${url}`);
      
      // Special handling for problematic assets
      if (key === IMAGE_KEYS.propLightBeam) {
        console.log(`AssetManifest: Using fallback for problematic asset ${key}`);
        // Use white pixel as fallback for the problematic energy stream asset
        scene.load.image(key, WHITE_PIXEL);
      } else {
        scene.load.image(key, url);
      }
      
      // Add error handling for this specific asset
      scene.load.on(`filecomplete-image-${key}`, () => {
        console.log(`AssetManifest: Successfully loaded ${key}`);
      });
      
      scene.load.on(`loaderror-${key}`, (fileObj: any) => {
        console.error(`AssetManifest: Failed to load ${key}:`, fileObj);
        console.log(`AssetManifest: Attempting fallback for ${key}`);
        // Fallback to white pixel if asset fails to load
        if (!scene.textures.exists(key)) {
          scene.load.image(key, WHITE_PIXEL);
          scene.load.start();
        }
      });
    } else {
      console.log(`AssetManifest: ${key} already exists, skipping`);
    }
  });

  assetManifest.audio.forEach(({ key, urls, config }) => {
    if (!scene.sound.get(key)) {
      console.log(`AssetManifest: Loading audio ${key}`);
      scene.load.audio(key, urls, config);
    }
  });
  
  // Add global error handling
  scene.load.on('loaderror', (fileObj: any) => {
    console.error('AssetManifest: Global load error:', fileObj);
    console.log('AssetManifest: File details:', {
      key: fileObj.key,
      type: fileObj.type,
      url: fileObj.url,
      xhr: fileObj.xhr ? {
        status: fileObj.xhr.status,
        statusText: fileObj.xhr.statusText,
        readyState: fileObj.xhr.readyState
      } : 'No XHR data'
    });
  });
}
