import ep1 from '../api/ep1';
import global1 from '../pages/global1';


import React, { useState } from "react";
// import { allocateSeats } from "../api";

export default function SeatAllocator() {
  const [roomCapacity, setRoomCapacity] = useState("");
  const [programs, setPrograms] = useState([{ name: "", studentCount: "" }]);
  const [seats, setSeats] = useState([]);

  const handleAddProgram = () => {
    setPrograms([...programs, { name: "", studentCount: "" }]);
  };

  const handleChange = (index, field, value) => {
    const newPrograms = [...programs];
    newPrograms[index][field] = value;
    setPrograms(newPrograms);
  };

  const handleSubmit = async () => {
    const data = {
      roomCapacity: Number(roomCapacity),
      programs: programs.map((p) => ({
        name: p.name,
        studentCount: Number(p.studentCount),
      })),
    };

    //const res = await allocateSeats(data);
    const res = await ep1.post('/api/v2/allocate', data);
    setSeats(res.data.seats);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Exam Seat Allocator</h1>

      <div className="mb-3">
        <label>Room Capacity:</label>
        <input
          type="number"
          className="border p-2 w-full"
          value={roomCapacity}
          onChange={(e) => setRoomCapacity(e.target.value)}
        />
      </div>

      <h2 className="text-lg font-semibold mt-4">Programs</h2>
      {programs.map((p, i) => (
        <div key={i} className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Program Name"
            className="border p-2 flex-1"
            value={p.name}
            onChange={(e) => handleChange(i, "name", e.target.value)}
          />
          <input
            type="number"
            placeholder="Student Count"
            className="border p-2 w-32"
            value={p.studentCount}
            onChange={(e) => handleChange(i, "studentCount", e.target.value)}
          />
        </div>
      ))}
      <button
        onClick={handleAddProgram}
        className="mt-3 bg-blue-500 text-white px-3 py-1 rounded"
      >
        + Add Program
      </button>

      <button
        onClick={handleSubmit}
        className="mt-5 bg-green-600 text-white px-4 py-2 rounded"
      >
        Allocate Seats
      </button>

      {seats.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Seat Allocation Result:</h3>
          <ul className="border p-3 bg-gray-50 rounded">
            {seats.map((s) => (
              <li key={s.seatNumber}>
                Seat {s.seatNumber}: <strong>{s.program}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
