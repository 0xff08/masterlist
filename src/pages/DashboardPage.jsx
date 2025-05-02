// pages/DashboardPage.js
import React, {useState} from "react";
import {ConfigProvider, Layout, Row, Statistic} from "antd";
import bgVideo from '../assets/Tapelect-Bg.mp4'

function DashboardPage() {

  const [balance, setBalance] = useState(1.5e10);

  const handleLogout = async () => {
    try {
    } catch (err) {
      console.error(err);
    }
  };

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
            <Statistic value={balance} precision={2} valueStyle={{fontFamily: '"inter", sans-serif', fontWeight: 700, fontSize: '64pt', color: 'white'}}/>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
