(function($) {
    'use strict'
    /**
     * Initialize a calendar component
     * @constructor
     * @param {object} that - The current DOM element
     * @param {object} options - The configuration of calendar
     * @callback trigger when date is selected
     */
    function Jcal(that, options, callback) {
        this.opts = $.extend({
            options: 'options you want to set',
            id: 'J-calendar',
            start: '1995-5-1',      // The time JavaScript born
            end: '2043-5-1',        // Last day
            outputFormat: '{Y}-{M}-{D}',
            weekName: ['日', '一', '二', '三', '四', '五', '六'],
            today: true,
            hoverClass: 'J-cal-hover',
            currentDay: 'J-cal-active',
            close: false,
            curr: new Date(),
        }, options)

        this.$el = $(that)
        this.callback = callback || function() {}

        this.init()
    }

    Jcal.prototype = {
        init: function() {
            this.renderTPL()
            // elements
            this.cal       = $('#' + this.opts.id)
            this.sYear     = this.cal.find('.J-cal-select-year select')
            this.sMonth    = this.cal.find('.J-cal-select-month select')
            this.switcher  = this.cal.find('.J-cal-switch')
            this.close     = this.cal.find('.J-cal-close')

            this.current = this.formatDate(this.opts.curr)
            // cache selected
            this.highLight = this.formatDate(this.opts.curr)

            this.initStyle()
            this.setSelect(this.current)
            this.renderWeek(this.current)
            this.renderDate()
            this.bindEvent()

            if (this.opts.close) {
                this.close.show()
            }
        },
        /**
         * Render container html
         */
        renderTPL: function() {
            var TPL = '\
            <div id="{ID}" class="J-cal" style="display:none">\
                <div class="J-cal-change">\
                    <span data-sign="py" class="J-cal-switch prev-year"> « </span>\
                    <span data-sign="pm" class="J-cal-switch prev-month"> ‹ </span>\
                    <span class="J-cal-select-year">\
                        <select name=""></select>\
                    </span>\
                    <span class="J-cal-select-month">\
                        <select name=""></select>\
                    </span>\
                    <span data-sign="nm" class="J-cal-switch next-month"> › </span>\
                    <span data-sign="ny" class="J-cal-switch next-year"> » </span>\
                </div>\
                <div class="J-cal-weeks"></div>\
                <div class="J-cal-body"></div>\
                <div class="J-footer"><span class="J-cal-today">今天</span><span class="J-cal-close" style="display:none">&times;</span></div>\
            </div>'

            if ($('#' + this.opts.id).length < 1) {
                TPL = TPL.replace('{ID}', this.opts.id)
                $('body').eq(0).append( TPL )
            }
        },
        /**
         * Set position related style rules
         */
        initStyle: function() {
            var el   = this.$el
            var h    = el.outerHeight()
            var oLeft= el.offset().left
            var oTop = el.offset().top
            this.cal.css({
                position: 'absolute',
                top: oTop + h,
                left: oLeft
            })
        },
        /**
         * Transform Date object or string to a readable object
         * @param {(string|Date)}
         * @returns {object} - year, month, date, day, firstDay
         */
        formatDate: function(fullDate) {
            var dateRe = /\d{4}-\d{1,2}-\d{1,2}/
            var dateArr
            var now

            if (typeof fullDate === 'string') {
                if(!dateRe.test(fullDate)) {
                    throw new Error('Illegal date string :`' + currTimeString + '`.')
                } else {
                    dateArr = fullDate.split('-')
                    now = new Date(dateArr[0], parseInt(dateArr[1]) - 1, dateArr[2])
                }
            } else {
                if (isNaN(fullDate.getDate())) {
                    throw new Error('Illegal date string :' + fullDate)
                } else {
                    now = fullDate
                }
            }

            var currYear  = now.getFullYear()
            var currMonth = now.getMonth() + 1
            var currDate  = now.getDate()
            var currDay   = now.getDay()

            // Week number of first day
            var firstDay = new Date(currYear, currMonth - 1, 1).getDay()

            return {
                year: currYear,
                month: currMonth,
                date: currDate,
                day: currDay,
                firstDay: firstDay
            }
        },
        /**
         * Bind UI Event
         */
        bindEvent: function() {
            var _this = this

            this.sYear.unbind().bind('change', function() {
                _this.renderDate()
            })
            this.sMonth.unbind().bind('change', function() {
                _this.renderDate()
            })

            this.switcher.unbind().bind('click', function() {
                var sign = $(this).attr('data-sign')
                _this.goTo(sign)
            })
            this.close.unbind().bind('click', function() {
                _this.hide()
            })

            this.$el.unbind().bind('click', function() {
                _this.show()
                return false
            })

            this.cal.unbind().bind('click', function(e) {
                var el = $(e.target)
                var date = parseInt(el.attr('data-date'))
                var now = _this.formatDate(new Date())
                var isPrevDate = el.is('.J-prev-month-date')
                var isNextDate = el.is('.J-next-month-date')

                if (el.attr('data-date')) {
                    if (isPrevDate) {
                        _this.prevMonth()
                        _this.renderDate()
                    }
                    if (isNextDate) {
                        _this.nextMonth()
                        _this.renderDate()
                    }
                    _this.chooseDate(date)
                    _this.markSelected()
                }
                if (_this.opts.today && el.hasClass('J-cal-today')) {
                    _this.sYear.val(now.year)
                    _this.sMonth.val(now.month)
                    _this.current.year = now.year
                    _this.current.month = now.month
                    _this.chooseDate(now.date)
                    _this.hide()
                }

                return false
            })

            $(document).unbind('click.Jcal').bind('click.Jcal', function() {
                _this.hide()
            })
        },
        show: function() {
            this.cal.show()
            this.markSelected()
        },
        hide: function() {
            this.cal.hide()
        },
        markSelected: function() {
            var year = this.current.year
            var month = this.current.month
            var hYear = this.highLight.year
            var hMonth = this.highLight.month
            var hDate = this.highLight.date

            this.cal.find('[data-date]')
            .removeClass(this.opts.currentDay)

            if (year === hYear && month === hMonth) {
                this.cal
                .find('[data-curr-month]')
                .filter('[data-date="'+ hDate +'"]')
                .addClass(this.opts.currentDay)
            }
        },
        chooseDate: function(date) {
            this.updateCurrent()
            this.current.date = date

            this.$el.val(this.opts.outputFormat.replace('{Y}', this.current.year)
                .replace('{M}', this.current.month)
                .replace('{D}', this.current.date))
            this.highLight = $.extend(true, {}, this.current)

            if (this.callback) {
                this.callback.apply(this)
            }

            this.hide()
        },
        prevYear: function() {
            if (this.current.year - 1 >= this.yearHead) {
                this.sYear.val(--this.current.year)
            } else {
                this.logWarning()
            }
        },
        nextYear: function() {
            if (this.current.year + 1 <= this.yearTail) {
                this.sYear.val(++this.current.year)
            } else {
                this.logWarning()
            }
        },
        prevMonth: function() {
            if (this.current.month - 1 >= 1) {
                this.sMonth.val(--this.current.month)
            } else {
                this.sMonth.val(12)
                this.prevYear()
            }
        },
        nextMonth: function() {
            if (this.current.month + 1 <= 12) {
                this.sMonth.val(++this.current.month)
            } else {
                this.sMonth.val(1)
                this.nextYear()
            }
        },
        logWarning: function() {
            if (typeof console !== 'undefined') {
                console.warn('Date out of range.')
            }
        },
        goTo: function(dir) {
            switch (dir) {
                case 'py':
                    this.prevYear()
                    break
                case 'ny':
                    this.nextYear()
                    break
                case 'pm':
                    this.prevMonth()
                    break
                case 'nm':
                    this.nextMonth()
                    break
            }
            this.renderDate()
        },
        updateCurrent: function() {
            this.current.year     = parseInt(this.sYear.val())
            this.current.month    = parseInt(this.sMonth.val())
            this.current.day      = 1
            this.current.firstDay = new Date(this.current.year, this.current.month - 1, 1).getDay()
        },
        setSelect: function(fullDate) {
            var selectYear  = this.cal.find('.J-cal-select-year select')
            var selectMonth = this.cal.find('.J-cal-select-month select')

            var start = this.formatDate(this.opts.start)
            var end   = this.formatDate(this.opts.end)

            // 年、月开始结束范围
            this.yearHead = start.year
            this.monthHead = start.month
            this.yearTail = end.year
            this.monthTail = end.month

            for (var i = start.year; i <= end.year; i++) {
                selectYear.append('<option value="'+ i +'">'+ i +'</option>')
            }
            for (var k = 1; k < 13; k++) {
                selectMonth.append('<option value="'+ k +'">'+ k +'</option>')
            }

            selectYear.val(fullDate.year)
            selectMonth.val(fullDate.month)
            this.$el.val(this.current.year + '-' + this.current.month + '-' + this.current.date)
        },
        isLeapYear: function(year) {
            return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)
        },
        getFullDateCount: function(fullDate) {
            var dateRe = new RegExp('-' + fullDate.month + '-')
            var month31 = '-1-3-5-7-8-10-12-'
            var febDateCount = this.isLeapYear(fullDate.year) ? 29 : 28

            if (dateRe.test(month31)) {
                return 31
            } else if (fullDate.month == 2) {
                return febDateCount
            } else {
                return 30
            }
        },
        renderWeek: function(date) {
            var weekName = this.opts.weekName
            var len = weekName.length
            var weekEl = this.cal.find('.J-cal-weeks')
            var resHTML = ''

            for (var i = 0; i < len; i++) {
                resHTML += '<span class="J-cal-weekname'+ i +'">' + weekName[i] + '</span>'
            }

            weekEl.html(resHTML)
        },
        renderDate: function(d) {
            var dateCount
            var k = 1
            var dateHTML = ''
            var date

            if (typeof d !== 'undefined') {
                date = this.formatDate(d)
            } else {
                date = this.current
            }

            this.updateCurrent()

            dateCount = this.getFullDateCount(date)

            dateHTML += '<ul>'
            for (var i = 0; i < 6; i++) {
                dateHTML += '<li>'

                for (var j = 0; j < 7; j++) {
                    if (k > dateCount) {
                        dateHTML += '<span class="J-cal-week'+ j +' J-cal-date J-next-month-date">&nbsp;</span>'
                    } else {
                        if (i == 0) {
                            if (j > date.firstDay - 1) {
                                dateHTML += '<span class="J-cal-week'+ j +' J-cal-date'+ k +'" data-curr-month="1" data-week="'+ j +'" data-date="'+ k +'">'+ k +'</span>'
                                k++
                            } else {
                                dateHTML += '<span class="J-cal-week'+ j +' J-cal-date J-prev-month-date" data-date="">&nbsp;</span>'
                            }
                        } else {
                            dateHTML += '<span class="J-cal-week'+ j +' J-cal-date'+ k +'" data-curr-month="1" data-week="'+ j +'" data-date="'+ k +'">'+ k +'</span>'
                            k++
                        }
                    }
                }

                dateHTML += '</li>'
                if (k > dateCount) break
            }
            dateHTML += '</ul>'

            this.cal.find('.J-cal-body').html(dateHTML)
            this.fillPrevMonthDate(date, dateCount)
            this.fillNextMonthDate(date, dateCount)
            this.markSelected()
        },
        fillPrevMonthDate: function(d) {
            var days = d.firstDay
            var date = +new Date(d.year, d.month - 1, 1)

            if (days > 0) {
                for (var i = days - 1; i >= 0; i--) {
                    date -= 24 * 60 * 60 * 1000
                    var currDate = new Date(date).getDate()
                    this.cal
                        .find('.J-cal-body li:first')
                        .find('.J-cal-week' + i)
                        .attr('data-date', currDate)
                        .text(currDate)
                }
            }
        },
        fillNextMonthDate: function(d, dCount) {
            var lastWeekDays = (d.firstDay + dCount) % 7
            var days = lastWeekDays > 0 ? 7 - lastWeekDays : 0

            if (days > 0) {
                for (var i = 0; i < days; i++) {
                    this.cal
                        .find('.J-cal-body li:last')
                        .find('.J-cal-week' + (i + lastWeekDays))
                        .attr('data-date', i + 1)
                        .text(i + 1)
                }
            }
        }
    }

    $.fn.Jcal = function (options, callback) {
        return this.each(function () {
            // Create a new instance, Mount to the element
            var plugin = new Jcal(this, options, callback)

            $(this).data('Jcal', plugin)
        })
    }
})(jQuery);