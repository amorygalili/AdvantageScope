// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

enum TabType {
  Documentation,
  LineGraph,
  Field2d,
  Field3d,
  Table,
  Console,
  Statistics,
  Video,
  Joysticks,
  Swerve,
  Mechanism,
  Points,
  Metadata,
  Plugin0,
  Plugin1,
  Plugin2,
  Plugin3,
  Plugin4
}

export default TabType;

export function getAllTabTypes(): TabType[] {
  return Object.values(TabType).filter((tabType) => typeof tabType === "number") as TabType[];
}

export const LITE_COMPATIBLE_TABS = [
  TabType.Documentation,
  TabType.LineGraph,
  TabType.Field2d,
  TabType.Field3d,
  TabType.Table,
  TabType.Console,
  TabType.Statistics,
  TabType.Joysticks,
  TabType.Swerve,
  TabType.Mechanism,
  TabType.Points,
  TabType.Metadata
];

export function getDefaultTabTitle(type: TabType): string {
  switch (type) {
    case TabType.Documentation:
      return "";
    case TabType.LineGraph:
      return "Line Graph";
    case TabType.Field2d:
      return "2D Field";
    case TabType.Field3d:
      return "3D Field";
    case TabType.Table:
      return "Table";
    case TabType.Console:
      return "Console";
    case TabType.Statistics:
      return "Statistics";
    case TabType.Video:
      return "Video";
    case TabType.Joysticks:
      return "Joysticks";
    case TabType.Swerve:
      return "Swerve";
    case TabType.Mechanism:
      return "Mechanism";
    case TabType.Points:
      return "Points";
    case TabType.Metadata:
      return "Metadata";
    case TabType.Plugin0:
    case TabType.Plugin1:
    case TabType.Plugin2:
    case TabType.Plugin3:
    case TabType.Plugin4:
      return getPluginTitle(type);
    default:
      return "";
  }
}

export function getTabIcon(type: TabType): string {
  switch (type) {
    case TabType.Documentation:
      return "📖";
    case TabType.LineGraph:
      return "📉";
    case TabType.Field2d:
      return "🗺";
    case TabType.Field3d:
      return "👀";
    case TabType.Table:
      return "🔢";
    case TabType.Console:
      return "💬";
    case TabType.Statistics:
      return "📊";
    case TabType.Video:
      return "🎬";
    case TabType.Joysticks:
      return "🎮";
    case TabType.Swerve:
      return "🦀";
    case TabType.Mechanism:
      return "⚙️";
    case TabType.Points:
      return "📍";
    case TabType.Metadata:
      return "🔍";
    case TabType.Plugin0:
    case TabType.Plugin1:
    case TabType.Plugin2:
    case TabType.Plugin3:
    case TabType.Plugin4:
      return getPluginIcon(type);
    default:
      return "";
  }
}

export function getTabAccelerator(type: TabType): string {
  if (type === TabType.Documentation) return "";
  // Plugins don't have accelerators
  if (
    type === TabType.Plugin0 ||
    type === TabType.Plugin1 ||
    type === TabType.Plugin2 ||
    type === TabType.Plugin3 ||
    type === TabType.Plugin4
  ) {
    return "";
  }
  return (
    "Alt+" +
    (() => {
      switch (type) {
        case TabType.LineGraph:
          return "G";
        case TabType.Field2d:
          return "2";
        case TabType.Field3d:
          return "3";
        case TabType.Table:
          return "T";
        case TabType.Console:
          return "C";
        case TabType.Statistics:
          return "S";
        case TabType.Video:
          return "V";
        case TabType.Joysticks:
          return "J";
        case TabType.Swerve:
          return "D";
        case TabType.Mechanism:
          return "M";
        case TabType.Points:
          return "P";
        case TabType.Metadata:
          return "I";
        default:
          return "";
      }
    })()
  );
}

/** Helper function to get plugin title from loaded plugins */
function getPluginTitle(type: TabType): string {
  const plugin = getPlugin(type);
  return plugin ? plugin.title : "";
}

/** Helper function to get plugin icon from loaded plugins */
function getPluginIcon(type: TabType): string {
  const plugin = getPlugin(type);
  return plugin ? plugin.icon : "🔌";
}

/** Get plugin by TabType */
function getPlugin(type: TabType): Plugin | null {
  const plugins = getLoadedPlugins();
  switch (type) {
    case TabType.Plugin0:
      return plugins[0] || null;
    case TabType.Plugin1:
      return plugins[1] || null;
    case TabType.Plugin2:
      return plugins[2] || null;
    case TabType.Plugin3:
      return plugins[3] || null;
    case TabType.Plugin4:
      return plugins[4] || null;
    default:
      return null;
  }
}

/** Plugin interface */
export interface Plugin {
  title: string;
  icon: string;
  controller: new (root: HTMLElement) => any;
  renderer: new (root: HTMLElement) => any;
}

/** Get all loaded plugins (to be populated by plugin loader) */
let loadedPlugins: (Plugin | null)[] = [null, null, null, null, null];

export function getLoadedPlugins(): (Plugin | null)[] {
  return loadedPlugins;
}

export function setLoadedPlugins(plugins: (Plugin | null)[]) {
  loadedPlugins = plugins;
  console.log("setLoadedPlugins:", plugins);
}

/** Check if a plugin is defined for a given TabType */
export function isPluginDefined(type: TabType): boolean {
  return getPlugin(type) !== null;
}

/** Get all tab types with undefined plugins filtered out */
export function getAllTabTypesWithPlugins(): TabType[] {
  return getAllTabTypes().filter((type) => {
    // If it's a plugin type, check if it's defined
    if (type >= TabType.Plugin0 && type <= TabType.Plugin4) {
      return isPluginDefined(type);
    }
    // Non-plugin types are always included
    return true;
  });
}
