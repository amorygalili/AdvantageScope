# AdvantageScope Example Plugins

This directory contains example plugins for AdvantageScope that demonstrate how to create custom tab types.

## Directory Structure

- `test-plugin/` - A simple example plugin that displays a single numeric field value

## Creating a Plugin

Each plugin is a standalone TypeScript project that:

1. Installs `@advantagescope/plugin-api` as a dependency
2. Implements the `TabController` and `TabRenderer` interfaces
3. Builds to an ES module using a bundler (e.g., Rollup)
4. Exports a default object with `{ title, icon, controller, renderer }`

## Building Plugins

Each plugin has its own build system. To build a plugin:

```bash
cd test-plugin
npm install
npm run build
```

The built plugin will be in the plugin's `dist/` directory.

## Loading Plugins

Plugins are loaded by AdvantageScope through the plugin server. The path to the built plugin directory is passed to the `loadPlugins()` function in `src/hub/PluginLoader.ts`.

For development, the test plugin is automatically loaded from `example-plugins/test-plugin/dist`.

## Plugin Structure

A typical plugin project structure:

```
my-plugin/
├── src/
│   ├── index.ts          # Plugin entry point
│   ├── MyController.ts   # Controller implementation
│   └── MyRenderer.ts     # Renderer implementation
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── rollup.config.js      # Build configuration
└── README.md             # Plugin documentation
```

## API Documentation

See the `plugin-api` package README for full API documentation and examples.

