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
