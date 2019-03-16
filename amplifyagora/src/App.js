import React from "react";
import { Authenticator, AmplifyTheme } from 'aws-amplify-react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Auth, Hub } from 'aws-amplify';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MarketPage from './pages/MarketPage';
import "./App.css";
import Navbar from './components/Navbar';

class App extends React.Component {
  state = {
    user: null
  };

  componentDidMount() {
    this.getUserData();
    Hub.listen('auth', this, 'onHubCapsule')
  }

  getUserData = async () => {
    const user = await Auth.currentAuthenticatedUser();
    user ? this.setState({ user }) : this.setState({ user: null });
  }


  onHubCapsule = capsule => {
    const { payload: { event = '' } = {} } = capsule;
    switch(event) {
      case 'signIn':
        console.log('signIn');
        this.getUserData();
        break;
      case 'signUp': 
        console.log('signUp');
        break;
      case 'signOut': 
        console.log('signOut');
        this.setState({ user: null })
        break;
      default:
        console.log(event);
        return;
    }
  }

  handleSignout = async () => {
    try {
      await Auth.signOut();
    } catch (e) {
      console.error('Error signing out user', e);
    }
  }

  render() {
    const { user } = this.state;
    return !user ? (<Authenticator theme={theme}/>) : (
      <Router>
        <React.Fragment>
          <Navbar  user={user} handleSignout={this.handleSignout}/>
          <div className="app-container">
            <Route exact path="/" component={HomePage} />
            <Route exact path="/profile" component={ProfilePage} />
            <Route exact path="/markets/:marketId" component={({ match: { params: { marketId = '' } = {} } = {} }) => <MarketPage marketId={marketId}  />} />
          </div>
        </React.Fragment>
      </Router>
    );
  }
}

const theme = {
  ...AmplifyTheme,
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundColor: '#f0c0cb'
  },
  button: {
    ...AmplifyTheme.button,
    backgroundColor: 'var(--amazonOrange)'
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: '10px'
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: 'var(--squidInk)'
  }
};

// export default withAuthenticator(App, true, [], null, theme);
export default App;