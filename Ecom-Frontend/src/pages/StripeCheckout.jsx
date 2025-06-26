import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useSelector } from 'react-redux';

import CheckoutForm from "./CheckoutForm";
import "../Stripe.css";
import { selectCurrentOrder } from "../features/order/orderSlice";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe("pk_test_51RbQrm2MwiSS7kfFjHM1oRyEyDC207rqOHgFdWNu3dQHsMWU8FcQyPJuAnHDzVhfYJR0EsTwr79W8ijFg6kIfKMn00vy35S1P2");

export default function StripeCheckout() {
  const [clientSecret, setClientSecret] = useState("");
  const currentOrder = useSelector(selectCurrentOrder)

  console.log(currentOrder , 
    'currentorder'
  )
 useEffect(() => {
  if (!currentOrder?.id) return;

  fetch(`${import.meta.env.VITE_BACKEND_URI}/create-payment-intent`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      totalAmount: currentOrder.totalAmount, 
      orderId: currentOrder.id 
    }),
    credentials: 'include' // This is crucial for cookies
  })
  .then(async (res) => {
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }
    return res.json();
  })
  .then((data) => {
    if (!data.clientSecret) throw new Error('No client secret received');
    setClientSecret(data.clientSecret);
  })
  .catch((error) => {
    console.error('PaymentIntent error:', error);
    // Handle error in your UI
  });
}, [currentOrder]);;

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="Stripe">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}