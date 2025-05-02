import React, {useEffect, useState} from 'react';
import {Form, Input, Button, Layout, Flex, Col, Row} from 'antd';
import {signInWithEmailAndPassword, signOut} from "firebase/auth";
import { auth } from "../firebase";
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