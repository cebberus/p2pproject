// SidebarRight.js
import React from 'react';
import './SidebarRight.css'; 
import SettingsUserContainer from '../SettingsUserContainer'; // Importa SettingsContainer

const SidebarRight = () => {
  return (
    <div className="sidebar-right">
      <SettingsUserContainer />
    </div>
  );
};

export default SidebarRight;
