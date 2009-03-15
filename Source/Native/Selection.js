Window.implement({
	
	getSelectionRange: function(){
		if (this.getSelection){
			var s = this.getSelection();
			return s.getRangeAt ? (s.rangeCount > 0 ? Range.create(s.getRangeAt(0)) : this.document.newRange()) : new Range(s.anchorNode, s.anchorOffset, s.focusNode, s.focusOffset);
		} else if (this.document.selection){
			var s = this.document.selection, r = s.createRange();
			if (r.item){
				var i = r.item(0), o = 0;
				var a = i.parentElement;
				if (a.ownerDocument != this.document){
					r = this.document.body.createTextRange();
					r.collapse(true);
				} else {
					var n = i;
					while(n = n.previousSibling) o++;
					r = new Range(a, o, a, o + 1);
					r.commonAncestorContainer = a;
					return r;
				}
			} else if (r.parentElement().ownerDocument != this.document){
				r = this.document.body.createTextRange();
				r.collapse(true);
			}
			return Range.create(r);
		}
		return false;
	},
	
	setSelectionRange: function(range){
		range.select();
	}
});

Element.implement({
	
	getSelectionRange: function(){
		return this.getWindow().getSelectionRange().limitTo(this);
	},
	
	setSelectionRange: function(range){
		range.limitTo(this);
		range.select();
	},
	
	select: function(){
		var r = this.ownerDocument.newRange();
		r.selectNodeContents(this);
		r.select();
	}

});