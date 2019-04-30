/*
 *	RdSoda.Modal
 *
 *	@author: Clint Harrison
 */
 
var RdSoda = RdSoda || {};

RdSoda.Modal = function() {
	var modal = this;
	
	modal.elem = document.getElementById('modal');
	modal.bgElem = document.getElementById('modal-bg');
	
	modal.resizeModal();
};

RdSoda.Modal.prototype = {
	openModal: function() {
		var modal = this;
		RdSoda.addCSSClass(modal.elem, 'open');
	},
	setLabel: function(label) {
		var modal = this;
		modal.elem.querySelector('h4').innerHTML = label;
	},
	closeModal: function(callback) {
		var modal = this;

		// add listener for CSS transition to complete
		RdSoda.transitionEndListener(modal.elem, function() {
			modal.elem.style.display = 'none';
			callback();
		});
		
		RdSoda.removeCSSClass(modal.elem, 'open');
	},
	resizeModal: function() {
		var modal = this;
		modal.bgElem.style.height = $(document).height();
	},
	showError: function() {
		var modal = this;
		modal.setLabel('Please Try Again');
		RdSoda.addCSSClass(modal.elem, 'error');
		
		modal.elem.querySelector('h4').addEventListener('click', function(event) {
			 location.reload();
		});
	}
};