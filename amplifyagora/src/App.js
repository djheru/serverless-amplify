import React from "react";
import { Authenticator, AmplifyTheme } from 'aws-amplify-react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Auth, Hub, API, graphqlOperation} from 'aws-amplify';
import { getUser} from './graphql/queries';
import { registerUser } from './graphql/mutations';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MarketPage from './pages/MarketPage';
import "./App.css";
import Navbar from './components/Navbar';

export const UserContext = React.createContext();

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

  registerNewUser = async signInData => {
    if (signInData && signInData.signInUserSetssion) {
      const getUserInput = {
        id: signInData.signInUserSetssion.idToken.payload.sub
      };
      const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));
      if (!data.getUser) {
        try {
          const registerUserInput = {
            ...getUserInput,
            username: signInData.username,
            email: signInData.signInUserSetssion.idToken.payload.email,
            registered: true
          };
          const newUser = await API.graphql(graphqlOperation(registerUser, { input: registerUserInput }))
          console.log(newUser)
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  onHubCapsule = capsule => {
    const { payload: { event = '' } = {} } = capsule;
    switch(event) {
      case 'signIn':
        console.log('signIn');
        this.getUserData();
        this.registerNewUser(capsule.payload.data);
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
      <UserContext.Provider value={{user}}>
        <Router>
          <React.Fragment>
            <Navbar  user={user} handleSignout={this.handleSignout}/>
            <div className="app-container">
              <Route exact path="/" component={HomePage} />
              <Route exact path="/profile" component={ProfilePage} />
              <Route exact path="/markets/:marketId" component={({ match: { params: { marketId = '' } = {} } = {} }) => <MarketPage user={user} marketId={marketId}  />} />
            </div>
          </React.Fragment>
        </Router>
      </UserContext.Provider>
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