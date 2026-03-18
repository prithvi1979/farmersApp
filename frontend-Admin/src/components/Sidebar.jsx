import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar glass-panel">
      <div className="brand">
        <h2>Farmers Admin</h2>
      </div>
      
      <nav className="nav-links">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/crops" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          🌱 Master Crops
        </NavLink>
        <NavLink to="/news" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          📰 Local News
        </NavLink>
        <NavLink to="/library" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          📚 Library & Pests
        </NavLink>
        <NavLink to="/market" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          🛒 Market Links
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <p>V 1.0.0 Target</p>
      </div>
    </aside>
  );
};

export default Sidebar;
