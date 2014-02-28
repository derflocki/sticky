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
		wrapperClassName: 'sticky-wrapper',		//class that is added to the wrapper
		className: 'is-sticky',					//class that is added to the wrapper when sticked
		classNameWrapped: 'sticky-wrapped',		//class that is added to the wrapped element
		center: false,
		getWidthFrom: ''
	},
	$window = $(window),
	$document = $(document),
	sticked = [],
	windowHeight = 0,
	documentHeight = 0,
	dwh = 0,
	scroller = function() {
		var scrollTop = $window.scrollTop(),
		extra = (scrollTop > dwh) ? dwh - scrollTop : 0;
		//the sticked's are ordered from bottom to top. If one was aleardy sticked, others are unsticked
		var s=null,p=null, one_is_sticky  = false;
		//traverse from bottom to top
		for (var i = 0; i < sticked.length; i++) {
			s = sticked[i], p = (i > 0) ? sticked[getNextVisibleIndex(i)] : null;
			//elementTop = s.stickyWrapper.offset().top,
			//etse = elementTop - s.topSpacing - extra;
			if(!s.visible) {
				continue;
			}
			if(!one_is_sticky && (scrollTop > s.etse - extra)) {
				//stick
				var newTop = s.newTop - scrollTop - extra;
				if (newTop < 0) {
					newTop = newTop + s.topSpacing;
				} else {
					newTop = s.topSpacing;
				}
				if(p && (scrollTop > p.etse - extra - s.height)) {
					newTop = p.etse - scrollTop - extra - s.height;
				}
				one_is_sticky = true;
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
					s.stickyWrapper.css('height', s.stickyElement.outerHeight()).addClass(s.className);
					s.stickyElement.css(s.css);
					s.currentTop = newTop;
				}
			} else { 
				//unstick
				if (one_is_sticky || (s.currentTop !== null)) {
					//unstick
					s.css = {
						'height': '',
						'width': '',
						'position': 'relative',
						'top': ''
					};
					s.stickyWrapper.css({'height': ''}).removeClass(s.className);
					s.stickyElement.css(s.css);
					s.currentTop = null;
				}
			}
		}
	},
	getNextVisibleIndex = function(j) {
		for (var i = j-1; i > -1; i--) {
			if(sticked[i].visible) {
				return i;
			}
		}
	},
	resizer = function() {
			reorder();
			for (var i = sticked.length-1; i > -1; i--) {
				sticked[i].visible = sticked[i].stickyElement.is(':visible');
			}
			var s=null, elementTop = 0, p=null;
			documentHeight = $document.height();
			windowHeight = $window.height();
			dwh = documentHeight - windowHeight;
			for (var i = sticked.length-1; i > -1; i--) {
				s = sticked[i], p = (i > 0) ? sticked[getNextVisibleIndex(i)] : null;
				if(p) {
					s.height = s.stickyElement.outerHeight();
				}
				elementTop = s.stickyWrapper.offset().top;
				s.etse = elementTop - s.topSpacing;
				s.newTop = documentHeight - s.stickyElement.outerHeight()- s.topSpacing - s.bottomSpacing;
				if(s.currentTop !== null) 
				{
					if (s.getWidthFrom.length !== 0) {
						s.css['width'] = $(s.getWidthFrom).width();
					} else {
						//unfix it, so we can properly compute the width, and then refix it again
						s.stickyElement.css({
							'position': 'relative',
							'width': ''
						});
						s.css['width'] = s.stickyElement.outerWidth(); 
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

				var wrapper = $('<div></div>').addClass(o.wrapperClassName);
				stickyElement.addClass(o.classNameWrapped).css('position', 'relative').wrapAll(wrapper);
				var stickyWrapper = stickyElement.parent();
				if (o.center) {
					stickyWrapper.css({width:stickyElement.outerWidth(),marginLeft:"auto",marginRight:"auto"});
				}

				if (stickyElement.css("float") == "right") {
					stickyElement.css({"float":"none"});
					stickyWrapper.css({"float":"right"});
				}
				
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
	
	//document scroll is not working in IE(7,8)
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
			return els;
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.sticky');
		}
	};
})(jQuery);
