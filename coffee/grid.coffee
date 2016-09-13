define ['utils', 'scenario', 'd3', 'map'], (u, scenario, d3, map) ->
  tc = d3.schemeCategory10.splice(0,8)

  iso3 = location.getQueryParam('iso3')

  count_threshold = 20000

  attrs = ['x','y','cc','p_2030','nc','gd_c','gd_p','rd','ghi','w_cf','hp','hp_d','u','l1','l2','l3','l4','l5','n1','n2','n3','n4','n5','lc_l1','lc_l2','lc_l3','lc_l4','lc_l5','lc_n1','lc_n2','lc_n3','lc_n4','lc_n5','c_l1','c_l2','c_l3','c_l4','c_l5','c_n1','c_n2','c_n3','c_n4','c_n5','ic_l1','ic_l2','ic_l3','ic_l4','ic_l5','ic_n1','ic_n2','ic_n3','ic_n4','ic_n5']

  scn = data.scenario['scn']

  _container = d3.select('#container')

  grid_info = $('#grid-info')

  u.check scn, iso3

  fetch = (o) ->
    d3.queue()
      .defer d3.json, "http://localhost:4000/grids?" +
        "select=#{ attrs }" +
        "&x=gt.#{ o.box[0] }&x=lt.#{ o.box[2] }" +
        "&y=gt.#{ o.box[1] }&y=lt.#{ o.box[3] }" +
        "&adm#{ o.adm[1] }=eq.#{ o.adm[2] }" +
        "&cc=eq.#{ o.country_code }"

      .await (error, grids) ->
        if error? then console.log error
        if typeof o.callback is 'function' then o.callback.call null, grids


  draw = (grids) ->
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
        .attr 'fill', (d) -> tc[e[scn]]

        .on 'mouseleave', (d) ->
          d3.select(this)
            .attr 'stroke', 'none'

        .on 'mouseenter', (d) ->
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

    data.summary['total_count'] = grids.length


  load = (o) ->
    adm       = o.adm
    svg_box   = o.svg_box
    country   = _g.countries.find (c) -> c['iso3'] is iso3

    u.check adm, svg_box, _container, country

    box = map.to_bbox svg_box

    d3.selectAll('path.grid').remove()

    fetch
      country_code: country['code']
      adm: adm
      box: box

      callback: (grids) ->
        data.grid_collection = grids

        if grids.length > count_threshold
          c = confirm "Loading #{ grids.length } will most likely make the webpage sluggish. Continue?"

        if not c
          grids = grids.sort(-> return 0.5 - Math.random()).splice(0, count_threshold)

        draw grids

        d3.selectAll('path.line').raise()


  return grid =
    load: load
