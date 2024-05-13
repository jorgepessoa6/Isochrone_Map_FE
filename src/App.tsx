import React from 'react';
import logo from './logo.svg';
import './App.css';
import IsochroneMap from "./components/map/IsochroneMap";
import config from "./config";

export const BACKEND_ENDPOINT = config.BACKEND_ENDPOINT;

function App() {
  return (
    <div className="App">
      <IsochroneMap center={[41.14793150306301,-8.60465496868542]} />
    </div>
  );
}

export default App;
