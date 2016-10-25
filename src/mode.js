define(['d3'], (d3) => {
  var mss = '#mode-selector';

  var fill         = () => tm()['fill'];
  var stroke       = () => tm()['stroke'];
  var stroke_width = () => tm()['stroke_width'];

  var tm = () => modes.find_p('type', _d.mode['type']);

  var ghi_scale = d3.scaleLinear()
      .domain([1979, 2500])
      .range(["yellow", "red"]);

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
    fill: (g) => {
      return `rgba(105, 70 ,50, ${ _u.l_scale(g['lc_' + _d.scenario['scn']], [0, 1.15]) })`;
    },
  }, {
    type: "ic",
    full: "Investment Cost",
    icon: "attach_money",
    group: "technology",
    fill: (g) => {
      return `rgba(105, 70 ,50, ${ _u.l_scale(g['ic_' + _d.scenario['scn']], [0, 100000]) })`;
    },
  }, {
    type: "nc",
    full: "Added Capacity",
    icon: "lightbulb_outline",
    group: "technology",
    fill: (g) => `rgba(0, 80, 255, ${ _u.l_scale(g['nc'], [0, 1000]) })`,
  }, {
    type: "population",
    full: "Population",
    icon: "people",
    group: "demographics",
    fill: (g) => `rgba(0, 0, 0, ${ _u.l_scale(g['p_2030'], [0, 1000]) })`,
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
    fill: (g) => ghi_scale(g['ghi'])
  }, {
    type: "w_cf",
    full: "Wind",
    icon: "cloud",
    group: "resources",
    fill: (g) => `rgba(0, 80, 255, ${ _u.l_scale(g['w_cf'], [0, 0.4]) })`,
    stroke: "rgba(0, 80, 255, 0.4)",
    stroke_width: 0.001
  }, {
    type: "hp",
    full: "Hydro",
    icon: "opacity",
    group: "resources",
    fill: (g) => `rgba(0, 0, 0, ${ _u.l_scale(g['hp'], [0, 10000000]) })`
  }, {
    type: "rd",
    full: "Road Distance",
    icon: "directions_car",
    group: "infrastructure",
    fill: (g) => `rgba(0, 0, 0, ${ _u.l_scale(g['rd'], [0, 200]) })`
  }, {
    type: "gd_c",
    full: "Current GD",
    icon: "timeline",
    group: "infrastructure",
    fill: (g) => `rgba(0, 0, 0, ${ _u.l_scale(g['gd_c'], [0, 450]) })`
  }, {
    type: "gd_p",
    full: "Planned GD",
    icon: "timeline",
    group: "infrastructure",
    fill: (g) => `rgba(0, 0, 0, ${ _u.l_scale(g['gd_p'], [0, 450]) })`
  }, {
    type: "lcsa",
    full: "SA LCOE",
    icon: "local_gas_station",
    group: "infrastructure",
    fill: (g) => {
      var f = d3.scaleLinear()
          .domain(_d.scenario['diesel_p'] === 'l' ? [0.35, 0.89] : [0.63, 1.85])
          .range([0, 1]);

      return `rgba(105, 70 ,50, ${ f(g['lcsa_' + _d.scenario['diesel_p']]) })`;
    },
    stroke: "rgba(105, 70 ,50, 0.2)",
    stroke_width: 0.001
  }];

  var init = (points) => {
    load_selector();

    var t = 'technology';

    _d.mode['type'] = t;
    $(`${ mss } a[bind='${ t }']`).addClass('active');

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
    modes: modes,
    fill: fill,
    stroke: stroke,
    stroke_width: stroke_width
  };
});
