define(['d3'], (d3) => {
  var width  = 200;
  var height = 200;

  var center = {
    x: width / 2,
    y: height / 2
  };

  var pointer = {};

  var pi = Math.PI;
  var pi2 = 2 * pi;
  // var min_angle = (-2*pi) * (5/8);
  // var max_angle = (-2*pi) * (7/8);

  var svg = null;
  var knobs = null;

  var steps = 5;

  var min_angle = 0;
  var max_angle = pi;

  var domain = (-max_angle) - (-min_angle);
  var step_w = domain / steps;

  var l_scale = (v, domain = [0, steps-1], range = [min_angle, max_angle]) => {
    return v < domain[1] ?
      ((v / domain[1]) * (range[1] - range[0])) + range[0] :
      range[1];
  };

  var range = [...Array(5)].map((_,i) => l_scale(i));

  var repoint = (object) => {
    // translation to the center and make a decent coordinates system.
    pointer.x =  d3.mouse(object)[0] - center.x;
    pointer.y = (d3.mouse(object)[1] - center.y) * (-1);
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

  var rotate = (object, marker, knob, color) => {
    repoint(object);

    var polar = cartesian_to_polar(pointer.x, pointer.y);
    var pa    = polar.a;

    if (pa < 0) pa = pa + pi2;

    var c = closest(pa, range);
    var cart = polar_to_cartesian(knob.radius - (width/13), c['v']);

    var t = c['i'] + 1;

    if (data.scenario['tier'] !== t)
      console.log("Switching to tier", data.scenario['tier'] = t);

    d3.select(marker)
      .attr('cx',  cart.x + center.x)
      .attr('cy', -cart.y + center.y);

    d3.select(color)
      .attr('cx',  cart.x + center.x)
      .attr('cy', -cart.y + center.y);
  };

  var do_defs = () => {
    var defs = svg.append('svg:defs');

    var gray = defs.append('linearGradient')
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
      .attr('stop-color', '#cccccc');

    var gray_up = defs.append('linearGradient')
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

    var inner_bevel = defs.append('filter')
        .attr('id', 'inner_bevel')
        .attr('x0', '0%')
        .attr('x1', '0%')
        .attr('y0', '250%')
        .attr('x1', '100%')
        .attr('width', '200%')
        .attr('height', '200%');

    inner_bevel.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3)
      .attr('result', 'blur');

    inner_bevel.append('feOffset')
      .attr('dy', -2)
      .attr('dx0', -2);

    inner_bevel.append('feComposite')
      .attr('in2', 'SourceAlpha')
      .attr('operator', 'arithmetic')
      .attr('k2', -1)
      .attr('k3',  1)
      .attr('result', 'hlDiff');

    inner_bevel.append('feFlood')
      .attr('flood-color', 'black')
      .attr('flood-opacity', 0.35);

    inner_bevel.append('feComposite')
      .attr('in2', 'hlDiff')
      .attr('operator', 'in');

    inner_bevel.append('feComposite')
      .attr('in2', 'SourceGraphic')
      .attr('operator', 'over')
      .attr('result', 'withGlow');

    inner_bevel.append('feOffset')
      .attr('in', 'blur')
      .attr('dy',  1)
      .attr('dx0', 1);

    inner_bevel.append('feComposite')
      .attr('in2', 'SourceAlpha')
      .attr('operator', 'arithmetic')
      .attr('k2', -1)
      .attr('k3',  1)
      .attr('result', 'shadowDiff');

    inner_bevel.append('feFlood')
      .attr('flood-color', 'white')
      .attr('flood-opacity', 0.6);

    inner_bevel.append('feComposite')
      .attr('in2', 'shadowDiff')
      .attr('operator', 'in');

    inner_bevel.append('feComposite')
      .attr('in2', 'withGlow')
      .attr('operator', 'over');

    var shadow = defs.append('filter')
        .attr('id', 'shadow')
        .attr('x0', '0%')
        .attr('x1', '0%')
        .attr('y0', '250%')
        .attr('y1', '100%')
        .attr('width', '200%')
        .attr('height', '200%');

    shadow.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', '1')
      .attr('result', 'blur');

    shadow.append('feOffset')
      .attr('dy',  -2)
      .attr('dx0', -2);

    shadow.append('feComposite')
      .attr('in2', 'SourceAlpha')
      .attr('operator', 'arithmetic')
      .attr('k2', -1)
      .attr('k3',  1)
      .attr('result', 'hlDiff');

    shadow.append('feFlood')
      .attr('flood-color', 'white')
      .attr('flood-opacity', 0.2);

    shadow.append('feComposite')
      .attr('in2', 'hlDiff')
      .attr('operator', 'in');

    shadow.append('feComposite')
      .attr('in2', 'SourceGraphic')
      .attr('operator', 'over')
      .attr('result', 'withGlow');

    shadow.append('feOffset')
      .attr('in', 'blur')
      .attr('dy',  5)
      .attr('dx0', 5);

    shadow.append('feComposite')
      .attr('in2', 'SourceAlpha')
      .attr('operator', 'arithmetic')
      .attr('k2', -1)
      .attr('k3',  1)
      .attr('result', 'shadowDiff');

    shadow.append('feFlood')
      .attr('flood-color', 'black')
      .attr('flood-opacity', 0.02);

    shadow.append('feComposite')
      .attr('in2', 'shadowDiff')
      .attr('operator', 'in');

    shadow.append('feComposite')
      .attr('in2', 'withGlow')
      .attr('operator', 'over');
  };

  var init = () => {
    svg = d3.select('div#knobs-container').append('svg')
      .attr('width', width)
      .attr('height', height)
      .on('mousemove', () => repoint(svg.node()))
      .on('mousedown', () => repoint(svg.node()));

    knobs = svg.append('g').attr('id', 'knobs');
  };

  var draw_knobs = () => {
    var knob0 = knobs.append('g').attr('id', 'knob0');
    knob0.radius = width * (7/16);

    var base0 = knob0.append('circle')
        .attr('id', 'knob0')
        .attr('r', knob0.radius)
        .attr('cx', width / 2)
        .attr('cy', width / 2)
        .attr('stroke', '#b8b8b8')
        .attr('stroke-width', '0.06em')
        .attr('fill', 'url(#gray)')
        .attr('filter', 'url(#inner_bevel)');

    var marker0 = knob0.append('g');
    var t = min_angle + range[0];

    var pc = polar_to_cartesian(knob0.radius - (width/13), t);

    marker0.append('circle')
      .attr('id', 'marker0')
      .attr('r', width / 20)
      .attr('cx', pc.x + center.x)
      .attr('cy', pc.y + center.y)
      .attr('fill', 'url(#gray_up)')
      .attr('filter', 'url(#shadow)')
      .call(d3.drag().on('drag', function() {
        rotate(this, '#marker0', knob0, '#yellow');
      }));

    marker0.append('circle')
      .attr('id', 'yellow')
      .attr('cx', pc.x + center.x)
      .attr('cy', pc.y + center.y)
      .attr('r', width / 70)
      .attr('fill', '#e49b12')
      .call(d3.drag().on('drag', function() {
        rotate(this, '#marker0', knob0, '#yellow');
      }));


    var knob1 = knobs.append('g').attr('id', 'knob1');
    knob1.radius = width * (4/16);

    var base1 = knob1.append('circle')
        .attr('r', knob1.radius)
        .attr('cx', width/2)
        .attr('cy', width/2)
        .attr('stroke', '#b8b8b8')
        .attr('stroke-width', '0.06em')
        .attr('fill', 'url(#gray)')
        .attr('filter', 'url(#inner_bevel)')
        .classed('nps', data.scenario['diesel_p'] !== 'n');

    var knob1_text = knob1.append('text');

    var toggle_nps = () => {
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

      console.log("Switching to diesel price", data.scenario['diesel_p'] = t);

      knob1_text
        .attr('x',  (width  - knob1_text.node().clientWidth) / 2)
        .attr('y', ((height + knob1_text.node().clientHeight) / 2) - 5);
    };

    knob1.on('click', toggle_nps);

    toggle_nps();
  };

  init();

  do_defs();

  draw_knobs();
});
