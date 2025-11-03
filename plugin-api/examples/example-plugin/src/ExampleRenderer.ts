// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { TabRenderer } from "@advantagescope/plugin-api";
import { ExampleCommand } from "./ExampleController";

export default class ExampleRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private DISPLAY: HTMLElement;

  constructor(root: HTMLElement) {
    this.CONTAINER = root;

    this.CONTAINER.innerHTML = `
      <div style="padding: 20px; height: 100%; overflow-y: auto;">
        <div class="example-display"></div>
      </div>
    `;

    this.DISPLAY = this.CONTAINER.querySelector(".example-display")!;
  }

  saveState(): unknown {
    return null;
  }

  restoreState(state: unknown): void {}

  getAspectRatio(): number | null {
    return null;
  }

  render(command: unknown): void {
    const cmd = command as ExampleCommand;

    if (!cmd || cmd.sources.length === 0) {
      this.DISPLAY.innerHTML = `
        <div style="text-align: center; color: #888; font-size: 18px; margin-top: 50px;">
          No sources selected. Drag fields from the sidebar to add them.
        </div>
      `;
      return;
    }

    let tableHTML = `
      <table style="width: 100%; border-collapse: collapse; font-family: monospace;">
        <thead>
          <tr style="border-bottom: 2px solid var(--divider-color);">
            <th style="text-align: left; padding: 10px; color: var(--text-color);">Field</th>
            <th style="text-align: left; padding: 10px; color: var(--text-color);">Type</th>
            <th style="text-align: left; padding: 10px; color: var(--text-color);">Value</th>
          </tr>
        </thead>
        <tbody>
    `;

    cmd.sources.forEach((source) => {
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

      tableHTML += `
        <tr style="border-bottom: 1px solid var(--divider-color);">
          <td style="padding: 10px; color: var(--text-color); font-weight: bold;">${this.escapeHtml(source.logKey)}</td>
          <td style="padding: 10px; color: #888;">${source.type}</td>
          <td style="padding: 10px; color: ${valueColor};">${this.escapeHtml(displayValue)}</td>
        </tr>
      `;
    });

    tableHTML += `
        </tbody>
      </table>
    `;

    if (cmd.time !== null) {
      tableHTML += `
        <div style="margin-top: 20px; color: #888; font-size: 14px;">
          Time: ${cmd.time.toFixed(3)}s
        </div>
      `;
    }

    this.DISPLAY.innerHTML = tableHTML;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
