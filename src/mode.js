define(['d3', 'nanny'], (d3, nanny) => {
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

    var container  = d3.select('#scale-container');
    var $container = $('#scale-container');

    $container.html("");

    if (['technology', 'urban-rural'].contains(m['type'])) {
      $container.addClass('hidden');
      return;
    } else
      $container.removeClass('hidden');

    _u.tmpl('#scale-min-max', '#scale-container', m['scale'][0], m['scale'][1], m['full']);

    var width = $container.width();

    var svg = container.append('svg')
        .attr('id', 'scale')
        .attr('width', width)
        .attr('height', 7);

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
    var m = _g.modes.find_p('type', _u.get_query_param('mode'));

    if (!m) m = _g.modes.find_p('type', 'technology');

    _d.mode.merge_with(m);

    $(`${ mss } a[bind='${ _d.mode['type'] }']`).addClass('active');
  };

  var setup = (points) => {
    load_selector();

    _d.mode['callback'] = [
      'type',
      (...args) => {
        var t = args[2];
        var m = modes.find_p('type', t);

        var callback;

        if (!m)
          throw Error(`This mode is dodgy ${ t }`);

        else {
          history.pushState(null, null, _u.set_query_param('mode', t));

          if (m['points']) {
            if (!_u.get_query_param('load_points').to_boolean())
              history.pushState(null, null, _u.set_query_param('load_points', true));

            var target = adm.target(parseInt(_u.get_query_param('adm1')), parseInt(_u.get_query_param('adm2')));

            callback = () => {
              points.load({
                adm: target.node().id.match(/adm(.*)-(\d*)?/),
                svg_box: target.node().getBBox()
              });
            };

          } else {
            history.pushState(null, null, _u.set_query_param('load_points', false));
            points.clear();

            callback = () => m['draw']();
          }

          $('.loading').fadeIn(() => { callback(); nanny.tell(); scale(); });
        }
      }];
  };

  var clear_selector = () => {
    $(mss).html('');
  };

  var set = (t) => {
    var m = _g.modes.find_p('type', t);

    if ((m['type'] !== _d.mode['type']) &&
        (m['type'] === 'hp' || _d.mode['type'] === 'hp'))
      points.clear(true);

    _d.mode.merge_with(m);
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

      set($this.attr('bind'));

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
