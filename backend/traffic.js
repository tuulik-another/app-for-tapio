import fetch from "node-fetch";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import csvParser from "csv-parser";
import AdmZip from "adm-zip";
import { Readable } from "stream";

const vehicleType = (id) => {
    const operator = id.split("/")[0];
    switch (operator) {
        case "40":
            return "tram";
        case "50":
            return "metro";
        case "60":
            return "ferry";
        case "90":
            return "train";
        default:
            return "bus";
    }
}

const routes = {};
const stops = {};

const fetchAndParseGTFS = async () => {
    try {
        const response = await fetch("https://infopalvelut.storage.hsldev.com/gtfs/hsl.zip");
        if (!response.ok) {
            throw new Error(`Failed to fetch GTFS data: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const zip = new AdmZip(buffer);

        const routesFile = zip.getEntry("routes.txt");
        if (routesFile) {
            const routesStream = Readable.from(routesFile.getData().toString("utf-8"));
            routesStream.pipe(csvParser())
                .on("data", (row) => {
                    routes[row.route_id] = row;
                })
                .on("end", () => {
                    console.log("Routes loaded:", Object.keys(routes).length);
                })
                .on("error", (error) => {
                    console.error("Error parsing routes.txt:", error);
                });
        } else {
            console.error("routes.txt not found in GTFS ZIP");
        }

        const stopsFile = zip.getEntry("stops.txt");
        if (stopsFile) {
            const stopsStream = Readable.from(stopsFile.getData().toString("utf-8"));
            stopsStream.pipe(csvParser())
                .on("data", (row) => {
                    stops[row.stop_id] = row;
                })
                .on("end", () => {
                    console.log("Stops loaded:", Object.keys(stops).length);
                })
                .on("error", (error) => {
                    console.error("Error parsing stops.txt:", error);
                });
        } else {
            console.error("stops.txt not found in GTFS ZIP");
        }
    } catch (error) {
        console.error("Error fetching or parsing GTFS data:", error);
    }
};

fetchAndParseGTFS();

const vehiclePositions = async () => {
    const response = await fetch("https://realtime.hsl.fi/realtime/vehicle-positions/v2/hsl");
    if (!response.ok) {
        const error = new Error(`${response.url}: ${response.status} ${response.statusText}`);
        error.response = response;
        throw error;
    }
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(buffer)
    );

    return feed.entity.filter(
        (entity) => entity.hasOwnProperty("vehicle")
    ).map(v => {
        const route = routes[v.vehicle.trip.routeId];
        if (!route) {
            console.warn(`Route not found for ID: ${v.vehicle.trip.routeId}`);
        }
        return {
            id: v.vehicle.vehicle.id,
            lat: v.vehicle.position.latitude,
            lon: v.vehicle.position.longitude,
            routeId: v.vehicle.trip.routeId,
            stopId: v.vehicle.stopId,
            timestamp: v.vehicle.timestamp.toNumber() * 1000,
            vehicleType: vehicleType(v.vehicle.vehicle.id),
            line: route ? route.route_short_name : null,
            lineName: route ? route.route_long_name : null,
        };
    });
}

const getStops = () => {
    return Object.entries(stops).map(([id, stop]) => ({
        id,
        name: `${stop.stop_code} ${stop.stop_name}`,
        lat: parseFloat(stop.stop_lat),
        lon: parseFloat(stop.stop_lon),
    }));
}

export default { vehiclePositions, getStops };