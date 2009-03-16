var DragEvent, DataTransfer;

(function(){

var eventStop = $lambda(false),
	selectionEvent = (Browser.Engine.trident) ? 'selectstart' : 'mousedown',
	lastTarget,
	currentGhost,
	currentGhostOffset,
	effectAllowed,
	dropEffect,
	startEvent,
	dragElement,
	dataStore;

function extendDragEvent(event, win){
	event = new Event(event, win = (win || window));

	if (!event.relatedTarget && event.type.match(/enter|leave/)){
		var related = lastTarget;
		if(event.type.match(/enter/))
			lastTarget = event.target;
		else if(this.hasChild(event.target))
			lastTarget = event.target;
		if (!(function(){
			while (related && related.nodeType == 3) related = related.parentNode;
			return true;
		}).create({ attempt: Browser.Engine.gecko })()) related = false;
		event.relatedTarget = related;
	}
	
	if (!event.page){
		var doc = win.document, e = event.event;
		doc = (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
		event.page = { x: e.pageX || e.clientX + doc.scrollLeft, y: e.pageY || e.clientY + doc.scrollTop };
		event.client = { x: (e.pageX) ? e.pageX - win.pageXOffset : e.clientX, y: (e.pageY) ? e.pageY - win.pageYOffset : e.clientY };
	}
	
	if (!event.dataTransfer)
		event.dataTransfer = new DataTransfer(event.event.dataTransfer || (win.event ? win.event.dataTransfer : undefined));

	return event;
}

function dragPreStart(event){
	if(dragElement) return;
	dragElement = this;
	startEvent = event;
	var doc = this.getDocument();
	doc.addEvents({	mousemove: dragCheck, mouseup: dragCancel });
	doc.addEvent(selectionEvent, eventStop);
}

function dragCancel(){
	this.removeEvents({	mousemove: dragCheck, mouseup: dragCancel });
	dragElement = null;
	startEvent = null;
}

function dragCleanUp(){
	if(currentGhost){ currentGhost.destroy(); delete currentGhost; }
	delete currentGhostOffset;
	delete dataStore;
	lastTarget = null;
}

function dragCheck(event){
	if(Math.round(Math.sqrt(Math.pow(event.page.x - t.startPos.x, 2) + Math.pow(event.page.y - t.startPos.y, 2))) <= 20) return;
	this.removeEvents({ mousemove: dragCheck, mouseup: dragCancel });
	dragCleanUp();
	if(Browser.Engine.trident){
		dragElement.dragDrop();
		this.removeEvent(selectionEvent, eventStop);
		dragElement = null;
	} else {
		var pd;
		event = new DragEvent(startEvent);
		event.type = 'dragstart';
		event.preventDefault = function(){ pd = true; return this; };
		dragElement.fireEvent('dragstart', event);
		if(pd){
			this.addEventListener('mousemove', dragOver, true);
			this.addEventListener('mouseup', dragEnd, true);
		} else {
			dragCleanUp();
			dragElement = null;
		}
	}
	startEvent = null;
}

function dragOver(event){
	event = new DragEvent(event);
	var t = event.target = getDragEventTarget(event);

	event.type = 'drag';
	dragElement.fireEvent('drag', event);
	
	if(lastTarget != t){
		bubbleUpDragEvent('dragenter', event, t, lastTarget);
		if(lastTarget) bubbleUpDragEvent('dragleave', event, lastTarget, t);
		lastTarget = t;
	} else {
		bubbleUpDragEvent('dragover', event, t);
	}

	event.stop();
}

function dragEnd(event){
	event = new DragEvent(event);
	var t = event.target = getDragEventTarget(event);
	
	if(dropEffect && new RegExp(dropEffect + '|uninitialized|all', 'i').test(effectAllowed))
		bubbleUpDragEvent('drop', event, t);

	dragElement.fireEvent('dragend', event);

	this.removeEvent(selectionEvent, eventStop);
	this.removeEventListener('mousemove', dragOver);
	this.removeEventListener('mouseup', dragEnd);

	dragElement = null;
}

function getDragEventTarget(e){
	var doc = e.target.ownerDocument, d, t;
	if(!currentGhost || !doc.elementFromPoint) return e.target;
	d = currentGhost.style.display;
	currentGhost.style.display = 'none';
	t = doc.elementFromPoint(e.client.x, e.client.y);
	currentGhost.style.display = d;
	return t;
}

function bubbleUpDragEvent(type, event, target, relatedTarget){
	var c;
	e.target = target;
	e.relatedTarget = relatedTarget;
	e.stopPropagation = function(){ c = true; };
	while(!c && target){
		var events;
		if(target.retrieve && (events = target.retrieve('events'))){
			if(events[type])
				events[type].keys.each(function(fn){ fn.apply(target, [e]); });
			if((/enter|leave/).test(type) && events[type + 'self'] && relatedTarget && target != relatedTarget && relatedTarget.prefix != 'xul' && !target.hasChild(relatedTarget))
				events[type + 'self'].keys.each(function(fn){ fn.apply(target, [e]); });
		}
		target = target.parentNode;
	}
}

function onDrag(event){
	extendDragEvent(event);
	if(currentGhost && currentGhostOffset)
		currentGhost.setStyles({
			left: event.page.x - currentGhostOffset.x,
			top: event.page.y - currentGhostOffset.y
		});
}

function onDragEnd(event){
	extendDragEvent(event);
	dragCleanUp();
}

function onDragCheckSelf(event){
	extendDragEvent(event);
	var related = event.relatedTarget;
	if(related == undefined) return true;
	if(related === false) return false;
	return $type(this) != 'document' && related != this && related.prefix != 'xul' && !this.hasChild(related);
}

function toggleDraggable(drag){
	if(Browser.Engine.webkit) this.setStyle('-khtml-user-drag', drag ? 'element' : 'auto');
	else if(this.draggable != undefined) this.draggable = drag;
	else if(drag) this.addEvent('mousedown', dragPreStart);
	else this.removeEvent('mousedown', dragPreStart);
	return this;
}

$extend(Element.NativeEvents, {	dragstart: 2, drag: 2, dragend: 2, dragenter: 2, dragover: 2, dragleave: 2, drop: 2 });

Element.Events.extend({

	dragstart: { condition: extendDragEvent },
	drag: { condition: onDrag },
	dragend: Browser.Engine.webkit ? {  // Incredibly ugly way to delay dragEnd event on webkit until after the drop event to conform with html 5 specs
		onAdd: function(fn){ this.addEvent('dragenddelayed', fn); },
		onRemove: function(fn){ this.removeEvent('dragenddelayed', fn); },
		condition: function(e){ (function(){ onDragEnd(e); this.fireEvent('dragenddelayed', e); }).delay(40, this, ['dragenddelayed', e]); return false; }
	} : { condition: onDragEnd },
	dragenter: { condition: extendDragEvent },
	dragover: { condition: extendDragEvent },
	dragleave: { condition: extendDragEvent },
	drop: { condition: extendDragEvent },
	dragenterself: { base: 'dragenter', condition: onDragCheckSelf },
	dragleaveself: { base: 'dragleave', condition: onDragCheckSelf }

});

Element.implement({

	enableDrag: toggleDraggable.pass(true),
	disableDrag: toggleDraggable.pass(false)

});
	
})();
