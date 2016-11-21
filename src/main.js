requirejs.config({
  'baseUrl': './javascripts',
  'paths': {
    'd3':         "../lib/d3",
    'topojson':   "../lib/topojson",
    'jquery':     "../lib/jquery",
    'js-extras':  "../lib/js-extras"
  },
  'shim': {
    '_u':         { 'deps': ['js-extras', 'jquery'] },
    'help':       { 'deps': ['jquery'] },
    'mode':       { 'deps': ['_u'] },
    'knob':       { 'deps': ['_u'] },
    'overview':   { 'deps': ['_u'] }
  }
});

onerror = function(msg, url, lineNo, columnNo, error) {
  var string = msg.toLowerCase();

  if (msg.indexOf("Network error") > -1) _u.network_error();

  var substring = "script error";

  $('#messages-container').removeClass('hidden');
  $('#error').removeClass('hidden');

  if (string.indexOf(substring) > -1){
    alert('Script Error: See Browser Console for Detail');

  } else {
    var x = url.split("/")

    var message = [
      'Error on our side. Please report a bug:',
      'Script: &nbsp;&nbsp;' + x[x.length - 1].replace(".js", "") + ":" + lineNo + ":" + columnNo,
    ].join('<br />');

    document.getElementById('error').innerHTML = message;
  }

  return false;
};

require([
   '_u', '_g', '_d', 'scenario', 'd3', 'map',  'adm', 'points', 'summary', 'place', 'mode', 'navbar', 'controls', 'knob', 'nanny', '_conf'
], (_u,   _g,   _d,   scenario,   d3,   map,    adm,   points,   summary,   place,   mode,   navbar,   controls,   knob,   nanny) => {
  var rerun;

  var iso3 = _u.get_query_param('iso3');

  if (!_g.countries.pluck_p('iso3').contains(iso3)) window.location.href = '/landing';

  var _svg = d3.select('svg#svg');
  var _container = d3.select('#container');

  var _transmission_lines = _container.append('g').attr('id', 'transmission-lines');
  var _text_labels_adm1 = _container.append('g').attr('id', 'text-labels-adm1');
  var _text_labels_adm2 = _container.append('g').attr('id', 'text-labels-adm2');

  window.onpopstate = (e) => {
    points.clear(true);
    rerun(false);
  };

  var run = (...args) => {
    var poverty_data  = args[6];
    var load_controls = args[7];

    // TODO: window... :(
    //
    window.poverty_data = poverty_data;
    window.adm = adm;
    window.points = points;
    window.map = map;

    scenario.init();
    place.init(iso3);

    adm.setup(
      _container,
      args[1], // adm0 boundaries
      args[2], // adm1 boundaries
      args[3]  // adm2 boundaries
    );

    points.init(); // this should be after adm.setup so it stays on top of it.

    // Params
    //
    var admin1 = parseInt(_u.get_query_param('adm1'));
    var admin2 = parseInt(_u.get_query_param('adm2'));
    var load_points = _u.get_query_param('load_points').to_boolean();

    // setup UI elements
    //
    var height = window.innerHeight -
        (d3.select('#summary-info').node().clientHeight +
         d3.select('#navbar').node().clientHeight);

    var width = window.innerWidth -
        (knob.total_width +
         d3.select('#point-info').node().clientWidth);

    _svg
      .attr('width',  width)
      .attr('height', height);

    // Setup modules:
    //
    place.setup();
    mode.setup(points);
    scenario.setup(points);
    summary.fetch({ adm1: admin1, adm2: admin2 });
    points.setup();

    mode.init();

    // These we do not want to rerun:
    //
    if (load_controls) {
      controls.init();
      knob.init();
      navbar.init();
      summary.setup();
    }

    // Initialise adm regions
    //
    var target = adm.target(admin1, admin2);

    if (admin2 > -1) {
      admin1 = target.datum().properties['adm1']

      place.set('adm2', admin2, target.datum().properties['name'], false);
      place.set('adm1', admin1, d3.select(`#adm1-${ admin1 }`).datum().properties['name'], false);
    }

    else if (admin1 > -1) {
      place.set('adm1', admin1, target.datum().properties['name'], false)
    }

    adm.init(admin1, admin2);

    // Load the map
    //
    map.load_topo({
      parent: _transmission_lines,
      topo: args[4], // existing transmission lines
      cls: 'line',
      pathname: 'existing',
      stroke: '#7587A6',
      fill: 'none'
    });

    map.load_topo({
      parent: _transmission_lines,
      topo: args[5], // planned transmission lines
      cls: 'line',
      pathname: 'planned',
      stroke: '#7587A6',
      fill: 'none'
    });

    _transmission_lines.raise();
    _text_labels_adm1.raise();
    _text_labels_adm2.raise();

    // Focus target adm
    //
    if (load_points && _d.mode['points'] && (admin1 || admin2))
      points.load(target);

    else if (!load_points && !_d.mode['points']) {
      _d.mode['draw'](adm, poverty_data);
      $('.loading').fadeOut();
    }
    else {
      $('.loading').fadeOut();
    }

    map.resize_to({
      node: target.node(),
      duration: 0,
      delay: 1,
      callback: () => $('.loading').css('background-color', 'rgba(0,0,0,0.1)')
    });

    map.behaviour();
  };

  d3.queue(6)
    .defer(d3.json, `/${ _g.assets }/${ iso3 }-adm0.json`)
    .defer(d3.json, `/${ _g.assets }/${ iso3 }-adm1.json`)
    .defer(d3.json, `/${ _g.assets }/${ iso3 }-adm2.json`)
    .defer(d3.json, `/${ _g.assets }/${ iso3 }-existing-transmission-lines.json`)
    .defer(d3.json, `/${ _g.assets }/${ iso3 }-planned-transmission-lines.json`)
    .defer(d3.json, `/${ _g.assets }/${ iso3 }-poverty.json`)

    .await(function(error, adm0, adm1, adm2, existing_transmission, planned_transmission, poverty_data) {
      if (error) _u.network_error();
      else {
        var args = arguments;

        (rerun = function(load_controls) { run.call(this, ...args, load_controls) })(true);
      }
    });
});
