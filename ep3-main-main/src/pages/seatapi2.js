import axios from "axios";

// const API = axios.create({ baseURL: "http://localhost:3000/api22" });

const API = axios.create({ baseURL: "https://epaathsalamain.azurewebsites.net/api22" });

export const allocateSeats = (data) => API.post("/allocate", data);
export const getAllocations = () => API.get("/");
