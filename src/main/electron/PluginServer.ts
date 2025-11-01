// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

import fs from "fs";
import http from "http";
import path from "path";
import { PLUGIN_SERVER_PORT } from "./ElectronConstants";

export namespace PluginServer {
  let httpServer: http.Server | null = null;
  let pluginDirectories: string[] = [];

  /**
   * Set the list of plugin directories to serve
   * @param directories Array of absolute paths to plugin directories
   */
  export function setPluginDirectories(directories: string[]) {
    pluginDirectories = directories;
    console.log("Plugin directories set:", pluginDirectories);
  }

  /**
   * Get the list of plugin directories
   */
  export function getPluginDirectories(): string[] {
    return pluginDirectories;
  }

  /**
   * Start the plugin server
   */
  export function start() {
    if (httpServer !== null) {
      console.warn("Plugin server already running");
      return;
    }

    // Create HTTP server
    httpServer = http
      .createServer(async (request, response) => {
        if (request.url !== undefined) {
          let url: URL;
          try {
            url = new URL("http://localhost" + request.url);
          } catch {
            response.writeHead(400, { "Content-Type": "text/plain" });
            response.end("Bad request");
            return;
          }

          // Handle plugin file requests: /plugin/{index}/{path}
          const pathMatch = url.pathname.match(/^\/plugin\/(\d+)\/(.+)$/);
          if (pathMatch) {
            const pluginIndex = parseInt(pathMatch[1], 10);
            const filePath = pathMatch[2];

            // Validate plugin index
            if (pluginIndex < 0 || pluginIndex >= pluginDirectories.length) {
              response.writeHead(404, { "Content-Type": "text/plain" });
              response.end("Plugin not found");
              return;
            }

            // Security: prevent directory traversal
            if (filePath.includes("..") || filePath.includes("\\")) {
              response.writeHead(400, { "Content-Type": "text/plain" });
              response.end("Invalid file path");
              return;
            }

            const pluginDir = pluginDirectories[pluginIndex];
            const fullPath = path.join(pluginDir, filePath);

            // Verify the resolved path is still within the plugin directory
            const resolvedPath = path.resolve(fullPath);
            const resolvedPluginDir = path.resolve(pluginDir);
            if (!resolvedPath.startsWith(resolvedPluginDir)) {
              response.writeHead(400, { "Content-Type": "text/plain" });
              response.end("Invalid file path");
              return;
            }

            // Read and serve the file
            try {
              const fileContent = fs.readFileSync(resolvedPath);
              const contentType = getContentType(filePath);
              response.writeHead(200, { 
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*"
              });
              response.end(fileContent);
              return;
            } catch (error) {
              console.error("Error reading plugin file:", error);
              response.writeHead(404, { "Content-Type": "text/plain" });
              response.end("File not found");
              return;
            }
          }

          // Handle health check
          if (url.pathname === "/health") {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ 
              status: "ok", 
              pluginCount: pluginDirectories.length 
            }));
            return;
          }

          response.writeHead(404, { "Content-Type": "text/plain" });
          response.end("Not found");
        }
      })
      .listen(PLUGIN_SERVER_PORT);

    console.log(`Plugin server started on port ${PLUGIN_SERVER_PORT}`);
  }

  /**
   * Stop the plugin server
   */
  export function stop() {
    if (httpServer) {
      httpServer.close();
      httpServer = null;
      console.log("Plugin server stopped");
    }
  }

  /**
   * Get the content type for a file based on its extension
   */
  function getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      ".js": "application/javascript",
      ".mjs": "application/javascript",
      ".ts": "application/typescript",
      ".json": "application/json",
      ".html": "text/html",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".eot": "application/vnd.ms-fontobject"
    };
    return contentTypes[ext] || "application/octet-stream";
  }
}

