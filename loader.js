/*jshint smarttabs:true white:true*/
/**
 * @module loader
 */
(function (root) {
	"use strict";
	
	var console = window.console;
	
	var doc = root.document,
		
		
		/**
		 * @private
		 * @method toArray
		 * @param {Array-like-thing} arrLike
		 * @returns {Array}
		 */
		toArray = function (arrLike) {
			return Array.prototype.slice.call(arrLike, 0);
		},
		
		
		/**
		 * @private
		 * @method indexOf
		 * @param {Array} arr
		 * @param {Any} thing
		 * @returns {Number}
		 */
		indexOf = function (arr, thing) {
			if (arr.indexOf) {
				return arr.indexOf(thing);
			}
			
			for (var i = 0, len = arr.length; i < len; i++) {
				if (arr[i] === thing) {
					return i;
				}
			}
			
			return -1;
		},
		
		
		/**
		 * @private
		 * @method some
		 * @param {Array} arr
		 * @param {Function} fn
		 * @returns {Boolean}
		 */
		some = function (arr, fn) {
			if (arr.some) {
				return arr.some(fn);
			}
			
			for (var i = 0, len = arr.length; i < len; i++) {
				if (fn(arr[i])) {
					return true;
				}
			}
			
			return false;
		},

		userAgent = navigator.userAgent,
		appleWebKit = !!(userAgent.match('AppleWebKit')),
		mobileWebKit = !!(appleWebKit && userAgent.match('Mobile')),
		opera = !!(userAgent.match('Presto')),
		safari = !!(appleWebKit && userAgent.match('Safari'));
	
	
	/**
	 * @example
	 *	loader.js('file.js', function (err) {
	 *		// File has been loaded
	 *	});
	 *	
	 *	loader.css('file.css', function (err) {
	 *		// File has been loaded
	 *	});	
	 * 
	 * @static
	 * @constructor
	 * @class loader
	 */
	root.loader = {
		/**
		 * @property support
		 * @type {Object}
		 */
		support: (function () {
				
			var js = doc.createElement('script'),
				css = doc.createElement('link');
			
			return {
				js: {
					load	:js.onload !== undefined,
					error	:js.onerror !== undefined,
					state	:js.onreadystatechange !== undefined
				},
				css: {
					load	: css.onload !== undefined && !(mobileWebKit || opera),
					error	: css.onerror !== undefined && !(mobileWebKit || opera),
					state	: css.onreadystatechange !== undefined && !mobileWebKit
				}
			};
		}()),
		
		
		/**
		 * @protected
		 * @method load
		 * @param {HTMLElement} el
		 * @param {Object} support
		 * @param {Function} fn
		 */
		_load: function (el, support, fn) {
			
			var url = el.src || el.href,
				timer,
				msInterval = 100,
				count = 0,
				maxCount = 10,
				done = function (err) {
					// alert('DONE\n' + (err && err.message) + '\n' + url);
					el.onload = el.onerror = null;
					clearInterval(timer);
					el.onreadystatechange = null;
					fn(err, url);
				};
			
			
			// Can do ready state change
			if (support.state) {
				el.onreadystatechange = function () {
					console && console.log('onreadystatechange', url, el.readyState)
					var readyState = el.readyState;
					if (readyState === 'loaded' || readyState === 'complete') {
						done();
					}
				};
				
				timer = setInterval(function () {
					count += 1;
					if (count === maxCount) {
						done(new Error('Timed out while trying to load: "' + url + '"'));
					}
				}, msInterval);
			
			// Callbacks
			} else if (support.load && support.error) {
				
				// On Load
				el.onload = function () {
					console && console.log('onload', url);
					var err,
						cssRules = el.sheet && el.sheet.hasOwnProperty('cssRules') && el.sheet.cssRules;
					
					if (cssRules && !cssRules.length) {
						err = new Error('An error occurred while tying to load: "' + url + '"');
					}
					done(err);
				};
				
				el.onerror = function () {
					console && console.log('onerror', url);
					done(new Error('An error occurred while tying to load: "' + url + '"'));
				};
				
			// Only style sheets should end up here... hopefully
			} else {
				timer = setInterval(function () {
					count += 1;
					
					if (count === maxCount) {
						done(new Error('Timed out while trying to load: "' + url + '"'));
					} else if (some(toArray(document.styleSheets), function (styleSheet) {
						var cssRules = el.sheet && el.sheet.hasOwnProperty('cssRules') && el.sheet.cssRules;
						console && console.log('styleSheets', cssRules && !cssRules.length);
						return styleSheet.href === url && (cssRules && !cssRules.length);
					})) {
						done();
					}
				}, msInterval);
			}
			
			return this;
		},
		
		
		/**
		 * @protected
		 * @method append
		 * @param {HTMLElement} el
		 * @chainable
		 */
		_append: function (el) {
			if (!this._el) {
				this._el = doc.getElementsByTagName('head')[0]
			}
			this._el.appendChild(el);
			
			return this;
		},
		
		
		/**
		 * @example
		 *	loader.js('file.js', function (err) {
		 *		// File has been loaded
		 *	});
		 * 
		 * @method js
		 * @param {String} src
		 * @param {Function} [fn]
		 * @chainable
		 */
		js: function (src, fn) {
			var self = this,
				el = doc.createElement('script');
			
			el.setAttribute('src', src);
			
			setTimeout(function () {
				self._load(el, self.support.js, fn);
				self._append(el);
			}, 0);
			
			return this;
		},
		
		
		/**
		 * @example
		 *	loader.css('file.css', function (err) {
		 *		// File has been loaded
		 *	});
		 * 
		 * @method css
		 * @param {String} href
		 * @param {Function} [fn]
		 * @chainable
		 */
		css: function (href, fn) {
			var self = this,
				el = doc.createElement('link');
			
			el.setAttribute('rel', 'stylesheet');
			el.setAttribute('type', 'text/css');
			el.setAttribute('href', href);
			
			setTimeout(function () {
				self._load(el, self.support.css, fn);
				self._append(el);
			}, 0);
			
			return this;
		}
	};
}(this));