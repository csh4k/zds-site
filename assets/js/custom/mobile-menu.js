/* ===== Zeste de Savoir ====================================================
   Author: Alex-D / Alexandre Demode
   ---------------------------------
   Mobile sidebar menu, swipe open/close
   ========================================================================== */


/**
 * Add class for mobile navigator does not support fixed position
 */
var navU = navigator.userAgent;

// Android Mobile
var isAndroidMobile = navU.indexOf('Android') > -1 && navU.indexOf('Mozilla/5.0') > -1 && navU.indexOf('AppleWebKit') > -1;

// Android Browser (not Chrome)
var regExAppleWebKit = new RegExp(/AppleWebKit\/([\d.]+)/);
var resultAppleWebKitRegEx = regExAppleWebKit.exec(navU);
var appleWebKitVersion = (resultAppleWebKitRegEx === null ? null : parseFloat(regExAppleWebKit.exec(navU)[1]));
var disableMobileMenu = isAndroidMobile && appleWebKitVersion !== null && appleWebKitVersion < 537;

if(disableMobileMenu)
    $('html').removeClass('enable-mobile-menu');



/**
 * Hide address bar
 */
window.addEventListener("load",function() {
    setTimeout(function(){
        window.scrollTo(0, 1);
        window.scrollTo(0, 0);
    }, 0);
});



/**
 * Get prefix to support CSS transform
 */
var transform = '';
var prefixedPropertyNames = ["transform", "msTransform", "MozTransform", "WebkitTransform", "OTransform"];
var prefixes = ["", "-ms-", "-moz-", "-webkit-", "-o-"];
var tempDiv = document.createElement("div");
for(var i = 0; i < prefixedPropertyNames.length; ++i){
    if(typeof tempDiv.style[prefixedPropertyNames[i]] != 'undefined'){
        transform = prefixes[i];
        break;
    }
}
transform = transform+"transform";



/**
 * Manage mobile sidebar on resize
 */
$(window).on('resize', function(){
    if(parseInt($('html').css('width')) < 960 && !disableMobileMenu){
        $('.page-container').css('width', $('html').css('width'));

        if(!$('#mobile-menu').hasClass('initialized')){
            $('#mobile-menu').addClass('initialized');


            /**
             * Manage menu button
             */
            $('.mobile-menu-btn').on('click', function(e){
                if(!$('html').hasClass('show-mobile-menu')){
                    toggleMobileMenu(true);

                    e.preventDefault();
                    e.stopPropagation();
                }
            });



            /**
             * Build sidebar menu from page
             */
            appendToSidebar($('#search'), true);
            appendToSidebar($('.logbox .my-account'), true);
            appendToSidebar($('.header-menu'));

            $('.page-container .mobile-menu-bloc .mobile-menu-bloc').each(function(){
                appendToSidebar($(this));
            });
            $('.page-container .mobile-menu-bloc:not(.my-account-dropdown)').each(function(){
                appendToSidebar($(this));
            });

            appendToSidebar($('.my-account-dropdown'));
        }


        /**
         * Manage touch events for mobile sidebar
         */
        if(!$('#mobile-menu').hasClass('initialized-events')){
            var beginTouchDown = 0;
            var borderWidth    = 50;
            var swipping       = false;

            $('body')
            .on('touchstart', function(e){
                beginTouchDown = parseInt(e.originalEvent.touches[0].pageX, 10) - $('.page-container').offset().left;
            });

            $('.page-container')
            .on('touchmove', function(e){
                if(swipping || parseInt(e.originalEvent.touches[0].pageX, 10) - $(this).offset().left < borderWidth){
                    e.preventDefault();
                    $('body:not(.swipping)').addClass('swipping');
                    
                    swipping   = true;

                    var toMove = parseInt(e.originalEvent.touches[0].pageX, 10) - beginTouchDown;
                    toMove     = (toMove * 100) / parseInt($('html').width());

                    if(toMove > 0 && toMove < 90){
                        var props = {};
                        props[transform] = "translate3d("+toMove+"%, 0, 0)";
                        $(this).css(props);

                        toMove  = ((toMove * 20) / 90) - 20;
                        props[transform] = "translate3d("+toMove+"%, 0, 0)";
                        $('#mobile-menu').css(props);
                    }
                }
            })
            .on('touchend touchleave touchcancel', function(e){
                if(swipping){
                    var offset  = parseInt($(this).offset().left);
                    var width   = parseInt($('html').width());
                    var visible = (offset > width/3 && !$('html').hasClass('show-mobile-menu'))
                                    || (offset > width-width/3 && $('html').hasClass('show-mobile-menu'));
                    toggleMobileMenu(visible);

                    swipping = false;
                    $('body').removeClass('swipping');

                    var props = {};
                    props[transform] = '';
                    $('.page-container, #mobile-menu').css(props);
                }
            });

            
            $('.page-container').on('click', function(e){
                if($('html').hasClass('show-mobile-menu')){
                    toggleMobileMenu(false);

                    e.preventDefault();
                    e.stopPropagation();
                }
            });


            $('#mobile-menu').addClass('initialized-events');
        }
    } else {
        $('html').removeClass('show-mobile-menu');
        $('#mobile-menu').removeClass('initialized-events');
        $('.page-container').removeAttr('style');
        $('.page-container').off('click touchstart touchmove touchend');
    }
});
$(window).trigger('resize');



function appendToSidebar($elem, force){
    if($elem.hasClass('mobile-menu-imported'))
        return;

    if(force){
        $elem.addClass('mobile-menu-imported');
        $elem.clone().removeAttr('id').appendTo('#mobile-menu');
        return;
    }

    $div = $('<div/>');
    $div.addClass('mobile-menu-bloc');
    $div.attr('data-title', $elem.attr('data-title'));

    if($elem.hasClass('mobile-show-ico'))
        $div.addClass('mobile-show-ico');

    $links = ($elem.hasClass('mobile-all-links'))
        ? $('a:not(.action-hover)', $elem).addClass('mobile-menu-link')
        : $('.mobile-menu-link', $elem)
    ;

    $links.each(function(){
        if($(this).parents('.mobile-menu-imported').length == 0)
            $div.append($(this).clone());
    });

    $elem.addClass('mobile-menu-imported');

    $div.appendTo($('#mobile-menu'));
}





/**
 * Toggle sidebar for mobiles
 */
function toggleMobileMenu(visible){
    if(visible == null)
        visible = !$('html').hasClass('show-mobile-menu');

    $('body').removeClass('swipping');

    var viewportmeta = document.querySelector('meta[name="viewport"]');

    if(visible){
        if(!$('html').hasClass('show-mobile-menu')){
            var scrollTop = $(document).scrollTop();
            $('.page-container').css({
                'margin-top': '-' + scrollTop + 'px',
                'padding-bottom': scrollTop + 'px'
            });
            $('html').addClass('show-mobile-menu');

            viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1.0';
        }

        // Manage back button to close sidebar
        /*
        if(history && history.pushState){
            history.pushState(null, document.title, this.href);

            $(window).off('popstate').one('popstate', function(e){
                if($('html').hasClass('show-mobile-menu'))
                    toggleMobileMenu(false);
                else
                    window.history.back();
            });
        }
        */
    } else {
        $('html').removeClass('show-mobile-menu');

        // Reset CSS modifications for restore scroll
        var scrollTop = parseInt($('.page-container').css('padding-bottom'));
        $('.page-container').css({
            'margin-top': '',
            'padding-bottom': ''
        });
        if(scrollTop > 0)
            $(document).scrollTop(scrollTop);

        // Stop swipping
        $('body').removeClass('swipping');

        setTimeout(function(){
            // Reinit mobile menu at top
            $('#mobile-menu').scrollTop(0);

            // Restore zoom
            viewportmeta.content = 'width=device-width, minimum-scale=1.0, initial-scale=1.0';

            // Bugfix <html> element
            $('html').css({
                'position': 'absolute',
                'left': '0'
            });
            setTimeout(function(){
                $('html').removeAttr('style');
            }, 500);
        }, 200);
    }
}