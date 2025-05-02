// App.js
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import PrivateRoute from "./components/PrivateRoute";

import './App.css'
import {ConfigProvider} from "antd";
import SearchPage from "./pages/SearchPage.jsx";
import LogoutPage from "./pages/LogoutPage.jsx";
import {AuthProvider} from "./AuthProvider.jsx";

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
            <Route path="/login" element={<Login/>}/>
            <Route exact path="/dash" element={<PrivateRoute><DashboardPage/></PrivateRoute>}/>
            <Route exact path="/search" element={<PrivateRoute><SearchPage/></PrivateRoute>}/>
            <Route exact path="/logout" element={<PrivateRoute><LogoutPage/></PrivateRoute>}/>
          </Routes>
        </Router>
      </AuthProvider>
    </ConfigProvider>

  );
}

export default App;
