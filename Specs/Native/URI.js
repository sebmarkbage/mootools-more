/*
Script: URI.js
	Specs for URI.js

License:
	MIT-style license.
*/
(function(){

	describe('String.parseQueryString', {

		'should parse a query string to an object': function(){
			value_of('apple=red&lemon=yellow'.parseQueryString().apple).should_be('red');
		},

		'should parse a plain string to an empty object': function(){
			value_of($H('appleyellow'.parseQueryString()).getLength() == 0).should_be_true();
		}

	});

	describe('String.cleanQueryString', {

		'should remove empty keys': function(){
			value_of('a=b&x=y&z=123&e='.cleanQueryString()).should_be('a=b&x=y&z=123');
		},

		'should remove specified keys': function(){
			value_of('a=b&x=y&z=123&e='.cleanQueryString(function(set){
				return !set.split("=")[1].match(/[0-9]/);
			})).should_be('a=b&x=y&e=');
		}

	});

	var uri;


	describe('String.toURI using relative path', {

		before: function(){
			uri = '/mydirectory/myfile.html?myquery=true#myhash'.toURI('http://myuser:mypass@www.calyptus.eu:8080');
		},

		'URI.toString() should be same as input combined': function(){
			value_of(uri.toString()).should_be('http://myuser:mypass@www.calyptus.eu:8080/mydirectory/myfile.html?myquery=true#myhash');
		},
		
		'should have a protocol ending with colon': function(){
			value_of(uri.getProtocol()).should_be('http:');		
		},
		
		'should have a user set': function(){
			value_of(uri.getUsername()).should_be('myuser');
		},
		
		'should have a password set': function(){
			value_of(uri.getPassword()).should_be('mypass');
		},
		
		'should have a full hostname': function(){
			value_of(uri.getHostname()).should_be('www.calyptus.eu');
		},
		
		'should have an explicit port': function(){
			value_of(uri.getPort()).should_be(8080);
		},
		
		'should have a directory': function(){
			value_of(uri.getDirectory()).should_be('/mydirectory/');
		},
		
		'should have a file name': function(){
			value_of(uri.getFile()).should_be('myfile.html');
		},
		
		'should have a search set': function(){
			value_of(uri.getQuery()).should_be('?myquery=true');
		},
		
		'should have a hash set': function(){
			value_of(uri.getHash()).should_be('#myhash');
		}
	});
	
	describe('URI initialize', {

		'new URI() should return the current location': function(){
			value_of(new URI()).should_be(window.location.href);
		},

		'new URI(\'../otherfolder\').toRelative() should return a folder up from the current location': function(){
			value_of(new URI('../otherfolder').toRelative()).should_be('../otherfolder');
		},

		'new URI(\'../otherfolder\').toRelative(currentLocation) should return a folder up from the current location': function(){
			value_of(new URI('../otherfolder').toRelative(window.location)).should_be('../otherfolder');
		},

		'new URI(\'http://www.calyptus.eu\') should return itself with a trailing slash': function(){
			value_of(new URI('http://www.calyptus.eu')).should_be('http://www.calyptus.eu/');
		},

		'new URI(\'http://www.calyptus.eu/\') should return itself': function(){
			value_of(new URI('http://www.calyptus.eu/')).should_be('http://www.calyptus.eu/');
		},
		
		'new URI(\'http://www.calyptus.eu/\', \'./mydirectory/myfile.html\') should return http://www.calyptus.eu/mydirectory/myfile.html': function(){
			value_of(new URI('http://www.calyptus.eu/', './mydirectory/myfile.html')).should_be('http://www.calyptus.eu/mydirectory/myfile.html');
		},

		'new URI(\'http://www.calyptus.eu\', \'mydirectory/myfile.html\') should return http://www.calyptus.eu/mydirectory/myfile.html': function(){
			value_of(new URI('http://www.calyptus.eu', 'mydirectory/myfile.html')).should_be('http://www.calyptus.eu/mydirectory/myfile.html');
		},
		
		'new URI(\'http://www.calyptus.eu/mydirectory/#\', \'../myfile.html\') should return http://www.calyptus.eu/myfile.html': function(){
			value_of(new URI('http://www.calyptus.eu/mydirectory/#', '../myfile.html')).should_be('http://www.calyptus.eu/myfile.html');
		},
		
		'new URI(\'http://www.calyptus.eu/mydirectory/mydirectory2/\', \'../../myfile.html\') should return http://www.calyptus.eu/myfile.html': function(){
			value_of(new URI('http://www.calyptus.eu/mydirectory/mydirectory2/', '../../myfile.html')).should_be('http://www.calyptus.eu/myfile.html');
		},

		'new URI(\'http://www.calyptus.eu/mydirectory/mydirectory2/\', \'../test/../myfile.html\') should return http://www.calyptus.eu/mydirectory/myfile.html': function(){
			value_of(new URI('http://www.calyptus.eu/mydirectory/mydirectory2/', '../test/../myfile.html')).should_be('http://www.calyptus.eu/mydirectory/myfile.html');
		},
		
		'new URI(\'http://www.calyptus.eu/\', \'http://otherdomain/mydirectory/myfile.html\') should return http://otherdomain/mydirectory/myfile.html': function(){
			value_of(new URI('http://www.calyptus.eu/', 'http://otherdomain/mydirectory/myfile.html')).should_be('http://otherdomain/mydirectory/myfile.html');
		},
		
		'new URI(\'http://www.calyptus.eu/mydirectory2/myfile.html\', \'/mydirectory/myfile.html\') should return http://www.calyptus.eu/mydirectory/myfile.html': function(){
			value_of(new URI('http://www.calyptus.eu/mydirectory2/myfile.html', '/mydirectory/myfile.html')).should_be('http://www.calyptus.eu/mydirectory/myfile.html');
		},

		'new URI(\'http://www.calyptus.eu/mydirectory2/\', \'mydirectory/myfile.html\') should return http://www.calyptus.eu/mydirectory2/mydirectory/myfile.html': function(){
			value_of(new URI('http://www.calyptus.eu/mydirectory2/myfile.html', 'mydirectory/myfile.html')).should_be('http://www.calyptus.eu/mydirectory2/mydirectory/myfile.html');
		},

		'new URI(\'http://www.calyptus.eu/mydirectory2/\', \'mydirectory\') should return http://www.calyptus.eu/mydirectory2/mydirectory': function(){
			value_of(new URI('http://www.calyptus.eu/mydirectory2/myfile.html', 'mydirectory')).should_be('http://www.calyptus.eu/mydirectory2/mydirectory');
		},

		'new URI(\'http://www.calyptus.eu/mydirectory/mydirectory2/myfile.html\', \'..\') should return http://www.calyptus.eu/mydirectory/': function(){
			value_of(new URI('http://www.calyptus.eu/mydirectory/mydirectory2/myfile.html', '..')).should_be('http://www.calyptus.eu/mydirectory/');
		}

	});
	
	describe('URI http protocol', {

		before: function(){
			uri = new URI('http://myuser:mypass@www.calyptus.eu:80/mydirectory/myfile.html?myquery=true#myhash');
		},
		
		'toString() should be same as input but cleaned up (port removed)': function(){
			value_of(uri.toString()).should_be('http://myuser:mypass@www.calyptus.eu/mydirectory/myfile.html?myquery=true#myhash');
		},

		'should have a protocol ending with colon': function(){
			value_of(uri.getProtocol()).should_be('http:');		
		},
		
		'should have a user set': function(){
			value_of(uri.getUsername()).should_be('myuser');
		},
		
		'should have a password set': function(){
			value_of(uri.getPassword()).should_be('mypass');
		},
		
		'should have a full hostname': function(){
			value_of(uri.getHostname()).should_be('www.calyptus.eu');
		},
		
		'should have the default port': function(){
			value_of(uri.getPort()).should_be(80);
		},
		
		'should have a directory': function(){
			value_of(uri.getDirectory()).should_be('/mydirectory/');
		},
		
		'should have a file name': function(){
			value_of(uri.getFile()).should_be('myfile.html');
		},
		
		'should have a search set': function(){
			value_of(uri.getQuery()).should_be('?myquery=true');
		},
		
		'should have a hash set': function(){
			value_of(uri.getHash()).should_be('#myhash');
		}
	});
	
	describe('URI file protocol', {

		before: function(){
			uri = new URI('file:///mytopdirectory/mydirectory/myfile.html?myquery=true#myhash');
		},
		
		'protocol should be file with a trailing colon': function(){
			value_of(uri.getProtocol()).should_be('file:');
		},
		
		'user should be undefined': function(){
			value_of(uri.getUsername()).should_be(undefined);
		},
		
		'password should be undefined': function(){
			value_of(uri.getPassword()).should_be(undefined);
		},
		
		'hostname should be undefined': function(){
			value_of(uri.getHostname()).should_be(undefined);
		},
		
		'port should be undefined': function(){
			value_of(uri.getPort()).should_be(undefined);
		},
		
		'directory should be should be set with trailing slash': function(){
			value_of(uri.getDirectory()).should_be('/mytopdirectory/mydirectory/');
		},
		
		'file name should be myfile.html': function(){
			value_of(uri.getFile()).should_be('myfile.html');
		},
		
		'search should be set': function(){
			value_of(uri.getQuery()).should_be('?myquery=true');
		},
		
		'hash should be set': function(){
			value_of(uri.getHash()).should_be('#myhash');
		}
	});

	describe('URI mailto protocol', {

		before: function(){
			uri = new URI('mailto:info@calyptus.eu?subject=This%20rocks');
		},

		'toString() should be same as input': function(){
			value_of(uri.toString()).should_be('mailto:info@calyptus.eu?subject=This%20rocks');
		},
		
		'protocol should be mailto with trailing colon': function(){
			value_of(uri.getProtocol()).should_be('mailto:');
		},

		'email should be the full email without protocol and headers': function(){
			value_of(uri.getEmail()).should_be('info@calyptus.eu');
		},

		'username should be the part before @ but after mailto:': function(){
			value_of(uri.getUsername()).should_be('info');
		},

		'hostname should be the domain name': function(){
			value_of(uri.getHostname()).should_be('calyptus.eu');
		},

		'headers should be should be everything after and including the question mark': function(){
			value_of(uri.getQuery()).should_be('?subject=This%20rocks');
		},

		'subject should be the "subject" part of the headers': function(){
			value_of(uri.getSubject()).should_be('This rocks');
		},
		
		'subject should be the "body" part of the headers, in this case undefined': function(){
			value_of(uri.getBody()).should_be(undefined);
		},

		'All http/https/ftp/file specific properties should be undefined': function(){
			value_of(uri.get('user')).should_be(undefined);
			value_of(uri.getPassword()).should_be(undefined);
			value_of(uri.getPort()).should_be(undefined);
			value_of(uri.getDirectory()).should_be(undefined);
			value_of(uri.getFile()).should_be(undefined);
			value_of(uri.get('search')).should_be(undefined);
			value_of(uri.getHash()).should_be(undefined);
		}
	});

	describe('URI methods', {

		before_all: function(){
			uri = new URI('http://www.calyptus.eu/mydirectory/mydirectory2/myfile.html', false);
		},
		
		'URI.toString() should be same as input': function(){
			value_of(uri.toString()).should_be('http://www.calyptus.eu/mydirectory/mydirectory2/myfile.html');
		},
		
		'URI.toRelative(string)': function(){
			value_of(uri.toRelative('http://www.calyptus.eu/mydirectory/myfile.html')).should_be('mydirectory2/myfile.html');
		},

		'URI.toRelative(string)': function(){
			value_of(uri.toRelative('http://www.calyptus.eu/mydirectory/')).should_be('mydirectory2/myfile.html');
		},

		'URI.toRelative(uri)': function(){
			value_of(uri.toRelative(new URI('http://www.calyptus.eu/', 'mydirectory/myfile.html'))).should_be('mydirectory2/myfile.html');
		},

		'URI.toAbsolute(string)': function(){
			value_of(uri.toAbsolute('http://www.calyptus.eu/mydirectory/myfile.html')).should_be('/mydirectory/mydirectory2/myfile.html');
		},

		'URI.toAbsolute(uri)': function(){
			value_of(uri.toAbsolute(new URI('http://www.calyptus.eu/', 'mydirectory/myfile.html'))).should_be('/mydirectory/mydirectory2/myfile.html');
		},

		'URI.toRelative(string) on parent': function(){
			value_of(uri.toRelative('http://www.calyptus.eu/test/myfile.html')).should_be('../mydirectory/mydirectory2/myfile.html');
		},

		'URI.toRelative(string) on different host': function(){
			value_of(uri.toRelative('http://otherdomain/mydirectory/myfile.html')).should_be('http://www.calyptus.eu/mydirectory/mydirectory2/myfile.html');
		},

		'URI.toAbsolute(string) on different host': function(){
			value_of(uri.toAbsolute('http://otherdomain/mydirectory/myfile.html')).should_be('http://www.calyptus.eu/mydirectory/mydirectory2/myfile.html');
		},

		'URI.toRelative(string) on different port': function(){
			value_of(uri.toRelative('http://www.calyptus.eu:81/mydirectory/myfile.html')).should_be('http://www.calyptus.eu/mydirectory/mydirectory2/myfile.html');
		},

		'URI.toAbsolute(string) on different port': function(){
			value_of(uri.toAbsolute('http://www.calyptus.eu:81/mydirectory/myfile.html')).should_be('http://www.calyptus.eu/mydirectory/mydirectory2/myfile.html');
		},
		
		'URI.toRelative(string) with query': function(){
			value_of(new URI('http://www.calyptus.eu/mydirectory/mydirectory2/myfile.html?myquery=q', false).toRelative('http://www.calyptus.eu/mydirectory/myfile.html')).should_be('mydirectory2/myfile.html?myquery=q');
		},

		'URI.toAbsolute(string) with query': function(){
			value_of(new URI('http://www.calyptus.eu/mydirectory/mydirectory2/myfile.html?myquery=q', false).toAbsolute('http://www.calyptus.eu/mydirectory/myfile.html')).should_be('/mydirectory/mydirectory2/myfile.html?myquery=q');
		},

		'URI.toRelative(string) to same file': function(){
			value_of(uri.toRelative('http://www.calyptus.eu/mydirectory/mydirectory2/myfile.html')).should_be('myfile.html');
		},

		'URI.toRelative(string) to same path': function(){
			value_of(new URI('http://www.calyptus.eu').toRelative('http://www.calyptus.eu')).should_be('./');
		},
		
		'new URI(\'../otherfolder\').toRelative() should return the same as input': function(){
			value_of(new URI('../otherfolder').toRelative(window.location)).should_be('../otherfolder');
		},

		'new URI(\'../otherfolder\').toRelative(window.location) should return the same as input': function(){
			value_of(new URI('../otherfolder').toRelative(window.location)).should_be('../otherfolder');
		},
		
		'URI.setData({ keyName: \'my value\' }) should return ?keyName=my%20value as the query': function(){
			uri.setData({ keyName: 'my value' });
			value_of(uri.get('search')).should_be('?keyName=my%20value');
		},
		
		'URI.getData() should return an object with the value set above': function(){
			value_of(uri.getData().keyName).should_be('my value');
		},

		'URI.getData(\'keyName\') should return the string with the value set above': function(){
			value_of(uri.getData('keyName')).should_be('my value');
		}
		
	});

	describe('URI where string is expected', {

		'Request self should work with an URI object': function(){
			new Request({ url: new URI() }).get();
		},
		
		'A HREF should take an URI object': function(){
			value_of(new Element('a').set('href', new URI()).get('href')).should_be(new URI().toString());
		},
		
		'post-concatenation with string': function(){
			value_of(new URI('http://www.calyptus.eu/') + '?test').should_be('http://www.calyptus.eu/?test');
		},
		
		'pre-concatenation with string': function(){
			value_of('URL: ' + new URI('http://www.calyptus.eu/')).should_be('URL: http://www.calyptus.eu/');
		},
		
		'regexp test': function(){
			value_of(/^http/.test(new URI('http://www.calyptus.eu/'))).should_be(true);
		}

	});

})();