define(['d3'], (d3) => {
  var modes = _g.modes;

  var mss = '#mode-selector';

  var previous_menu = null;

  var fill = () => {
    return (e, scn) => {
      var m = tm();
      return m['fill'].call(null, e, scn, m['param'], m['scale']);
    }
  };
  var stroke       = () => tm()['stroke'];
  var stroke_width = () => tm()['stroke_width'];

  var tm = () => modes.find_p('type', _d.mode['type']);

  var scale = () => {
    var m = modes.find_p('type', _d.mode['type']);

    var container = d3.select('#scale-container');
    container.html("");

    if (['technology', 'urban-rural'].contains(m['type'])) return;

    var width = $('#scale-container').width();

    var svg = container.append('svg')
        .attr('width', width)
        .attr('height', 30);

    var dummy  = {};
    dummy[m['param']] = m['scale'][0];
    dummy[m['param'] + _d.scenario['scn']] = m['scale'][0];
    dummy[m['param'] + _d.scenario['diesel_p']] = m['scale'][0];

    var dummy2 = {};
    dummy2[m['param']] = m['scale'][1];
    dummy2[m['param'] + _d.scenario['scn']] = m['scale'][1];
    dummy2[m['param'] + _d.scenario['diesel_p']] = m['scale'][1];

    var min = (m['fill'](dummy, _d.scenario['scn'], m['param'], m['scale']));
    var max = (m['fill'](dummy2, _d.scenario['scn'], m['param'], m['scale']));

    var defs = svg.append('defs');

    var grad = defs.append("svg:linearGradient")
      .attr('id', 'gradient' + m['type'])
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');

    grad.append('stop')
      .attr('offset', '0')
      .attr('stop-color', min);

    grad.append('stop')
      .attr('offset', '1')
      .attr('stop-color', max);

    var rect = svg.append("rect")
        .attr('width', width)
        .attr('height', 20)
        .style("fill", `url(#gradient${ m['type'] })`);
  };

  var init = () => {
    var m = (_g.modes.pluck_p('type').contains(_u.get_query_param('mode'))) ?
        _u.get_query_param('mode') : 'technology';

    _d.mode['type'] = m;
  };

  var setup = (points) => {
    load_selector();

    $(`${ mss } a[bind='${ _d.mode['type'] }']`).addClass('active');

    _d.mode['callback'] = [
      'type',
      (...args) => {
        var t = args[2];

        if (modes.map((m) => m['type']).indexOf(t) < 0)
          throw Error(`This mode is dodgy ${ t }`);

        else {
          history.pushState(null, null, _u.set_query_param('mode', t));

          $('.loading').fadeIn(points.draw);
        }
      }];
  };

  var clear_selector = () => {
    $(mss).html('');
  };

  var load_selector = () => {
    clear_selector();

    var groups = modes.group_p('group');

    Object.keys(groups).forEach((k) => {
      _u.tmpl('#mode-group-template',
              `#mode-selector`,
              k, k.capitalise());

      groups[k].forEach((m) => {
        _u.tmpl('#mode-option-template',
                `#${ k }-mode-selector ul`,
                m['type'], m['full'], m['icon'], `c6`);

      });
    });

    $('.mode-selector-menu').on('click', (e) => {
      e.preventDefault();

      var $target = $(e.target).closest('.with-dropdown');

      $('.mode-selector-menu').each(function(i,e) {
        var $e = $(e).closest('.with-dropdown');
        var eid = $e.attr('id');

        if (eid === $target.attr('id') ||
            eid === previous_menu) return;

        if (eid !== previous_menu)
          $e.find('ul.dropdown').hide();

        else
          $e.find('ul.dropdown').show();
      });

      previous_menu = $target.attr('id');

      $target.find('ul.dropdown').toggle();
    });

    var $mssa = $('.mode-selector-option');

    $mssa.on('click', (e) => {
      e.preventDefault();

      var $this = $(e.target).closest('a');

      $mssa.removeClass('active');

      _d.mode['type'] = $this.attr('bind');

      $this.addClass('active');
    });
  };

  return {
    init: init,
    setup: setup,
    modes: modes,
    scale: scale,
    fill: fill,
    stroke: stroke,
    stroke_width: stroke_width
  };
});
