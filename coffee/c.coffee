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
  'mode'
],

(u, _g, data, scenario, d3, map, grid, mode) ->
  iso3 = location.getQueryParam 'iso3'

  adm0 = adm1 = adm2 = null

  path_adm2 = null

  _svg = d3.select 'svg#svg'
    .attr 'width',  d3.select('html').node().clientWidth
    .attr 'height', d3.select('html').node().clientHeight

  load_adm = (topo, pathname, callback) ->
    u.check topo, pathname

    path = map.load_topo
      topo: topo
      pathname: pathname
      cls: 'adm'
      fill: 'white'

    if typeof callback is 'function'
      return callback.call this, path
    else
      return path


  load_adm1 = ->
    load_adm adm1, 'adm1'
      .on 'click', (d) ->
        $('#summary-info').fadeOut()
        $('#grid-info').fadeOut()

        d3.selectAll('path.grid').remove()

        data.place['adm1']      = d['id']
        data.place['adm1_name'] = d.properties['name']

        d3.selectAll('path.adm1').each (e) ->
          d3.select(this).attr 'fill', ->
            if e.id is d.id then 'none' else '#eee'

        map.resize_to
          node: this
          duration: 1000

        load_adm2 d.id


  load_adm2 = (adm1_id) ->
    u.check adm1_id

    d3.selectAll('path.adm2').each (e) ->
      d3.select(this).style 'display', ->
        if e.properties.adm1 is adm1_id then 'block' else 'none'

    path_adm2
      .on 'click', (d) ->
        it = this

        data.place['adm2']      = d['id']
        data.place['adm2_name'] = d.properties['name']

        data.place['bbox'] = map.to_bbox it.getBBox()

        grid.load
          adm: it.id.match /adm(.*)-(\d*)?/
          svg_box: it.getBBox()

        $('#summary-info').fadeIn()

        map.resize_to
          node: this
          duration: 1000


  setup_interactions = ->
    $('[data="adm0_name"]').on 'click', ->
      data.place['adm1'] = undefined
      data.place['adm1_name'] = undefined

      data.place['adm2'] = undefined
      data.place['adm2_name'] = undefined

      map.resize_to
        node: d3.select('#container').node()
        duration: 1000


    $('[data="adm1_name"]').on 'click', ->
      d3.selectAll('path.grid').remove()

      it = d3.select("path#adm1-#{ data.place['adm1'] }").node()

      data.place['adm2'] = undefined
      data.place['adm2_name'] = undefined

      data.place['bbox'] = map.to_bbox it.getBBox()

      map.resize_to
        node: it
        duration: 1000

      grid.load
        adm: [null, 1, data.place['adm1']]
        svg_box: it.getBBox()

      $('#summary-info').fadeIn()


    $('#export-summary').on 'click', (e) ->
      e.preventDefault()

      o =
        grid_summary: data.summary
        location: data.place

      u.dwnld JSON.stringify(o), 'export-summary.json'


    $('#export-grids').on 'click', (e) ->
      e.preventDefault()

      o =
        grid_summary: data.summary
        location: data.place

      u.dwnld JSON.stringify(data.grid_collection['grids']), 'export-grids.json'


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

    setup_interactions()

    mode.init()
    mode.load_selector()

    data.mode['callback'] = [
      'type',
      (args...) ->
        if args[2] not in mode.modes.map((m) -> m['type'])
          throw Error "This mode is dodgy:", args

        else
          grid.draw data.grid_collection['grids']
    ]

    scenario.init()
    scenario.load_selector()

    data.scenario['callback'] = [
      'scn',
      (args...) ->
        if args[2] not in _g.scenarios
          throw Error "This scenario is dodgy:", args

        else
          grid.draw data.grid_collection['grids']
    ]


    load_adm1()

    path_adm2 = load_adm adm2, 'adm2'
    d3.selectAll('path.adm2').style 'display', 'none'

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
