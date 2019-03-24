import React from "react";
import { API } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
import { userInfo } from "os";
// import { Notification, Message } from "element-react";

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: 'pk_test_7qoV70ArKzUTSAIqQhPHJIS600HP5djgSx'
}

const PayButton = ({ product, user }) => {
  const handleCharge = async (token) => {
    try { 
      const result = await API.post('orderlambda', '/charge', {
        body: {
          token
        }
      });
      console.log(JSON.stringify(result, null, '\t'));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <StripeCheckout
      token={handleCharge}
      email={user.attributes.email}
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
