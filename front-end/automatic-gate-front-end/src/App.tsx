import React, { useState, useEffect } from "react";

interface Vehicle {
  license_plate: string;
  vehicle_type: string;
  vehicle_id: string;
}

interface User {
  _id: string;
  name: string;
  birthdate: string;
  identity_card_number: string;
  vehicles: Vehicle[];
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);

  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("car");

  const [ownerName, setOwnerName] = useState("");
  const [idCard, setIdCard] = useState("");
  const [birthdate, setBirthdate] = useState("");

  // Load users from database
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("http://127.0.0.1:3000/api/user/"); // GET request
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error("Failed to load users", err);
      }
    }
    loadUsers();
  }, []);

  async function fetchIdByName(targetName: string) {
    try {
      const response = await fetch("http://127.0.0.1:3000/api/user/", {
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

    setOwnerName("");
    setIdCard("");
    setBirthdate("");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">🚗 Smart Gate Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Register Plate */}
        <div className="bg-white shadow rounded p-4 border">
          <h2 className="text-lg font-semibold mb-3">Register Plate Number</h2>
          <form onSubmit={handleAddPlate}>
            <div className="mb-3">
              <label className="block mb-1">Plate Number</label>
              <input
                className="w-full p-2 border rounded"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="block mb-1">Vehicle Type</label>
              <select
                className="w-full p-2 border rounded"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>

            <button className="w-full bg-blue-600 text-white p-2 rounded">
              Add Plate
            </button>
          </form>
        </div>

        {/* Register Owner */}
        <div className="bg-white shadow rounded p-4 border">
          <h2 className="text-lg font-semibold mb-3">Register Owner</h2>
          <form onSubmit={handleAddOwner}>
            <div className="mb-3">
              <label className="block mb-1">Owner Name</label>
              <input
                className="w-full p-2 border rounded"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="block mb-1">Identity Card Number</label>
              <input
                className="w-full p-2 border rounded"
                value={idCard}
                onChange={(e) => setIdCard(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="block mb-1">Birthdate</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                required
              />
            </div>

            <button className="w-full bg-green-600 text-white p-2 rounded">
              Register Owner
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="md:col-span-1 bg-white shadow border rounded p-4">
          <h2 className="text-lg font-semibold mb-3">Allowed Vehicles</h2>

          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Owner</th>
                <th className="p-2 border">Plate</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Vehicle ID</th>
              </tr>
            </thead>
            <tbody>
              {users.flatMap((u) =>
                u.vehicles.map((v) => (
                  <tr key={v.vehicle_id}>
                    <td className="p-2 border">{u.name}</td>
                    <td className="p-2 border font-bold">{v.license_plate}</td>
                    <td className="p-2 border">{v.vehicle_type}</td>
                    <td className="p-2 border">{v.vehicle_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
