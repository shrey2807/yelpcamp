mapboxgl.accessToken = mapToken;
if(campground.geometry.coordinates.length === 2){
    const map = new mapboxgl.Map({
        container: 'map',
        // style: 'mapbox://styles/shrey2807/ckuzl3cq70xhq16phhaph92uz', 
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        center: campground.geometry.coordinates,// starting position [lng, lat]
        zoom: 9 // starting zoom
    });
    new mapboxgl.Marker({
        color: '#ef2b3a'
    })
        .setLngLat(campground.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 })
                .setHTML(
                    `<h3>${campground.title}</h3><p>${campground.location}</p>`
                )
        )
        .addTo(map)
}
