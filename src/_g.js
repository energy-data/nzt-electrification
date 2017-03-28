define(['d3'], (d3) => {
  // o.tech is NOT an index. It matches a scenario technology.
  _g = {
    technologies: [{
      tech: 1,
      id:   "grid",
      name: "Grid",
      color: "#528885"
    }, {
      tech: 3,
      id:   "sa_pv",
      name: "S.A. Photo Voltaic",
      color: "#FFD38C"
    }, {
      tech: 2,
      id:   "sa_diesel",
      name: "S.A. Diesel",
      color: "#FF7364"
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
    }, {
      tech: 4,
      id:   "mg_diesel",
      name: "M.G. Diesel",
      color: "#D13A36"
    }],

    scenarios: ['l1', 'l2', 'l3', 'l4', 'l5', 'n1', 'n2', 'n3', 'n4', 'n5'],

    modes: [{
      type: "technology",
      full: "Technology",
      icon: "blur_circular",
      group: "technology",
      points: true,
      fill: (e, scn) => _g.technologies.find_p('tech', e[scn])['color']
    }, {
      type: "lcoe",
      full: "Levelised Cost",
      icon: "attach_money",
      group: "technology",
      param: 'lc_',
      scale: [0, 0.4],
      points: true,
      fill: (g, scn, param, scale) => {
        return d3.scaleLinear()
          .domain(scale)
          .range(["#00ff00", "#FF0000"])(g[param + scn])
      },
    }, {
      type: "ic",
      full: "Investment Cost",
      icon: "attach_money",
      group: "technology",
      param: 'ic_',
      scale: [0, 100000],
      points: true,
      fill: (g, scn, param, scale) => {
        return d3.scaleLinear()
          .domain(scale)
          .range(["#FAE9D4", "#AB4124"])(g[param + scn])
      },
    }, {
      type: "need",
      full: "Investment Needs per Capita",
      icon: "attach_money",
      group: "technology",
      param: 'poverty',
      scale: [500, 3000],
      points: false,
      draw: () => {
        var adm_type, regions;
        var url = _conf['data_source'];

        if (_u.get_query_param('adm1')) {
          adm_type = 'adm2';
          regions = poverty_data
            .filter_p('adm1', +_u.get_query_param('adm1'))
            .pluck_p('adm2')
            .unique()
            .sort((a,b) => a - b);

          if (_conf['source_type'] === 'api') {
            url += `/adm2_records?` +
              `&cc=eq.${ _d.place['adm0_code'] }` +
              `&adm=in.${ regions.toString() }` +
              `&scn=eq.${ _d.scenario['scn'] }`;
          }

          else if (_conf['source_type'] === 'static') {
            url += `/summaries/` +
              adm_type +
              `-${ _d.place['adm0_code'] }` +
              `-${ _d.scenario['scn'] }` +
              `--${ regions.join('-') }.json`;
          }
        }

        else {
          adm_type = 'adm1';
          regions = poverty_data
            .pluck_p('adm1')
            .unique()
            .sort((a,b) => a - b);

          if (_conf['source_type'] === 'api') {
            url += `adm1_records?` +
              `&cc=eq.${ _d.place['adm0_code'] }` +
              `&adm=in.${ regions.toString() }` +
              `&scn=eq.${ _d.scenario['scn'] }`;
          }

          else if (_conf['source_type'] === 'static') {
            url += `/summaries/` +
              adm_type +
              `-${ _d.place['adm0_code'] }` +
              `-${ _d.scenario['scn'] }` +
              `--${ regions.join('-') }.json`;
          }
        }

        d3.queue()
          .defer(d3.json, url)
          .await((err, response) => {
            var needs_data = response.map((e) => {
              var o = {};
              var connections = e['results'].reduce((a,b) => a + b['connections'], 0);
              var investments = e['results'].reduce((a,b) => a + b['investments'], 0);

              o[adm_type]      = e['adm'];
              o['connections'] = connections;
              o['investments'] = investments;
              o['need']        = investments/connections;

              return o;
            });

            adm.set_adm_fills(needs_data, adm_type, 'need');
          });

        $('.loading').fadeOut();
      },
      fill: (e, scn, param, scale) => {
        return d3.scaleLinear()
          .domain([500, 3000])
          .range(["#FAE9D4", "#AB4124"])(e[param])
      }
    }, {
      type: "ac",
      full: "Added Capacity",
      icon: "lightbulb_outline",
      group: "technology",
      param: 'c_',
      scale: [0, 100000],
      points: true,
      fill: (g, scn, param, scale) => {
        return d3.scaleLinear()
          .domain(scale)
          .range(["#FAE9D4", "#AB4124"])(g[param + scn])
      }
    }, {
      type: "population",
      full: "Population",
      icon: "people",
      group: "demographics",
      param: 'p_2030',
      points: true,
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
      points: true,
      fill: (e) => e['u'] ? '#F69C55' : '#B4EEB4'
    }, {
      type: "poverty",
      full: "Poverty",
      icon: "language", // pan_tool, report_problem, language, remove_circle_outline
      group: "demographics",
      param: 'poverty',
      scale: [0, 1],
      points: false,
      draw: () => {
        if (_u.get_query_param('adm1'))
          adm.set_adm_fills(poverty_data.filter_p('adm1', +_u.get_query_param('adm1')), 'adm2', 'poverty');

        else {
          var group = poverty_data.group_p('adm1');
          var keys = Object.keys(group);
          var i;

          adm0_data = [];

          for (i = 0; i < keys.length; i++) {
            adm0_data.push({
              adm1: +keys[i],
              poverty: group[keys[i]].reduce((a,b) => { return (b['poverty'] * b['population']) + a }, 0) /
                group[keys[i]].reduce((a,b) => { return b['population'] + a }, 0)
            });
          }

          adm.set_adm_fills(adm0_data, 'adm1', 'poverty');
        }

        $('.loading').fadeOut();
      },
      fill: (e, scn, param, scale) => {
        return d3.scaleLinear()
          .domain([0, 1])
          .range(["yellow", "red"])(e[param])
      }
    }, {
      type: "ghi",
      full: "GHI",
      icon: "wb_sunny",
      group: "resources",
      param: 'ghi',
      scale: [1979, 2500],
      points: true,
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
      points: true,
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
      points: false, // we do draw points but it's another dataset, so no.
      draw: () => {
        points.fetch({
          box: map.to_bbox(d3.select('#paths-adm1').node().getBBox()),
          adm: "",
          callback: (col) => {
            _d.point_collection['points'] = col;
            points.draw('hp');
          }
        });
      },
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
      points: true,
      fill: (g, scn, param, scale) => {
        return d3.scaleLinear()
          .domain(scale)
          .range(["white", "black"])(g[param])
      },
    }, {
      type: "gd_c",
      full: "Current Grid Distance",
      icon: "timeline",
      group: "infrastructure",
      param: 'gd_c',
      scale: [0, 100],
      points: true,
      fill: (g, scn, param, scale) => `rgba(0, 0, 0, ${ _u.l_scale(g[param], scale) })`
    }, {
      type: "gd_p",
      full: "Planned Grid Distance",
      icon: "timeline",
      group: "infrastructure",
      param: 'gd_p',
      scale: [0, 100],
      points: true,
      fill: (g, scn, param, scale) => `rgba(0, 0, 0, ${ _u.l_scale(g[param], scale) })`
    }, {
      type: "lcsa",
      full: "SA LCOE",
      icon: "local_gas_station",
      group: "infrastructure",
      param: 'lcsa_',
      scale: [0.35, 1.85],
      points: true,
      fill: (g) => {
        return d3.scaleLinear()
          .domain(_d.scenario['diesel_p'] === 'l' ? [0.35, 0.89] : [0.63, 1.85])
          .range(["#FFFFFF", "#FF0000"])(g['lcsa_' + _d.scenario['diesel_p']]);
      },
      stroke: "rgba(105, 70 ,50, 0.2)",
      stroke_width: 0.001
    }],

    bound_objects: [{
      name: 'indicators',
      scope: 'overview-modal'
    }, {
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
