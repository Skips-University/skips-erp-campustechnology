import React, { useState } from "react";
import axios from "axios";
import ep1 from '../api/ep1';

export default function SeatAllocator() {
  const [rooms, setRooms] = useState([{ roomName: "", capacity: "" }]);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [pdfLink, setPdfLink] = useState(null);

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
      // const res = await axios.post(
      //   "http://localhost:3000/api24/allocate-with-excel",
      const res = await ep1.post(
        "/api24/allocate-with-excel",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(res.data.allocation);
      setPdfLink(res.data.pdfLink);
    } catch (err) {
      alert(err.response?.data?.message || "Error allocating seats");
    }
  };

  const renderRoomLayout = (room) => {
    const cols = 5; // number of columns (adjust as needed)
    const rows = Math.ceil(room.seats.length / cols);
    const grid = [];

    for (let r = 0; r < rows; r++) {
      const rowSeats = room.seats.slice(r * cols, (r + 1) * cols);
      grid.push(
        <div key={r} className="flex justify-center gap-4 mb-2">
          {rowSeats.map((s) => (
            <div
              key={s.seatNumber}
              className="border rounded p-2 bg-gray-100 text-center w-32"
            >
              <div className="font-bold text-sm">Seat {s.seatNumber}</div>
              <div className="text-xs">{s.name}</div>
              <div className="text-xs">{s.program}</div>
            </div>
          ))}
        </div>
      );
    }

    return grid;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Multi-Room Exam Seat Allocator
      </h1>

      <h2 className="text-lg font-semibold mb-2">Room Details</h2>
      {rooms.map((r, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Room Name"
            className="border p-2 flex-1"
            value={r.roomName}
            onChange={(e) => handleRoomChange(i, "roomName", e.target.value)}
          />
          <input
            type="number"
            placeholder="Capacity"
            className="border p-2 w-32"
            value={r.capacity}
            onChange={(e) => handleRoomChange(i, "capacity", e.target.value)}
          />
        </div>
      ))}
      <button
        onClick={handleAddRoom}
        className="bg-blue-500 text-white px-3 py-1 rounded mb-4"
      >
        + Add Room
      </button>

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
          <h3 className="font-bold text-xl mb-4">Seating Results</h3>

          {pdfLink && (
            <a
              href={pdfLink}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-500 text-white px-3 py-2 rounded inline-block mb-4"
            >
              Download Seating Chart (PDF)
            </a>
          )}

          {result.rooms.map((room) => (
            <div
              key={room.roomName}
              className="border p-4 mb-6 bg-gray-50 rounded"
            >
              <h4 className="font-semibold mb-2">
                {room.roomName} ({room.capacity} seats)
              </h4>
              <div>{renderRoomLayout(room)}</div>
            </div>
          ))}

          {result.unallocated && result.unallocated.length > 0 && (
            <div className="border p-4 bg-yellow-50 rounded">
              <h4 className="font-bold mb-2 text-red-700">
                Unallocated Students (No Seats Left)
              </h4>
              <ul>
                {result.unallocated.map((s, idx) => (
                  <li key={idx}>
                    {s.name} ({s.regNo}) — {s.program}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
