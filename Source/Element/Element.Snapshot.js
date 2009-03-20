/*
Script: Element.Snapshot.js
	Extends Element with a "snapshot" method that clones an element with it's current stylesheet intact.

	License:
		MIT-style license.

	Authors:
		Sebastian Markbåge
*/

Element.implement({

	snapshot: function(contents, keepid){

		var pb = this, win = this.getWindow(), body = win.document.body;
		while((pb = pb.parentNode) && getCurrentStyle(pb).display == 'inline');
		
		var ne = this.clone(contents, keepid),
			es = this.getComputedSize(),
			ps = $(pb).getComputedSize();

		copyStyles(this, ne);
		
		var s = getCurrentStyle(this);
		['textIndent', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop'].each(function(k){ // make percentages relative to parent width or height
			var c = s[k];
			if((/\%$/).test(c)) ne.setStyle(k, ps.width * parseFloat(c.substr(0, c.length - 1)) / 100);
		});
		return ne.setStyles({
			'font-size': getRelativeFontSize(this).value,
			'width': es.width,
			'height': es.height
		});
		
		function getCurrentStyle(e){ return win.getComputedStyle ? win.getComputedStyle(e, null) : (e.currentStyle || e.style); }
		function getRelativeFontSize(e){
			var z = getCurrentStyle(e).fontSize, u, i = 0;
			if ((/[a-z]{2}$/i).test(z)) i = -2;
			else if ((/\%$/).test(z)) i = -1;
			u = z.substr(z.length + i);
			z = parseFloat(z.substr(0, z.length + i));
			if ((/\%|em|ex/).test(u) && e.parentNode && e.parentNode != body){
				var p = arguments.callee(e.parentNode);
				z = (u == '%' ? z / 100 : (u == 'ex' ? z / 2 : z)) * p.size;
				u = p.unit;
			}
			return { size: z, unit: u, value: z + u };
		}
		function copyStyles(e, t){
			var s = getCurrentStyle(e);
			for(var k in s){
				if((/^\d+$/).test(k)) k = s[k];
				if(k == 'clip' && (/rect\((0(px)?\, ){3}0(px?)\)/).test(s[k]))
					t.style['clip'] = 'auto';
				else if(!(/cssText|^length$|parentRule|hasLayout/).test(k) && s[k] != '' && $type(s[k]) != 'function' && (!(/(max|min)(Width|Height)/).test(k) || s[k] != '-1px'))
					t.style[k] = s[k];
			}
			for(var i=0;i<e.childNodes.length&&i<t.childNodes.length;i++)
				if(e.childNodes[i].nodeType == 1)
					arguments.callee(e.childNodes[i], t.childNodes[i]);
		}
	}

});