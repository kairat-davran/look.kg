import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../actions/cartActions';
import CheckoutSteps from '../components/CheckoutSteps';

export default function PaymentMethodScreen(props) {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;
  const { payMethod } = cart.cartItems[0].seller.seller;
  if (!shippingAddress.address) {
    props.history.push('/shipping');
  }
  const [paymentMethod, setPaymentMethod] = useState(`Visa Card ( ${payMethod.visaCard} )`);
  const dispatch = useDispatch();
  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    props.history.push('/placeorder');
  };
  return (
    <div>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <form className="form" onSubmit={submitHandler}>
        <div>
          <h1>Төлөө ыкмасы</h1>
        </div>
        <div>
          <div>
            <input
              type="radio"
              id="visa"
              value="Visa Card"
              name="paymentMethod"
              required
              defaultChecked
              onChange={(e) => setPaymentMethod(`${e.target.value} ( ${payMethod.visaCard} )`)}
            ></input>
            <label htmlFor="visa">{`Visa Card ( ${payMethod.visaCard} )`}</label>
          </div>
        </div>
        <div>
          <div>
            <input
              type="radio"
              id="cash"
              value="Накталай акча"
              name="paymentMethod"
              required
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></input>
            <label htmlFor="cash">Накталай акча</label>
          </div>
        </div>
        <div>
          <div>
            <input
              type="radio"
              id="elsom"
              value="Элсом"
              name="paymentMethod"
              required
              onChange={(e) => setPaymentMethod(`${e.target.value} ( ${payMethod.elsom} )`)}
            ></input>
            <label htmlFor="elsom">{`Элсом ( ${payMethod.elsom} )`}</label>
          </div>
        </div>
        <div>
          <div>
            <input
              type="radio"
              id="O!Money"
              value="О! Деньги"
              name="paymentMethod"
              required
              onChange={(e) => setPaymentMethod(`${e.target.value} ( ${payMethod.Omoney} )`)}
            ></input>
            <label htmlFor="O!Money">{`О! Деньги ( ${payMethod.Omoney} )`}</label>
          </div>
        </div>
        <div>
          <div>
            <input
              type="radio"
              id="balance.kg"
              value="balance.kg"
              name="paymentMethod"
              required
              onChange={(e) => setPaymentMethod(`${e.target.value} ( ${payMethod.balanceKg} )`)}
            ></input>
            <label htmlFor="balance.kg">{`Balance.kg ( ${payMethod.balanceKg} )`}</label>
          </div>
        </div>
        <div>
          <div>
            <input
              type="radio"
              id="MBank"
              value="M Bank"
              name="paymentMethod"
              required
              onChange={(e) => setPaymentMethod(`${e.target.value} ( ${payMethod.mBank} )`)}
            ></input>
            <label htmlFor="MBank">{`M Bank ( ${payMethod.mBank} )`}</label>
          </div>
        </div>
        <div>
          <label />
          <button className="primary" type="submit">
            Улантуу
          </button>
        </div>
      </form>
    </div>
  );
}
