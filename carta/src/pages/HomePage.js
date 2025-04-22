import React from "react";
import "../styles/Home.css";
import TopBar from "../components/Navbar/Topbar";
import Carrousel from "../components/Carrousel/Carrousel";
import porque1 from "../assets/images/porque-1.jpg";
import porque2 from "../assets/images/porque-2.jpeg";
import porque3 from "../assets/images/porque-3.jpeg";
import plato1 from "../assets/images/ensalada-atun-rojo.avif";
import plato2 from "../assets/images/solomillo-ternera.avif";
import plato3 from "../assets/images/steaktartar.avif";
import plato4 from "../assets/images/negroni.avif";

const Home = () => {
  return (
    <>
      <TopBar />
      <div className="home-container">
        {/* Carrusel + texto + botón */}
        <section className="hero">
          <div className="carousel">
            <Carrousel />
          </div>
        </section>


        <section className="features">
          <div className="features-title">
            <h2>¿Por qué elegirnos?</h2>
          </div>

          <div className="features-grid">
            <div className="feature">
              <div className="feature-image-wrapper">
                <img src={porque1} alt="Ambiente" />
                <div className="feature-text">
                  <h3>AMBIENTE ACOGEDOR</h3>
                </div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-image-wrapper">
                <img src={porque2} alt="Ambiente" />
                <div className="feature-text">
                  <h3>UBICACIÓN ESTRATÉGICA</h3>
                </div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-image-wrapper">
                <img src={porque3} alt="Ambiente" />
                <div className="feature-text">
                  <h3>SERVICIO Y GASTRONOMÍA</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/*
          <section className="platos">
            <div className="features-title">
              <h2>Platos que te sorprenderán</h2>
            </div>

            <div className="platos-grid">
              <div className="plato">
                <div className="plato-image-wrapper">
            <img src={plato1} alt="Ensalada de atún rojo" />
                </div>
              </div>
              <div className="plato">
                <div className="plato-image-wrapper">
            <img src={plato2} alt="Solomillo de ternera" />
                </div>
              </div>
              <div className="plato">
                <div className="plato-image-wrapper">
            <img src={plato3} alt="Steak tartar" />
                </div>
              </div>
              <div className="plato">
                <div className="plato-image-wrapper">
            <img src={plato4} alt="Negroni" />
                </div>
              </div>
            </div>
          </section>
        */}
        <footer className="footer">
          <p>📞 Teléfono: 952 000 000</p>
          <p>📍 Dirección: Calle del Sabor, Torremolinos</p>
          <p>📧 Email: reservas@torretapas.com</p>
        </footer>
      </div>
    </>
  );
};

export default Home;
