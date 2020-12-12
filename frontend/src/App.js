import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import Auth from './pages/Auth';
import Bookings from './pages/Bookings';
import Events from './pages/Events';
import MainNavigation from './components/navigation/MainNavigation';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <MainNavigation />
      <main className="main-content">
        <Switch>
          <Redirect from="/" to='/auth' exact />
          <Route path="/auth" component={Auth} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/events" component={Events} />
        </Switch>
      </main>
    </BrowserRouter>
  );
}

export default App;
