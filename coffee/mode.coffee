define ['utils', 'dictionary'], (u, dictionary) ->
  min_opacity = 0

  hd  = 200

  tc = _g.technologies.map (t) -> return if t then t['color'] else null

  dg = dictionary['grid']

  mss = '#mode-selector'

  modes = [{
    type: "technology"
    full: "Technology"
    icon: "blur_circular"
    fill: (g, scn) ->
      return tc[g[scn]]
  }, {
    type: "population"
    full: "Population"
    icon: "people"
    fill: (g) ->
      p = g['p_2030']
      o = if (p < hd) then (((p / hd) * (1 - min_opacity)) + min_opacity) else 1

    # TODO: color?
      return "rgba(0,0,0,#{ o })"
  }, {
    type: "w_cf"
    full: "Wind"
    icon: "cloud"
    fill: (g, scn) ->
      # TODO: rule?
      return (if g['w_cf'] > 0 then 'black' else 'none')
  }, {
    type: "ghi"
    full: "GHI"
    icon: "wb_sunny"
    fill: (g, scn) ->
      s = g['ghi']

      # TODO: rule?
      o = if (s < 2200) then (((s / 2200) * (1 - min_opacity)) + min_opacity) else 1
      return "rgba(0,0,0,#{ o })"
  }, {
    type: "hp"
    full: "Hydro"
    icon: "opacity"
    fill: (g, scn) ->
      s = g['ghi']

      # TODO: rule?
      o = if (s < 10000) then (((s / 10000) * (1 - min_opacity)) + min_opacity) else 1
      return "rgba(0,0,0,#{ o })"
  }]

  init = (grid) ->
    load_selector()

    t = 'technology'

    data.mode['type'] = t
    $("#{ mss } a[bind='#{ t }']").addClass 'active'

    data.mode['callback'] = [
      'type',
      (args...) ->
        if args[2] not in mode.modes.map((m) -> m['type'])
          throw Error "This mode is dodgy:", args

        else
          grid.draw data.grid_collection['grids']
    ]


  clear_selector = ->
    $(mss).html '<ul></ul>'


  fill = (args...) ->
    mm = modes.find (m) -> m['type'] is data.mode['type']

    return mm['fill'].call null, args...


  load_selector = ->
    clear_selector()

    for m in modes
      u.tmpl '#mode-option-template', mss,
             m['type'], m['full'], m['icon']

    $mssa = $(mss + ' a')

    $mssa.on 'click', (e) ->
      e.preventDefault()
      $this = $(this)

      $mssa.removeClass 'active'

      data.mode['type'] = $this.attr 'bind'

      $this.addClass 'active'


  return mode =
    init: init
    modes: modes
    fill: fill
