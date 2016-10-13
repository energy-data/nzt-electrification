define(['d3'], (d3) => {
  var tc = _g.technologies.map((t) => t ? t['color'] : null);

  var mss = '#mode-selector';
  var oms = '#other-mode-selector-menu';

  var fill         = () => tm()['fill'];
  var stroke       = () => tm()['stroke'];
  var stroke_width = () => tm()['stroke_width'];

  var tm = () => modes.find((m) => m['type'] === _d.mode['type']);

  var ghi_scale = d3.scaleLinear()
      .domain([1979, 2500])
      .range(["yellow", "red"]);

  var modes = [{
    type: "technology",
    full: "Technology",
    icon: "blur_circular",
    fill: (g, scn) => tc[g[scn]]
  }, {
    type: "lcsa",
    full: "SA LCOE",
    icon: "local_gas_station",
    fill: (g) => {
      let f = d3.scaleLinear()
          .domain(_d.scenario['diesel_p'] === 'l' ? [0.35, 0.89] : [0.63, 1.85])
          .range([0, 1]);

      return `rgba(105, 70 ,50, ${ f(g['lcsa_' + _d.scenario['diesel_p']]) })`;
    },
    stroke: "rgba(105, 70 ,50, 0.2)",
    stroke_width: 0.001
  }, {
    type: "population",
    full: "Population",
    icon: "people",
    fill: (g) => `rgba(0, 0, 0, ${ _u.l_scale(g['p_2030'], [0, 1000]) })`,
    stroke: "lightgray",
    stroke_width: 0.001
  }, {
    type: "w_cf",
    full: "Wind",
    icon: "cloud",
    fill: (g) => `rgba(0, 80, 255, ${ _u.l_scale(g['w_cf'], [0, 0.4]) })`,
    stroke: "rgba(0, 80, 255, 0.4)",
    stroke_width: 0.001
  }, {
    type: "ghi",
    full: "GHI",
    icon: "wb_sunny",
    fill: (g) => ghi_scale(g['ghi'])
  }, {
    type: "hp",
    full: "Hydro",
    icon: "opacity",
    fill: (g) => `rgba(0, 0, 0, ${ _u.l_scale(g['hp'], [0, 10000000]) })`
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
          $('.loading').fadeIn(() => {
            points.draw(_d.point_collection['points']);
          });
      }];
  };

  var clear_selector = () => $(mss,oms).html('<ul></ul>');

  var load_selector = () => {
    clear_selector();

    for (let m of modes)
      _u.tmpl('#mode-option-template',
              (['technology', 'lcsa'].indexOf(m['type']) > -1 ? mss : oms),
              m['type'], m['full'], m['icon'],
              (['technology', 'lcsa'].indexOf(m['type']) > -1 ? "c6" : "c6"));

    let $mssa = $('.mode-selector-option');

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
