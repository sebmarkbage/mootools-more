/*
Script: Draggable.js
	Makes an element draggable using the HTML 5 drag & drop event model.

	License:
		MIT-style license.

	Authors:
		Sebastian Markbåge
*/

var Draggable = new Class({
	
	Implements: [Events, Options],
	
	Binds: ['onStart', 'onDrag', 'onEnd'],
	
	options: {
		/*
		onStart,
		onDrag,
		onEnd,
		data: null,
		*/
		ghost: true,
		ghostProperties: { opacity: .3 },
		dragType: 'all',
		dragSensitivity: 20
	},
	
	/*
	attached: false,
	startPos: false,
	*/
	
	initialize: function(element, options){
		this.element = $(element);
		this.document = element.getDocument();
		this.setOptions(options);
		this.attach();
	},
	
	toElement: function(){ return this.element; },
	
	attach: function(){
		this.element.addEvents({
			'dragstart': this.onStart,
			'drag': this.onDrag,
			'dragend': this.onEnd
		});
		return this;
	},
	
	detach: function(){
		this.element.removeEvents({
			'dragstart': this.onStart,
			'drag': this.onDrag,
			'dragend': this.onEnd
		});
		return this;
	},
	
	onStart: function(event){
		// TODO: deselect or stop operation depending on the current selection
		var o = this.options;
		if(o.data) event.setData(o.data);
		//if(o.types) event.setDragType(o.dragType);
		event.setDragElement(o.ghost == true ? this.element : $(o.ghost), undefined, undefined, o.ghostProperties);
		this.fireEvent('start', event);
		this.dragType = event.getDragType();
	},
	
	onDrag: function(event){
		this.fireEvent('drag', event);
	},
	
	onEnd: function(event){
		delete this.dragType;
		this.fireEvent('end', event);
	}
	

});

Element.Properties.draggable = {

	set: function(options){
		var draggable = this.retrieve('draggable');
		if(draggable) draggable.detach();
		return this.eliminate('draggable').store('draggable:options', options);
	},

	get: function(options){
		if(options || !this.retrieve('draggable')){
			if (options || !this.retrieve('draggable:options')) this.set('draggable', options);
			this.store('draggable', new Draggable(this, this.retrieve('draggable:options')));
		}
		return this.retrieve('draggable');
	}
};

Element.implement({

	enableDrag: function(options){
		this.get('draggable', options).attach();
		return this;
	},
	
	disableDrag: function(){
		this.get('draggable').detach();
		return this;
	}
});








(function(){

	var eventStop = $lambda(false),
		selectionEvent = (Browser.Engine.trident) ? 'selectstart' : 'mousedown',
		currentOperation;

	function dragPreStart(event){
		if (currentOperation) return;
		currentOperation = {
			data: new DataTransfer(),
			element: this,
			startEvent: event
		};
		var doc = this.getDocument();
		doc.addEvents({	mousemove: dragCheck, mouseup: dragCancel });
		doc.addEvent(selectionEvent, eventStop);
	};

	function dragCancel(){
		this.removeEvents({	mousemove: dragCheck, mouseup: dragCancel });
		dragCleanUp();
	};

	function dragCheck(event){
		if (Math.round(Math.sqrt(Math.pow(event.page.x - t.startPos.x, 2) + Math.pow(event.page.y - t.startPos.y, 2))) <= 20) return;

		this.removeEvents({ mousemove: dragCheck, mouseup: dragCancel });

		if (Browser.Engine.trident){
			currentOperation.element.dragDrop();
			this.removeEvent(selectionEvent, eventStop);
			return;
		}

		event = currentOperation.startEvent;
		event.type = 'dragstart';
		event.dataTransfer = currentOperation.data;
		var init;
		event.preventDefault = function(){ init = true; return this; };
		currentOperation.element.fireEvent('dragstart', event);
		if (init){
			this.addEventListener('mousemove', dragOver, true);
			this.addEventListener('mouseup', dragEnd, true);
		} else {
			dragCleanUp();
		}
	};

	function dragOver(event){
		event = new Event(event);
		var target = event.target = getDragEventTarget(event),
			lastTarget = currentOperation.lastTarget;
			
		event.type = 'drag';
		onDrag(event);
		dragElement.fireEvent('drag', event);
		
		if(lastTarget != target){
			bubbleUpDragEvent('dragenter', event, target, lastTarget);
			if(lastTarget) bubbleUpDragEvent('dragleave', event, lastTarget, target);
			currentOperation.lastTarget = target;
		} else {
			bubbleUpDragEvent('dragover', event, target);
		}

		event.stop();
	};

	function dragEnd(event){
		event = new Event(event);
		event.target = getDragEventTarget(event)
		var dataTransfer = currentOperation.data;
		
		if(dataTransfer.dropEffect && new RegExp(dataTransfer.dropEffect + '|uninitialized|all', 'i').test(dataTransfer.effectAllowed))
			bubbleUpDragEvent('drop', event, event.target);

		currentOperation.element.fireEvent('dragend', event);

		this.removeEvent(selectionEvent, eventStop);
		this.removeEventListener('mousemove', dragOver);
		this.removeEventListener('mouseup', dragEnd);
	};

	function dragCleanUp(){
		if(currentOperation.ghost) currentOperation.ghost.destroy();
		delete currentOperation;
	};

	function onDrag(event){
		var ghost = currentOperation.ghost, offset = currentOperation.ghostOffset;
		if(ghost)
			ghost.setStyles({
				left: event.page.x - offset.x,
				top: event.page.y - offset.y
			});
	};

	$extend(Element.Events, {

		drag: { condition: onDrag },
		dragend: {
			condition: Browser.Engine.webkit ? function(e){
				// Delay dragEnd event on webkit until after the drop event to conform with html 5 specs
				if (e.$delayed) return true;
				(function(){ dragCleanUp(); e.$delayed = true; this.fireEvent('dragend', e); }).delay(40, this);
				return false;
			} : dragCleanUp
		},
		dragenterself: { base: 'dragenter', condition: onDragCheckSelf },
		dragleaveself: { base: 'dragleave', condition: onDragCheckSelf }

	});

	function toggleDraggable(drag){
		if (Browser.Engine.webkit) this.setStyle('-khtml-user-drag', drag ? 'element' : 'auto');
		else if (this.draggable != undefined) this.draggable = drag;
		else if (drag) this.addEvent('mousedown', dragPreStart);
		else this.removeEvent('mousedown', dragPreStart);
		return this;
	};

	Element.implement({

		enableDrag: toggleDraggable.pass(true),
		disableDrag: toggleDraggable.pass(false)

	});
	
})();
