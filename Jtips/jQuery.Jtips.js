/**
 * Jtips 插件
 */
(function ($) {
    var Jtips = function (that, options, callback) {
        this.opts = $.extend({
            content: that.title || '',
            width: null,
            oTop: 5,
            oLeft: 5,
            zIndex: 1,
            event: null,
            position: 'top',
            close: false

        }, options);

        this.$obj = $(that);
        this.callback = callback || function() {};

        this.init();

    };

    Jtips.prototype = {
        init: function() {

            this.insertStyles('.Jtips { position: relative; float:left; } .Jtips-close { position:absolute; color:#ff6600; font:12px "simsun"; cursor:pointer; } .Jtips-top .Jtips-close { right:1px; top:0px; } .Jtips-bottom .Jtips-close { right:1px; top:5px; } .Jtips-left .Jtips-close { right:6px; top:1px; } .Jtips-right .Jtips-close { right:1px; top:1px; } .Jtips-arr { position: absolute; background-image:url(http://misc.360buyimg.com/product/skin/2012/i/arrow.gif); background-repeat:no-repeat; overflow:hidden; } .Jtips-top { padding-bottom: 5px; } .Jtips-top .Jtips-arr { left:10px; bottom:0; width:11px; height:6px; background-position:0 -5px; _bottom:-1px; } .Jtips-bottom { padding-top: 5px; } .Jtips-bottom .Jtips-arr { top:0; left:10px; width:11px; height:6px; background-position:0 0; } .Jtips-left { padding-right: 5px;  } .Jtips-left .Jtips-arr { right:0; top:10px; width:6px; height:11px; background-position:-5px 0;} .Jtips-right {padding-left: 5px; } .Jtips-right .Jtips-arr {top:10px; left:0; width:6px; height:11px; background-position:0 0;  } .Jtips-con { float:left; padding:10px; background:#fffdee; border:1px solid #edd28b; color:#ff6501; -moz-box-shadow: 0 0 2px 2px #eee; -webkit-box-shadow: 0 0 2px 2px #eee; box-shadow: 0 0 2px 2px #eee; } .Jtips-con a,.Jtips-con a:hover,.Jtips-con a:visited { color:#005fab; text-decoration:none; } .Jtips-con a:hover { text-decoration: underline; }');

            if ( this.opts.event === null ) {
                this.show();
            } else {
                this.bindEvent();
            }
        },
        insertStyles: function(cssString) {
            var doc = document,
                heads = doc.getElementsByTagName("head"),
                style = doc.createElement("style"),
                link = doc.createElement("link");

            if ( /\.css$/.test(cssString) ) {
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = cssString;

                if (heads.length) {
                    heads[0].appendChild(link);
                } else {
                    doc.documentElement.appendChild(link);
                }
            } else {
                style.setAttribute("type", "text/css");

                if (style.styleSheet) {
                    style.styleSheet.cssText = cssString;
                } else {
                    var cssText = doc.createTextNode(cssString);
                    style.appendChild(cssText);
                }
                if (heads.length) {
                    heads[0].appendChild(style);
                }
            }
        },
        bindEvent: function() {
            var _this = this;

            this.$obj.unbind(this.opts.event).bind(this.opts.event, function() {
                _this.show();
            });

        },
        bindClose: function(tips) {
            var _this = this;

            tips.find('.Jtips-close').bind('click', function() {
                _this.remove();
            });
        },
        getPosition: function($holder) {
            var el = this.$obj;

            return {
                w: el.outerWidth(),
                h: el.outerHeight(),
                oTop: el.offset().top,
                oLeft: el.offset().left
            };
        },
        setPosition: function(obj, pos) {
            var p = this.getPosition(),
                bWidth = $('body').eq(0).width(),
                bHeight = $('body').eq(0).height();

            obj.css({
                'position': 'absolute',
                'z-index': this.opts.zIndex
            });

            if ( pos === 'left' ) {
                obj.css({
                    'top': p.oTop-10+this.opts.oTop,
                    'left': p.oLeft-this.tips.outerWidth()-this.opts.oLeft
                });
            }
            if ( pos === 'right' ) {
                obj.css({
                    'left': p.oLeft+p.w+this.opts.oLeft,
                    'top': p.oTop-10+this.opts.oTop
                });
            }
            if ( pos === 'top' ) {
                obj.css({
                    'left': p.oLeft-10+this.opts.oLeft,
                    'top': p.oTop-this.tips.outerHeight()-this.opts.oTop
                });
            }
            if ( pos === 'bottom' ) {
                obj.css({
                    'left': p.oLeft-10+this.opts.oLeft,
                    'top': p.oTop+p.h+this.opts.oTop
                });
            }
        },
        show: function() {
            var close = this.opts.close ? '<div class="Jtips-close">&times;</div>' : '';
            var tips = $('<div class="Jtips Jtips-'+ this.opts.position +'"><div class="Jtips-arr"></div>'+ close +'<div class="Jtips-con">'+ this.opts.content +'</div></div>');
            var _this = this;

            this.tips = tips;

            $('body').eq(0).append(tips);

            this.tips.css('width', this.opts.width||tips.width()).find('.Jtips-con').css('width', (this.opts.width||tips.width())-20 );

            this.setPosition(tips, this.opts.position);

            this.bindClose(tips);

            $(window).resize(function() {
                _this.setPosition(tips, _this.opts.position)
            });

            if ( typeof this.callback === 'function' ) {
                this.callback.apply(this.$obj, [tips]);
            }
        },
        hide: function() {
            this.tips.hide();
        },
        remove: function() {
            this.tips.remove();
        }

    };


    $.fn.Jtips = function (options, callback) {

        return this.each(function () {
            var tips = new Jtips(this, options, callback);

            $(this).data('Jtips', tips);
        });
    };
}(jQuery));
