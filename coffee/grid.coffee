define ['utils', 'mode', 'd3', 'map'], (u, mode, d3, map) ->
  #
  # Variables:
  #

  iso3 = location.getQueryParam('iso3')

  count_threshold = 20000

  _container = d3.select('#container')

  grid_info = $('#grid-info')

  locked = null

  u.check iso3, _container, grid_info

  #
  # Function definitions:
  #

  fetch = (o) ->
    d3.queue()
      .defer d3.json, "http://localhost:4000/grids?" +
        "select=#{ _g.grid_attrs }" +
        "&x=gt.#{ o.box[0] }&x=lt.#{ o.box[2] }" +
        "&y=gt.#{ o.box[1] }&y=lt.#{ o.box[3] }" +
        "&adm#{ o.adm[1] }=eq.#{ o.adm[2] }" +
        "&cc=eq.#{ o.country_code }"

      .await (error, grids) ->
        if error? then console.log error
        if typeof o.callback is 'function' then o.callback.call null, grids


  clear = (full = false) ->
    d3.selectAll('path.grid').remove()

    if full then data.grid_collection['grids'] = []


  draw = (grids) ->
    return if not grids?

    locked = null

    scn = data.scenario['scn']

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

    grids.map (e) ->
      tech = _g.technologies[e[scn]]
      counts[tech['id']] += 1

      _container.append("path")
        .datum
          type: "Point",
          coordinates: [e.x, e.y]

        .attr 'class', "grid"
        .attr 'd', map.geo_path
        .attr 'fill', (d) -> mode.fill e, scn
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

          grid_info.show()

          d3.select(this)
            .attr 'stroke', 'red'
            .attr 'stroke-width', 0.01

          for k,v of e
            data.grid[k] = v

          data.grid['long'] = e['x']
          data.grid['lat']  = e['y']
          data.grid['ic']   = e["ic_#{ scn }"]
          data.grid['lc']   = e["lc_#{ scn }"]
          data.grid['cap']  = e["c_#{ scn }"]

          data.grid['technology'] = tech['name']

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

      callback: (grids) ->
        if grids.length > count_threshold
          c = confirm "Loading #{ grids.length } will most likely make the webpage sluggish. Continue?"

        if not c
          grids = grids.sort(-> return 0.5 - Math.random()).splice(0, count_threshold)

        draw grids

        data.summary['total_count'] = grids.length

        data.grid_collection['grids'] = grids


  return grid =
    draw: draw
    load: load
    clear: clear
