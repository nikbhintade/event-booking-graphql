import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import Auth from './pages/Auth';
import AuthContext from './context/auth-context';
import Bookings from './pages/Bookings';
import Events from './pages/Events';
import MainNavigation from './components/navigation/MainNavigation';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      userId: null
    }
  }
  login = (token, userId, tokenExpiration) => {
    this.setState({
      token: token,
      userId: userId
    })
  }

  logout = () => {
    this.setState({
      token: null,
      userId: null
    })
  }

  render() {
    return (
      <BrowserRouter>
        <AuthContext.Provider value={{
          token: this.state.token,
          userId: this.state.userId,
          login: this.login,
          logout: this.logout
        }}>
          <MainNavigation />
          <main className="main-content">
            <Switch>
              {this.state.token && <Redirect from="/" to='/events' exact />}
              {this.state.token && <Redirect from="/auth" to='/events' exact />}
              {!this.state.token && <Route path="/auth" component={Auth} />}
              {this.state.token && <Route path="/bookings" component={Bookings} />}
              <Route path="/events" component={Events} />
              {!this.state.token && <Redirect to='/auth' exact />}
            </Switch>
          </main>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }
}

export default App;
