import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../App.jsx";
import DayNestLogo from "../components/DayNestLogo.jsx";

export default function Register() {
  const [form,setForm]=useState({name:"",email:"",password:""});
  const [error,setError]=useState("");
  const navigate=useNavigate();
  const submit=async e=>{
    e.preventDefault(); setError("");
    try{
      const {data}=await api.post("/auth/register",form);
      localStorage.setItem("daynest_token",data.token);
      localStorage.setItem("daynest_user",JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    }catch(err){setError(err.response?.data?.message || "Registration failed")}
  };
  return <div className="auth-page"><div className="auth-glass glass"><div className="brand auth-brand"><DayNestLogo size="large" /></div><span className="eyebrow">BEGIN YOUR JOURNEY</span><h1>Create your space</h1><p>Track habits. Capture moods. Keep the moments.</p><form onSubmit={submit} className="auth-form"><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label><label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength="6" required/></label>{error&&<div className="error">{error}</div>}<button className="primary-button">Create DayNest →</button><p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p></form></div></div>
}

