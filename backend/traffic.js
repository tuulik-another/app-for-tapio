import fetch from "node-fetch";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { createReadStream } from "fs";
import csvParser from "csv-parser";

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

createReadStream("./resources/routes.txt")
    .pipe(csvParser())
    .on("data", (row) => {
        routes[row.route_id] = row;
    })
    .on("end", () => {
        console.log("Routes loaded:", routes);
    })
    .on("error", (error) => {
        console.error("Error reading routes file:", error);
    }); 

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

export default { vehiclePositions };