'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _deepEqual = require('deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _AsyncUtils = require('./AsyncUtils');

var _PathUtils = require('./PathUtils');

var _Actions = require('./Actions');

var _runTransitionHook = require('./runTransitionHook');

var _runTransitionHook2 = _interopRequireDefault(_runTransitionHook);

var _createLocation2 = require('./createLocation');

var _createLocation3 = _interopRequireDefault(_createLocation2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var DefaultKeyLength = 6;

var createRandomKey = function createRandomKey(length) {
  return Math.random().toString(36).substr(2, length);
};

var locationsAreEqual = function locationsAreEqual(a, b) {
  return a.pathname === b.pathname && a.search === b.search &&
  // TODO: Should probably compare hash here too?
  // a.action === b.action && // Different action !== location change.
  a.key === b.key && (0, _deepEqual2.default)(a.state, b.state);
};

var createHistory = function createHistory() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var getCurrentLocation = options.getCurrentLocation;
  var finishTransition = options.finishTransition;
  var go = options.go;
  var getUserConfirmation = options.getUserConfirmation;
  var keyLength = options.keyLength;


  if (typeof keyLength !== 'number') keyLength = DefaultKeyLength;

  var beforeHooks = [];

  var listenBefore = function listenBefore(hook) {
    beforeHooks.push(hook);

    return function () {
      beforeHooks = beforeHooks.filter(function (item) {
        return item !== hook;
      });
    };
  };

  var allKeys = [];
  var changeListeners = [];
  var currentLocation = void 0;
  var pendingLocation = void 0;

  var getCurrent = function getCurrent() {
    if (pendingLocation && pendingLocation.action === _Actions.POP) {
      return allKeys.indexOf(pendingLocation.key);
    } else if (currentLocation) {
      return allKeys.indexOf(currentLocation.key);
    }

    return -1;
  };

  var updateLocation = function updateLocation(newLocation) {
    var currentIndex = getCurrent();

    currentLocation = newLocation;

    if (currentLocation.action === _Actions.PUSH) {
      allKeys = [].concat(_toConsumableArray(allKeys.slice(0, currentIndex + 1)), [currentLocation.key]);
    } else if (currentLocation.action === _Actions.REPLACE) {
      allKeys[currentIndex] = currentLocation.key;
    }

    changeListeners.forEach(function (listener) {
      return listener(currentLocation);
    });
  };

  var listen = function listen(listener) {
    changeListeners.push(listener);

    if (currentLocation) {
      listener(currentLocation);
    } else {
      var location = getCurrentLocation();
      allKeys = [location.key];
      updateLocation(location);
    }

    return function () {
      changeListeners = changeListeners.filter(function (item) {
        return item !== listener;
      });
    };
  };

  var confirmTransitionTo = function confirmTransitionTo(location, callback) {
    (0, _AsyncUtils.loopAsync)(beforeHooks.length, function (index, next, done) {
      (0, _runTransitionHook2.default)(beforeHooks[index], location, function (result) {
        return result != null ? done(result) : next();
      });
    }, function (message) {
      if (getUserConfirmation && typeof message === 'string') {
        getUserConfirmation(message, function (ok) {
          return callback(ok !== false);
        });
      } else {
        callback(message !== false);
      }
    });
  };

  var transitionTo = function transitionTo(nextLocation) {
    if (currentLocation && locationsAreEqual(currentLocation, nextLocation)) return; // Nothing to do.

    pendingLocation = nextLocation;

    confirmTransitionTo(nextLocation, function (ok) {
      if (pendingLocation !== nextLocation) return; // Transition was interrupted.

      if (ok) {
        // treat PUSH to current path like REPLACE to be consistent with browsers
        if (nextLocation.action === _Actions.PUSH) {
          var prevPath = (0, _PathUtils.createPath)(currentLocation);
          var nextPath = (0, _PathUtils.createPath)(nextLocation);

          if (nextPath === prevPath && (0, _deepEqual2.default)(currentLocation.state, nextLocation.state)) nextLocation.action = _Actions.REPLACE;
        }

        if (finishTransition(nextLocation) !== false) updateLocation(nextLocation);
      } else if (currentLocation && nextLocation.action === _Actions.POP) {
        var prevIndex = allKeys.indexOf(currentLocation.key);
        var nextIndex = allKeys.indexOf(nextLocation.key);

        if (prevIndex !== -1 && nextIndex !== -1) go(prevIndex - nextIndex); // Restore the URL.
      }
    });
  };

  var push = function push(location) {
    return transitionTo(createLocation(location, _Actions.PUSH, createKey()));
  };

  var replace = function replace(location) {
    return transitionTo(createLocation(location, _Actions.REPLACE, createKey()));
  };

  var goBack = function goBack() {
    return go(-1);
  };

  var goForward = function goForward() {
    return go(1);
  };

  var createKey = function createKey() {
    return createRandomKey(keyLength);
  };

  var createHref = function createHref(location) {
    return (0, _PathUtils.createPath)(location);
  };

  var createLocation = function createLocation(location, action) {
    var key = arguments.length <= 2 || arguments[2] === undefined ? createKey() : arguments[2];
    return (0, _createLocation3.default)(location, action, key);
  };

  return {
    listenBefore: listenBefore,
    listen: listen,
    transitionTo: transitionTo,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    createKey: createKey,
    createPath: _PathUtils.createPath,
    createHref: createHref,
    createLocation: createLocation
  };
};

exports.default = createHistory;