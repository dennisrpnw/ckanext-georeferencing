this.ckan.module('georeferencing-map', function (jQuery, _) {

  return {
    options: {
      i18n: {
      },
      styles: {
        point:{
          iconUrl: '/img/marker.png',
          iconSize: [14, 25],
          iconAnchor: [7, 25]
        },
        default_:{
          color: '#B52',
          weight: 2,
          opacity: 1,
          fillColor: '#FCF6CF',
          fillOpacity: 0.4
        }
      }
    },

    initialize: function () {

      this.extent = this.el.data('extent');
      this.name = this.el.data('name');

      // fix bbox when w-long is positive while e-long is negative.
      // assuming coordinate sequence is west to east (left to right)
      if (this.extent.type == 'Polygon'
        && this.extent.coordinates[0].length == 5) {
        _coordinates = this.extent.coordinates[0]
        w = _coordinates[0][0];
        e = _coordinates[2][0];
        if (w >= 0 && e < 0) {
          w_new = w
          while (w_new > e) w_new -=360
          for (var i = 0; i < _coordinates.length; i++) {
            if (_coordinates[i][0] == w) {
              _coordinates[i][0] = w_new
            };
          };
          this.extent.coordinates[0] = _coordinates
        };
      };

      jQuery.proxyAll(this, /_on/);
      this.el.ready(load_map(this.extent, this.name));

    },
}});

