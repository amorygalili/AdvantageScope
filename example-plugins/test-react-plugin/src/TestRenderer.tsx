// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { TabRenderer } from "@advantagescope/plugin-api";
import React from "react";
import { createRoot, Root } from "react-dom/client";
import { TestCommand, SourceData } from "./TestController";

// React component for displaying the test data
interface TestDisplayProps {
  command: TestCommand;
}

const TestDisplay: React.FC<TestDisplayProps> = ({ command }) => {
  if (!command || command.sources.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#888", fontSize: "18px", marginTop: "50px" }}>
        No sources selected. Drag fields from the sidebar to add them.
      </div>
    );
  }

  return (
    <>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--divider-color)" }}>
            <th style={{ textAlign: "left", padding: "10px", color: "var(--text-color)" }}>Field</th>
            <th style={{ textAlign: "left", padding: "10px", color: "var(--text-color)" }}>Type</th>
            <th style={{ textAlign: "left", padding: "10px", color: "var(--text-color)" }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {command.sources.map((source, index) => (
            <SourceRow key={index} source={source} />
          ))}
        </tbody>
      </table>
      {command.time !== null && (
        <div style={{ marginTop: "20px", color: "#888", fontSize: "14px" }}>
          Time: {command.time.toFixed(3)}s
        </div>
      )}
    </>
  );
};

// React component for a single source row
interface SourceRowProps {
  source: SourceData;
}

const SourceRow: React.FC<SourceRowProps> = ({ source }) => {
  let displayValue = "null";
  let valueColor = "#888";

  if (source.value !== null && source.value !== undefined) {
    valueColor = "var(--text-color)";

    if (source.type === "number") {
      displayValue = typeof source.value === "number" ? source.value.toFixed(3) : String(source.value);
    } else if (source.type === "boolean") {
      displayValue = source.value ? "true" : "false";
      valueColor = source.value ? "#42f554" : "#f54242";
    } else {
      displayValue = String(source.value);
    }
  }

  return (
    <tr style={{ borderBottom: "1px solid var(--divider-color)" }}>
      <td style={{ padding: "10px", color: "var(--text-color)", fontWeight: "bold" }}>{source.logKey}</td>
      <td style={{ padding: "10px", color: "#888" }}>{source.type}</td>
      <td style={{ padding: "10px", color: valueColor }}>{displayValue}</td>
    </tr>
  );
};

export default class TestRenderer implements TabRenderer {
  private root: Root;
  private currentCommand: TestCommand = { sources: [], time: null };

  constructor(rootElement: HTMLElement) {
    // Create container for React app
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.height = "100%";
    container.style.overflowY = "auto";
    rootElement.appendChild(container);

    // Create React root
    this.root = createRoot(container);
    this.renderComponent();
  }

  private renderComponent(): void {
    this.root.render(<TestDisplay command={this.currentCommand} />);
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {
    // No state to restore
  }

  getAspectRatio(): number | null {
    return null; // No fixed aspect ratio
  }

  render(command: unknown): void {
    this.currentCommand = command as TestCommand;
    this.renderComponent();
  }
}

