// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import { Plugin } from "@advantagescope/plugin-api";
import ExampleController from "./ExampleController";
import ExampleRenderer from "./ExampleRenderer";

const examplePlugin: Plugin = {
  title: "Example Plugin",
  icon: "🧪",
  controller: ExampleController,
  renderer: ExampleRenderer
};

export default examplePlugin;
