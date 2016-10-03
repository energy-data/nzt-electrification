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
      $('#point-info').hide();
      points.clear(true);

      _d.place['adm1'] = undefined;
      _d.place['adm1_name'] = undefined;

      _d.place['adm2'] = undefined;
      _d.place['adm2_name'] = undefined;

      map.resize_to({
        node: d3.select('#container').node(),
        duration: 1000
      });
    });

    $('[data="adm1_name"]').on('click', (e) => {
      e.preventDefault();

      let target = d3.select(`path#adm1-${ _d.place['adm1'] }`);

      load_adm1(target.node(), {
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

    $('.export-summary').on('click', (e) => {
      e.preventDefault();

      _u.dwnld(JSON.stringify({
        location: _d.place,
        technology_results: _d.summary['results']
      }), 'export-summary.json');
    });

    $('.export-points').on('click', (e) => {
      e.preventDefault();

      let adm   = (_d.place['adm2'] ?            "2"              : "1");
      let adm_v = (_d.place['adm2'] ? _d.place['adm2'] : _d.place['adm1']);

      let box = map.to_bbox(d3.select(`path#adm${ adm }-${ adm_v }`).node().getBBox());

      let url = "http://localhost:4000/points?" +
          `select=${ _g.point_attrs }` +
          `&x=gt.${ box[0] }&x=lt.${ box[2] }` +
          `&y=gt.${ box[1] }&y=lt.${ box[3] }` +
          `&adm${ adm }=eq.${ adm_v }` +
          `&cc=eq.${ _d.place['adm0_code'] }`;

      d3.queue()
        .defer(d3.text(url).header("accept", "text/csv").get)
        .await((error, response) => {
          _u.dwnld(response, `export-points-${ _d.place['adm0_code'] }-adm${ adm }-${ adm_v }.csv`);
        });
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
