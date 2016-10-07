define(['d3', 'map', 'points'], (d3, map, points) => {
  var setup = () => {
    $('.close-button').on('click', (e) => {
      e.preventDefault();

      $(e.target).closest('.pane').addClass('hidden');
    });

    $('#hide-panes').on('click', (e) => {
      e.preventDefault();

      points.hide_info();
      summary.hide();
    });

    $('#restore-panes').on('click', (e) => {
      e.preventDefault();

      summary.show();
      points.show_info();
    });

    $('.with-dropdown').on('click', (e) => {
      $(e.target).closest('.with-dropdown').find('ul.dropdown').toggle();
    });

    $('.dropdown').on('mouseleave', (e) => $(e.target).closest('.dropdown').hide());

    $('.with-dropdown').on('mouseleave', (e) => {
      $(e.target).closest('.with-dropdown').find('.dropdown').hide();
    });

    $('[data="adm0_name"]').on('click', (e) => {
      e.preventDefault();

      points.hide_info();
      summary.hide();

      _d.place['adm1'] = undefined;
      _d.place['adm1_name'] = undefined;

      _d.place['adm2'] = undefined;
      _d.place['adm2_name'] = undefined;

      history.pushState(null, null, location.updateQueryParam('load_points', false));
      history.replaceState(null, null, location.updateQueryParam('adm1', null));
      history.replaceState(null, null, location.updateQueryParam('adm2', null));

      d3.selectAll('.adm2').style('display', 'none');

      points.clear(true);
      set_adm1_fills(0);

      map.resize_to({
        node: d3.select('#all-paths-adm1').node(),
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

    $('.load-points').on('click', (e) => {
      e.preventDefault();

      let adm   = (_d.place['adm2'] ?            2              :   1);
      let adm_v = (_d.place['adm2'] ? _d.place['adm2'] : _d.place['adm1']);

      let target = d3.select(`path#adm${ adm }-${ adm_v }`).node();

      _d.place['bbox'] = map.to_bbox(target.getBBox());

      history.replaceState(null, null, location.updateQueryParam('load_points', true));

      points.load({
        adm: [null, adm, _d.place[`adm${ adm }`]],
        svg_box: target.getBBox()
      });
    });

    $('.export-summary').on('click', (e) => {
      e.preventDefault();

      let adm   = (_d.place['adm2'] ?            "2"              : "1");
      let adm_v = (_d.place['adm2'] ? _d.place['adm2'] : _d.place['adm1']);

      _u.dwnld(JSON.stringify({
        location: _d.place,
        scenario: _d.scenario['scn'],
        technology_results: _d.summary['results']
      }), `summary-${ _d.place['adm0_code'] }-adm${ adm }-${ adm_v }-${ _d.scenario['scn'] }.json`);
    });

    $('.export-points').on('click', (e) => {
      e.preventDefault();

      let adm   = (_d.place['adm2'] ?            "2"              : "1");
      let adm_v = (_d.place['adm2'] ? _d.place['adm2'] : _d.place['adm1']);

      let box = map.to_bbox(d3.select(`path#adm${ adm }-${ adm_v }`).node().getBBox());

      let url = `${ _conf['data_source'] }/points?` +
          `select=${ _g.point_attrs }` +
          `&x=gt.${ box[0] }&x=lt.${ box[2] }` +
          `&y=gt.${ box[1] }&y=lt.${ box[3] }` +
          `&adm${ adm }=eq.${ adm_v }` +
          `&cc=eq.${ _d.place['adm0_code'] }`;

      d3.queue()
        .defer(d3.text(url).header("accept", "text/csv").get)
        .await((error, response) => {
          _u.dwnld(response, `cells-${ _d.place['adm0_code'] }-adm${ adm }-${ adm_v }.csv`);
        });
    });

    $('#controls-control').on('click', (e) => {
      e.preventDefault();

      $('#controls').toggleClass('hidden');
      $(e.target).closest('.col').toggleClass('active');
    });

    $('#points-info-control').on('click', (e) => {
      e.preventDefault();

      $('#point-info').toggleClass('hidden');
      $(e.target).closest('.col').toggleClass('active');
    });
  };

  return {
    setup: setup
  };
});
