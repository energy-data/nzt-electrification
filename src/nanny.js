define(['jquery'], ($) => {
  var div = $('#nanny-says');

  var tell = () => {
    var text;

    div.show();

    if (_u.get_query_param('adm2'))
      text = "You can hover an area to see the details.";

    else if (_u.get_query_param('adm1'))
      text = "Select a district by clicking on it on the map.";

    else if (_u.get_query_param('iso3'))
      text = "Select a state by clicking on it on the map.";

    div.text(text);
  };

  var hush = () => {
    div.hide();
  };

  return {
    tell: tell,
    hush: hush
  };
});
