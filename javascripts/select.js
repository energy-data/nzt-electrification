requirejs.config({
  'baseUrl': '/javascripts',
  'paths': {
    'd3':         "/lib/d3",
    'topojson':   "/lib/topojson",
    'jquery':     "/lib/jquery",
    'js-extras':  "/lib/js-extras"
  },
  'shim': {
    '_u':         { 'deps': ['js-extras', 'jquery'] }
  }
});

require([
  'd3',
  'topojson',
  'map',
  '_u',
  '_g'
], (d3, topojson, map) => {
  var width = $('body')[0].clientHeight / 6;

  var flag_style = (svg, iso3) => {
    var defs = svg.append('defs');

    defs.append('pattern')
      .attr('id', `flag-${ iso3 }`)
      .attr('x', 0)
      .attr('y', 0)
      .attr('patternUnits', 'objectBoundingBox')
      .attr('width',  1)
      .attr('height', 1)

      .append('image')
      .attr('xlink:href', `/images/${ iso3 }.png`)
      .attr('width',  34)
      .attr('height', 30)
      .attr('preserveAspectRatio', `${ _g.aspect_ratios[iso3.toString()] } slice`);
  };

  var load = (iso3, topo, callback) => {
    var svg = d3.select(`svg#svg-${ iso3 }`)
        .attr('width',  width)
        .attr('height', width);

    flag_style(svg, iso3);

    var container = svg.append('g').attr('id', 'container');

    var path = map.load_topo({
      topo: topo,
      cls: 'adm',
      pathname: 'adm0',
      parent: container,
      callback: (path, features) => {
        path
          .attr('fill', `url(#flag-${ iso3 })`)
          .attr('stroke', 'none');

        map.resize_to({
          node: path.node(),
          svg: svg,
          padding: 3,
          parent: container,
          interact: false
        })

        typeof callback === 'function' ? callback.call(this, iso3, path, box) : false
      }
    });
  };

  var run = (...args) => {
    var countries = _g.countries;
    var indicators = args[1];

    var size = 12 / countries.length;

    countries.forEach((c) => {
      var iso3 = c['iso3'];

      var ind = indicators.find((x) => parseInt(x['code']) === c['code']);

      _u.tmpl('#li-template', '#country-list ul', ind['name'], iso3, parseFloat(ind['area'].toString()).toLocaleString());

      d3.queue()
        .defer(d3.json, `/${ _g.assets }/${ iso3 }-adm0.json`)
        .await((error, adm0) => {
          error ?
            _u.network_error() :
            load(iso3, adm0);
        });
    });

    $('li.country-item').on('click', (e) => {
      e.preventDefault();

      var i = $(e.target).closest('.country-item');

      window.location = `/model/?iso3=${ i.attr('iso3') }`;
    });
  };

  d3.queue()
    .defer(d3.csv,  `/${ _g.assets }/indicators.csv`)
    .await(function (error, indicators) {
      error ?
        _u.network_error() :
        run.apply(this, arguments);
    });
});
