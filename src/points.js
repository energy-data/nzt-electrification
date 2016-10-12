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
          console.log(error) :
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

  var draw = (collection) => {
    if (! collection) {
      $('.loading').fadeOut()
      return;
    }

    locked = null;

    let scn = _d.scenario['scn'];
    let diesel_p = _d.scenario['diesel_p'];

    clear();

    fill = mode.fill();
    stroke = mode.stroke();
    stroke_width = mode.stroke_width();

    let circles = "";

    // This is too much for D3, (check git history if curious)
    //
    collection.forEach((e,i) => {
      let pp = map.projection([e.x, e.y]);

      circles += `<circle class="point"
                          fill="${ fill(e,scn) }"
                          stroke="${ stroke }"
                          stroke-width="0.001"
                          cx=${ pp[0] }
                          cy=${ pp[1] }
                          r="0.012"></circle>`;
    });

    _points.node().innerHTML = circles;

    _points
      .on('click', () => {
        let elem = d3.event.toElement;
        let target = find(d3.event);

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
    let it = d3.select(e.toElement);

    let x = it.attr('cx');
    let y = it.attr('cy');

    let p = map.projection.invert([x,y]);
    let px = p[0];
    let py = p[1];

    return _d.point_collection['points'].find((e) => {
      return (px < e['x'] + 0.007 && px > e['x'] - 0.007 &&
              py < e['y'] + 0.007 && py > e['y'] - 0.007);
    });
  };

  var load_info = (e, scn, diesel_p) => {
    let tech = _g.technologies[e[scn]];

    let p = _d.point;

    for (let k in e) p[k] = e[k].toLocaleString();

    p['long'] = e['x'];
    p['lat']  = e['y'];
    p['ic']   = e[`ic_${ scn }`].toLocaleString();
    p['lc']   = e[`lc_${ scn }`].toLocaleString();
    p['cap']  = e[`c_${ scn }`].toLocaleString();
    p['lcsa'] = e[`lcsa_${ diesel_p }`].toLocaleString();

    p['technology'] = tech['name'];

    p['urban'] = (e['u'] ? "Urban" : "Rural");
    p['wind']  = _u.percent(e['w_cf'], 1);
  };

  var load = (o) => {
    let adm       = o.adm;
    let svg_box   = o.svg_box;

    let points, c;

    _u.check(adm, svg_box, _container);

    fetch({
      adm: adm,
      box: map.to_bbox(svg_box),

      callback: (points) => {
        if (points.length > count_threshold)
          c = confirm(`Loading ${ points.length } will most likely make the webpage sluggish. Load all?`);

        if (!c) points = points.sort(() => 0.5 - Math.random()).splice(0, count_threshold);

        draw(points);

        _d.point_collection['points'] = points;

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
