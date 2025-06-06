import React from 'react';

export default function CheckoutSteps(props) {
  return (
    <div className="row checkout-steps">
      <div className={props.step1 ? 'active' : ''}>Кирүү</div>
      <div className={props.step2 ? 'active' : ''}>Жеткирүү</div>
      <div className={props.step3 ? 'active' : ''}>Төлөм</div>
      <div className={props.step4 ? 'active' : ''}>Жайгаштыруу</div>
    </div>
  );
}
