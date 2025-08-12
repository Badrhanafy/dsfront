import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import ServiceDetails from "../pages/services/ServiceDetais";
import Services from "../pages/services/Services";
import Providers from "@/pages/providers/Providers";
export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services/:id" element={<ServiceDetails />} />
      <Route path="/services" element={<Services />} />
      <Route path="/providers" element={<Providers/>}/>
      
      
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
