// pages/DashboardPage.js
import React, {useEffect, useState} from "react";
import {ConfigProvider, Layout, Row, Statistic} from "antd";
import bgVideo from '../assets/Tapelect-Bg.mp4'
import supabase from "../supabase.js";

function DashboardPage() {

  const [count, setCount] = useState(0);

  const [seedAmount, setSeedAmount] = useState(0);

  const [multiplier, setMultiplier] = useState(0);

  useEffect(() => {

    const getSeedAmount = async () => {
      const {data, error} = await supabase
        .from('tblX9A2B7GK')
        .select('*')
        .limit(1)
      console.log(data)
      setSeedAmount(data[0].seed)
      setMultiplier(data[0].multiplier)
    }

    if (!seedAmount || !multiplier) {
      getSeedAmount()
    }
  }, []);

  useEffect(() => {
    const fetchCount = async () => {
      const {data, error} = await supabase
        .rpc('count_status1')
      console.log('count', data)
      if (data) setCount(data);
    };

    fetchCount(); // Initial count

    const subscription = supabase
      .channel("aidaem4Eitha_changes")
      .on("postgres_changes", {event: "*", schema: "public", table: "aidaem4Eitha"}, () => {
        fetchCount(); // Fetch new count on change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); // Cleanup subscription
    };
  }, []);

  return (
    <div style={{width: '100vw', height: '100vh', margin: 0, padding: 0}}>
      {/*<h2>DashboardPage</h2>*/}
      {/*<button onClick={handleLogout}>Logout</button>*/}
      {/*<p>Welcome to your dashboard!</p>*/}
      <div className="background-video-container">
        <video autoPlay loop muted className="background-video">
          <source src={`${bgVideo}`} type="video/mp4"/>
          Your browser does not support the video tag.
        </video>
        <div className="content-overlay">
          <Row style={{height: '100vh'}} align={'middle'} justify={'center'}>
            <Statistic value={seedAmount - (count * multiplier)} precision={2} valueStyle={{
              fontFamily: '"inter", sans-serif',
              fontWeight: 700,
              fontSize: '64pt',
              color: 'white'
            }}/>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
