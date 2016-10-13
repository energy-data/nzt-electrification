define(['_d', 'd3'], (_d, d3) => {
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
        let p2015 = parseFloat(ind[i-1]['POP2015'] / 1000000).toFixed(2);
        let p2030 = parseFloat(ind[i-1]['POP2030'] / 1000000).toFixed(2);

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
      let as = [[0], [0]];

      ind.map((x) => {
        let a  = parseFloat(x['Access to electricity (% of population)_2012']);

        as[0].push(a);
        as[1].push(100 - a);
      });

      access_graph = pie_chart("#access-graph", as, 90, ['#7587A6', '#424242']);
    }

    // rural population graph
    {
      let rs = [[0], [0]];

      ind.map((x) => {
        let r  = parseFloat(x['Rural population (% of total population)_2015']);

        rs[0].push(r);
        rs[1].push(100 - r);
      });

      rural_population_graph = pie_chart("#rural-graph", rs, 90, ['#7587A6', '#424242']);
    }

    // rural access graph
    {
      let ras = [[0], [0]];

      ind.map((x) => {
        let ra = parseFloat(x['Access to electricity, rural (% of rural population)']);

        ras[0].push(ra);
        ras[1].push(100 - ra);
      });

      rural_access_graph = pie_chart("#rural-access-graph", ras, 75, ['#7587A6', '#424242']);
    }
  };

  var counter = (container, from, to, time, callback) => {
    let i = from;

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

  var pie_chart = (container, data, radius, clrs) => {
    let width =  radius * 2,
        height = radius * 2;

    let pie = d3.pie()
        .value((d) => d[0])
        .sort(null);

    let arc = d3.arc()
        .innerRadius(radius - (radius/4.5))
        .outerRadius(radius - (radius/15));

    let svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${ radius }, ${ radius })`);

    let path = svg
        .datum(data)
        .selectAll("path")
        .data(pie)
        .enter().append("path")
        .attr("fill", (d,i) => clrs[i])
        .attr("d", arc)
        .each(function(d) { this._current = d });

    let text = svg.append("text")
        .attr("dy", ".35em")
        .attr("font-size", `${ radius / 47 }em`)
        .attr("fill", "#424242")
        .attr("class", "monospace")

    function change(v) {
      let t = "";

      pie.value((d) => d[v]);

      path = path.data(pie);

      path
        .transition()
        .duration(750)
        .attrTween("d", tween);

      text
        .text(data[0][v].toFixed(2))

      let box = text.node().getBBox();

      let x = ( - (box['width']  / 2));
      let y = ( + (box['height'] / 10));

      text
        .attr('transform', `translate(${ x }, ${ y })`);

    }

    function tween(a) {
      let i = d3.interpolate(this._current, a);
      this._current = i(0);
      return (t) => arc(i(t));
    };

    return {
      change: change,
      tween: tween,
      path: path
    };
  };

  var load = (iso3) => {
    let i = _g.countries.indexOf_p('iso3', iso3) + 1;

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
