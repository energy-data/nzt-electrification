requirejs.config({
  'baseUrl': './javascripts',
  'paths': {
    'd3':         "../lib/d3",
    'topojson':   "../lib/topojson",
    'jquery':     "../lib/jquery",
    'js-extras':  "../lib/js-extras",
    'web-extras': "../lib/web-extras"
  },
  'shim': {
    'web-extras': { 'deps': ['jquery'] },
    'index':      { 'deps': ['web-extras'] },
    '_u':         { 'deps': ['js-extras', 'jquery'] }
  }
});

require([
  'd3',
  'topojson',
  'map',
  'overview',
  '_u',
  '_g'
], (d3, topojson, map, overview) => {
  var width = $('body')[0].clientHeight / 3;

  let flag_style = (svg, iso3) => {
    let defs = svg.append('defs');

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

    let filter = defs.append('filter')
        .attr('id', 'dropshadow')
        .attr('width', '130%')
        .attr('height', '130%');

    filter.append('feOffset')
      .attr('result', 'offOut')
      .attr('in', 'SourceAlpha')
      .attr('dx', '0')
      .attr('dy', '1');

    filter.append('feGaussianBlur')
      .attr('result', 'blurOut')
      .attr('in', 'offOut')
      .attr('stdDeviation', '1.3');

    filter.append('feBlend')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blurOut')
      .attr('mode', 'normal');
  };

  var load = (iso3, topo, callback) => {
    let svg = d3.select(`svg#svg-${ iso3 }`)
        .attr('width',  width)
        .attr('height', width);

    flag_style(svg, iso3);

    let container = svg.append('g').attr('id', 'container');

    let path = map.load_topo({
      topo: topo,
      cls: 'adm',
      pathname: 'adm0',
      container: container,
      callback: (path, features) => {
        path
          .attr('fill', `url(#flag-${ iso3 })`)
          .attr('style', 'filter:url(#dropshadow)')
          .attr('stroke', 'none');

        map.resize_to({
          node: path.node(),
          svg: svg,
          padding: 3,
          container: container,
          interact: false
        })

        typeof callback === 'function' ? callback.call(this, iso3, path, box) : false
      }
    });
  };

  var run = (...args) => {
    let countries = _g.countries = args[1];
    let indicators = args[2];

    let size = 12 / countries.length;

    for (let c of countries) {
      let iso3 = c['iso3'];

      let ind = indicators.find((x) => parseInt(x['Country Code']) === c['code']);

      _u.tmpl('#li-template', '#country-list ul', ind['Country Name'], iso3);

      overview.run(ind, iso3);

      d3.queue()
        .defer(d3.json, `/${ _g.assets }/${ iso3 }-adm0.json`)
        .await((error, adm0) => load(iso3, adm0));

      $('li.country-item').on('click', (e) => {
        e.preventDefault();

        $('.country-item').removeClass('active');

        $('#select-something').remove();

        let i = $(e.target).closest('.country-item')

        i.addClass('active');

        $('.overview').css('visibility', 'hidden');
        $(`#overview-${ i.attr('iso3') }`).css('visibility', 'visible');
      });
    };
  }

  d3.queue()
    .defer(d3.json, `/${ _g.assets }/countries.json`)
    .defer(d3.csv,  `/${ _g.assets }/indicators.csv`)
    .await(function (error, countries, indicators) {
      error ? console.error(error) : run.apply(this, arguments);
    });
});
