define(['d3'], (d3) => {
  var chart = (container, data, outer, inner, colors, inner_text, create = true) => {
    var width =  outer * 2,
        height = outer * 2;

    var pie = d3.pie()
        .value((d) => d[0])
        .sort(null);

    var arc = d3.arc()
        .innerRadius(((inner === null || inner === undefined || inner === false) ? outer - (outer/4) : inner))
        .outerRadius(outer - (outer/15));

    var container = d3.select(container);

    var svg = null;

    if (create) {
      svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);
    }

    else
      svg = container.select('svg');

    var g = null;

    if (! create) {
      g = svg.append("g")
        .attr("transform", `translate(${ svg.attr('width') / 2 }, ${ svg.attr('height') / 2 })`);
    }

    else {
      g = svg.append("g")
        .attr("transform", `translate(${ outer }, ${ outer })`);
    }

    var path = g
        .datum(data)
        .selectAll("path")
        .data(pie)
        .enter().append("path")
        .attr("fill", (d,i) => colors[i])
        .attr("d", arc)
        .each(function(d) { this._current = d });

    var text = svg.append("text")
        .attr("dy", ".35em")
        .attr("font-size", `${ outer / 47 }em`)
        .attr("class", "monospace pie-center")

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

      if (typeof inner_text === "string")
        text.text(inner_text);

      else if (typeof inner_text === "function")
        text.text(inner_text(data, v));

      else
        text.text("");

      try {
        var box = text.node().getBBox();

        var x = (outer - (box['width']  / 2));
        var y = (outer + (box['height'] / 10));

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
