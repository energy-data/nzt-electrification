define(['mode', 'd3', 'map'], (mode, d3, map) => {
  //
  // Variables:
  //

  var _container;
  var _info;

  var count_threshold = 20000;

  var locked;

  var fill, stroke, stroke_width;

  //
  // Function definitions:
  //

  var init = () => {
    _container = d3.select('#all-paths-adm2');
    _info = $('#point-info');
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
    d3.selectAll('path.point').remove();
    if (full) _d.point_collection['points'] = [];
  };

  var reset_stroke = (it) => {
    d3.select(it)
      .attr('stroke-width', stroke_width)
      .attr('stroke', stroke);
  };

  var draw = (points) => {
    if (! points) {
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

    points.map((e) => {
      _container.append("path")
        .datum({
          type: "Point",
          coordinates: [e.x, e.y]
        })
        .attr('class', "point")
        .attr('d', map.geo_path)
        .attr('fill', () => fill(e, scn))
        .attr('stroke', stroke)
        .attr('stroke-width', stroke_width)

        .on('mouseleave', function(d) { if (this !== locked) reset_stroke(this) })

        .on('click', function(d) {
          if (this === locked) {
            d3.select(this).attr('stroke-width', 0);
            locked = null;

          } else {
            reset_stroke(locked);

            d3.select(this)
              .attr('stroke', 'red')
              .attr('stroke-width', 0.02)
              .raise();

            load_info(e, scn, diesel_p);

            locked = this;
          }
        })

        .on('mouseenter', function(d) {
          if (locked !== null) return;

          _info.show();

          d3.select(this)
            .attr('stroke-width', 0.01)
            .attr('stroke', 'red');

          load_info(e, scn, diesel_p);
        });
    });

    d3.selectAll('path.line, text.adm2').raise();
    $('.loading').fadeOut()
  };

  var load_info = (e, scn, diesel_p) => {
    let tech = _g.technologies[e[scn]];

    for (let k in e) _d.point[k] = e[k].toLocaleString();

    _d.point['long'] = e['x'];
    _d.point['lat']  = e['y'];
    _d.point['ic']   = e[`ic_${ scn }`].toLocaleString();
    _d.point['lc']   = e[`lc_${ scn }`].toLocaleString();
    _d.point['cap']  = e[`c_${ scn }`].toLocaleString();
    _d.point['lcsa'] = e[`lcsa_${ diesel_p }`].toLocaleString();

    _d.point['technology'] = tech['name'];

    _d.point['urban'] = (e['u'] ? "Urban" : "Rural");
    _d.point['wind']  = _u.percent(e['w_cf'], 1);
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
      }
    });
  };

  return {
    draw: draw,
    load: load,
    clear: clear,
    init: init
  };
});
