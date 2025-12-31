import React from "react";
import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

const deliveryBoyIcon = new L.Icon({
  iconUrl: scooter,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const customerIcon = new L.Icon({
  iconUrl: home,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const DeliveryBoyTracking = ({ data }) => {
  const deliveryBoyLatitude = data?.deliveryBoyLocation?.lat;
  const deliveryBoyLongitude = data?.deliveryBoyLocation?.lon;
  const customerLatitude = data?.customerLocation?.lat;
  const customerLongitude = data?.customerLocation?.lon;

  const path = [
    [deliveryBoyLatitude, deliveryBoyLongitude],
    [customerLatitude, customerLongitude],
  ];

  const center = [deliveryBoyLatitude, deliveryBoyLongitude];

  return (
    <div className="w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md">
      <MapContainer
        className="w-full h-full"
        center={center}
        zoom={16}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[deliveryBoyLatitude, deliveryBoyLongitude]} icon={deliveryBoyIcon}>
            <Popup>Delivery Boy</Popup>
        </Marker>

        <Marker position={[customerLatitude, customerLongitude]} icon={customerIcon}>
            <Popup>Delivery Address</Popup>
        </Marker>

        <Polyline positions={path} color="blue" weight={2}/>
      </MapContainer>
    </div>
  );
};

export default DeliveryBoyTracking;
