/*
Script: URI.js
	Class to parse and modify URIs.

	License:
		MIT-style license.

	Authors:
		Sebastian Markbåge
*/

var URI = new Class({

	initialize: function(baseURI, relativeURI){
		if(!relativeURI && relativeURI !== 0){
			if(!URI.Base){
				URI.Base = new URI({}, window.location.href);
				var bases = document.getElementsByTagName('base');
				for(var i=bases.length-1;i>=0;i--) if(bases[i].href){ URI.Base = new URI(bases[i].href); break; }
			}
			relativeURI = baseURI;
			baseURI = URI.Base;
			if(!relativeURI && relativeURI !== 0) return baseURI;
		}
		
		if(relativeURI.scheme) return $extend(this, relativeURI);

		relativeURI = relativeURI.toString();
		
		var match;
		if(match = /^([a-zA-Z]+)\:/.exec(relativeURI)){
			this.scheme = URI.Schemes[match[1].toLowerCase()] || URI.Schemes.unknown;
		} else {
			$extend(this, new URI(baseURI));
			var relative = this.scheme.relative;
			if(relative && relative.set){
				relative.set.apply(this, [relativeURI]);
				return this;
			}
		}
		return this.set('href', relativeURI);
	},
	
	get: function(part){
		var prop = this.scheme ? this.scheme[part] : false;
		return prop && prop.get ? prop.get.apply(this, $A(arguments).slice(1)) : this[part];
	},
	
	set: function(part, value){
		var args = $A(arguments).slice(1), prop = this.scheme ? this.scheme[part] : false;
		if(prop) prop.set.apply(this, args); else this[part] = value;
		return this;
	},
	
	getData: function(key){ var obj = this.get('data') || {}; return key ? obj[key] : obj; },
	setData: function(values, merge){
		if(typeof values == 'string' && typeof merge != undefined){
			var key = values;
			values = this.getData();
			values[key] = merge;
			merge = false;
		}
		return this.set('data', (merge ? $merge(this.getData(), values) : values) || {});
	},
	
	toAbsolute: function(baseURI){ return this.get('absolute', baseURI) || this.get('href'); },
	toRelative: function(baseURI){ return this.get('relative', baseURI) || this.get('href'); },

	toString: function(){ return this.get('href'); }
});

(function(){

// Schemes

var matchThis = function(r, m){
	return function(v){
		var self = this, match = r.exec(v);
		if(match) m.each(function(k,i){ self[k] = match[i+1]; });
	};
};

var createDataProperty = function(key){
	return {
		get: function(){
			var d = this.get(key);
			return d && d.length > 1 ? decodeURI(d.substr(1)).parseQueryString(false, false) : false; 
		},
		set: function(obj){
			var nq = '';
			for (var k in obj){
				if(nq != '') nq += '&';
				nq += encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
			}
			return this.set(key, nq != '' ? '?' + nq : nq);
		}
	};			
};

var setRelative = function(value){
	var uri = this, oldDir = uri.directory;

	matchThis(/^(\.\.?$|(?:[^?#\/]*\/)*)([^?#]*)(\?[^#]*)?(#.*)?/, ['directory', 'file', 'search', 'hash']).apply(uri, [value]);
	
	var dir = uri.directory;
	if(dir){
		var baseDir = !oldDir || /^\/.?/.test(dir) ? [] : oldDir.replace(/\/$/, '').split('/'),
			relDir = dir.replace(/\/$/, '').split('/');
		relDir.each(function(d, i){
			if(d == '..'){
				if(baseDir.length > 1 || (baseDir.length > 0 && baseDir[0] != '')) baseDir.pop();
			} else if(d != '.')
				baseDir.push(d);
		});
		uri.directory = baseDir.join('/') + '/';
	}
	else
		uri.directory = oldDir || '/';
};

URI.Schemes = {
	http: {
		href: {
			get: function(){
				var uri = this, defaultPort = URI.DefaultPorts[uri.protocol.substr(0, uri.protocol.length - 1).toLowerCase()];
				return uri.protocol + '//' + (uri.user ? uri.user + (uri.password ? ':' + uri.password : '') + '@' : '') +
					   (uri.hostname || '') + (uri.port && uri.port != defaultPort ? ':' + uri.port : '') +
					   (uri.directory || '/') + (uri.file || '') + (uri.search || '') + (uri.hash || '');
			},
			set: function(value){
				var uri = this;
				matchThis(
					/^([a-zA-Z]+:)(?:\/\/(?:(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]+)?(?::(\d*))?)?((?:[^?#\/]*\/)*)([^?#]*)(\?[^#]*)?(#.*)?/,
					['protocol', 'user', 'password', 'hostname', 'port', 'directory', 'file', 'search', 'hash']
				).apply(uri, [value]);
				uri.port = uri.port || URI.DefaultPorts[uri.protocol.substr(0, uri.protocol.length - 1).toLowerCase()];
				uri.directory = uri.directory || '/';
			}
		},
		
		pathname: {
			get: function(uri){ return uri.directory + (uri.file || ''); },
			set: matchThis(/^([^\/]*)(.*)$/, ['directory', 'file'])
		},
		
		relative: {
			get: function(baseURI){
				var uri = this;
				baseURI = baseURI ? new URI(uri, baseURI) : new URI();
				if(!uri.directory || !baseURI.directory || uri.protocol != baseURI.protocol || uri.hostname != baseURI.hostname || uri.port != baseURI.port)
					return uri.get('href');

				var baseDir, relDir, path = '', o;
				baseDir = baseURI.directory.split('/');
				relDir = uri.directory.split('/');
				
				for(o = 0; o < baseDir.length && o < relDir.length && baseDir[o] == relDir[o]; o++);
				for(var i = 0; i < baseDir.length - o - 1; i++) path += '../';
				for(var i = o; i < relDir.length - 1; i++) path += relDir[i] + '/';
					
				return (path || (uri.file ? '' : './')) + (uri.file || '') + (uri.search || '') + (uri.hash || '');
			},
			set: setRelative
		},
		
		absolute: {
			get: function(baseURI){
				var uri = this;
				baseURI = baseURI ? new URI(uri, baseURI) : new URI();
				if(!uri.directory || !baseURI.directory || uri.protocol != baseURI.protocol || uri.hostname != baseURI.hostname || uri.port != baseURI.port)
					return uri.get('href');
				return uri.directory + (uri.file || '') + (uri.search || '') + (uri.hash || '')
			},
			set: setRelative
		},
		
		data: createDataProperty('search')
	},
	mailto: {
		href: {
			get: function(){ return this.protocol + this.username + '@' + this.hostname + (this.headers || ''); },
			set: matchThis(/^([a-z]+:)([^\.:@]+(?:\.[^:@]+)*)@((?:[^?:\.]+\.)*[^?:\.]+)(\?.*)?/i, ['protocol', 'username', 'hostname', 'headers'])
		},
		
		email: {
			get: function(){ return this.username + '@' + this.hostname; },
			set: matchThis(/^([^\.:@]+(?:\.[^:@]+)*)@((?:[^?:\.]+\.)*[^?:\.]+)$/, ['username', 'hostname'])
		},
		
		subject: {
			get: function(){ return this.getData('subject'); },
			set: function(value){ this.setData('subject', value); }
		},
		
		body: {
			get: function(){ return this.getData('body'); },
			set: function(value){ this.setData('body', value); }
		},
		
		data: createDataProperty('headers')
	},
	javascript: {
		href: {
			get: function(uri){ return uri.protocol + (uri.script || '').toString().replace(/\r?\n/g, ' '); },
			set: matchThis(/^([a-z]+:)(.*)$/, ['protocol', 'script'])
		}
	},
	unknown: {}
};

// More URL schemes

['https','ftp','file','rtsp','mms'].each(function(scheme){
	URI.Schemes[scheme] = URI.Schemes.http;
});

// Method aliases

var aliases = {
	getPath: function(){ return this.get('pathname'); },
	setPath: function(value){ return this.set('pathname', value); },
	getUsername: function(){ return this.get('user') || this.get('username'); },
	setUsername: function(value){ return this.set('user', value).set('username', value); },
	getQuery: function(){ return this.get('search') || this.get('headers'); },
	setQuery: function(value){ return this.set('search', value).set('headers', value); }
};
['protocol', 'password', 'hostname', 'port', 'directory', 'file', 'hash', 'subject', 'body', 'script', 'email'].each(function(part){
	var capitalizedPart = part.capitalize();
	aliases['get' + capitalizedPart] = function(){ return this.get.apply(this, [part].extend(arguments)); }
	aliases['set' + capitalizedPart] = function(){ return this.set.apply(this, [part].extend(arguments)); }
});

URI.implement(aliases);

// Default ports

URI.DefaultPorts = { http: 80, https: 443, ftp: 21 };

})();

String.implement({

	toURI: function(baseURI){
		return new URI(baseURI, this);
	},
	
	parseQueryString: function(encodeKeys, encodeValues){
		encodeKeys = $pick(encodeKeys, true);
		encodeValues = $pick(encodeValues, true);
		var vars = this.split(/[&;]/), rs = {};
		if (vars.length) vars.each(function(val){
			var keys = val.split('=');
			if (keys.length && keys.length == 2){
				rs[(encodeKeys) ? encodeURIComponent(keys[0]):keys[0]] = (encodeValues) ? encodeURIComponent(keys[1]) : keys[1];
			}
		});
		return rs;
	},

	cleanQueryString: function(method){
		return this.split('&').filter(method || function(set){
			return $chk(set.split('=')[1]);
		}).join('&');
	}

});