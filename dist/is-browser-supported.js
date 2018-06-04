(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["isBrowserSupported"] = factory();
	else
		root["isBrowserSupported"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	var browserslist = __webpack_require__(1);
	var parser = __webpack_require__(12);
	
	function getBrowserName(agent) {
	  if (agent.browser.name === 'Android Browser') {
	    return 'android';
	  } else if (agent.os.name === 'BlackBerry') {
	    return 'bb';
	  } else if (agent.browser.name === 'Chrome' && agent.os.name === 'Android') {
	    return 'and_chr';
	  } else if (agent.browser.name === 'Firefox' && agent.os.name === 'Android') {
	    return 'and_ff';
	  } else if (agent.browser.name === 'IEMobile') {
	    return 'ie_mob';
	  } else if (agent.browser.name === 'Opera Mobi') {
	    return 'op_mob';
	  } else if (agent.browser.name === 'Safari' && agent.os.name === 'iOS') {
	    return 'ios_saf';
	  } else if (agent.browser.name === 'UCBrowser') {
	    return 'and_uc';
	  }
	  return agent.browser.name;
	}
	
	function getBrowserVersionFromUserAgent(userAgent) {
	  var agent = parser(userAgent);
	  var version = (agent.browser.version || agent.os.version || '').split('.');
	  var browserName = getBrowserName(agent);
	  while (version.length > 0) {
	    try {
	      return browserslist(browserName + ' ' + version.join('.'))[0];
	    } catch (e) {
	      // Ignore unknown browser query error
	    }
	    version.pop();
	  }
	  return 'unknown';
	}
	
	module.exports = function isBrowserSupported(userAgent, selections) {
	  var browsersSupported = browserslist(selections);
	  var browser = getBrowserVersionFromUserAgent(userAgent);
	  return browsersSupported.indexOf(browser) !== -1;
	};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var path = __webpack_require__(2)
	var e2c = __webpack_require__(3)
	
	var agents = __webpack_require__(4).agents
	
	var BrowserslistError = __webpack_require__(10)
	var env = __webpack_require__(11) // Will load browser.js in webpack
	
	var FLOAT_RANGE = /^\d+(\.\d+)?(-\d+(\.\d+)?)*$/
	
	function normalize (versions) {
	  return versions.filter(function (version) {
	    return typeof version === 'string'
	  })
	}
	
	function nameMapper (name) {
	  return function mapName (version) {
	    return name + ' ' + version
	  }
	}
	
	function getMajor (version) {
	  return parseInt(version.split('.')[0])
	}
	
	function getMajorVersions (released, number) {
	  if (released.length === 0) return []
	  var minimum = getMajor(released[released.length - 1]) - parseInt(number) + 1
	  var selected = []
	  for (var i = released.length - 1; i >= 0; i--) {
	    if (minimum > getMajor(released[i])) break
	    selected.unshift(released[i])
	  }
	  return selected
	}
	
	function uniq (array) {
	  var filtered = []
	  for (var i = 0; i < array.length; i++) {
	    if (filtered.indexOf(array[i]) === -1) filtered.push(array[i])
	  }
	  return filtered
	}
	
	// Helpers
	
	function fillUsage (result, name, data) {
	  for (var i in data) {
	    result[name + ' ' + i] = data[i]
	  }
	}
	
	function generateFilter (sign, version) {
	  version = parseFloat(version)
	  if (sign === '>') {
	    return function (v) {
	      return parseFloat(v) > version
	    }
	  } else if (sign === '>=') {
	    return function (v) {
	      return parseFloat(v) >= version
	    }
	  } else if (sign === '<') {
	    return function (v) {
	      return parseFloat(v) < version
	    }
	  } else {
	    return function (v) {
	      return parseFloat(v) <= version
	    }
	  }
	}
	
	function compareStrings (a, b) {
	  if (a < b) return -1
	  if (a > b) return +1
	  return 0
	}
	
	function normalizeVersion (data, version) {
	  if (data.versions.indexOf(version) !== -1) {
	    return version
	  } else if (browserslist.versionAliases[data.name][version]) {
	    return browserslist.versionAliases[data.name][version]
	  } else if (data.versions.length === 1) {
	    return data.versions[0]
	  } else {
	    return false
	  }
	}
	
	function filterByYear (since) {
	  return Object.keys(agents).reduce(function (selected, name) {
	    var data = byName(name)
	    if (!data) return selected
	    var versions = Object.keys(data.releaseDate).filter(function (v) {
	      return data.releaseDate[v] >= since
	    })
	    return selected.concat(versions.map(nameMapper(data.name)))
	  }, [])
	}
	
	function byName (name) {
	  name = name.toLowerCase()
	  name = browserslist.aliases[name] || name
	  return browserslist.data[name]
	}
	
	function checkName (name) {
	  var data = byName(name)
	  if (!data) throw new BrowserslistError('Unknown browser ' + name)
	  return data
	}
	
	function unknownQuery (query) {
	  return new BrowserslistError('Unknown browser query `' + query + '`')
	}
	
	function resolve (queries, context) {
	  return queries.reduce(function (result, selection, index) {
	    selection = selection.trim()
	    if (selection === '') return result
	
	    var isExclude = selection.indexOf('not ') === 0
	    if (isExclude) {
	      if (index === 0) {
	        throw new BrowserslistError(
	          'Write any browsers query (for instance, `defaults`) ' +
	          'before `' + selection + '`')
	      }
	      selection = selection.slice(4)
	    }
	
	    for (var i = 0; i < QUERIES.length; i++) {
	      var type = QUERIES[i]
	      var match = selection.match(type.regexp)
	      if (match) {
	        var args = [context].concat(match.slice(1))
	        var array = type.select.apply(browserslist, args)
	        if (isExclude) {
	          array = array.concat(array.map(function (j) {
	            return j.replace(/\s\S+/, ' 0')
	          }))
	          return result.filter(function (j) {
	            return array.indexOf(j) === -1
	          })
	        }
	        return result.concat(array)
	      }
	    }
	
	    throw unknownQuery(selection)
	  }, [])
	}
	
	/**
	 * Return array of browsers by selection queries.
	 *
	 * @param {(string|string[])} [queries=browserslist.defaults] Browser queries.
	 * @param {object} [opts] Options.
	 * @param {string} [opts.path="."] Path to processed file.
	 *                                 It will be used to find config files.
	 * @param {string} [opts.env="production"] Processing environment.
	 *                                         It will be used to take right
	 *                                         queries from config file.
	 * @param {string} [opts.config] Path to config file with queries.
	 * @param {object} [opts.stats] Custom browser usage statistics
	 *                              for "> 1% in my stats" query.
	 * @param {boolean} [opts.ignoreUnknownVersions=false] Do not throw on unknown
	 *                                                     version in direct query.
	 * @param {boolean} [opts.dangerousExtend] Disable security checks
	 *                                         for extend query.
	 * @return {string[]} Array with browser names in Can I Use.
	 *
	 * @example
	 * browserslist('IE >= 10, IE 8') //=> ['ie 11', 'ie 10', 'ie 8']
	 */
	function browserslist (queries, opts) {
	  if (typeof opts === 'undefined') opts = { }
	
	  if (typeof opts.path === 'undefined') {
	    opts.path = path.resolve ? path.resolve('.') : '.'
	  }
	
	  if (typeof queries === 'undefined' || queries === null) {
	    var config = browserslist.loadConfig(opts)
	    if (config) {
	      queries = config
	    } else {
	      queries = browserslist.defaults
	    }
	  }
	
	  if (typeof queries === 'string') {
	    queries = queries.split(/,\s*/)
	  }
	
	  if (!Array.isArray(queries)) {
	    throw new BrowserslistError(
	      'Browser queries must be an array. Got ' + typeof queries + '.')
	  }
	
	  var context = {
	    ignoreUnknownVersions: opts.ignoreUnknownVersions,
	    dangerousExtend: opts.dangerousExtend
	  }
	
	  var stats = env.getStat(opts)
	  if (stats) {
	    context.customUsage = { }
	    for (var browser in stats) {
	      fillUsage(context.customUsage, browser, stats[browser])
	    }
	  }
	
	  var result = resolve(queries, context).map(function (i) {
	    var parts = i.split(' ')
	    var name = parts[0]
	    var version = parts[1]
	    if (version === '0') {
	      return name + ' ' + byName(name).versions[0]
	    } else {
	      return i
	    }
	  }).sort(function (name1, name2) {
	    name1 = name1.split(' ')
	    name2 = name2.split(' ')
	    if (name1[0] === name2[0]) {
	      if (FLOAT_RANGE.test(name1[1]) && FLOAT_RANGE.test(name2[1])) {
	        return parseFloat(name2[1]) - parseFloat(name1[1])
	      } else {
	        return compareStrings(name2[1], name1[1])
	      }
	    } else {
	      return compareStrings(name1[0], name2[0])
	    }
	  })
	
	  return uniq(result)
	}
	
	// Will be filled by Can I Use data below
	browserslist.data = { }
	browserslist.usage = {
	  global: { },
	  custom: null
	}
	
	// Default browsers query
	browserslist.defaults = [
	  '> 0.5%',
	  'last 2 versions',
	  'Firefox ESR',
	  'not dead'
	]
	
	// Browser names aliases
	browserslist.aliases = {
	  fx: 'firefox',
	  ff: 'firefox',
	  ios: 'ios_saf',
	  explorer: 'ie',
	  blackberry: 'bb',
	  explorermobile: 'ie_mob',
	  operamini: 'op_mini',
	  operamobile: 'op_mob',
	  chromeandroid: 'and_chr',
	  firefoxandroid: 'and_ff',
	  ucandroid: 'and_uc',
	  qqandroid: 'and_qq'
	}
	
	// Aliases to work with joined versions like `ios_saf 7.0-7.1`
	browserslist.versionAliases = { }
	
	browserslist.clearCaches = env.clearCaches
	browserslist.parseConfig = env.parseConfig
	browserslist.readConfig = env.readConfig
	browserslist.findConfig = env.findConfig
	browserslist.loadConfig = env.loadConfig
	
	/**
	 * Return browsers market coverage.
	 *
	 * @param {string[]} browsers Browsers names in Can I Use.
	 * @param {string|object} [stats="global"] Which statistics should be used.
	 *                                         Country code or custom statistics.
	 *                                         Pass `"my stats"` to load statistics
	 *                                         from Browserslist files.
	 *
	 * @return {number} Total market coverage for all selected browsers.
	 *
	 * @example
	 * browserslist.coverage(browserslist('> 1% in US'), 'US') //=> 83.1
	 */
	browserslist.coverage = function (browsers, stats) {
	  var data
	  if (typeof stats === 'undefined') {
	    data = browserslist.usage.global
	  } else if (stats === 'my stats') {
	    var opts = {}
	    opts.path = path.resolve ? path.resolve('.') : '.'
	    var customStats = env.getStat(opts)
	    if (!customStats) {
	      throw new BrowserslistError('Custom usage statistics was not provided')
	    }
	    data = {}
	    for (var browser in customStats) {
	      fillUsage(data, browser, customStats[browser])
	    }
	  } else if (typeof stats === 'string') {
	    if (stats.length > 2) {
	      stats = stats.toLowerCase()
	    } else {
	      stats = stats.toUpperCase()
	    }
	    env.loadCountry(browserslist.usage, stats)
	    data = browserslist.usage[stats]
	  } else {
	    if ('dataByBrowser' in stats) {
	      stats = stats.dataByBrowser
	    }
	    data = { }
	    for (var name in stats) {
	      for (var version in stats[name]) {
	        data[name + ' ' + version] = stats[name][version]
	      }
	    }
	  }
	
	  return browsers.reduce(function (all, i) {
	    var usage = data[i]
	    if (usage === undefined) {
	      usage = data[i.replace(/ \S+$/, ' 0')]
	    }
	    return all + (usage || 0)
	  }, 0)
	}
	
	var QUERIES = [
	  {
	    regexp: /^last\s+(\d+)\s+major versions?$/i,
	    select: function (context, versions) {
	      return Object.keys(agents).reduce(function (selected, name) {
	        var data = byName(name)
	        if (!data) return selected
	        var array = getMajorVersions(data.released, versions)
	
	        array = array.map(nameMapper(data.name))
	        return selected.concat(array)
	      }, [])
	    }
	  },
	  {
	    regexp: /^last\s+(\d+)\s+versions?$/i,
	    select: function (context, versions) {
	      return Object.keys(agents).reduce(function (selected, name) {
	        var data = byName(name)
	        if (!data) return selected
	        var array = data.released.slice(-versions)
	
	        array = array.map(nameMapper(data.name))
	        return selected.concat(array)
	      }, [])
	    }
	  },
	  {
	    regexp: /^last\s+(\d+)\s+electron\s+major versions?$/i,
	    select: function (context, versions) {
	      var validVersions = getMajorVersions(Object.keys(e2c).reverse(), versions)
	      return validVersions.map(function (i) {
	        return 'chrome ' + e2c[i]
	      })
	    }
	  },
	  {
	    regexp: /^last\s+(\d+)\s+(\w+)\s+major versions?$/i,
	    select: function (context, versions, name) {
	      var data = checkName(name)
	      var validVersions = getMajorVersions(data.released, versions)
	      return validVersions.map(nameMapper(data.name))
	    }
	  },
	  {
	    regexp: /^last\s+(\d+)\s+electron\s+versions?$/i,
	    select: function (context, versions) {
	      return Object.keys(e2c).reverse().slice(-versions).map(function (i) {
	        return 'chrome ' + e2c[i]
	      })
	    }
	  },
	  {
	    regexp: /^last\s+(\d+)\s+(\w+)\s+versions?$/i,
	    select: function (context, versions, name) {
	      var data = checkName(name)
	      return data.released.slice(-versions).map(nameMapper(data.name))
	    }
	  },
	  {
	    regexp: /^unreleased\s+versions$/i,
	    select: function () {
	      return Object.keys(agents).reduce(function (selected, name) {
	        var data = byName(name)
	        if (!data) return selected
	        var array = data.versions.filter(function (v) {
	          return data.released.indexOf(v) === -1
	        })
	
	        array = array.map(nameMapper(data.name))
	        return selected.concat(array)
	      }, [])
	    }
	  },
	  {
	    regexp: /^unreleased\s+electron\s+versions?$/i,
	    select: function () {
	      return []
	    }
	  },
	  {
	    regexp: /^unreleased\s+(\w+)\s+versions?$/i,
	    select: function (context, name) {
	      var data = checkName(name)
	      return data.versions.filter(function (v) {
	        return data.released.indexOf(v) === -1
	      }).map(nameMapper(data.name))
	    }
	  },
	  {
	    regexp: /^last\s+(\d+)\s+years?$/i,
	    select: function (context, years) {
	      var date = new Date()
	      var since = date.setFullYear(date.getFullYear() - years) / 1000
	
	      return filterByYear(since)
	    }
	  },
	  {
	    regexp: /^since (\d+)(?:-(\d+))?(?:-(\d+))?$/i,
	    select: function (context, year, month, date) {
	      year = parseInt(year)
	      month = parseInt(month || '01') - 1
	      date = parseInt(date || '01')
	      var since = Date.UTC(year, month, date, 0, 0, 0) / 1000
	
	      return filterByYear(since)
	    }
	  },
	  {
	    regexp: /^(>=?|<=?)\s*(\d*\.?\d+)%$/,
	    select: function (context, sign, popularity) {
	      popularity = parseFloat(popularity)
	      var usage = browserslist.usage.global
	
	      return Object.keys(usage).reduce(function (result, version) {
	        if (sign === '>') {
	          if (usage[version] > popularity) {
	            result.push(version)
	          }
	        } else if (sign === '<') {
	          if (usage[version] < popularity) {
	            result.push(version)
	          }
	        } else if (sign === '<=') {
	          if (usage[version] <= popularity) {
	            result.push(version)
	          }
	        } else if (usage[version] >= popularity) {
	          result.push(version)
	        }
	        return result
	      }, [])
	    }
	  },
	  {
	    regexp: /^(>=?|<=?)\s*(\d*\.?\d+)%\s+in\s+my\s+stats$/,
	    select: function (context, sign, popularity) {
	      popularity = parseFloat(popularity)
	
	      if (!context.customUsage) {
	        throw new BrowserslistError('Custom usage statistics was not provided')
	      }
	
	      var usage = context.customUsage
	
	      return Object.keys(usage).reduce(function (result, version) {
	        if (sign === '>') {
	          if (usage[version] > popularity) {
	            result.push(version)
	          }
	        } else if (sign === '<') {
	          if (usage[version] < popularity) {
	            result.push(version)
	          }
	        } else if (sign === '<=') {
	          if (usage[version] <= popularity) {
	            result.push(version)
	          }
	        } else if (usage[version] >= popularity) {
	          result.push(version)
	        }
	        return result
	      }, [])
	    }
	  },
	  {
	    regexp: /^(>=?|<=?)\s*(\d*\.?\d+)%\s+in\s+((alt-)?\w\w)$/,
	    select: function (context, sign, popularity, place) {
	      popularity = parseFloat(popularity)
	
	      if (place.length === 2) {
	        place = place.toUpperCase()
	      } else {
	        place = place.toLowerCase()
	      }
	
	      env.loadCountry(browserslist.usage, place)
	      var usage = browserslist.usage[place]
	
	      return Object.keys(usage).reduce(function (result, version) {
	        if (sign === '>') {
	          if (usage[version] > popularity) {
	            result.push(version)
	          }
	        } else if (sign === '<') {
	          if (usage[version] < popularity) {
	            result.push(version)
	          }
	        } else if (sign === '<=') {
	          if (usage[version] <= popularity) {
	            result.push(version)
	          }
	        } else if (usage[version] >= popularity) {
	          result.push(version)
	        }
	        return result
	      }, [])
	    }
	  },
	  {
	    regexp: /^cover\s+(\d*\.?\d+)%(\s+in\s+(my\s+stats|(alt-)?\w\w))?$/,
	    select: function (context, coverage, statMode) {
	      coverage = parseFloat(coverage)
	
	      var usage = browserslist.usage.global
	      if (statMode) {
	        if (statMode.match(/^\s+in\s+my\s+stats$/)) {
	          if (!context.customUsage) {
	            throw new BrowserslistError(
	              'Custom usage statistics was not provided'
	            )
	          }
	          usage = context.customUsage
	        } else {
	          var match = statMode.match(/\s+in\s+((alt-)?\w\w)/)
	          var place = match[1]
	          if (place.length === 2) {
	            place = place.toUpperCase()
	          } else {
	            place = place.toLowerCase()
	          }
	          env.loadCountry(browserslist.usage, place)
	          usage = browserslist.usage[place]
	        }
	      }
	
	      var versions = Object.keys(usage).sort(function (a, b) {
	        return usage[b] - usage[a]
	      })
	
	      var coveraged = 0
	      var result = []
	      var version
	      for (var i = 0; i <= versions.length; i++) {
	        version = versions[i]
	        if (usage[version] === 0) break
	
	        coveraged += usage[version]
	        result.push(version)
	        if (coveraged >= coverage) break
	      }
	
	      return result
	    }
	  },
	  {
	    regexp: /^electron\s+([\d.]+)\s*-\s*([\d.]+)$/i,
	    select: function (context, from, to) {
	      if (!e2c[from]) {
	        throw new BrowserslistError('Unknown version ' + from + ' of electron')
	      }
	      if (!e2c[to]) {
	        throw new BrowserslistError('Unknown version ' + to + ' of electron')
	      }
	
	      from = parseFloat(from)
	      to = parseFloat(to)
	
	      return Object.keys(e2c).filter(function (i) {
	        var parsed = parseFloat(i)
	        return parsed >= from && parsed <= to
	      }).map(function (i) {
	        return 'chrome ' + e2c[i]
	      })
	    }
	  },
	  {
	    regexp: /^(\w+)\s+([\d.]+)\s*-\s*([\d.]+)$/i,
	    select: function (context, name, from, to) {
	      var data = checkName(name)
	      from = parseFloat(normalizeVersion(data, from) || from)
	      to = parseFloat(normalizeVersion(data, to) || to)
	
	      function filter (v) {
	        var parsed = parseFloat(v)
	        return parsed >= from && parsed <= to
	      }
	
	      return data.released.filter(filter).map(nameMapper(data.name))
	    }
	  },
	  {
	    regexp: /^electron\s*(>=?|<=?)\s*([\d.]+)$/i,
	    select: function (context, sign, version) {
	      return Object.keys(e2c)
	        .filter(generateFilter(sign, version))
	        .map(function (i) {
	          return 'chrome ' + e2c[i]
	        })
	    }
	  },
	  {
	    regexp: /^(\w+)\s*(>=?|<=?)\s*([\d.]+)$/,
	    select: function (context, name, sign, version) {
	      var data = checkName(name)
	      var alias = browserslist.versionAliases[data.name][version]
	      if (alias) {
	        version = alias
	      }
	      return data.released
	        .filter(generateFilter(sign, version))
	        .map(function (v) {
	          return data.name + ' ' + v
	        })
	    }
	  },
	  {
	    regexp: /^(firefox|ff|fx)\s+esr$/i,
	    select: function () {
	      return ['firefox 52', 'firefox 60']
	    }
	  },
	  {
	    regexp: /(operamini|op_mini)\s+all/i,
	    select: function () {
	      return ['op_mini all']
	    }
	  },
	  {
	    regexp: /^electron\s+([\d.]+)$/i,
	    select: function (context, version) {
	      var chrome = e2c[version]
	      if (!chrome) {
	        throw new BrowserslistError(
	          'Unknown version ' + version + ' of electron')
	      }
	      return ['chrome ' + chrome]
	    }
	  },
	  {
	    regexp: /^(\w+)\s+(tp|[\d.]+)$/i,
	    select: function (context, name, version) {
	      if (/^tp$/i.test(version)) version = 'TP'
	      var data = checkName(name)
	      var alias = normalizeVersion(data, version)
	      if (alias) {
	        version = alias
	      } else {
	        if (version.indexOf('.') === -1) {
	          alias = version + '.0'
	        } else {
	          alias = version.replace(/\.0$/, '')
	        }
	        alias = normalizeVersion(data, alias)
	        if (alias) {
	          version = alias
	        } else if (context.ignoreUnknownVersions) {
	          return []
	        } else {
	          throw new BrowserslistError(
	            'Unknown version ' + version + ' of ' + name)
	        }
	      }
	      return [data.name + ' ' + version]
	    }
	  },
	  {
	    regexp: /^extends (.+)$/i,
	    select: function (context, name) {
	      return resolve(env.loadQueries(context, name), context)
	    }
	  },
	  {
	    regexp: /^defaults$/i,
	    select: function () {
	      return browserslist(browserslist.defaults)
	    }
	  },
	  {
	    regexp: /^dead$/i,
	    select: function (context) {
	      var dead = ['ie <= 10', 'ie_mob <= 10', 'bb <= 10', 'op_mob <= 12.1']
	      return resolve(dead, context)
	    }
	  },
	  {
	    regexp: /^(\w+)$/i,
	    select: function (context, name) {
	      if (byName(name)) {
	        throw new BrowserslistError(
	          'Specify versions in Browserslist query for browser ' + name)
	      } else {
	        throw unknownQuery(name)
	      }
	    }
	  }
	];
	
	// Get and convert Can I Use data
	
	(function () {
	  for (var name in agents) {
	    var browser = agents[name]
	    browserslist.data[name] = {
	      name: name,
	      versions: normalize(agents[name].versions),
	      released: normalize(agents[name].versions.slice(0, -3)),
	      releaseDate: agents[name].release_date
	    }
	    fillUsage(browserslist.usage.global, name, browser.usage_global)
	
	    browserslist.versionAliases[name] = { }
	    for (var i = 0; i < browser.versions.length; i++) {
	      var full = browser.versions[i]
	      if (!full) continue
	
	      if (full.indexOf('-') !== -1) {
	        var interval = full.split('-')
	        for (var j = 0; j < interval.length; j++) {
	          browserslist.versionAliases[name][interval[j]] = full
	        }
	      }
	    }
	  }
	}())
	
	module.exports = browserslist


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	/* (ignored) */

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	module.exports = {
		"2.0": "61",
		"1.8": "59",
		"1.7": "58",
		"1.6": "56",
		"1.5": "54",
		"1.4": "53",
		"1.3": "52",
		"1.2": "51",
		"1.1": "50",
		"1.0": "49",
		"0.37": "49",
		"0.36": "47",
		"0.35": "45",
		"0.34": "45",
		"0.33": "45",
		"0.32": "45",
		"0.31": "44",
		"0.30": "44",
		"0.29": "43",
		"0.28": "43",
		"0.27": "42",
		"0.26": "42",
		"0.25": "42",
		"0.24": "41",
		"0.23": "41",
		"0.22": "41",
		"0.21": "40",
		"0.20": "39"
	};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.agents = undefined;
	
	var _browsers = __webpack_require__(5);
	
	var _browserVersions = __webpack_require__(7);
	
	var agentsData = __webpack_require__(9);
	
	function unpackBrowserVersions(versionsData) {
	    return Object.keys(versionsData).reduce(function (usage, version) {
	        usage[_browserVersions.browserVersions[version]] = versionsData[version];
	        return usage;
	    }, {});
	}
	
	var agents = exports.agents = Object.keys(agentsData).reduce(function (map, key) {
	    var versionsData = agentsData[key];
	    map[_browsers.browsers[key]] = Object.keys(versionsData).reduce(function (data, entry) {
	        if (entry === 'A') {
	            data.usage_global = unpackBrowserVersions(versionsData[entry]);
	        } else if (entry === 'C') {
	            data.versions = versionsData[entry].reduce(function (list, version) {
	                if (version === '') {
	                    list.push(null);
	                } else {
	                    list.push(_browserVersions.browserVersions[version]);
	                }
	                return list;
	            }, []);
	        } else if (entry === 'D') {
	            data.prefix_exceptions = unpackBrowserVersions(versionsData[entry]);
	        } else if (entry === 'E') {
	            data.browser = versionsData[entry];
	        } else if (entry === 'F') {
	            data.release_date = Object.keys(versionsData[entry]).reduce(function (map, key) {
	                map[_browserVersions.browserVersions[key]] = versionsData[entry][key];
	                return map;
	            }, {});
	        } else {
	            // entry is B
	            data.prefix = versionsData[entry];
	        }
	        return data;
	    }, {});
	    return map;
	}, {});

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var browsers = exports.browsers = __webpack_require__(6);

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	module.exports={A:"ie",B:"edge",C:"firefox",D:"chrome",E:"safari",F:"opera",G:"ios_saf",H:"op_mini",I:"android",J:"bb",K:"op_mob",L:"and_chr",M:"and_ff",N:"ie_mob",O:"and_uc",P:"samsung",Q:"and_qq",R:"baidu"};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var browserVersions = exports.browserVersions = __webpack_require__(8);

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	module.exports={"0":"31","1":"54","2":"55","3":"56","4":"57","5":"58","6":"59","7":"12.1","8":"61","9":"62",A:"10",B:"11",C:"7",D:"12",E:"9",F:"4",G:"8",H:"6",I:"18",J:"15",K:"5",L:"16",M:"46",N:"17",O:"19",P:"20",Q:"21",R:"22",S:"23",T:"24",U:"25",V:"26",W:"27",X:"28",Y:"29",Z:"30",a:"66",b:"32",c:"33",d:"34",e:"35",f:"36",g:"37",h:"38",i:"39",j:"40",k:"41",l:"42",m:"43",n:"44",o:"45",p:"13",q:"47",r:"48",s:"49",t:"50",u:"51",v:"52",w:"53",x:"14",y:"60",z:"11.1",AB:"11.5",BB:"3",CB:"3.2",DB:"4.2-4.3",EB:"5.5",FB:"65",GB:"67",HB:"68",IB:"69",JB:"3.1",KB:"63",LB:"5.1",MB:"6.1",NB:"7.1",OB:"9.1",PB:"10.1",QB:"3.6",RB:"TP",SB:"9.5-9.6",TB:"10.0-10.1",UB:"10.5",VB:"10.6",WB:"3.5",XB:"11.6",YB:"2",ZB:"4.0-4.1",aB:"64",bB:"5.0-5.1",cB:"6.0-6.1",dB:"7.0-7.1",eB:"8.1-8.4",fB:"9.0-9.2",gB:"9.3",hB:"10.0-10.2",iB:"10.3",jB:"11.0-11.2",kB:"11.3",lB:"all",mB:"2.1",nB:"2.2",oB:"2.3",pB:"4.1",qB:"4.4",rB:"4.4.3-4.4.4",sB:"11.8",tB:"6.2",uB:"1.2",vB:"7.12"};


/***/ }),
/* 9 */
/***/ (function(module, exports) {

	module.exports={A:{A:{H:0.0135751,C:0.0135751,G:0.181002,E:0.126701,A:0.0995509,B:2.7105,EB:0.009298},B:"ms",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","EB","H","C","G","E","A","B","","",""],E:"IE",F:{EB:962323200,H:998870400,C:1161129600,G:1237420800,E:1300060800,A:1346716800,B:1381968000}},B:{A:{D:0.026502,p:0.030919,x:0.075089,J:0.083923,L:1.27651,N:0.362194,I:0},B:"ms",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","D","p","x","J","L","N","I","",""],E:"Edge",F:{D:1438128000,p:1447286400,x:1470096000,J:1491868800,L:1508198400,N:1525046400,I:null}},C:{A:{"0":0.017668,"1":0.030919,"2":0.035336,"3":0.097174,"4":0.061838,"5":0.066255,"6":1.97882,"8":0.066255,"9":0,YB:0.008834,BB:0.004417,F:0.013299,K:0.004879,H:0.020136,C:0.005725,G:0.008834,E:0.00533,A:0.004283,B:0.004417,D:0.004471,p:0.004486,x:0.00453,J:0.008834,L:0.004417,N:0.004349,I:0.004393,O:0.004443,P:0.004283,Q:0.004418,R:0.004393,S:0.008834,T:0.008786,U:0.004417,V:0.004393,W:0.004393,X:0.004418,Y:0.008834,Z:0.004417,b:0.004471,c:0.008834,d:0.013251,e:0.004417,f:0.008834,g:0.008834,h:0.048587,i:0.008834,j:0.013251,k:0.013251,l:0.008834,m:0.026502,n:0.008834,o:0.030919,M:0.008834,q:0.061838,r:0.119259,s:0.022085,t:0.030919,u:0.053004,v:0.437283,w:0.022085,y:1.63871,WB:0.008786,QB:0.008834},B:"moz",C:["","","YB","BB","WB","QB","F","K","H","C","G","E","A","B","D","p","x","J","L","N","I","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","b","c","d","e","f","g","h","i","j","k","l","m","n","o","M","q","r","s","t","u","v","w","1","2","3","4","5","6","y","8","9",""],E:"Firefox",F:{"0":1405987200,"1":1497312000,"2":1502150400,"3":1506556800,"4":1510617600,"5":1516665600,"6":1520985600,"8":null,"9":null,YB:1161648000,BB:1213660800,WB:1246320000,QB:1264032000,F:1300752000,K:1308614400,H:1313452800,C:1317081600,G:1317081600,E:1320710400,A:1324339200,B:1327968000,D:1331596800,p:1335225600,x:1338854400,J:1342483200,L:1346112000,N:1349740800,I:1353628800,O:1357603200,P:1361232000,Q:1364860800,R:1368489600,S:1372118400,T:1375747200,U:1379376000,V:1386633600,W:1391472000,X:1395100800,Y:1398729600,Z:1402358400,b:1409616000,c:1413244800,d:1417392000,e:1421107200,f:1424736000,g:1428278400,h:1431475200,i:1435881600,j:1439251200,k:1442880000,l:1446508800,m:1450137600,n:1453852800,o:1457395200,M:1461628800,q:1465257600,r:1470096000,s:1474329600,t:1479168000,u:1485216000,v:1488844800,w:1492560000,y:1525824000}},D:{A:{"0":0.026502,"1":0.075089,"2":0.340109,"3":0.114842,"4":0.075089,"5":0.13251,"6":0.083923,"8":0.110425,"9":0.159012,F:0.004706,K:0.004879,H:0.004879,C:0.005591,G:0.005591,E:0.005591,A:0.004534,B:0.008834,D:0.004283,p:0.004879,x:0.004706,J:0.009154,L:0.004393,N:0.004393,I:0.013251,O:0.004418,P:0.004393,Q:0.004417,R:0.013251,S:0.008786,T:0.017668,U:0.008834,V:0.008834,W:0.004471,X:0.008834,Y:0.092757,Z:0.017668,b:0.008834,c:0.013251,d:0.017668,e:0.017668,f:0.017668,g:0.022085,h:0.030919,i:0.013251,j:0.017668,k:0.013251,l:0.022085,m:0.061838,n:0.013251,o:0.030919,M:0.017668,q:0.030919,r:0.035336,s:0.711137,t:0.026502,u:0.04417,v:0.053004,w:0.022085,y:0.123676,KB:0.454951,aB:0.340109,FB:1.91698,a:23.0921,GB:0.194348,HB:0.04417,IB:0},B:"webkit",C:["F","K","H","C","G","E","A","B","D","p","x","J","L","N","I","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","b","c","d","e","f","g","h","i","j","k","l","m","n","o","M","q","r","s","t","u","v","w","1","2","3","4","5","6","y","8","9","KB","aB","FB","a","GB","HB","IB"],E:"Chrome",F:{"0":1384214400,"1":1476230400,"2":1480550400,"3":1485302400,"4":1489017600,"5":1492560000,"6":1496707200,"8":1504569600,"9":1508198400,F:1264377600,K:1274745600,H:1283385600,C:1287619200,G:1291248000,E:1296777600,A:1299542400,B:1303862400,D:1307404800,p:1312243200,x:1316131200,J:1316131200,L:1319500800,N:1323734400,I:1328659200,O:1332892800,P:1337040000,Q:1340668800,R:1343692800,S:1348531200,T:1352246400,U:1357862400,V:1361404800,W:1364428800,X:1369094400,Y:1374105600,Z:1376956800,b:1389657600,c:1392940800,d:1397001600,e:1400544000,f:1405468800,g:1409011200,h:1412640000,i:1416268800,j:1421798400,k:1425513600,l:1429401600,m:1432080000,n:1437523200,o:1441152000,M:1444780800,q:1449014400,r:1453248000,s:1456963200,t:1460592000,u:1464134400,v:1469059200,w:1472601600,y:1500940800,KB:1512518400,aB:1516752000,FB:1520294400,a:1526515200,GB:null,HB:null,IB:null}},E:{A:{F:0,K:0.013251,H:0.004349,C:0.004417,G:0.039753,E:0.039753,A:0.083923,B:0.388696,JB:0,CB:0.008692,LB:0.079506,MB:0.013251,NB:0.004283,OB:0.150178,PB:0.273854,z:1.2986,RB:0},B:"webkit",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","JB","CB","F","K","LB","H","MB","C","NB","G","E","OB","A","PB","B","z","RB","",""],E:"Safari",F:{JB:1205798400,CB:1226534400,F:1244419200,K:1275868800,LB:1311120000,H:1343174400,MB:1382400000,C:1382400000,NB:1410998400,G:1413417600,E:1443657600,OB:1458518400,A:1474329600,PB:1490572800,B:1505779200,z:1522281600,RB:null}},F:{A:{"0":0.004417,"7":0.035336,E:0.0082,B:0.016581,D:0.008786,J:0.00685,L:0.00685,N:0.00685,I:0.005014,O:0.006015,P:0.004879,Q:0.006597,R:0.006597,S:0.013434,T:0.006702,U:0.006015,V:0.005595,W:0.004393,X:0.008698,Y:0.004879,Z:0.004879,b:0.005152,c:0.005014,d:0.009758,e:0.004879,f:0.030919,g:0.004283,h:0.004367,i:0.004534,j:0.004367,k:0.004227,l:0.004418,m:0.008668,n:0.004227,o:0.004471,M:0.004417,q:0.008942,r:0.004417,s:0.008834,t:0.008834,u:0.008834,v:0.671384,w:0.167846,SB:0.00685,TB:0.004417,UB:0.008392,VB:0.004706,z:0.006229,AB:0.004879,XB:0.008786},B:"webkit",C:["","","","","","","","","","","","","","E","SB","TB","UB","VB","B","z","AB","XB","D","7","J","L","N","I","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","b","c","d","e","f","g","h","i","j","k","l","m","n","o","M","q","r","s","t","u","v","w","","",""],E:"Opera",F:{"0":1438646400,"7":1352073600,E:1150761600,SB:1223424000,TB:1251763200,UB:1267488000,VB:1277942400,B:1292457600,z:1302566400,AB:1309219200,XB:1323129600,D:1323129600,J:1372723200,L:1377561600,N:1381104000,I:1386288000,O:1390867200,P:1393891200,Q:1399334400,R:1401753600,S:1405987200,T:1409616000,U:1413331200,V:1417132800,W:1422316800,X:1425945600,Y:1430179200,Z:1433808000,b:1442448000,c:1445904000,d:1449100800,e:1454371200,f:1457308800,g:1462320000,h:1465344000,i:1470096000,j:1474329600,k:1477267200,l:1481587200,m:1486425600,n:1490054400,o:1494374400,M:1498003200,q:1502236800,r:1506470400,s:1510099200,t:1515024000,u:1517961600,v:1521676800,w:1525910400},D:{"7":"o",E:"o",B:"o",D:"o",SB:"o",TB:"o",UB:"o",VB:"o",z:"o",AB:"o",XB:"o"}},G:{A:{G:0.00975064,CB:0.000975064,ZB:0,DB:0.00195013,bB:0.015601,cB:0.00975064,dB:0.0409527,eB:0.0692296,fB:0.0546036,gB:0.337372,hB:0.312996,iB:0.715697,jB:2.12954,kB:5.98982},B:"webkit",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","CB","ZB","DB","bB","cB","dB","G","eB","fB","gB","hB","iB","jB","kB","","",""],E:"iOS Safari",F:{CB:1270252800,ZB:1283904000,DB:1299628800,bB:1331078400,cB:1359331200,dB:1394409600,G:1410912000,eB:1413763200,fB:1442361600,gB:1458518400,hB:1473724800,iB:1490572800,jB:1505779200,kB:1522281600}},H:{A:{lB:2.64857},B:"o",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","lB","","",""],E:"Opera Mini",F:{lB:1426464000}},I:{A:{BB:0,F:0,a:0,mB:0,nB:0,oB:0,pB:0.0657364,DB:0.150713,qB:0.569181,rB:0.347922},B:"webkit",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","mB","nB","oB","BB","F","pB","DB","qB","rB","a","","",""],E:"Android Browser",F:{mB:1256515200,nB:1274313600,oB:1291593600,BB:1298332800,F:1318896000,pB:1341792000,DB:1374624000,qB:1386547200,rB:1401667200,a:1494115200}},J:{A:{C:0.0100512,A:0.0402048},B:"webkit",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","C","A","","",""],E:"Blackberry Browser",F:{C:1325376000,A:1359504000}},K:{A:{"7":0,A:0,B:0,D:0,M:0.0111391,z:0,AB:0},B:"o",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","A","B","z","AB","D","7","M","","",""],E:"Opera Mobile",F:{"7":1349740800,A:1287100800,B:1300752000,z:1314835200,AB:1318291200,D:1330300800,M:1474588800},D:{M:"webkit"}},L:{A:{a:30.4427},B:"webkit",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","a","","",""],E:"Chrome for Android",F:{a:1523923200}},M:{A:{y:0.16752},B:"moz",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","y","","",""],E:"Firefox for Android",F:{y:1525824000}},N:{A:{A:0.023732,B:0.166124},B:"ms",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","A","B","","",""],E:"IE Mobile",F:{A:1340150400,B:1353456000}},O:{A:{sB:8.31458},B:"webkit",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","sB","","",""],E:"UC Browser for Android",F:{sB:1471392000},D:{sB:"webkit"}},P:{A:{F:0.854848,K:0.185389,tB:1.47281},B:"webkit",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","F","K","tB","","",""],E:"Samsung Internet",F:{F:1461024000,K:1481846400,tB:1509408000}},Q:{A:{uB:0},B:"webkit",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","uB","","",""],E:"QQ Browser",F:{uB:1483228800}},R:{A:{vB:0},B:"webkit",C:["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","vB","","",""],E:"Baidu Browser",F:{vB:1491004800}}};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

	function BrowserslistError (message) {
	  this.name = 'BrowserslistError'
	  this.message = message
	  this.browserslist = true
	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, BrowserslistError)
	  }
	}
	
	BrowserslistError.prototype = Error.prototype
	
	module.exports = BrowserslistError


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	var BrowserslistError = __webpack_require__(10)
	
	function noop () { }
	
	module.exports = {
	  loadQueries: function loadQueries () {
	    throw new BrowserslistError(
	      'Sharable configs are not supported in client-side build of Browserslist')
	  },
	
	  getStat: function getStat (opts) {
	    return opts.stats
	  },
	
	  loadConfig: function loadConfig (opts) {
	    if (opts.config) {
	      throw new BrowserslistError(
	        'Browserslist config are not supported in client-side build')
	    }
	  },
	
	  loadCountry: function loadCountry () {
	    throw new BrowserslistError(
	      'Country statistics is not supported ' +
	      'in client-side build of Browserslist')
	  },
	
	  parseConfig: noop,
	
	  readConfig: noop,
	
	  findConfig: noop,
	
	  clearCaches: noop
	}


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * UAParser.js v0.7.18
	 * Lightweight JavaScript-based User-Agent string parser
	 * https://github.com/faisalman/ua-parser-js
	 *
	 * Copyright © 2012-2016 Faisal Salman <fyzlman@gmail.com>
	 * Dual licensed under GPLv2 or MIT
	 */
	
	(function (window, undefined) {
	
	    'use strict';
	
	    //////////////
	    // Constants
	    /////////////
	
	
	    var LIBVERSION  = '0.7.18',
	        EMPTY       = '',
	        UNKNOWN     = '?',
	        FUNC_TYPE   = 'function',
	        UNDEF_TYPE  = 'undefined',
	        OBJ_TYPE    = 'object',
	        STR_TYPE    = 'string',
	        MAJOR       = 'major', // deprecated
	        MODEL       = 'model',
	        NAME        = 'name',
	        TYPE        = 'type',
	        VENDOR      = 'vendor',
	        VERSION     = 'version',
	        ARCHITECTURE= 'architecture',
	        CONSOLE     = 'console',
	        MOBILE      = 'mobile',
	        TABLET      = 'tablet',
	        SMARTTV     = 'smarttv',
	        WEARABLE    = 'wearable',
	        EMBEDDED    = 'embedded';
	
	
	    ///////////
	    // Helper
	    //////////
	
	
	    var util = {
	        extend : function (regexes, extensions) {
	            var margedRegexes = {};
	            for (var i in regexes) {
	                if (extensions[i] && extensions[i].length % 2 === 0) {
	                    margedRegexes[i] = extensions[i].concat(regexes[i]);
	                } else {
	                    margedRegexes[i] = regexes[i];
	                }
	            }
	            return margedRegexes;
	        },
	        has : function (str1, str2) {
	          if (typeof str1 === "string") {
	            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
	          } else {
	            return false;
	          }
	        },
	        lowerize : function (str) {
	            return str.toLowerCase();
	        },
	        major : function (version) {
	            return typeof(version) === STR_TYPE ? version.replace(/[^\d\.]/g,'').split(".")[0] : undefined;
	        },
	        trim : function (str) {
	          return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	        }
	    };
	
	
	    ///////////////
	    // Map helper
	    //////////////
	
	
	    var mapper = {
	
	        rgx : function (ua, arrays) {
	
	            //var result = {},
	            var i = 0, j, k, p, q, matches, match;//, args = arguments;
	
	            /*// construct object barebones
	            for (p = 0; p < args[1].length; p++) {
	                q = args[1][p];
	                result[typeof q === OBJ_TYPE ? q[0] : q] = undefined;
	            }*/
	
	            // loop through all regexes maps
	            while (i < arrays.length && !matches) {
	
	                var regex = arrays[i],       // even sequence (0,2,4,..)
	                    props = arrays[i + 1];   // odd sequence (1,3,5,..)
	                j = k = 0;
	
	                // try matching uastring with regexes
	                while (j < regex.length && !matches) {
	
	                    matches = regex[j++].exec(ua);
	
	                    if (!!matches) {
	                        for (p = 0; p < props.length; p++) {
	                            match = matches[++k];
	                            q = props[p];
	                            // check if given property is actually array
	                            if (typeof q === OBJ_TYPE && q.length > 0) {
	                                if (q.length == 2) {
	                                    if (typeof q[1] == FUNC_TYPE) {
	                                        // assign modified match
	                                        this[q[0]] = q[1].call(this, match);
	                                    } else {
	                                        // assign given value, ignore regex match
	                                        this[q[0]] = q[1];
	                                    }
	                                } else if (q.length == 3) {
	                                    // check whether function or regex
	                                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
	                                        // call function (usually string mapper)
	                                        this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
	                                    } else {
	                                        // sanitize match using given regex
	                                        this[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
	                                    }
	                                } else if (q.length == 4) {
	                                        this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
	                                }
	                            } else {
	                                this[q] = match ? match : undefined;
	                            }
	                        }
	                    }
	                }
	                i += 2;
	            }
	            // console.log(this);
	            //return this;
	        },
	
	        str : function (str, map) {
	
	            for (var i in map) {
	                // check if array
	                if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
	                    for (var j = 0; j < map[i].length; j++) {
	                        if (util.has(map[i][j], str)) {
	                            return (i === UNKNOWN) ? undefined : i;
	                        }
	                    }
	                } else if (util.has(map[i], str)) {
	                    return (i === UNKNOWN) ? undefined : i;
	                }
	            }
	            return str;
	        }
	    };
	
	
	    ///////////////
	    // String map
	    //////////////
	
	
	    var maps = {
	
	        browser : {
	            oldsafari : {
	                version : {
	                    '1.0'   : '/8',
	                    '1.2'   : '/1',
	                    '1.3'   : '/3',
	                    '2.0'   : '/412',
	                    '2.0.2' : '/416',
	                    '2.0.3' : '/417',
	                    '2.0.4' : '/419',
	                    '?'     : '/'
	                }
	            }
	        },
	
	        device : {
	            amazon : {
	                model : {
	                    'Fire Phone' : ['SD', 'KF']
	                }
	            },
	            sprint : {
	                model : {
	                    'Evo Shift 4G' : '7373KT'
	                },
	                vendor : {
	                    'HTC'       : 'APA',
	                    'Sprint'    : 'Sprint'
	                }
	            }
	        },
	
	        os : {
	            windows : {
	                version : {
	                    'ME'        : '4.90',
	                    'NT 3.11'   : 'NT3.51',
	                    'NT 4.0'    : 'NT4.0',
	                    '2000'      : 'NT 5.0',
	                    'XP'        : ['NT 5.1', 'NT 5.2'],
	                    'Vista'     : 'NT 6.0',
	                    '7'         : 'NT 6.1',
	                    '8'         : 'NT 6.2',
	                    '8.1'       : 'NT 6.3',
	                    '10'        : ['NT 6.4', 'NT 10.0'],
	                    'RT'        : 'ARM'
	                }
	            }
	        }
	    };
	
	
	    //////////////
	    // Regex map
	    /////////////
	
	
	    var regexes = {
	
	        browser : [[
	
	            // Presto based
	            /(opera\smini)\/([\w\.-]+)/i,                                       // Opera Mini
	            /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,                      // Opera Mobi/Tablet
	            /(opera).+version\/([\w\.]+)/i,                                     // Opera > 9.80
	            /(opera)[\/\s]+([\w\.]+)/i                                          // Opera < 9.80
	            ], [NAME, VERSION], [
	
	            /(opios)[\/\s]+([\w\.]+)/i                                          // Opera mini on iphone >= 8.0
	            ], [[NAME, 'Opera Mini'], VERSION], [
	
	            /\s(opr)\/([\w\.]+)/i                                               // Opera Webkit
	            ], [[NAME, 'Opera'], VERSION], [
	
	            // Mixed
	            /(kindle)\/([\w\.]+)/i,                                             // Kindle
	            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]*)/i,
	                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer
	
	            // Trident based
	            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,
	                                                                                // Avant/IEMobile/SlimBrowser/Baidu
	            /(?:ms|\()(ie)\s([\w\.]+)/i,                                        // Internet Explorer
	
	            // Webkit/KHTML based
	            /(rekonq)\/([\w\.]*)/i,                                             // Rekonq
	            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark)\/([\w\.-]+)/i
	                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser
	            ], [NAME, VERSION], [
	
	            /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i                         // IE11
	            ], [[NAME, 'IE'], VERSION], [
	
	            /(edge|edgios|edgea)\/((\d+)?[\w\.]+)/i                             // Microsoft Edge
	            ], [[NAME, 'Edge'], VERSION], [
	
	            /(yabrowser)\/([\w\.]+)/i                                           // Yandex
	            ], [[NAME, 'Yandex'], VERSION], [
	
	            /(puffin)\/([\w\.]+)/i                                              // Puffin
	            ], [[NAME, 'Puffin'], VERSION], [
	
	            /((?:[\s\/])uc?\s?browser|(?:juc.+)ucweb)[\/\s]?([\w\.]+)/i
	                                                                                // UCBrowser
	            ], [[NAME, 'UCBrowser'], VERSION], [
	
	            /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
	            ], [[NAME, /_/g, ' '], VERSION], [
	
	            /(micromessenger)\/([\w\.]+)/i                                      // WeChat
	            ], [[NAME, 'WeChat'], VERSION], [
	
	            /(qqbrowserlite)\/([\w\.]+)/i                                       // QQBrowserLite
	            ], [NAME, VERSION], [
	
	            /(QQ)\/([\d\.]+)/i                                                  // QQ, aka ShouQ
	            ], [NAME, VERSION], [
	
	            /m?(qqbrowser)[\/\s]?([\w\.]+)/i                                    // QQBrowser
	            ], [NAME, VERSION], [
	
	            /(BIDUBrowser)[\/\s]?([\w\.]+)/i                                    // Baidu Browser
	            ], [NAME, VERSION], [
	
	            /(2345Explorer)[\/\s]?([\w\.]+)/i                                   // 2345 Browser
	            ], [NAME, VERSION], [
	
	            /(MetaSr)[\/\s]?([\w\.]+)/i                                         // SouGouBrowser
	            ], [NAME], [
	
	            /(LBBROWSER)/i                                      // LieBao Browser
	            ], [NAME], [
	
	            /xiaomi\/miuibrowser\/([\w\.]+)/i                                   // MIUI Browser
	            ], [VERSION, [NAME, 'MIUI Browser']], [
	
	            /;fbav\/([\w\.]+);/i                                                // Facebook App for iOS & Android
	            ], [VERSION, [NAME, 'Facebook']], [
	
	            /headlesschrome(?:\/([\w\.]+)|\s)/i                                 // Chrome Headless
	            ], [VERSION, [NAME, 'Chrome Headless']], [
	
	            /\swv\).+(chrome)\/([\w\.]+)/i                                      // Chrome WebView
	            ], [[NAME, /(.+)/, '$1 WebView'], VERSION], [
	
	            /((?:oculus|samsung)browser)\/([\w\.]+)/i
	            ], [[NAME, /(.+(?:g|us))(.+)/, '$1 $2'], VERSION], [                // Oculus / Samsung Browser
	
	            /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)*/i        // Android Browser
	            ], [VERSION, [NAME, 'Android Browser']], [
	
	            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i
	                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
	            ], [NAME, VERSION], [
	
	            /(dolfin)\/([\w\.]+)/i                                              // Dolphin
	            ], [[NAME, 'Dolphin'], VERSION], [
	
	            /((?:android.+)crmo|crios)\/([\w\.]+)/i                             // Chrome for Android/iOS
	            ], [[NAME, 'Chrome'], VERSION], [
	
	            /(coast)\/([\w\.]+)/i                                               // Opera Coast
	            ], [[NAME, 'Opera Coast'], VERSION], [
	
	            /fxios\/([\w\.-]+)/i                                                // Firefox for iOS
	            ], [VERSION, [NAME, 'Firefox']], [
	
	            /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i                       // Mobile Safari
	            ], [VERSION, [NAME, 'Mobile Safari']], [
	
	            /version\/([\w\.]+).+?(mobile\s?safari|safari)/i                    // Safari & Safari Mobile
	            ], [VERSION, NAME], [
	
	            /webkit.+?(gsa)\/([\w\.]+).+?(mobile\s?safari|safari)(\/[\w\.]+)/i  // Google Search Appliance on iOS
	            ], [[NAME, 'GSA'], VERSION], [
	
	            /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i                     // Safari < 3.0
	            ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [
	
	            /(konqueror)\/([\w\.]+)/i,                                          // Konqueror
	            /(webkit|khtml)\/([\w\.]+)/i
	            ], [NAME, VERSION], [
	
	            // Gecko based
	            /(navigator|netscape)\/([\w\.-]+)/i                                 // Netscape
	            ], [[NAME, 'Netscape'], VERSION], [
	            /(swiftfox)/i,                                                      // Swiftfox
	            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
	                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
	            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([\w\.-]+)$/i,
	
	                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
	            /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,                          // Mozilla
	
	            // Other
	            /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
	                                                                                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
	            /(links)\s\(([\w\.]+)/i,                                            // Links
	            /(gobrowser)\/?([\w\.]*)/i,                                         // GoBrowser
	            /(ice\s?browser)\/v?([\w\._]+)/i,                                   // ICE Browser
	            /(mosaic)[\/\s]([\w\.]+)/i                                          // Mosaic
	            ], [NAME, VERSION]
	
	            /* /////////////////////
	            // Media players BEGIN
	            ////////////////////////
	
	            , [
	
	            /(apple(?:coremedia|))\/((\d+)[\w\._]+)/i,                          // Generic Apple CoreMedia
	            /(coremedia) v((\d+)[\w\._]+)/i
	            ], [NAME, VERSION], [
	
	            /(aqualung|lyssna|bsplayer)\/((\d+)?[\w\.-]+)/i                     // Aqualung/Lyssna/BSPlayer
	            ], [NAME, VERSION], [
	
	            /(ares|ossproxy)\s((\d+)[\w\.-]+)/i                                 // Ares/OSSProxy
	            ], [NAME, VERSION], [
	
	            /(audacious|audimusicstream|amarok|bass|core|dalvik|gnomemplayer|music on console|nsplayer|psp-internetradioplayer|videos)\/((\d+)[\w\.-]+)/i,
	                                                                                // Audacious/AudiMusicStream/Amarok/BASS/OpenCORE/Dalvik/GnomeMplayer/MoC
	                                                                                // NSPlayer/PSP-InternetRadioPlayer/Videos
	            /(clementine|music player daemon)\s((\d+)[\w\.-]+)/i,               // Clementine/MPD
	            /(lg player|nexplayer)\s((\d+)[\d\.]+)/i,
	            /player\/(nexplayer|lg player)\s((\d+)[\w\.-]+)/i                   // NexPlayer/LG Player
	            ], [NAME, VERSION], [
	            /(nexplayer)\s((\d+)[\w\.-]+)/i                                     // Nexplayer
	            ], [NAME, VERSION], [
	
	            /(flrp)\/((\d+)[\w\.-]+)/i                                          // Flip Player
	            ], [[NAME, 'Flip Player'], VERSION], [
	
	            /(fstream|nativehost|queryseekspider|ia-archiver|facebookexternalhit)/i
	                                                                                // FStream/NativeHost/QuerySeekSpider/IA Archiver/facebookexternalhit
	            ], [NAME], [
	
	            /(gstreamer) souphttpsrc (?:\([^\)]+\)){0,1} libsoup\/((\d+)[\w\.-]+)/i
	                                                                                // Gstreamer
	            ], [NAME, VERSION], [
	
	            /(htc streaming player)\s[\w_]+\s\/\s((\d+)[\d\.]+)/i,              // HTC Streaming Player
	            /(java|python-urllib|python-requests|wget|libcurl)\/((\d+)[\w\.-_]+)/i,
	                                                                                // Java/urllib/requests/wget/cURL
	            /(lavf)((\d+)[\d\.]+)/i                                             // Lavf (FFMPEG)
	            ], [NAME, VERSION], [
	
	            /(htc_one_s)\/((\d+)[\d\.]+)/i                                      // HTC One S
	            ], [[NAME, /_/g, ' '], VERSION], [
	
	            /(mplayer)(?:\s|\/)(?:(?:sherpya-){0,1}svn)(?:-|\s)(r\d+(?:-\d+[\w\.-]+){0,1})/i
	                                                                                // MPlayer SVN
	            ], [NAME, VERSION], [
	
	            /(mplayer)(?:\s|\/|[unkow-]+)((\d+)[\w\.-]+)/i                      // MPlayer
	            ], [NAME, VERSION], [
	
	            /(mplayer)/i,                                                       // MPlayer (no other info)
	            /(yourmuze)/i,                                                      // YourMuze
	            /(media player classic|nero showtime)/i                             // Media Player Classic/Nero ShowTime
	            ], [NAME], [
	
	            /(nero (?:home|scout))\/((\d+)[\w\.-]+)/i                           // Nero Home/Nero Scout
	            ], [NAME, VERSION], [
	
	            /(nokia\d+)\/((\d+)[\w\.-]+)/i                                      // Nokia
	            ], [NAME, VERSION], [
	
	            /\s(songbird)\/((\d+)[\w\.-]+)/i                                    // Songbird/Philips-Songbird
	            ], [NAME, VERSION], [
	
	            /(winamp)3 version ((\d+)[\w\.-]+)/i,                               // Winamp
	            /(winamp)\s((\d+)[\w\.-]+)/i,
	            /(winamp)mpeg\/((\d+)[\w\.-]+)/i
	            ], [NAME, VERSION], [
	
	            /(ocms-bot|tapinradio|tunein radio|unknown|winamp|inlight radio)/i  // OCMS-bot/tap in radio/tunein/unknown/winamp (no other info)
	                                                                                // inlight radio
	            ], [NAME], [
	
	            /(quicktime|rma|radioapp|radioclientapplication|soundtap|totem|stagefright|streamium)\/((\d+)[\w\.-]+)/i
	                                                                                // QuickTime/RealMedia/RadioApp/RadioClientApplication/
	                                                                                // SoundTap/Totem/Stagefright/Streamium
	            ], [NAME, VERSION], [
	
	            /(smp)((\d+)[\d\.]+)/i                                              // SMP
	            ], [NAME, VERSION], [
	
	            /(vlc) media player - version ((\d+)[\w\.]+)/i,                     // VLC Videolan
	            /(vlc)\/((\d+)[\w\.-]+)/i,
	            /(xbmc|gvfs|xine|xmms|irapp)\/((\d+)[\w\.-]+)/i,                    // XBMC/gvfs/Xine/XMMS/irapp
	            /(foobar2000)\/((\d+)[\d\.]+)/i,                                    // Foobar2000
	            /(itunes)\/((\d+)[\d\.]+)/i                                         // iTunes
	            ], [NAME, VERSION], [
	
	            /(wmplayer)\/((\d+)[\w\.-]+)/i,                                     // Windows Media Player
	            /(windows-media-player)\/((\d+)[\w\.-]+)/i
	            ], [[NAME, /-/g, ' '], VERSION], [
	
	            /windows\/((\d+)[\w\.-]+) upnp\/[\d\.]+ dlnadoc\/[\d\.]+ (home media server)/i
	                                                                                // Windows Media Server
	            ], [VERSION, [NAME, 'Windows']], [
	
	            /(com\.riseupradioalarm)\/((\d+)[\d\.]*)/i                          // RiseUP Radio Alarm
	            ], [NAME, VERSION], [
	
	            /(rad.io)\s((\d+)[\d\.]+)/i,                                        // Rad.io
	            /(radio.(?:de|at|fr))\s((\d+)[\d\.]+)/i
	            ], [[NAME, 'rad.io'], VERSION]
	
	            //////////////////////
	            // Media players END
	            ////////////////////*/
	
	        ],
	
	        cpu : [[
	
	            /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i                     // AMD64
	            ], [[ARCHITECTURE, 'amd64']], [
	
	            /(ia32(?=;))/i                                                      // IA32 (quicktime)
	            ], [[ARCHITECTURE, util.lowerize]], [
	
	            /((?:i[346]|x)86)[;\)]/i                                            // IA32
	            ], [[ARCHITECTURE, 'ia32']], [
	
	            // PocketPC mistakenly identified as PowerPC
	            /windows\s(ce|mobile);\sppc;/i
	            ], [[ARCHITECTURE, 'arm']], [
	
	            /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i                           // PowerPC
	            ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [
	
	            /(sun4\w)[;\)]/i                                                    // SPARC
	            ], [[ARCHITECTURE, 'sparc']], [
	
	            /((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
	                                                                                // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
	            ], [[ARCHITECTURE, util.lowerize]]
	        ],
	
	        device : [[
	
	            /\((ipad|playbook);[\w\s\);-]+(rim|apple)/i                         // iPad/PlayBook
	            ], [MODEL, VENDOR, [TYPE, TABLET]], [
	
	            /applecoremedia\/[\w\.]+ \((ipad)/                                  // iPad
	            ], [MODEL, [VENDOR, 'Apple'], [TYPE, TABLET]], [
	
	            /(apple\s{0,1}tv)/i                                                 // Apple TV
	            ], [[MODEL, 'Apple TV'], [VENDOR, 'Apple']], [
	
	            /(archos)\s(gamepad2?)/i,                                           // Archos
	            /(hp).+(touchpad)/i,                                                // HP TouchPad
	            /(hp).+(tablet)/i,                                                  // HP Tablet
	            /(kindle)\/([\w\.]+)/i,                                             // Kindle
	            /\s(nook)[\w\s]+build\/(\w+)/i,                                     // Nook
	            /(dell)\s(strea[kpr\s\d]*[\dko])/i                                  // Dell Streak
	            ], [VENDOR, MODEL, [TYPE, TABLET]], [
	
	            /(kf[A-z]+)\sbuild\/.+silk\//i                                      // Kindle Fire HD
	            ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
	            /(sd|kf)[0349hijorstuw]+\sbuild\/.+silk\//i                         // Fire Phone
	            ], [[MODEL, mapper.str, maps.device.amazon.model], [VENDOR, 'Amazon'], [TYPE, MOBILE]], [
	
	            /\((ip[honed|\s\w*]+);.+(apple)/i                                   // iPod/iPhone
	            ], [MODEL, VENDOR, [TYPE, MOBILE]], [
	            /\((ip[honed|\s\w*]+);/i                                            // iPod/iPhone
	            ], [MODEL, [VENDOR, 'Apple'], [TYPE, MOBILE]], [
	
	            /(blackberry)[\s-]?(\w+)/i,                                         // BlackBerry
	            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[\s_-]?([\w-]*)/i,
	                                                                                // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
	            /(hp)\s([\w\s]+\w)/i,                                               // HP iPAQ
	            /(asus)-?(\w+)/i                                                    // Asus
	            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
	            /\(bb10;\s(\w+)/i                                                   // BlackBerry 10
	            ], [MODEL, [VENDOR, 'BlackBerry'], [TYPE, MOBILE]], [
	                                                                                // Asus Tablets
	            /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7|padfone)/i
	            ], [MODEL, [VENDOR, 'Asus'], [TYPE, TABLET]], [
	
	            /(sony)\s(tablet\s[ps])\sbuild\//i,                                  // Sony
	            /(sony)?(?:sgp.+)\sbuild\//i
	            ], [[VENDOR, 'Sony'], [MODEL, 'Xperia Tablet'], [TYPE, TABLET]], [
	            /android.+\s([c-g]\d{4}|so[-l]\w+)\sbuild\//i
	            ], [MODEL, [VENDOR, 'Sony'], [TYPE, MOBILE]], [
	
	            /\s(ouya)\s/i,                                                      // Ouya
	            /(nintendo)\s([wids3u]+)/i                                          // Nintendo
	            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [
	
	            /android.+;\s(shield)\sbuild/i                                      // Nvidia
	            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [
	
	            /(playstation\s[34portablevi]+)/i                                   // Playstation
	            ], [MODEL, [VENDOR, 'Sony'], [TYPE, CONSOLE]], [
	
	            /(sprint\s(\w+))/i                                                  // Sprint Phones
	            ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [
	
	            /(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i                         // Lenovo tablets
	            ], [VENDOR, MODEL, [TYPE, TABLET]], [
	
	            /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,                               // HTC
	            /(zte)-(\w*)/i,                                                     // ZTE
	            /(alcatel|geeksphone|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]*)/i
	                                                                                // Alcatel/GeeksPhone/Lenovo/Nexian/Panasonic/Sony
	            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [
	
	            /(nexus\s9)/i                                                       // HTC Nexus 9
	            ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [
	
	            /d\/huawei([\w\s-]+)[;\)]/i,
	            /(nexus\s6p)/i                                                      // Huawei
	            ], [MODEL, [VENDOR, 'Huawei'], [TYPE, MOBILE]], [
	
	            /(microsoft);\s(lumia[\s\w]+)/i                                     // Microsoft Lumia
	            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
	
	            /[\s\(;](xbox(?:\sone)?)[\s\);]/i                                   // Microsoft Xbox
	            ], [MODEL, [VENDOR, 'Microsoft'], [TYPE, CONSOLE]], [
	            /(kin\.[onetw]{3})/i                                                // Microsoft Kin
	            ], [[MODEL, /\./g, ' '], [VENDOR, 'Microsoft'], [TYPE, MOBILE]], [
	
	                                                                                // Motorola
	            /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?:?(\s4g)?)[\w\s]+build\//i,
	            /mot[\s-]?(\w*)/i,
	            /(XT\d{3,4}) build\//i,
	            /(nexus\s6)/i
	            ], [MODEL, [VENDOR, 'Motorola'], [TYPE, MOBILE]], [
	            /android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i
	            ], [MODEL, [VENDOR, 'Motorola'], [TYPE, TABLET]], [
	
	            /hbbtv\/\d+\.\d+\.\d+\s+\([\w\s]*;\s*(\w[^;]*);([^;]*)/i            // HbbTV devices
	            ], [[VENDOR, util.trim], [MODEL, util.trim], [TYPE, SMARTTV]], [
	
	            /hbbtv.+maple;(\d+)/i
	            ], [[MODEL, /^/, 'SmartTV'], [VENDOR, 'Samsung'], [TYPE, SMARTTV]], [
	
	            /\(dtv[\);].+(aquos)/i                                              // Sharp
	            ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [
	
	            /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n\d+|sgh-t8[56]9|nexus 10))/i,
	            /((SM-T\w+))/i
	            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [                  // Samsung
	            /smart-tv.+(samsung)/i
	            ], [VENDOR, [TYPE, SMARTTV], MODEL], [
	            /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-\w[\w\d]+))/i,
	            /(sam[sung]*)[\s-]*(\w+-?[\w-]*)/i,
	            /sec-((sgh\w+))/i
	            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [
	
	            /sie-(\w*)/i                                                        // Siemens
	            ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [
	
	            /(maemo|nokia).*(n900|lumia\s\d+)/i,                                // Nokia
	            /(nokia)[\s_-]?([\w-]*)/i
	            ], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [
	
	            /android\s3\.[\s\w;-]{10}(a\d{3})/i                                 // Acer
	            ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [
	
	            /android.+([vl]k\-?\d{3})\s+build/i                                 // LG Tablet
	            ], [MODEL, [VENDOR, 'LG'], [TYPE, TABLET]], [
	            /android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i                     // LG Tablet
	            ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
	            /(lg) netcast\.tv/i                                                 // LG SmartTV
	            ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
	            /(nexus\s[45])/i,                                                   // LG
	            /lg[e;\s\/-]+(\w*)/i,
	            /android.+lg(\-?[\d\w]+)\s+build/i
	            ], [MODEL, [VENDOR, 'LG'], [TYPE, MOBILE]], [
	
	            /android.+(ideatab[a-z0-9\-\s]+)/i                                  // Lenovo
	            ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [
	
	            /linux;.+((jolla));/i                                               // Jolla
	            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
	
	            /((pebble))app\/[\d\.]+\s/i                                         // Pebble
	            ], [VENDOR, MODEL, [TYPE, WEARABLE]], [
	
	            /android.+;\s(oppo)\s?([\w\s]+)\sbuild/i                            // OPPO
	            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
	
	            /crkey/i                                                            // Google Chromecast
	            ], [[MODEL, 'Chromecast'], [VENDOR, 'Google']], [
	
	            /android.+;\s(glass)\s\d/i                                          // Google Glass
	            ], [MODEL, [VENDOR, 'Google'], [TYPE, WEARABLE]], [
	
	            /android.+;\s(pixel c)\s/i                                          // Google Pixel C
	            ], [MODEL, [VENDOR, 'Google'], [TYPE, TABLET]], [
	
	            /android.+;\s(pixel xl|pixel)\s/i                                   // Google Pixel
	            ], [MODEL, [VENDOR, 'Google'], [TYPE, MOBILE]], [
	
	            /android.+;\s(\w+)\s+build\/hm\1/i,                                 // Xiaomi Hongmi 'numeric' models
	            /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,               // Xiaomi Hongmi
	            /android.+(mi[\s\-_]*(?:one|one[\s_]plus|note lte)?[\s_]*(?:\d?\w?)[\s_]*(?:plus)?)\s+build/i,    // Xiaomi Mi
	            /android.+(redmi[\s\-_]*(?:note)?(?:[\s_]*[\w\s]+))\s+build/i       // Redmi Phones
	            ], [[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, MOBILE]], [
	            /android.+(mi[\s\-_]*(?:pad)(?:[\s_]*[\w\s]+))\s+build/i            // Mi Pad tablets
	            ],[[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, TABLET]], [
	            /android.+;\s(m[1-5]\snote)\sbuild/i                                // Meizu Tablet
	            ], [MODEL, [VENDOR, 'Meizu'], [TYPE, TABLET]], [
	
	            /android.+a000(1)\s+build/i,                                        // OnePlus
	            /android.+oneplus\s(a\d{4})\s+build/i
	            ], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [
	
	            /android.+[;\/]\s*(RCT[\d\w]+)\s+build/i                            // RCA Tablets
	            ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [
	
	            /android.+[;\/\s]+(Venue[\d\s]{2,7})\s+build/i                      // Dell Venue Tablets
	            ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [
	
	            /android.+[;\/]\s*(Q[T|M][\d\w]+)\s+build/i                         // Verizon Tablet
	            ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [
	
	            /android.+[;\/]\s+(Barnes[&\s]+Noble\s+|BN[RT])(V?.*)\s+build/i     // Barnes & Noble Tablet
	            ], [[VENDOR, 'Barnes & Noble'], MODEL, [TYPE, TABLET]], [
	
	            /android.+[;\/]\s+(TM\d{3}.*\b)\s+build/i                           // Barnes & Noble Tablet
	            ], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [
	
	            /android.+;\s(k88)\sbuild/i                                         // ZTE K Series Tablet
	            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, TABLET]], [
	
	            /android.+[;\/]\s*(gen\d{3})\s+build.*49h/i                         // Swiss GEN Mobile
	            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [
	
	            /android.+[;\/]\s*(zur\d{3})\s+build/i                              // Swiss ZUR Tablet
	            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [
	
	            /android.+[;\/]\s*((Zeki)?TB.*\b)\s+build/i                         // Zeki Tablets
	            ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [
	
	            /(android).+[;\/]\s+([YR]\d{2})\s+build/i,
	            /android.+[;\/]\s+(Dragon[\-\s]+Touch\s+|DT)(\w{5})\sbuild/i        // Dragon Touch Tablet
	            ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [
	
	            /android.+[;\/]\s*(NS-?\w{0,9})\sbuild/i                            // Insignia Tablets
	            ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [
	
	            /android.+[;\/]\s*((NX|Next)-?\w{0,9})\s+build/i                    // NextBook Tablets
	            ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [
	
	            /android.+[;\/]\s*(Xtreme\_)?(V(1[045]|2[015]|30|40|60|7[05]|90))\s+build/i
	            ], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [                    // Voice Xtreme Phones
	
	            /android.+[;\/]\s*(LVTEL\-)?(V1[12])\s+build/i                     // LvTel Phones
	            ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [
	
	            /android.+[;\/]\s*(V(100MD|700NA|7011|917G).*\b)\s+build/i          // Envizen Tablets
	            ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [
	
	            /android.+[;\/]\s*(Le[\s\-]+Pan)[\s\-]+(\w{1,9})\s+build/i          // Le Pan Tablets
	            ], [VENDOR, MODEL, [TYPE, TABLET]], [
	
	            /android.+[;\/]\s*(Trio[\s\-]*.*)\s+build/i                         // MachSpeed Tablets
	            ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [
	
	            /android.+[;\/]\s*(Trinity)[\-\s]*(T\d{3})\s+build/i                // Trinity Tablets
	            ], [VENDOR, MODEL, [TYPE, TABLET]], [
	
	            /android.+[;\/]\s*TU_(1491)\s+build/i                               // Rotor Tablets
	            ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [
	
	            /android.+(KS(.+))\s+build/i                                        // Amazon Kindle Tablets
	            ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
	
	            /android.+(Gigaset)[\s\-]+(Q\w{1,9})\s+build/i                      // Gigaset Tablets
	            ], [VENDOR, MODEL, [TYPE, TABLET]], [
	
	            /\s(tablet|tab)[;\/]/i,                                             // Unidentifiable Tablet
	            /\s(mobile)(?:[;\/]|\ssafari)/i                                     // Unidentifiable Mobile
	            ], [[TYPE, util.lowerize], VENDOR, MODEL], [
	
	            /(android[\w\.\s\-]{0,9});.+build/i                                 // Generic Android Device
	            ], [MODEL, [VENDOR, 'Generic']]
	
	
	        /*//////////////////////////
	            // TODO: move to string map
	            ////////////////////////////
	
	            /(C6603)/i                                                          // Sony Xperia Z C6603
	            ], [[MODEL, 'Xperia Z C6603'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [
	            /(C6903)/i                                                          // Sony Xperia Z 1
	            ], [[MODEL, 'Xperia Z 1'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [
	
	            /(SM-G900[F|H])/i                                                   // Samsung Galaxy S5
	            ], [[MODEL, 'Galaxy S5'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
	            /(SM-G7102)/i                                                       // Samsung Galaxy Grand 2
	            ], [[MODEL, 'Galaxy Grand 2'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
	            /(SM-G530H)/i                                                       // Samsung Galaxy Grand Prime
	            ], [[MODEL, 'Galaxy Grand Prime'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
	            /(SM-G313HZ)/i                                                      // Samsung Galaxy V
	            ], [[MODEL, 'Galaxy V'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
	            /(SM-T805)/i                                                        // Samsung Galaxy Tab S 10.5
	            ], [[MODEL, 'Galaxy Tab S 10.5'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [
	            /(SM-G800F)/i                                                       // Samsung Galaxy S5 Mini
	            ], [[MODEL, 'Galaxy S5 Mini'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
	            /(SM-T311)/i                                                        // Samsung Galaxy Tab 3 8.0
	            ], [[MODEL, 'Galaxy Tab 3 8.0'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [
	
	            /(T3C)/i                                                            // Advan Vandroid T3C
	            ], [MODEL, [VENDOR, 'Advan'], [TYPE, TABLET]], [
	            /(ADVAN T1J\+)/i                                                    // Advan Vandroid T1J+
	            ], [[MODEL, 'Vandroid T1J+'], [VENDOR, 'Advan'], [TYPE, TABLET]], [
	            /(ADVAN S4A)/i                                                      // Advan Vandroid S4A
	            ], [[MODEL, 'Vandroid S4A'], [VENDOR, 'Advan'], [TYPE, MOBILE]], [
	
	            /(V972M)/i                                                          // ZTE V972M
	            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [
	
	            /(i-mobile)\s(IQ\s[\d\.]+)/i                                        // i-mobile IQ
	            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
	            /(IQ6.3)/i                                                          // i-mobile IQ IQ 6.3
	            ], [[MODEL, 'IQ 6.3'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [
	            /(i-mobile)\s(i-style\s[\d\.]+)/i                                   // i-mobile i-STYLE
	            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
	            /(i-STYLE2.1)/i                                                     // i-mobile i-STYLE 2.1
	            ], [[MODEL, 'i-STYLE 2.1'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [
	
	            /(mobiistar touch LAI 512)/i                                        // mobiistar touch LAI 512
	            ], [[MODEL, 'Touch LAI 512'], [VENDOR, 'mobiistar'], [TYPE, MOBILE]], [
	
	            /////////////
	            // END TODO
	            ///////////*/
	
	        ],
	
	        engine : [[
	
	            /windows.+\sedge\/([\w\.]+)/i                                       // EdgeHTML
	            ], [VERSION, [NAME, 'EdgeHTML']], [
	
	            /(presto)\/([\w\.]+)/i,                                             // Presto
	            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
	            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
	            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
	            ], [NAME, VERSION], [
	
	            /rv\:([\w\.]{1,9}).+(gecko)/i                                       // Gecko
	            ], [VERSION, NAME]
	        ],
	
	        os : [[
	
	            // Windows based
	            /microsoft\s(windows)\s(vista|xp)/i                                 // Windows (iTunes)
	            ], [NAME, VERSION], [
	            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
	            /(windows\sphone(?:\sos)*)[\s\/]?([\d\.\s\w]*)/i,                   // Windows Phone
	            /(windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
	            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
	            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
	            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [
	
	            // Mobile/Embedded OS
	            /\((bb)(10);/i                                                      // BlackBerry 10
	            ], [[NAME, 'BlackBerry'], VERSION], [
	            /(blackberry)\w*\/?([\w\.]*)/i,                                     // Blackberry
	            /(tizen)[\/\s]([\w\.]+)/i,                                          // Tizen
	            /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]*)/i,
	                                                                                // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki
	            /linux;.+(sailfish);/i                                              // Sailfish OS
	            ], [NAME, VERSION], [
	            /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]*)/i                  // Symbian
	            ], [[NAME, 'Symbian'], VERSION], [
	            /\((series40);/i                                                    // Series 40
	            ], [NAME], [
	            /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
	            ], [[NAME, 'Firefox OS'], VERSION], [
	
	            // Console
	            /(nintendo|playstation)\s([wids34portablevu]+)/i,                   // Nintendo/Playstation
	
	            // GNU/Linux based
	            /(mint)[\/\s\(]?(\w*)/i,                                            // Mint
	            /(mageia|vectorlinux)[;\s]/i,                                       // Mageia/VectorLinux
	            /(joli|[kxln]?ubuntu|debian|suse|opensuse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?(?!chrom)([\w\.-]*)/i,
	                                                                                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
	                                                                                // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
	            /(hurd|linux)\s?([\w\.]*)/i,                                        // Hurd/Linux
	            /(gnu)\s?([\w\.]*)/i                                                // GNU
	            ], [NAME, VERSION], [
	
	            /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
	            ], [[NAME, 'Chromium OS'], VERSION],[
	
	            // Solaris
	            /(sunos)\s?([\w\.\d]*)/i                                            // Solaris
	            ], [[NAME, 'Solaris'], VERSION], [
	
	            // BSD based
	            /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]*)/i                    // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
	            ], [NAME, VERSION],[
	
	            /(haiku)\s(\w+)/i                                                   // Haiku
	            ], [NAME, VERSION],[
	
	            /cfnetwork\/.+darwin/i,
	            /ip[honead]{2,4}(?:.*os\s([\w]+)\slike\smac|;\sopera)/i             // iOS
	            ], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [
	
	            /(mac\sos\sx)\s?([\w\s\.]*)/i,
	            /(macintosh|mac(?=_powerpc)\s)/i                                    // Mac OS
	            ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [
	
	            // Other
	            /((?:open)?solaris)[\/\s-]?([\w\.]*)/i,                             // Solaris
	            /(aix)\s((\d)(?=\.|\)|\s)[\w\.])*/i,                                // AIX
	            /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,
	                                                                                // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS
	            /(unix)\s?([\w\.]*)/i                                               // UNIX
	            ], [NAME, VERSION]
	        ]
	    };
	
	
	    /////////////////
	    // Constructor
	    ////////////////
	    /*
	    var Browser = function (name, version) {
	        this[NAME] = name;
	        this[VERSION] = version;
	    };
	    var CPU = function (arch) {
	        this[ARCHITECTURE] = arch;
	    };
	    var Device = function (vendor, model, type) {
	        this[VENDOR] = vendor;
	        this[MODEL] = model;
	        this[TYPE] = type;
	    };
	    var Engine = Browser;
	    var OS = Browser;
	    */
	    var UAParser = function (uastring, extensions) {
	
	        if (typeof uastring === 'object') {
	            extensions = uastring;
	            uastring = undefined;
	        }
	
	        if (!(this instanceof UAParser)) {
	            return new UAParser(uastring, extensions).getResult();
	        }
	
	        var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
	        var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;
	        //var browser = new Browser();
	        //var cpu = new CPU();
	        //var device = new Device();
	        //var engine = new Engine();
	        //var os = new OS();
	
	        this.getBrowser = function () {
	            var browser = { name: undefined, version: undefined };
	            mapper.rgx.call(browser, ua, rgxmap.browser);
	            browser.major = util.major(browser.version); // deprecated
	            return browser;
	        };
	        this.getCPU = function () {
	            var cpu = { architecture: undefined };
	            mapper.rgx.call(cpu, ua, rgxmap.cpu);
	            return cpu;
	        };
	        this.getDevice = function () {
	            var device = { vendor: undefined, model: undefined, type: undefined };
	            mapper.rgx.call(device, ua, rgxmap.device);
	            return device;
	        };
	        this.getEngine = function () {
	            var engine = { name: undefined, version: undefined };
	            mapper.rgx.call(engine, ua, rgxmap.engine);
	            return engine;
	        };
	        this.getOS = function () {
	            var os = { name: undefined, version: undefined };
	            mapper.rgx.call(os, ua, rgxmap.os);
	            return os;
	        };
	        this.getResult = function () {
	            return {
	                ua      : this.getUA(),
	                browser : this.getBrowser(),
	                engine  : this.getEngine(),
	                os      : this.getOS(),
	                device  : this.getDevice(),
	                cpu     : this.getCPU()
	            };
	        };
	        this.getUA = function () {
	            return ua;
	        };
	        this.setUA = function (uastring) {
	            ua = uastring;
	            //browser = new Browser();
	            //cpu = new CPU();
	            //device = new Device();
	            //engine = new Engine();
	            //os = new OS();
	            return this;
	        };
	        return this;
	    };
	
	    UAParser.VERSION = LIBVERSION;
	    UAParser.BROWSER = {
	        NAME    : NAME,
	        MAJOR   : MAJOR, // deprecated
	        VERSION : VERSION
	    };
	    UAParser.CPU = {
	        ARCHITECTURE : ARCHITECTURE
	    };
	    UAParser.DEVICE = {
	        MODEL   : MODEL,
	        VENDOR  : VENDOR,
	        TYPE    : TYPE,
	        CONSOLE : CONSOLE,
	        MOBILE  : MOBILE,
	        SMARTTV : SMARTTV,
	        TABLET  : TABLET,
	        WEARABLE: WEARABLE,
	        EMBEDDED: EMBEDDED
	    };
	    UAParser.ENGINE = {
	        NAME    : NAME,
	        VERSION : VERSION
	    };
	    UAParser.OS = {
	        NAME    : NAME,
	        VERSION : VERSION
	    };
	    //UAParser.Utils = util;
	
	    ///////////
	    // Export
	    //////////
	
	
	    // check js environment
	    if (typeof(exports) !== UNDEF_TYPE) {
	        // nodejs env
	        if (typeof module !== UNDEF_TYPE && module.exports) {
	            exports = module.exports = UAParser;
	        }
	        // TODO: test!!!!!!!!
	        /*
	        if (require && require.main === module && process) {
	            // cli
	            var jsonize = function (arr) {
	                var res = [];
	                for (var i in arr) {
	                    res.push(new UAParser(arr[i]).getResult());
	                }
	                process.stdout.write(JSON.stringify(res, null, 2) + '\n');
	            };
	            if (process.stdin.isTTY) {
	                // via args
	                jsonize(process.argv.slice(2));
	            } else {
	                // via pipe
	                var str = '';
	                process.stdin.on('readable', function() {
	                    var read = process.stdin.read();
	                    if (read !== null) {
	                        str += read;
	                    }
	                });
	                process.stdin.on('end', function () {
	                    jsonize(str.replace(/\n$/, '').split('\n'));
	                });
	            }
	        }
	        */
	        exports.UAParser = UAParser;
	    } else {
	        // requirejs env (optional)
	        if ("function" === FUNC_TYPE && __webpack_require__(13)) {
	            !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	                return UAParser;
	            }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	        } else if (window) {
	            // browser env
	            window.UAParser = UAParser;
	        }
	    }
	
	    // jQuery/Zepto specific (optional)
	    // Note:
	    //   In AMD env the global scope should be kept clean, but jQuery is an exception.
	    //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
	    //   and we should catch that.
	    var $ = window && (window.jQuery || window.Zepto);
	    if (typeof $ !== UNDEF_TYPE) {
	        var parser = new UAParser();
	        $.ua = parser.getResult();
	        $.ua.get = function () {
	            return parser.getUA();
	        };
	        $.ua.set = function (uastring) {
	            parser.setUA(uastring);
	            var result = parser.getResult();
	            for (var prop in result) {
	                $.ua[prop] = result[prop];
	            }
	        };
	    }
	
	})(typeof window === 'object' ? window : this);


/***/ }),
/* 13 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(__webpack_amd_options__) {module.exports = __webpack_amd_options__;
	
	/* WEBPACK VAR INJECTION */}.call(exports, {}))

/***/ })
/******/ ])
});
;
//# sourceMappingURL=is-browser-supported.js.map