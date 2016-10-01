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
      'utils':      'deps': ['js-extras']

require [
  'utils'
  '_g'
  'data'
  'scenario'
  'd3'
  'map'
  'points'
  'summary'
  'mode'
  'knob'
],

(u, _g, data, scenario, d3, map, points, summary, mode, knob) ->
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


  load_adm1 = (it, d) ->
    $('#point-info').fadeOut()

    points.clear true
    reset_adm2 null

    data.place['adm2'] = undefined
    data.place['adm2_name'] = undefined

    history.pushState null, null, location.updateQueryParam('adm1', d['id'])

    if location.getQueryParam 'adm2'
      history.replaceState null, null, location.updateQueryParam('adm2', null)

    history.replaceState null, null, location.updateQueryParam('load_points', false)

    data.place['adm1']      = d['id']
    data.place['adm1_name'] = d.properties['name']

    set_adm1_fills d.id

    map.resize_to
      node: it
      duration: 1000

    show_adm2 d.id


  load_adm2 = (it, d) ->
    return if locked_adm2 is it

    $('#point-info').fadeOut()

    history.pushState null, null, location.updateQueryParam('adm2', d['id'])
    history.replaceState null, null, location.updateQueryParam('load_points', true)

    reset_adm2 it

    locked_adm2 = it

    admin1 = d.properties['adm1']

    data.place['adm1']      = admin1 || undefined
    data.place['adm1_name'] = d3.select("#adm1-#{ admin1 }").datum().properties['name'] || undefined

    data.place['adm2']      = d['id']
    data.place['adm2_name'] = d.properties['name']

    data.place['bbox'] = map.to_bbox it.getBBox()

    points.load
      adm: it.id.match /adm(.*)-(\d*)?/
      svg_box: it.getBBox()

    map.resize_to
      node: it
      duration: 1000


  show_adm2 = (adm1_id) ->
    u.check adm1_id

    d3.selectAll('path.adm2').each (e) ->
      d3.select(this).style 'display', ->
        if e.properties.adm1 is adm1_id then 'block' else 'none'


  reset_adm2 = (target) ->
    d3.selectAll('path.adm2').classed 'hoverable', true
    locked_adm2 = null

    a2 = parseInt location.getQueryParam 'adm2'

    if a2 then target = "#adm2-#{ a2 }"

    d3.select(target).classed 'hoverable', false


  setup_interactions = ->
    $('[data="adm0_name"]').on 'click', ->
      $('#point-info').fadeOut()
      points.clear()

      data.place['adm1'] = undefined
      data.place['adm1_name'] = undefined

      data.place['adm2'] = undefined
      data.place['adm2_name'] = undefined

      map.resize_to
        node: d3.select('#container').node()
        duration: 1000


    $('[data="adm1_name"]').on 'click', ->
      it = d3.select("path#adm1-#{ data.place['adm1'] }").node()

      load_adm1 it, {
        id: data.place['adm1'],
        properties: {
          name: data.place['adm1_name']
        }
      }

      history.replaceState null, null, location.updateQueryParam('load_points', true)

      data.place['bbox'] = map.to_bbox it.getBBox()

      points.load
        adm: [null, 1, data.place['adm1']]
        svg_box: it.getBBox()


    $('#export-summary').on 'click', (e) ->
      e.preventDefault()

      o =
        points_summary: data.summary
        location: data.place

      u.dwnld JSON.stringify(o), 'export-summary.json'


    $('#export-points').on 'click', (e) ->
      e.preventDefault()

      o =
        points_summary: data.summary
        location: data.place

      u.dwnld JSON.stringify(data.point_collection['points']), 'export-points.json'


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
    data.place['adm0']      = _country['iso3']
    data.place['adm0_name'] = _country['name']
    data.place['adm0_code'] = _country['code']

    data.place['callback'] = [
      'adm1',
      (args...) ->
        if typeof args[2] isnt 'number'
          console.log "This adm1 is dodgy: #{ args[2] }. Assuming adm0..."

        else summary.fetch()
    ]

    data.place['callback'] = [
      'adm2',
      (args...) ->
        if typeof args[2] isnt 'number'
          console.log "This adm2 is dodgy: #{ args[2] }. Assuming adm1..."

        else summary.fetch()
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
      color: 'gold'
      fill: 'none'

    map.load_topo
      topo: planned_transmission
      cls: 'line'
      pathname: 'planned'
      color: 'yellow'
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
      data.place['adm2']      = admin2 || undefined
      data.place['adm2_name'] = target.datum().properties['name'] || undefined

      admin1 = target.datum().properties['adm1']

      data.place['adm1']      = admin1 || undefined
      data.place['adm1_name'] = d3.select("#adm1-#{ admin1 }").datum().properties['name'] || undefined

    else if admin1 > -1
      data.place['adm1']      = admin1 || undefined
      data.place['adm1_name'] = target.datum().properties['name'] || undefined


    # Controls
    #
    if (load_controls)
      knob.init()
      setup_interactions()


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
