var map;
var drawnItems;

function load_map(extent) {
    map = L.map('map');
    L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
        subdomains: 'abcd'
    }).addTo(map);
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    var extentLayer = L.geoJson(extent, {
        pointToLayer: function (feature, latLng) {
          return new L.Marker(latLng, {icon: new ckanIcon})
        }});
    drawnItems.addLayer(extentLayer);

    drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems
            }
        });
        map.addControl(drawControl);
        map.on(L.Draw.Event.CREATED, function (e) {
            var type = e.layerType,
                layer = e.layer;

            if (type === 'marker') {
                layer.bindPopup('A popup!');
            }

            drawnItems.addLayer(layer);
        });

    if (extent.type == 'Point'){
     map.setView(L.latLng(extent.coordinates[1], extent.coordinates[0]), 9);
      } else {
     map.fitBounds(extentLayer.getBounds());
      }
};

function datasetSave() {
    var the_geom;
    if (drawnItems.toGeoJSON().features.length == 1) {
        the_geom = drawnItems.toGeoJSON().features[0].geometry;
    } else if (drawnItems.toGeoJSON().features.length > 1) {
        let coords = [];
        for (let feature of drawnItems.toGeoJSON().features) {
            coords.push(feature.geometry.coordinates);
        };
        the_geom = {type: "MultiPolygon", coordinates: coords};
    } else {
        the_geom = {};
    };
    drawnItems.eachLayer(function (layer) {
        drawnItems.removeLayer(layer)
    });
    L.geoJSON(the_geom, {
                style: function() {
                    return {weight: 1, color: "#00FF00"}}}).eachLayer(
            function(l){
                drawnItems.addLayer(l);
        });
    $.getJSON('/api/3/action/update_spatial', {id: 'spatial', spatial: JSON.stringify(the_geom)});
};
