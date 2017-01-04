/*
 *	RdSoda.Info
 *
 *	@author: Clint Harrison
 */
 
var RdSoda = RdSoda || {};

RdSoda.Info = function() {
	var info = this,
		currSectionId;
	
	info.elem = document.getElementById('info');
	info.btnElem = document.getElementById('info-btn');
	info.sectionElem = document.getElementsByClassName('info-section');
	
	// add click event to info btn
	info.btnElem.addEventListener('click', function() {
		info.closeSections();
		RdSoda.toggleCSSClass(info.elem, 'open');
		RdSoda.toggleCSSClass(info.btnElem, 'selected');
		currSectionId = null;
	});
	
	// add click events to sections
	for (var i = 0, sectionsLength = info.sectionElem.length; i < sectionsLength; i++) {
		var sectionElem = info.sectionElem[i],
			sectionBtnElem = sectionElem.querySelector('.info-section-btn');
		
		// attach id value
		sectionBtnElem.sectionId = i;
		
		sectionBtnElem.addEventListener('click', function(event) {
			var sectionId = event.currentTarget.sectionId;
			
			if (sectionId != currSectionId) {
				info.closeSections();
				RdSoda.addCSSClass(info.elem, 'section-'+ sectionId +'-open');
				RdSoda.addCSSClass(info.sectionElem[sectionId], 'open');
				currSectionId = sectionId;
			} else {
				info.closeSections();
				currSectionId = null;
			}
		}, false);
	}
};

RdSoda.Info.prototype = {
	closeSections: function() {
		var info = this;
		for (var j = 0, sectionsLength = info.sectionElem.length; j < sectionsLength; j++) {
			RdSoda.removeCSSClass(info.elem, 'section-'+ j +'-open');
			RdSoda.removeCSSClass(info.sectionElem[j], 'open');
		}
	}
};