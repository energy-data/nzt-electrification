define ['utils', 'scenario', 'd3', 'map'], (u, scenario, d3, map) ->
  tc = d3.schemeCategory10.splice(0,8)

  iso3 = location.getQueryParam('iso3')

  attrs = ['x','y','country_code','population_2030','new_conn','gd_curr','gd_plan','rd','ghi','wind_cf','hp','hp_d','urban','l1','l2','l3','l4','l5','n1','n2','n3','n4','n5','lc_l1','lc_l2','lc_l3','lc_l4','lc_l5','lc_n1','lc_n2','lc_n3','lc_n4','lc_n5','cap_l1','cap_l2','cap_l3','cap_l4','cap_l5','cap_n1','cap_n2','cap_n3','cap_n4','cap_n5','ic_l1','ic_l2','ic_l3','ic_l4','ic_l5','ic_n1','ic_n2','ic_n3','ic_n4','ic_n5']

  scn = data.scenario['scn']

  _container = d3.select('#container')

  u.check scn, iso3

  load = (o) ->
    adm       = o.adm
    svg_box   = o.svg_box
    container = o.container || _container
    country   = _g.countries.find (c) -> c['iso3'] is iso3

    u.check adm, svg_box, container, country

    box = map.to_bbox svg_box

    data.summary['total_count'] = 0

    for t in _g.technologies
      data.summary["#{ t['id'] }_count"] = 0 if t

    d3.selectAll('path.grid').remove()

    d3.queue()
      .defer d3.json, "http://localhost:4000/grids?" +
        "select=#{ attrs }" +
        "&x=gt.#{ box[0] }&x=lt.#{ box[2] }" +
        "&y=gt.#{ box[1] }&y=lt.#{ box[3] }" +
        "&adm#{ adm[1] }=eq.#{ adm[2] }" +
        "&country_code=eq.#{ country['code'] }"

      .await (error, grids) ->
        window.grids = grids

        grids.map (e) ->
          tech = _g.technologies[e[scn]]
          data.summary['total_count'] += 1
          data.summary["#{ tech['id'] }_count"] += 1

          container.append("path")
            .datum
              type: "Point",
              coordinates: [e.x, e.y]

            .attr 'class', "grid"
            .attr 'd', map.geo_path
            .attr 'fill', (d) -> tc[e[scn]]
            .on 'mouseenter', (d) ->
              for k,v of e
                data.grid[k] = v

              data.grid['long'] = e['x']
              data.grid['lat']  = e['y']
              data.grid['ic']   = e["ic_#{ scn }"]
              data.grid['lc']   = e["lc_#{ scn }"]
              data.grid['cap']  = e["cap_#{ scn }"]

              data.grid['technology'] = tech['name']

        d3.selectAll('path.line').raise()


  return grid =
    load: load
