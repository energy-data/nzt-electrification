define(['knob', 'help'], (knob, help) => {
  var init = () => {
    $('#controls-control').on('click', (e) => {
      e.preventDefault();

      $('#controls').toggleClass('hidden');
      $(e.target).closest('.col').toggleClass('active');
    });

    $('.load-points').on('click', (e) => {
      e.preventDefault();

      var adm   = (_d.place['adm2'] ?            2              :   1);
      var adm_v = (_d.place['adm2'] ? _d.place['adm2'] : _d.place['adm1']);

      var target = d3.select(`path#adm${ adm }-${ adm_v }`).node();

      history.replaceState(null, null, _u.set_query_param('load_points', true));

      points.load({
        adm: [null, adm, _d.place[`adm${ adm }`]],
        svg_box: target.getBBox()
      });
    });

    $('.export-points').on('click', (e) => {
      e.preventDefault();

      var adm   = (_d.place['adm2'] ?            "2"              : "1");
      var adm_v = (_d.place['adm2'] ? _d.place['adm2'] : _d.place['adm1']);

      var box = map.to_bbox(d3.select(`path#adm${ adm }-${ adm_v }`).node().getBBox());

      var url = `${ _conf['data_source'] }/points?` +
          `select=${ _g.point_attrs }` +
          `&x=gt.${ box[0] }&x=lt.${ box[2] }` +
          `&y=gt.${ box[1] }&y=lt.${ box[3] }` +
          `&adm${ adm }=eq.${ adm_v }` +
          `&cc=eq.${ _d.place['adm0_code'] }`;

      d3.queue()
        .defer(d3.text(url).header("accept", "text/csv").get)
        .await((error, response) => {
          error ?
            _u.network_error() :
            _u.dwnld(response, `cells-${ _d.place['adm0_code'] }-adm${ adm }-${ adm_v }.csv`);
        });
    });

    $('#other-mode-selector').on('click', (e) => {
      e.preventDefault();
    });

    knob.init();
  };

  return {
    init: init
  };
});
