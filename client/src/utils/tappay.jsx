const TAPPAY_SCRIPT_ID = "tappay-sdk";
const TAPPAY_SCRIPT_SRC = "https://js.tappaysdk.com/tpdirect/v5.13.1";

// const TAPPAY_ID = import.meta.env.VITE_TAPPAY_ID;
// const TAPPAY_KEY = import.meta.env.VITE_TAPPAY_KEY;

function insertTappayScript() {
  return new Promise((resolve) => {
    if (document.getElementById(TAPPAY_SCRIPT_ID)) {
      resolve();
      return;
    }
    const tappayScriptTag = document.createElement("script");
    tappayScriptTag.setAttribute("id", TAPPAY_SCRIPT_ID);
    tappayScriptTag.setAttribute("src", TAPPAY_SCRIPT_SRC);
    tappayScriptTag.addEventListener("load", resolve);
    document.head.appendChild(tappayScriptTag);
  });
}

const tappay = {
  setupSDK: async (TAPPAY_ID, TAPPAY_KEY) => {
    await insertTappayScript();
    window.TPDirect.setupSDK(TAPPAY_ID, TAPPAY_KEY, "sandbox");
  },
  setupCard(numberElement, expirationDateElement, ccvElement) {
    window.TPDirect.card.setup({
      fields: {
        number: {
          element: numberElement,
          placeholder: "**** **** **** ****",
        },
        expirationDate: {
          element: expirationDateElement,
          placeholder: "MM / YY",
        },
        ccv: {
          element: ccvElement,
          placeholder: "後三碼",
        },
      },
      styles: {
        input: {
          color: "gray",
        },
        "input.ccv": {
          "font-size": "16px",
        },
        "input.expiration-date": {
          "font-size": "16px",
        },
        "input.card-number": {
          "font-size": "16px",
        },
        ":focus": {
          color: "black",
        },
        ".valid": {
          color: "green",
        },
        ".invalid": {
          color: "red",
        },
      },
      isMaskCreditCardNumber: true,
      maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11,
      },
    });
  },
  canGetPrime() {
    return window.TPDirect.card.getTappayFieldsStatus().canGetPrime;
  },
  getPrime() {
    return new Promise((resolve) => {
      window.TPDirect.card.getPrime((result) => {
        resolve(result);
      });
    });
  },
};

export default tappay;
