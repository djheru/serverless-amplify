import React from "react";
import { API, graphqlOperation } from 'aws-amplify';
// prettier-ignore
import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react'
import { convertCentsToDollars } from '../utils';

const getUser = `query GetUser($id: ID!) {
  getUser(id: $id) {
    id
    username
    email
    registered
    orders {
      items {
        id
        createdAt
        product {
          id
          owner
          price
          createdAt
          description
        }
        shippingAddress {
          city
          country
          address_line1
          address_state
          address_zip
        }
      }
      nextToken
    }
  }
}
`;

class ProfilePage extends React.Component {
  state = {
    orders: []
  };

  componentDidMount() {
    if (this.props.user) {
      this.getUserOrders(this.props.user.attributes.sub);
    }
  }

  getUserOrders = async id => {
    const result = await API.graphql(graphqlOperation(getUser, { id }));
    this.setState({ orders: result.data.getUser.orders.items });
  }

  render() {
    const { orders } = this.state;
    console.log(orders);
    return (
      <>
        <Tabs activeName="1" className="profile-tabs">
          <Tabs.Pane 
            label={
              <>
                <Icon name="document" className="icon" />
                Summary
              </>
            } name="1">
            <h2 className="header">
              Profile Summary
            </h2>
          </Tabs.Pane>

          <Tabs.Pane
            label={
              <>
                <Icon name="message" className="icon" />
                Orders
              </>
            } name="2">
            <h2 className="header">Order History</h2>
            {
              orders.map(order => (
                <div className="mb-1" key={order.id}>
                  <Card>
                    <pre>
                      <p>OrderId: {order.id}</p>
                      <p>Product Description: {order.product.description}</p>
                      <p>Price: ${convertCentsToDollars(order.product.price)}</p>
                      <p>Purchased On: {order.createdAt}</p>
                      {
                        order.shippingAddress ? 
                        (
                          <>
                            Shipping Address
                            <div className="m1-2">
                              <p>
                                {order.shippingAddress.address_line1}
                                {order.shippingAddress.city}, {order.shippingAddress.address_state} {order.shippingAddress.address_zip}<br />
                                {order.shippingAddress.country}
                              </p>
                            </div>
                          </>
                        ) : null
                      }
                    </pre>
                  </Card>
                </div>

              ))
            }
          </Tabs.Pane>
        </Tabs>
      </>
    )
  }
}

export default ProfilePage;
