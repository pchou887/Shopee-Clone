function Amount({ amount, setAmount, limited, onChange }) {
  return (
    <>
      <div className="product-amount">
        <button
          className="amount-diff amount-button"
          onClick={() => setAmount(amount - 1 > 0 ? amount - 1 : amount)}
        >
          -
        </button>
        <input
          className="amount"
          type="number"
          value={amount}
          required
          readOnly
        />
        <button
          className="amount-plus amount-button"
          onClick={() => setAmount(amount + 1 <= limited ? amount + 1 : amount)}
        >
          +
        </button>
      </div>
    </>
  );
}
export default Amount;
