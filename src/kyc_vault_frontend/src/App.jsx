import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AppRoutes from "./components/AppRoutes";

import './index.scss';

function App() {
  return (
    <Router>
      <div className="App">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;