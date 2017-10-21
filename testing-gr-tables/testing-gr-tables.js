$(function() {

  var tableURL = "tables.json";

  $("#theoryPropGrid").jsGrid({
    height: "20em",
    width: "100%",

    sorting: true,
    paging: false,
    pageLoading: false,
    autoload: true,
    selecting: false,

    controller: {
      loadData: function(filter) {
        var d = $.Deferred();

        $.ajax({
          type: "GET",
          url: tableURL,
          dataType: "JSON"
        }).done( function(response) {
          d.resolve(response);
        }).fail( function(jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          console.log( "Request Failed: " + err );
        });

        return d.promise();
      }
    },

    fields: [
      { name: "theory", type: "text", title: "Theory" },
      { name: "scalar", type: "checkbox", title: "S", width: 20 },
      { name: "pseudoscalar", type: "checkbox", title: "P", width: 20 },
      { name: "vector", type: "checkbox", title: "V", width: 20 },
      { name: "tensor", type: "checkbox", title: "T", width: 20 },
      { name: "strongEP", type: "checkbox", title: "Strong EP", width: 25 },
      { name: "masslessGraviton", type: "checkbox", title: "Massless graviton", width: 25 },
      { name: "localLorentz", type: "checkbox", title: "Lorentz symmetry", width: 25 },
      { name: "linearT", type: "checkbox", title: "Linear \\(T_{\\mu\\nu}\\)", width: 25 },
      { name: "weakEP", type: "checkbox", title: "Weak EP", width: 25 },
    ]
  });

  // ---------- Biblio stuff ----------
  
  var bibURL = "biblio.json";
  var bibData = null;

  // need a function to reprocess the output of Bib2JSON into a format
  // more amenable to js-grid
 
  $.ajax({
    type: "GET",
    url: bibURL,
    dataType: "JSON"
  }).done( function(response) {

    bibData = response;

    $("#bibGrid").jsGrid({
      height: "20em",
      width: "100%",

      sorting: true,
      paging: false,
      pageLoading: false,
      autoload: true,
      selecting: false,

      controller: {
        loadData: function(filter) {
          // - Check if filter is an array. If not, ignore.
          // - If an empty array, ignore.
          // - If an array of strings, only return those elements from
          //   bibData whose EntryKey fields appear in the filter

          if (!Array.isArray(filter))
            filter = [];

          if (filter.length == 0)
            return bibData;
          else
            return bibData.filter(function(bibEntry) {
              return filter.includes(bibEntry.EntryKey);
            });
        }
      },

      fields: [
        { name: "EntryKey", type: "text" },
      ]
    });

  }).fail( function(jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
  });
  
});
