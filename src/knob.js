define(['d3'], (d3) => {
  var kc = d3.select('#knobs-container');

  var width  = 200;
  var height = 230;

  var center = {
    x: width / 2,
    y: (width / 2) + 20
  };

  var pointer = {};

  var pi = Math.PI;
  var pi2 = 2 * pi;

  var svg = null;

  var steps = 5;

  var tier = 0;

  var min_angle = pi * (1/8);
  var max_angle = pi * (7/8);


  var l_scale = (v, domain, range) => {
    return v < domain[1] ?
      ((v / domain[1]) * (range[1] - range[0])) + range[0] :
      range[1];
  };

  var range = [...Array(5)].map((_,i) => l_scale(i, [0, steps-1], [min_angle, max_angle])).reverse();

  var repoint = (object) => {
    let m = d3.mouse(object)
    // translation to the center and make a decent coordinates system.
    pointer.x =   m[0] - center.x;
    pointer.y = -(m[1] - center.y);
  };

  var closest = (x, arr) => {
    let diffs = arr.map((v) => Math.abs(v - x));
    let i = diffs.indexOf(Math.min.apply(null, diffs));

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

    let polar = cartesian_to_polar(pointer.x, pointer.y);
    let pa    = polar.a;

    if (pa < 0) pa = pa + pi2;

    let c = closest(pa, range);
    let cart = polar_to_cartesian(knob.radius - (width/13), c['v']);

    d3.selectAll(`${ marker } circle`)
      .attr('cx',  cart.x + center.x)
      .attr('cy', -cart.y + center.y);

    tier = c['i'] + 1;
  };

  var do_defs = () => {
    let defs = svg.append('svg:defs');

    let gray = defs.append('linearGradient')
        .attr('id', 'gray')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', '100%');

    gray.append('stop')
      .attr('offset', 0)
      .attr('stop-color', '#e2e2e2');

    gray.append('stop')
      .attr('offset', 1)
      .attr('stop-color', '#bbbbbb');

    let gray_up = defs.append('linearGradient')
        .attr('id', 'gray_up')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', '100%');

    gray_up.append('stop')
      .attr('offset', 0)
      .attr('stop-color', '#b6b6b6');

    gray_up.append('stop')
      .attr('offset', 1)
      .attr('stop-color', '#e2e2e2');
  };

  var draw_knobs = () => {
    let knobs = svg.append('g').attr('id', 'knobs');

    let knob0 = knobs.append('g').attr('id', 'knob0');
    knob0.radius = width * (7/16);

    let base0 = knob0.append('circle')
        .attr('id', 'knob0')
        .attr('r', knob0.radius)
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('stroke', '#b8b8b8')
        .attr('stroke-width', '0.06em')
        .attr('fill', 'url(#gray)');

    let t = range[data.scenario['tier'] - 1];
    let pc = polar_to_cartesian(knob0.radius - (width/13), -t);

    let marker0 = knob0.append('g')
        .attr('id', 'marker0');

    marker0.append('circle')
      .attr('r', width / 20)
      .attr('cx', pc.x + center.x)
      .attr('cy', pc.y + center.y)
      .attr('fill', 'url(#gray_up)')
      .attr('filter', 'url(#shadow)')

    marker0.append('circle')
      .attr('cx', pc.x + center.x)
      .attr('cy', pc.y + center.y)
      .attr('r', width / 70)
      .attr('fill', '#7587A6');

    marker0.call(
      d3.drag()
        .on('drag', function() {
          rotate(this, '#marker0', knob0);
        })
        .on('start', () => { tier = data.scenario['tier'] })
        .on('end', () => {
          if (data.scenario['tier'] !== tier)
            console.log("Changed to tier", data.scenario['tier'] = tier);
        })
    );

    let knob1 = knobs.append('g').attr('id', 'knob1');
    knob1.radius = width * (4/16);

    let base1 = knob1.append('circle')
        .attr('r', knob1.radius)
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('stroke', '#b8b8b8')
        .attr('stroke-width', '0.06em')
        .attr('fill', 'url(#gray)')
        .classed('nps', data.scenario['diesel_p'] !== 'n');

    let knob1_text = knob1.append('text');

    let toggle_nps = () => {
      base1.classed('nps', !base1.classed('nps'));

      if (base1.classed('nps')) {
        knob1_text.text("HIGH");
        base1.attr('fill', 'url(#gray_up)');

        t = 'n';
      }

      else {
        knob1_text.text("LOW");
        base1.attr('fill', 'url(#gray)');

        t = 'l';
      }

      let box = knob1_text.node().getBBox()

      let x = (center.x - (box['width']  / 2));
      let y = (center.y + (box['height'] / 2)) - 5;

      knob1_text
        .attr('transform', `translate(${ x }, ${ y })`);
    };

    knob1
      .on('mousedown', () => { toggle_nps() })
      .on('mouseup',   () => { console.log("Changed to diesel price", data.scenario['diesel_p'] = t) });

    toggle_nps();
  };

  var draw_labels = () => {
    let arc = d3.arc()
        .innerRadius((width * (7/16)))
        .outerRadius((width * (7/16)))
        .startAngle((range.last() - 0.05) - (pi/2))
        .endAngle((range.first() + 0.2) - (pi/2));

    let path = svg.append('path')
        .attr('d', arc)
        .attr('id', 'tier-arc')
        .attr('transform', `translate(${ center.x }, ${ center.y })`)
        .attr('fill', 'none');

    for (let i = 0; i < steps; i++) {
      svg.append('text')
        .attr('x', (48 * i)) // TODO: this 4_ is empirical...
        .attr('dy', -width/21)
        .attr('class', 'tier-label monospace')

        .append('textPath')
        .attr('xlink:href','#tier-arc')
        .text(_g.tiers_power[i])

        .on('click', () => data.scenario['tier'] = (i+1));
    }
  };

  var clear = () => kc.empty();

  var init = () => {
    clear();

    svg = kc.append('svg')
      .attr('width', width)
      .attr('height', height);

    do_defs();

    draw_knobs();

    draw_labels();
  };

  return {
    init: init
  };
});
