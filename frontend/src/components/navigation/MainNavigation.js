import React from 'react';
import { NavLink } from 'react-router-dom';

import AuthContext from '../../context/auth-context'

import './MainNavigation.css'

const MainNavigation = props => {
    return (
        <AuthContext.Consumer>
            {
                (context) => {
                    console.log("context.token", context.token)
                    return (
                        <header className="main-navigation">
                            <div className="main-navigation__logo">
                                <h1>Easy Events</h1>
                            </div>
                            <nav className="main-navigation__item">
                                <ul>
                                    {!context.token &&
                                        <li><NavLink to="/auth">Authenticate</NavLink></li>}
                                    <li><NavLink to="/events">Events</NavLink></li>
                                    {context.token &&
                                        <li><NavLink to="/bookings">Bookings</NavLink></li>}
                                </ul>
                            </nav>
                        </header>
                    )
                }
            }
        </AuthContext.Consumer>
    )
}

export default MainNavigation
