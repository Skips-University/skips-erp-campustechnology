import React, { useState } from "react";
import { allocateSeats } from "./seatapi2";

export default function SeatAllocator() {
  const [roomCapacity, setRoomCapacity] = useState("");
  const [totalRooms, setTotalRooms] = useState("");
  const [students, setStudents] = useState([
    { name: "", regNo: "", program: "" },
  ]);
  const [rooms, setRooms] = useState([]);

  const handleAddStudent = () => {
    setStudents([...students, { name: "", regNo: "", program: "" }]);
  };

  const handleChange = (index, field, value) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  const handleSubmit = async () => {
    const data = {
      roomCapacity: Number(roomCapacity),
      totalRooms: Number(totalRooms),
      students,
    };

    try {
      const res = await allocateSeats(data);
      setRooms(res.data.rooms);
    } catch (err) {
      alert(err.response?.data?.message || "Error allocating seats");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Exam Seat Allocator (with Student Details)
      </h1>

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

      <h2 className="text-lg font-semibold mt-4">Students</h2>
      {students.map((s, i) => (
        <div key={i} className="grid grid-cols-3 gap-2 mt-2">
          <input
            type="text"
            placeholder="Name"
            className="border p-2"
            value={s.name}
            onChange={(e) => handleChange(i, "name", e.target.value)}
          />
          <input
            type="text"
            placeholder="Reg No"
            className="border p-2"
            value={s.regNo}
            onChange={(e) => handleChange(i, "regNo", e.target.value)}
          />
          <input
            type="text"
            placeholder="Program"
            className="border p-2"
            value={s.program}
            onChange={(e) => handleChange(i, "program", e.target.value)}
          />
        </div>
      ))}

      <button
        onClick={handleAddStudent}
        className="mt-3 bg-blue-500 text-white px-3 py-1 rounded"
      >
        + Add Student
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
              <ul className="border p-3 rounded bg-white">
                {room.seats.map((s) => (
                  <li key={s.seatNumber} className="py-1">
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
