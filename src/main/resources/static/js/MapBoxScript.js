mapboxgl.accessToken = '########################';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v11',
    center: [77.11711054379293, 28.75000520237887], // starting position
    zoom: 15
});
// set the bounds of the map
var bounds = [[76.11711054379293, 27.75000520237887], [78.11711054379293, 29.75000520237887]];
map.setMaxBounds(bounds);

// initialize the map canvas to interact with later
var canvas = map.getCanvasContainer();

// an arbitrary start will always be the same
// only the end or destination will change
var start = [77.11711054379293, 28.75000520237887];

// this is where the code for the next step will go
// create a function to make a directions request
function getRoute(start, end) {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    // start = [77.2502919,28.5153806];
    var url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function() {
        var json = JSON.parse(req.response);
        var data = json.routes[0];
        var route = data.geometry.coordinates;
        var geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route
            }
        };
        // if the route already exists on the map, reset it using setData
        if (map.getSource('route')) {
            map.getSource('route').setData(geojson);
        } else { // otherwise, make a new request
            map.addLayer({
                id: 'route',
                type: 'line',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: geojson
                        }
                    }
                },
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3887be',
                    'line-width': 5,
                    'line-opacity': 0.75
                }
            });
        }
        // add turn instructions here at the end
    };
    req.send();
}

map.on('load', function() {
    // make an initial directions request that
    // starts and ends at the same location
    getRoute(start,start);

    // Add starting point to the map
    // map.addLayer({
    //     id: 'point',
    //     type: 'circle',
    //     source: {
    //         type: 'geojson',
    //         data: {
    //             type: 'FeatureCollection',
    //             features: [{
    //                 type: 'Feature',
    //                 properties: {},
    //                 geometry: {
    //                     type: 'Point',
    //                     coordinates: start
    //                 }
    //             }
    //             ]
    //         }
    //     },
    //     paint: {
    //         'circle-radius': 10,
    //         'circle-color': '#3887be'
    //     }
    // });


    // this is where the code from the next step will go
    map.on('hehe', function(e) {
        var coordsObj = e.lngLat;
        canvas.style.cursor = '';
        var coords = Object.keys(coordsObj).map(function(key) {
            return coordsObj[key];
        });
        var end = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Point',
                    coordinates: coords
                }
            }
            ]
        };
        if (map.getLayer('end')) {
            map.getSource('end').setData(end);
        } else {
            map.addLayer({
                id: 'end',
                type: 'circle',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [{
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: coords
                            }
                        }]
                    }
                },
                paint: {
                    'circle-radius': 10,
                    'circle-color': '#ff3300'
                }
            });
        }
        getRoute(coords, coords);
    });

});