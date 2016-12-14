define(['jquery'], ($) => {
  var div = $('#nanny-says');

  var tell = () => {
    var str;

    div.show();

    if (_u.get_query_param('adm2')) {
      if (_d.mode['points'])
        str = `You can hover an area to see the details.`;

      else
        str = `Select another dataset for more detailed visualization.`;
    }

    else if (_u.get_query_param('adm1') && !_u.get_query_param('load_points').to_boolean()) {
      str = `Select a district by clicking on it on the map.`;

      if (_d.mode['points'])
        str += `<br><a style="color: #7587A6;" href="${ location.pathname }${ _u.set_query_param('load_points', true) }">Load all state's cells</a>`;

    }

    else if (_u.get_query_param('iso3') && !_u.get_query_param('load_points').to_boolean())
      str = `Select a state by clicking on it on the map.`;

    if (str) div.html(`<p>${ str }</p>`);
  };

  var hush = () => {
    div.hide();
  };

  return {
    tell: tell,
    hush: hush
  };
});
