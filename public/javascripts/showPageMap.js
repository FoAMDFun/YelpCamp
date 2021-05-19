const mapStyle = "mapbox://styles/mapbox/light-v10";
mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: "map",
    style: mapStyle,
    center: campground.geometry.coordinates,
    zoom: 8,
});

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<center><h3>${campground.title}</h3><p>${campground.location}</p></center>`))
    .addTo(map);
