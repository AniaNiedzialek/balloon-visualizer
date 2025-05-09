const map = L.map('map').setView([37.7749, -122.4194], 4);

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
    const url = 'https://a.windbornesystems.com/treasure/00.json';
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;

    }
    catch (e) {
        console.error('Error fetching balloon data:', e);
        return [];
    }
}


async function fetchAircraftData() {
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

    const balloonPositions = balloons.map(b => ({
        lat: b.lat,
        lon: b.lon,
        alt: b.altitude,
    }));
    const planePositions = planes.map(p => ({
        lat: p[6],
        lon: p[5],
        alt: p[7],
        callsing: p[1],
    })).filter(p => p.lat && p.lon);

    balloonPositions.forEach(balloon => {
        addMarker(balloon.lat, balloon.lon, "Balloon", "red");

        planePositions.forEach(plane => {
            const d = getDistance(balloon.lat, balloon.lon, plane.lat, plane.lon);
            const altDiff = Math.abs((balloon.alt || 0) - (plane.alt || 0));


            if (d < 50 && altDiff < 1000) {
                console.log(`Conflict: ${plane.callsing} near balloon`);
                addMarker(plane.lat, plane.lon, `Aircraft: ${plane.callsing}`, "orange");
            }
        });
    });
}

run();
    