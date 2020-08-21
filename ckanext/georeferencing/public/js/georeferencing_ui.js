$( document ).ready(function() {
    $("#btn_dataset_save").click(function() {
        datasetSave();
    });
    $("#btn_geo_search").click(function() {
        geoSearch();
    });
    $("#btn_undo_geo_search").click(function() {
        removeCurrentLayer(true);
    });
    $("#btn_rel_search").click(function() {
        relSearch();
    });
    $("#btn_org_save").click(function() {
        orgSave();
    });
    $.ajax({
      url: '/api/action/get_districts',
      type: 'GET',
      success: function(response){
        var data = response.result.bezirke;

        var options = '<option value=""></option><optgroup label="Bezirke">';
        for(var i=0; i<data.length; i++)
        {
          options += "<option value='" + data[i] + "'>" + data[i] + "</option>";
        }
        data = response.result.stadtteile;
        options += '</optgroup><optgroup label="Stadtteile">';
        for(var i=0; i<data.length; i++)
        {
          options += "<option value='" + data[i] + "'>" + data[i] + "</option>";
        }
        options += '</optgroup>'
        $("#sel1").html(options);
      }
    });
    $("#sel1").select2({width: '100%'});
    $("#sel1").on('select2:select', function (e) {
        var data = e.params.data;
        console.log("hi" + data);
    });
});
