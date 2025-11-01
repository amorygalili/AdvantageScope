// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/**
 * Type definitions for AdvantageScope Plugin API
 * These are simplified versions of the internal types
 */

/** A type of log data that can be stored. */
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

/** Selection mode */
export enum SelectionMode {
  Idle,
  Static,
  Playback,
  Locked
}

/** Log value set */
export interface LogValueSet<T> {
  timestamps: number[];
  values: T[];
}

/** Log interface - simplified version */
export interface Log {
  /** Returns all field keys */
  getFieldKeys(): string[];

  /** Returns the type of a field */
  getType(key: string): LoggableType | null;

  /** Returns the range of timestamps across all fields */
  getTimestampRange(): [number, number];

  /** Reads a set of generic values from the field */
  getRange(key: string, start: number, end: number, uuid?: string): LogValueSet<any> | undefined;

  /** Reads a set of Boolean values from the field */
  getBoolean(key: string, start: number, end: number, uuid?: string): LogValueSet<boolean> | undefined;

  /** Reads a set of Number values from the field */
  getNumber(key: string, start: number, end: number, uuid?: string): LogValueSet<number> | undefined;

  /** Reads a set of String values from the field */
  getString(key: string, start: number, end: number, uuid?: string): LogValueSet<string> | undefined;

  /** Reads a set of BooleanArray values from the field */
  getBooleanArray(key: string, start: number, end: number, uuid?: string): LogValueSet<boolean[]> | undefined;

  /** Reads a set of NumberArray values from the field */
  getNumberArray(key: string, start: number, end: number, uuid?: string): LogValueSet<number[]> | undefined;

  /** Reads a set of StringArray values from the field */
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

/** Preferences interface - simplified */
export interface Preferences {
  theme: "light" | "dark" | "system";
  robotAddress: string;
  [key: string]: any;
}

/** Asset configuration */
export interface AssetConfig {
  name: string;
  path: string;
  [key: string]: any;
}

/** AdvantageScope assets */
export interface AdvantageScopeAssets {
  field2ds: AssetConfig[];
  field3ds: AssetConfig[];
  robots: AssetConfig[];
  joysticks: AssetConfig[];
}

// ============================================================================
// Tab Controller and Renderer Interfaces
// ============================================================================

/**
 * A controller for a single tab. Updates user controls and produces commands to be used by renderers.
 */
export interface TabController {
  /** Unique identifier for this controller instance */
  UUID: string;

  /** Returns the current state for saving */
  saveState(): unknown;

  /** Restores to the provided state */
  restoreState(state: unknown): void;

  /** Refresh based on new log data */
  refresh(): void;

  /** Notify that the set of assets was updated */
  newAssets(): void;

  /**
   * Returns the list of fields currently being displayed. This is
   * used to selectively request fields from live sources, and all
   * keys matching the provided prefixes will be made available.
   */
  getActiveFields(): string[];

  /** Returns whether to display the timeline */
  showTimeline(): boolean;

  /** Returns data required by renderers */
  getCommand(): unknown;
}

/**
 * A renderer for a single tab. Receives commands from the controller and renders the visualization.
 */
export interface TabRenderer {
  /** Returns the current state for saving */
  saveState(): unknown;

  /** Restores to the provided state */
  restoreState(state: unknown): void;

  /** Get the desired window aspect ratio for satellites (null for no constraint) */
  getAspectRatio(): number | null;

  /** Called once per frame with the command from the controller */
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

/**
 * Configuration for a source list component.
 * Used by controllers to define how fields can be selected and configured.
 */
export type SourceListConfig = {
  /** Title displayed for this source list */
  title: string;
  /** True advances type, string advances option */
  autoAdvance: boolean | string;
  /** Should be false if parent types (arrays/structs) are supported directly */
  allowChildrenFromDrag: boolean;
  /** If provided, remember types and options for fields */
  typeMemoryId?: string;
  /** Available types for this source list */
  types: SourceListTypeConfig[];
};

/**
 * Configuration for a single type in a source list.
 */
export type SourceListTypeConfig = {
  /** Unique key for this type */
  key: string;
  /** Display name for this type */
  display: string;
  /** SF Symbol name for the icon */
  symbol: string;
  /** Whether to show this type in the type name */
  showInTypeName: boolean;
  /** Option key or hex color (starting with #) */
  color: string;
  /** Optional dark mode color override */
  darkColor?: string;
  /** Allowed source types from the log */
  sourceTypes: string[];
  /** Enable deprecation warning for number arrays */
  numberArrayDeprecated?: boolean;
  /** Identifies parents with shared children types */
  parentKey?: string;
  /** Parent key this child is attached to */
  childOf?: string;
  /** Preview type for this source */
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
    | null;
  /** Initial option to select when adding this type */
  initialSelectionOption?: string;
  /** Whether to show documentation for this type */
  showDocs: boolean;
  /** Available options for this type */
  options: SourceListOptionConfig[];
};

/**
 * Configuration for an option in a source list type.
 */
export type SourceListOptionConfig = {
  /** Unique key for this option */
  key: string;
  /** Display name for this option */
  display: string;
  /** Whether to show this option in the type name */
  showInTypeName: boolean;
  /** Available values for this option */
  values: SourceListOptionValueConfig[];
};

/**
 * Configuration for a value in a source list option.
 */
export type SourceListOptionValueConfig = {
  /** Unique key for this value */
  key: string;
  /** Display name for this value */
  display: string;
};

/**
 * State of a source list (array of items).
 */
export type SourceListState = SourceListItemState[];

/**
 * State of a single item in a source list.
 */
export type SourceListItemState = {
  /** Type key */
  type: string;
  /** Log field key */
  logKey: string;
  /** Log field type */
  logType: string;
  /** Whether this item is visible */
  visible: boolean;
  /** Selected option values */
  options: { [key: string]: string };
};

/**
 * Memory of type selections for fields.
 */
export type SourceListTypeMemory = {
  // Memory ID
  [key: string]: {
    // Log key
    [key: string]: SourceListTypeMemoryEntry;
  };
};

/**
 * Entry in the type memory.
 */
export type SourceListTypeMemoryEntry = {
  /** Type key */
  type: string;
  /** Selected option values */
  options: { [key: string]: string };
};

// ============================================================================
// Geometry Types
// ============================================================================

/** 2D translation in meters (x, y) */
export type Translation2d = [number, number];

/** 2D rotation in radians */
export type Rotation2d = number;

/** 2D pose with translation and rotation */
export type Pose2d = {
  translation: Translation2d;
  rotation: Rotation2d;
};

/** 2D transform with translation and rotation */
export type Transform2d = {
  translation: Translation2d;
  rotation: Rotation2d;
};

/** 3D translation in meters (x, y, z) */
export type Translation3d = [number, number, number];

/** 3D rotation as quaternion (w, x, y, z) */
export type Rotation3d = [number, number, number, number];

/** 3D pose with translation and rotation */
export type Pose3d = {
  translation: Translation3d;
  rotation: Rotation3d;
};

/** 3D transform with translation and rotation */
export type Transform3d = {
  translation: Translation3d;
  rotation: Rotation3d;
};

// ============================================================================
// Color Constants
// ============================================================================

/** Standard graph colors for visualizations */
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

/** Neon colors for high-contrast visualizations */
export const NeonColors: SourceListOptionValueConfig[] = [
  { key: "#00ff00", display: "Green" },
  { key: "#ff0000", display: "Red" },
  { key: "#0000ff", display: "Blue" },
  { key: "#ff8c00", display: "Orange" },
  { key: "#00ffff", display: "Cyan" },
  { key: "#ffff00", display: "Yellow" },
  { key: "#ff00ff", display: "Magenta" }
];
