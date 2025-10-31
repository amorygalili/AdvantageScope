# AdvantageScope Plugin Architecture

This document describes the architecture of AdvantageScope's tab system and how to create custom views (tabs) that integrate with the application.

## Architecture Overview

AdvantageScope uses a **Model-View-Controller (MVC)** pattern where:

- **Model**: The `Log` object (`window.log`) contains all logged data from robot code
- **Controller**: `TabController` manages user inputs and prepares data commands
- **Renderer**: `TabRenderer` displays the visualization based on commands from the controller

### Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Hub (hub.ts)                         │
│  - Manages global state (window.log, window.preferences)    │
│  - Coordinates data sources (live/historical)               │
│  - Provides global access to Selection, Sidebar, Tabs       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Tabs Manager (Tabs.ts)                  │
│  - Creates and manages tab instances                         │
│  - Handles tab lifecycle (create, select, close)            │
│  - Coordinates rendering loop for all tabs                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         Individual Tab Instance          │
        │                                          │
        │  ┌────────────────────────────────────┐ │
        │  │   TabController (in src/hub/)      │ │
        │  │  - Manages UI controls             │ │
        │  │  - Reads from window.log           │ │
        │  │  - Produces render commands        │ │
        │  │  - Declares active fields          │ │
        │  └────────────────────────────────────┘ │
        │                  │                       │
        │                  ▼ (command)             │
        │  ┌────────────────────────────────────┐ │
        │  │  TabRenderer (in src/shared/)      │ │
        │  │  - Receives commands               │ │
        │  │  - Updates visualization           │ │
        │  │  - Platform-independent rendering  │ │
        │  └────────────────────────────────────┘ │
        └─────────────────────────────────────────┘
```

## Creating a New Tab View

To add a new tab type to AdvantageScope, you need to:

1. **Define the tab type** in `src/shared/TabType.ts`
2. **Create a controller** in `src/hub/controllers/`
3. **Create a renderer** in `src/shared/renderers/`
4. **Add HTML templates** in `www/hub.html`
5. **Register the tab** in `src/hub/Tabs.ts`
6. **Add menu integration** in `src/main/electron/main.ts` (for desktop) or `src/main/lite/main.ts` (for web)

### Step 1: Define Tab Type

Edit `src/shared/TabType.ts`:

```typescript
enum TabType {
  // ... existing types
  MyCustomView,  // Add your new type
}

export function getDefaultTabTitle(type: TabType): string {
  switch (type) {
    // ... existing cases
    case TabType.MyCustomView:
      return "My Custom View";
  }
}

export function getTabIcon(type: TabType): string {
  switch (type) {
    // ... existing cases
    case TabType.MyCustomView:
      return "🎨";  // Your icon
  }
}

export function getTabAccelerator(type: TabType): string {
  // ... existing cases
  case TabType.MyCustomView:
    return "Alt+X";  // Keyboard shortcut
}
```

### Step 2: Create Controller

Create `src/hub/controllers/MyCustomViewController.ts`:

```typescript
import { createUUID } from "../../shared/util";
import TabController from "./TabController";

export default class MyCustomViewController implements TabController {
  UUID = createUUID();

  // Reference to HTML elements for controls
  private ROOT: HTMLElement;

  constructor(root: HTMLElement) {
    this.ROOT = root;
    // Initialize UI controls, add event listeners
  }

  /** Save current state for persistence */
  saveState(): unknown {
    return {
      // Return serializable state
    };
  }

  /** Restore from saved state */
  restoreState(state: unknown): void {
    // Restore UI from state
  }

  /** Called when log data changes */
  refresh(): void {
    // Update UI based on new log data
  }

  /** Called when assets (fields, robots, etc.) are updated */
  newAssets(): void {
    // Update if your view uses assets
  }

  /** Return list of log fields this view needs */
  getActiveFields(): string[] {
    return ["/MyRobot/Subsystem/Field1", "/MyRobot/Subsystem/Field2"];
  }

  /** Whether to show the timeline scrubber */
  showTimeline(): boolean {
    return true; // or false if your view doesn't need timeline
  }

  /** Generate command for renderer */
  getCommand(): MyCustomViewCommand {
    // Read data from window.log
    // Process and return command object
    return {
      // Data for renderer
    };
  }
}

export type MyCustomViewCommand = {
  // Define your command structure
};
```

### Step 3: Create Renderer

Create `src/shared/renderers/MyCustomViewRenderer.ts`:

```typescript
import TabRenderer from "./TabRenderer";

export default class MyCustomViewRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;

  constructor(root: HTMLElement) {
    this.CONTAINER = root;
    // Initialize rendering elements
  }

  /** Save renderer state */
  saveState(): unknown {
    return null; // or return state if needed
  }

  /** Restore renderer state */
  restoreState(state: unknown): void {
    // Restore if needed
  }

  /** Return aspect ratio for popup windows (or null) */
  getAspectRatio(): number | null {
    return 16 / 9; // or null for no constraint
  }

  /** Called every frame with command from controller */
  render(command: unknown): void {
    // Type-check and render
    // Update DOM, canvas, WebGL, etc.
  }
}
```

### Step 4: Add HTML Templates

Edit `www/hub.html` to add templates for your controller and renderer.

Add the **controller template** inside the `<span id="controllerTemplates" hidden>` element:

```html
<span id="controllerTemplates" hidden>
  <!-- ... existing controller templates ... -->

  <!-- Your new controller template -->
  <div id="controllerMyCustomView" hidden>
    <div class="my-custom-controls">
      <!-- Add your control elements here -->
      <input type="text" placeholder="Field name" />
      <select class="my-dropdown">
        <option>Option 1</option>
      </select>
    </div>
  </div>
</span>
```

Add the **renderer template** inside the `<span id="rendererTemplates" hidden>` element:

```html
<span id="rendererTemplates" hidden>
  <!-- ... existing renderer templates ... -->

  <!-- Your new renderer template -->
  <div id="rendererMyCustomView" hidden>
    <div class="my-custom-renderer">
      <!-- Add your rendering elements here -->
      <canvas></canvas>
      <div class="display"></div>
    </div>
  </div>
</span>
```

**Important**: The IDs must follow the pattern `controller{TabType}` and `renderer{TabType}` where `{TabType}` matches the exact name of your enum value (e.g., if your enum is `TabType.MyCustomView`, the IDs should be `controllerMyCustomView` and `rendererMyCustomView`).

### Step 5: Register in Tabs Manager

Edit `src/hub/Tabs.ts` in the `add()` method's switch statement:

```typescript
switch (type) {
  // ... existing cases
  case TabType.MyCustomView:
    controller = new MyCustomViewController(controlsElement);
    renderer = new MyCustomViewRenderer(rendererElement);
    break;
}
```

Also add imports at the top:

```typescript
import MyCustomViewController from "./controllers/MyCustomViewController";
import MyCustomViewRenderer from "../shared/renderers/MyCustomViewRenderer";
```

And set the fixed control height in the constructor:

```typescript
constructor() {
  // ... existing code
  this.FIXED_CONTROL_HEIGHTS.set(TabType.MyCustomView, 100); // or undefined for flexible
}
```

### Step 6: Add Menu Integration

For desktop (Electron), edit `src/main/electron/main.ts` - the tab will be automatically added to the menu via `getAllTabTypes()`.

For web (Lite), edit `src/main/lite/main.ts` and add to `LITE_COMPATIBLE_TABS` in `src/shared/TabType.ts` if your tab should work in the web version.

## Connecting to Source Data

### Accessing the Log

The global `window.log` object provides access to all logged data. It's an instance of the `Log` class from `src/shared/log/Log.ts`.

#### Reading Data from Log

```typescript
// Get the current selected/render time
const time = window.selection.getRenderTime();
if (time === null) return;

// Read a number field at a specific time
const numberData = window.log.getNumber("/MyRobot/Speed", time, time, this.UUID);
if (numberData && numberData.timestamps[0] <= time) {
  const speed = numberData.values[0];
}

// Read a range of data (e.g., for graphing)
const rangeData = window.log.getNumber("/MyRobot/Speed", startTime, endTime);
if (rangeData) {
  rangeData.timestamps.forEach((timestamp, index) => {
    const value = rangeData.values[index];
    // Process each value
  });
}

// Read different data types
const boolData = window.log.getBoolean("/MyRobot/Enabled", time, time);
const stringData = window.log.getString("/MyRobot/State", time, time);
const arrayData = window.log.getNumberArray("/MyRobot/Pose", time, time);

// Get all available field keys
const allFields = window.log.getFieldKeys();

// Get field type
const fieldType = window.log.getType("/MyRobot/Speed");
// Returns: LoggableType.Number, LoggableType.Boolean, etc.

// Get time range of entire log
const [startTime, endTime] = window.log.getTimestampRange();
```

#### Helper Functions

Use utility functions from `src/shared/log/LogUtil.ts`:

```typescript
import { getOrDefault } from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";

// Get value with fallback
const speed = getOrDefault(
  window.log,
  "/MyRobot/Speed",
  LoggableType.Number,
  time,
  0.0, // default value
  this.UUID
);
```

### Declaring Active Fields

The `getActiveFields()` method tells the system which fields your tab needs. This is important for:

- **Live mode**: Only subscribed fields are requested from the robot
- **Performance**: Helps optimize data loading

```typescript
getActiveFields(): string[] {
  // Return exact field names
  return ["/MyRobot/Subsystem/Field1"];

  // Or return prefixes (all fields starting with this will be loaded)
  return ["/MyRobot/Subsystem/"];

  // Can be dynamic based on user selection
  const selectedField = this.getSelectedFieldFromUI();
  return [selectedField];
}
```

### Using SourceList for Field Selection

Many tabs use `SourceList` to let users drag-and-drop fields from the sidebar. See `src/hub/controllers/StatisticsController.ts` for a complete example:

```typescript
import SourceList from "../SourceList";
import { SourceListState } from "../../shared/SourceListConfig";
import MyConfig from "./MyCustomViewController_Config";

export default class MyCustomViewController implements TabController {
  private sourceList: SourceList;

  constructor(root: HTMLElement) {
    this.sourceList = new SourceList(
      root.firstElementChild as HTMLElement,
      MyConfig, // Configuration object
      [] // Supplemental state suppliers
    );
  }

  getActiveFields(): string[] {
    return this.sourceList.getActiveFields();
  }

  saveState(): unknown {
    return this.sourceList.getState();
  }

  restoreState(state: unknown): void {
    this.sourceList.setState(state as SourceListState);
  }

  refresh(): void {
    this.sourceList.refresh();
  }
}
```

Create a config file `src/hub/controllers/MyCustomViewController_Config.ts`:

```typescript
import { SourceListConfig } from "../../shared/SourceListConfig";

const MyConfig: SourceListConfig = {
  title: "Sources",
  types: [
    {
      key: "number",
      display: "Number",
      symbol: "num",
      color: "#00ff00",
      logTypes: ["Number"]
    }
  ]
};

export default MyConfig;
```

## Accessing Preferences and App Resources

### Preferences

Access user preferences via `window.preferences`:

```typescript
// Check if preferences are loaded
if (window.preferences) {
  // Access preference values
  const theme = window.preferences.theme; // "light" | "dark" | "system"
  const robotAddress = window.preferences.robotAddress;
  const tbaApiKey = window.preferences.tbaApiKey;
  const coordinateSystem = window.preferences.coordinateSystem;

  // See src/shared/Preferences.ts for all available preferences
}
```

Available preferences include:

- `theme`: UI theme setting
- `robotAddress`: Default robot IP address
- `liveMode`: Live data source mode ("nt4", "phoenix", "rlog", etc.)
- `coordinateSystem`: Field coordinate system
- `field3dModeAc`: 3D rendering quality
- `tbaApiKey`: The Blue Alliance API key
- `userAssetsFolder`: Custom assets folder path

### Assets

Access field images, 3D models, and joystick configurations via `window.assets`:

```typescript
if (window.assets) {
  // 2D field images
  const field2ds = window.assets.field2ds;
  field2ds.forEach(field => {
    console.log(field.name, field.path, field.coordinateSystem);
  });

  // 3D field models
  const field3ds = window.assets.field3ds;

  // Robot models
  const robots = window.assets.robots;

  // Joystick configurations
  const joysticks = window.assets.joysticks;

  // Asset loading failures
  const failures = window.assets.loadFailures;
}

// React to asset updates
newAssets(): void {
  // Called when assets are reloaded
  // Update your UI to reflect new assets
}
```

See `src/shared/AdvantageScopeAssets.ts` for asset type definitions.

### Selection and Timeline

Access the current time selection and playback state:

```typescript
// Get current render time (respects playback/locked/idle modes)
const time = window.selection.getRenderTime();

// Get selected time
const selectedTime = window.selection.getSelectedTime();

// Get hovered time (when user hovers over timeline)
const hoveredTime = window.selection.getHoveredTime();

// Get timeline visible range
const [rangeStart, rangeEnd] = window.selection.getTimelineRange();

// Check if connected to live data
const liveTime = window.selection.getCurrentLiveTime();
const isLive = liveTime !== null;

// Get current mode
const mode = window.selection.getMode();
// Returns: SelectionMode.Idle, SelectionMode.Playback, SelectionMode.Locked
```

### Other Global Resources

```typescript
// Platform information
const platform = window.platform; // "win32", "darwin", "linux", "lite"
const appVersion = window.appVersion;

// Send messages to main process (Electron only)
window.sendMainMessage("message-name", { data: "value" });

// Access sidebar
window.sidebar.refresh();

// Access tabs manager
window.tabs.refresh();
```

## Best Practices

### Performance

1. **Throttle expensive operations**: Use a timer to limit how often you recalculate data

   ```typescript
   private UPDATE_PERIOD_MS = 100;
   private lastUpdateTime = 0;

   getCommand(): MyCommand {
     const currentTime = new Date().getTime();
     if (currentTime - this.lastUpdateTime < this.UPDATE_PERIOD_MS) {
       return this.cachedCommand;  // Return cached result
     }
     this.lastUpdateTime = currentTime;
     // Perform expensive calculation
   }
   ```

2. **Cache results**: Store processed data and only recalculate when inputs change

   ```typescript
   private lastSourceStr = "";
   private cachedCommand: MyCommand;

   getCommand(): MyCommand {
     const sourcesStr = JSON.stringify(this.sourceList.getState());
     if (sourcesStr === this.lastSourceStr) {
       return this.cachedCommand;
     }
     this.lastSourceStr = sourcesStr;
     // Recalculate
   }
   ```

3. **Use UUIDs for caching**: Pass your controller's UUID to log methods for better caching
   ```typescript
   window.log.getNumber(key, time, time, this.UUID);
   ```

### State Management

1. **Save all user settings**: Include everything needed to restore the tab's state

   ```typescript
   saveState(): unknown {
     return {
       sources: this.sourceList.getState(),
       selectedOption: this.dropdown.value,
       customSettings: this.customValue
     };
   }
   ```

2. **Handle missing state gracefully**: Always check if state exists and has expected properties

   ```typescript
   restoreState(state: unknown): void {
     if (typeof state !== "object" || state === null) return;

     if ("sources" in state) {
       this.sourceList.setState(state.sources as SourceListState);
     }
     if ("selectedOption" in state && typeof state.selectedOption === "string") {
       this.dropdown.value = state.selectedOption;
     }
   }
   ```

### Rendering

1. **Separate controller and renderer logic**: Controllers should prepare data, renderers should only display it

   - ✅ Good: Controller reads log, processes data, creates command object
   - ❌ Bad: Renderer directly accesses window.log

2. **Make renderers platform-independent**: Renderers are in `src/shared/` and should work in both Electron and web environments

   - ✅ Good: Use standard DOM/Canvas/WebGL APIs
   - ❌ Bad: Use Node.js or Electron-specific APIs

3. **Handle null/undefined gracefully**: Always check if data exists before rendering
   ```typescript
   render(command: unknown): void {
     if (!command || typeof command !== "object") return;
     // Type check and render
   }
   ```

### Timeline Integration

1. **Respect timeline visibility**: Only show timeline if your view uses time-based data

   ```typescript
   showTimeline(): boolean {
     return true;  // Show for time-series data
     return false; // Hide for static views (like metadata)
   }
   ```

2. **Use appropriate time source**: Choose the right time based on your needs

   ```typescript
   // For single-frame views (most common)
   const time = window.selection.getRenderTime();

   // For range-based views
   const [start, end] = window.selection.getTimelineRange();
   ```

## Example: Complete Minimal Tab

Here's a complete minimal example that displays a single number:

**src/hub/controllers/SimpleNumberController.ts:**

```typescript
import { createUUID } from "../../shared/util";
import TabController from "./TabController";

export default class SimpleNumberController implements TabController {
  UUID = createUUID();
  private FIELD_INPUT: HTMLInputElement;

  constructor(root: HTMLElement) {
    this.FIELD_INPUT = root.querySelector("input")!;
  }

  saveState() {
    return { field: this.FIELD_INPUT.value };
  }

  restoreState(state: unknown) {
    if (state && typeof state === "object" && "field" in state) {
      this.FIELD_INPUT.value = state.field as string;
    }
  }

  refresh() {}
  newAssets() {}

  getActiveFields(): string[] {
    return [this.FIELD_INPUT.value];
  }

  showTimeline(): boolean {
    return true;
  }

  getCommand(): SimpleNumberCommand {
    const time = window.selection.getRenderTime();
    if (time === null) return { value: null };

    const data = window.log.getNumber(this.FIELD_INPUT.value, time, time, this.UUID);
    if (data && data.timestamps[0] <= time) {
      return { value: data.values[0] };
    }
    return { value: null };
  }
}

export type SimpleNumberCommand = {
  value: number | null;
};
```

**src/shared/renderers/SimpleNumberRenderer.ts:**

```typescript
import TabRenderer from "./TabRenderer";
import { SimpleNumberCommand } from "../../hub/controllers/SimpleNumberController";

export default class SimpleNumberRenderer implements TabRenderer {
  private DISPLAY: HTMLElement;

  constructor(root: HTMLElement) {
    this.DISPLAY = root.querySelector(".display")!;
  }

  saveState() {
    return null;
  }
  restoreState() {}
  getAspectRatio() {
    return null;
  }

  render(command: unknown): void {
    const cmd = command as SimpleNumberCommand;
    if (cmd.value === null) {
      this.DISPLAY.textContent = "No data";
    } else {
      this.DISPLAY.textContent = cmd.value.toFixed(3);
    }
  }
}
```

## Reference Documentation

### Official Documentation

- **User Documentation**: https://docs.advantagescope.org

  - Tab reference guides for all built-in tabs
  - Data format specifications
  - Custom assets guide

- **GitHub Repository**: https://github.com/Mechanical-Advantage/AdvantageScope
  - Source code
  - Issue tracker
  - Release notes

### Key Source Files to Study

#### Core Architecture

- `src/hub/hub.ts` - Main hub initialization and global state
- `src/hub/Tabs.ts` - Tab management and lifecycle
- `src/shared/log/Log.ts` - Log data access API
- `src/shared/Selection.ts` - Time selection and playback

#### Controller Examples

- `src/hub/controllers/StatisticsController.ts` - Complex data processing with SourceList
- `src/hub/controllers/VideoController.ts` - External resource loading
- `src/hub/controllers/MetadataController.ts` - Simple read-only view
- `src/hub/controllers/LineGraphController.ts` - Time-series visualization

#### Renderer Examples

- `src/shared/renderers/StatisticsRenderer.ts` - Chart.js integration
- `src/shared/renderers/Field2dRenderer.ts` - Canvas rendering
- `src/shared/renderers/Field3dRenderer.ts` - Three.js/WebGL rendering
- `src/shared/renderers/TableRenderer.ts` - Dynamic DOM updates

#### Utilities

- `src/shared/log/LogUtil.ts` - Helper functions for reading log data
- `src/shared/geometry.ts` - Geometry types and transformations
- `src/shared/units.ts` - Unit conversions
- `src/shared/Colors.ts` - Color utilities and theme support
- `src/hub/SourceList.ts` - Drag-and-drop field selection component

### Type Definitions

Key TypeScript interfaces and types:

- `TabController` - Controller interface (`src/hub/controllers/TabController.ts`)
- `TabRenderer` - Renderer interface (`src/shared/renderers/TabRenderer.ts`)
- `Log` - Log data access (`src/shared/log/Log.ts`)
- `LoggableType` - Data type enum (`src/shared/log/LoggableType.ts`)
- `Preferences` - User preferences (`src/shared/Preferences.ts`)
- `AdvantageScopeAssets` - Asset types (`src/shared/AdvantageScopeAssets.ts`)
- `Selection` - Time selection (`src/shared/Selection.ts`)
- `SourceListConfig` - Field selection config (`src/shared/SourceListConfig.ts`)

### Building and Testing

```bash
# Install dependencies
npm install

# Build for development (with watch mode)
npm run watch

# Build for production
npm run build

# Run Electron app
npm start

# Run web version (lite)
npm run lite
```

### Getting Help

- **Issues**: Report bugs or request features at https://github.com/Mechanical-Advantage/AdvantageScope/issues
- **Discussions**: Ask questions at https://github.com/Mechanical-Advantage/AdvantageScope/discussions
- **Chief Delphi**: FRC community forum at https://www.chiefdelphi.com

## Notes

- **Platform Support**: Controllers run only in the hub (Electron/browser main context), while renderers must work in all contexts including satellite windows and XR
- **Coordinate Systems**: Be aware of different coordinate systems for field views (see `src/shared/AdvantageScopeAssets.ts`)
- **Live vs Historical**: Your tab should work with both live data sources and historical log files
- **State Persistence**: Tab state is saved automatically when the app closes and restored on launch
- **Satellite Windows**: Tabs can be popped out to separate windows - renderers must handle this gracefully
