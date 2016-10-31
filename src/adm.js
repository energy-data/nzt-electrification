define(['d3', 'map', 'points', 'place', 'nanny'], (d3, map, points, place, nanny) => {
  var _container;
  var locked_adm2;

  var load_adm = (topo, pathname, callback) => {
    _u.check(topo, pathname);

    var all_paths = _container.append('g').attr('id', `paths-${ pathname }`);

    var path = map.load_topo({
      topo: topo,
      pathname: pathname,
      cls: 'adm hoverable',
      fill: 'white',
      labels: true,
      parent: all_paths
    });

    if (typeof callback === 'function')
      return callback.call(this, path);

    else
      return path;
  };

  var set_adm1_fills = (id) => {
    d3.selectAll('.adm1').each(function(e) {
      var elem = d3.select(this);

      if (e.id === id)
        elem.style('visibility', 'hidden');

      else
        elem
        .style('visibility', 'visible')
        .attr('fill', 'white')
        .attr('stroke', '#ccc');
    });
  };

  var load_adm1 = (it, d) => {
    points.clear(true);
    reset_adm2(null);

    place.nullify('adm2');

    place.set('adm1', d['id'], d.properties['name'], true);
    history.replaceState(null, null, _u.set_query_param('load_points', false));

    nanny.tell();

    set_adm1_fills(d.id);

    map.resize_to({
      node: it,
      duration: 300
    });

    d3.select('#text-labels-adm1').raise();

    show_adm2(d.id);
  };

  var load_adm2 = (it, d) => {
    if (locked_adm2 === d['id']) return;

    d3.selectAll('.adm-label').attr('font-weight', 'normal');
    d3.select(`#adm2-label-${ d['id'] }`).attr('font-weight', 'bold');

    place.set('adm2', d['id'], d.properties['name'], true);
    history.replaceState(null, null, _u.set_query_param('load_points', true));

    reset_adm2(it);

    locked_adm2 = d['id'];

    var admin1 = d.properties['adm1'];

    if (admin1)
      place.set('adm1', admin1, d3.select(`#adm1-${ admin1 }`).datum().properties['name'], false)
    else
      plase.nullify('adm1');

    if (_u.get_query_param('load_points').to_boolean())
      points.load({
        adm: it.id.match(/adm(.*)-(\d*)?/),
        svg_box: it.getBBox()
      });

    map.resize_to({
      node: it,
      duration: 300
    });
  };

  var show_adm2 = (adm1_id) => {
    _u.check(adm1_id);

    d3.selectAll('.adm2').each(function(e) {
      d3.select(this).style('display', ((e.properties.adm1 === adm1_id) ? 'block' : 'none'));
    });
  };

  var reset_adm2 = (target) => {
    d3.selectAll('path.adm2').classed('hoverable', true);
    locked_adm2 = null;

    var a2 = parseInt(_u.get_query_param('adm2'));

    var it = (target ?
              target :
              (a2 ? `#adm2-${ a2 }` : null));

    if (it) d3.select(it).classed('hoverable', false);
  };

  var target = (admin1, admin2) => {
    return d3.select((() => {
      if (admin1 > -1 && isNaN(admin2))
        return `#adm1-${ admin1 }`;

      else if (admin2 > -1)
        return `#adm2-${ admin2 }`;

      else
        return '#paths-adm1';
    })());
  };

  var init = (admin1, admin2) => {
    show_adm2(admin1);
    set_adm1_fills(admin1);

    if (admin2) {
      reset_adm2(`#adm2-${ admin2 }`);
      locked_adm2 = admin2;
    };
  };

  var setup = (container, adm0_boundaries, adm1_boundaries, adm2_boundaries) => {
    _container = container;

    load_adm(adm1_boundaries, 'adm1')
      .on('click', function(d) { load_adm1(this, d) });

    load_adm(adm2_boundaries, 'adm2')
      .on('click', function(d) { load_adm2(this, d) });
  };

  return {
    reset_adm2: reset_adm2,
    set_adm1_fills: set_adm1_fills,
    setup: setup,
    init: init,
    target: target,
    load_adm: load_adm,
    load_adm1: load_adm1,
    load_adm2: load_adm2
  }
});
