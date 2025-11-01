## Plugins

- I'd like to create a plugin system for AdvantageScope. Plugins go into their own folder and contain

  - An index.ts file with a default export of type Plugin. Plugin contains everything needed to create the plugin including controller, renderer and plugin title used for display.
  - The controller, controller config, and renderer files which are referenced by the index.ts file.
  - Any other files needed by the plugin.
  -

- Placeholders for plugins:

  - placeholder render and controller templates in www\hub.html
  - placeholder TabType in src\shared\TabType.ts. There should be 5 tab types for plugins. If plugins are not defined they are not loaded.

- The addTab function in src\hub\Tabs.ts should be modified to support plugins. A case to catch all plugin types should be added to the switch statement. It should look something like this:

```typescript
case TabType.Plugin0:
case TabType.Plugin1:
case TabType.Plugin2:
case TabType.Plugin3:
case TabType.Plugin4:
  const PluginController = getPluginController(type);
  const PluginRenderer = getPluginRenderer(type);
  controller = new PluginController(controlsElement);
  renderer = new PluginRenderer(rendererElement);
  break;
```

- getPluginController and getPluginRenderer return the controller and renderer classes exported from the Plugin type in the plugin index.ts file. If the plugin is not defined they should return the NoopController and NoopRenderer.

- src\main\electron\main.ts includes code to add tabs for plugins. Plugins that are not defined are filtered out.

- At some point plugins will be bundled separately and then can be imported into advantagescope. You'll be able to import up to 5 plugins and the plugin type they are assigned will be based off the order they are imported. For now I added a folder to test the plugin system in src\plugins\testPlugin. Please update the files here to create a working plugin and make it assigned to TabType.Plugin0.

## Plugin loader

- Plugins should be loaded from a list of local directories. Each directory should have an index.ts file with a default export of type Plugin
- AdvantageScope should have an express server which serves files from the directories. Files should be served from:

/plugin/{plugin index}/{file path}

Where {plugin index} is the index of the plugin in the list of plugins and {file path} is the path to the file within the plugin directory.

For example /plugin/0/index.ts would serve the index.ts file from the first plugin directory.

- For testing purposes the list of directories can be hard coded. In the future they will be provided by the user.

- Plugins should be loaded as ES modules using dynamic imports.

- Since plugins are not bundled with the rest of the application there needs to be an API for plugins to access AdvantageScope functionality. Functionality will be provided through the global scope/window object. An npm package called plugin-api should be created which provides wrapper functions around the API and can be imported by plugins. These wrapper functions just call the underlying functions assigned to the window object.
