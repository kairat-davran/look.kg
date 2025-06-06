import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { register } from '../actions/userActions';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

export default function RegisterScreen(props) {
  const sellerMode = props.match.path.indexOf('/registerSeller') >= 0;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const redirect = props.location.search
    ? props.location.search.split('=')[1]
    : '/';

  const userRegister = useSelector((state) => state.userRegister);
  const { userInfo, loading, error } = userRegister;

  const dispatch = useDispatch();
  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Сырсөз менен ырасталган сырсөз дал келген жок.');
    } else {
      dispatch(register(name, email, password));
    }
  };
  useEffect(() => {
    if (userInfo && sellerMode) {
      props.history.push('/registerCompany');
    } else if (userInfo) {
      props.history.push(redirect);
    }
  }, [props.history, redirect, sellerMode, userInfo]);
  return (
    <div>
      <form className="form" onSubmit={submitHandler}>
        <div>
          <h1>Аккаунтту түзүү</h1>
        </div>
        {loading && <LoadingBox></LoadingBox>}
        {error && <MessageBox variant="danger">{error}</MessageBox>}
        <div>
          <label htmlFor="name">Аты</label>
          <input
            type="text"
            id="name"
            placeholder="Атыңызды киргизиңиз"
            required
            onChange={(e) => setName(e.target.value)}
          ></input>
        </div>
        <div>
          <label htmlFor="email">Электрондук почта</label>
          <input
            type="email"
            id="email"
            placeholder="Электрондук почтаңызды киргизиңиз"
            required
            onChange={(e) => setEmail(e.target.value)}
          ></input>
        </div>
        <div>
          <label htmlFor="password">Сырсөз</label>
          <input
            type="password"
            id="password"
            placeholder="Сырсөздү киргизиңиз"
            required
            onChange={(e) => setPassword(e.target.value)}
          ></input>
        </div>
        <div>
          <label htmlFor="confirmPassword">Сырсөздү ыраста</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Сырсөздү киргизиңиз"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></input>
        </div>
        <div>
          <label />
          <button className="primary" type="submit">
            Каттоо
          </button>
        </div>
        <div>
          <label />
          <div>
            Аккаунтуңуз барбы?{' '}
            <Link to={`/signin?redirect=${redirect}`}>Кирүү</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
