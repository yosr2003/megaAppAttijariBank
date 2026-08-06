// Polyfills for Hermes / React Native environment
// DOMException is used by some web-standard APIs (fetch, URL, etc.)
if (typeof global.DOMException === 'undefined') {
  class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name ?? 'DOMException';
    }
  }
  // @ts-ignore
  global.DOMException = DOMException;
}

// Ensure global.self is defined (required by some polyfills)
if (typeof global.self === 'undefined') {
  // @ts-ignore
  global.self = global;
}

// Ensure global.window is defined (required by some polyfills)
if (typeof global.window === 'undefined') {
  // @ts-ignore
  global.window = global;
}
