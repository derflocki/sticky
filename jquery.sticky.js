/*! Sticky Plugin v2.0.0 for jQuery
 * Author: Anthony Garand
 * Improvements by Florian Dorn
 * Improvements by German M. Bravo (Kronuz) and Ruud Kamphuis (ruudk)
 * Improvements by Leonardo C. Daronco (daronco)
 * Description: Makes an element on the page stick on the screen as you scroll.
 * 
 * vim: tabstop=4 expandtab shiftwidth=4 softtabstop=4
 */

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
		var s=null,p=null,the_sticked_one = false;
		//traverse from bottom to top
		for (var i = 0; i < sticked.length; i++) {
			s = sticked[i], p = (i > 0) ? sticked[getNextVisibleIndex(i,-1)] : null;
			//elementTop = s.stickyWrapper.offset().top,
			//etse = elementTop - s.topSpacing - extra;
			if(!s.visible) {
				continue;
			}
			if(!the_sticked_one && (scrollTop > s.etse - extra)) {
				//stick
				var newTop = s.newTop - scrollTop - extra;
				if (newTop < 0) {
					newTop = newTop + s.topSpacing;
				} else {
					newTop = s.topSpacing;
				}
				the_sticked_one = s;
				if (s.currentTop != newTop) {
					s.css = {
						'position': 'fixed',
						'top':	newTop
					};
					if (s.getWidthFrom.length !== 0) {
						s.css['width'] = $(s.getWidthFrom).width();
					} else {
						s.css['width'] = s.stickyElement.width();
					}
					s.stickyWrapper.css({
						'height': s.stickyElement.outerHeight(),
						'width': s.stickyElement.outerWidth()
					});
					s.stickyElement
					.css(s.css)
					.parent().addClass(s.className);
					s.currentTop = newTop;
				}
				if(p && (scrollTop > p.etse - extra - s.successorHeight)) {
					s.stickyElement.css('top', p.etse - scrollTop - extra - s.stickyElement.outerHeight());
				}
			} else {
				//unstick
				if (the_sticked_one || (s.currentTop !== null)) {
					//unstick
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
		}
	},
	getNextVisibleIndex = function(j, inc) {
		for (var i = j-1; i > -1; i=i+inc) {
			if(sticked[i].stickyElement.is(':visible')) {
				return i;
			}
		}
	},
	resizer = function() {
		reorder();
		var s=null, elementTop = 0, p=null;
		documentHeight = $document.height();
		windowHeight = $window.height();
		for (var i = sticked.length-1; i > -1; i--) {
			s = sticked[i], p = (i > 0) ? sticked[getNextVisibleIndex(i,-1)] : null;
			if(p) {
				s.successorHeight = p.stickyElement.outerHeight();
			}
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
		scroller();
	},
	reorder = function() {
		//order by onscreen-position (top)
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
		update: resizer
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
	$document.on("scroll", scroller);
	if($document.onWithDelay) {
		$document.onWithDelay("resize", resizer, 50, true);
	} else {
		$document.on("resize", resizer);
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
