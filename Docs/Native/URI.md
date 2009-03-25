Class: URI {#URI}
=================

Creates a new URI Class, that can be used to parse, and modify URIs in various schemes.

### Syntax

	var myURI = new URI([[baseURI], relativeURI]);

### Arguments
1. baseURI - (*mixed*, optional) a string or URI that the relativeURI will be relative to. Defaults to the current document base URI.
2. relativeURI - (*mixed*, optional) a URI object or a full or partial URI string. If a partial string is used, it will be made into a full URI relative to the baseURI. Defaults to the current document base URI.

### Returns:

* (*object*) A new URI instance.

### Examples:
	var myURI = new URI();
	// returns the document base
	myURI = new URI('../the/path.html?query=value#anchor');
	// returns a full URI relative to the document base
	myURI = new URI('http://www.test.com:8383/the/path.html?query=value#anchor');
	// returns the same as
	myURI = new URI('http://www.test.com:8383/otherpath/',
		'../the/path.html?query=value#anchor');

	myURI.setProtocol('https');
	myURI.setDomain('www.foo.com');
	//etc.

URI Method: toString {#URI:toString}
------------------------------------------

Returns an full URI as a *string*.

### Syntax

	myURI.toString(); //"http://www.test.com...etc"

### Returns

* (*string*) the full URI string.

URI Method: toRelative {#URI:toRelative}
------------------------------------------

Returns a partial URI *string* relative to the base URI or a full URI if they don't share scheme, domain, port etc.

### Syntax

	myURI.toRelative([baseURI]);

### Arguments
1. baseURI - (*mixed*, optional) a string or URI that the generated path will be relative to. Defaults to the current document base URI.

### Returns

* (*string*) a partial or full URI string.

### Examples:

	var myURI = new URI('http://example.com/the/path/file.html');
	myURI.toRelative('http://example.com/other/path/');
	// '../../the/path/file.html'
	myURI.toRelative('http://otherdomain.com/');
	// 'http://example.com/the/path/file.html'

URI Method: toAbsolute {#URI:toAbsolute}
------------------------------------------

Returns a partial rooted URI *string* or a full URI if the URI doesn't share scheme, domain, port etc. with the baseURI.

### Syntax

	myURI.toAbsolute([baseURI]);

### Arguments
1. baseURI - (*mixed*, optional) a string or URI that the generated path will be relative to. Defaults to the current document base URI.

### Returns

* (*string*) a partial rooted or full URI string.

### Examples:

	var myURI = new URI('http://example.com/the/path/file.html');
	myURI.toAbsolute('http://example.com/other/path/');
	// '/the/path/file.html'
	myURI.toAbsolute('http://otherdomain.com/');
	// 'http://example.com/the/path/file.html'

URI Method: set {#URI:set}
--------------------------

Set's a portion of the URI to the specified value. Different URI schemes has different valid portions. Typically you would use one of the named methods instead. Such as *setDomain* or *setQuery*.

### Syntax

	myURI.set(part, value);

### Arguments

1. part - (*string*) a valid part for the current scheme.
2. value - (*string*) the new value for the part.

### Example

	myURI.set('protocol', 'https');
	myURI.set('hostname', 'www.foo.com');
	//etc.

### Returns

* (*URI*) This instance of *URI*.

URI Method: get {#URI:get}
--------------------------

Returns the current value for the specified portion of the URI. Typically you would use one of the named methods instead. Such as *getProtocol* or *getDomain*.

### Syntax

	myURI.get(part);

### Example

	myURI.get('protocol'); //returns "http:", for example
	myURI.get('hostname'); //returns "www.example.com", for example

### Returns

* *mixed* - usually returns a *string*, but depending on the scheme it can return an *object*.

### Valid parts per URI scheme

**http, ftp, file, etc.**

* protocol - (*string*) 'http:', 'https:', 'ftp:', etc.
* user - (*string*) username if specified
* password - (*string*) password if specified
* hostname - (*string*) 'www.example.com', 'example.com', 'subdomain.example.com', etc.
* port - (*string* or *integer*) 80, 8080, etc.
* pathname - (*string*) '/directory/file.html' equivalent to directory + file
* directory - (*string*) '/directory/'
* file - (*string*) 'file.html'
* search - (*string*) '?foo=bar&something=else'
* hash - (*string*)  '#anAnchor'

**mailto**

* protocol - (*string*) always 'mailto:'
* username - (*string*) 'my.name' the part of the e-mail adress before the @
* hostname - (*string*) 'example.com' the part of the e-mail adress after the @
* email - (*string*) 'my.name@example.com' equivalent to username + '@' + hostname
* headers - (*string*) '?subject=Hi&body=Your%20message'
* subject - (*string*) the subject part of the headers as a non-encoded string
* body - (*string*) the body part of the headers as a non-encoded string

**javascript**

* protocol - (*string*) always 'javascript:'
* script - (*string*) the javascript code to be executed if the URI is visited

See also [URI Schemes][] for a list of other schemes.

URI Method aliases
------------------

To get consistent behavior across several schemes, use one of the name methods instead of get/set. Here's a list of common methods and their equivalent get/set part.

* getProtocol/setProtocol - get/set('protocol') {#URI:getProtocol/setProtocol}
* getUsername/setUsername - get/set('user' or 'username') {#URI:getUsername/setUsername}
* getPassword/setPassword - get/set('password') {#URI:getPassword/setPassword}
* getDomain/setDomain - get/set('hostname') {#URI:getDomain/setDomain}
* getPort/setPort - get/set('port') {#URI:getPort/setPort}
* getDirectory/setDirectory - get/set('directory') {#URI:getDirectory/setDirectory}
* getFile/setFile - get/set('file') {#URI:getFile/setFile}
* getPath/setPath - get/set('pathname') {#URI:getPath/setPath}
* getQuery/setQuery - get/set('query') {#URI:getQuery/setQuery}
* getFragment/setFragment - get/set('hash') {#URI:getFragment/setFragment}
* getSubject/setSubject - get/set('subject') {#URI:getSubject/setSubject}
* getBody/setBody - get/set('body') {#URI:getBody/setBody}
* getScript/setScript - get/set('script') {#URI:getScript/setScript}
* getEmail/setEmail - get/set('email') {#URI:getEmail/setEmail}

URI Method: setData {#URI:setData}
------------------------------------------

Sets the query string from an *object* (much like *myURI.set('data', obj)*) but also allows merging.

### Syntax

	myURI.setData(data[, merge]);


### Arguments

1. object - (*object*) the key/values you want to set for the query string
2. merge - (*boolean*, optional) if *true* the values will be merged with the existing query string. Defaults to *false*.

### Returns

* (*URI*) this instance of *URI*

### Example

	myURI.setData(myObject); //same as myURI.set('data', myObject);
	myURI.setData(myObject, true); //merges myObject w/ existing query values
	

URI Method: getData {#URI:getData}
------------------------------------

Returns the query string values as an *object*. Same as *URI.get('data')*.

### Syntax

	myURI.getData([key]);

### Arguments

1. key - (*string*; optional) If specified, returns the value for the given key.

### Returns

* *string* - the value for the given key

URI Method: go {#URI:go}
------------------------

Loads the URI into the document location. Executes JavaScript if it's a javascript-URI.

### Syntax

	myURI.go();

String Method: parseQueryString {#String:parseQueryString}
----------------------------------------------------------

Turns a querystring into an object of key/value pairs.

### Syntax

	myString.parseQueryString(encodeKeys, encodeValues);

### Arguments

1. encodeKeys - (*boolean*, optional) if set to *false*, keys are passed through [encodeURIComponent][]; defaults to *true*
1. encodeValues - (*boolean*, optional) if set to *false*, values are passed through [encodeURIComponent][]; defaults to *true*

### Example

	"apple=red&lemon=yellow".parseQuery();
	//returns { apple: "red", lemon: "yellow }
	var fruits = "apple=red&lemon=yellow".parseQuery();
	//returns fruits.apple > "red"

### Returns

* (*object*) the querystring as key/value pairs

String Method: cleanQueryString {#String:cleanQueryString}
----------------------------------------------------------

Removes from a query string any keys that have empty values.

### Syntax

	myQueryString.cleanQueryString([method]);

### Arguments

1. method - (*funciton*, optional) a method passed to [Array.filter][] that returns true if a key/value set should be included. Defaults to a method that checks that the value is not an empty string.

### Example

	var cleaned = "a=b&x=&z=123&e=".cleanQueryString();
	//cleaned = "a=b&z=123"
	var noNumberValues = "a=b&x=y&z=123&e=".cleanQueryString(function(set){
		//set is "a=b", "x=y", "z=123", "e="
		return !set.split("=")[1].match(/[0-9]/);
	});
	//noNumberValues = "a=b&x=y&e="

### Returns

* (*string*) the string appropriate key/values removed
  


  [URI Schemes]: http://en.wikipedia.org/wiki/URI_scheme