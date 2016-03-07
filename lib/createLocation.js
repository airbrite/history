'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Actions = require('./Actions');

var _PathUtils = require('./PathUtils');

var createLocation = function createLocation() {
  var location = arguments.length <= 0 || arguments[0] === undefined ? '/' : arguments[0];
  var action = arguments.length <= 1 || arguments[1] === undefined ? _Actions.POP : arguments[1];
  var key = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var object = typeof location === 'string' ? (0, _PathUtils.parsePath)(location) : location;

  var pathname = object.pathname || '/';
  var search = object.search || '';
  var hash = object.hash || '';
  var state = object.state || null;

  return {
    pathname: pathname,
    search: search,
    hash: hash,
    state: state,
    action: action,
    key: key
  };
};

exports.default = createLocation;