"use server"

/**
 * Simple logger utility for server-side logging
 */
export function log(...args: any[]): void {
  if (process.env.NODE_ENV === "development") {
    console.log(new Date().toISOString(), ...args)
  }
}

export function logError(...args: any[]): void {
  console.error(new Date().toISOString(), ...args)
}

export function logWarning(...args: any[]): void {
  console.warn(new Date().toISOString(), ...args)
}

export function logInfo(...args: any[]): void {
  if (process.env.NODE_ENV === "development") {
    console.info(new Date().toISOString(), ...args)
  }
}

export function logDebug(...args: any[]): void {
  if (process.env.NODE_ENV === "development" && process.env.DEBUG === "true") {
    console.debug(new Date().toISOString(), ...args)
  }
}
