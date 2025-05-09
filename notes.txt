Why I Picked the OpenSky API
I chose the OpenSky Network API because it provides near real-time flight tracking data that is freely accessible without an API key for public usage.
This made it ideal for integrating with Windborne's balloon dataset, which also includes live location data. By combining these two sources, I could 
explore how different airborne objects (balloons vs. planes) coexist in airspace and identify potential proximity or conflict zones.

OpenSky’s data structure is straightforward, and it includes important details like latitude, longitude, altitude, and callsign, which are crucial for
 spatial analysis. It also refreshes frequently, which aligns well with the Windborne constellation's hourly updates. The combination helped me build a 
 live, interactive map showing spatial relationships between balloons and aircraft in real-time.

Technical Decisions

I added proximity logic based on distance and altitude thresholds to simulate airspace conflict alerts.

I used Leaflet.js for mapping because it is lightweight, beginner-friendly, and works well with custom markers and tooltips.

I deployed via Vercel for its seamless integration with GitHub and support for Next.js-style API routes, which helped bypass CORS issues with Windborne’s data.

Challenges I Faced

Windborne's files often return inconsistent or malformed JSON, which required extra error handling.

CORS restrictions made it necessary to set up a custom serverless API route to safely fetch and merge hourly balloon data.