﻿/*
Script: URI.Relative.js
	...

	License:
		MIT-style license.

	Authors:
		Sebastian Markbåge
*/

URI.implement({
	
	toAbsolute: function(base){
		base = new URI(base, { base: this });
		...
	},
	
	toRelative: function(base){
		base = new URI(base, { base: this });
		...
	}
	
});

$extend(URI.Schemes.http, {

	fromRelative: {
		regex: /^(\.\.?$|(?:[^?#\/]*\/)*)([^?#]*)(\?[^#]*)?(#.*)?/,
		parts: ['directory', 'file', 'query', 'hash'],
		init: function(bits){
			var newDirectory = bits.directory || './';
			var oldDirectory = /^\/.?/.test(newDirectory) ? '' : this.directory || '/';
			var dirs = (oldDirectory || '') + directory, result = [];
			dirs.split('/').each(function(dir){
				if(dir == '..' && result.length > 1)
					result.pop();
				else if(dir != '.')
					result.push(dir);
			});
			uri.directory = result.join('/') + '/';
		}
	},

	relative: function(baseURI){
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
	
	absolute: function(baseURI){
		var uri = this;
		baseURI = baseURI ? new URI(uri, baseURI) : new URI();
		if(!uri.directory || !baseURI.directory || uri.protocol != baseURI.protocol || uri.hostname != baseURI.hostname || uri.port != baseURI.port)
			return uri.get('href');
		return uri.d
	}

});