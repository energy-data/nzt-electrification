define ['utils', 'dictionary'], (u, dictionary) ->
  min_opacity = 0

  hd  = 200

  tc = _g.technologies.map (t) -> return if t then t['color'] else null

  dg = dictionary['grid']

  modes = [{
    type: "technology"
    full: "Technology"
    fill: (g, scn) ->
      return tc[g[scn]]
  }, {
    type: "population"
    full: dg['p_2030']
    fill: (g) ->
      p = g['p_2030']
      o = if (p < hd) then (((p / hd) * (1 - min_opacity)) + min_opacity) else 1

    # TODO: color?
      return "rgba(0,0,0,#{ o })"
  }, {
    type: "w_cf"
    full: dg['w_cf']
    fill: (g, scn) ->
      # TODO: rule?
      return (if g['w_cf'] > 0 then 'black' else 'none')
  }, {
    type: "ghi"
    full: dg['ghi']
    fill: (g, scn) ->
      s = g['ghi']

      # TODO: rule?
      o = if (s < 2200) then (((s / 2200) * (1 - min_opacity)) + min_opacity) else 1
      return "rgba(0,0,0,#{ o })"
  }, {
    type: "hp"
    full: dg['hp']
    fill: (g, scn) ->
      s = g['ghi']

      # TODO: rule?
      o = if (s < 10000) then (((s / 10000) * (1 - min_opacity)) + min_opacity) else 1
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
