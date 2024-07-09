// Initialize Leaflet map
var map = L.map('map').setView([0, 0], 2); // Centered at [0, 0] with zoom level 2

// Add OpenStreetMap tiles as base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch GeoJSON data from USGS
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then(response => response.json())
  .then(data => {
    // Define a function to determine marker size based on earthquake magnitude
    function getMarkerSize(magnitude) {
      return magnitude * 5; // Adjust multiplier as needed
    }

    // Define a function to determine marker color based on earthquake depth
    function getMarkerColor(depth) {
      // Depth range example: shallow to deep (blue to red)
      var colors = ['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476', '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc', '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'];
      var idx = Math.floor((depth + 10) / 100); // Adjust divisor based on actual depth range
      return colors[idx];
    }

    // Add GeoJSON layer to map
    L.geoJSON(data.features, {
      pointToLayer: function (feature, latlng) {
        var markerOptions = {
          radius: getMarkerSize(feature.properties.mag),
          fillColor: getMarkerColor(feature.geometry.coordinates[2]),
          color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        };
        return L.circleMarker(latlng, markerOptions);
      },
      onEachFeature: function (feature, layer) {
        layer.bindPopup(`<b>Magnitude:</b> ${feature.properties.mag}<br><b>Location:</b> ${feature.properties.place}`);
      }
    }).addTo(map);

    // Create a legend
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      var div = L.DomUtil.create('div', 'info legend');
      var depths = [-10, 10, 30, 50, 70, 90]; // Example depth ranges
      var labels = [];

      div.innerHTML += '<h4>Depth Legend</h4>';
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
          '<i style="background:' + getMarkerColor(depths[i] + 1) + '"></i> ' +
          depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
      }

      return div;
    };

    legend.addTo(map);
  })
  .catch(error => {
    console.error('Error fetching earthquake data:', error);
  });
