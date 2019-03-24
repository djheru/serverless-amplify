import React from "react";
import StripeCheckout from 'react-stripe-checkout';
import { userInfo } from "os";
// import { Notification, Message } from "element-react";

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: 'pk_test_7qoV70ArKzUTSAIqQhPHJIS600HP5djgSx'
}

const handleCharge = async () => {

}

const PayButton = ({ product, user }) => {
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
