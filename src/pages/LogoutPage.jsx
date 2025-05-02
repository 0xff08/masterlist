import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";

import supabase from "../supabase.js";

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // signOut(auth).then(()=>{
    //   navigate('/login');
    // });
    supabase.auth.signOut().then(()=>{
      navigate('/login');
    })
  })

  return (
    <div>
      Logging out...
    </div>
  );
};

export default LogoutPage;