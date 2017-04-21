$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip()

  //disable fullpage in mobile
  if (screen.width > 1020) {
    $('#fullpage').fullpage({
      'verticalCentered': true,
      'css3': true,
      'navigation': true,
      'navigationPosition': 'right',
      'navigationTooltips': [
        'Home',
        'Introduction',
        'Universal Access',
        'Technologies (1/3)',
        'Technologies (2/3)',
        'Technologies (3/3)',
        'Scenarios',
        'How to Use this Tool (1/3)',
        'How to Use this Tool (2/3)',
        'How to Use this Tool (3/3)'
      ],
      'showActiveTooltip': true,

      'afterSlideLoad': function(anchorLink, index) {
      },

      'onLeave': function(index, nextIndex, direction) {
        $('.access-image').removeClass('animated fadeIn');
        $('.overlay').removeClass('animated fadeIn');

        if (nextIndex == 1) {
          $('#topArrow').css("display", "none");
          $('#arrowDown').css("display", "none");
          $('#staticButton').css("display", "none");
          $('#scrollText').css('display', '');
          $('#landingButton').css('display', '');
          $('#sourcecode').css('display', '');
        } else {
          $('#topArrow').css("display", "");
          $('#arrowDown').css("display", "");
          $('#scrollText').css('display', 'none');
          $('#sourcecode').css('display', 'none');
          $('#landingButton').css('display', 'none');

          $('.access-image').addClass('animated fadeIn');
          $('.overlay').addClass('animated fadeIn');
        }

        if (nextIndex == 10) {
          $('#buttonHolder').css("display", "none");
          $('#bottomArrow').css("display", "none");
          $('#staticButton').css("display", "");
        } else {
          $('#buttonHolder').css("display", "");
          $('#bottomArrow').css("display", "");
          $('#staticButton').css("display", "none");
        }
      }
    });
  }
});
