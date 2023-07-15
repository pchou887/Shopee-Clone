function NotFound() {
  return (
    <>
      <div className="main">
        <div
          className="notfound"
          style={{
            fontSize: 60,
            fontWeight: 600,
            textAlign: "center",
            marginTop: 119,
            paddingTop: 50,
            color: "#ee4d2d",
          }}
        >
          404 Not Found
        </div>
        <div
          className="notfound-content"
          style={{ textAlign: "center", fontSize: 24 }}
        >
          請確認您輸入的網址
        </div>
      </div>
    </>
  );
}

export default NotFound;
