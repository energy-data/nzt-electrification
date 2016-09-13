define [], () ->
  _g =
    technologies: [ null, {
      id:   "grid"
      name: "Grid"
      color: "#27AE60"
    }, {
      id:   "sa_diesel"
      name: "S.A. Diesel"
      color: "#E74C3C"
    }, {
      id:   "sa_pv"
      name: "S.A. Photo Voltaic"
      color: "#F39C12"
    }, {
      id:   "mg_diesel"
      name: "M.G. Diesel"
      color: "#C0392B"
    }, {
      id:   "mg_pv"
      name: "M.G. Photo Voltaic"
      color: "#F1C40F"
    }, {
      id:   "mg_wind"
      name: "M.G. Wind"
      color: "#ECF0F1"
    }, {
      id:   "mg_hydro"
      name: "M.G. Hydro"
      color: "#2980B9"
    }]

    scenarios: ["l1","l2","l3","l4","l5","n1","n2","n3","n4","n5"]

    bound_objects: ['place', 'grid', 'scenario', 'summary', 'grid_collection']

    assets: 'assets'

    aspect_ratios:
      NGA: 'xMidYMid'
      TZA: 'xMaxYMin'
      ZMB: 'xMaxYMin'

  window._g = _g

  return _g
