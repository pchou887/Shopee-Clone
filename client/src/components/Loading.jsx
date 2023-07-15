function Loading({ style, imgStyle }) {
  return (
    <div className="loading-div" style={style}>
      <img
        className="loading"
        src="https://d1a26cbu5iquck.cloudfront.net/icon/loading.png"
        alt="loading"
        style={imgStyle}
      />
    </div>
  );
}

export default Loading;
