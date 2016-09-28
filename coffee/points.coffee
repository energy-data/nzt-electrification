define ['utils', 'mode', 'd3', 'map'], (u, mode, d3, map) ->
  #
  # Variables:
  #

  iso3 = location.getQueryParam('iso3')

  count_threshold = 20000

  _container = d3.select('#container')

  point_info = $('#point-info')

  locked = null

  u.check iso3, _container, point_info

  #
  # Function definitions:
  #

  fetch = (o) ->
    d3.queue()
      .defer d3.json, "http://localhost:4000/points?" +
        "select=#{ _g.point_attrs }" +
        "&x=gt.#{ o.box[0] }&x=lt.#{ o.box[2] }" +
        "&y=gt.#{ o.box[1] }&y=lt.#{ o.box[3] }" +
        "&adm#{ o.adm[1] }=eq.#{ o.adm[2] }" +
        "&cc=eq.#{ o.country_code }"

      .await (error, points) ->
        if error? then console.log error
        if typeof o.callback is 'function' then o.callback.call null, points


  clear = (full = false) ->
    d3.selectAll('path.point').remove()

    if full then data.point_collection['points'] = []


  draw = (points) ->
    return if not points?

    locked = null

    scn = data.scenario['scn']
    diesel_p = data.scenario['diesel_p']

    clear()

    $('#summary-info table').html ""

    for t in _g.technologies
      continue if not t
      u.tmpl '#summary-count-template',
             '#summary-info table',
             t['name'], "#{ t['id'] }_count"


    data.summary['total_count'] = 0

    for t in _g.technologies
      data.summary["#{ t['id'] }_count"] = 0 if t

    counts = {}

    for t in _g.technologies
      if t? then counts[t['id']] = 0

    fill = mode.fill()

    points.map (e) ->
      tech = _g.technologies[e[scn]]
      counts[tech['id']] += 1

      _container.append("path")
        .datum
          type: "Point",
          coordinates: [e.x, e.y]

        .attr 'class', "point"
        .attr 'd', map.geo_path
        .attr 'fill', -> fill e, scn
        .attr 'stroke', 'red'
        .attr 'stroke-width', 0

        .on 'mouseleave', (d) ->
          if this isnt locked then d3.select(this).attr('stroke-width', 0)


        .on 'click', (d) ->
          if this is locked
            d3.select(this).attr('stroke-width', 0)
            locked = null

          else
            d3.select(locked).attr('stroke-width', 0)

            locked = this
            d3.select(locked).attr('stroke-width', 0.01)


        .on 'mouseenter', (d) ->
          return if locked isnt null

          point_info.show()

          d3.select(this)
            .attr 'stroke', 'red'
            .attr 'stroke-width', 0.01

          for k,v of e
            data.point[k] = v

          data.point['long'] = e['x']
          data.point['lat']  = e['y']
          data.point['ic']   = e["ic_#{ scn }"]
          data.point['lc']   = e["lc_#{ scn }"]
          data.point['cap']  = e["c_#{ scn }"]
          data.point['lcsa'] = e["lcsa_#{ diesel_p }"]

          data.point['technology'] = tech['name']


    for t in _g.technologies
      if t? then data.summary["#{ t['id'] }_count"] = counts[t['id']]

    d3.selectAll('path.line').raise()


  load = (o) ->
    adm       = o.adm
    svg_box   = o.svg_box
    country   = _g.countries.find (c) -> c['iso3'] is iso3

    u.check adm, svg_box, _container, country

    box = map.to_bbox svg_box

    fetch
      country_code: country['code']
      adm: adm
      box: box

      callback: (points) ->
        if points.length > count_threshold
          c = confirm "Loading #{ points.length } will most likely make the webpage sluggish. Continue?"

        if not c
          points = points.sort(-> return 0.5 - Math.random()).splice(0, count_threshold)

        draw points

        data.summary['total_count'] = points.length

        data.point_collection['points'] = points


  return points =
    draw: draw
    load: load
    clear: clear
