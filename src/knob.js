define(['d3'], (d3) => {
  var kc = null;

  var svg = null;

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
    let cart = polar_to_cartesian(knob0_radius - (width/13), c['v']);

    d3.selectAll(`${ marker } circle`)
      .attr('cx',  cart.x + center.x)
      .attr('cy', -cart.y + center.y);

    tier = c['i'] + 1;
  };

  var clear = () => kc.empty();

  var init = () => {
    kc = d3.select('#knobs-container');

    let total_width = $('#controls')[0].clientWidth;

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
    }

    // knobs
    {
      let knobs = svg.append('g').attr('id', 'knobs');

      let knob0 = knobs.append('g').attr('id', 'knob0');

      let knob1 = knobs.append('g').attr('id', 'knob1');

      let base0 = knob0.append('circle')
          .attr('id', 'knob0')
          .attr('r', knob0_radius)
          .attr('cx', center.x)
          .attr('cy', center.y)
          .attr('stroke', '#b8b8b8')
          .attr('stroke-width', '0.06em')
          .attr('fill', 'url(#gray)');

      let base1 = knob1.append('circle')
          .attr('r', knob1_radius)
          .attr('cx', center.x)
          .attr('cy', center.y)
          .attr('stroke', '#b8b8b8')
          .attr('stroke-width', '0.06em')
          .attr('fill', 'url(#gray)')
          .classed('nps', _d.scenario['diesel_p'] !== 'n');

      // knob0 marker
      {
        let t = range[_d.scenario['tier'] - 1];
        let pc = polar_to_cartesian(knob0_radius - (width/13), -t);

        let marker0 = knob0.append('g').attr('id', 'marker0');

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
            .on('drag', function() { rotate(this, '#marker0', knob0); })
            .on('start', () => { tier = _d.scenario['tier'] })
            .on('end', () => {
              if (_d.scenario['tier'] !== tier)
                console.log("Changed to tier", _d.scenario['tier'] = tier);
            })
        );
      }

      // knob1 icon:
      {
        let knob1_icon = knob1.append('text')
            .attr('id', 'diesel_p')
            .attr('class', 'material-icons')
            .text("local_gas_station");

        let box = knob1_icon.node().getBBox()

        let x = (center.x - 12) - 2;
        let y = (center.y + (box['height'] / 2)) - 20;

        knob1_icon
          .attr('transform', `translate(${ x }, ${ y })`);
      }

      // knob1 text:
      {
        let knob1_text = knob1.append('text')
            .attr('class', 'text');

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

          let box = knob1_text.node().getBBox()

          let x = (center.x - (box['width']  / 2));
          let y = (center.y + (box['height'] / 2)) + 12;

          knob1_text
            .attr('transform', `translate(${ x }, ${ y })`);
        };

        knob1
          .on('mousedown', () => { toggle_nps() })
          .on('mouseup',   () => { console.log("Changed to diesel price", _d.scenario['diesel_p'] = t) });

        toggle_nps();
      }
    }

    // icons
    {
      for (let i = 0; i < steps; i++) {
        let cart = polar_to_cartesian(knob0_radius + 19, range[i]);

        let it = document.getElementById(`icon-${ i+1 }`).innerHTML;

        let icon = svg.append('g')
            .html(it)
            .attr('stroke-width', 1.5)
            .attr('stroke', '#4c4c4c')
            .attr('fill', '#7587A6')
            .attr('class', 'tier-label')
            .attr('transform', `translate(${ cart.x + center.x - 15 }, ${ -cart.y + center.y - 20 })scale(0.6)`)
            .on('click', () => {
              _d.scenario['tier'] = (i+1);
              rotate(d3.select('#marker0').node(), '#marker0', d3.select('#knob0'));
            });
      }
    }
  };

  return {
    init: init
  };
});
