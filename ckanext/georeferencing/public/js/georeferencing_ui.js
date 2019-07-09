$( document ).ready(function() {
    $("#btn_dataset_save").click(function() {
        datasetSave();
    });
    $("#btn_geo_search").click(function() {
        geoSearch();
    });
    $("#btn_undo_geo_search").click(function() {
        removeGeoSelection(true);
    });
    $("#btn_rel_search").click(function() {
        relSearch();
    });
});
