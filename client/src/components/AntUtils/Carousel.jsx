import { Carousel } from "antd";

const contentStyle = {
  minWidth: "795px",
  height: "235px",
  lineHeight: "235px",
  cursor: "default",
};

const Carousels = () => {
  const dotClass = "carousel-button";
  return (
    <Carousel dotPosition="bottom" dots={{ className: dotClass }} autoplay>
      <div>
        <img
          style={contentStyle}
          src="https://d1a26cbu5iquck.cloudfront.net/campaign/campaign1.jpeg"
        />
      </div>
      <div>
        <img
          style={contentStyle}
          src="https://d1a26cbu5iquck.cloudfront.net/campaign/campaign2.jpeg"
        />
      </div>
      <div>
        <img
          style={contentStyle}
          src="https://d1a26cbu5iquck.cloudfront.net/campaign/campaign3.jpeg"
        />
      </div>
    </Carousel>
  );
};

export default Carousels;
