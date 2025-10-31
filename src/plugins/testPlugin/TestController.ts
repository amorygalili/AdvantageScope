// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import TabController from "../../hub/controllers/TabController";
import { getOrDefault } from "../../shared/log/LogUtil";
import LoggableType from "../../shared/log/LoggableType";
import { createUUID } from "../../shared/util";

export default class TestController implements TabController {
  UUID = createUUID();
  private ROOT: HTMLElement;
  private FIELD_INPUT: HTMLInputElement;

  constructor(root: HTMLElement) {
    this.ROOT = root;

    // Create a simple input field for selecting a log field
    this.ROOT.innerHTML = `
      <div style="padding: 10px;">
        <label>Field Name: </label>
        <input type="text" placeholder="/MyRobot/Field" style="width: 300px;" />
      </div>
    `;

    this.FIELD_INPUT = this.ROOT.querySelector("input")!;
  }

  saveState(): unknown {
    return {
      field: this.FIELD_INPUT.value
    };
  }

  restoreState(state: unknown): void {
    if (state && typeof state === "object" && "field" in state) {
      this.FIELD_INPUT.value = state.field as string;
    }
  }

  refresh(): void {
    // Called when log data changes
  }

  newAssets(): void {
    // Called when assets are updated
  }

  getActiveFields(): string[] {
    const field = this.FIELD_INPUT.value.trim();
    return field ? [field] : [];
  }

  showTimeline(): boolean {
    return true;
  }

  getCommand(): TestCommand {
    const time = window.selection.getRenderTime();
    if (time === null) {
      return { value: null, field: this.FIELD_INPUT.value };
    }

    const field = this.FIELD_INPUT.value.trim();
    if (!field) {
      return { value: null, field: "" };
    }

    // Try to get the value as a number
    const value = getOrDefault(window.log, field, LoggableType.Number, time, null, this.UUID);

    return {
      value: value,
      field: field
    };
  }
}

export type TestCommand = {
  value: number | null;
  field: string;
};
