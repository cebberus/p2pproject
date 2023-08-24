// Banner2.js
import React, { useEffect } from 'react';
import './Bannerprice.css';

function Bannerprice() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://widgets.coingecko.com/coingecko-coin-price-marquee-widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  return (
    <div className="bannerprice-container">
      <coingecko-coin-price-marquee-widget 
          coin-ids="bitcoin,ethereum,eos,ripple,litecoin" 
          currency="usd" 
          background-color="#ffffff" 
          locale="es">
      </coingecko-coin-price-marquee-widget>
    </div>
  );
}

export default Bannerprice;

