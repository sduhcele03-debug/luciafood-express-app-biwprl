
// Simplified error logging to prevent console warning loops

import { Platform } from "react-native";

// CRITICAL FIX: Disable error logging entirely to prevent console warnings
const ENABLE_ERROR_LOGGING = false;

// Simple debouncing to prevent duplicate errors
const recentErrors: { [key: string]: boolean } = {};
const clearErrorAfterDelay = (errorKey: string) => {
  setTimeout(() => delete recentErrors[errorKey], 5000);
};

// Function to send errors to parent window (React frontend)
const sendErrorToParent = (level: string, message: string, data: any) => {
  // CRITICAL FIX: Disable error sending to prevent console warnings
  if (!ENABLE_ERROR_LOGGING) {
    return;
  }

  // Create a more specific key to avoid false positives
  const errorKey = `${level}:${message.substring(0, 100)}`;

  // Skip if we've seen this exact error recently
  if (recentErrors[errorKey]) {
    return;
  }

  // Mark this error as seen and schedule cleanup
  recentErrors[errorKey] = true;
  clearErrorAfterDelay(errorKey);

  // Don't send any messages to prevent console warnings
};

// Function to extract meaningful source location from stack trace
const extractSourceLocation = (stack: string): string => {
  if (!stack) return '';

  // Look for various patterns in the stack trace
  const patterns = [
    // Pattern for app files: app/filename.tsx:line:column
    /at .+\/(app\/[^:)]+):(\d+):(\d+)/,
    // Pattern for components: components/filename.tsx:line:column
    /at .+\/(components\/[^:)]+):(\d+):(\d+)/,
    // Pattern for any .tsx/.ts files
    /at .+\/([^/]+\.tsx?):(\d+):(\d+)/,
    // Pattern for bundle files with source maps
    /at .+\/([^/]+\.bundle[^:]*):(\d+):(\d+)/,
    // Pattern for any JavaScript file
    /at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/
  ];

  for (const pattern of patterns) {
    const match = stack.match(pattern);
    if (match) {
      return ` | Source: ${match[1]}:${match[2]}:${match[3]}`;
    }
  }

  // If no specific pattern matches, try to find any file reference
  const fileMatch = stack.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+)/);
  if (fileMatch) {
    return ` | Source: ${fileMatch[1]}:${fileMatch[2]}`;
  }

  return '';
};

// Function to get caller information from stack trace
const getCallerInfo = (): string => {
  const stack = new Error().stack || '';
  const lines = stack.split('\n');

  // Skip the first few lines (Error, getCallerInfo, console override)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i];
    if (line.indexOf('app/') !== -1 || line.indexOf('components/') !== -1 || line.indexOf('.tsx') !== -1 || line.indexOf('.ts') !== -1) {
      const match = line.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/);
      if (match) {
        return ` | Called from: ${match[1]}:${match[2]}:${match[3]}`;
      }
    }
  }

  return '';
};

// CRITICAL FIX: Simplified error logging setup to prevent console warnings
export const setupErrorLogging = () => {
  console.log('🔧 Setting up simplified error logging...');

  // CRITICAL FIX: Disable all error logging to prevent console warnings
  if (!ENABLE_ERROR_LOGGING) {
    console.log('⏭️ Error logging disabled to prevent console warnings');
    return;
  }

  // The rest of the error logging setup is disabled
  console.log('✅ Error logging setup completed (disabled mode)');
};

// CRITICAL FIX: Simplified error logger function
export const errorLogger = (error: any, context?: string) => {
  // CRITICAL FIX: Disable manual error reporting to prevent console warnings
  if (!ENABLE_ERROR_LOGGING) {
    return;
  }
  
  // Manual error reporting is disabled
};

// CRITICAL FIX: Don't initialize error logging immediately to prevent loops
// It will be initialized from the main app layout

export default { setupErrorLogging, errorLogger };
