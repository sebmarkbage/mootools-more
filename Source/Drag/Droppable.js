/*
Script: Droppable.js
	Used to create drop targets for drag operations using the HTML 5 drag & drop event model.

	License:
		MIT-style license.

	Authors:
		Sebastian Markbåge
*/

var Droppable = new Class({
	
	Implements: [Events, Options],
	
	Binds: ['onEnter', 'onOver', 'onLeave', 'onDrop'],
	
	options: {
		/*
		onEnter,
		onOver,
		onLeave,
		onDrop,
		acceptTypes: false,
		dropType: null,
		dragOverClass: null
		*/
	},
	
	/*
	attached: false,
	*/
	
	initialize: function(element, options){
		this.element = $(element);
		this.setOptions(options);
		this.attach();
	},
	
	attach: function(){
		if (this.attached) return this;
		this.attached = true;
		this.element.addEvents({
			'dragenterself': this.onEnter,
			'dragover': this.onOver,
			'dragleaveself': this.onLeave,
			'drop': this.onDrop
		});
		return this;
	},
	
	detach: function(){
		if (!this.attached) return this;
		this.attached = false;
		this.element.removeEvents({
			'dragenterself': this.onEnter,
			'dragover': this.onOver,
			'dragleaveself': this.onLeave,
			'drop': this.onDrop
		});
		return this;
	},
		
	onDragEnter: function(event){
		event.preventDefault();
		event.setDropType(this.options.dropType); // TODO: determine from several
		this.fireEvent('enter', event);
		this.dropType = event.getDropType();
		if (this.options.dragOverClass) this.element.addClass(this.options.dragOverClass);
	},
	
	onDragOver: function(event){
		event.preventDefault();
		event.setDropType(this.dropType); // TODO: determine from several
		this.fireEvent('over', event);
	},
	
	onDragLeave: function(event){
		this.fireEvent('leave', event);
		if (this.options.dragOverClass) this.element.removeClass(this.options.dragOverClass);
	},
	
	onDrop: function(event){
		event.preventDefault();
		event.setDropType(this.dropType); // TODO: determine from several
		delete this.dropType;
		this.fireEvent('drop', event);
		if (this.options.dragOverClass) this.element.removeClass(this.options.dragOverClass);
	}
});

Element.Properties.droppable = {

	set: function(options){
		var droppable = this.retrieve('droppable');
		return this.eliminate('droppable').store('droppable:options', options);
	},

	get: function(options){
		if (options || !this.retrieve('droppable')){
			if (options || !this.retrieve('droppable:options')) this.set('droppable', options);
			this.store('droppable', new Droppable(this, this.retrieve('droppable:options')));
		}
		return this.retrieve('droppable');
	}
};

Element.implement({

	enableDrop: function(options){
		this.get('droppable', options).attach();
		return this;
	},
	
	disableDrop: function(){
		this.get('droppable').detach();
		return this;
	}

});
