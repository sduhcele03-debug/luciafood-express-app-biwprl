
// Enhanced global error logging for runtime errors

import { Platform } from "react-native";

// Simple debouncing to prevent duplicate errors
const recentErrors: { [key: string]: boolean } = {};
const clearErrorAfterDelay = (errorKey: string) => {
  setTimeout(() => delete recentErrors[errorKey], 100);
};

// Function to send errors to parent window (React frontend)
const sendErrorToParent = (level: string, message: string, data: any) => {
  // Create a simple key to identify duplicate errors
  const errorKey = `${level}:${message}:${JSON.stringify(data)}`;

  // Skip if we've seen this exact error recently
  if (recentErrors[errorKey]) {
    return;
  }

  // Mark this error as seen and schedule cleanup
  recentErrors[errorKey] = true;
  clearErrorAfterDelay(errorKey);

  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'EXPO_ERROR',
        level: level,
        message: message,
        data: data,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        source: 'expo-template'
      }, '*');
    } else {
      // Fallback to console if no parent window
      console.error('🚨 ERROR (no parent):', level, message, data);
    }
  } catch (error) {
    console.error('❌ Failed to send error to parent:', error);
  }
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

// CRITICAL FIX: Enhanced error logging setup
export const setupErrorLogging = () => {
  console.log('🔧 Setting up enhanced error logging...');

  // Capture unhandled errors in web environment
  if (typeof window !== 'undefined') {
    // Override window.onerror to catch JavaScript errors
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      const sourceFile = source ? source.split('/').pop() : 'unknown';
      const errorData = {
        message: message,
        source: `${sourceFile}:${lineno}:${colno}`,
        line: lineno,
        column: colno,
        error: error?.stack || error,
        timestamp: new Date().toISOString()
      };

      console.error('🚨 RUNTIME ERROR:', errorData);
      sendErrorToParent('error', 'JavaScript Runtime Error', errorData);
      
      // Call original handler if it exists
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false; // Don't prevent default error handling
    };
    
    // CRITICAL FIX: Enhanced unhandled promise rejection handling
    if (Platform.OS === 'web') {
      // Remove any existing listeners first
      const existingHandlers = (window as any).__unhandledRejectionHandlers || [];
      existingHandlers.forEach((handler: any) => {
        window.removeEventListener('unhandledrejection', handler);
      });

      // Capture unhandled promise rejections
      const rejectionHandler = (event: PromiseRejectionEvent) => {
        const errorData = {
          reason: event.reason,
          promise: event.promise,
          timestamp: new Date().toISOString(),
          stack: event.reason?.stack || 'No stack trace available',
          type: 'unhandledrejection'
        };

        console.error('🚨 UNHANDLED PROMISE REJECTION:', errorData);
        sendErrorToParent('error', 'Unhandled Promise Rejection', errorData);
        
        // Prevent the default browser behavior (logging to console)
        event.preventDefault();
      };

      window.addEventListener('unhandledrejection', rejectionHandler);
      
      // Store handler reference for cleanup
      (window as any).__unhandledRejectionHandlers = [rejectionHandler];

      // Also handle rejectionhandled events
      const rejectionHandledHandler = (event: PromiseRejectionEvent) => {
        console.log('🔄 Promise rejection was handled:', event.reason);
      };
      
      window.addEventListener('rejectionhandled', rejectionHandledHandler);
    }
  }

  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  // CRITICAL FIX: Safer console overrides with error handling
  console.error = (...args: any[]) => {
    try {
      const stack = new Error().stack || '';
      const sourceInfo = extractSourceLocation(stack);
      const callerInfo = getCallerInfo();

      // Create enhanced message with source information
      const enhancedMessage = args.join(' ') + sourceInfo + callerInfo;

      // Add timestamp and make it stand out in Metro logs
      originalConsoleError('🔥🔥🔥 ERROR:', new Date().toISOString(), enhancedMessage);

      // Also send to parent (with error handling)
      try {
        sendErrorToParent('error', 'Console Error', enhancedMessage);
      } catch (sendError) {
        originalConsoleError('Failed to send error to parent:', sendError);
      }
    } catch (overrideError) {
      // Fallback to original console.error if our override fails
      originalConsoleError('Console override error:', overrideError);
      originalConsoleError(...args);
    }
  };

  // Override console.warn to capture warnings with source location
  console.warn = (...args: any[]) => {
    try {
      const stack = new Error().stack || '';
      const sourceInfo = extractSourceLocation(stack);
      const callerInfo = getCallerInfo();

      // Create enhanced message with source information
      const enhancedMessage = args.join(' ') + sourceInfo + callerInfo;

      originalConsoleWarn('⚠️ WARNING:', new Date().toISOString(), enhancedMessage);

      // Also send to parent (with error handling)
      try {
        sendErrorToParent('warn', 'Console Warning', enhancedMessage);
      } catch (sendError) {
        originalConsoleWarn('Failed to send warning to parent:', sendError);
      }
    } catch (overrideError) {
      // Fallback to original console.warn if our override fails
      originalConsoleWarn('Console override error:', overrideError);
      originalConsoleWarn(...args);
    }
  };

  // CRITICAL FIX: Add specific handling for common React Native errors
  if (typeof global !== 'undefined' && global.fetch) {
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          console.warn(`🌐 HTTP ${response.status}: ${response.statusText} for ${args[0]}`);
        }
        return response;
      } catch (error) {
        console.error('🌐 Fetch Error:', error, 'URL:', args[0]);
        throw error;
      }
    };
  }

  // Try to intercept React Native warnings at a lower level
  if (typeof window !== 'undefined' && (window as any).__DEV__) {
    // Monkey patch any React warning functions
    if ((window as any).React && (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      try {
        const internals = (window as any).React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        if (internals.ReactDebugCurrentFrame) {
          const originalGetStackAddendum = internals.ReactDebugCurrentFrame.getStackAddendum;
          internals.ReactDebugCurrentFrame.getStackAddendum = function() {
            try {
              const stack = originalGetStackAddendum ? originalGetStackAddendum.call(this) : '';
              return stack + ' | Enhanced by error logger';
            } catch (error) {
              console.error('Error in ReactDebugCurrentFrame override:', error);
              return originalGetStackAddendum ? originalGetStackAddendum.call(this) : '';
            }
          };
        }
      } catch (error) {
        console.error('Error setting up React internals override:', error);
      }
    }
  }

  console.log('✅ Enhanced error logging setup completed');
};

// CRITICAL FIX: Export error logger function for manual error reporting
export const errorLogger = (error: any, context?: string) => {
  try {
    const errorData = {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      context: context || 'Manual error report',
      timestamp: new Date().toISOString()
    };

    console.error('📝 Manual Error Report:', errorData);
    sendErrorToParent('error', 'Manual Error Report', errorData);
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
};

// Initialize error logging immediately with error handling
try {
  setupErrorLogging();
} catch (setupError) {
  console.error('Failed to setup error logging:', setupError);
}
