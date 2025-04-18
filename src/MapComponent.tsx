import { useRef, useEffect, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Fill, Stroke, Circle, Text } from 'ol/style';
import Overlay from "ol/Overlay"; 

enum VehicleType {
  BUS = 'bus',
  TRAM = 'tram',
  TRAIN = 'train',
  METRO = 'metro',
  FERRY = 'ferry',
}

type VehiclePosition = {
  id: string;
  lat: number;
  lon: number;
  routeId: string;
  stopId: string;
  timestamp: number;
  vehicleType: VehicleType;
  line?: string;
  lineName?: string;
}

type Stop = {
  name: string;
  lat: number;
  lon: number;
}

const vehicleColor = (vehicleType: VehicleType) => {
  switch (vehicleType) {
    case VehicleType.BUS:
      return 'blue';
    case VehicleType.TRAM:
      return 'green';
    case VehicleType.TRAIN:
      return 'purple';
    case VehicleType.METRO:
      return 'orange';
    case VehicleType.FERRY:
      return 'yellow';
    default:
      return 'gray';
  }
}

const vehicleStyle = (vehicleType: VehicleType, line?: string) => new Style({
  image: new Circle({
    radius: 12,
    fill: new Fill({ color: vehicleColor(vehicleType) }),
    stroke: new Stroke({ color: 'white', width: 2 }),
  }),
  text: new Text({
    text: line || '',
    fill: new Fill({ color: 'white' }),
    stroke: new Stroke({ color: 'black', width: 2 }),
    font: 'bold 12px Arial',
    textAlign: 'center',
    textBaseline: 'middle',
  }),
});

const vehicleSource = new VectorSource();
const vehicleLayer = new VectorLayer({
  source: vehicleSource,
});
const stopSource = new VectorSource();
const stopLayer = new VectorLayer({
  source: stopSource,
});

const updateTransitMarkers = async () => {
  try {
      const response = await fetch("http://localhost:5000/api/vehicles");
      const json = await response.json();

      vehicleSource.clear();

      json.vehicles.forEach((vehicle: VehiclePosition) => {
          const feature = new Feature({
              geometry: new Point(fromLonLat([vehicle.lon, vehicle.lat])),
          });
          feature.set('name', vehicle.lineName);
          feature.set('vehicleType', vehicle.vehicleType);
          vehicleSource.addFeature(feature);
          feature.setStyle(vehicleStyle(vehicle.vehicleType, vehicle.line));
      });
  } catch (error) {
      console.error("Failed to fetch vehicle data:", error);
  }
}

const putStopsOnMap = async () => {
  try {
      const response = await fetch("http://localhost:5000/api/stops");
      const json = await response.json();

      stopSource.clear();

      json.stops.forEach((stop: Stop) => {
          const feature = new Feature({
              geometry: new Point(fromLonLat([stop.lon, stop.lat])),
          });
          feature.setStyle(new Style({
              image: new Circle({
                  radius: 5,
                  fill: new Fill({ color: 'black' }),
              }),
          }));
          stopSource.addFeature(feature);
          feature.set('name', stop.name);
        });
  } catch (error) {
      console.error("Failed to fetch stop data:", error);
  }
}

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vehicleLayer,
        stopLayer,
      ],
      view: new View({
        center: fromLonLat([24.9458, 60.1699]),
        zoom: 17,
      }),
    });

    setMapInstance(map);

    updateTransitMarkers();
    const interval = setInterval(updateTransitMarkers, 3000);

    putStopsOnMap();

    return () => {
      map.setTarget("");
      clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    console.log("Map instance updated:", mapInstance);
    if (!mapInstance || !tooltipRef.current) return;
  
    const tooltip = new Overlay({
      element: tooltipRef.current,
      offset: [10, 0],
      positioning: "center-left",
    });
  
    mapInstance.addOverlay(tooltip);
    console.log("Tooltip added to map");
  
    mapInstance.on("pointermove", (event) => {
      if (!tooltipRef.current) return;
      const features = mapInstance.getFeaturesAtPixel(event.pixel);
      if (features && features.length > 0) {
        const feature = features[0];
        const line = feature.get("name");
        if (line) {
          tooltipRef.current.innerHTML = line;
          tooltip.setPosition(event.coordinate); 
          tooltipRef.current.classList.remove("hidden");
        }
      } else {
        tooltipRef.current.classList.add("hidden");
      }
    });
  }, [mapInstance, tooltipRef.current]);

  return (
    <div>
      <div ref={mapRef} className="h-screen w-screen"></div>
      <div
        ref={tooltipRef}
        className="absolute hidden p-2 rounded border border-black pointer-events-none bg-white"
      ></div>
    </div>
  );
};

export default MapComponent;
