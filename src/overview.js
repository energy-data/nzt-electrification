define(['_d', 'd3', 'pie'], (_d, d3, pie) => {
  var overviews = {};

  var population_pies_radiuses = [70, 70]
  var population_growth_factor = 1;

  var current_breakdowns;
  var projection_breakdowns;

  var ticker;

  var urban_rural_colours = ['#B4EEB4', '#F69C55'];
  var electrified_colours = ['#B4EEB4', '#214421', '#F69C55', '#624127'];

  var techs = [{
    id: 'coal',
    colour: '#000000',
    name: 'Coal'
  }, {
    id: 'natural_gas',
    colour: '#566C8C',
    name: "Natural Gas"
  }, {
    id: 'hydroelectric',
    colour: '#00518E',
    name: "Hydroelectric"
  }, {
    id: 'biomass',
    colour: '#79C777',
    name: "Bio-mass"
  }, {
    id: 'diesel',
    colour: '#FF0000',
    name: "Diesel"
  }, {
    id: 'solar_pv',
    colour: '#E6AF00',
    name: "Solar Photo Voltaic"
  }, {
    id: 'solar_csp',
    colour: '#EA4300',
    name: "Concentrated Solar Power"
  }, {
    id: 'wind',
    colour: '#8F77AD',
    name: "Wind"
  }, {
    id: 'geothermal',
    colour: '#C0504D',
    name: "Geothermal"
  }, {
    id: 'oil',
    colour: "#792B29",
    name: "Oil"
  }].sort_p('id');

  var tech_colours = techs.pluck_p('colour');

  var population_graph,
      access_graph,
      gdps_graph,
      urban_rural_population_graph,
      current_breakdown_graph,
      projection_access_graph,
      projection_urban_rural_population_graph,
      projection_breakdown_graph;

  var explore_link = (iso3) => {
    $('#explore-link').find('a').attr('href', `/c.html?iso3=${ iso3 }`);
  };

  var population_graph = (iso3) => {
    var o = overviews[iso3]['indicators'];

    var p2015 = (+o['population_2015'] / 1000000).toFixed(2);
    var p2030 = (+o['population_2030'] / 1000000).toFixed(2);

    $('#p2015').text(p2015);
    $('#p2030').text(p2030);
  };

  var gdps_graph = (iso3) => {
    var o = overviews[iso3]['indicators'];

    var gdp_curr = (+o['gdp_current']).toFixed(2);
    var gdp_2030 = (+o['gdp_2030']).toFixed(2);

    $('#gdp_curr').text(gdp_curr);
    $('#gdp_2030').text(gdp_2030);
  };

  var add_labels = (div, cls, colours, keys, id = "hack") => {
    $(div).append(`<table id="${ id }" class="small ${ cls }"></table>`);

    var table = $(`${ div } table#${ id }`);

    colours.forEach((c,i) => {
      if (keys[i])
        table.append(`<tr><td style="background-color:${ c }">&nbsp;</td><td class="left">${ keys[i] }</td></tr>`);
    });
  };

  var init = (indicators, countries, current_breakdowns, projection_breakdowns) => {
    indicators.forEach((indicator, i) => {
      var iso3 = countries.find_p('code', parseInt(indicator['Country Code']))['iso3'];

      overviews[iso3] = {
        'indicators': indicators[i],
        'current':    current_breakdowns[i],
        'projection': projection_breakdowns[i]
      };
    });

    techs.forEach((t) => {
      t['current']    = Object.keys(current_breakdowns[0]).contains(t['id']);
      t['projection'] = Object.keys(projection_breakdowns[0]).contains(t['id']);
    });

    // current access graph: it will "hug" the urban/rural population  graph
    //
    {
      var as = [[0], [0], [0], [0]];

      indicators.map((x) => {
        var rp = +x['population_rural_current'];               // rural total

        var ra = rp * (x['electricity_access_rural'] / 100);   // rural electrified
        as[0].push(ra);

        var up = 100 - rp;                                     // urban total

        as[1].push(rp - ra);                                   // rural unelectrified

        var ua = (up) * (x['electricity_access_urban'] / 100); // urban electrified
        as[2].push(ua);

        as[3].push((up - ua));                                 // urban unelectrified
      });

      access_graph = pie.chart("#urban-rural-current-access-graph", as, population_pies_radiuses[0], electrified_colours, " ", true);
    }

    // current rural/urban population graph
    //
    {
      var rs = [[0], [0]];

      indicators.map((x) => {
        var r  = parseFloat(x['population_rural_current']);

        rs[0].push(r);        // rural population
        rs[1].push(100 - r);  // urban population
      });

      urban_rural_population_graph = pie.chart("#urban-rural-current-graph", rs, population_pies_radiuses[1], urban_rural_colours, " ", true);
    }

    // current technology breakdown
    //
    {
      var current_techs = techs.filter_p('current', true);
      var ts = Array(current_techs.length).fill(0).map((x,i) => [0]);

      current_breakdowns.map((x) => {
        keys = current_techs.pluck_p('id');
        var k,i;

        for (i = 0; i < keys.length; i++) {
          k = keys[i];

          ts[i].push(+x[k]);
        }
      });

      current_breakdown_graph = pie.chart("#current-breakdown-graph", ts, population_pies_radiuses[0], current_techs.pluck_p('colour'), " ", true);
    }

    //
    //

    // projection access graph: it will "hug" the urban/rural population  graph
    //
    {
      var as = [[0], [0], [0], [0]];

      indicators.map((x) => {
        var rp = +x['population_rural_2030'];
        var ra = rp * (1); // rural electricity access from total

        as[0].push(ra);
        as[1].push(x['population_rural_2030'] - ra);

        var up = 100 - rp; // urban population

        var ua = (up) * (1); // urban electricity access from total

        as[2].push(ua);
        as[3].push((up) - ua);
      });

      add_labels("#population-labels", "population-labels",  electrified_colours, ['Rural Electrified', 'Rural Unelectrified', 'Urban Electrified', 'Urban Unelectrified']);
      add_labels("#population-labels2", "urban-rural-labels", urban_rural_colours, ['Rural', 'Urban'], 'stop');

      projection_access_graph = pie.chart("#urban-rural-projection-access-graph", as, (population_pies_radiuses[0]) * (population_growth_factor), ['#7587A6', '#424242', '#7587A6', '#424242'], " ", true);
    }

    // projection rural/urban population graph
    //
    {
      var rs = [[0], [0]];

      indicators.map((x) => {
        var r  = parseFloat(x['population_rural_2030']);

        rs[0].push(r);        // rural population
        rs[1].push(100 - r);  // urban population
      });

      projection_urban_rural_population_graph = pie.chart("#urban-rural-projection-graph", rs, (population_pies_radiuses[1]) * (population_growth_factor), urban_rural_colours, " ", true);
    }

    // projection technology breakdown
    //
    {
      var projection_techs = techs.filter_p('projection', true);
      var ts = Array(projection_techs.length).fill(0).map((x,i) => [0]);

      projection_breakdowns.map((x) => {
        keys = projection_techs.pluck_p('id');

        var k,i;

        for (i = 0; i < keys.length; i++) {
          k = keys[i];
          ts[i].push(+x[k]);
        }
      });

      projection_breakdown_graph = pie.chart("#projection-breakdown-graph", ts, population_pies_radiuses[0], projection_techs.pluck_p('colour'), " ", true);

      add_labels("#tech-labels",  "tech-labels",  tech_colours.slice(0,5),  techs.slice(0,5).pluck_p('name'));
      add_labels("#tech-labels2", "tech-labels2", tech_colours.slice(5,10), techs.slice(5,10).pluck_p('name'));
    }
  };

  var counter = (container, from, to, time, callback) => {
    var i = from;

    if (ticker) {
      clearInterval(ticker);
      ticker = null;
    }

    ticker = setInterval(() => {
      if (i >= to) {
        if (typeof callback === 'function') callback();
        clearInterval(ticker);
        ticker = null;

        return;
      }

      $(container).text(i+".00");

      i += 1;
    }, parseInt(time/(to - from)));
  };

  var load = (iso3) => {
    var _i = _g.countries.indexof_p('iso3', iso3) + 1;

    explore_link(iso3);

    population_graph(iso3);
    gdps_graph(iso3);

    access_graph.change(_i);
    urban_rural_population_graph.change(_i);
    current_breakdown_graph.change(_i);

    projection_access_graph.change(_i);
    projection_urban_rural_population_graph.change(_i);
    projection_breakdown_graph.change(_i);
  };

  return {
    init: init,
    load: load
  };
});
