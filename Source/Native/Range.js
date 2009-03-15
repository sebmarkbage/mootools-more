/*
Script: Range.js
	Provides a unified and consistent interface for IE and W3C compliant browsers to work with DOM ranges and selections.

License:
	MIT-style license.
*/

var Range = new Native({

	name: 'Range',
	
	legacy: window.Range,
	
	protect: true,

	initialize: function(startContainer, startOffset, endContainer, endOffset){
		var r = (startContainer ? startContainer.ownerDocument : document).newRange();
		if(startContainer) r.setStart(startContainer, startOffset);
		if(endContainer) r.setEnd(endContainer, endOffset);
		return r;
	},
	
	afterImplement: function(key, value){
		Range.Prototype[key] = value;
	}
});

Range.Prototype = {};

(function(){ // Wraps helper functions in context

	function setRelativeTo(node, after, start){
		var o = after ? 0 : -1, n = node.parentNode.firstChild;
		do { o++; } while(n != node && (n = n.nextSibling));
		setEndPointTo.apply(this, [node.parentNode, o, start]);
	}
	
	function setEndPointTo(container, offset, start){
		var s = start ? 'start' : 'end', r = start ? 'end' : 'start';
		this[s + 'Container'] = container;
		this[s + 'Offset'] = offset;
		this.commonAncestorContainer = null;
		
		// TODO: Make it work with two adjecent text nodes
		var t = container.ownerDocument.body.createTextRange();
		switch(container.nodeType){
			case 1:
				if (!offset || offset < 0 || offset >= container.childNodes.length){
					t.moveToElementText(container);
					t.collapse(!offset || offset < 0);
				} else {
					var n = container.childNodes[offset];
					if (n.nodeType == 1){
						t.moveToElementText(n);
						t.collapse(true);
					} else {
						t.moveToElementText(n.previousSibling);
						t.collapse(false);
					}
				}
			break;
			case 3: case 4:
				t.moveToElementText(container.previousSibling || container.parentNode);
				t.collapse(!container.previousSibling);
				t.moveStart('character', offset);
			break;		
		}
		this.setEndPoint(start ? 'starttostart' : 'endtoend', t);
	}
	
	function getEndPoint(start){
		var cn = start ? 'startContainer' : 'endContainer', co = start ? 'startOffset' : 'endOffset';
		if (!this[cn]) {
			var a = this.getAncestor(), ce = start ? 'Start' : 'End';
			var n = a, o = -1, t = this.duplicate();
			while (n) {
				var nn;
				if (n.nodeType == 1){
					t.moveToElementText(n);
					var c = t.compareEndPoints('EndTo' + ce, this);
					if (c < 0){ // The endpoint isn't within this node, skip it's children
						while (!(nn = n.nextSibling)){ n = n.parentNode; }
						n = nn;
						continue;
					}
					if (t.text == '')
					{
						if (c <= 0) o++;
						var a = n.parentNode, i = a.firstChild;
						do { o++; } while(i != n && (i = i.nextSibling));
						n = a;
						break;
					}
				} else if (n.nodeType == 3 || n.nodeType == 4){
					t.collapse(!n.previousSibling);
					var l = n.nodeValue.length;
					for(var i=0;i<=l;i++){
						if (t.compareEndPoints('StartTo' + ce, this) >= 0){ o = i; break; }
						t.moveStart('character', 1);
					}
					if (o > -1) break;
				}
				if (!(nn = n.firstChild)){
					if (n == a) break;
					while (!(nn = n.nextSibling)){
						n = n.parentNode;
						if (n == a) break;
					}
					if (n == a) break;
				}
				n = nn;
			}
			this[cn] = n; this[co] = o > - 1 ? o : n.childNodes.length;
		}
		return { container: this[cn], offset: this[co] };
	}
	
	Range.implement({

		setStartBefore: function(node) { setRelativeTo.apply(this, [node, false, true]); },
		setStartAfter: function(node) { setRelativeTo.apply(this, [node, true, true]); },
		setEndBefore: function(node) { setRelativeTo.apply(this, [node, false, false]); },
		setEndAfter: function(node) { setRelativeTo.apply(this, [node, true, false]); },

		setStart: function(container, offset){ setEndPointTo.apply(this, [container, offset, true]); },
		setEnd: function(container, offset){ setEndPointTo.apply(this, [container, offset, false]); },

		isCollapsed: function(){
			if (!$defined(this.collapsed))
				return this.compare('starttoend', this) == 0;
			else 
				return this.collapsed;
		},
		
		collapseTo: function(start){
			this.collapse(start);
			if (this.moveToElementText){
				if (start){
					this.endContainer = this.startContainer;
					this.endOffset = this.startOffset;
				} else {
					this.startContainer = this.endContainer;
					this.startOffset = this.endOffset;
				}
				this.collapsed = true;
			}
			return this;
		},
		
		selectNode: function(node){
			this.setStartBefore(node);
			this.setEndAfter(node);
			return this;
		},
		
		selectContents: function(node){
			if (node.nodeType == 1)
				this.selectNodeContents(node);
			else {
				this.setStart(node, 0);
				this.setEnd(node, node.nodeValue.length);
			}					
			return this;
		},
		
		selectNodeContents: function(node){
			if (this.moveToElementText && node.nodeType == 1){
				this.moveToElementText(node);
				this.commonAncestorContainer = this.startContainer = this.endContainer = node;
				this.startOffset = 0;
				this.endOffset = node.childNodes.length;
			}
		},

		compare: function(how, range){
			how = how.toLowerCase();
			if (Browser.Engine.trident || Browser.Engine.webkit) // Trident and webkit currently flip how-terms
				how = how == 'endtostart' ? 'starttoend' : (how == 'starttoend' ? 'endtostart' : how);
			if (how == 'outside') return this.compare('starttostart', range) <= 0 && this.compare('endtoend') >= 0;
			else if (how == 'inside') return this.compare('starttostart', range) >= 0 && this.compare('endtoend') <= 0;
			else if (this.compareBoundaryPoints) return this.compareBoundaryPoints({ 'starttostart': Range.prototype.START_TO_START, 'starttoend': Range.prototype.START_TO_END, 'endtostart': Range.prototype.END_TO_START, 'endtoend': Range.prototype.END_TO_END }[how], range);
			else if (this.compareEndPoints) return this.compareEndPoints(how, range);
		},
		
		copy: function(how, range){
			var s = how.toLowerCase().split('to');
			if (this.setEndPoint){ this.setEndPoint({ 'starttoend': 'endtostart', 'endtostart' : 'starttoend' }[how] || how, range); this[s[1] + 'Container'] = null; this.commonAncestorContainer = null; }
			else this[s[1] == 'start' ? 'setStart' : 'setEnd'].apply(this, [range[s[0] + 'Container'], range[s[0] + 'Offset']]);
		},

		limitTo: function(range){
			if (range.ownerDocument){ var r = range.ownerDocument.newRange(); r.selectContents(range); range = r; }
			
			if (this.compare('starttoend', range) < 0) this.copy('starttoend', range);
			if (this.compare('starttostart', range) < 0) this.copy('starttostart', range);
			if (this.compare('endtostart', range) > 0) this.copy('endtostart', range);
			if (this.compare('endtoend', range) > 0) this.copy('endtoend', range);
			return this;
		},

		getAncestor: function(){
			if (!this.commonAncestorContainer) {
				var a = this.parentElement(), t = this.duplicate();
				t.moveToElementText(a);
				this.commonAncestorContainer = (a != a.ownerDocument.body && (t.text == '' || t.compareEndPoints('StartToStart', this) > 0 || (t.compareEndPoints('EndToEnd', this) == 0 && t.compareEndPoints('EndToStart', this) == 0))) ? a.parentNode : a;
			}
			return this.commonAncestorContainer;
		},
		
		getElement: function(){
			return (this.startContainer && this.startContainer.nodeType == 1 && this.startContainer == this.endContainer && this.endOffset - this.startOffset <= 1) ?
				(this.endOffset - this.startOffset == 1 ? this.startContainer.childNodes[this.startOffset] : this.startContainer)
					: false;
		},
		
		getStart: function(){ return getEndPoint.apply(this, [true]); },
		getEnd: function(){ return getEndPoint.apply(this, [false]); },
		
		getDomBookmark: function(context){
			var st = this.getStart(), end = this.getEnd();
			var getIndex = function(node){
				var i = 0;
				var n = context || st.container.ownerDocument;
				while(n){
					if (n == node) return i;
					i++;
					var nn = n.firstChild || n.nextSibling;
					while (!nn && (n = n.parentNode)){
						nn = n.nextSibling;
					}
					n = nn;
				}
				return i;
			};
			return { startNodeIndex : getIndex(st.container), startOffset : st.offset, endNodeIndex : getIndex(end.container), endOffset : end.offset };
		},
		
		moveToDomBookmark: function(bookmark, context){
			var t = this, getNode = function(i){
				var n = context || t.getStart().container.ownerDocument;
				while(n){
					if (i == 0) return n;
					i--;
					var nn = n.firstChild || n.nextSibling;
					while (!nn && (n = n.parentNode)){
						nn = n.nextSibling;
					}
					n = nn;
				}
				return n;
			};
			var sn = getNode(bookmark.startNodeIndex), en = getNode(bookmark.endNodeIndex);
			if (sn) this.setStart(sn, bookmark.startOffset);
			if (en) this.setEnd(en, bookmark.endOffset);
			return this;
		},
		
		getText: function(){
			return this.text ? this.text : this.toString();
		},
		
		getHtml: function(){
			//if(typeof this.htmlText != 'undefined') return this.htmlText;
			var d = this.getStart().container.ownerDocument.createElement('div');
			this.cloneContentsTo(d);
			return d.innerHTML;
		},
		
		cloneContentsTo: function(node){
			var a = this.getAncestor(),
				st = this.getStart(), sn = st.container, so = st.offset,
				end = this.getEnd(), en = end.container, eo = end.offset;

			var cs = this.cloneContents(), ln = node.lastChild;
			if ($type(cs) != 'array') cs = $A(cs.childNodes);
			cs.each(function(n){
				if (ln && (ln.nodeType == 3 || ln.nodeType == 4) && (n.nodeType == 3 || n.nodeType == 4))
					ln.nodeValue += n.nodeValue;
				else {
					node.appendChild(n);
					ln = n;
				}
			});
		},

		cloneContents: function(){
			if (this.isCollapsed()) return [];

			var a = this.getAncestor(), c = [],
				st = this.getStart(), sn = st.container, so = st.offset,
				end = this.getEnd(), en = end.container, eo = end.offset,
				n, nn;

			if (sn.nodeType == 1){
				if (so < sn.childNodes.length)
					nn = (n = sn.childNodes[so]).cloneNode(false);
				else
					nn = (n = sn).cloneNode(false);
			} else {
				if (so >= sn.nodeValue.length){
					n = sn;
					while(!n.nextSibling){
						n = n.parentNode;
						if (n == a) return c;
					}
					nn = (n = n.nextSibling).cloneNode(false);
				} else {
					nn = (n = sn).cloneNode(false);
					if (sn == en){
						nn.nodeValue = nn.nodeValue.substr(so, eo - so);
						return [nn];
					} else
						nn.nodeValue = nn.nodeValue.substr(so);
				}
			}
			if (en.nodeType == 1)
				en = eo < en.childNodes.length ? en.childNodes[eo] : (en.nextSibling || en.parentNode);
			
			while(n && n != en){
				if (n.parentNode == a) c.push(nn);

				var t;
				if (n.firstChild){
					n = n.firstChild;
					t = n.cloneNode(false);
					nn.appendChild(t);
					nn = t;
				} else {
					while(!n.nextSibling){
						n = n.parentNode;
						if (n == en) break;
						if (!nn.parentNode) { t = nn; nn = n.cloneNode(false); nn.appendChild(t); } else { nn = nn.parentNode; }
						if (n.parentNode == a) c.push(nn);
					}
					if (n == en) break;
					n = n.nextSibling;
					if (!nn.parentNode) { t = nn; nn = n.parentNode.cloneNode(false); nn.appendChild(t); } else { nn = nn.parentNode; }
					t = n.cloneNode(false);
					nn.appendChild(t);
					nn = t;
				}
			}
			if (n == en && (n.nodeType == 3 || n.nodeType == 4)){
				nn.nodeValue = nn.nodeValue.substr(0, eo);
				if (n.parentNode == a) c.push(nn);
			}
			return c;
		},

		clone: function(){
			return Range.create(this.cloneRange ? this.cloneRange() : this.duplicate());
		},

		select: function(){
			if (window.getSelection){
				var s = this.startContainer.ownerDocument.window.getSelection();
				if (s.removeAllRanges && s.addRange) { s.removeAllRanges(); s.addRange(this); }
			}
		}
		
	});

})();

Range.create = function (r){
	if (!r || r.getAncestor) return r;
	for(var k in Range.Prototype) if (k != 'create' && !r[k]) r[k] = Range.Prototype[k];
	return r;
};

Document.implement({

	newRange: function(){
		return Range.create(this.createRange ? this.createRange() : (this.body.createTextRange ? this.body.createTextRange() : false));
	}

});
