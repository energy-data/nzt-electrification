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

    bound_objects: ['place', 'grid', 'scenario', 'summary', 'grid_collection', "mode"]

    assets: 'assets'

    grid_attrs: ['x','y','cc','p_2030','nc','gd_c','gd_p','rd','ghi','w_cf','hp','hp_d','u','l1','l2','l3','l4','l5','n1','n2','n3','n4','n5','lc_l1','lc_l2','lc_l3','lc_l4','lc_l5','lc_n1','lc_n2','lc_n3','lc_n4','lc_n5','c_l1','c_l2','c_l3','c_l4','c_l5','c_n1','c_n2','c_n3','c_n4','c_n5','ic_l1','ic_l2','ic_l3','ic_l4','ic_l5','ic_n1','ic_n2','ic_n3','ic_n4','ic_n5']

    aspect_ratios:
      NGA: 'xMidYMid'
      TZA: 'xMaxYMin'
      ZMB: 'xMaxYMin'

  window._g = _g

  return _g
