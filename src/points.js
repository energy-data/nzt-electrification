define(['mode', 'd3', 'map'], (mode, d3, map) => {
  //
  // Variables:
  //

  var _container, _points;

  var count_threshold = 20000;

  var locked;

  var fill, stroke, stroke_width;

  //
  // Function definitions:
  //

  var init = () => {
    _container = d3.select('#container');
    _points = _container.append('g').attr('id', 'points');

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
    $('.loading').fadeIn()

    d3.queue()
      .defer(d3.json,
             `${ _conf['data_source'] }/points?` +
             `select=${ _g.point_attrs }` +
             `&x=gt.${ o.box[0] }&x=lt.${ o.box[2] }` +
             `&y=gt.${ o.box[1] }&y=lt.${ o.box[3] }` +
             `&adm${ o.adm[1] }=eq.${ o.adm[2] }` +
             `&cc=eq.${ _d.place['adm0_code'] }`)

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

  var draw = () => {
    var collection = _d.point_collection['points'];

    if (! collection) {
      $('.loading').fadeOut()
      return;
    }

    locked = null;

    var scn = _d.scenario['scn'];
    var diesel_p = _d.scenario['diesel_p'];

    clear();

    fill = mode.fill();
    stroke = mode.stroke();
    stroke_width = mode.stroke_width();

    mode.scale();

    var circles = "";

    var radius = 0.012

    var area = (_d.summary['results'].reduce((x,c) => { return x + c['pts'] }, 0));

    if (area > count_threshold)
      radius = radius * (area / count_threshold)

    // This is too much for D3, (check git history if curious)
    //
    collection.forEach((e,i) => {
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
        var elem = d3.event.toElement;
        var target = find(d3.event);

        if (elem === locked) {
          reset_stroke(elem);
          locked = null;

        } else {
          reset_stroke(locked);

          d3.select(elem)
            .attr('stroke', 'red')
            .attr('stroke-width', 0.01)
            .raise();

          load_info(target, scn, diesel_p);

          locked = elem;

          show_info();
        }
      })

      .on('mousemove', function() {
        if (locked !== null) return;

        load_info(find(d3.event), scn, diesel_p);
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

  var load = (o) => {
    var adm       = o.adm;
    var svg_box   = o.svg_box;

    var points, c;

    _u.check(adm, svg_box, _container);

    fetch({
      adm: adm,
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
    $('#point-info').removeClass('hidden');
    $('#points-info-control').closest('.col').addClass('active');
  };

  var hide_info = () => {
    $('#point-info').addClass('hidden');
    $('#points-info-control').closest('.col').removeClass('active');
  };

  return {
    draw: draw,
    load: load,
    clear: clear,
    init: init,
    show_info: show_info,
    hide_info: hide_info
  };
});
