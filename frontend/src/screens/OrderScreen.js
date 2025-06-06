import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { deliverOrder, detailsOrder, payOrder } from '../actions/orderActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import {
  ORDER_DELIVER_RESET,
  ORDER_PAY_RESET,
} from '../constants/orderConstants';

export default function OrderScreen(props) {
  const orderId = props.match.params.id;
  const [sdkReady, setSdkReady] = useState(false);
  const orderDetails = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetails;
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;

  const orderPay = useSelector((state) => state.orderPay);
  const {
    loading: loadingPay,
    error: errorPay,
    success: successPay,
  } = orderPay;
  const orderDeliver = useSelector((state) => state.orderDeliver);
  const {
    loading: loadingDeliver,
    error: errorDeliver,
    success: successDeliver,
  } = orderDeliver;
  const dispatch = useDispatch();
  useEffect(() => {
    if (
      !order ||
      successPay ||
      successDeliver ||
      (order && order._id !== orderId)
    ) {
      dispatch({ type: ORDER_PAY_RESET });
      dispatch({ type: ORDER_DELIVER_RESET });
      dispatch(detailsOrder(orderId));
    } else {
      if (!order.isPaid) {
        if (!window.paypal) {
          setSdkReady(true);
        } else {
          setSdkReady(true);
        }
      }
    }
  }, [dispatch, order, orderId, sdkReady, successPay, successDeliver]);

  const successPaymentHandler = () => {
    dispatch(payOrder(order, order.paymentMethod));
  };
  const deliverHandler = () => {
    dispatch(deliverOrder(order._id));
  };
  const getDate = (paidDate) => {
    let result = paidDate.getDate()+"."+(paidDate.getMonth()+1)+"."+paidDate.getFullYear() + 
             " "+ paidDate.getHours()+":"+paidDate.getMinutes()+":"+
             paidDate.getSeconds();
    return result;
  }

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <h1>Буйрутма</h1>
      <div className="row top">
        <div className="col-2">
          <ul>
            <li>
              <div className="card card-body">
                <h2>Жеткирүү</h2>
                <p>
                  <strong>Аты:</strong> {order.shippingAddress.fullName} <br />
                  <strong>Дарек: </strong> {order.shippingAddress.address},
                  {order.shippingAddress.city},{' '}
                  {order.shippingAddress.postalCode},
                  {order.shippingAddress.country}
                </p>
                {order.isDelivered ? (
                  <MessageBox variant="success">
                    Жеткирүүгө буйрулган убагы: <br />{ getDate(new Date(order.deliveredAt))}
                  </MessageBox>
                ) : (
                  <MessageBox variant="danger">Жеткирүүгө буйрулган жок</MessageBox>
                )}
              </div>
            </li>
            <li>
              <div className="card card-body">
                <h2>Төлөө ыкмасы</h2>
                <p>
                  {order.paymentMethod}
                </p>
                {order.isPaid && order.paymentMethod !== "Накталай акча" ? (
                  <MessageBox variant="success">
                    Төлөгөн убагы: <br /> { getDate(new Date(order.paidAt))}
                  </MessageBox>
                ) : ''}
              </div>
            </li>
            <li>
              <div className="card card-body">
                <h2>Буйрутма берилген буюм(-дар)</h2>
                <ul>
                  {order.orderItems.map((item) => (
                    <li key={item.product}>
                      <div className="row">
                        <div>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="small"
                          ></img>
                        </div>
                        <div className="min-30">
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </div>
                        <div>
                          {item.qty} x {item.price} сом = {item.qty * item.price} сом
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </ul>
        </div>
        <div className="col-1">
          <div className="card card-body">
            <ul>
              <li>
                <h2>Буйрутманын кыскача баяндамасы</h2>
              </li>
              <li>
                <div className="row">
                  <div>Буюмдар</div>
                  <div>{order.itemsPrice.toFixed(2)} сом</div>
                </div>
              </li>
              <li>
                <div className="row">
                  <div>Жеткирүү</div>
                  <div>{order.shippingPrice.toFixed(2)} сом</div>
                </div>
              </li>
              {/* <li>
                <div className="row">
                  <div>Салык</div>
                  <div>{order.taxPrice.toFixed(2)} сом</div>
                </div>
              </li> */}
              <li>
                <div className="row">
                  <div>
                    <strong>Жалпы буйрутма</strong>
                  </div>
                  <div>
                    <strong>{order.totalPrice.toFixed(2)} сом</strong>
                  </div>
                </div>
              </li>
              {!order.isPaid && (
                <li>
                  {!sdkReady ? (
                    <LoadingBox></LoadingBox>
                  ) : (
                    <>
                      {errorPay && (
                        <MessageBox variant="danger">{errorPay}</MessageBox>
                      )}
                      {loadingPay && <LoadingBox></LoadingBox>}
                      <button
                        type="button"
                        className="secondary block"
                        onClick={successPaymentHandler}>
                        Төлөө
                      </button>
                    </>
                  )}
                </li>
              )}
              {(userInfo.isAdmin || userInfo.isSeller ) && order.isPaid && !order.isDelivered && (
                <li>
                  {loadingDeliver && <LoadingBox></LoadingBox>}
                  {errorDeliver && (
                    <MessageBox variant="danger">{errorDeliver}</MessageBox>
                  )}
                  <button
                    type="button"
                    className="primary block"
                    onClick={deliverHandler}>
                    Жеткирүүгө буюруу
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
