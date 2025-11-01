# AdvantageScope Plugin API

This package provides the API for developing AdvantageScope plugins.

## Installation

```bash
npm install @advantagescope/plugin-api
```

## Usage

### Creating a Plugin

A plugin consists of a controller and a renderer that implement the `TabController` and `TabRenderer` interfaces:

```typescript
import {
  Plugin,
  TabController,
  TabRenderer,
  getLog,
  getSelection,
  getOrDefault,
  LoggableType,
  createUUID
} from "@advantagescope/plugin-api";

// Controller - handles user input and produces commands
class MyController implements TabController {
  UUID = createUUID();

  saveState(): unknown {
    return {
      /* your state */
    };
  }

  restoreState(state: unknown): void {
    // Restore from state
  }

  refresh(): void {
    // Called when log data changes
  }

  newAssets(): void {
    // Called when assets are updated
  }

  getActiveFields(): string[] {
    return ["/MyRobot/Field"]; // Fields to load from log
  }

  showTimeline(): boolean {
    return true; // Show timeline for this tab
  }

  getCommand(): unknown {
    const time = getSelection().getRenderTime();
    const value = getOrDefault("/MyRobot/Speed", LoggableType.Number, time, 0.0, this.UUID);
    return { value };
  }
}

// Renderer - displays the visualization
class MyRenderer implements TabRenderer {
  constructor(private root: HTMLElement) {
    // Initialize your UI
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {
    // Restore renderer state
  }

  getAspectRatio(): number | null {
    return null; // Or return a specific ratio like 16/9
  }

  render(command: unknown): void {
    // Update your visualization based on the command
  }
}

// Export plugin - must match the Plugin interface
const myPlugin: Plugin = {
  title: "My Plugin",
  icon: "📊",
  controller: MyController,
  renderer: MyRenderer
};

export default myPlugin;
```

## API Reference

### Functions

- `getLog()` - Get the global log object
- `getSelection()` - Get the global selection object
- `getPreferences()` - Get current preferences
- `getAssets()` - Get current assets
- `getPlatform()` - Get platform information
- `getAppVersion()` - Get app version
- `getOrDefault(key, type, timestamp, defaultValue, uuid?)` - Get value with fallback
- `createUUID()` - Create a UUID for tracking

### Interfaces

- `Plugin` - Interface for the plugin module export (must be the default export)
- `TabController` - Interface for tab controllers
- `TabRenderer` - Interface for tab renderers
- `Log` - Log interface for accessing logged data
- `Selection` - Selection interface for time selection
- `Preferences` - User preferences interface
- `AdvantageScopeAssets` - Assets interface

### Enums

- `LoggableType` - Enum of log data types (Raw, Boolean, Number, String, BooleanArray, NumberArray, StringArray)
- `SelectionMode` - Enum of selection modes (Idle, Static, Playback, Locked)

### Source List Configuration Types

For controllers that use the SourceList component to manage field selections:

- `SourceListConfig` - Configuration for a source list
- `SourceListTypeConfig` - Configuration for a type in a source list
- `SourceListOptionConfig` - Configuration for an option
- `SourceListOptionValueConfig` - Configuration for an option value
- `SourceListState` - State of a source list (array of items)
- `SourceListItemState` - State of a single item
- `SourceListTypeMemory` - Memory of type selections for fields
- `SourceListTypeMemoryEntry` - Entry in the type memory

### Geometry Types

Standard geometry types for robotics:

- `Translation2d` - 2D translation in meters [x, y]
- `Rotation2d` - 2D rotation in radians
- `Pose2d` - 2D pose with translation and rotation
- `Transform2d` - 2D transform with translation and rotation
- `Translation3d` - 3D translation in meters [x, y, z]
- `Rotation3d` - 3D rotation as quaternion [w, x, y, z]
- `Pose3d` - 3D pose with translation and rotation
- `Transform3d` - 3D transform with translation and rotation

### Color Constants

Pre-defined color palettes:

- `GraphColors` - Standard graph colors (Blue, Gold, Red, Purple, Orange, Tan, Gray, Green, Pink, Brown)
- `NeonColors` - High-contrast neon colors (Green, Red, Blue, Orange, Cyan, Yellow, Magenta)

## License

BSD-3-Clause
