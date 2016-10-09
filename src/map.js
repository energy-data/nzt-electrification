define(['d3', 'topojson'], (d3, topojson) => {
  var projection = d3.geoMercator();

  var geo_path = d3.geoPath()
      .projection(projection)
      .pointRadius(0.01);

  var factor = 1;

  var _svg = d3.select('svg#svg');

  var _container = (!_svg.empty() ? _svg.append('g').attr('id', 'container') : null);

  var to_bbox = (b) => {
    let c = [
      projection.invert([b['x']             , b['y']              ]),
      projection.invert([b['x'] + b['width'], b['y'] + b['height']])
    ];

    return [c[0][0], c[1][1], c[1][0], c[0][1]];
  };

  var resize_to = function(o) {
    let node      = o.node;
    let svg       = o.svg      || _svg;
    let parent    = o.parent   || _container;
    let left      = o.left     || 0;
    let padding   = o.padding  || 0.5;
    let delay     = o.delay    || 300;
    let duration  = o.duration || 0;
    let callback  = o.callback;
    let interact  = (o.interact !== false);

    _u.check(node, parent, svg);

    let box = node.getBBox();

    let w = box.width  + (padding * 2);
    let h = box.height + (padding * 2);

    let cw = svg.attr('width');
    let ch = svg.attr('height');

    factor = Math.min(cw/w, ch/h);

    let x_shift = (-box.x + padding) * factor;
    let y_shift = (-box.y + padding) * factor;

    if (! interact) {
      parent.attr('transform', `translate(${ x_shift }, ${ y_shift })scale(${ factor })`);
      return;
    }

    let center = [
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
            .translate(-center[0] + left, -center[1]));

    (typeof callback === 'function') ? callback.apply(null, arguments) : null;
  };

  var load_topo = function(o) {
    let topo      = o.topo;
    let pathname  = o.pathname;
    let callback  = o.callback;
    let labels    = o.labels || false;
    let cls       = o.cls    || "path";
    let stroke    = o.stroke || "#ccc";
    let fill      = o.fill   || "none";
    let parent    = o.parent || _container;

    _u.check(topo, pathname, parent);

    let features = topojson.feature(topo, topo.objects[pathname]).features;

    let path = parent.selectAll(`path.${ pathname }`)
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
        .attr('class', `adm-label ${ pathname }`)
        .attr('transform', (d) => `translate(${ geo_path.centroid(d) })`)
        .attr('font-size', `${ 1/ 25 }em`) // TOOD: I don't know...
        .text((d) => d.properties['name']);
    }

    return (typeof callback === 'function') ?
      callback.call(this, path) :
      path;
  };

  var zoom = d3.zoom().on("zoom", () => {
    d3.selectAll("text.adm-label")
      .attr('font-size', (d) => {
        return d.properties['adm1'] ?
          `${ 1 / d3.event.transform['k'] }em` :
          `${ 1.1 / d3.event.transform['k'] }em`
      });

    _container.attr("transform", d3.event.transform);

    _container.selectAll('path').attr("stroke-width", 1.2 / d3.event.transform['k']);
  });

  var setup_drag = () => {
    _svg.call(zoom)
      .on("dblclick.zoom", null);
  };

  return {
    load_topo: load_topo,

    geo_path: geo_path,
    projection: projection,

    to_bbox: to_bbox,

    resize_to: resize_to,
    setup_drag: setup_drag
  };
});
