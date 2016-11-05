define(['d3'], (d3) => {
  // o.tech is NOT an index. It matches a scenario technology.
  _g = {
    technologies: [{
      tech: 1,
      id:   "grid",
      name: "Grid",
      color: "#528885"
    }, {
      tech: 2,
      id:   "sa_diesel",
      name: "S.A. Diesel",
      color: "#FF7364"
    }, {
      tech: 3,
      id:   "sa_pv",
      name: "S.A. Photo Voltaic",
      color: "#FFD38C"
    }, {
      tech: 4,
      id:   "mg_diesel",
      name: "M.G. Diesel",
      color: "#D13A36"
    }, {
      tech: 5,
      id:   "mg_pv",
      name: "M.G. Photo Voltaic",
      color: "#E6AF00"
    }, {
      tech: 6,
      id:   "mg_wind",
      name: "M.G. Wind",
      color: "#8F77AD"
    }, {
      tech: 7,
      id:   "mg_hydro",
      name: "M.G. Hydro",
      color: "#00518E"
    }],

    scenarios: ['l1', 'l2', 'l3', 'l4', 'l5', 'n1', 'n2', 'n3', 'n4', 'n5'],

    modes: [{
      type: "technology",
      full: "Technology",
      icon: "blur_circular",
      group: "technology",
      fill: (e, scn) => _g.technologies.find_p('tech', e[scn])['color']
    }, {
      type: "lcoe",
      full: "Levelised Cost",
      icon: "attach_money",
      group: "technology",
      param: 'lc_',
      scale: [0, 1.15],
      fill: (g, scn, param, scale) => {
        return d3.scaleLinear()
          .domain(scale)
          .range(["#006100", "#FF2200"])(g[param + scn])
      },
    }, {
      type: "ic",
      full: "Investment Cost",
      icon: "attach_money",
      group: "technology",
      param: 'ic_',
      scale: [0, 100000],
      fill: (g, scn, param, scale) => {
        return d3.scaleLinear()
          .domain(scale)
          .range(["#FAE9D4", "#AB4124"])(g[param + scn])
      },
    }, {
      type: "nc",
      full: "Added Capacity",
      icon: "lightbulb_outline",
      group: "technology",
      param: 'nc',
      scale: [0, 1000],
      fill: (g, scn, param, scale) => {
        return d3.scaleLinear()
          .domain(scale)
          .range(["#FAE9D4", "#AB4124"])(g[param])
      }
    }, {
      type: "population",
      full: "Population",
      icon: "people",
      group: "demographics",
      param: 'p_2030',
      scale: [0, 1000],
      fill: (g, scn, param, scale) => {
        return d3.scaleLinear()
          .domain(scale)
          .range(["#D8F2ED", "#154F4A"])(g[param])
      },
      stroke: "lightgray",
      stroke_width: 0.001
    }, {
      type: "urban-rural",
      full: "Urban/Rural",
      icon: "nature_people",
      group: "demographics",
      fill: (e) => e['u'] ? '#F69C55' : '#B4EEB4'
    }, {
      type: "ghi",
      full: "GHI",
      icon: "wb_sunny",
      group: "resources",
      param: 'ghi',
      scale: [1979, 2500],
      fill: (g, scn, param, scale) => {
        return d3.scaleLinear()
          .domain(scale)
          .range(["yellow", "red"])(g[param])
      }
    }, {
      type: "w_cf",
      full: "Wind",
      icon: "cloud",
      group: "resources",
      param: 'w_cf',
      scale: [0, 0.4],
      fill: (g, scn, param, scale) => `rgba(0, 80, 255, ${ _u.l_scale(g[param], scale) })`,
      stroke: "rgba(0, 80, 255, 0.4)",
      stroke_width: 0.001
    }, {
      type: "hp",
      full: "Hydro",
      icon: "opacity",
      group: "resources",
      param: 'hp',
      scale: [0, 10000000],
      fill: (g, scn, param, scale) => {
        return d3.scaleLinear()
          .domain(scale)
          .range(["#B6EDF0", "#090991"])(g[param])
      }
    }, {
      type: "rd",
      full: "Road Distance",
      icon: "directions_car",
      group: "infrastructure",
      param: 'rd',
      scale: [0, 200],
      fill: (g, scn, param, scale) => {
        return d3.scaleLinear()
          .domain(scale)
          .range(["#006100", "#FF2200"])(g[param])
      },
    }, {
      type: "gd_c",
      full: "Current GD",
      icon: "timeline",
      group: "infrastructure",
      param: 'gd_c',
      scale: [0, 100],
      fill: (g, scn, param, scale) => `rgba(0, 0, 0, ${ _u.l_scale(g[param], scale) })`
    }, {
      type: "gd_p",
      full: "Planned GD",
      icon: "timeline",
      group: "infrastructure",
      param: 'gd_p',
      scale: [0, 100],
      fill: (g, scn, param, scale) => `rgba(0, 0, 0, ${ _u.l_scale(g[param], scale) })`
    }, {
      type: "lcsa",
      full: "SA LCOE",
      icon: "local_gas_station",
      group: "infrastructure",
      param: 'lcsa_',
      scale: [0.35, 1.85],
      fill: (g) => {
        return d3.scaleLinear()
          .domain(_d.scenario['diesel_p'] === 'l' ? [0.35, 0.89] : [0.63, 1.85])
          .range(["#006100", "#FF2200"])(g['lcsa_' + _d.scenario['diesel_p']]);
      },
      stroke: "rgba(105, 70 ,50, 0.2)",
      stroke_width: 0.001
    }],

    bound_objects: [{
      name: 'place',
      scope: null
    }, {
      name: 'point',
      scope: 'point-info'
    }, {
      name: 'scenario',
      scope: null
    }, {
      name: 'summary',
      scope: 'summary-info'
    }, {
      name: 'point_collection',
      scope: null
    }, {
      name: 'mode',
      scope: null
    }, {
      name: 'access',
      scope: null
    }],

    assets: 'assets',

    countries: [{
      "name": "Nigeria",
      "code":  566,
      "iso3": "NGA"
    }, {
      "name": "United Republic of Tanzania",
      "code":  834,
      "iso3": "TZA"
    }, {
      "name": "Zambia",
      "code":  894,
      "iso3": "ZMB"
    }],

    point_attrs: ['x','y','cc','p_2030','nc','gd_c','gd_p','rd','ghi','w_cf','hp','hp_d','lcsa_l', 'lcsa_n','u','l1','l2','l3','l4','l5','n1','n2','n3','n4','n5','lc_l1','lc_l2','lc_l3','lc_l4','lc_l5','lc_n1','lc_n2','lc_n3','lc_n4','lc_n5','c_l1','c_l2','c_l3','c_l4','c_l5','c_n1','c_n2','c_n3','c_n4','c_n5','ic_l1','ic_l2','ic_l3','ic_l4','ic_l5','ic_n1','ic_n2','ic_n3','ic_n4','ic_n5']
  };

  return (window._g = _g);
});
