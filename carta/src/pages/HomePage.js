import React from "react";
import "../styles/Home.css";
import TopBar from "../components/Navbar/Topbar";
import Carrousel from "../components/Carrousel/Carrousel";
import porque1 from "../assets/images/porque-1.jpg";
import porque2 from "../assets/images/porque-2.jpeg";
import porque3 from "../assets/images/porque-3.jpeg";

const Home = () => {
  return (
    <>
      <TopBar />
      <div className="home-container">
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
                <img src={porque2} alt="Ubicación" />
                <div className="feature-text">
                  <h3>UBICACIÓN ESTRATÉGICA</h3>
                </div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-image-wrapper">
                <img src={porque3} alt="Gastronomía" />
                <div className="feature-text">
                  <h3>SERVICIO Y GASTRONOMÍA</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🌍 Mapa y botón de cómo llegar */}
        <section className="map-section">
          <div className="map-wrapper">
            <iframe
              title="Ubicación Restaurante"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3182.563455031503!2d-4.5016033!3d36.6254904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72f79fdc021a33%3A0x4641c2adf0c4bb26!2sC.%20de%20la%20Cruz%2C%2010%2C%2029620%20Torremolinos%2C%20M%C3%A1laga%2C%20Spain!5e0!3m2!1ses!2ses!4v1714000000000"
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=36.62549042334233,-4.499029101110904"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-llegar"
            >
              Cómo llegar
            </a>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-top">
            <div className="footer-info">
              <h3 className="footer-title">Contacto</h3>
              <p className="footer-item">📞 Teléfono: 665 92 54 13</p>
              <p className="footer-item">📍 Dirección: Calle de la Cruz, 10, 29620, Torremolinos, Málaga, España</p>
            </div>

            <div className="footer-horario">
              <h3 className="footer-title">Horarios</h3>
              <p className="footer-item">Martes - Domingo</p>
              <p className="footer-item">🕐 13:00 - 17:00</p>
              <p className="footer-item">🕐 20:00 - 24:00</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Zabor Fetén. Todos los derechos reservados.</p>
          </div>
        </footer>

      </div>
    </>
  );
};

export default Home;
