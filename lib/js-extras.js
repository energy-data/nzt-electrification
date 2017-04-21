var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

Array.prototype.first = function() {
  return this[0];
};

Array.prototype.last = function() {
  return this[this.length - 1];
};

Array.prototype.count = function() {
  return this.length;
};

Array.prototype.empty = function() {
  return this.length === 0;
};

Array.prototype.head = function() {
  return this[0];
};

Array.prototype.tail = function() {
  return Array.prototype.slice.call(this, 1);
};

Array.prototype.contains = function(x) {
  var e, l, len, ref;
  ref = this;
  for (l = 0, len = ref.length; l < len; l++) {
    e = ref[l];
    if (e === x) {
      return true;
    }
  }
  return false;
};

Array.prototype.transpose = function(i, j) {
  var tmp;
  if ((this.length < i + 1) || (this.length < j + 1)) {
    return this;
  }
  tmp = this[i];
  this[i] = this[j];
  this[j] = tmp;
  this.splice(this.length, 0);
  return this;
};

Array.prototype.shuffle = function() {
  return this.sort(function() {
    return 0.5 - Math.random();
  });
};

Array.prototype.sample = function(s) {
  if (s == null) {
    s = 1;
  }
  return this.shuffle().slice(0, s);
};

Array.prototype.range = function(i, j) {
  return Array(j - i + 1).fill().map(function(_, k) {
    return k + i;
  });
};

Array.prototype.unique = function() {
  var key, l, o, ref, value;
  o = new Object;
  for (key = l = 0, ref = this.length; 0 <= ref ? l < ref : l > ref; key = 0 <= ref ? ++l : --l) {
    o[this[key]] = this[key];
  }
  return (function() {
    var results;
    results = [];
    for (key in o) {
      value = o[key];
      results.push(value);
    }
    return results;
  })();
};

Array.prototype.difference = function(a) {
  return this.filter(function(e) {
    return indexOf.call(a, e) < 0;
  });
};

Array.prototype.intersection = function(a) {
  return this.filter(function(e) {
    return indexOf.call(a, e) >= 0;
  });
};

Array.prototype.union = function(a) {
  return this.difference(a).concat(a);
};

Array.prototype.remove = function(v) {
  var e, i, l, len, ref;
  ref = this;
  for (i = l = 0, len = ref.length; l < len; i = ++l) {
    e = ref[i];
    if (e === v) {
      return this.splice(i, 1);
    }
  }
  return void 0;
};

Array.prototype.human_print = function(s, y, none) {
  var head, last;
  none = none || void 0;
  if (this.length === 0) {
    return none;
  }
  if (this.length === 1) {
    return this[0];
  }
  last = this.slice(-1)[0];
  head = this.slice(0, -1).join((s || ',') + " ");
  return head + (" " + (y || '&') + " ") + last;
};

Array.prototype.flatten = function() {
  var fltn, is_a;
  is_a = function(arr) {
    return typeof arr === 'object' && (arr.length != null);
  };
  fltn = function(arr) {
    return arr.reduce((function(a, b) {
      return a.concat(is_a(b) ? fltn(b) : b);
    }), []);
  };
  return fltn(this);
};

Array.prototype.pluck_p = function() {
  var p, proc;
  p = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  proc = function(e, a) {
    if (typeof a !== 'function') {
      return e[a];
    } else {
      return a.call(null, e);
    }
  };
  if (p.length === 1) {
    return this.map(function(x) {
      return proc(x, p[0]);
    });
  } else {
    return this.map(function(x) {
      var i, l, ref, results;
      results = [];
      for (i = l = 0, ref = p.length - 1; 0 <= ref ? l <= ref : l >= ref; i = 0 <= ref ? ++l : --l) {
        results.push(proc(x, p[i]));
      }
      return results;
    });
  }
};

Array.prototype.indexof_p = function(a, v) {
  var e, i, l, len, ref;
  ref = this;
  for (i = l = 0, len = ref.length; l < len; i = ++l) {
    e = ref[i];
    if (e[a] === v) {
      return i;
    }
  }
};

Array.prototype.filter_p = function(p, v) {
  return this.filter(function(x) {
    return x[p] === v;
  });
};

Array.prototype.find_p = function(p, v) {
  return this.find(function(x) {
    return x[p] === v;
  });
};

Array.prototype.sort_p = function(f, r, p) {
  var sb;
  sb = function() {
    var k;
    if (p) {
      k = function(x) {
        return p(x[f]);
      };
    } else {
      k = function(x) {
        return x[f];
      };
    }
    return function(i, j) {
      var a, b;
      a = k(i);
      b = k(j);
      return [-1, 1][+(!r)] * ((a > b) - (b > a));
    };
  };
  return this.sort(sb());
};

Array.prototype.group_p = function(p) {
  var e, l, len, o, ref;
  o = new Object();
  ref = this;
  for (l = 0, len = ref.length; l < len; l++) {
    e = ref[l];
    if (typeof e[p] === 'undefined') {
      throw "AttributeError: Cannot read property \"" + p + "\" of " + e;
    } else {
      if (o[e[p]] instanceof Array) {
        o[e[p]].push(e);
      } else {
        o[e[p]] = [e];
      }
    }
  }
  return o;
};
Date.prototype.standard_date = function() {
  var sd;
  sd = function(x) {
    return x.toString().replace(/^\d{1}$/, "0\$&");
  };
  return (this.getFullYear()) + "-" + (sd(this.getMonth() + 1)) + "-" + (sd(this.getDay()));
};

Date.prototype.standard_date_time = function() {
  var sd;
  sd = function(x) {
    return x.toString().replace(/^\d{1}$/, "0\$&");
  };
  return (this.getFullYear()) + "-" + (sd(this.getMonth() + 1)) + "-" + (sd(this.getDay())) + " " + (sd(this.getHours())) + ":" + (sd(this.getMinutes()));
};

Date.prototype.fix_dashes = function(str) {
  return str.replace(/(\d{4})-(\d{2})-(\d{2})/gi, '$1/$2/$3');
};
var slice = [].slice;

Function.prototype.fn_apply = function() {
  var a, f;
  f = arguments[0], a = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  if (typeof f === 'function') {
    return f.apply(null, a);
  }
};

Function.prototype.fn_call = function(f, a) {
  if (typeof f === 'function') {
    return f.apply(null, a);
  }
};

Function.prototype.curry = function() {
  var args, func;
  func = this;
  args = Array.prototype.slice.call(arguments);
  return function() {
    return func.apply(this, args.concat(Array.prototype.slice.call(arguments, 0)));
  };
};
Object.defineProperty(Object.prototype, 'merge_with', {
  enumerable: false,
  value: function(o) {
    var k, v;
    for (k in o) {
      v = o[k];
      this[k] = v;
    }
    return this;
  }
});
var slice = [].slice;

String.prototype.to_boolean = function() {
  if (this.valueOf() === "true") {
    return true;
  } else if (this.valueOf() === "false") {
    return false;
  } else {
    return void 0;
  }
};

String.prototype.closest_in = function(a, d) {
  return a.filter((function(_this) {
    return function(e) {
      return (String.prototype.levenshtein(_this, e)) <= d;
    };
  })(this));
};

String.prototype.capitalise = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.regexp_escape = function() {
  return this.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

String.prototype.format = function() {
  var args, i, re, s;
  args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  s = this;
  i = args.length;
  while (i) {
    i -= 1;
    re = new RegExp("\\{" + i + "\\}", 'gm');
    s = s.replace(re, args[i]);
  }
  return s;
};

String.prototype.camelise = function() {
  return this.replace(/(?:^|[-_])(\w)/g, function(_, c) {
    if (c) {
      return c.toUpperCase();
    } else {
      return "";
    }
  });
};

String.prototype.snakelise = function() {
  return this.replace(/(^[A-Z])|(?:[-_])*([A-Z])|([-_])/g, function(_, I, J, k) {
    var j;
    if (I != null) {
      return I.toLowerCase();
    }
    j = (J != null ? J.toLowerCase() : "");
    if (!k) {
      return "_" + j;
    } else {
      return j + "_";
    }
  });
};

String.prototype.levenshtein = function(s, t) {
  var d, i, j, l, m, n, o, p, q, r, ref, ref1, ref2, ref3, ref4, ref5, row, u;
  m = s.length;
  n = t.length;
  if (m === 0) {
    return n;
  }
  if (n === 0) {
    return m;
  }
  d = new Array;
  for (i = l = 0, ref = m; 0 <= ref ? l <= ref : l >= ref; i = 0 <= ref ? ++l : --l) {
    row = [];
    for (j = o = 0, ref1 = n; 0 <= ref1 ? o <= ref1 : o >= ref1; j = 0 <= ref1 ? ++o : --o) {
      row.push(0);
    }
    d.push(row);
  }
  for (i = p = 1, ref2 = m; 1 <= ref2 ? p <= ref2 : p >= ref2; i = 1 <= ref2 ? ++p : --p) {
    d[i][0] = i;
  }
  for (j = q = 1, ref3 = n; 1 <= ref3 ? q <= ref3 : q >= ref3; j = 1 <= ref3 ? ++q : --q) {
    d[0][j] = j;
  }
  for (j = r = 1, ref4 = n; 1 <= ref4 ? r <= ref4 : r >= ref4; j = 1 <= ref4 ? ++r : --r) {
    for (i = u = 1, ref5 = m; 1 <= ref5 ? u <= ref5 : u >= ref5; i = 1 <= ref5 ? ++u : --u) {
      if (s[i - 1] === t[j - 1]) {
        d[i][j] = d[i - 1][j - 1];
      } else {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + 1);
      }
    }
  }
  return d[m][n];
};
