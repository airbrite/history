'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _Actions = require('./Actions');

var _PathUtils = require('./PathUtils');

var _ExecutionEnvironment = require('./ExecutionEnvironment');

var _DOMStateStorage = require('./DOMStateStorage');

var _createDOMHistory = require('./createDOMHistory');

var _createDOMHistory2 = _interopRequireDefault(_createDOMHistory);

var _DOMUtils = require('./DOMUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isAbsolutePath = function isAbsolutePath(path) {
  return typeof path === 'string' && path.charAt(0) === '/';
};

var ensureSlash = function ensureSlash() {
  var path = (0, _DOMUtils.getHashPath)();

  if (isAbsolutePath(path)) return true;

  (0, _DOMUtils.replaceHashPath)('/' + path);

  return false;
};

var addQueryStringValueToPath = function addQueryStringValueToPath(path, key, value) {
  return path + (path.indexOf('?') === -1 ? '?' : '&') + (key + '=' + value);
};

var stripQueryStringValueFromPath = function stripQueryStringValueFromPath(path, key) {
  return path.replace(new RegExp('[?&]?' + key + '=[a-zA-Z0-9]+'), '');
};

var getQueryStringValueFromPath = function getQueryStringValueFromPath(path, key) {
  var match = path.match(new RegExp('\\?.*?\\b' + key + '=(.+?)\\b'));
  return match && match[1];
};

var DefaultQueryKey = '_k';

var createHashHistory = function createHashHistory() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  (0, _invariant2.default)(_ExecutionEnvironment.canUseDOM, 'Hash history needs a DOM');

  var queryKey = options.queryKey;


  if (queryKey === undefined || !!queryKey) queryKey = typeof queryKey === 'string' ? queryKey : DefaultQueryKey;

  var getCurrentLocation = function getCurrentLocation() {
    var path = (0, _DOMUtils.getHashPath)();

    var key = void 0,
        state = void 0;
    if (queryKey) {
      key = getQueryStringValueFromPath(path, queryKey);
      path = stripQueryStringValueFromPath(path, queryKey);

      if (key) {
        state = (0, _DOMStateStorage.readState)(key);
      } else {
        state = null;
        key = history.createKey();
        (0, _DOMUtils.replaceHashPath)(addQueryStringValueToPath(path, queryKey, key));
      }
    } else {
      key = state = null;
    }

    var location = (0, _PathUtils.parsePath)(path);

    return history.createLocation(_extends({}, location, { state: state }), undefined, key);
  };

  var startHashChangeListener = function startHashChangeListener(_ref) {
    var transitionTo = _ref.transitionTo;

    var hashChangeListener = function hashChangeListener() {
      if (!ensureSlash()) return; // Always make sure hashes are preceeded with a /.

      transitionTo(getCurrentLocation());
    };

    ensureSlash();
    (0, _DOMUtils.addEventListener)(window, 'hashchange', hashChangeListener);

    return function () {
      (0, _DOMUtils.removeEventListener)(window, 'hashchange', hashChangeListener);
    };
  };

  var finishTransition = function finishTransition(location) {
    var basename = location.basename;
    var pathname = location.pathname;
    var search = location.search;
    var state = location.state;
    var action = location.action;
    var key = location.key;


    if (action === _Actions.POP) return; // Nothing to do.

    var path = (basename || '') + pathname + search;

    if (queryKey) {
      path = addQueryStringValueToPath(path, queryKey, key);
      (0, _DOMStateStorage.saveState)(key, state);
    } else {
      // Drop key and state.
      location.key = location.state = null;
    }

    var currentHash = (0, _DOMUtils.getHashPath)();

    if (action === _Actions.PUSH) {
      if (currentHash !== path) {
        window.location.hash = path;
      } else {
        (0, _warning2.default)(false, 'You cannot PUSH the same path using hash history');
      }
    } else if (currentHash !== path) {
      // REPLACE
      (0, _DOMUtils.replaceHashPath)(path);
    }
  };

  var history = (0, _createDOMHistory2.default)(_extends({}, options, {
    getCurrentLocation: getCurrentLocation,
    finishTransition: finishTransition,
    saveState: _DOMStateStorage.saveState
  }));

  var listenerCount = 0,
      stopHashChangeListener = void 0;

  var listenBefore = function listenBefore(listener) {
    if (++listenerCount === 1) stopHashChangeListener = startHashChangeListener(history);

    var unlisten = history.listenBefore(listener);

    return function () {
      unlisten();

      if (--listenerCount === 0) stopHashChangeListener();
    };
  };

  var listen = function listen(listener) {
    if (++listenerCount === 1) stopHashChangeListener = startHashChangeListener(history);

    var unlisten = history.listen(listener);

    return function () {
      unlisten();

      if (--listenerCount === 0) stopHashChangeListener();
    };
  };

  var push = function push(location) {
    (0, _warning2.default)(queryKey || location.state == null, 'You cannot use state without a queryKey it will be dropped');

    history.push(location);
  };

  var replace = function replace(location) {
    (0, _warning2.default)(queryKey || location.state == null, 'You cannot use state without a queryKey it will be dropped');

    history.replace(location);
  };

  var goIsSupportedWithoutReload = (0, _DOMUtils.supportsGoWithoutReloadUsingHash)();

  var go = function go(n) {
    (0, _warning2.default)(goIsSupportedWithoutReload, 'Hash history go(n) causes a full page reload in this browser');

    history.go(n);
  };

  var createHref = function createHref(path) {
    return '#' + history.createHref(path);
  };

  return _extends({}, history, {
    listenBefore: listenBefore,
    listen: listen,
    push: push,
    replace: replace,
    go: go,
    createHref: createHref
  });
};

exports.default = createHashHistory;