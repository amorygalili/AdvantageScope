// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { TabRenderer } from "@advantagescope/plugin-api";
import { TestCommand } from "./TestController";

export default class TestRenderer implements TabRenderer {
  private CONTAINER: HTMLElement;
  private DISPLAY: HTMLElement;

  constructor(root: HTMLElement) {
    this.CONTAINER = root;

    // Create display element
    this.CONTAINER.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 48px; font-weight: bold;">
        <div class="test-display">No data</div>
      </div>
    `;

    this.DISPLAY = this.CONTAINER.querySelector(".test-display")!;
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
    const cmd = command as TestCommand;

    if (!cmd || !cmd.field) {
      this.DISPLAY.textContent = "No field selected";
      this.DISPLAY.style.color = "#888";
      return;
    }

    if (cmd.value === null) {
      this.DISPLAY.textContent = "No data";
      this.DISPLAY.style.color = "#888";
    } else {
      this.DISPLAY.textContent = cmd.value.toFixed(3);
      this.DISPLAY.style.color = "var(--text-color)";
    }
  }
}

