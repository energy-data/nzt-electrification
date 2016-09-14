define ['utils'], (u) ->
  min_opacity = 0.01

  hd  = 200

  tc = _g.technologies.map (t) -> return if t then t['color'] else null

  modes = [{
    type: "technology"
    full: "Technology"
    fill: (g, scn) ->
      return tc[g[scn]]
  }, {
    type: "population"
    full: "Population 2030"
    fill: (g) ->
      p = g['p_2030']
      o = if (p < hd) then (((p / hd) * (1 - min_opacity)) + min_opacity) else 1

      return "rgba(0,0,0,#{ o })"
  }]

  init = ->
    data.mode['type'] = 'technology'


  fill = (args...) ->
    mm = modes.find (m) -> m['type'] is data.mode['type']

    return mm['fill'].call null, args...


  load_selector = ->
    mss = '#mode-selector select'

    for m in modes
      u.tmpl '#mode-option-template',
             mss,
             m['type'], m['full']

    $(mss).on 'change', (e) ->
      v = $(e.target).val()

      data.mode['type'] = v

    $(mss).val data.mode['type']


  return mode =
    init: init
    modes: modes
    fill: fill
    load_selector: load_selector
