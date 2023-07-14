import { useRef, useEffect, useState } from "react";
import tappay from "../utils/tappay";
import Modal from "./AntUtils/Modal";

const TAPPAY_ID = import.meta.env.VITE_TAPPAY_ID;
const TAPPAY_KEY = import.meta.env.VITE_TAPPAY_KEY;

function Order({ products, recipient, setRecipient, checkoutSubmit }) {
  const [payment, setPayment] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const cardNumberRef = useRef();
  const cardExpirationDateRef = useRef();
  const cardCCVRef = useRef();
  const formRef = useRef();
  const freight = 45;
  useEffect(() => {
    async function setupTappay() {
      await tappay.setupSDK(TAPPAY_ID, TAPPAY_KEY);
      tappay.setupCard(
        cardNumberRef.current,
        cardExpirationDateRef.current,
        cardCCVRef.current
      );
    }
    setupTappay();
  }, [payment]);

  function subtotalFun() {
    return products.reduce((acc, ele) => acc + ele.price * ele.amount, 0);
  }
  return (
    <>
      <div className="main">
        <div className="content">
          <div className="order-header">
            <div className="order-header-name">
              <h2 style={{ fontSize: "18px", fontWeight: "500" }}>訂單商品</h2>
            </div>
            <div className="order-header-price text-gray">單價</div>
            <div className="order-header-number text-gray">數量</div>
            <div className="order-header-total text-gray">總價</div>
          </div>
          <div className="storeArea">
            {products &&
              products.map((ele) => (
                <div key={ele.productId} className="order-product-info">
                  <img
                    src={ele.image}
                    alt={ele.name}
                    className="order-product-image"
                  ></img>
                  <div className="order-product-name">{ele.name}</div>
                  <div className="order-product-kind text-gray">{ele.kind}</div>
                  <div className="order-product-price">${ele.price}</div>
                  <div className="order-product-amount">{ele.amount}</div>
                  <div className="order-product-total">
                    ${ele.price * ele.amount}
                  </div>
                </div>
              ))}
          </div>
          <div className="order-address-info">
            <div className="order-note">
              <div className="order-note-text">
                備註：
                <input
                  className="order-note-input"
                  type="text"
                  placeholder="管理室代收/電話聯絡時間..."
                />
              </div>
            </div>
            <div className="order-address-details">
              <div className="order-address-details-div">
                <div className="order-address-details-title order-address-details-first">
                  寄送資訊
                </div>
                <div className="order-address-details-second"></div>
                <div className="order-address-details-third"></div>
                <div className="order-address-details-fourth">${freight}</div>
              </div>
              <div className="order-address-details-div">
                <div className="order-address-details-first"></div>
                <div className="order-address-details-second text-gray">
                  {`${recipient.name} ${recipient.phone}`}
                </div>
                <div className="order-address-details-third text-gray">
                  {recipient.address}
                </div>
                <div
                  className="order-address-details-fourth addressChange"
                  onClick={() => setModalOpen(true)}
                >
                  變更
                </div>
                <Modal
                  modalOpen={modalOpen}
                  setModalOpen={setModalOpen}
                  setRecipient={setRecipient}
                />
              </div>
            </div>
          </div>
          <div className="textEnd orderPrice">
            <div className="text-gray">
              訂單金額({products && products.length} 商品):
              <span className="orderPriceTotal">
                ${products && subtotalFun() + freight}
              </span>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="payment-header">
            <div className="payment-title">
              <h3 style={{ fontWeight: 500 }}>付款方式</h3>
            </div>
            <div className="paymentWay">
              <div
                className={`select-btn ${
                  payment === 1 ? `select-btn-active` : ""
                }`}
                onClick={() => (payment === 1 ? setPayment(0) : setPayment(1))}
              >
                信用卡/金融卡
              </div>
              {/* <div
                className={`select-btn ${
                  payment === 2 ? `select-btn-active` : ""
                }`}
                onClick={() => setPayment(2)}
              >
                貨到付款
              </div> */}
            </div>
          </div>
          {payment === 1 && (
            <form ref={formRef}>
              <div className="order-tappay">
                <div className="card-number card">
                  <p className="card-title">信用卡號碼：</p>
                  <div
                    className="tpfield"
                    id="card-number"
                    ref={cardNumberRef}
                  ></div>
                </div>
                <div className="card-expiration-date card">
                  <p className="card-title">有效期限：</p>
                  <div
                    className="tpfield"
                    id="card-expiration-date"
                    ref={cardExpirationDateRef}
                  ></div>
                </div>

                <div className="card-ccv card">
                  <p className="card-title">安全碼：</p>
                  <div className="tpfield" id="card-ccv" ref={cardCCVRef}></div>
                </div>
              </div>
            </form>
          )}
          {/* {payment === 2 && (
            <div className="payment-cash">
              <div className="payment-title">貨到付款</div>
              <div>現付</div>
            </div>
          )} */}
          <div className="payment-total">
            <div className="payment-total-price">
              <div className="payment-total-title">商品總金額：</div>
              <div className="payment-total-fee text-gray">
                ${products && subtotalFun()}
              </div>
            </div>
            <div className="payment-total-price">
              <div className="payment-total-title">運費總金額：</div>
              <div className="payment-total-fee text-gray">${freight}</div>
            </div>
            <div className="payment-total-price" style={{ height: "50px" }}>
              <div className="payment-total-title" style={{ height: "50px" }}>
                總付款金額：
              </div>
              <div
                className="payment-total-fee"
                style={{
                  color: "#ee4d2d",
                  fontSize: "28px",
                  height: "50px",
                }}
              >
                ${products && subtotalFun() + freight}
              </div>
            </div>
          </div>
          <div className="payment-buy">
            <div className="payment-buy-btn" onClick={checkoutSubmit}>
              下訂單
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Order;
