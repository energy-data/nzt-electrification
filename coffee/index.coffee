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
      'index':      'deps': ['web-extras']
      'utils':      'deps': ['js-extras']

require [
  'utils'
  '_g'
  'd3'
  'topojson'
  'map'
  'js-extras'
  'web-extras'
],

(u, _g, d3, topojson, map) ->
  aspect_ratios =
    NGA: "xMidYMid"
    TZA: "xMaxYMin"
    ZMB: "xMaxYMin"

  assets = 'assets'

  blur_filter = (defs) ->
    filter = defs.append 'filter'
      .attr 'id', 'dropshadow'
      .attr 'width', '130%'
      .attr 'height', '130%'

    filter.append 'feOffset'
      .attr 'result', 'offOut'
      .attr 'in', 'SourceAlpha'
      .attr 'dx', '0'
      .attr 'dy', '1'

    filter.append 'feGaussianBlur'
      .attr 'result', 'blurOut'
      .attr 'in', 'offOut'
      .attr 'stdDeviation', '1.3'

    filter.append 'feBlend'
      .attr 'in', 'SourceGraphic'
      .attr 'in2', 'blurOut'
      .attr 'mode', 'normal'


  wall_flag = (defs, iso3) ->
    defs.append 'pattern'
      .attr 'id', "flag-#{ iso3 }"
      .attr 'x', 0
      .attr 'y', 0
      .attr 'patternUnits', 'objectBoundingBox'
      .attr 'width',  1
      .attr 'height', 1

      .append 'image'
        .attr 'xlink:href', "/images/#{ iso3 }.png"
        .attr 'width',  34
        .attr 'height', 30
        .attr 'preserveAspectRatio', "#{ aspect_ratios[iso3.toString()] } slice"


  load = (iso3, topo, callback) ->
    svg = d3.select "svg#svg-#{ iso3 }"
      .attr 'width', 460
      .attr 'height', 400

    defs = svg.append 'defs'

    wall_flag defs, iso3
    blur_filter defs

    container = svg.append 'g'
      .attr 'id', 'container'

    path = map.load_topo
      topo: topo
      cls: 'adm'
      pathname: 'adm0'
      container: container
      callback: (path, features) ->
        path
          .attr 'fill', "url(#flag-#{ iso3 })"
          .attr 'style', 'filter:url(#dropshadow)'
          .attr 'stroke', 'none'

          .on 'click', ->
            for c in document.getElementsByClassName 'country-selector'
              d3.select(c).style('opacity', 0) if c.id isnt "selector-#{ iso3 }"

            setTimeout (-> window.location = "/c.html?iso3=#{ iso3 }"), 600

        map.resize_to
          node: path.node()
          svg: svg
          duration: 1
          padding: 3
          container: container

        if typeof callback is 'function' then callback.call this, iso3, path, box


  run = (countries) ->
    _g.countries = countries

    size   = 12 / countries.length

    countries.map (c) ->
      iso3 = c['iso3']

      u.tmpl '#selector-template', 'body', iso3, size, c['name']

      d3.queue()
        .defer d3.json, "/#{ assets }/#{ iso3 }-adm0.json"
        .await (error, adm0) ->
          load iso3, adm0


  d3.queue()
    .defer d3.json, "/#{ assets }/countries.json"
    .await (error, countries) ->
      if error then console.error error else run countries
