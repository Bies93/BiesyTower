export type PlatformType =
  | "normal"
  | "wide"
  | "narrow"
  | "ice"
  | "boost"
  | "conveyorRight"
  | "crumble"
  | "magnetic"
  | "spring"
  | "fragile"
  | "moving"
  | "disappearing"
  | "golden"
  | "toxic"
  | "teleport";

export interface PlatformBehavior {
  type: PlatformType;
  onLand?: (platform: any, player: any) => void;
  onUpdate?: (platform: any, delta: number) => void;
  onDestroy?: (platform: any) => void;
}

export interface PlatformEvent {
  type: 'chain' | 'challenge' | 'bonus' | 'hazard';
  platforms: PlatformType[];
  config: any;
}