import React from 'react';
import { NavLink } from 'react-router-dom';

import './MainNavigation.css'

const MainNavigation = props => {
    return (
        <header className="main-navigation">
            <div className="main-navigation__logo">
                <h1>Easy Events</h1>
            </div>
            <nav className="main-navigation__item">
                <ul>
                    <li><NavLink to="/auth">Authenticate</NavLink></li>
                    <li><NavLink to="/bookings">Bookings</NavLink></li>
                    <li><NavLink to="/events">Events</NavLink></li>
                </ul>
            </nav>
        </header>
    )
}

export default MainNavigation
