import React from "react";
import { Auth, API, graphqlOperation } from 'aws-amplify';
// prettier-ignore
import { Table, Button, Notification, MessageBox, Message, Tabs, Icon, Form, Dialog, Input, Card, Tag } from 'element-react'
import { convertCentsToDollars, formatOrderDate } from '../utils';

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
    email: this.props.userAttributes ? this.props.userAttributes.email : '',
    emailDialog: false,
    verificationCode: '',
    verificationForm: false,
    orders: [],
    columns: [
      { prop: 'name', width: '150' },
      { prop: 'value', width: '330' },
      { prop: 'tag', width: '150', render: row => row.name === 'Email' ? (
        this.props.userAttributes.email_verified ? 
          (<Tag type="success">Verified</Tag>) : (<Tag type="danger">Unverified</Tag>)
        ) : null},
      { prop: 'operations', render: row => {
        switch(row.name) {
          case 'Email':
            return (<Button 
              onClick={() => { this.setState({ emailDialog: true })}} 
              type="info" size="small">Edit</Button>);
          case 'Delete Profile':
            return (
              <Button 
                onClick={this.handleDeleteProfile}
                type="danger" 
                size="small">Delete</Button>
            );
          default:
            return;
        }
      }}
    ]
  };

  componentDidMount() {
    if (this.props.userAttributes) {
      console.log(this.props.userAttributes)
      this.getUserOrders(this.props.userAttributes.sub);
    }
  }

  getUserOrders = async id => {
    const result = await API.graphql(graphqlOperation(getUser, { id }));
    this.setState({ orders: result.data.getUser.orders.items });
  }

  handleUpdateEmail = async () => {
    try {
      const updateAttributes = {
        email: this.state.email
      };
      // Pass in the user and the upated attributes
      const result = await Auth.updateUserAttributes(this.props.user, updateAttributes);
      if (result === 'SUCCESS') {
        this.sendVerificationCode('email');
      }
    } catch (e) {
      console.error(e);
      Notification.error({
        title: 'Error',
        message: e.message || 'Error updating email'
      })
    }
  }

  sendVerificationCode = async attr => {
    await Auth.verifyCurrentUserAttribute(attr);
    this.setState({ verificationForm: true});
    Message({
      type: 'info',
      customClass: 'message',
      message: `Verification code sent to ${this.state.email}`
    });
  }

  handleVerifyEmail = async attr => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(attr, this.state.verificationCode);
      if (result === 'SUCCESS') {
        Notification({
          title: 'Success',
          message: 'Email successfully verified',
          type: 'success'
        });
        setTimeout(() => window.location.reload(), 2500);
      }
    } catch (e) {
      console.error(e);
      Notification.error({
        title: 'Error',
        message: e.message || 'Error verifying email'
      })
    }
  }

  handleDeleteProfile = () => {
    MessageBox.confirm('This will permanently delete your account. Continue? ', 'Attention!', {
      confirmButtonText: 'Delete Account',
      cancelButtonText: 'Do not Delete',
      type: 'warning'
    }).then(async () => {
      try {
        await this.props.user.deleteUser();
      } catch (e) {
        console.error(e);
      }
    }).catch(() => {
      Message({
        type: 'info',
        message: 'Account not deleted'
      })
    })
  }

  render() {
    const { orders, columns, email, emailDialog, verificationCode, verificationForm } = this.state;
    const { userAttributes, user } = this.props;
    console.log(userAttributes);
    if (!userAttributes) {
      return null;
    }
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
                { name: 'Your ID', value: userAttributes.sub },
                { name: 'Username', value: user.username },
                { name: 'Email', value: userAttributes.email },
                { name: 'Phone Number', value: userAttributes.phone_number },
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
                      <p>Purchased On: {formatOrderDate(order.createdAt)}</p>
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
        <Dialog
          size="large"
          customClass="dialog"
          title="Edit Email Address"
          visible={emailDialog}
          onCancel={() => { this.setState({ emailDialog: false})}}>
          <Dialog.Body>
            <Form labelPosition="top">
              <Form.Item label="Email">
                <Input
                  value={email}
                  onChange={email => this.setState({ email })} />
              </Form.Item>
              {
                verificationForm ? (
                  <Form.Item
                    label="Enter verification code"
                    labelWidth="120">
                    <Input 
                      value={verificationCode}
                      onChange={ verificationCode => this.setState({ verificationCode })} />
                  </Form.Item>
                ) : null
              }
            </Form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={() => { this.setState({ emailDialog: false })}}>Cancel</Button>
            {
              !verificationForm ? (
                <Button 
                  type="primary"
                  onClick={this.handleUpdateEmail}>Save</Button>
              ) : (
                <Button 
                  type="primary"
                  onClick={() => this.handleVerifyEmail('email')}>Submit</Button>
              )
            }
          </Dialog.Footer>
        </Dialog>
      </>
    )
  }
}

export default ProfilePage;
