// import React, { useEffect, useState } from "react";
// import {
//   PaymentElement,
//   useStripe,
//   useElements
// } from "@stripe/react-stripe-js";
// import { useSelector } from 'react-redux';
// import { selectCurrentOrder } from "../features/order/orderSlice";
// import { selectUserInfo } from "../features/user/userSlice";

// export default function CheckoutForm() {
//   const stripe = useStripe();
//   const elements = useElements();
//   const currentOrder = useSelector(selectCurrentOrder);
//   const userInfo = useSelector(selectUserInfo)
//   const [message, setMessage] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     if (!stripe) {
//       return;
//     }

//     const clientSecret = new URLSearchParams(window.location.search).get(
//       "payment_intent_client_secret"
//     );

//     if (!clientSecret) {
//       return;
//     }

//     stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
//       switch (paymentIntent.status) {
//         case "succeeded":
//           setMessage("Payment succeeded!");
//                     navigate(`/order-success/${currentOrder.id}`);
//                     console.log("pamentsucceeded")
//           break;
//         case "processing":
//           setMessage("Your payment is processing.")
//                               console.log("pamentprocessing")
//           break;
//         case "requires_payment_method":
//           setMessage("Your payment was not successful, please try again.");
//                               console.log("requirepayment")
//           break;
//         default:
//           setMessage("Something went wrong.");
//                               console.log("somethingwentwrong")
//           break;
//       }
//     });
//   }, [stripe]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!stripe || !elements) {
//       // Stripe.js hasn't yet loaded.
//       // Make sure to disable form submission until Stripe.js has loaded.
// console.log("Stripe.js hasn't yet loaded.")
//       return;
//     }

//     setIsLoading(true);

//     // const { error } = await stripe.confirmPayment({
//     //   elements,
//     //   confirmParams: {
//     //     // Make sure to change this to your payment completion page
//     //         payment_method_data: {
//     //   billing_details: {
//     //     name: userInfo?.name || "not available",
//     //     email: userInfo?.email || "not available"
//     //   }
//     // },
//     //     return_url: `/order-success/${currentOrder.id}`,
//     //   },
//     // });
//     const { error } = await stripe.confirmPayment({
//   elements,
//   confirmParams: {
//      return_url: `${window.location.origin}/order-success/${currentOrder.id}`,
//        payment_method_data: {  // ✅ Correct placement
//       billing_details: {
//         name: userInfo?.name || "",  // Required
//         email: userInfo?.email || "",  // Recommended
//         address: {
//           country: 'PK'  // Must match currency
//         }
//       }
//     }
// }
// });
// if (error) {
//   console.error('Stripe error code:', error.code);
//   console.error('Detailed error:', error);
//   setMessage(error.message || 'Payment failed - please check your details');
// }

//     // This point will only be reached if there is an immediate error when
//     // confirming the payment. Otherwise, your customer will be redirected to
//     // your `return_url`. For some payment methods like iDEAL, your customer will
//     // be redirected to an intermediate site first to authorize the payment, then
//     // redirected to the `return_url`.
//     if (error.type === "card_error" || error.type === "validation_error") {
//       setMessage(error.message);
//     } else {
//       setMessage("An unexpected error occurred.");
//     }

//     setIsLoading(false);
//   };

//   const paymentElementOptions = {
//     layout: "tabs",
//   //     fields: {
//   //   billingDetails: {
//   //     address: {
//   //       country: 'never' // Hide country field since we force IN
//   //     }
//   //   }
//   // }
//   }

//   return (
//     <form id="payment-form" onSubmit={handleSubmit}>
//       <PaymentElement id="payment-element" options={paymentElementOptions} />
//       <button disabled={isLoading || !stripe || !elements} id="submit">
//         <span id="button-text">
//           {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
//         </span>
//       </button>
//       {/* Show any error or success messages */}
//       {message && <div id="payment-message">{message}</div>}
//     </form>
//   );
// }

import React, { useEffect, useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useSelector } from 'react-redux';
import { selectCurrentOrder } from "../features/order/orderSlice";
import { selectUserInfo } from "../features/user/userSlice";
import { useNavigate } from "react-router-dom";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const currentOrder = useSelector(selectCurrentOrder);
  const userInfo = useSelector(selectUserInfo);
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) return;

    // Check if payment was already completed
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (paymentIntent.status === "succeeded") {
        redirectToSuccessPage();
      }
    });
  }, [stripe]);

  const redirectToSuccessPage = () => {
    if (currentOrder?.id) {
      navigate(`/order-success/${currentOrder.id}`, {
        state: { paymentCompleted: true },
        replace: true
      });
    } else {
      console.error("Missing order ID for redirection");
      setMessage("Payment succeeded but couldn't redirect - please contact support");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !currentOrder?.id) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success/${currentOrder.id}`,
          payment_method_data: {
            billing_details: {
              name: userInfo?.name || "Customer",
              email: userInfo?.email || "customer@example.com",
              address: {
                country: 'PK'
              }
            }
          }
        },
        redirect: 'if_required' // This is key for non-redirect payment methods
      });

      if (error) {
        setMessage(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // For payment methods that don't redirect (like credit cards)
        redirectToSuccessPage();
      }
      // For redirect methods, they'll go to return_url automatically
    } catch (err) {
      console.error("Payment error:", err);
      setMessage("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-form">
      <form onSubmit={handleSubmit}>
        <PaymentElement options={{ layout: "tabs" }} />
        <button 
          disabled={isLoading || !stripe || !elements}
          className={`pay-button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? "Processing..." : "Pay Now"}
        </button>
        {message && (
          <div className={`payment-message ${message.includes("failed") ? "error" : "info"}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}