define(['_d', 'd3', 'pie'], (_d, d3, pie) => {
  var indicators;

  var ticker;

  var population_graph;
  var access_graph;
  var rural_access_graph;
  var rural_population_graph;

  var init = (ind, countries) => {
    ind.forEach((i) => { i['iso3'] = countries.find((x) => x['code'] === parseInt(i['Country Code']))['iso3'] });

    indicators = ind;

    // population graph
    {
      population_graph = (i) => {
        var p2015 = parseFloat(ind[i-1]['POP2015'] / 1000000).toFixed(2);
        var p2030 = parseFloat(ind[i-1]['POP2030'] / 1000000).toFixed(2);

        $('#explore-link').html(`Explore ${ ind[i-1]['Country Name'] } &nbsp; <i class="material-icons float-right">arrow_forward</i>`);
        $('#explore-link').closest('a').attr('href', `/c.html?iso3=${ ind[i-1]['iso3'] }`);

        $('#population-counter').css({
          'font-size': '1em',
          'left': '16%'
        });

        $('.population-final').hide();
        $('#population-counter').show()

        $('#population-counter').animate({
          'font-size': '2em',
          'left': '66%'
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

    // access graph
    {
      var as = [[0], [0]];

      ind.map((x) => {
        var a  = parseFloat(x['Access to electricity (% of population)_2012']);

        as[0].push(a);
        as[1].push(100 - a);
      });

      access_graph = pie.chart("#access-graph", as, 90, ['#7587A6', '#424242']);
    }

    // rural population graph
    {
      var rs = [[0], [0]];

      ind.map((x) => {
        var r  = parseFloat(x['Rural population (% of total population)_2015']);

        rs[0].push(r);
        rs[1].push(100 - r);
      });

      rural_population_graph = pie.chart("#rural-graph", rs, 90, ['#7587A6', '#424242']);
    }

    // rural access graph
    {
      var ras = [[0], [0]];

      ind.map((x) => {
        var ra = parseFloat(x['Access to electricity, rural (% of rural population)']);

        ras[0].push(ra);
        ras[1].push(100 - ra);
      });

      rural_access_graph = pie.chart("#rural-access-graph", ras, 75, ['#7587A6', '#424242']);
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
    var i = _g.countries.indexOf_p('iso3', iso3) + 1;

    population_graph(i);
    access_graph.change(i)
    rural_population_graph.change(i)
    rural_access_graph.change(i)
  };

  return {
    init: init,
    load: load
  };
});
