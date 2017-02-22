define(['_d', 'd3', 'map', 'pie'], (_d, d3, map, pie) => {
  var iso3 = _u.get_query_param('iso3');

  var aspect_ratios = {
    NGA: 'xMidYMid',
    TZA: 'xMaxYMin',
    ZMB: 'xMaxYMin'
  };

  var techs = [{
    id: 'natural_gas',
    colour: '#566C8C',
    name: "Natural Gas"
  }, {
    id: 'oil',
    colour: "#792B29",
    name: "Oil"
  }, {
    id: 'hydroelectric',
    colour: '#00518E',
    name: "Hydroelectric"
  }, {
    id: 'coal',
    colour: '#000000',
    name: 'Coal'
  }];

  var tech_colours = techs.pluck_p('colour');

  var electrified_colours = [
    '#B4EEB4', // rural access
    '#F69C55', // urban access
    '#5A835A', // rural unelectrified
    '#A1612E'  // urban unelectrified
  ];

  var flag_style = (svg, iso3) => {
    var defs = svg.append('defs');

    defs.append('pattern')
      .attr('id', `flag-${ iso3 }`)
      .attr('x', 0)
      .attr('y', 0)
      .attr('patternUnits', 'objectBoundingBox')
      .attr('width',  1)
      .attr('height', 1)

      .append('image')
      .attr('xlink:href', `/images/${ iso3 }.png`)
      .attr('width',  34)
      .attr('height', 30)
      .attr('preserveAspectRatio', `${ aspect_ratios[iso3.toString()] } slice`);
  };

  var load_flag = (iso3, topo, callback) => {
    _u.tmpl('#svg-template', '#flag-container', iso3);

    var svg = d3.select(`svg#svg-flagged-${ iso3 }`)
        .attr('width',  150)
        .attr('height', 150);

    flag_style(svg, iso3);

    var container = svg.append('g').attr('id', 'container');

    var path = map.load_topo({
      topo: topo,
      cls: 'adm',
      pathname: 'adm0',
      parent: container,
      callback: (path, features) => {
        path
          .attr('fill', `url(#flag-${ iso3 })`)
          .attr('stroke', 'none');

        map.resize_to({
          node: path.node(),
          svg: svg,
          padding: 3,
          parent: container,
          interact: false
        })

        typeof callback === 'function' ? callback.call(this, iso3, path, box) : false
      }
    });
  };

  var bar_chart = (data) => {
    var data = data.filter((e) => +e.value > 0);

    var m = Math.max.apply(null, data.map((e) => e.value));

    var x = d3.scaleLinear()
      .domain([0, m])
      .range([0, 190]);

    var bar_height = 20;
    var h = bar_height + 3;

    var margin = { top: 20, right: 20, bottom: 50, left: 10 };
    var width  = 300 - margin.left - margin.right;
    var height = 150 - margin.top - margin.bottom;

    var svg = d3.select("#breakdown-chart")
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    var graph = svg.append('g')
      .attr('class', 'graph');

    graph.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('width', (d) => x(d.value))
      .attr('height', (d) => bar_height)
      .attr('x', margin.left)
      .attr('y', (d,i) => h * i)
      .attr('fill', (d) => d.colour);

    graph.selectAll('text')
      .data(data)
      .enter().append('text')
      .attr('transform', (d,i) => `translate(${ x(m) + margin.left + 10 }, ${ (h * i) + 12 })`)
      .text((d) => { return (d.value > 0) ? d.name : "" });

    var axis = svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${ margin.left }, ${ (data.length * h) + 3 })`)

    axis.call(d3.axisBottom(x).ticks(6));

    axis.append('text')
      .attr('dy', h * 1.5)
      .attr('x', width / 3)
      .text("TWh");
  };

  var load_indicators = (o,b) => {
    var pt = +o['population_current'];
    var pe = +o['electricity_access_current'];
    var rp = +o['population_rural_current'];               // rural total
    var up = 100 - rp;                                     // urban total

    var re = rp * (+o['electricity_access_rural'] / 100);  // rural electrified
    var ua = up * (+o['electricity_access_urban'] / 100);  // urban electrified

    _d.indicators['country_name'] = o['name'];
    _d.indicators['area'] = (+o['area']).toLocaleString();

    _d.indicators['population-total'] = (pt / 1000000).toFixed(0);
    _d.indicators['gdp']              = (+o['gdp_current']).toFixed(0);

    _d.indicators['population-rural'] = rp.toFixed(2).toLocaleString();
    _d.indicators['population-urban'] = up.toFixed(2).toLocaleString();

    stack_chart("#other-urban-rural-current-access-graph", [{
      tag: "Rural: ",
      value: re, // / (re + ua),
      value2: pt * (re / 100)
    }, {
      tag: "Urban: ",
      value: ua, // / (re + ua),
      value2: pt * (ua / 100)
    }], 60, electrified_colours.slice(0,2))

    bar_chart(techs.map((e) => {
      e.value = b[e.id];
      return e;
    }));
  };

  var stack_chart = (container, data, shift, colours) => {
    var m = data.reduce((a,b) => a + b.value, 0);

    var y = d3.scaleLinear()
        .domain([0, m])
        .range([0, 110]);

    var svg = d3.select(container)
        .append('svg')
        .attr('height', 120)
        .attr('width', 400);

    var bars = svg.selectAll('rect')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'bar')
        .attr('transform', 'translate(0,5)');

    bars.append('rect')
      .attr('class', (d) => d.tag)
      .attr('transform', (d,i) => `translate(${ shift }, ${ (data[i-1]) ? y(data[i-1]['value']) : 0 })`)
      .attr('fill', (d,i) => colours[i])
      .attr('height', (d) => y(d.value))
      .attr('width', 12);

    bars.append('text')
      .attr('x', shift + 20)
      .attr('y', (d,i) => (data[i-1] ? y(data[i-1]['value']) + (y(data[i]['value']) / 2) : 0) + 15)
      .html((d) => `&nbsp; ${ (d.value).toFixed(0).toString() }%  ${ d.tag } ${ (d.value2 / 1000000).toFixed(0).toString() }M people`);
  };

  var load = (iso3, adm0, indicators_collection, breakdown) => {
    var code = _g.countries.find_p('iso3', iso3)['code'].toString();

    load_flag(iso3, adm0);
    load_indicators(
      indicators_collection.find_p('code', code),
      breakdown.find_p('code', code)
    );
  };

  d3.queue()
    .defer(d3.json, `/${ _g.assets }/${ iso3 }-adm0.json`)
    .defer(d3.csv,  `/${ _g.assets }/indicators.csv`)
    .defer(d3.csv,  `/${ _g.assets }/current_electricity_breakdown.csv`)
    .await((error, adm0, indicators_collection, breakdown) => {
      error ?
        _u.network_error() :
        load(iso3, adm0, indicators_collection, breakdown);
    });

  return {
    techs: techs
  };
});
