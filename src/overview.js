define(['d3'], (d3) => {
  var d_colors = ["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"];

  var population = (ind, iso3) => {
    let p2015 = (ind['POP2015'] / 1000000);
    let p2030 = (ind['POP2030'] / 1000000);

    _u.tmpl(
      '#population-template',
      `#overview-${ iso3 } .population-graph`,
      p2015.toFixed(2).toLocaleString(),
      p2030.toFixed(2).toLocaleString(),
      _u.tmpl('#person-template', null, 20),
      _u.tmpl('#person-template', null, 20  * (p2030/p2015))
    );
  };

  var pie_chart = (container, data, radius, clrs) => {
    let width =  radius * 2,
        height = radius * 2;

    let colors = clrs;

    if (!clrs) colors = d_colors;

    let color = d3.scaleOrdinal()
        .range(colors);

    let arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 30);

    let labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    let pie = d3.pie()
        .sort(null)
        .value((d) => d);

    let svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    let g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc")
        .attr("stroke", "black")
        .attr("stroke-width", "0.2");

    g.append("path")
      .attr("d", arc)
      .style("fill", (d) => color(d.data));

    svg.append("text")
      .attr("transform", "translate(" + -width/4 + "," + 0 + ")")
      .attr("dy", ".35em")
      .attr("font-size", `${ radius / 47 }em`)
      .attr("class", "monospace")
      .text(parseFloat(data[0]).toFixed(2));
  };

  var access = (ind, iso3) => {
    let data = [
      ind['Access to electricity (% of population)_2012'],
      100 - ind['Access to electricity (% of population)_2012']
    ];

    pie_chart(`#overview-${ iso3 } .access-graph`, data, 70, ['gold', 'white']);
  };

  var rural = (ind,iso3) => {
    let data = [
      ind['Rural population (% of total population)_2015'],
      100 - ind['Rural population (% of total population)_2015']
    ];

    pie_chart(`#overview-${ iso3 } .rural-graph`, data, 70, ['green', 'white']);
  };

  var rural_access = (ind, iso3) => {
    let ra = ind['Access to electricity, rural (% of rural population)'];
    let r  = ind['Rural population (% of total population)_2015']

    let data = [ ra, 100 - ra ];

    pie_chart(`#overview-${ iso3 } .rural-access-graph`,
              data,
              _u.l_scale(ra, [0,100], [50,70]),
              ['gold', 'white']);
  };

  var run = (ind, iso3) => {
    _u.tmpl(
      '#overview-template', '#overview',
      iso3,
      ind['Country Name'],
      parseFloat(ind['Access to electricity (% of population)_2012']).toFixed(2).toLocaleString(),
      parseFloat(ind['Rural population (% of total population)_2015']).toFixed(2).toLocaleString(),
      parseFloat(ind['Access to electricity, rural (% of rural population)']).toFixed(2).toLocaleString()
    );

    population(ind, iso3);
    access(ind, iso3);
    rural(ind, iso3);
    rural_access(ind, iso3);
  };

  return {
    run: run
  };
});
