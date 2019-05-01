import React from "react";
import { API, graphqlOperation } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
import { getUser } from '../graphql/queries';
import { createOrder } from '../graphql/mutations';
import { Notification, Message } from "element-react";
import { history } from  '../App';

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: 'pk_test_7qoV70ArKzUTSAIqQhPHJIS600HP5djgSx'
}

const PayButton = ({ product, userAttributes }) => {
  const getOwnerEmail = async ownerId => {
    try {
      const input = { id: ownerId };
      const {data: { getUser: { email = '' } = {} } = {}} = await API.graphql(graphqlOperation(getUser, input));
      return email;
    } catch (e) {
      console.error(e);
    }
  }

  const createShippingAddress = ({ 
    address_line1, 
    address_city: city, 
    address_state, 
    address_zip, 
    address_country: country
  }) => ({
    address_line1,
    city,
    address_state,
    address_zip,
    country
  });
  const handleCharge = async (token) => {
    try { 
      const ownerEmail = await getOwnerEmail(product.owner);
      console.log(ownerEmail)
      const result = await API.post('orderlambda', '/charge', {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            description: product.description,
            shipped: product.shipped
          },
          email: {
            customerEmail: userAttributes.email,
            ownerEmail,
          }
        }
      });
      console.log(result);
      if (result.charge) {
        let shippingAddress = null;
        if (product.shipped) {
          shippingAddress = createShippingAddress(result.charge.source);
        }
        const input = {
          shippingAddress,
          orderUserId: userAttributes.sub,
          orderProductId: product.id
        };
        const order = await API.graphql(graphqlOperation(createOrder, { input }));
        console.log(order);
        Notification({
          title: 'Success!',
          message: `${result.message}`,
          type: 'success',
          duration: 3000
        });
        setTimeout(() => {
          history.push('/');
          Message({
            type: 'info',
            message: 'Check your verified email for order details',
            duration: 5000,
            showClose: true
          })
        }, 3200);
      }
    } catch (e) {
      console.error(e);
      Notification.error({
        title: 'Error!',
        message: `${e.message || 'Error processing order'}`
      });
    }
  }

  return (
    <StripeCheckout
      token={handleCharge}
      email={userAttributes.email}
      name={product.description}
      amount={product.price}
      shippingAddress={product.shipped}
      billingAddress={product.shipped}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey} 
      locale="auto"
      allowRememberMe={false}/>
  )
};

export default PayButton;
