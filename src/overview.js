define(['_d', 'd3', 'pie'], (_d, d3, pie) => {
  var overviews = {};

  var ticker;

  var population_graph;

  var projection_access_graph;
  var projection_urban_rural_graph;

  var access_graph;
  var urban_rural_graph;


  var init = (indicators, countries) => {
    indicators.forEach((indicator, i) => {
      var iso3 = countries.find_p('code', parseInt(indicator['Country Code']))['iso3'];

      overviews[iso3] = {
        'indicators': indicators[i],
      };
    });

    // population ticker
    //
    {
      population_graph = (i) => {
        var p2015 = parseFloat(ind[i-1]['population_2015'] / 1000000).toFixed(2);
        var p2030 = parseFloat(ind[i-1]['population_2030'] / 1000000).toFixed(2);

        $('#explore-link').html(`Explore ${ ind[i-1]['Country Name'] } &nbsp; <i class="material-icons float-right">arrow_forward</i>`);
        $('#explore-link').closest('a').attr('href', `/c.html?iso3=${ ind[i-1]['iso3'] }`);

        $('#population-counter').css({
          'font-size': '1em',
          'left': '20%'
        });

        // $('.population-final').hide();
        $('#population-counter').show()

        $('#population-counter').animate({
          'font-size': '2em',
          'left': '70%'
        }, 1000);

        counter(
          '#population-counter',
          parseInt(p2015),
          parseInt(p2030),
          1000,
          () => {
            $('#p2015').text(p2015);
            $('#p2030').text(p2030);

            $('.population-final').fadeIn();
            $('#population-counter').fadeOut()
          }
        );
      }
    }

    /////////////////////
    // current graphs: //
    /////////////////////

    // access graph: it will "hug" the urban/rural population  graph
    //
    {
      var as = [[0], [0], [0], [0]];

      indicators.map((x) => {
        var rp = +x['population_rural_current'];
        var ra = rp * (x['electricity_access_rural'] / 100); // rural electricity access from total

        as[0].push(ra);
        as[1].push(x['population_rural_current'] - ra);

        var up = 100 - rp; // urban population

        var ua = (up) * (x['electricity_access_urban'] / 100); // urban electricity access from total

        as[2].push(ua);
        as[3].push((up) - ua);
      });

      access_graph = pie.chart("#urban-rural-current-graph", as, 100, ['#7587A6', '#424242', '#7587A6', '#424242'], " ", true);
    }

    // rural/urban population graph
    //
    {
      var rs = [[0], [0]];

      indicators.map((x) => {
        var r  = parseFloat(x['population_rural_current']);

        rs[0].push(r);        // rural population
        rs[1].push(100 - r);  // urban population
      });

      urban_rural_population_graph = pie.chart("#urban-rural-current-graph", rs, 75, ['#7587A6', '#424242'], " ", false);
    }
    }

    ////////////////////////
    // projection graphs: //
    ////////////////////////

    // access graph: it will "hug" the urban/rural population  graph
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

      projection_access_graph = pie.chart("#urban-rural-projection-graph", as, 100, ['#7587A6', '#424242', '#7587A6', '#424242'], " ", true);
    }

    // rural/urban population graph
    //
    {
      var rs = [[0], [0]];

      indicators.map((x) => {
        var r  = parseFloat(x['population_rural_2030']);

        rs[0].push(r);        // rural population
        rs[1].push(100 - r);  // urban population
      });

      projection_urban_rural_population_graph = pie.chart("#urban-rural-projection-graph", rs, 75, ['#7587A6', '#424242'], " ", false);
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

    population_graph(i);

    access_graph.change(i);
    urban_rural_population_graph.change(i);

    projection_access_graph.change(i);
    projection_urban_rural_population_graph.change(i);
  };

  return {
    init: init,
    load: load
  };
});
