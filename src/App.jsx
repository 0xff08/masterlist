// App.js
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Login from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import PrivateRoute from "./components/PrivateRoute";

import './App.css'
import {ConfigProvider} from "antd";
import SearchPage from "./pages/SearchPage.jsx";
import LogoutPage from "./pages/LogoutPage.jsx";
import {AuthProvider} from "./AuthProvider.jsx";
import LeaderBoard from "./pages/LeaderBoard.jsx";
import ExportPage from "./pages/ExportPage.jsx";
import Debug from "./pages/Debug.jsx";

function App() {

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgLayout: 'linear-gradient(9.46deg, #008852 13.87%, #1A8F47 70.6%, #24AC58 109.03%)', // Set your desired background color
        },
      }}
    >
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login/>}/>
            <Route exact path="/dash" element={<PrivateRoute><DashboardPage/></PrivateRoute>}/>
            <Route exact path="/leaderboard" element={<PrivateRoute><LeaderBoard/></PrivateRoute>}/>
            <Route exact path="/export" element={<PrivateRoute><ExportPage/></PrivateRoute>}/>
            <Route exact path="/search" element={<PrivateRoute><SearchPage/></PrivateRoute>}/>
            <Route exact path="/logout" element={<PrivateRoute><LogoutPage/></PrivateRoute>}/>
            <Route exact path="/debug" element={<PrivateRoute><Debug/></PrivateRoute>}/>
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>

  );
}

export default App;
