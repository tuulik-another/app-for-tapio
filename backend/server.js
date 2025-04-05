import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { createReadStream } from "fs";
import csvParser from "csv-parser";
import dotenv from "dotenv";
import { vehiclePositions } from "./traffic.js";

dotenv.config();
const app = express();
app.use(cors());

app.get("/api/vehicles", async (req, res) => {
    try {
        const vehiclePositions = vehiclePositions();
        res.json({ vehicles: vehiclePositions });
    } catch (error) {
        console.error("Error fetching GTFS data:", error);
        res.status(500).json({ error: "Failed to fetch GTFS data" });
    }
});

app.get("api/fun-fact", (req, res) => {
    

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
