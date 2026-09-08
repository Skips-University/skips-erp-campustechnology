import React, { useState } from "react";
import axios from "axios";

export default function SeatAllocator() {
  const [rooms, setRooms] = useState([{ roomName: "", capacity: "" }]);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleAddRoom = () => {
    setRooms([...rooms, { roomName: "", capacity: "" }]);
  };

  const handleRoomChange = (index, field, value) => {
    const updated = [...rooms];
    updated[index][field] = value;
    setRooms(updated);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("rooms", JSON.stringify({ rooms }));

    try {
      const res = await axios.post(
        // "http://localhost:3000/api23/allocate-with-excel",
        "https://epaathsalamain.azurewebsites.net/api23/allocate-with-excel",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error allocating seats");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Multi-Room Exam Seat Allocator (Excel Upload)
      </h1>

      <h2 className="text-lg font-semibold mb-2">Room Details</h2>
      {rooms.map((r, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Room Name"
            className="border p-2 flex-1"
            value={r.roomName}
            onChange={(e) =>
              handleRoomChange(i, "roomName", e.target.value)
            }
          />
          <input
            type="number"
            placeholder="Capacity"
            className="border p-2 w-32"
            value={r.capacity}
            onChange={(e) =>
              handleRoomChange(i, "capacity", e.target.value)
            }
          />
        </div>
      ))}
      <button
        onClick={handleAddRoom}
        className="bg-blue-500 text-white px-3 py-1 rounded mb-4"
      >
        + Add Room
      </button>
      <p>Format for excel file Name,RegNo,Program</p>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">
          Upload Student Excel File:
        </label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-2 w-full"
        />
      </div>

      <button
        onClick={handleUpload}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Allocate Seats
      </button>

      {result && (
        <div className="mt-6">
          <h3 className="font-bold text-xl mb-2">Allocation Result</h3>
          {result.rooms.map((room) => (
            <div
              key={room.roomName}
              className="border p-4 mb-4 bg-gray-50 rounded"
            >
              <h4 className="font-semibold mb-2">
                {room.roomName} ({room.capacity} seats)
              </h4>
              <ul className="border bg-white p-2 rounded">
                {room.seats.map((s) => (
                  <li key={s.seatNumber}>
                    Seat {s.seatNumber}: {s.name} ({s.regNo}) —{" "}
                    <strong>{s.program}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
