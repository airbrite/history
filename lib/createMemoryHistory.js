'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /* eslint-disable consistent-return */


var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _PathUtils = require('./PathUtils');

var _Actions = require('./Actions');

var _createHistory = require('./createHistory');

var _createHistory2 = _interopRequireDefault(_createHistory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createStateStorage = function createStateStorage(entries) {
  return entries.filter(function (entry) {
    return entry.state;
  }).reduce(function (memo, entry) {
    memo[entry.key] = entry.state;
    return memo;
  }, {});
};

var createEntry = function createEntry(key, entry) {
  if (typeof entry === 'string') return { pathname: entry, key: key };

  if ((typeof entry === 'undefined' ? 'undefined' : _typeof(entry)) === 'object' && entry) return _extends({}, entry, { key: key });

  (0, _invariant2.default)(false, 'Unable to create history entry from %s', entry);
};

var createMemoryHistory = function createMemoryHistory() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  if (Array.isArray(options)) {
    options = { entries: options };
  } else if (typeof options === 'string') {
    options = { entries: [options] };
  }

  var getCurrentLocation = function getCurrentLocation() {
    var entry = entries[current];
    var basename = entry.basename;
    var pathname = entry.pathname;
    var search = entry.search;

    var path = (basename || '') + pathname + (search || '');

    var key = void 0,
        state = void 0;
    if (entry.key) {
      key = entry.key;
      state = readState(key);
    } else {
      key = history.createKey();
      state = null;
      entry.key = key;
    }

    var location = (0, _PathUtils.parsePath)(path);

    return history.createLocation(_extends({}, location, { state: state }), undefined, key);
  };

  var canGo = function canGo(n) {
    var index = current + n;
    return index >= 0 && index < entries.length;
  };

  var go = function go(n) {
    if (n) {
      if (!canGo(n)) {
        (0, _warning2.default)(false, 'Cannot go(%s) there is not enough history', n);
        return;
      }

      current += n;

      var currentLocation = getCurrentLocation();

      // change action to POP
      history.transitionTo(_extends({}, currentLocation, { action: _Actions.POP }));
    }
  };

  var finishTransition = function finishTransition(location) {
    if (location.action === _Actions.PUSH) {
      current += 1;

      // if we are not on the top of stack
      // remove rest and push new
      if (current < entries.length) entries.splice(current);

      entries.push(location);
      saveState(location.key, location.state);
    } else if (location.action === _Actions.REPLACE) {
      entries[current] = location;
      saveState(location.key, location.state);
    }
  };

  var history = (0, _createHistory2.default)(_extends({}, options, {
    getCurrentLocation: getCurrentLocation,
    finishTransition: finishTransition,
    saveState: saveState,
    go: go
  }));

  var _options = options;
  var entries = _options.entries;
  var current = _options.current;


  if (typeof entries === 'string') {
    entries = [entries];
  } else if (!Array.isArray(entries)) {
    entries = ['/'];
  }

  entries = entries.map(function (entry) {
    return createEntry(history.createKey(), entry);
  });

  if (current == null) {
    current = entries.length - 1;
  } else {
    (0, _invariant2.default)(current >= 0 && current < entries.length, 'Current index must be >= 0 and < %s, was %s', entries.length, current);
  }

  var storage = createStateStorage(entries);

  var saveState = function saveState(key, state) {
    return storage[key] = state;
  };

  var readState = function readState(key) {
    return storage[key];
  };

  return history;
};

exports.default = createMemoryHistory;