define ['utils', 'd3', 'topojson'], (u, d3, topojson) ->
  projection = d3.geoMercator()

  geo_path = d3.geoPath()
    .projection projection
    .pointRadius 0.01

  factor = 1

  _svg = d3.select 'svg#svg'

  if not _svg.empty()
    _container = _svg
      .append 'g'
      .attr 'id', 'container'


  to_bbox = (b) ->
    c = [
      projection.invert([b['x']             , b['y']              ]),
      projection.invert([b['x'] + b['width'], b['y'] + b['height']])
    ]

    return [c[0][0], c[1][1], c[1][0], c[0][1]]


  resize_to = (o) ->
    node       = o.node
    svg        = o.svg || _svg
    delay      = o.delay || 300
    duration   = o.duration || 0
    padding    = o.padding  || 0.5
    container  = o.container || _container

    u.check node, container, svg

    transition = duration > 0

    box = node.getBBox()

    w = box.width  + (padding * 2)
    h = box.height + (padding * 2)

    cw = svg.attr 'width'
    ch = svg.attr 'height'

    factor = Math.min cw/w, ch/h

    if transition
      center = [
        box['x'] + (box['width']  / 2)
        box['y'] + (box['height'] / 2)
      ]

      svg.transition()
        .delay delay
        .duration duration
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(
              svg.node().parentNode.clientWidth  / 2,
              svg.node().parentNode.clientHeight / 2
            )
            .scale(factor)
            .translate(-center[0], -center[1])
          )

    else
      x_shift = (-box.x + padding) * factor
      y_shift = (-box.y + padding) * factor

      container
        .attr 'transform', "translate(#{ x_shift }, #{ y_shift })scale(#{ factor })"

    d3.selectAll('.adm,.line').attr('stroke-width', 1.2 / factor)
    d3.selectAll('path.line').raise()


  load_topo = (o) ->
    topo     = o.topo
    pathname = o.pathname
    callback = o.callback
    cls      = o.cls   || "path"
    color    = o.color || "#ccc"
    fill     = o.fill  || "none"
    container = o.container || _container

    u.check topo, pathname, container

    features = topojson.feature(topo, topo.objects[pathname]).features

    path = container.selectAll "path.#{ pathname }"
      .data features
      .enter().append('path')
        .attr 'id', (d) -> if d.id then "#{ pathname }-#{ d.id }" else null
        .attr 'class', "#{ cls } #{ pathname }"
        .attr 'stroke', color
        .attr 'fill', fill
        .attr 'd', geo_path


    if typeof callback is 'function'
      return callback.call this, path

    else
      return path


  zoom = d3.zoom().on "zoom", ->
    _container.attr "transform", d3.event.transform


  setup_drag = ->
    _svg.call zoom


  return map =
    load_topo: load_topo

    geo_path: geo_path
    projection: projection

    to_bbox: to_bbox

    resize_to: resize_to
    setup_drag: setup_drag
