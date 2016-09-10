define [], () ->
  _g =
    technologies: [ null, {
      id:   "grid"
      name: "Grid"
      color: null
    }, {
      id:   "sa_diesel"
      name: "S.A. Diesel"
      color: null
    }, {
      id:   "sa_pv"
      name: "S.A. Photo Voltaic"
      color: null
    }, {
      id:   "mg_diesel"
      name: "M.G. Diesel"
      color: null
    }, {
      id:   "mg_pv"
      name: "M.G. Photo Voltaic"
      color: null
    }, {
      id:   "mg_wind"
      name: "M.G. Wind"
      color: null
    }, {
      id:   "mg_hydro"
      name: "M.G. Hydro"
      color: null
    }]

    scenarios: ["l1","l2","l3","l4","l5","n1","n2","n3","n4","n5"]

    bound_objects: ['place', 'grid', 'scenario', 'summary']

    assets: 'assets'

    aspect_ratios:
      NGA: 'xMidYMid'
      TZA: 'xMaxYMin'
      ZMB: 'xMaxYMin'

  window._g = _g

  return _g
