# Test Plugin for AdvantageScope

This is an example plugin for AdvantageScope that demonstrates how to create a custom tab type.

## Features

- Simple field selector to choose a log field
- Displays the current value of the selected field as a large number
- Demonstrates the controller/renderer pattern
- Uses the `@advantagescope/plugin-api` package

## Building

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode for development
npm run watch
```

The built plugin will be in the `dist/` directory.

## Using the Plugin

After building, the plugin can be loaded by AdvantageScope by passing the path to the `dist` directory to the plugin loader.

## Development

This plugin is structured as a standalone TypeScript project:

- `src/TestController.ts` - Handles user input and produces commands
- `src/TestRenderer.ts` - Renders the visualization
- `src/index.ts` - Plugin entry point
- `rollup.config.js` - Build configuration
- `tsconfig.json` - TypeScript configuration

The plugin uses Rollup to bundle all code into a single ES module that can be dynamically imported by AdvantageScope.

