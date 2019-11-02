API_KEY = "pk.eyJ1IjoiZG9uaWNpYSIsImEiOiJjazE3MXg5dXUxYjV3M2J0am9yYjBwbXFtIn0.5hS6uK5lHirf_syi2sdkkQ";

// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Query to retrieve the faultline data
var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);  
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
 
  // Define function to create the circle radius based on the magnitude
  function radiusSize(magnitude) {
    return magnitude * 20000;
  }

  // Define function to set the circle color based on the magnitude
  function circleColor(magnitude) {
    if (magnitude < 1) {
      return "#ccff33"
    }
    else if (magnitude < 2) {
      return "#ffff33"
    }
    else if (magnitude < 3) {
      return "#ffcc33"
    }
    else if (magnitude < 4) {
      return "#ff9933"
    }
    else if (magnitude < 5) {
      return "#ff6633"
    }
    else {
      return "#ff3333"
    }
  }
  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
    // Define satellitemap, grayscalemap, and outdoorsmap layers
   
    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });
  
    var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.light",
      accessToken: API_KEY
    });
    
    var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });
  
  // Define object to hold the base layers
    var baseMaps = {
      "Outdoor Map": outdoorsmap,
      "Greyscale Map": grayscalemap,
      "Satellite Map": satellitemap
    };

  // Create the faultline 
    
    var faultLine = new L.LayerGroup();

   // Create object to hold the overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
      FaultLines: faultLine
    };
    
    // Create the map, giving it the outdoorsmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 4,
      layers: [outdoorsmap, earthquakes, faultLine]
    });
  
   
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
    
    // Create the faultlines and add them to the faultline layer
    d3.json(faultlinequery, function(data) {
      L.geoJSON(data, {
        style: function() {
          return {color: "orange", fillOpacity: 0}
        }
      }).addTo(faultLine)
    })
  
    // color function to be used when creating the legend
    function getColor(mag) {
      return mag > 5 ? '#ff3333' :
             mag > 4  ? '#ff6633' :
             mag > 3  ? '#ff9933' :
             mag > 2  ? '#ffcc33' :
             mag > 1  ? '#ffff33' :
                      '#ccff33';
    }
  
    // Add a legend to the map
    var legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function (map) {
    
        var div = L.DomUtil.create('div', 'info legend'),
            mags = [0, 1, 2, 3, 4, 5],
            labels = [];
    
        // loop through the density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < mags.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
                mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
        }
    
        return div;
    };
    
    legend.addTo(myMap);
  }