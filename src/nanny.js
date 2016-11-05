define(['jquery'], ($) => {
  var div = $('#nanny-says');

  var tell = () => {
    var str;

    div.show();

    if (_u.get_query_param('adm2'))
      str = `<p>You can hover an area to see the details.</p>`;

    else if (_u.get_query_param('adm1')) {
      str = `<p>Select a district by clicking on it on the map.</p>`;

      if (_d.mode['points'])
        str += `<br><a style="color: #7587A6;" href="${ location.pathname }${ _u.set_query_param('load_points', true) }">Load all state's cells</a>`;

    }

    else if (_u.get_query_param('iso3'))
      str = `<p>Select a state by clicking on it on the map.</p>`;

    div.html(str);
  };

  var hush = () => {
    div.hide();
  };

  return {
    tell: tell,
    hush: hush
  };
});
