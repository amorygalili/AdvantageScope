// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import TabRenderer, { NoopRenderer } from "../shared/renderers/TabRenderer";
import TabType, { Plugin, setLoadedPlugins } from "../shared/TabType";
import TabController, { NoopController } from "./controllers/TabController";

// Import plugins here
// For now, we'll import the test plugin for Plugin0
import testPlugin from "../plugins/testPlugin/index";

// Array of loaded plugins (null if not defined)
const plugins: (Plugin | null)[] = [
  testPlugin, // Plugin0
  null, // Plugin1
  null, // Plugin2
  null, // Plugin3
  null // Plugin4
];

// Initialize plugins in TabType module
export function addTestPlugins() {
  setLoadedPlugins(plugins);
}

/**
 * Get the controller class for a plugin type
 * @param type The plugin TabType
 * @returns The controller class or NoopController if plugin not defined
 */
export function getPluginController(type: TabType): new (root: HTMLElement) => TabController {
  const plugin = getPluginByType(type);
  if (plugin && plugin.controller) {
    return plugin.controller;
  }
  return NoopController;
}

/**
 * Get the renderer class for a plugin type
 * @param type The plugin TabType
 * @returns The renderer class or NoopRenderer if plugin not defined
 */
export function getPluginRenderer(type: TabType): new (root: HTMLElement) => TabRenderer {
  const plugin = getPluginByType(type);
  if (plugin && plugin.renderer) {
    return plugin.renderer;
  }
  return NoopRenderer;
}

/**
 * Get plugin by TabType
 * @param type The plugin TabType
 * @returns The plugin or null if not defined
 */
function getPluginByType(type: TabType): Plugin | null {
  switch (type) {
    case TabType.Plugin0:
      return plugins[0];
    case TabType.Plugin1:
      return plugins[1];
    case TabType.Plugin2:
      return plugins[2];
    case TabType.Plugin3:
      return plugins[3];
    case TabType.Plugin4:
      return plugins[4];
    default:
      return null;
  }
}

/**
 * Check if a plugin is defined for a given TabType
 * @param type The plugin TabType
 * @returns true if plugin is defined, false otherwise
 */
export function isPluginDefined(type: TabType): boolean {
  return getPluginByType(type) !== null;
}

/**
 * Get all defined plugin types
 * @returns Array of TabTypes for defined plugins
 */
export function getDefinedPluginTypes(): TabType[] {
  const definedTypes: TabType[] = [];
  if (plugins[0]) definedTypes.push(TabType.Plugin0);
  if (plugins[1]) definedTypes.push(TabType.Plugin1);
  if (plugins[2]) definedTypes.push(TabType.Plugin2);
  if (plugins[3]) definedTypes.push(TabType.Plugin3);
  if (plugins[4]) definedTypes.push(TabType.Plugin4);
  return definedTypes;
}
