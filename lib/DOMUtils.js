'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* eslint-disable no-alert */
var addEventListener = exports.addEventListener = function addEventListener(node, event, listener) {
  return node.addEventListener ? node.addEventListener(event, listener, false) : node.attachEvent('on' + event, listener);
};

var removeEventListener = exports.removeEventListener = function removeEventListener(node, event, listener) {
  return node.removeEventListener ? node.removeEventListener(event, listener, false) : node.detachEvent('on' + event, listener);
};

// We can't use window.location.hash here because it's not
// consistent across browsers - Firefox will pre-decode it!
var getHashPath = exports.getHashPath = function getHashPath() {
  return window.location.href.split('#')[1] || '';
};

var replaceHashPath = exports.replaceHashPath = function replaceHashPath(path) {
  return window.location.replace('' + window.location.pathname + window.location.search + '#' + path);
};

var getWindowPath = exports.getWindowPath = function getWindowPath() {
  return window.location.pathname + window.location.search + window.location.hash;
};

var go = exports.go = function go(n) {
  return n && window.history.go(n);
};

var getUserConfirmation = exports.getUserConfirmation = function getUserConfirmation(message, callback) {
  return callback(window.confirm(message));
};

/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/rackt/react-router/issues/586
 */
var supportsHistory = exports.supportsHistory = function supportsHistory() {
  var ua = navigator.userAgent;

  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;

  return window.history && 'pushState' in window.history;
};

/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
var supportsGoWithoutReloadUsingHash = exports.supportsGoWithoutReloadUsingHash = function supportsGoWithoutReloadUsingHash() {
  return navigator.userAgent.indexOf('Firefox') === -1;
};