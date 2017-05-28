/*
 * Appointment selector
 *
 *
 * Copyright (c) 2017 Mashhood Rastgar
 * Licensed under the MIT license.
 */
(function ($) {

  if(!window.moment) {
    throw new Error('`moment.js` library is required.');
  }
  var elements = [];
  var activeDate = moment().startOf('day');
  var opts = {
    // 0 is sunday
    times: [],
    // String, array format is DD/MM/YYYY
    holidays: [],
    // String array, format is YYYY-MM-DDTHH:mm:ss.SSSZ
    bookings: [],
    // function triggered on selection
    select: null
  };

  function render() {
    var component = $('<div class="appointment-selector"></div>');

    component.append('<div class="as-header">' +
        '<button class="as-prev-day">Previous</button>' +
        '<div class="as-active-date">' + activeDate.format('DD/MM/YYYY') + '</div>' +
        '<button class="as-next-day">Next</button>' +
      '</div>' +
      '<ul class="as-time-list"></ul>');

    var day = activeDate.day();
    var start = 0;
    var end = 24;
    if(opts.times && opts.times.length > 0 && opts.times[day]) {
      start = opts.times[day].start;
      end = opts.times[day].end;
    }

    for(start; start < end; start++) {
      var slot = moment(activeDate).add(start, 'hours').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
      var booked = false;
      for(var index in opts.bookings) {
        if(moment(slot).isSame(moment(opts.bookings[index]), 'hour')) {
          booked = true;
          break;
        }
      }

      component.find('.as-time-list').append('' +
      (booked ? '' :
      '<li class="as-time" data-as-selection="' + slot  + '">' +
        ((start < 10) ? '0' + start : start) + ':00' +
      '</li>') +
      '<li class="as-time" data-as-selection="' +
        moment(slot).add(30, 'minutes').format('YYYY-MM-DDTHH:mm:ss.SSSZ') + '">' +
        ((start < 10) ? '0' + start : start) + ':30' +
      '</li>');
    }

    elements.each(function() {
        $(this).html(component);
    });

    return elements;
  }

  // moves day backward or forward, skipping over holidays as needed.
  function moveDay(name) {
    activeDate[name]('1', 'day');
    if(opts && opts.holidays && Array.isArray(opts.holidays)) {
      for(var index in opts.holidays) {
        var holiday = opts.holidays[index];
        if(moment(holiday, 'DD/MM/YYYY').startOf('day').isSame(activeDate)) {
          moveDay(name);
          break;
        }
      }
    }
  }

  $(document).on('click', '.as-prev-day', function() {
    moveDay('subtract');
    render();
  });

  $(document).on('click', '.as-next-day', function() {
    moveDay('add');
    render();
  });

  $(document).on('click', '.as-time', function() {
    $(this).parent().find('li').removeClass('active');
    $(this).addClass('active');
    if(typeof opts.select === 'function')
      opts.select($(this).attr('data-as-selection'));
  });

  $.fn.appointmentSelector = function(userOpts) {
    elements = this;
    opts = $.extend( {}, opts, userOpts);
    // to check if its a holiday today and skip it otherwise
    activeDate.subtract('1', 'day');
    moveDay('add');
    return render();
  }

}(jQuery));
