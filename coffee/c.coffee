requirejs.config
  'baseUrl': './javascripts'
  'paths':
    'd3':         "../lib/d3/d3.min"
    'topojson':   "../lib/topojson/topojson.min"
    'jquery':     "../lib/jquery/dist/jquery.min"
    'js-extras': "../lib/js-extras/dist/js-extras.min"
    'web-extras': "../lib/web-extras/dist/web-extras.min"

  'shim':
      'web-extras': 'deps': ['jquery']
      'grid':       'deps': ['web-extras']
      'map':        'deps': ['web-extras']
      'utils':      'deps': ['js-extras']

require [
  'utils'
  '_g'
  'data'
  'scenario'
  'd3'
  'map'
  'grid'
],

(u, _g, data, scenario, d3, map, grid) ->
  iso3 = location.getQueryParam 'iso3'

  adm0 = adm1 = adm2 = null

  _svg = d3.select 'svg#svg'
    .attr 'width',  d3.select('html').node().clientWidth
    .attr 'height', d3.select('html').node().clientHeight

  blur_adm1 = (adm1_id) ->
    u.check adm1_id

    all = d3.selectAll('path.adm1')

    all
      .on 'mouseleave', null
      .attr 'fill', '#eee'

    d3.selectAll('path.adm1')
      .each (e) ->
        el = this
        it = d3.select(el)

        if e.properties.adm1 isnt adm1_id
          it
            .attr 'fill', '#eee'
            .on 'mouseleave', ->
              it.style('fill', '#eee')


  load_adm1 = ->
    map.load_adm adm1, 'adm1'
      .on 'click', (d) ->
        data.place['adm1']      = d['id']
        data.place['adm1_name'] = d.properties['name']

        load_adm2 d.id
        blur_adm1 d.id

        map.resize_to
          node: this
          duration: 1000

        d3.selectAll('path.adm2').each (e) ->
          el = this

          if e.properties.adm1 isnt d.id
            d3.select(el).style('opacity', 0)
            setTimeout (-> el.remove()), 400


  load_adm2 = (adm1_id) ->
    u.check adm1_id

    path = map.load_adm adm2, 'adm2'

    path
      .on 'click', (d) ->
        data.place['adm2']      = d['id']
        data.place['adm2_name'] = d.properties['name']

        it = this

        data.place['bbox'] = map.to_bbox it.getBBox()

        grid.load
          adm: it.id.match /adm(.*)-(\d*)?/
          svg_box: it.getBBox()

        map.resize_to
          node: this
          duration: 1000


  run = (args...) ->
    for t in _g.technologies
      continue if not t
      u.tmpl '#summary-count-template',
             '#summary-info table',
             t['name'], "#{ t['id'] }_count"

    adm0 = args[0][1]
    adm1 = args[0][2]
    adm2 = args[0][3]

    existing_transmission = args[0][4]
    planned_transmission  = args[0][5]

    _g.countries = args[0][6]

    _country = _g.countries.find (c) -> c['iso3'] is iso3

    document.getElementsByTagName('title')[0].text = "#{ _country['name'] } - Electrification"

    $('#export-summary').on 'click', ->
      o =
        grid_summary: data.summary
        location: data.place

      u.dwnld JSON.stringify(o), 'export-summary.json', 'application/octet-stream'
    window.grid = grid


    $('#export-grids').on 'click', ->
      o =
        grid_summary: data.summary
        location: data.place

      u.dwnld JSON.stringify(data.grid_collection), 'export-grids.json', 'application/octet-stream'


    scenario.load_selector()

    load_adm1()

    map.load_topo
      topo: existing_transmission
      cls: 'line'
      pathname: 'existing'
      color: 'gold'
      fill: 'none'


    map.load_topo
      topo: planned_transmission
      cls: 'line'
      pathname: 'planned'
      color: 'yellow'
      fill: 'none'


    map.resize_to
      node: d3.select('#container').node()
      delay: 0
      duration: 1

    map.setup_drag()

    data.place['adm0']      = _country['iso3']
    data.place['adm0_name'] = _country['name']


  d3.queue(5)
    .defer d3.json, "/#{ _g.assets }/#{ iso3 }-adm0.json"
    .defer d3.json, "/#{ _g.assets }/#{ iso3 }-adm1.json"
    .defer d3.json, "/#{ _g.assets }/#{ iso3 }-adm2.json"
    .defer d3.json, "/#{ _g.assets }/#{ iso3 }-existing-transmission-lines.json"
    .defer d3.json, "/#{ _g.assets }/#{ iso3 }-planned-transmission-lines.json"
    .defer d3.json, "/#{ _g.assets }/countries.json"

    .await (error, adm0, adm1, adm2, existing_transmission, planned_transmission, countries) ->
      if error then console.error error else run arguments
