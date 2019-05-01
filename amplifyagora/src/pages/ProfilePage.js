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
    orders(sortDirection: ASC, limit: 999) {
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
    orders: [],
    columns: [
      { prop: 'name', width: '150' },
      { prop: 'value', width: '330' },
      { prop: 'tag', width: '150', render: row => row.name === 'Email' ? (
        this.props.user.attributes.email_verified ? 
          (<Tag type="success">Verified</Tag>) : (<Tag type="danger">Unverified</Tag>)
        ) : null},
      { prop: 'operations', render: row => {
        switch(row.name) {
          case 'Email':
            return (<Button type="info" size="small">Edit</Button>);
          case 'Delete Profile':
            return (<Button type="danger" size="small">Delete</Button>);
          default:
            return;
        }
      }}
    ]
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
    const { orders, columns } = this.state;
    const { user } = this.props;
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
            <Table 
              data={[
                { name: 'Your ID', value: user.attributes.sub },
                { name: 'Username', value: user.username },
                { name: 'Email', value: user.attributes.email },
                { name: 'Phone Number', value: user.attributes.phone_number },
                { name: 'Delete Profile', value: 'Sorry to see you go' },
              ]}
              showHeader={false}
              rowClassName={row => row.name === 'Delete Profile' && 'delete-profile'}
              columns={columns}>

            </Table>
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
