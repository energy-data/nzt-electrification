define ['d3', 'topojson'], (d3, topojson) ->
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
    node      = o.node
    svg       = o.svg || _svg
    delay     = o.delay || 300
    duration  = o.duration || 0
    padding   = o.padding  || 0.5
    container = o.container || _container
    callback  = o.callback

    _u.check node, container, svg

    box = node.getBBox()

    w = box.width  + (padding * 2)
    h = box.height + (padding * 2)

    cw = svg.attr 'width'
    ch = svg.attr 'height'

    factor = Math.min cw/w, ch/h

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
          .scale factor
          .translate -center[0], -center[1]
        )

    d3.selectAll('path.adm, path.line').attr('stroke-width', 1.2 / factor)
    d3.selectAll('path.line').raise()

    if typeof callback is 'function' then callback.apply null, arguments


  load_topo = (o) ->
    topo      = o.topo
    pathname  = o.pathname
    callback  = o.callback
    cls       = o.cls    || "path"
    stroke    = o.stroke || "#ccc"
    fill      = o.fill  || "none"
    container = o.container || _container

    _u.check topo, pathname, container

    features = topojson.feature(topo, topo.objects[pathname]).features

    path = container.selectAll "path.#{ pathname }"
      .data features
      .enter().append('path')
        .attr 'id', (d) -> if d.id then "#{ pathname }-#{ d.id }" else null
        .attr 'class', "#{ cls } #{ pathname }"
        .attr 'stroke', stroke
        .attr 'fill', fill
        .attr 'd', geo_path

    label = container.selectAll "text.adm-label.#{ pathname }"
      .data features
      .enter().append 'text'
        .attr 'class', "adm-label #{ pathname }"
        .attr 'transform', (d) -> "translate(#{ geo_path.centroid(d) })"
        .attr 'font-size', "#{ 1/ 25 }em" # TOOD: I don't know...
        .text (d) -> d.properties['name']


    if typeof callback is 'function'
      return callback.call this, path

    else
      return path


  zoom = d3.zoom().on "zoom", ->
    _container.attr "transform", d3.event.transform

    _container.selectAll('path.adm, path.line')
      .attr "stroke-width", 1.2 / d3.event.transform['k']

    d3.selectAll("text.adm-label")
      .attr 'font-size', (d) ->
        if d.properties['adm1'] then "#{ 1 / d3.event.transform['k'] }em"
        else "#{ 1.1 / d3.event.transform['k'] }em"


  setup_drag = ->
    _svg.call zoom
      .on "dblclick.zoom", null


  return map =
    load_topo: load_topo

    geo_path: geo_path
    projection: projection

    to_bbox: to_bbox

    resize_to: resize_to
    setup_drag: setup_drag
