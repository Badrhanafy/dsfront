import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import ServiceDetails from "../pages/services/ServiceDetais";
import Services from "../pages/services/Services";
import Providers from "@/pages/providers/Providers";
import { CompleteProfile } from "@/pages/providers/CompleteProfile";
import About from "@/components/About";
import ProviderDetails from "@/pages/providers/ProviderDetails";
import ServiceCreateForm from "@/pages/providers/ServiceCreateForm";
import Dashboard from "@/pages/providers/Dashboard";
import Messages from "@/pages/providers/Messages";
import MessageBox from "@/components/MessageBox";
import Social from "@/posts/Social";
export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services/:id" element={<ServiceDetails />} />
      <Route path="/services" element={<Services />} />
      <Route path="/providers" element={<Providers/>}/>
      <Route path="/profile/complete/:id" element={<CompleteProfile/>}/>
      <Route path="/About" element={<About/>}/>
      <Route path="/providers/:providerid" element={<ProviderDetails/>}/>
      <Route path="/AddService" element={< ServiceCreateForm/>}/>
   <Route path="/dashboard" element={<Dashboard />} />
   <Route path="/Provider/messages" element={<MessageBox />} />
    <Route path="/social" element={<Social/>}/>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
