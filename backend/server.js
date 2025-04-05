import express from "express";
import cors from "cors";
import traffic from "./traffic.js";
import ai from "./ai.js";

const app = express();
app.use(cors());

app.get("/api/vehicles", async (req, res) => {
    try {
        const vehiclePositions = await traffic.vehiclePositions();
        res.json({ vehicles: vehiclePositions });
    } catch (error) {
        console.error("Error fetching GTFS data:", error);
        res.status(500).json({ error: "Failed to fetch GTFS data" });
    }
});

app.get("/api/fun-fact", async (req, res) => {
    try {
        const funFact = await ai.generateFunTransportFact();
        res.json({ funFact });
    }
    catch (error) {
        console.error("Error fetching fun transport fact:", error);
        res.status(500).json({ error: "Failed to fetch fun transport fact" });
    }
});
    
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
