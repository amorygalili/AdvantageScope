// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

const PLUGIN_LIST = document.getElementById("pluginList") as HTMLElement;
const ADD_PLUGIN_BUTTON = document.getElementById("addPlugin") as HTMLButtonElement;
const RELOAD_BUTTON = document.getElementById("reload") as HTMLButtonElement;
const CLOSE_BUTTON = document.getElementById("close") as HTMLButtonElement;

interface PluginInfo {
  directory: string;
  name: string | null;
}

let messagePort: MessagePort | null = null;
let plugins: PluginInfo[] = [];
let hasChanges = false;

window.addEventListener("message", (event) => {
  if (event.data === "port") {
    messagePort = event.ports[0];
    messagePort.onmessage = (event) => {
      // Update button focus
      if (typeof event.data === "object" && "isFocused" in event.data) {
        Array.from(document.getElementsByTagName("button")).forEach((button) => {
          if (event.data.isFocused) {
            button.classList.remove("blurred");
          } else {
            button.classList.add("blurred");
          }
        });
        return;
      }

      // Handle plugin list update
      if (typeof event.data === "object" && "plugins" in event.data) {
        plugins = event.data.plugins;
        renderPluginList();
      }
    };

    // Request initial plugin list
    messagePort.postMessage({ action: "get-plugins" });
  }
});

function renderPluginList() {
  PLUGIN_LIST.innerHTML = "";

  if (plugins.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "plugin-list-empty";
    emptyMessage.textContent = "No plugins added. Click 'Add Plugin...' to get started.";
    PLUGIN_LIST.appendChild(emptyMessage);
    return;
  }

  plugins.forEach((plugin, index) => {
    const item = document.createElement("div");
    item.className = "plugin-item";

    const info = document.createElement("div");
    info.className = "plugin-info";

    const name = document.createElement("div");
    name.className = "plugin-name";
    name.textContent = plugin.name || "Unknown Plugin";
    info.appendChild(name);

    const directory = document.createElement("div");
    directory.className = "plugin-directory";
    directory.textContent = plugin.directory;
    info.appendChild(directory);

    item.appendChild(info);

    const removeButton = document.createElement("button");
    removeButton.className = "plugin-remove-button";
    removeButton.innerHTML = "×";
    removeButton.title = "Remove plugin";
    removeButton.addEventListener("click", () => {
      removePlugin(index);
    });
    item.appendChild(removeButton);

    PLUGIN_LIST.appendChild(item);
  });

  console.log("PLUGIN_LIST:", PLUGIN_LIST, PLUGIN_LIST.outerHTML);
}

function removePlugin(index: number) {
  if (messagePort) {
    messagePort.postMessage({ action: "remove-plugin", index: index });
    hasChanges = true;
  }
}

ADD_PLUGIN_BUTTON.addEventListener("click", () => {
  if (messagePort) {
    messagePort.postMessage({ action: "add-plugin" });
    hasChanges = true;
  }
});

RELOAD_BUTTON.addEventListener("click", () => {
  if (messagePort) {
    messagePort.postMessage({ action: "reload" });
  }
});

CLOSE_BUTTON.addEventListener("click", () => {
  if (messagePort) {
    messagePort.postMessage({ action: "close", hasChanges: hasChanges });
  }
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Escape") {
    if (messagePort) {
      messagePort.postMessage({ action: "close", hasChanges: hasChanges });
    }
  }
});
