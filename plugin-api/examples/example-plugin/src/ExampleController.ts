// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import {
  createSourceList,
  createUUID,
  getOrDefault,
  getSelection,
  LoggableType,
  SourceList,
  SourceListConfig,
  SourceListState,
  TabController
} from "@advantagescope/plugin-api";

const ExamplePluginConfig: SourceListConfig = {
  title: "Example Sources",
  autoAdvance: false,
  allowChildrenFromDrag: false,
  types: [
    {
      key: "number",
      display: "Number",
      symbol: "number",
      showInTypeName: false,
      color: "#4287f5",
      sourceTypes: ["Number"],
      showDocs: true,
      options: []
    },
    {
      key: "string",
      display: "String",
      symbol: "textformat",
      showInTypeName: false,
      color: "#42f554",
      sourceTypes: ["String"],
      showDocs: true,
      options: []
    },
    {
      key: "boolean",
      display: "Boolean",
      symbol: "checkmark.circle.fill",
      showInTypeName: false,
      color: "#f5a442",
      sourceTypes: ["Boolean"],
      showDocs: true,
      options: []
    }
  ]
};

export default class ExampleController implements TabController {
  UUID = createUUID();
  private ROOT: HTMLElement;
  private sourceList: SourceList;

  constructor(root: HTMLElement) {
    this.ROOT = root;

    const sourceListContainer = document.createElement("div");
    sourceListContainer.style.width = "100%";
    sourceListContainer.style.height = "100%";
    sourceListContainer.style.boxSizing = "border-box";
    sourceListContainer.style.overflow = "hidden";

    this.ROOT.appendChild(sourceListContainer);

    this.sourceList = createSourceList(sourceListContainer, ExamplePluginConfig, []);

    const clearButton = sourceListContainer.querySelector(".clear") as HTMLElement;
    if (clearButton) {
      clearButton.style.right = "25px";
    }

    const helpButton = sourceListContainer.querySelector(".help") as HTMLElement;
    if (helpButton) {
      helpButton.style.right = "50px";
    }

    const listElement = sourceListContainer.querySelector(".list") as HTMLElement;
    if (listElement) {
      listElement.style.bottom = "10px";
    }
  }

  saveState(): unknown {
    return this.sourceList.getState();
  }

  restoreState(state: unknown): void {
    if (state) {
      this.sourceList.setState(state as SourceListState);
    }
  }

  refresh(): void {
    this.sourceList.refresh();
  }

  newAssets(): void {}

  getActiveFields(): string[] {
    return this.sourceList.getActiveFields();
  }

  showTimeline(): boolean {
    return true;
  }

  getCommand(): ExampleCommand {
    const time = getSelection().getRenderTime();
    if (time === null) {
      return { sources: [], time: null };
    }

    const state = this.sourceList.getState(true);
    const sources: SourceData[] = state.map((item) => {
      let value: any = null;

      switch (item.type) {
        case "number":
          value = getOrDefault(item.logKey, LoggableType.Number, time, null, this.UUID);
          break;
        case "string":
          value = getOrDefault(item.logKey, LoggableType.String, time, null, this.UUID);
          break;
        case "boolean":
          value = getOrDefault(item.logKey, LoggableType.Boolean, time, null, this.UUID);
          break;
      }

      return {
        logKey: item.logKey,
        type: item.type,
        value: value
      };
    });

    return {
      sources: sources,
      time: time
    };
  }
}

export type SourceData = {
  logKey: string;
  type: string;
  value: any;
};

export type ExampleCommand = {
  sources: SourceData[];
  time: number | null;
};
