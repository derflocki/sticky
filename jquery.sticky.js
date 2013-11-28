// Sticky Plugin v1.0.0 for jQuery
// =============
// Author: Anthony Garand
// Improvements by German M. Bravo (Kronuz) and Ruud Kamphuis (ruudk)
// Improvements by Leonardo C. Daronco (daronco)
// Created: 2/14/2011
// Date: 2/12/2012
// Website: http://labs.anthonygarand.com/sticky
// Description: Makes an element on the page stick on the screen as you scroll
//       It will only set the 'top' and 'position' of your element, you
//       might need to adjust the width in some cases.
// vim: tabstop=4 expandtab shiftwidth=4 softtabstop=4

(function($) {
	var defaults = {
		topSpacing: 0,
		bottomSpacing: 0,
		className: 'is-sticky',
		wrapperClassName: 'sticky-wrapper',
		center: false,
		getWidthFrom: ''
	},
	$window = $(window),
	$document = $(document),
	sticked = [],
	windowHeight = $window.height(),
	documentHeight = 0,
	scroller = function() {
		var scrollTop = $window.scrollTop(),
		//documentHeight = $document.height(),
		dwh = documentHeight - windowHeight,
		extra = (scrollTop > dwh) ? dwh - scrollTop : 0;
		//the sticked's are ordered from bottom to top, so if one was aleardy sticked, others are unsticked
		//TODO: it would be nice if the items were to be shoved off the screen
		var one_sticked = false;
		for (var i = 0; i < sticked.length; i++) {
			var s = sticked[i];
			//elementTop = s.stickyWrapper.offset().top,
			//etse = elementTop - s.topSpacing - extra;
			if(!s.visible) {
				continue;
			}
			if (one_sticked || (scrollTop <= s.etse - extra)) {
				if (one_sticked || (s.currentTop !== null)) {
					s.css = {
						'height': '',
						'width': '',
						'position': 'relative',
						'top': ''
					};
					s.stickyWrapper.css('height', '');
					s.stickyElement
					.css(s.css)
					.parent().removeClass(s.className);
					s.currentTop = null;
				}
			}
			else {
				var newTop = s.newTop - scrollTop - extra;
				if (newTop < 0) {
					newTop = newTop + s.topSpacing;
				} else {
					newTop = s.topSpacing;
				}
				if (s.currentTop != newTop) {
					s.css = {
						'position': 'fixed',
						'top':	newTop
					};
					if (s.getWidthFrom.length !== 0) {
						s.css['width'] = $(s.getWidthFrom).width();
					} else {
						s.css['width'] = s.stickyElement.css('width');
					}
					s.stickyWrapper.css('height', s.stickyElement.css('height'));
					s.stickyElement
					.css(s.css)
					.parent().addClass(s.className);
					s.currentTop = newTop;
				}
				one_sticked = true;
			}
		}
	},
	resizer = function() {
		reorder();
		//TODO: precompute the "break-points" so we don't have to do it on each scroll
		var s=null, elementTop = 0;
		documentHeight = $document.height();
		windowHeight = $window.height();
		for (var i = 0; i < sticked.length; i++) {
			s = sticked[i];
			elementTop = s.stickyWrapper.offset().top;
			s.etse = elementTop - s.topSpacing;
			s.newTop = documentHeight - s.stickyElement.outerHeight()- s.topSpacing - s.bottomSpacing;
			s.visible = s.stickyElement.is(':visible');
			if(s.currentTop !== null) {
				if (s.getWidthFrom.length !== 0) {
					s.css['width'] = $(s.getWidthFrom).width();
				} else {
					//unfix it, so we can get the width, and then refix it again
					s.stickyElement.css({
						'position': 'relative',
						'width': ''
					});
					s.css['width'] = s.stickyElement.css('width');
					s.css['position'] = 'fixed';
				}
				s.stickyElement.css(s.css);
			}
		}
	},
	reorder = function() {
		sticked.sort(function(a,b) {
			return b.stickyWrapper.offset().top - a.stickyWrapper.offset().top;
		});
	},
	methods = {
		init: function(options) {
			var o = $.extend(defaults, options);
			return this.each(function() {
				var stickyElement = $(this);

				//var stickyId = stickyElement.attr('id');
				var wrapper = $('<div></div>')
				//.attr('id', stickyId + '-sticky-wrapper')
				.addClass(o.wrapperClassName);
				stickyElement.css('position', 'relative').wrapAll(wrapper);

				if (o.center) {
					stickyElement.parent().css({width:stickyElement.outerWidth(),marginLeft:"auto",marginRight:"auto"});
				}

				if (stickyElement.css("float") == "right") {
					stickyElement.css({"float":"none"}).parent().css({"float":"right"});
				}

				var stickyWrapper = stickyElement.parent();
				sticked.push({
					topSpacing: o.topSpacing,
					bottomSpacing: o.bottomSpacing,
					stickyElement: stickyElement,
					currentTop: null,
					stickyWrapper: stickyWrapper,
					className: o.className,
					getWidthFrom: $(o.getWidthFrom),
					css: {},
					visible: false
				});
			});
		},
		update: scroller
	};
/*
	// should be more efficient than using $window.scroll(scroller) and $window.resize(resizer):
	if (window.addEventListener) {
		window.addEventListener('scroll', scroller, false);
	//	window.addEventListener('resize', resizer, false);
	} else if (window.attachEvent) {
		window.attachEvent('onscroll', scroller);
	//	window.attachEvent('onresize', resizer);
	}
	*/
	$window.on("scroll", scroller);
	if($window.onWithDelay) {
		$window.onWithDelay("resize", resizer, 50, true);
	} else {
		$window.on("resize", resizer);
	}

	$.fn.sticky = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method ) {
			var els = methods.init.apply( this, arguments );
			resizer();
			scroller();
			return els;
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.sticky');
		}
	};
	//$(function() {
	//	setTimeout(scroller, 0);
	//});
})(jQuery);
