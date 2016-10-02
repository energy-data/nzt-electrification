define(['map', 'points'], (map, points) => {
  var setup = () => {
    $('.close-button').on('click', (e) => {
      e.preventDefault();

      $(e.target).closest('.pane').toggle();

      $('#restore-panes').show();
    });

    $('#hide-panes').on('click', (e) => {
      e.preventDefault();

      $('#summary-info, #point-info').addClass('hidden');

      $(e.target).hide();
      $('#restore-panes').show();
    });

    $('#restore-panes').on('click', (e) => {
      e.preventDefault();

      $('#summary-info, #point-info')
        .removeClass('hidden')
        .show();

      $(e.target).hide();
      $('#hide-panes').show();
    });

    $('.with-dropdown').on('click', (e) => {
      $(e.target).closest('.with-dropdown').find('ul.dropdown').toggle();
    });

    $('.dropdown').on('mouseleave', (e) => $(e.target).closest('.dropdown').hide());

    $('.with-dropdown').on('mouseleave', (e) => {
      $(e.target).closest('.with-dropdown').find('.dropdown').hide();
    });

    $('[data="adm0_name"]').on('click', (e) => {
      // $('#point-info').hide();
      // points.clear(true);

      // _d.place['adm1'] = undefined;
      // _d.place['adm1_name'] = undefined;

      // _d.place['adm2'] = undefined;
      // _d.place['adm2_name'] = undefined;

      map.resize_to({
        node: d3.select('#container').node(),
        duration: 1000
      });
    });

    $('[data="adm1_name"]').on('click', (e) => {
      e.preventDefault();

      let it = d3.select(`path#adm1-${ _d.place['adm1'] }`).node();

      load_adm1(it, {
        id: _d.place['adm1'],
        properties: {
          name: _d.place['adm1_name']
        }
      });

      // _d.place['bbox'] = map.to_bbox it.getBBox()

      // points.load
      //   adm: [null, 1, _d.place['adm1']]
      //   svg_box: it.getBBox()

      // history.replaceState null, null, location.updateQueryParam('load_points', true);
    });

    $('[data="adm2_name"]').on('click', (e) => {
      e.preventDefault();

      let d3it = d3.select(`path#adm2-${ _d.place['adm2'] }`)
      let it   = d3it.node();

      load_adm2(it, {
        id: _d.place['adm2'],
        properties: {
          adm1: d3it.datum().properties['adm1'],
          name: _d.place['adm2_name']
        }
      });

      // _d.place['bbox'] = map.to_bbox it.getBBox()

      // points.load
      //   adm: [null, 1, _d.place['adm1']]
      //   svg_box: it.getBBox()

      // history.replaceState null, null, location.updateQueryParam('load_points', true);
    });

    $('#export-summary').on('click', (e) => {
      e.preventDefault();

      _u.dwnld(JSON.stringify({
        location: _d.place,
        technology_results: _d.summary['results']
      }), 'export-summary.json');
    });

    $('#export-points').on('click', (e) => {
      e.preventDefault();

      if (!_d.point_collection['points'] || !_d.point_collection['points'].length) {
        alert("Theres no points to export. Load some first.");
        return;
      }

      _u.dwnld(JSON.stringify(_d.point_collection['points']), 'export-points.json');
    });

    $('#controls-control').on('click', (e) => {
      e.preventDefault();

      $('#controls').toggleClass('hidden');
      $(e.target).find('i').toggleClass('active');
    });
  };

  return {
    setup: setup
  };
});
