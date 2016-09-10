define ['utils'], (u) ->
  data.scenario['scn'] = 'l1'
  data.scenario['callback'] = [
    'scn',
    (args...) ->
      if args[2] not in _g.scenarios
        throw Error "This scenario is dodgy:", args

      else
        console.info data.place, args[2]
  ]

  expand = (t) ->
    u.check t[0], t[1]

    str = ""
    str += (if t[0] is "l" then "Low" else "NPS") + " " + t[1]


  load_selector = ->
    sss = '#scenario-selector select'

    for t in _g.scenarios
      u.tmpl '#scenario-option-template',
             sss,
             t, expand(t)

    $(sss).on 'change', (e) ->
      v = $(e.target).val()
      ds = data.scenario

      ds['scn']      = v
      ds['diesel_p'] = v[0]
      ds['tier']     = v[1]


  return scenario =
    load_selector: load_selector
