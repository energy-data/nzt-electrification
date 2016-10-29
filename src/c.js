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
  '_u', '_g', '_d', 'scenario', 'd3', 'map', 'points', 'summary', 'place', 'mode', 'navbar', 'controls', 'knob', '_conf'
], (_u,   _g,   _d,   scenario,   d3,   map,   points,   summary,   place,   mode,   navbar,  controls,  knob) => {
  var adm0_boundaries, adm1_boundaries, adm2_boundaries;

  var locked_adm2;

  var rerun;

  var iso3 = _u.get_query_param('iso3');

  var _svg = d3.select('svg#svg');
  var _container = d3.select('#container');

  var _transmission_lines = _container.append('g').attr('id', 'transmission-lines');
  var _text_labels_adm1 = _container.append('g').attr('id', 'text-labels-adm1');
  var _text_labels_adm2 = _container.append('g').attr('id', 'text-labels-adm2');

  window.onpopstate = (e) => {
    points.clear(true);
    rerun(false);
  };

  var load_adm = (topo, pathname, callback) => {
    _u.check(topo, pathname);

    var all_paths = _container.append('g').attr('id', `paths-${ pathname }`);

    var path = map.load_topo({
      topo: topo,
      pathname: pathname,
      cls: 'adm hoverable',
      fill: 'white',
      labels: true,
      parent: all_paths
    });

    if (typeof callback === 'function')
      return callback.call(this, path);

    else
      return path;
  };

  var set_adm1_fills = (id) => {
    d3.selectAll('.adm1').each(function(e) {
      var elem = d3.select(this);

      if (e.id === id)
        elem.style('visibility', 'hidden');

      else
        elem
        .style('visibility', 'visible')
        .attr('fill', '#CDE6CD')
        .attr('stroke', '#ccc');
    });
  };

  var load_adm1 = (it, d) => {
    points.hide_info();

    points.clear(true);
    reset_adm2(null);

    place.nullify('adm2');

    place.set('adm1', d['id'], d.properties['name'], true);
    history.replaceState(null, null, _u.set_query_param('load_points', false));

    set_adm1_fills(d.id);

    map.resize_to({
      node: it,
      duration: 300
    });

    d3.select('#text-labels-adm1').raise();

    show_adm2(d.id);
  };

  var load_adm2 = (it, d) => {
    if (locked_adm2 === d['id']) return;

    d3.selectAll('.adm-label').attr('font-weight', 'normal');
    d3.select(`#adm2-label-${ d['id'] }`).attr('font-weight', 'bold');

    points.hide_info();

    place.set('adm2', d['id'], d.properties['name'], true);

    history.replaceState(null, null, _u.set_query_param('load_points', true));

    reset_adm2(it);

    locked_adm2 = d['id'];

    admin1 = d.properties['adm1'];

    _d.place['adm1']      = admin1 || undefined;
    _d.place['adm1_name'] = d3.select(`#adm1-${ admin1 }`).datum().properties['name'] || undefined;

    if (_u.get_query_param('load_points').to_boolean())
      points.load({
        adm: it.id.match(/adm(.*)-(\d*)?/),
        svg_box: it.getBBox()
      });

    map.resize_to({
      node: it,
      duration: 300
    });
  };

  var show_adm2 = (adm1_id) => {
    _u.check(adm1_id);

    d3.selectAll('.adm2').each(function(e) {
      d3.select(this).style('display', ((e.properties.adm1 === adm1_id) ? 'block' : 'none'));
    });
  };

  var reset_adm2 = (target) => {
    d3.selectAll('path.adm2').classed('hoverable', true);
    locked_adm2 = null;

    var a2 = parseInt(_u.get_query_param('adm2'));

    var it = (target ?
              target :
              (a2 ? `#adm2-${ a2 }` : null));

    if (it) d3.select(it).classed('hoverable', false);
  };

  var run = (...args) => {
    var load_controls = args[7];

    mode.init();
    scenario.init();

    // Params
    //
    admin1 = parseInt(_u.get_query_param('adm1'));
    admin2 = parseInt(_u.get_query_param('adm2'));
    load_points = _u.get_query_param('load_points').to_boolean();

    // Place
    //
    place.setup();
    place.init(args[6], iso3);

    var height = window.innerHeight -
        (d3.select('#summary-info').node().clientHeight +
         d3.select('#navbar').node().clientHeight);

    _svg
      .attr('width',  d3.select('#map-container').node().clientWidth)
      .attr('height', height);

    // Map drawing
    //
    adm0_boundaries = args[1];
    adm1_boundaries = args[2];
    adm2_boundaries = args[3];

    existing_transmission = args[4];
    planned_transmission  = args[5];

    load_adm(adm1_boundaries, 'adm1')
      .on('click', function(d) { load_adm1(this, d) });

    load_adm(adm2_boundaries, 'adm2')
      .on('click', function(d) { load_adm2(this, d) });

    points.init()

    map.load_topo({
      parent: _transmission_lines,
      topo: existing_transmission,
      cls: 'line',
      pathname: 'existing',
      stroke: '#7587A6',
      fill: 'none'
    });

    map.load_topo({
      parent: _transmission_lines,
      topo: planned_transmission,
      cls: 'line',
      pathname: 'planned',
      stroke: '#7587A6',
      fill: 'none'
    });

    map.setup_drag();

    // Mode and scenario
    //
    mode.setup(points);
    scenario.setup(points);

    // Initialise adm regions
    //
    {
      target = d3.select((() => {
        if (admin1 > -1 && isNaN(admin2))
          return `#adm1-${ admin1 }`;

        else if (admin2 > -1)
          return `#adm2-${ admin2 }`;

        else
          return '#paths-adm1';
      })());

      if (admin2 > -1) {
        admin1 = target.datum().properties['adm1']

        place.set('adm2', admin2, target.datum().properties['name'], false);
        place.set('adm1', admin1, d3.select(`#adm1-${ admin1 }`).datum().properties['name'], false);
      }

      else if (admin1 > -1) {
        place.set('adm1', admin1, target.datum().properties['name'], false)
      }

      show_adm2(admin1);

      set_adm1_fills(admin1);
    }

    // Controls
    //
    if (load_controls) {
      // used in navbar (better than circular dependencies!)
      //
      window.load_adm1 = load_adm1;
      window.load_adm2 = load_adm2;
      window.set_adm1_fills = set_adm1_fills;

      controls.init();
      knob.init();
      navbar.init();
      summary.setup();
    }

    // Focus target adm
    //
    {
      if (admin2) {
        reset_adm2(`#adm2-${ admin2 }`);
        locked_adm2 = admin2;
      };

      if (load_points && (admin1 || admin2)) {
        points.load({
          adm: target.node().id.match(/adm(.*)-(\d*)?/),
          svg_box: target.node().getBBox()
        });
      } else $('.loading').fadeOut();

      map.resize_to({
        node: target.node(),
        duration: 0,
        delay: 1,
        callback: () => $('.loading').css('background-color', 'rgba(0,0,0,0.1)')
      });
    }

    _transmission_lines.raise();
    _text_labels_adm1.raise();
    _text_labels_adm2.raise();
  };

  d3.queue(5)
    .defer(d3.json, `/${ _g.assets }/${ iso3 }-adm0.json`)
    .defer(d3.json, `/${ _g.assets }/${ iso3 }-adm1.json`)
    .defer(d3.json, `/${ _g.assets }/${ iso3 }-adm2.json`)
    .defer(d3.json, `/${ _g.assets }/${ iso3 }-existing-transmission-lines.json`)
    .defer(d3.json, `/${ _g.assets }/${ iso3 }-planned-transmission-lines.json`)
    .defer(d3.json, `/${ _g.assets }/countries.json`)

    .await(function(error, adm0, adm1, adm2, existing_transmission, planned_transmission, countries) {
      if (error) _u.network_error();
      else {
        var args = arguments;
        (rerun = function(load_controls) { run.call(this, ...args, load_controls) })(true);
      }
    });
});
