var map;
var drawnItems;
var featureGroup;
var geo_results;
var geo_selection;
var temp_result;
var old_geo_index;
var old_dataset_index;
var dataset_name;

function load_map(extent, name) {
    dataset_name = name;
    map = L.map('map').setView([53.55, 10], 10);
    L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
        subdomains: 'abcd'
    }).addTo(map);
    L.control.scale().addTo(map);
    map.pm.addControls({
      position: 'topleft',
      drawCircle: false,
    });
    featureGroup = L.featureGroup().addTo(map);
    // Initialise the FeatureGroup to store editable layers
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    map.on('pm:drawstart', function(e) {
      e.shape; // the name of the shape being drawn (i.e. 'Circle')
      e.workingLayer; // the leaflet layer displayed while drawing
    });

    map.on('pm:create', function (e) {
      var layer = e.layer;
      feature = layer.feature;
      var points = JSON.stringify(e.layer.toGeoJSON());

      // Do whatever else you need to. (save to db, add to map etc)
      drawnItems.addLayer(layer);
    });
    if (extent != "") {
      if (extent.type == 'MultiPolygon') {
        var polygons = [];
        extent.coordinates.forEach(function(coords){
          var feat = {'type': 'Polygon', 'coordinates': coords};
          polygons.push(feat);
        });
        for (let polygon in polygons) {
          drawnItems.addLayer(L.geoJson(polygons[polygon]));
        };
      } else {
        var extentLayer = L.geoJson(extent, {
          pointToLayer: function (feature, latLng) {
            return new L.Marker(latLng)
          }});
        drawnItems.addLayer(extentLayer);
      };
      if (extent.type == 'Point') {
        map.setView(L.latLng(extent.coordinates[1], extent.coordinates[0]), 9);
      } else {
        map.fitBounds(drawnItems.getBounds());
      }
    }
};

function getGeom() {
    var the_geom;
    if (map.pm.findLayers().length == 1) {
        the_geom = map.pm.findLayers()[0].toGeoJSON().geometry;
    } else if (map.pm.findLayers().length > 1) {
        let coords = [];
        for (let feature of map.pm.findLayers()) {
            coords.push(feature.toGeoJSON().geometry.coordinates);
        };
        the_geom = {type: "MultiPolygon", coordinates: coords};
    } else {
        the_geom = {};
    };
    return the_geom;
};

function datasetSave() {
    var the_geom = getGeom();
    console.log("spatial length: " + JSON.stringify(the_geom).length);
    $.ajax({
      type: 'POST',
      url: '/api/3/action/update_spatial',
      data: JSON.stringify({id: dataset_name, type: 'dataset', spatial: JSON.stringify(the_geom)}),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      error: function(e) {
        console.log(e);
      }
    });
};

function orgSave() {
    var the_geom = getGeom();
    console.log("spatial length: " + JSON.stringify(the_geom).length);
    $.ajax({
      type: 'POST',
      url: '/api/3/action/update_spatial',
      data: JSON.stringify({id: dataset_name, type: 'organization', spatial: JSON.stringify(the_geom)}),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      error: function(e) {
        console.log(e);
      }
    });
};

function geoSearch() {
    var q = encodeURIComponent($("#input_geo_search").val()).replace(/%20/g,'+');
    var Url = "https://nominatim.openstreetmap.org/search.php?q=" + q + "&polygon_geojson=1&format=json"; // +Hamburg+Deutschland
    $.when(
        $.getJSON(Url)
    ).done( function(result) {
        let sHTML = "";
        geo_results = [];
        temp_result = [];
        for (let i = 0; i < result.length; i++){
            //if (result[i].display_name.includes("Hamburg")) {
                temp_result.push(result[i]);
            //};
        };
        for (let i = 0; i < temp_result.length; i++){
            if (i == 0){
                sHTML += "<a href=\"#\" id=\"geo_result" + i + "\" class=\"list-group-item geo active\" onclick=\"changeResult(event, 'geo')\">" + temp_result[i].display_name + "</li>";
            } else {
                sHTML += "<a href=\"#\" id=\"geo_result" + i + "\" class=\"list-group-item geo\" onclick=\"changeResult(event, 'geo')\">" + temp_result[i].display_name + "</li>";
            };
            geo_results[i] = L.geoJSON(temp_result[i].geojson, {
                style: function() {
                    return {weight: 1, color: "#000000"}}});
        };
        $('#the_geo_result').html(sHTML);
        if (geo_results.length > 0) {
            changeGeoJSON(0);
        };
    });
};

function changeGeoJSON(index) {
    removeCurrentLayer();
    drawnItems.addLayer(geo_results[index]);
    map.fitBounds(drawnItems.getBounds());
    old_geo_index = index;
};

function removeCurrentLayer(reset_list = false) {
    if (old_geo_index >= 0) {
        if (drawnItems.hasLayer(geo_results[old_geo_index])) {
            drawnItems.removeLayer(geo_results[old_geo_index]);
        };
    };
    if (reset_list) {
        $('#the_geo_result').html("");
    };
};

function changeResult(e, type) {
    if (!e)
        e = window.event;
    var sender = e.srcElement || e.target;

    //maybe some nested element.. find the actual table cell parent.
    while (sender && sender.nodeName.toLowerCase() != "a")
        sender = sender.parentNode;
    var index = parseInt(sender.id.match(/(\d+)$/)[0], 10);

    $('.list-group-item.geo').removeClass('active');
    changeGeoJSON(index, "geo");
    sender.classList.add('active');
};

function relSearch() {
    if (drawnItems.getLayers().length == 1) {
        var the_geom = getGeom();
        $.ajax({
          type: 'POST',
          url: '/api/3/action/relational_search',
          data: JSON.stringify({geometry: JSON.stringify(the_geom), type: $('.radio1:checked').val(), name: $('#btn_rel_search').attr('data1')}),
          dataType: 'json',
          contentType: 'application/json; charset=utf-8',
          error: function(e) {
            console.log(e);
          },
          success: function(data) {
            let sHTML = "";
            var results = data.result.results;
            for (let i = 0; i < results.length; i++){
                if (i == 0){
                    sHTML += "<li><a target=\"_blank\" href=\"/georeferencing/edit/" + results[i].name + "\" id=\"dataset_result" + i + "\" class=\"list-group-item dataset active\">" + results[i].title + "</li>";
                } else {
                    sHTML += "<li><a target=\"_blank\" href=\"/georeferencing/edit/" + results[i].name + "\" class=\"list-group-item dataset\">" + results[i].title + "</li>";
                };
            };
            $('#the_dataset_result').html(sHTML);
          }
        });
    };
};

function openTab(evt, tabName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
};
