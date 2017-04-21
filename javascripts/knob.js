define(['d3'], (d3) => {
  var kc = null;

  var svg = null;

  var total_width = 250;

  var width = 0;
  var height = 0;

  var center = null

  var pointer = {};

  var knob0_radius = 0;
  var knob1_radius = 0;

  var pi = Math.PI;
  var pi2 = 2 * pi;

  var steps = 5;

  var tier = 0;

  var min_angle = pi * (1/8);
  var max_angle = pi * (7/8);

  var range = [...Array(5)].map((_,i) => _u.l_scale(i, [0, steps-1], [min_angle, max_angle])).reverse();

  var repoint = (object) => {
    var m = d3.mouse(object)
    // translation to the center and make a decent coordinates system.
    pointer.x =   m[0] - center.x;
    pointer.y = -(m[1] - center.y);
  };

  var closest = (x, arr) => {
    var diffs = arr.map((v) => Math.abs(v - x));
    var i = diffs.indexOf(Math.min.apply(null, diffs));

    return {
      v: arr[i],
      i: i
    };
  };

  var cartesian_to_polar = (x, y) => {
    return {
      r: Math.sqrt(x*x + y*y),
      a: Math.atan2(y, x)
    };
  };

  var polar_to_cartesian = (radius, angle) => {
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    };
  };

  var rotate = (object, marker, knob) => {
    repoint(object);

    var polar = cartesian_to_polar(pointer.x, pointer.y);
    var pa    = polar.a;

    if (pa < 0) pa = pa + pi2;

    var c = closest(pa, range);
    var cart = polar_to_cartesian(knob0_radius - (width/13), c['v']);

    d3.selectAll(`${ marker } circle`)
      .attr('cx',  cart.x + center.x)
      .attr('cy', -cart.y + center.y);

    return c['i'] + 1;
  };

  var clear = () => kc.empty();

  var init = () => {
    tier = _d.scenario['tier'];

    kc = d3.select('#knobs-container');

    width  = total_width - 60;
    height = total_width;

    knob0_radius = width * (8/16);
    knob1_radius = width * (5/16);

    center = {
      x: (total_width / 2),
      y: (total_width / 2) + 20
    };

    clear();

    svg = kc.append('svg')
      .attr('width', total_width)
      .attr('height', height);

    // definitions
    {
      var defs = svg.append('svg:defs');

      var gray = defs.append('linearGradient')
          .attr('id', 'gray')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', '100%');

      gray.append('stop')
        .attr('offset', 0)
        .attr('stop-color', '#eeeeee');

      gray.append('stop')
        .attr('offset', 1)
        .attr('stop-color', '#dddddd');

      var gray_up = defs.append('linearGradient')
          .attr('id', 'gray_up')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', '100%');

      gray_up.append('stop')
        .attr('offset', 0)
        .attr('stop-color', '#dddddd');

      gray_up.append('stop')
        .attr('offset', 1)
        .attr('stop-color', '#eeeeee');
    }

    // knobs
    {
      var knobs = svg.append('g').attr('id', 'knobs');

      var knob0 = knobs.append('g').attr('id', 'knob0');

      var knob1 = knobs.append('g').attr('id', 'knob1');

      var base0 = knob0.append('circle')
          .attr('id', 'knob0')
          .attr('r', knob0_radius)
          .attr('cx', center.x)
          .attr('cy', center.y)
          .attr('stroke', '#b8b8b8')
          .attr('stroke-width', '0.06em')
          .attr('fill', 'url(#gray)');

      var base1 = knob1.append('circle')
          .attr('r', knob1_radius)
          .attr('cx', center.x)
          .attr('cy', center.y)
          .attr('stroke', '#b8b8b8')
          .attr('stroke-width', '0.06em')
          .attr('fill', 'url(#gray)')
          .classed('nps', _d.scenario['diesel_p'] !== 'n');

      // knob0 marker
      {
        var t = range[tier - 1];
        var pc = polar_to_cartesian(knob0_radius - (width/13), -t);

        var marker0 = knob0.append('g').attr('id', 'marker0');

        marker0.append('circle')
          .attr('r', width / 20)
          .attr('cx', pc.x + center.x)
          .attr('cy', pc.y + center.y)
          .attr('fill', 'url(#gray_up)');

        marker0.append('circle')
          .attr('cx', pc.x + center.x)
          .attr('cy', pc.y + center.y)
          .attr('r', width / 70)
          .attr('fill', '#7587A6');

        marker0.call(
          d3.drag()
            .on('drag', function() { rotate(this, '#marker0', knob0) })
            .on('end', change_tier)
        );
      }

      // knob1 icon:
      {
        var knob1_icon = knob1.append('text')
            .attr('id', 'diesel_p')
            .attr('class', 'material-icons')
            .text("local_gas_station");

        var box = knob1_icon.node().getBBox()

        var x = (center.x - 12) - 2;
        var y = (center.y + (box['height'] / 2)) - 20;

        knob1_icon
          .attr('transform', `translate(${ x }, ${ y })`);
      }

      // knob1 text:
      {
        var knob1_text = knob1.append('text')
            .attr('class', 'text');

        var toggle_nps = () => {
          base1.classed('nps', !base1.classed('nps'));

          if (base1.classed('nps')) {
            knob1_text.text("$0.82 L");
            base1.attr('fill', 'url(#gray_up)');

            p = 'n';
          }

          else {
            knob1_text.text("$0.34 L");
            base1.attr('fill', 'url(#gray)');

            p = 'l';
          }

          var box = knob1_text.node().getBBox()

          var x = (center.x - (box['width']  / 2));
          var y = (center.y + (box['height'] / 2)) + 12;

          knob1_text
            .attr('transform', `translate(${ x }, ${ y })`);
        };

        knob1
          .on('mousedown', () => { toggle_nps() })
          .on('mouseup',   () => { change_price(p) });

        toggle_nps();
      }
    }

    // icons
    {
      for (var i = 0; i < steps; i++) {
        var cart = polar_to_cartesian(knob0_radius + 19, range[i]);

        var it = document.getElementById(`icon-${ i+1 }`).innerHTML;

        var cont = svg.append('g')
            .attr('class', 'tier-label')
            .attr('id',  `tier-label-${ i+1 }`)

        cont.append('g')
          .html(it)
          .attr('stroke', '#7587A6')
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('transform', `translate(${ cart.x + center.x - 15 }, ${ -cart.y + center.y - 20 })scale(0.6)`);

        cont.append('rect')
          .attr('class', 'pointer')
          .attr('fill', 'transparent')
          .attr('fill-opacitiy', 1)
          .attr('stroke', 'none')
          .attr('width', 30)
          .attr('height', 30)
          .attr('x', cart.x + center.x - 15)
          .attr('y', -cart.y + center.y - 20)
          .on('click', change_tier);
      };
    }

    d3.select(`#tier-label-${ tier }`).classed('active', true);
  };

  var change_tier = () => {
    tier = rotate(d3.select('#marker0').node(), '#marker0', d3.select('#knob0'));

    d3.selectAll('.tier-label').classed('active', false);

    if (_d.scenario['tier'] !== tier)
      console.log("Changed to tier", _d.scenario['tier'] = tier);

    d3.select(`#tier-label-${ tier }`).classed('active', true);
  };

  var change_price = (p) => {
    if (_d.scenario['diesel_p'] !== p)
      console.log("Changed to diesel price", _d.scenario['diesel_p'] = p);
  };

  return {
    init: init,
    total_width: total_width
  };
});
