import React from "react";
import { API, graphqlOperation } from 'aws-amplify';
import { createMarket} from '../graphql/mutations';
// prettier-ignore
import { Form, Button, Dialog, Input, Select, Notification } from 'element-react'
import { UserContext } from '../App';

class NewMarket extends React.Component {
  state = {
    addMarketDialog: false,
    name: ''
  };

  handleAddMarket = async user => {
      try {
        this.setState({ addMarketDialog: false });
      const input = {
        name: this.state.name,
        owner: user.username,
      };

      const result = await API.graphql(graphqlOperation(createMarket, { input }));
      console.log(`created market: `, result.data.createMarket);
      this.setState({ name: '' });
      } catch (e) {
        console.error('error saving market: ', e);
        Notification.error({
          title: 'Error Saving Market',
          message: `${e.message || 'Error cause unknown'}`
        });
      }
  };

  render() {
    return (
      <UserContext.Consumer>
        {
          // context data pulled in as render prop from  UserContext.Provider value in App.js 
          ({ user }) => (
            <>
              <div className="market-header">
                <h1 className="market-title">
                  Create Your MarketPlace
                  <Button 
                    type="text"
                    icon="edit"
                    className="market-title-button" 
                    onClick={ () => this.setState({ addMarketDialog: true }) }/>
                </h1>
              </div>

              <Dialog
                title="Create New Market"
                visible={this.state.addMarketDialog}
                onCancel={ () => this.setState({ addMarketDialog: false }) }
                size="large"
                customClass="dialog">
                <Dialog.Body>
                  <Form labelPosition="top">
                    <Form.Item label="Add Market Name">
                      <Input 
                        placeholder="Market Name"
                        trim={true} 
                        onChange={name => this.setState({ name })} 
                        value={this.state.name} />
                    </Form.Item>
                  </Form>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button onClick={() => this.setState({ addMarketDialog: false })}>
                    Cancel
                  </Button>
                  <Button type="primary" disabled={!this.state.name} onClick={() => this.handleAddMarket(user)}>
                    Add
                  </Button>
                </Dialog.Footer>
              </Dialog>
            </>
          )
        }
      </UserContext.Consumer>
    )
  }
}

export default NewMarket;
