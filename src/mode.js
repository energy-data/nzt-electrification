define([], () => {
  var tc = _g.technologies.map((t) => t ? t['color'] : null);

  var mss = '#mode-selector';

  var fill         = () => tm()['fill'];
  var stroke       = () => tm()['stroke'];
  var stroke_width = () => tm()['stroke_width'];

  var tm = () => modes.find((m) => m['type'] === _d.mode['type']);

  var l_scale = (v, domain = [0, 100], range = [0, 1]) => {
    return v < domain[1] ?
      ((v / domain[1]) * (range[1] - range[0])) + range[0] :
      range[1];
  };

  var modes = [{
    type: "technology",
    full: "Technology",
    icon: "blur_circular",
    fill: (g, scn) => tc[g[scn]]
  }, {
    type: "population",
    full: "Population",
    icon: "people",
    fill: (g) => `rgba(0, 0, 0, ${ l_scale(g['p_2030'], [0, 1000]) })`,
    stroke: "lightgray",
    stroke_width: 0.001
  }, {
    type: "w_cf",
    full: "Wind",
    icon: "cloud",
    fill: (g) => `rgba(0, 80, 255, ${ l_scale(g['w_cf'], [0, 0.4]) })`,
    stroke: "rgba(0, 80, 255, 0.4)",
    stroke_width: 0.001
  }, {
    type: "ghi",
    full: "GHI",
    icon: "wb_sunny",
    fill: (g) => `rgba(0, 0, 0, ${ l_scale(g['ghi'], [0, 2500]) })`
  }, {
    type: "hp",
    full: "Hydro",
    icon: "opacity",
    fill: (g) => `rgba(0, 0, 0, ${ l_scale(g['hp'], [0, 10000000]) })`
  }, {
    type: "lcsa",
    full: "SA LCOE",
    icon: "local_gas_station",
    fill: (g) => {
      // TODO: domain should be calculated by the min..max lcsa's from the point collection
      //
      let domain = (_d.scenario['diesel_p'] === 'n' ? [0.51, 1.4] : [0.35, 0.7]);

      return `rgba(0, 0, 0, ${ l_scale(g['lcsa_' + _d.scenario['diesel_p']], domain, [0.01, 1]) })`;
    }
  }];

  var init = (points) => {
    load_selector();

    let t = 'technology';

    _d.mode['type'] = t;
    $(`${ mss } a[bind='${ t }']`).addClass('active');

    _d.mode['callback'] = [
      'type',
      (...args) => {
        if (modes.map((m) => m['type']).indexOf(args[2]) < 0)
          throw Error(`This mode is dodgy ${ args[2] }`);

        else
          points.draw(_d.point_collection['points']);
      }];
  };

  var clear_selector = () => $(mss).html('<ul></ul>');

  var load_selector = () => {
    clear_selector();

    for (let m of modes)
      _u.tmpl('#mode-option-template', mss, m['type'], m['full'], m['icon']);

    let $mssa = $(mss + ' a');

    $mssa.on('click', (e) => {
      e.preventDefault();

      let $this = $(e.target).closest('a');

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
