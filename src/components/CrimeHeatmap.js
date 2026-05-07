import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

function CrimeHeatmap({ crimeData }) {

  const map = useMap();

  useEffect(() => {

    if (!crimeData || crimeData.length === 0) return;

    const heatPoints = crimeData.map((c) => [
      parseFloat(c.Latitude),
      parseFloat(c.Longitude),
      c.risk === 2 ? 1 : 0.4,
    ]);

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 30,
      blur: 18,
      maxZoom: 17,
    }).addTo(map);

    const markers = [];

    crimeData
      .filter((point) => point.risk === 2)
      .slice(0, 120)
      .forEach((point) => {

        const marker = L.circleMarker(
          [point.Latitude, point.Longitude],
          {
            radius: 4,
            color: "red",
            fillColor: "#ff0000",
            fillOpacity: 0.8,
          }
        ).addTo(map);

        marker.bindPopup(`
          <b>⚠ High Crime Area</b>
        `);

        markers.push(marker);

      });

    return () => {

      map.removeLayer(heatLayer);

      markers.forEach((m) => {
        map.removeLayer(m);
      });

    };

  }, [crimeData, map]);

  return null;
}

export default CrimeHeatmap;