import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Train from './pages/Train.jsx';
import User from './pages/User.jsx';
import LocalNews from './pages/LocalNews.jsx';
import TrainNews from './pages/TrainNews.jsx';
import Lost from './pages/Lost.jsx';
import Timetable from './pages/Timetable.jsx';



function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/train" />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/train" element={<Train />} />
          <Route path="/user" element={<User />} />
          <Route path="/lost" element={<Lost />} />
          <Route path="/localnews" element={<LocalNews />} />
          <Route path="/trainnews" element={<TrainNews />} />
          <Route path="/timetable" element={<Timetable />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
