async function geocodeBulk(codes) {
    return Promise.all(codes.map(c => ymaps.geocode(c)));
}

function ejectCoordinates(geocodeBulkArray) {
    return geocodeBulkArray.map((geocode) => {
        const obj = geocode.geoObjects.get(0);
        return obj.geometry.getCoordinates();
    });
}

async function streetsToCoords(streets) {
    const geocodes = await geocodeBulk(streets);
    const ejected = ejectCoordinates(geocodes);
    console.log(ejected);
    
    return ejected;
}
