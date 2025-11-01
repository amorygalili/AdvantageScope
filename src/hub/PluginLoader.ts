// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import TabRenderer, { NoopRenderer } from "../shared/renderers/TabRenderer";
import TabType, { Plugin, setLoadedPlugins } from "../shared/TabType";
import TabController, { NoopController } from "./controllers/TabController";

// Array of loaded plugins (null if not defined)
const plugins: (Plugin | null)[] = [null, null, null, null, null];

// Plugin server port (must match ElectronConstants.ts)
const PLUGIN_SERVER_PORT = 56329;

/**
 * Load plugins dynamically from the plugin server
 * This function should be called during application initialization
 */
export async function loadPlugins(pluginDirectories: string[]): Promise<void> {
  console.log("Loading plugins from directories:", pluginDirectories);

  for (let i = 0; i < Math.min(pluginDirectories.length, 5); i++) {
    try {
      // Construct the URL to the plugin's index.ts file
      const pluginUrl = `http://localhost:${PLUGIN_SERVER_PORT}/plugin/${i}/index.js`;
      console.log(`Loading plugin ${i} from ${pluginUrl}`);

      // Dynamically import the plugin module
      const module = await import(pluginUrl);
      const plugin = module.default as Plugin;

      if (plugin && plugin.title && plugin.icon && plugin.controller && plugin.renderer) {
        plugins[i] = plugin;
        console.log(`Successfully loaded plugin ${i}: ${plugin.title}`);
      } else {
        console.error(`Plugin ${i} has invalid structure:`, plugin);
      }
    } catch (error) {
      console.error(`Failed to load plugin ${i}:`, error);
      plugins[i] = null;
    }
  }

  // Update the loaded plugins in TabType module
  setLoadedPlugins(plugins);
  console.log(
    "Plugins loaded:",
    plugins.map((p) => (p ? p.title : "null"))
  );
}

/**
 * Initialize plugins with hardcoded test plugin for development
 * This is a temporary function for testing purposes
 */
export async function addTestPlugins(): Promise<void> {
  // For now, hardcode the test plugin directory
  // In the future, this will be provided by user preferences
  const testPluginDir = "D:\\repos\\AdvantageScope\\example-plugins\\test-plugin\\dist";
  console.log("Test plugin directory:", testPluginDir);

  // Use the loadPlugins function to load from the plugin server
  await loadPlugins([testPluginDir]);
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
