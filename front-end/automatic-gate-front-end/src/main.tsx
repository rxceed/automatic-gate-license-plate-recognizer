import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



/*
  async function fetchIdByName(targetName: string) {
    try {
      const response = await fetch("/your-endpoint", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Network error: " + response.status);
      }

      const data = await response.json(); // expected to be an array

      // Find matching item
      const match = data.find((item: any) => item.name === targetName);

      if (!match) {
        console.log("No match found for:", targetName);
        return null;
      }

      console.log("Found ID:", match.id);
      return match.id;

    } catch (error) {
      console.error("Fetch failed:", error);
      return null;
    }
  }

  async function handleAddPlate(e: React.FormEvent) {
    e.preventDefault();
    const userID = await fetchIdByName(ownerName);
    await fetch(`http://127.0.0.1:3000/api/user/${userID}/vehicle`, {
      method: "POST",
      body: JSON.stringify({ license_plate: plateNumber, vehicle_type: vehicleType }),
    });

    setPlateNumber("");
    setVehicleType("car");
  }

  async function handleAddOwner(e: React.FormEvent) {
    e.preventDefault();

    await fetch("http://127.0.0.1:3000/api/user/", {
      method: "POST",
      body: JSON.stringify({ name: ownerName, identity_card_number: idCard, birthdate: birthdate, }),
    });

    const newEntry: Plate = {
      id: Date.now(),
      plate_number: plateNumber,
      vehicle_type: vehicleType,
      owner_name: ownerName,
      id_card: idCard,
      birthdate: birthdate,
    };










*/
