// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

export enum LoggableType {
  Raw,
  Boolean,
  Number,
  String,
  BooleanArray,
  NumberArray,
  StringArray,
  Empty
}

export enum SelectionMode {
  Idle,
  Static,
  Playback,
  Locked
}

export interface LogValueSet<T> {
  timestamps: number[];
  values: T[];
}

export interface Log {
  getFieldKeys(): string[];
  getType(key: string): LoggableType | null;
  getTimestampRange(): [number, number];
  getRange(key: string, start: number, end: number, uuid?: string): LogValueSet<any> | undefined;
  getBoolean(key: string, start: number, end: number, uuid?: string): LogValueSet<boolean> | undefined;
  getNumber(key: string, start: number, end: number, uuid?: string): LogValueSet<number> | undefined;
  getString(key: string, start: number, end: number, uuid?: string): LogValueSet<string> | undefined;
  getBooleanArray(key: string, start: number, end: number, uuid?: string): LogValueSet<boolean[]> | undefined;
  getNumberArray(key: string, start: number, end: number, uuid?: string): LogValueSet<number[]> | undefined;
  getStringArray(key: string, start: number, end: number, uuid?: string): LogValueSet<string[]> | undefined;
}

/** Selection interface */
export interface Selection {
  /** Returns the current selection mode */
  getMode(): SelectionMode;

  /** Gets the current hovered time */
  getHoveredTime(): number | null;

  /** Updates the hovered time */
  setHoveredTime(value: number | null): void;

  /** Return the selected time based on the current mode */
  getSelectedTime(): number | null;

  /** Updates the selected time based on the current mode */
  setSelectedTime(time: number): void;

  /** Returns the time that should be displayed */
  getRenderTime(): number | null;

  /** Switches to idle if possible */
  goIdle(): void;

  /** Switches to playback mode */
  play(): void;

  /** Exits playback and locked modes */
  pause(): void;

  /** Switches between pausing and playback */
  togglePlayback(): void;

  /** Switches to locked mode if possible */
  lock(): void;

  /** Exits locked mode */
  unlock(): void;

  /** Switches between locked and unlocked modes */
  toggleLock(): void;
}

export interface Preferences {
  theme: "light" | "dark" | "system";
  robotAddress: string;
  [key: string]: any;
}

export interface AssetConfig {
  name: string;
  path: string;
  [key: string]: any;
}

export interface AdvantageScopeAssets {
  field2ds: AssetConfig[];
  field3ds: AssetConfig[];
  robots: AssetConfig[];
  joysticks: AssetConfig[];
}

/** A controller for a single tab. Updates user controls and produces commands to be used by renderers. */
export interface TabController {
  UUID: string;

  /** Returns the current state. */
  saveState(): unknown;

  /** Restores to the provided state. */
  restoreState(state: unknown): void;

  /** Refresh based on new log data. */
  refresh(): void;

  /** Notify that the set of assets was updated. */
  newAssets(): void;

  /**
   * Returns the list of fields currently being displayed. This is
   * used to selectively request fields from live sources, and all
   * keys matching the provided prefixes will be made available.
   **/
  getActiveFields(): string[];

  /** Returns whether to display the timeline. */
  showTimeline(): boolean;

  /** Returns data required by renderers. */
  getCommand(): unknown;
}

export default interface TabRenderer {
  /** Returns the current state. */
  saveState(): unknown;

  /** Restores to the provided state. */
  restoreState(state: unknown): void;

  /** Get the desired window aspect ratio for satellites. */
  getAspectRatio(): number | null;

  /** Called once per frame. */
  render(command: unknown): void;
}

/**
 * Plugin interface - defines the structure of a plugin module.
 * Each plugin must export a default object matching this interface.
 */
export interface Plugin {
  /** Display name of the plugin */
  title: string;
  /** Icon for the plugin (emoji or text) */
  icon: string;
  /** Controller class constructor */
  controller: new (root: HTMLElement) => TabController;
  /** Renderer class constructor */
  renderer: new (root: HTMLElement) => TabRenderer;
}

// ============================================================================
// Source List Configuration Types
// ============================================================================

export type SourceListConfig = {
  title: string;
  /** True advances type, string advances option */
  autoAdvance: boolean | string;
  /** Should be false if parent types (arrays/structs) are supported directly */
  allowChildrenFromDrag: boolean;
  /** If provided, remember types and options for fields */
  typeMemoryId?: string;
  types: SourceListTypeConfig[];
};

export type SourceListTypeConfig = {
  key: string;
  display: string;
  symbol: string;
  showInTypeName: boolean;
  /** Option key or hex (starting with #) */
  color: string;
  darkColor?: string;
  sourceTypes: string[];
  /** Enable deprecation warning */
  numberArrayDeprecated?: boolean;
  /** Identifies parents with shared children types */
  parentKey?: string;
  /** Parent key this child is attached to */
  childOf?: string;
  previewType?:
    | "Rotation2d"
    | "Translation2d"
    | "Pose2d"
    | "Transform2d"
    | "Rotation3d"
    | "Translation3d"
    | "Pose3d"
    | "Transform3d"
    | "SwerveModuleState[]"
    | "ChassisSpeeds"
    | null; // Don't use preview
  initialSelectionOption?: string;
  showDocs: boolean;
  options: SourceListOptionConfig[];
};

export type SourceListOptionConfig = {
  key: string;
  display: string;
  showInTypeName: boolean;
  values: SourceListOptionValueConfig[];
};

export type SourceListOptionValueConfig = {
  key: string;
  display: string;
};

export type SourceListState = SourceListItemState[];

export type SourceListItemState = {
  type: string;
  logKey: string;
  logType: string;
  visible: boolean;
  options: { [key: string]: string };
};

export type SourceListTypeMemory = {
  // Memory ID
  [key: string]: {
    // Log key
    [key: string]: SourceListTypeMemoryEntry;
  };
};

export type SourceListTypeMemoryEntry = {
  type: string;
  options: { [key: string]: string };
};

// ============================================================================
// Geometry Types
// ============================================================================

export type Translation2d = [number, number];

export type Rotation2d = number;

export type Pose2d = {
  translation: Translation2d;
  rotation: Rotation2d;
};

export type Transform2d = {
  translation: Translation2d;
  rotation: Rotation2d;
};

export type Translation3d = [number, number, number];

export type Rotation3d = [number, number, number, number];

export type Pose3d = {
  translation: Translation3d;
  rotation: Rotation3d;
};

export type Transform3d = {
  translation: Translation3d;
  rotation: Rotation3d;
};

// ============================================================================
// Color Constants
// ============================================================================

export const GraphColors: SourceListOptionValueConfig[] = [
  { key: "#2b66a2", display: "Blue" },
  { key: "#e5b31b", display: "Gold" },
  { key: "#af2437", display: "Red" },
  { key: "#80588e", display: "Purple" },
  { key: "#e48b32", display: "Orange" },
  { key: "#c0b487", display: "Tan" },
  { key: "#858584", display: "Gray" },
  { key: "#3b875a", display: "Green" },
  { key: "#d993aa", display: "Pink" },
  { key: "#5f4528", display: "Brown" }
];

export const NeonColors: SourceListOptionValueConfig[] = [
  { key: "#00ff00", display: "Green" },
  { key: "#ff0000", display: "Red" },
  { key: "#0000ff", display: "Blue" },
  { key: "#ff8c00", display: "Orange" },
  { key: "#00ffff", display: "Cyan" },
  { key: "#ffff00", display: "Yellow" },
  { key: "#ff00ff", display: "Magenta" }
];

export type ButtonRect = { x: number; y: number; width: number; height: number };
