# Test React Plugin for AdvantageScope

This is an example React-based plugin for AdvantageScope that demonstrates how to create a custom tab type using React components.

## Features

- Uses React for UI rendering instead of vanilla DOM manipulation
- Field selector to choose multiple log fields
- Displays current values of selected fields in a table
- Demonstrates the controller/renderer pattern with React
- Uses the `@advantagescope/plugin-api` package
- Same functionality as the vanilla `test-plugin` but implemented with React

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

This plugin is structured as a standalone TypeScript project with React:

- `src/TestController.ts` - Handles user input and produces commands (same as vanilla version)
- `src/TestRenderer.tsx` - Renders the visualization using React components
- `src/index.ts` - Plugin entry point
- `rollup.config.js` - Build configuration with React support
- `tsconfig.json` - TypeScript configuration with JSX support

The plugin uses Rollup to bundle all code (including React) into a single ES module that can be dynamically imported by AdvantageScope.

## Key Differences from Vanilla Plugin

1. **React Components**: The renderer uses React functional components (`TestDisplay` and `SourceRow`) instead of manually manipulating the DOM with `innerHTML`.

2. **State Management**: React's component state and props are used to manage the UI state, making the code more declarative.

3. **Build Configuration**: The Rollup config includes additional plugins for React (`@rollup/plugin-commonjs` and `@rollup/plugin-replace`).

4. **TypeScript Config**: The `tsconfig.json` includes `"jsx": "react"` to enable JSX syntax.

5. **Dependencies**: Includes `react` and `react-dom` as dependencies, along with their type definitions.

## React Integration

The `TestRenderer` class:
- Creates a React root using `createRoot()` from `react-dom/client`
- Renders React components into the provided HTML element
- Updates the React component tree when `render()` is called with new commands
- Demonstrates how to integrate React into the AdvantageScope plugin architecture

