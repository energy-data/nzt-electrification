requirejs.config
  'baseUrl': './javascripts'
  'paths':
    'd3':         "../lib/d3/d3.min"
    'topojson':   "../lib/topojson/topojson.min"
    'jquery':     "../lib/jquery/dist/jquery.min"
    'js-extras':  "../lib/js-extras/dist/js-extras.min"
    'web-extras': "../lib/web-extras/dist/web-extras.min"

  'shim':
      'web-extras': 'deps': ['jquery']
      'points':     'deps': ['web-extras']
      'map':        'deps': ['web-extras']
      '_u':         'deps': ['js-extras']

require [
  '_u'
  '_g'
  '_d'
  'scenario'
  'd3'
  'map'
  'points'
  'summary'
  'mode'
  'knob'
  'navbar'
],

(_u, _g, _d, scenario, d3, map, points, summary, mode, knob, navbar) ->
  iso3 = location.getQueryParam 'iso3'

  adm0 = adm1 = adm2 = null

  locked_adm2 = null

  rerun = null

  _svg = d3.select 'svg#svg'
    .attr 'width',  d3.select('html').node().clientWidth
    .attr 'height', d3.select('html').node().clientHeight

  d3.select('#container').attr 'transform', "scale(25)"

  window.onpopstate = (e) ->
    points.clear true
    rerun false


  load_adm = (topo, pathname, callback) ->
    _u.check topo, pathname

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
      elem = d3.select(this)

      if e.id is id
        elem.style 'visibility', 'hidden'

      else
        elem
          .style 'visibility', 'visible'
          .attr 'fill', '#eee'
          .attr 'stroke', '#ccc'


  load_adm1 = (it, d) ->
    $('#point-info').hide()

    points.clear true
    reset_adm2 null

    _d.place['adm2'] = undefined
    _d.place['adm2_name'] = undefined

    history.pushState null, null, location.updateQueryParam('adm1', d['id'])

    if location.getQueryParam 'adm2'
      history.replaceState null, null, location.updateQueryParam('adm2', null)

    history.replaceState null, null, location.updateQueryParam('load_points', false)

    _d.place['adm1']      = d['id']
    _d.place['adm1_name'] = d.properties['name']

    set_adm1_fills d.id

    map.resize_to
      node: it
      duration: 600

    show_adm2 d.id


  load_adm2 = (it, d) ->
    return if locked_adm2 is it

    $('#point-info').hide()

    history.pushState null, null, location.updateQueryParam('adm2', d['id'])
    history.replaceState null, null, location.updateQueryParam('load_points', true)

    reset_adm2 it

    locked_adm2 = it

    admin1 = d.properties['adm1']

    _d.place['adm1']      = admin1 || undefined
    _d.place['adm1_name'] = d3.select("#adm1-#{ admin1 }").datum().properties['name'] || undefined

    _d.place['adm2']      = d['id']
    _d.place['adm2_name'] = d.properties['name']

    _d.place['bbox'] = map.to_bbox it.getBBox()

    if location.getQueryParam('load_points').toBoolean()
      points.load
        adm: it.id.match /adm(.*)-(\d*)?/
        svg_box: it.getBBox()

    map.resize_to
      node: it
      duration: 600


  # TODO: remove this (used in navbar)
  #
  window.load_adm1 = load_adm1
  window.load_adm2 = load_adm2
  window.set_adm1_fills = set_adm1_fills


  show_adm2 = (adm1_id) ->
    _u.check adm1_id

    d3.selectAll('path.adm2').each (e) ->
      d3.select(this).style 'display', ->
        if e.properties.adm1 is adm1_id then 'block' else 'none'


  reset_adm2 = (target) ->
    d3.selectAll('path.adm2').classed 'hoverable', true
    locked_adm2 = null

    a2 = parseInt location.getQueryParam 'adm2'

    if a2 then target = "#adm2-#{ a2 }"

    d3.select(target).classed 'hoverable', false


  run = (args...) ->
    load_controls = args[7]

    _g.countries = args[6]

    _country = _g.countries.find (c) -> c['iso3'] is iso3

    document.getElementsByTagName('title')[0].text = "#{ _country['name'] } - Electrification"

    # Params
    #
    admin1 = parseInt location.getQueryParam('adm1')
    admin2 = parseInt location.getQueryParam('adm2')
    load_points = location.getQueryParam('load_points').toBoolean()

    # Data and state
    #
    _d.place['adm0']      = _country['iso3']
    _d.place['adm0_name'] = _country['name']
    _d.place['adm0_code'] = _country['code']

    _d.place['callback'] = [
      'adm1',
      (args...) ->
        if typeof args[2] is 'number'
          summary.fetch()
          $('[data="adm1_name"]').closest('.with-dropdown').show()

        else
          console.log "This adm1 is dodgy: #{ args[2] }. Assuming adm0..."
          $('[data="adm1_name"]').closest('.with-dropdown').hide()
    ]

    _d.place['callback'] = [
      'adm2',
      (args...) ->
        if typeof args[2] is 'number'
          summary.fetch()
          $('[data="adm2_name"]').closest('.with-dropdown').show()

        else
          console.log "This adm2 is dodgy: #{ args[2] }. Assuming adm1..."
          $('[data="adm2_name"]').closest('.with-dropdown').hide()
    ]

    # Map drawing
    #
    adm0 = args[1]
    adm1 = args[2]
    adm2 = args[3]

    existing_transmission = args[4]
    planned_transmission  = args[5]

    load_adm adm1, 'adm1'
      .on 'click', (d) -> load_adm1 this, d

    load_adm adm2, 'adm2'
      .on 'click', (d) -> load_adm2 this, d

    d3.selectAll('path.adm2').style 'display', 'none'

    map.load_topo
      topo: existing_transmission
      cls: 'line'
      pathname: 'existing'
      stroke: 'gold'
      fill: 'none'

    map.load_topo
      topo: planned_transmission
      cls: 'line'
      pathname: 'planned'
      stroke: 'yellow'
      fill: 'none'

    map.setup_drag()


    # Mode and scenario
    #
    mode.init points
    scenario.init points


    # Find self and target...
    #
    # TODO: clean this up.
    #
    target = d3.select (->
      if admin1 > -1 and isNaN(admin2)
        return "#adm1-#{ admin1 }"

      else if admin2 > -1
        return "#adm2-#{ admin2 }"

      else
        return '#container'
    )()

    if admin2 > -1
      _d.place['adm2']      = admin2 || undefined
      _d.place['adm2_name'] = target.datum().properties['name'] || undefined

      admin1 = target.datum().properties['adm1']

      _d.place['adm1']      = admin1 || undefined
      _d.place['adm1_name'] = d3.select("#adm1-#{ admin1 }").datum().properties['name'] || undefined

    else if admin1 > -1
      _d.place['adm1']      = admin1 || undefined
      _d.place['adm1_name'] = target.datum().properties['name'] || undefined


    # Controls
    #
    if (load_controls)
      knob.init()
      navbar.setup()


    # Focus target adm
    #
    # TODO: should be done in a single line...
    #
    show_adm2 admin1

    set_adm1_fills admin1

    reset_adm2 null

    if load_points
      points.load
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
      if error then console.error error
      else
        args = arguments
        (rerun = (load_controls) => run.call this, args..., load_controls)(true)
