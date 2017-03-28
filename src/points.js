define(['mode', 'd3', 'map', 'nanny'], (mode, d3, map, nanny) => {
  //
  // Variables:
  //

  var _container, _points;

  var count_threshold = 20000;

  var locked = null;

  var fill, stroke, stroke_width;

  //
  // Function definitions:
  //

  var init = () => {
    _container = d3.select('#container');
    _points = _container.append('g').attr('id', 'points');
  };

  var setup = () => {
    $('#toggle-point-details').on('click', (e) => {
      e.preventDefault();
      $(e.target).closest('.clickable').toggleClass('active');

      $('#point-info').find('tr.hideable').toggleClass('hidden');
    });

    $('#points-info-control').on('click', (e) => {
      e.preventDefault();

      $('#point-info').toggleClass('hidden');
      $(e.target).closest('.col').toggleClass('active');
    });
  };

  var fetch = (o) => {
    $('.loading').fadeIn();

    var url = _conf['data_source'];

    if (_conf['source_type'] === 'static')
      url += `/points/${ _d.place['adm0_code'] }-${ _u.get_query_param('adm1') }-${ o.adm[2] }.json`;

    else if (_conf['source_type'] === 'api') {
      url += `/points?` +
        `select=${ _g.point_attrs }` +
        `&x=gt.${ o.box[0] }&x=lt.${ o.box[2] }` +
        `&y=gt.${ o.box[1] }&y=lt.${ o.box[3] }` +
        `&adm${ o.adm[1] }=eq.${ o.adm[2] }` +
        `&cc=eq.${ _d.place['adm0_code'] }`;
    }

    if (_d.mode['type'] === 'hp')
      url = `${ _conf['data_source'] }/hydro_points`;

    d3.queue()
      .defer(d3.json, url)
      .await((error, points) => {
        error ?
          _u.network_error() :
          (typeof o.callback === 'function') ? o.callback.call(null, points) : null;
      });
  };

  var clear = (full = false) => {
    d3.selectAll('.point').remove();
    if (full) _d.point_collection['points'] = [];
  };

  var reset_stroke = (it) => {
    d3.select(it)
      .attr('stroke-width', stroke_width)
      .attr('stroke', stroke);
  };

  var draw = (mode_type) => {
    var m = mode_type ? _g.modes.find_p('type', mode_type) : _d.mode;

    var collection = _d.point_collection['points'];

    if (! collection) {
      $('.loading').fadeOut();
      return;
    }

    adm.reset_adm2(null);

    window.locked_point = locked = null;

    var scn = _d.scenario['scn'];
    var diesel_p = _d.scenario['diesel_p'];

    clear();

    fill = mode.fill();
    stroke = mode.stroke();
    stroke_width = mode.stroke_width();

    var circles = "";

    var radius = 0.012;

    var area = (_d.summary['results'].reduce((x,c) => { return x + c['pts'] }, 0));

    if (area > count_threshold)
      radius = radius * (area / count_threshold);

    if (m['type'] === 'hp')
      radius = 0.060;

    // This is too much for D3, (check git history if curious)
    //
    collection.forEach((e) => {
      var pp = map.projection([e.x, e.y]);

      circles += `<circle class="point"
                          fill="${ fill(e,scn) }"
                          stroke="${ stroke }"
                          stroke-width="0.001"
                          cx=${ pp[0] }
                          cy=${ pp[1] }
                          r=${ radius }></circle>`;
    });

    _points.node().innerHTML = circles;

    _points
      .on('click', () => {
        if (m['type'] === 'hp') return;

        var elem = d3.event.toElement;
        var target = find(d3.event);

        if (elem === locked) {
          reset_stroke(elem);
          window.locked_point = locked = null;

        } else {
          reset_stroke(locked);

          d3.select(elem)
            .attr('stroke', 'red')
            .attr('stroke-width', 0.01)
            .raise();

          load_info(target, scn, diesel_p);

          window.locked_point = locked = elem;

          show_info();
        }
      })

      .on('mousemove', function() {
        if (_d.mode['type'] !== 'technology'
            || m['type'] === 'hp'
            || locked !== null)
          return;

        load_info(find(d3.event), scn, diesel_p);

        show_info();
      });

    d3.selectAll('#transmission-lines, #text-labels-adm2').raise();
    $('.loading').fadeOut();
  };

  var find = (e) => {
    var it = d3.select(e.toElement || e.target);

    var x = it.attr('cx');
    var y = it.attr('cy');

    var p = map.projection.invert([x,y]);
    var px = p[0];
    var py = p[1];

    return _d.point_collection['points'].find((e) => {
      return (px < e['x'] + 0.007 && px > e['x'] - 0.007 &&
              py < e['y'] + 0.007 && py > e['y'] - 0.007);
    });
  };

  var load_info = (e, scn, diesel_p) => {
    var tech = _g.technologies.find_p('tech', e[scn]);

    var p = _d.point;

    for (var k in e) p[k] = e[k].toLocaleString();

    p['long'] = e['x'];
    p['lat']  = e['y'];
    p['ic']   = e[`ic_${ scn }`].toLocaleString();
    p['lc']   = e[`lc_${ scn }`].toLocaleString();
    p['cap']  = e[`c_${ scn }`].toLocaleString();
    p['lcsa'] = e[`lcsa_${ diesel_p }`].toLocaleString();
    p['gd_c'] = e[`gd_c`].toFixed(1).toLocaleString();
    p['gd_p'] = e[`gd_p`].toFixed(1).toLocaleString();
    p['rd']   = e[`rd`].toFixed(1).toLocaleString();

    p['technology'] = tech['name'];

    p['urban'] = (e['u'] ? "Urban" : "Rural");
    p['wind']  = _u.percent(e['w_cf'], 1);
  };

  var load = (target) => {
    var admin   = target.node().id.match(/adm(.*)-(\d*)?/);
    var svg_box = target.node().getBBox();

    _u.check(admin, svg_box, _container);

    fetch({
      adm: admin,
      box: map.to_bbox(svg_box),

      callback: (points) => {
        if (points.length > count_threshold)
          points = points.sample(count_threshold);

        _d.point_collection['points'] = points;

        draw();

        $('.loading').fadeOut();
      }
    });
  };

  var show_info = () => {
    nanny.hush();
    $('#point-info').fadeIn();
    $('#points-info-control').closest('.col').addClass('active');
  };

  var hide_info = (a) => {
    var under = d3.select(a);

    if (a && under.classed('adm2') && under.attr('id') === "adm2-${ _u.get_query_param('adm2') }") return;

    $('#point-info').fadeOut(200);
    $('#points-info-control').closest('.col').removeClass('active');
  };

  return {
    draw: draw,
    load: load,
    locked: locked,
    fetch: fetch,
    clear: clear,
    init: init,
    setup: setup,
    show_info: show_info,
    hide_info: hide_info
  };
});
