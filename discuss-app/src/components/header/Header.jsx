import React from "react";
import Slider from "react-slick";
import "./header.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Header() {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: false,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };

  const images = [
    "/header1.jpg",
    "/header2.jpg",
    "/header3.jpg",
    "/header4.jpg",
    "/header5.jpg",
    "/header6.jpg",
    "/header7.jpg",
    "/header8.jpg",
    "/header9.jpg",
    "/header10.jpg",
    "/header11.jpg",
    "/header12.jpg",
    "/header13.jpg",
  ];

  return (
    <div className="header">
      <div className="headerTitle">
        <span className="headerTitleSm">
          <i>
            <strong>" Dream, transforms into thoughts. Thoughts, result into action. "</strong>
          </i>
        </span>
      </div>
      <div className="carousel-container">
        <Slider {...settings}>
          {images.map((image, index) => (
            <div key={index}>
              <img className="headerImg" src={image} alt={`Slide ${index + 1}`} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}

// Custom Arrow Components
const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="slick-arrow slick-prev" onClick={onClick}>
      &lt;
    </div>
  );
};

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <div className="slick-arrow slick-next" onClick={onClick}>
      &gt;
    </div>
  );
};