/*
Script: Event.DataTransfer.js
	Contains the dataTransfer object attached to events during drag & drop operations in HTML 5.

	License:
		MIT-style license.

	Authors:
		Sebastian Markbåge
*/

var DataTransfer = new Native({

	legacy: window.DataTransfer,

	name: 'DataTransfer',

	dropEffect: 'none',
	effectAllowed: 'uninitialized',
	
	initialize: function(event, dragOp){
		var ev = event.event || event;
		this.dataTransfer = ev.dataTransfer || ev.clipboardData;
		this.$op = dragOp;
	},

	clearData: function(format){
		if(this.dataTransfer) this.dataTransfer.clearData(key);
		if(key == null) return $dataTransferStore.data.empty();
		$dataTransferStore.data.erase(key);
	},

	setData: function(format, data){
		if(Browser.Engine.trident && Browser.Engine.version < 8){
			if(format == 'text/plain')
				this.dataTransfer.setData('Text', data);
			else if(format == 'text/uri-list')
				this.dataTransfer.setData('URL', data);
			else if(format == 'text/html' && this.$op.data['text/plain'] == undefined)
				this.dataTransfer.setData('Text', data);
		}
		if(this.dataTransfer && $type(data) == 'string') this.dataTransfer.setData(format, data);
		if(this.$op) this.$op.data[format] = data;
	},
	
	getData: function(format){
		if(this.type != 'drop') throw 'getData can only be called from the drop event handler.';
		if(Browser.Engine.trident && Browser.Engine.version < 6){
			if(format == 'text/plain') return this.dataTransfer.getData('Text');
			else if(format == 'text/html') { var x = this.dataTransfer.getData('Text'); return (/\<[a-z]+( [^\>]*|\/|)\>/i).test(x) ? x : null; }
			else if(format == 'text/uri-list') return this.dataTransfer.getData('URL');
			else return null;
		}
		return this.$op ? this.$op.data[format] : (this.dataTransfer ? this.dataTransfer.getData(format) : undefined);
	},

	setDragImage: function(image, x, y){
	
		var op = this.$op, dt = this.dataTransfer;
		if(op.ghost) op.ghost.destroy();
		op.ghost = op.ghostOffset = null;
		
		if(dt && dt.setDragImage) return dt.setDragImage.apply(dt, arguments);
		
		var element = $(image);
		if(!element || element.getStyle('visibility', 'hidden')) return;

		var body = element.getDocument().body,
			st = {
				'position': 'absolute',
				'z-index': 2000,
				'left': -2000,
				'top': 0,
				'max-width': '100%',
				'max-height': '100%',
				'float': 'none',
				'display': 'block',
				'margin': 0
			};
		
		x = $chk(x) ? x : -1;
		y = $chk(y) ? y : -1;

		if(element.parentNode) element = element.snapshot(true, false);
		op.ghost = element.setStyles(st).setStyles({ 'left': this.page.x - x, 'top': this.page.y - y }).inject(body);
		op.ghostOffset = { x: x, y: y };
		op.ghost.addEvents({
			dragenter: eventStop,
			dragleave: eventStop,
			dragover: function(e){
				var t = getDragEventTarget(e);
				e.stop();
				if(lastTarget != t){
					bubbleUpDragEvent('dragenter', e, t, lastTarget);
					if(lastTarget) bubbleUpDragEvent('dragleave', e, lastTarget, t);
					lastTarget = t;
				}
				else
					bubbleUpDragEvent('dragover', e, t);
			},
			drop: function(e){
				e.stop();
				bubbleUpDragEvent('drop', e, getDragEventTarget(e));
			}
		});
		
		function getDragEventTarget(event){
			var doc = event.target.ownerDocument, target,
				ghost = currentOperation.ghost, display;
			if(!ghost || !doc.elementFromPoint) return event.target;
			display = ghost.style.display;
			ghost.style.display = 'none';
			target = doc.elementFromPoint(event.client.x, event.client.y);
			ghost.style.display = display;
			return target;
		};

		function bubbleUpDragEvent(type, event, target, relatedTarget){
			var c;
			event.target = target;
			event.relatedTarget = relatedTarget;
			event.stopPropagation = function(){ c = true; };
			while(!c && target){
				var events;
				if(target.retrieve && (events = target.retrieve('events'))){
					if(events[type])
						events[type].keys.each(function(fn){ fn.apply(target, [event]); });
					if((/enter|leave/).test(type) && events[type + 'self'] && relatedTarget && target != relatedTarget && relatedTarget.prefix != 'xul' && !target.hasChild(relatedTarget))
						events[type + 'self'].keys.each(function(fn){ fn.apply(target, [event]); });
				}
				target = target.parentNode;
			}
		};
	},

	addElement: function(element){
		// TODO: Affects which elements should get the drag and dragend events fired upon them
		// Could also affect how dragImage should be rendered?
	},
	
	setDragElement: function(element, props){
		/*
			TODO: Use relative to current x, y position
			var el = o.ghost == true ? this.element : $(o.ghost),
				p = this.startPos || event.page,
				b = el ? el.getDocument().body : {},
				d = el == this.element ? this.element.getPosition() : p;
			event.setDragElement(el, p.x - d.x - b.offsetLeft, p.y - d.y - b.offsetTop, { opacity: .3 });
		*/
		var x,y;
		element = $(element) || new Element('div', { styles: { width: 1, height: 1, visibility: 'hidden' }});
		if(props){
			element = (element.parentNode ? element.snapshot(true, false) : element).set(props);
			if(props.styles){
				x = props.styles.left;
				y = props.styles.top;
			}
		}
		this.setDragImage(element, x, y);
		return this;
	},
	
	clear: function(format){
		this.dataTransfer.clearData(format);
	},
	
	set: function(format, data){
		if($type(format) == 'object'){ for(var k in format) this.setData(k, format[k]); return this; }
		if(this.dataTransfer && $type(data) == 'string'){
			this.dataTransfer.setData(format, data);
		}
	},
	
	get: function(format){
		if(dataStore.data.has(format)) return dataStore.data.get(format);
		if(this.dataTransfer) return this.dataTransfer.getData(format);
		return null;
	},
	
	getDataTypes: function(){
		var dt = this.dataTransfer;
		if($dataTransferStore){
			var k = $dataTransferStore.data.getKeys();
			if(dt && dt.types) 
				return k.combine(dt.types);
			else if(k.length > 0)
				return k;
		}
		if(dt){
			if(dt.types) return dt.types;
			var a = [], t = this;
			['text/plain', 'text/html', 'text/uri-list'].each(function(m){
				if(t.getData(m) != null) a.push(m);
			});
			return a;
		}
		return [];
	},
	
	getDragType: function(){
		return this.dataTransfer.effectAllowed || 'uninitialized';
	},
	
	setDragType: function(type){
		if(!(/^(none|copy|copyLink|copyMove|link|linkMove|move|all|uninitialized)$/).test(type)) return this;		
		if(this.dataTransfer) this.dataTransfer.effectAllowed = type;
		return this;
	},
	
	getDropType: function(){
		return this.dataTransfer.dropEffect || 'none';
	},
	
	setDropType: function(type){
		if(!(/^(none|copy|link|move)$/).test(type)) return this;
		this.dataTransfer.dropEffect = type;
		return this;
	}
});

DataTransfer.create = function(event, operation){
	var dt = event.dataTransfer;
	if(dt){
		if(!dt.$extended){
			for(var k in DataTransfer.prototype) if(dt[k] == undefined) dt[k] = DataTransfer.prototype[k];
			dt.$extended = true;
		}
		return dt;
	}
	if(operation)
		return dragOp.dataTransfer = (dragOp.dataTransfer || new DataTransfer(dragOp));
	return false; 
};

