// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { SourceListConfig } from "../../shared/SourceListConfig";

// This config is not used in the simple test plugin
// but is included as an example for future plugins that might use SourceList

const TestConfig: SourceListConfig = {
  title: "Test Sources",
  autoAdvance: false,
  allowChildrenFromDrag: false,
  types: [
    {
      key: "number",
      display: "Number",
      symbol: "num",
      showInTypeName: false,
      color: "#00ff00",
      sourceTypes: ["Number"],
      showDocs: true,
      options: []
    }
  ]
};

export default TestConfig;
