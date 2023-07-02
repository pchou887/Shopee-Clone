import { Carousel } from "antd";

const contentStyle = {
  height: "235px",
  color: "#fff",
  lineHeight: "235px",
  textAlign: "center",
  background: "#364d79",
};

const Carousels = () => {
  const dotClass = "carousel-button";
  return (
    <Carousel dotPosition="bottom" dots={{ className: dotClass }} autoplay>
      <div>
        <h3 style={contentStyle}>1</h3>
      </div>
      <div>
        <h3 style={contentStyle}>2</h3>
      </div>
      <div>
        <h3 style={contentStyle}>3</h3>
      </div>
      <div>
        <h3 style={contentStyle}>4</h3>
      </div>
    </Carousel>
  );
};

export default Carousels;
