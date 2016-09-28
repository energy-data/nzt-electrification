define(['utils', 'dictionary'], (u, dictionary) => {
  var tc = _g.technologies.map((t) => t ? t['color'] : null);

  var dg = dictionary['point'];

  var mss = '#mode-selector';

  var l_scale = (v, domain = [0, 100], range = [0.2, 1]) => {
    return v < domain[1] ?
      ((v / domain[1]) * (range[1] - range[0])) + range[0] :
      range[1];
  };

  // TODO: set colour per mode. (not just black!)
  //
  var modes = [{
    type: "technology",
    full: "Technology",
    icon: "blur_circular",
    fill: (g, scn) => tc[g[scn]]
  }, {
    type: "population",
    full: "Population",
    icon: "people",
    fill: (g) => `rgba(0, 0, 0, ${ l_scale(g['p_2030'], [0, 1000]) })`
  }, {
    type: "w_cf",
    full: "Wind",
    icon: "cloud",
    fill: (g) => `rgba(0, 0, 0, ${ l_scale(g['w_cf'], [0, 0.4]) })`
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
  }];

  var init = (points) => {
    load_selector();

    var t = 'technology';

    data.mode['type'] = t;
    $(`${ mss } a[bind='${ t }']`).addClass('active');

    data.mode['callback'] = [
      'type',
      (...args) => {
        if (modes.map((m) => m['type']).indexOf(args[2]) < 0)
          throw Error(`This mode is dodgy ${ args[2] }`);

        else
          points.draw(data.point_collection['points']);
      }];
  };

  var clear_selector = () => $(mss).html('<ul></ul>');

  var fill = () => modes.find((m) => m['type'] === data.mode['type'])['fill'];

  var load_selector = () => {
    clear_selector();

    modes.map((m) => u.tmpl('#mode-option-template', mss, m['type'], m['full'], m['icon']));

    let $mssa = $(mss + ' a');

    $mssa.on('click', (e) => {
      e.preventDefault();

      let $this = $(e.target).closest('a');

      $mssa.removeClass('active');

      data.mode['type'] = $this.attr('bind');

      $this.addClass('active');
    });
  };

  return {
    init:  init,
    modes: modes,
    fill:  fill
  };
});
