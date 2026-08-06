// ─── CRITICAL: Must use require(), NOT import ─────────────────────────────────
// ES module `import` statements are hoisted by Babel, so they would run BEFORE
// the polyfill code below. `require()` respects execution order.
//
// Hermes (React Native's JS engine) does not provide browser globals like
// DOMException, which some libraries (fetch, URL, axios internals) expect.

'use strict';

// 1. DOMException
if (typeof global.DOMException === 'undefined') {
  function DOMException(message, name) {
    var err = new Error(message || '');
    err.name = name || 'DOMException';
    return err;
  }
  DOMException.prototype = Object.create(Error.prototype);
  global.DOMException = DOMException;
}

// 2. self / window aliases
if (typeof global.self === 'undefined') {
  global.self = global;
}
if (typeof global.window === 'undefined') {
  global.window = global;
}

// 3. queueMicrotask (used by some async libs)
if (typeof global.queueMicrotask === 'undefined') {
  global.queueMicrotask = function(fn) {
    Promise.resolve().then(fn);
  };
}

// ─── App entry ─────────────────────────────────────────────────────────────────
require('expo-router/entry');
