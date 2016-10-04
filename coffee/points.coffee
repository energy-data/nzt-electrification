define ['mode', 'd3', 'map'], (mode, d3, map) ->
  #
  # Variables:
  #

  _container = null
  _info = null

  count_threshold = 20000

  locked = null

  fill = null
  stroke = null
  stroke_width = null

  #
  # Function definitions:
  #

  init = () ->
    _container = d3.select('#all-paths-adm2')
    _info = $('#point-info')


  fetch = (o) ->
    d3.queue()
      .defer d3.json, "#{ _conf['data_source'] }/points?" +
        "select=#{ _g.point_attrs }" +
        "&x=gt.#{ o.box[0] }&x=lt.#{ o.box[2] }" +
        "&y=gt.#{ o.box[1] }&y=lt.#{ o.box[3] }" +
        "&adm#{ o.adm[1] }=eq.#{ o.adm[2] }" +
        "&cc=eq.#{ _d.place['adm0_code'] }"

      .await (error, points) ->
        if error? then console.log error
        if typeof o.callback is 'function' then o.callback.call null, points


  clear = (full = false) ->
    d3.selectAll('path.point').remove()

    if full then _d.point_collection['points'] = []


  reset_stroke = (it) =>
    d3.select(it)
      .attr('stroke-width', stroke_width)
      .attr('stroke', stroke)


  draw = (points) ->
    return if not points?

    locked = null

    scn = _d.scenario['scn']
    diesel_p = _d.scenario['diesel_p']

    clear()

    fill = mode.fill()
    stroke = mode.stroke()
    stroke_width = mode.stroke_width()

    points.map (e) ->
      _container.append("path")
        .datum
          type: "Point",
          coordinates: [e.x, e.y]

        .attr 'class', "point"
        .attr 'd', map.geo_path
        .attr 'fill', -> fill e, scn
        .attr 'stroke', -> stroke
        .attr 'stroke-width', -> stroke_width

        .on 'mouseleave', (d) ->
          if this isnt locked then reset_stroke this

        .on 'click', (d) ->
          if this is locked
            d3.select(this).attr('stroke-width', 0)
            locked = null

          else
            reset_stroke locked

            d3.select(this)
              .attr('stroke', 'red')
              .attr('stroke-width', 0.02)
              .raise()

            info e, scn, diesel_p

            locked = this


        .on 'mouseenter', (d) ->
          return if locked isnt null

          _info.show()

          d3.select(this)
            .attr('stroke-width', 0.01)
            .attr('stroke', 'red')

          info e, scn, diesel_p


    d3.selectAll('path.line, text.adm2').raise()


  info = (e, scn, diesel_p) ->
    tech = _g.technologies[e[scn]]

    for k,v of e
      _d.point[k] = v.toLocaleString()

    _d.point['long'] = e['x']
    _d.point['lat']  = e['y']
    _d.point['ic']   = e["ic_#{ scn }"].toLocaleString()
    _d.point['lc']   = e["lc_#{ scn }"].toLocaleString()
    _d.point['cap']  = e["c_#{ scn }"].toLocaleString()
    _d.point['lcsa'] = e["lcsa_#{ diesel_p }"].toLocaleString()

    _d.point['technology'] = tech['name']

    _d.point['urban'] = if e['u'] then "Urban" else "Rural"
    _d.point['wind']  = _u.percent(e['w_cf'], 1)


  load = (o) ->
    adm       = o.adm
    svg_box   = o.svg_box

    _u.check adm, svg_box, _container

    box = map.to_bbox svg_box

    fetch
      adm: adm
      box: box

      callback: (points) ->
        if points.length > count_threshold
          c = confirm "Loading #{ points.length } will most likely make the webpage sluggish. Continue?"

        if not c
          points = points.sort(-> return 0.5 - Math.random()).splice(0, count_threshold)

        draw points

        _d.point_collection['points'] = points


  return points =
    draw: draw
    load: load
    clear: clear
    init: init
