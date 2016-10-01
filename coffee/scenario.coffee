define ['utils', 'summary'], (u, summary) ->
  init = (points) ->
    load_selector()

    data.scenario['scn'] = 'l1'
    data.scenario['tier'] = 1
    data.scenario['diesel_p'] = 'l'

    data.scenario['callback'] = [
      'scn',
      (args...) ->
        if args[2] not in _g.scenarios
          throw Error "This scenario is dodgy: #{ args[2] }"

        else
          summary.fetch()
          points.draw data.point_collection['points']
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


  clear_selector = ->
    $('#scenario-selector select').html ""


  expand = (t) ->
    u.check t[0], t[1]

    str = ""
    str += (if t[0] is "l" then "Low" else "NPS") + " " + t[1]


  load_selector = ->
    clear_selector()

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
      ds['tier']     = parseInt v[1]

    $(sss).val data.scenario['scn']


  return scenario =
    init: init
