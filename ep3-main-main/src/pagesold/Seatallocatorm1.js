import React, { useState } from "react";
import { allocateSeats } from "./seatapi1";

export default function SeatAllocator() {
  const [roomCapacity, setRoomCapacity] = useState("");
  const [totalRooms, setTotalRooms] = useState("");
  const [programs, setPrograms] = useState([{ name: "", studentCount: "" }]);
  const [rooms, setRooms] = useState([]);

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
      totalRooms: Number(totalRooms),
      programs: programs.map((p) => ({
        name: p.name,
        studentCount: Number(p.studentCount),
      })),
    };

    try {
      const res = await allocateSeats(data);
      setRooms(res.data.rooms);
    } catch (err) {
      alert(err.response?.data?.message || "Error allocating seats");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Multi-Room Exam Seat Allocator</h1>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label>Room Capacity:</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={roomCapacity}
            onChange={(e) => setRoomCapacity(e.target.value)}
          />
        </div>
        <div>
          <label>Total Rooms:</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={totalRooms}
            onChange={(e) => setTotalRooms(e.target.value)}
          />
        </div>
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

      {rooms.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-xl mb-4">Room Allocations</h3>
          {rooms.map((room) => (
            <div
              key={room.roomNumber}
              className="border p-4 mb-4 bg-gray-50 rounded"
            >
              <h4 className="font-semibold mb-2">
                Room {room.roomNumber} ({room.seats.length} students)
              </h4>
              <ul className="grid grid-cols-2 gap-1">
                {room.seats.map((s) => (
                  <li key={s.seatNumber}>
                    Seat {s.seatNumber}: <strong>{s.program}</strong>
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
