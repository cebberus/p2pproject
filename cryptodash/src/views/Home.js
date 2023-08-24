// views/Home.js
import React from 'react';
import Header from '../components/Header';
import Banner1 from '../components/banners/Banner1';
import Bannerprice from '../components/banners/Bannerprice';
import './Home.css';

function Home() {
  return (
    <div className="App">
      <Header />
      <div class="main">
        <Banner1 />
      </div>
      {/* Otros componentes y contenido aquí */}
    </div>
  );
}

export default Home;


