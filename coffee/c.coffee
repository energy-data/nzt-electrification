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

  locked_adm2 = null

  _svg = d3.select 'svg#svg'
    .attr 'width',  d3.select('html').node().clientWidth
    .attr 'height', d3.select('html').node().clientHeight

  d3.select('#container').attr 'transform', "scale(25)"

  load_adm = (topo, pathname, callback) ->
    u.check topo, pathname

    path = map.load_topo
      topo: topo
      pathname: pathname
      cls: 'adm hoverable'
      fill: 'white'

    if typeof callback is 'function'
      return callback.call this, path
    else
      return path


  set_adm1_fills = (id) ->
    d3.selectAll('path.adm1').each (e) ->
      d3.select(this).attr 'fill', ->
        if e.id is id then 'none' else '#eee'


  load_adm1 = ->
    load_adm adm1, 'adm1'
      .on 'click', (d) ->
        $('#summary-info').fadeOut()
        $('#grid-info').fadeOut()

        grid.clear(true)

        data.place['adm2'] = undefined
        data.place['adm2_name'] = undefined

        if location.getQueryParam 'adm2'
          history.pushState { reload: false }, null, location.updateQueryParam('adm2', null)

        history.pushState null, null, location.updateQueryParam('adm1', d['id'])

        data.place['adm1']      = d['id']
        data.place['adm1_name'] = d.properties['name']

        set_adm1_fills d.id

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
        return if locked_adm2 is this

        locked_adm2 = this

        d3.selectAll('path.adm2').classed 'hoverable', true
        d3.select(this).classed 'hoverable', false

        history.pushState null, null, location.updateQueryParam('adm2', d['id'])

        admin1 = d.properties['adm1']

        data.place['adm1']      = admin1 || undefined
        data.place['adm1_name'] = d3.select("#adm1-#{ admin1 }").datum().properties['name'] || undefined

        data.place['adm2']      = d['id']
        data.place['adm2_name'] = d.properties['name']

        data.place['bbox'] = map.to_bbox this.getBBox()

        grid.load
          adm: this.id.match /adm(.*)-(\d*)?/
          svg_box: this.getBBox()

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

      grid.clear()

      map.resize_to
        node: d3.select('#container').node()
        duration: 1000


    $('[data="adm1_name"]').on 'click', ->
      grid.clear()

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


    $('#controls-control').on 'click', (e) ->
      e.preventDefault()

      icon = $(this).find('i')

      if icon.hasClass 'active'
        $('#controls').trigger 'mouseleave'
        icon.removeClass 'active'

      else
        $('#controls').css left: 0
        icon.addClass 'active'


    $('#controls').on 'mouseleave', (e) ->
      $('#controls-control i').toggleClass 'active'

      $(this).css left: "#{ -1 * this.clientWidth }px"


  run = (args...) ->
    window.onpopstate = (e) ->
      grid.clear(true)

      if e.state? and e.state['reload'] is false
        history.back()

      else
        run args...

    $('#summary-info table').html ""

    scenario.clear_selector()
    mode.clear_selector()

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
          throw Error "This scenario is dodgy: #{ args[2] }"

        else
          grid.draw data.grid_collection['grids']
    ]

    data.scenario['callback'] = [
      'tier',
      (args...) ->
        t = args[2]

        if t not in [1..5]
          throw Error "This tier is dodgy: #{ t }"

        else
          data.scenario['scn'] = "#{ data.scenario['diesel_p'] }#{ t }"
    ]

    data.scenario['callback'] = [
      'diesel_p',
      (args...) ->
        t = args[2]

        if t not in ["l", "n"]
          throw Error "This diesel price is dodgy: #{ t }"

        else
          data.scenario['scn'] = "#{ t }#{ data.scenario['tier'] }"
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


    map.setup_drag()

    data.place['adm0']      = _country['iso3']
    data.place['adm0_name'] = _country['name']

    admin1 = parseInt location.getQueryParam('adm1')
    admin2 = parseInt location.getQueryParam('adm2')
    load_grids = location.getQueryParam('load_grids').toBoolean()

    target_id = ->
      if admin1 > -1 and isNaN(admin2)
        return "#adm1-#{ admin1 }"

      else if admin2 > -1
        return "#adm2-#{ admin2 }"

      else
        return '#container'


    target = d3.select target_id()

    if admin2 > -1
      data.place['adm2']      = admin2 || undefined
      data.place['adm2_name'] = target.datum().properties['name'] || undefined

      admin1 = target.datum().properties['adm1']

      data.place['adm1']      = admin1 || undefined
      data.place['adm1_name'] = d3.select("#adm1-#{ admin1 }").datum().properties['name'] || undefined

    else if admin1 > -1
      data.place['adm1']      = admin1 || undefined
      data.place['adm1_name'] = target.datum().properties['name'] || undefined


    load_adm2 admin1

    set_adm1_fills admin1

    if load_grids
      $('#summary-info').show()

      grid.load
        adm: target.node().id.match /adm(.*)-(\d*)?/
        svg_box: target.node().getBBox()

    map.resize_to
      node: target.node()
      duration: 1
      callback: ->
        $('.loading').fadeOut(2000)


  d3.queue(5)
    .defer d3.json, "/#{ _g.assets }/#{ iso3 }-adm0.json"
    .defer d3.json, "/#{ _g.assets }/#{ iso3 }-adm1.json"
    .defer d3.json, "/#{ _g.assets }/#{ iso3 }-adm2.json"
    .defer d3.json, "/#{ _g.assets }/#{ iso3 }-existing-transmission-lines.json"
    .defer d3.json, "/#{ _g.assets }/#{ iso3 }-planned-transmission-lines.json"
    .defer d3.json, "/#{ _g.assets }/countries.json"

    .await (error, adm0, adm1, adm2, existing_transmission, planned_transmission, countries) ->
      if error then console.error error else run arguments
