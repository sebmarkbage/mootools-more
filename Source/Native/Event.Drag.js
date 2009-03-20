/*
Script: Event.Drag.js
	Overrides the Event native to also cover drag and drop events.

	License:
		MIT-style license.

	Authors:
		Sebastian Markbåge
*/

// This logic should be moved to Core to avoid duplicate code and a cleaner model

(function(){

	var originalConstructor = Event.prototype.constructor,
		lastTarget;
	
	Event = new Native({
	
		legacy: Event,
		name: 'Event',
		
		initialize: function(event, win){

			event = originalConstructor.apply(this, arguments);
			win = win || window;
			
			if(!event.type.match(/drag|drop/)) return event;

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
			
			if (event.type == 'dragend') lastTarget = undefined;
			
			if (!event.page){
				var doc = win.document, e = event.event;
				doc = (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
				event.page = { x: e.pageX || e.clientX + doc.scrollLeft, y: e.pageY || e.clientY + doc.scrollTop };
				event.client = { x: (e.pageX) ? e.pageX - win.pageXOffset : e.clientX, y: (e.pageY) ? e.pageY - win.pageYOffset : e.clientY };
			}
			
			if (!event.dataTransfer && DataTransfer)
				event.dataTransfer = DataTransfer.create(event, win);

			return event;
		}
	
	});

	$extend(Element.NativeEvents, {	dragstart: 2, drag: 2, dragend: 2, dragenter: 2, dragover: 2, dragleave: 2, drop: 2 });

	var $check = function(event){
		var related = event.relatedTarget;
		if(related == undefined) return true;
		if(related === false) return false;
		return $type(this) != 'document' && related != this && related.prefix != 'xul' && !this.hasChild(related);
	};

	$extend(Element.Events, {

		dragend: Browser.Engine.webkit ? {
			condition: function(e){
				// Ugly way to delay dragend event on webkit until after the drop event
				// to conform with html 5 specs. Important for correct clean up.
				if (e.$delayed) return true;
				(function(){ e.$delayed = true; this.fireEvent('dragend', e); }).delay(40, this);
				return false;
			}
		} : {},
		dragenterself: { base: 'dragenter', condition: $check },
		dragleaveself: { base: 'dragleave', condition: $check }

	});
	
})();