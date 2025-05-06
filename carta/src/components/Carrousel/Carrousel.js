import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import burgerImg from "../../assets/images/main-burgers.jpeg";
import cocktailImg from "../../assets/images/main-cocktel.jpeg";
import "../../styles/HomeCarrousel.css";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

const HomeCarousel = () => {
  const navigate = useNavigate();

  const slides = [
    {
      src: burgerImg,
      text: "Disfruta de las mejores tapitas de Torremolinos",
    },
    {
      src: cocktailImg,
      text: "El cóctel perfecto para la ocasión",
    },
  ];

  const handleReservaClick = useCallback(() => navigate("/reservas"), [navigate]);

  const handleCartaClick = useCallback(() => navigate("/carta"), [navigate]);

  return (
    <Swiper
      modules={[Autoplay]}
      autoplay={{ delay: 4000 }}
      loop={true}
      spaceBetween={0}
      slidesPerView={1}
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          <div className="slide-container">
            <img src={slide.src} alt={`Slide ${index + 1}`} className="carousel-img" />
            <div className="slide-overlay">
              <h2 className="title-text">{slide.text}</h2>
              <div className="carousel-buttons">
                <button className="reserva-btn" onClick={handleReservaClick}>¡RESERVA MESA!</button>
                <button className="carta-btn" onClick={handleCartaClick}>VER CARTA</button>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HomeCarousel;
