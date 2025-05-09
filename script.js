const map = L.map('map').setView([37.7749, -122.4194], 4);
const bounds = L.latLngBounds(
    L.latLng(-60, -180),
    L.latLng(85, 180)        
);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

function getDistance(lat1, lon1, lat2, lon2){
    const R = 6371; // Radius of the Earth in km
    const toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

}

async function fetchBalloonData() {
    try {
        const response = await fetch('/api/balloon');
        const data = await response.json();
        console.log("Balloon data:", data); 
        return data;
    } catch (e) {
        console.error('Error fetching balloon data:', e);
        return [];
    }
}



async function fetchAircraftData() {
    

    map.setMaxBounds(bounds);
    map.on('drag', function() {
        map.panInsideBounds(bounds, { animate: false });
    });

    map.setMinZoom(2);
    map.setMaxZoom(10);

    try {
        const response = await fetch('https://opensky-network.org/api/states/all');
        const data = await response.json();
        return data.states || [];
    }
    catch (e) {
        console.error('Error fetching aircraft data:', e);
        return [];
    }
}

function addMarker(lat, lon, label, color) {
    L.circleMarker([lat, lon], {
        color,
        radius: 5,
    }).addTo(map).bindPopup(label);
}

async function run() {
    const balloons = await fetchBalloonData();
    const planes = await fetchAircraftData();

    const balloonPositions = balloons
        .filter(b => Array.isArray(b) && b.length >= 3)
        .map(b => ({
            lat: b[0],
            lon: b[1],
            alt: b[2],
}));
    
    const planePositions = planes.map(p => ({
        lat: p[6],
        lon: p[5],
        alt: p[7],
        callsign: p[1],
    })).filter(p => p.lat && p.lon);

    balloonPositions.forEach(balloon => {
        console.log("Balloon position:", balloon);
        console.log(`Adding marker at lat: ${balloon.lat}, lon: ${balloon.lon}`);

        // addMarker(balloon.lat, balloon.lon, `Balloon at ${balloon.lat.toFixed(2)}, ${balloon.lon.toFixed(2)}`, "red");
        addMarker(balloon.lat, balloon.lon, `Balloon at ${balloon.lat.toFixed(2)}, ${balloon.lon.toFixed(2)}`, "red");
        bounds.extend([balloon.lat, balloon.lon]);
        

        planePositions.forEach(plane => {
            const d = getDistance(balloon.lat, balloon.lon, plane.lat, plane.lon);
            const altDiff = Math.abs((balloon.alt || 0) - (plane.alt || 0));


            if (d < 50 && altDiff < 1000) {
                console.log(`Conflict: ${plane.callsign} near balloon`);
                // addMarker(plane.lat, plane.lon, `Aircraft: ${plane.callsign || 'unknown'}`, "orange");
                addMarker(plane.lat, plane.lon, `Aircraft: ${plane.callsign || 'unknown'}`, "orange");
                bounds.extend([plane.lat, plane.lon]);

            }
        });
    });
    document.getElementById('spinner').style.display = 'none';
    if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.2)); // pad() adds some breathing room
      }
      

}

run();
    