define(['d3'], (d3) => {
  var chart = (container, data, radius, colors, inner_text) => {
    var width =  radius * 2,
        height = radius * 2;

    var pie = d3.pie()
        .value((d) => d[0])
        .sort(null);

    var arc = d3.arc()
        .innerRadius(radius - (radius/4.5))
        .outerRadius(radius - (radius/15));

    var svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${ radius }, ${ radius })`);

    var path = svg
        .datum(data)
        .selectAll("path")
        .data(pie)
        .enter().append("path")
        .attr("fill", (d,i) => colors[i])
        .attr("d", arc)
        .each(function(d) { this._current = d });

    var text = svg.append("text")
        .attr("dy", ".35em")
        .attr("font-size", `${ radius / 47 }em`)
        .attr("fill", "#424242")
        .attr("class", "monospace")

    function change(v) {
      var t = "";

      pie.value((d) => {
        return t = d[v];
      });
      path = path.data(pie);

      path
        .transition()
        .duration(750)
        .attrTween("d", tween);

      if (inner_text)
        text.text(inner_text);
      else
        text.text(data[0][v].toFixed(2));

      try {
        var box = text.node().getBBox();

        var x = ( - (box['width']  / 2));
        var y = ( + (box['height'] / 10));

        text
          .attr('transform', `translate(${ x }, ${ y })`);
      } catch (e) {
        console.log('due to a bug in FF... return.')
        return;
      }
    }

    function tween(a) {
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return (t) => arc(i(t));
    };

    return {
      change: change,
      tween: tween,
      path: path
    };
  };

  return {
    chart: chart
  };
});
