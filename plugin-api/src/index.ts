// Copyright (c) 2021-2025 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

/**
 * AdvantageScope Plugin API
 *
 * This package provides wrapper functions around the AdvantageScope API
 * that is exposed through the global window object. Plugins should use
 * these functions instead of directly accessing window properties.
 */

// Re-export types
export * from "./types";

// Import types
import type { AdvantageScopeAssets, Log, LoggableType, Preferences, Selection } from "./types";

/**
 * Get the global log object
 */
export function getLog(): Log {
  if (!(window as any).log) {
    throw new Error("AdvantageScope log API not available");
  }
  return (window as any).log;
}

/**
 * Get the global selection object
 */
export function getSelection(): Selection {
  if (!(window as any).selection) {
    throw new Error("AdvantageScope selection API not available");
  }
  return (window as any).selection;
}

/**
 * Get the current preferences
 */
export function getPreferences(): Preferences | null {
  return (window as any).preferences || null;
}

/**
 * Get the current assets
 */
export function getAssets(): AdvantageScopeAssets | null {
  return (window as any).assets || null;
}

/**
 * Get platform information
 */
export function getPlatform(): string {
  return (window as any).platform || "unknown";
}

/**
 * Get app version
 */
export function getAppVersion(): string {
  return (window as any).appVersion || "unknown";
}

/**
 * Get or default helper function
 * Retrieves a value from the log with a fallback default value
 */
export function getOrDefault(
  key: string,
  type: LoggableType,
  timestamp: number,
  defaultValue: any,
  uuid?: string
): any {
  const getOrDefaultFn = (window as any).getOrDefault;
  const log = getLog();
  if (!getOrDefaultFn) {
    throw new Error("AdvantageScope getOrDefault API not available");
  }
  return getOrDefaultFn(log, key, type, timestamp, defaultValue, uuid);
}

/**
 * Create a UUID for tracking purposes
 */
export function createUUID(): string {
  const createUUIDFn = (window as any).createUUID;
  if (!createUUIDFn) {
    throw new Error("AdvantageScope createUUID API not available");
  }
  return createUUIDFn();
}
