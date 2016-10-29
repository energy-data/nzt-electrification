define(['d3'], (d3) => {
  var mss = '#mode-selector';

  var fill = () => {
    return (e, scn) => {
      var m = tm();
      return m['fill'].call(null, e, scn, m['param'], m['scale']);
    }
  };
  var stroke       = () => tm()['stroke'];
  var stroke_width = () => tm()['stroke_width'];

  var tm = () => modes.find_p('type', _d.mode['type']);

  var modes = [{
    type: "technology",
    full: "Technology",
    icon: "blur_circular",
    group: "technology",
    fill: (e, scn) => _g.technologies.find_p('tech', e[scn])['color']
  }, {
    type: "lcoe",
    full: "Levelised Cost",
    icon: "attach_money",
    group: "technology",
    param: 'lc_',
    scale: [0, 1.15],
    fill: (g, scn, param, scale) => {
      return `rgba(105, 70 ,50, ${ _u.l_scale(g[param + scn], scale) })`;
    },
  }, {
    type: "ic",
    full: "Investment Cost",
    icon: "attach_money",
    group: "technology",
    param: 'ic_',
    scale: [0, 100000],
    fill: (g, scn, param, scale) => {
      return `rgba(105, 70 ,50, ${ _u.l_scale(g[param + scn], scale) })`;
    },
  }, {
    type: "nc",
    full: "Added Capacity",
    icon: "lightbulb_outline",
    group: "technology",
    param: 'nc',
    scale: [0, 1000],
    fill: (g, scn, param, scale) => `rgba(0, 80, 255, ${ _u.l_scale(g[param], scale) })`,
  }, {
    type: "population",
    full: "Population",
    icon: "people",
    group: "demographics",
    param: 'p_2030',
    scale: [0, 1000],
    fill: (g, scn, param, scale) => `rgba(0, 0, 0, ${ _u.l_scale(g[param], scale) })`,
    stroke: "lightgray",
    stroke_width: 0.001
  }, {
    type: "urban-rural",
    full: "Urban/Rural",
    icon: "nature_people",
    group: "demographics",
    fill: (e) => e['u'] ? '#F69C55' : '#B4EEB4'
  }, {
    type: "ghi",
    full: "GHI",
    icon: "wb_sunny",
    group: "resources",
    param: 'ghi',
    scale: [1979, 2500],
    fill: (g, scn, param, scale) => {
      return d3.scaleLinear()
        .domain(scale)
        .range(["yellow", "red"])(g[param])
    }
  }, {
    type: "w_cf",
    full: "Wind",
    icon: "cloud",
    group: "resources",
    param: 'w_cf',
    scale: [0, 0.4],
    fill: (g, scn, param, scale) => `rgba(0, 80, 255, ${ _u.l_scale(g[param], scale) })`,
    stroke: "rgba(0, 80, 255, 0.4)",
    stroke_width: 0.001
  }, {
    type: "hp",
    full: "Hydro",
    icon: "opacity",
    group: "resources",
    param: 'hp',
    scale: [0, 10000000],
    fill: (g, scn, param, scale) => `rgba(0, 0, 0, ${ _u.l_scale(g[param], scale) })`
  }, {
    type: "rd",
    full: "Road Distance",
    icon: "directions_car",
    group: "infrastructure",
    param: 'rd',
    scale: [0, 200],
    fill: (g, scn, param, scale) => `rgba(0, 0, 0, ${ _u.l_scale(g[param], scale) })`
  }, {
    type: "gd_c",
    full: "Current GD",
    icon: "timeline",
    group: "infrastructure",
    param: 'gd_c',
    scale: [0, 450],
    fill: (g, scn, param, scale) => `rgba(0, 0, 0, ${ _u.l_scale(g[param], scale) })`
  }, {
    type: "gd_p",
    full: "Planned GD",
    icon: "timeline",
    group: "infrastructure",
    param: 'gd_p',
    scale: [0, 450],
    fill: (g, scn, param, scale) => `rgba(0, 0, 0, ${ _u.l_scale(g[param], scale) })`
  }, {
    type: "lcsa",
    full: "SA LCOE",
    icon: "local_gas_station",
    group: "infrastructure",
    param: 'lcsa_',
    scale: [0.35, 1.85],
    fill: (g) => {
      var f = d3.scaleLinear()
          .domain(_d.scenario['diesel_p'] === 'l' ? [0.35, 0.89] : [0.63, 1.85])
          .range([0, 1]);

      return `rgba(105, 70 ,50, ${ f(g['lcsa_' + _d.scenario['diesel_p']]) })`;
    },
    stroke: "rgba(105, 70 ,50, 0.2)",
    stroke_width: 0.001
  }];

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
    _d.mode['type'] = 'technology';
  };

  var setup = (points) => {
    load_selector();

    $(`${ mss } a[bind='${ _d.mode['type'] }']`).addClass('active');

    _d.mode['callback'] = [
      'type',
      (...args) => {
        if (modes.map((m) => m['type']).indexOf(args[2]) < 0)
          throw Error(`This mode is dodgy ${ args[2] }`);

        else
          $('.loading').fadeIn(points.draw);
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
      $(e.target).closest('.with-dropdown').find('ul.dropdown').toggle();
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
