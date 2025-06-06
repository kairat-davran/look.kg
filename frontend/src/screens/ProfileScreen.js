import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { detailsUser, updateUserProfile } from '../actions/userActions';
import Axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { USER_DETAILS_RESET, USER_UPDATE_PROFILE_RESET } from '../constants/userConstants';

export default function ProfileScreen(props) {
  const dispatch = useDispatch();
  const sellerMode = props.match.path.indexOf('/registerCompany') >= 0;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerLogo, setSellerLogo] = useState('');
  const [instagram, setInstagram] = useState('');
  const [payMethod, setPayMethod] = useState({});
  const [sellerDescription, setSellerDescription] = useState('');

  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  const userDetails = useSelector((state) => state.userDetails);
  const { loading, error, user } = userDetails;
  const userUpdateProfile = useSelector((state) => state.userUpdateProfile);
  const {
    success: successUpdate,
    error: errorUpdate,
    loading: loadingUpdate,
  } = userUpdateProfile;

  function getPayMethod(value, type) {
    if(type === "visaCard") {
      setPayMethod(payMethod => ({
        ...payMethod,
        visaCard: value
      }))
    } else if(type === "elsom") {
      setPayMethod(payMethod => ({
        ...payMethod,
        elsom: value
      }))
    } else if(type === "Omoney") {
      setPayMethod(payMethod => ({
        ...payMethod,
        Omoney: value
      }))
    } else if(type === "balanceKg") {
      setPayMethod(payMethod => ({
        ...payMethod,
        balanceKg: value
      }))
    } else if(type === "mBank") {
      setPayMethod(payMethod => ({
        ...payMethod,
        mBank: value
      }))
    }
  }

  useEffect(() => {
    if(successUpdate) {
      sellerMode ?
      alert("Сиз ийгиликтүү катталдыңыз. Дүкөнүңүз ырасталганга чейин күтүшүңүз керек.")
        : alert("Профиль ийгиликтүү жаңыртылды")
      dispatch({ type: USER_UPDATE_PROFILE_RESET });
      dispatch({ type: USER_DETAILS_RESET });
    }
    if (!user) {
      dispatch({ type: USER_UPDATE_PROFILE_RESET });
      dispatch(detailsUser(userInfo._id));
    } else {
      setName(user.name);
      setEmail(user.email);
      if (user.seller) {
        setSellerName(user.seller.name);
        setSellerLogo(user.seller.logo);
        setSellerDescription(user.seller.description);
        setPayMethod(user.seller.payMethod);
        if(user.seller.instagram) {
          setInstagram(user.seller.instagram.username);
        }
      }
    }
  }, [dispatch, props.history, userInfo._id, user, successUpdate, sellerMode]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Сырсөз жана ырастоо сырсөзү дал келген жок');
    } else {
      dispatch(
        updateUserProfile({
          userId: user._id,
          name,
          email,
          instagram,
          payMethod,
          password,
          sellerName,
          sellerLogo,
          sellerDescription,
        })
      );
    }
  };

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [errorUpload, setErrorUpload] = useState('');
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('image', file);
    setLoadingUpload(true);
    try {
      const { data } = 
      await Axios.post('/api/uploads', bodyFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${userInfo.token}`
          }
        })
      setSellerLogo(data);
      setLoadingUpload(false);
    } catch (error) {
      setErrorUpload(error.message);
      setLoadingUpload(false);
    }
  };

  return (
    <div>
      <form className="form" onSubmit={submitHandler}>
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
            {loadingUpdate && <LoadingBox></LoadingBox>}
            {errorUpdate && (
              <MessageBox variant="danger">Профилиңизди жаңыланбады, талааларды текшерип, кайрадан жаңыртыңыз!</MessageBox>
            )}
            {((user && user.isSeller) || !sellerMode) && (
              <>
                <div>
                  <h1>Колдонуучунун профили</h1>
                </div>
                <div>
                  <label htmlFor="name">Аты</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Атыңызды киргизиңиз"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  ></input>
                </div>
                <div>
                  <label htmlFor="email">Электрондук почта</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Электрондук почтаңызды киргизиңиз"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  ></input>
                </div>
                <div>
                  <label htmlFor="password">Сырсөз</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Сырсөздү киргизиңиз"
                    onChange={(e) => setPassword(e.target.value)}
                  ></input>
                </div>
                <div>
                  <label htmlFor="confirmPassword">Сырсөздү ыраста</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Сырсөздү киргизиңиз"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  ></input>
                </div>
              </>)}
            {((user && user.isSeller) || sellerMode) && (
              <>
                <h2>Сатуучунун профили</h2>
                <div>
                  <label htmlFor="sellerName">Дүкөндүн аты</label>
                  <input
                    id="sellerName"
                    type="text"
                    placeholder="Дүкөндүн атын киргизиңиз"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    required
                  ></input>
                </div>
                <div>
                  <label htmlFor="sellerLogo">Дүкөндүн логотиби</label>
                  <input
                    id="sellerLogo"
                    type="text"
                    placeholder="Дүкөндүн логотибин тандаңыз"
                    value={sellerLogo}
                    onChange={(e) => setSellerLogo(e.target.value)}
                    disabled
                  ></input>
                </div>
                {sellerLogo ? <div>
                  <label htmlFor="imageFile">Сүрөт файлы</label>
                  <input
                    type="file"
                    id="imageFile"
                    label="Сүрөттү тандаңыз"
                    onChange={uploadFileHandler}
                  ></input>
                </div> :
                <div>
                  <label htmlFor="imageFile">Сүрөт файлы</label>
                  <input
                    type="file"
                    id="imageFile"
                    label="Сүрөттү тандаңыз"
                    onChange={uploadFileHandler}
                    required
                  ></input>
                </div>}
                {loadingUpload && <LoadingBox></LoadingBox>}
                  {errorUpload && (
                    <MessageBox variant="danger">{errorUpload}</MessageBox>
                  )}
                {sellerMode || !instagram ?
                <div>
                  <label htmlFor="email">Instagram аккаунту</label>
                  <input
                    id="instagram"
                    type="text"
                    placeholder="Инстаграм аккаунтун киргизиңиз"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  ></input>
                </div> :
                <div>
                  <label htmlFor="email">Instagram аккаунту</label>
                  <input
                    id="instagram"
                    type="text"
                    placeholder="Инстаграм аккаунтун киргизиңиз"
                    value={instagram}
                    disabled
                    onChange={(e) => setInstagram(e.target.value)}
                  ></input>
                </div>
                }
                <div>
                  <label htmlFor="sellerDescription">Дүкөндүн сүрөттөмөсү</label>
                  <input
                    id="sellerDescription"
                    type="text"
                    placeholder="Дүкөндүн сүрөттөмөсүн киргизиңиз"
                    value={sellerDescription}
                    onChange={(e) => setSellerDescription(e.target.value)}
                  ></input>
                </div>
                <h2>Төлөө ыкмасы</h2>
                <div>
                  <label htmlFor="visaCard">Visa Card</label>
                  <input
                    id="visaCard"
                    type="text"
                    placeholder="Виза кард номерин киргизиңиз"
                    value={payMethod && payMethod.visaCard}
                    onChange={(e) => getPayMethod(e.target.value, "visaCard")}
                  ></input>
                </div>
                <div>
                  <label htmlFor="elsom">Элсом</label>
                  <input
                    id="elsom"
                    type="text"
                    placeholder="Элсом номерин киргизиңиз"
                    value={payMethod && payMethod.elsom}
                    onChange={(e) => getPayMethod(e.target.value, "elsom")}
                  ></input>
                </div>
                <div>
                  <label htmlFor="Omoney">О! Деньги</label>
                  <input
                    id="Omoney"
                    type="text"
                    placeholder="О! Деньги капчыгыңыздын номерин киргизиңиз"
                    value={payMethod && payMethod.Omoney}
                    onChange={(e) => getPayMethod(e.target.value, "Omoney")}
                  ></input>
                </div>
                <div>
                  <label htmlFor="balanceKg">Balance.kg</label>
                  <input
                    id="balanceKg"
                    type="text"
                    placeholder="Balance.kg капчыгыңыздын номерин киргизиңиз"
                    value={payMethod && payMethod.balanceKg}
                    onChange={(e) => getPayMethod(e.target.value, "balanceKg")}
                  ></input>
                </div>
                <div>
                  <label htmlFor="mBank">M Bank</label>
                  <input
                    id="mBank"
                    type="text"
                    placeholder="М Bank капчыгыңыздын номерин киргизиңиз"
                    value={payMethod && payMethod.mBank}
                    onChange={(e) => getPayMethod(e.target.value, "mBank")}
                  ></input>
                </div>
              </>
            )}
            <div>
              {sellerMode ?
                <>
                  <label />
                  <button className="primary" type="submit">
                    Каттоо
                  </button>
                </> :
                <>
                  <label />
                  <button className="primary" type="submit">
                    Жаңыртуу
                  </button>
                </>
              }
            </div>
          </>
        )}
      </form>
    </div>
  );
}
