mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: "cluster-map",
    style: "mapbox://styles/mapbox/dark-v10",
    center: [19.19179687498357, 47.18995747013945],
    zoom: 6.1,
});

const controlOptions = {
    showCompass: true,
    showZoom: true,
    visualizePitch: true,
};

map.addControl(new mapboxgl.NavigationControl(controlOptions), "top-right");

map.on("load", function () {
    map.addSource("campgrounds", {
        type: "geojson",

        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
    });

    map.addLayer({
        id: "clusters",
        type: "circle",
        source: "campgrounds",
        filter: ["has", "point_count"],
        paint: {
            "circle-color": ["step", ["get", "point_count"], "#03A9F4", 10, "#2196F3", 30, "#3F51B5"],
            "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 30, 25],
        },
    });

    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "campgrounds",
        filter: ["has", "point_count"],
        layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
        },
    });

    map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "campgrounds",
        filter: ["!", ["has", "point_count"]],
        paint: {
            "circle-color": "#1A237E",
            "circle-radius": 6,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff",
        },
    });

    map.on("click", "clusters", function (e) {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
        });
        const clusterId = features[0].properties.cluster_id;
        map.getSource("campgrounds").getClusterExpansionZoom(clusterId, function (err, zoom) {
            if (err) return;

            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
            });
        });
    });

    map.on("click", "unclustered-point", function (e) {
        const text = e.features[0].properties.popUpMarkup;
        const coordinates = e.features[0].geometry.coordinates.slice();

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup().setLngLat(coordinates).setHTML(text).addTo(map);
    });

    map.on("mouseenter", "clusters", function () {
        map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", function () {
        map.getCanvas().style.cursor = "";
    });
});
