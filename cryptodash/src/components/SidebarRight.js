// SidebarRight.js
import React from 'react';
import './SidebarRight.css'; 
import SettingsContainer from '../components/SettingsContainer'; // Importa SettingsContainer

const SidebarRight = () => {
  return (
    <div className="sidebar-right">
      <SettingsContainer />
    </div>
  );
};

export default SidebarRight;
