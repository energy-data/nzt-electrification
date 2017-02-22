define(['d3', 'topojson'], (d3, topojson) => {
  var projection = d3.geoMercator();

  var geo_path = d3.geoPath()
      .projection(projection)
      .pointRadius(0.01);

  var factor = 1;

  var _svg = d3.select('svg#svg');

  var _container = (!_svg.empty() ? _svg.append('g').attr('id', 'container') : null);

  var to_bbox = (b) => {
    var c = [
      projection.invert([b['x']             , b['y']              ]),
      projection.invert([b['x'] + b['width'], b['y'] + b['height']])
    ];

    return [c[0][0], c[1][1], c[1][0], c[0][1]];
  };

  var resize_to = function(o) {
    var node      = o.node;
    var svg       = o.svg      || _svg;
    var parent    = o.parent   || _container;
    var padding   = o.padding  || 0.5;
    var delay     = o.delay    || 300;
    var duration  = o.duration || 0;
    var callback  = o.callback;
    var interact  = (o.interact !== false);

    _u.check(node, parent, svg);

    // var box = node.getBBox();
    var box;

    try {
      box = node.getBBox();
    }

    // FF doesn't seem to like node.getBBox() these values are merely
    // empirical:
    //
    catch (e) {
      box = {
        x: 487.1874694824219,
        y: 212.54867553710938,
        width: 31.918975830078125,
        height: 26.03460693359375
      }
    }

    var w = box.width  + (padding * 2);
    var h = box.height + (padding * 2);

    var cw = svg.attr('width');
    var ch = svg.attr('height');

    factor = Math.min(cw/w, ch/h);

    var x_shift = (-box.x + padding) * factor;
    var y_shift = (-box.y + padding) * factor;

    if (! interact) {
      parent.attr('transform', `translate(${ x_shift }, ${ y_shift })scale(${ factor })`);
      return;
    }

    var center = [
      box['x'] + (box['width']  / 2),
      box['y'] + (box['height'] / 2)
    ];

    svg.transition()
      .delay(delay)
      .duration(duration)
      .call(zoom.transform,
            d3.zoomIdentity.translate(
              svg.node().parentNode.clientWidth  / 2,
              svg.node().parentNode.clientHeight / 2
            )
            .scale(factor)
            .translate(-center[0], -center[1]));

    (typeof callback === 'function') ? callback.apply(null, arguments) : null;
  };

  var load_topo = function(o) {
    var topo      = o.topo;
    var pathname  = o.pathname;
    var callback  = o.callback;
    var labels    = o.labels || false;
    var cls       = o.cls    || "path";
    var stroke    = o.stroke || "#ccc";
    var fill      = o.fill   || "none";
    var parent    = o.parent || _container;

    _u.check(topo, pathname, parent);

    var features = topojson.feature(topo, topo.objects[pathname]).features;

    var path = parent.selectAll(`path.${ pathname }`)
        .data(features)
        .enter().append('path')
        .attr('id', (d) => d.id ? `${ pathname }-${ d.id }` : null)
        .attr('class', `${ cls } ${ pathname }`)
        .attr('stroke', stroke)
        .attr('fill', fill)
        .attr('d', geo_path);

    if (labels) {
      d3.select(`#text-labels-${ pathname }`)
        .selectAll(`text.adm-label.${ pathname }`)
        .data(features)
        .enter().append('text')
        .attr('id', (d) => `${ pathname }-label-${ d.id }`)
        .attr('class', `adm-label ${ pathname }`)
        .attr('transform', (d) => `translate(${ geo_path.centroid(d) })`)
        .attr('font-weight', 'normal')
        .attr('font-size', `${ 1/ 25 }em`) // TOOD: I don't know...
        .text((d) => d.properties['name']);
    }

    return (typeof callback === 'function') ?
      callback.call(this, path) :
      path;
  };

  var zoom = d3.zoom()
    .scaleExtent([20, 1000]) // these are decided empirically
    .on("zoom", () => {
      var k = d3.event.transform['k'];
      _container.selectAll('path').style("stroke-width", 1.2 / k);

      d3.selectAll("text.adm-label")
        .attr('font-size', (d) => {
          if (k < 50 && d.properties['adm1']) return 0;

          return d.properties['adm1'] ?
            `${ 0.9 / d3.event.transform['k'] }em` :
            `${ 1 / d3.event.transform['k'] }em`
        });

      _container.attr("transform", d3.event.transform);
    });

  var behaviour = () => {
    _svg.call(zoom)
      .on("dblclick.zoom", null);

    d3.select('#zoom-in').on('click', () => zoom.scaleBy(_svg, 2));
    d3.select('#zoom-out').on('click', () => zoom.scaleBy(_svg, 0.5));
  };

  return {
    load_topo: load_topo,

    geo_path: geo_path,
    projection: projection,

    to_bbox: to_bbox,

    resize_to: resize_to,
    behaviour: behaviour
  };
});
