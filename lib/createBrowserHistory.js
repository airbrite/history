'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _Actions = require('./Actions');

var _PathUtils = require('./PathUtils');

var _ExecutionEnvironment = require('./ExecutionEnvironment');

var _DOMUtils = require('./DOMUtils');

var _DOMStateStorage = require('./DOMStateStorage');

var _createDOMHistory = require('./createDOMHistory');

var _createDOMHistory2 = _interopRequireDefault(_createDOMHistory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates and returns a history object that uses HTML5's history API
 * (pushState, replaceState, and the popstate event) to manage history.
 * This is the recommended method of managing history in browsers because
 * it provides the cleanest URLs.
 *
 * Note: In browsers that do not support the HTML5 history API full
 * page reloads will be used to preserve URLs.
 */
var createBrowserHistory = function createBrowserHistory() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  (0, _invariant2.default)(_ExecutionEnvironment.canUseDOM, 'Browser history needs a DOM');

  var forceRefresh = options.forceRefresh;

  var isSupported = (0, _DOMUtils.supportsHistory)();
  var useRefresh = !isSupported || forceRefresh;

  var getCurrentLocation = function getCurrentLocation(historyState) {
    try {
      // Catch `Unspecified error` when used in IE iframe
      historyState = historyState || window.history.state || {};
    } catch (err) {}

    var path = (0, _DOMUtils.getWindowPath)();
    var key = historyState && historyState.key;

    var state = void 0;
    if (key) {
      state = (0, _DOMStateStorage.readState)(key);
    } else {
      state = null;
      key = history.createKey();

      if (isSupported) window.history.replaceState(_extends({}, historyState, { key: key }), null, path);
    }

    var location = (0, _PathUtils.parsePath)(path);

    return history.createLocation(_extends({}, location, { state: state }), undefined, key);
  };

  var startPopStateListener = function startPopStateListener(_ref) {
    var transitionTo = _ref.transitionTo;

    var popStateListener = function popStateListener(event) {
      if (event.state === undefined) return; // Ignore extraneous popstate events in WebKit.

      transitionTo(getCurrentLocation(event.state));
    };

    (0, _DOMUtils.addEventListener)(window, 'popstate', popStateListener);

    return function () {
      return (0, _DOMUtils.removeEventListener)(window, 'popstate', popStateListener);
    };
  };

  var finishTransition = function finishTransition(location) {
    /* eslint-disable consistent-return, no-else-return */
    var basename = location.basename;
    var pathname = location.pathname;
    var search = location.search;
    var hash = location.hash;
    var state = location.state;
    var action = location.action;
    var key = location.key;


    if (action === _Actions.POP) return; // Nothing to do.

    (0, _DOMStateStorage.saveState)(key, state);

    var path = (basename || '') + pathname + search + hash;
    var historyState = {
      key: key
    };

    if (action === _Actions.PUSH) {
      if (useRefresh) {
        window.location.href = path;
        return false; // Prevent location update.
      } else {
          window.history.pushState(historyState, null, path);
        }
    } else if (action === _Actions.REPLACE) {
      if (useRefresh) {
        window.location.replace(path);
        return false; // Prevent location update.
      } else {
          window.history.replaceState(historyState, null, path);
        }
    }
  };

  var history = (0, _createDOMHistory2.default)(_extends({}, options, {
    getCurrentLocation: getCurrentLocation,
    finishTransition: finishTransition,
    saveState: _DOMStateStorage.saveState
  }));

  var listenerCount = 0,
      stopPopStateListener = void 0;

  var listenBefore = function listenBefore(listener) {
    if (++listenerCount === 1) stopPopStateListener = startPopStateListener(history);

    var unlisten = history.listenBefore(listener);

    return function () {
      unlisten();

      if (--listenerCount === 0) stopPopStateListener();
    };
  };

  var listen = function listen(listener) {
    if (++listenerCount === 1) stopPopStateListener = startPopStateListener(history);

    var unlisten = history.listen(listener);

    return function () {
      unlisten();

      if (--listenerCount === 0) stopPopStateListener();
    };
  };

  return _extends({}, history, {
    listenBefore: listenBefore,
    listen: listen
  });
};

exports.default = createBrowserHistory;