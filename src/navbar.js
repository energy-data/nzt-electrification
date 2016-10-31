define(['d3', 'map', 'adm', 'points', 'summary', 'place', 'nanny'], (d3, map, adm, points, summary, place, nanny) => {
  var init = () => {
    $('[data="adm0_name"]').on('click', (e) => {
      e.preventDefault();

      place.nullify('adm1');
      place.nullify('adm2');

      history.replaceState(null, null, _u.set_query_param('load_points', false));

      nanny.tell();
      summary.fetch();

      d3.selectAll('.adm2').style('display', 'none');

      points.clear(true);
      adm.set_adm1_fills(0);

      map.resize_to({
        node: d3.select('#paths-adm1').node(),
        duration: 600
      });
    });

    $('[data="adm1_name"]').on('click', (e) => {
      e.preventDefault();

      var target = d3.select(`path#adm1-${ _d.place['adm1'] }`);

      adm.load_adm1(target.node(), {
        id: _d.place['adm1'],
        properties: {
          name: _d.place['adm1_name']
        }
      });
    });

    $('[data="adm2_name"]').on('click', (e) => {
      e.preventDefault();

      map.resize_to({
        node: d3.select(`path#adm2-${ _d.place['adm2'] }`).node(),
        duration: 600
      });
    });
  };

  return {
    init: init
  };
});
