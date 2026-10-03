import { useEffect, useState } from "react";
import axios from "axios";
import {
  Wrench,
  Search,
  Star,
  Calendar,
  ShieldCheck,
  Clock,
  MapPin,
} from "lucide-react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

function App() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/services`);
      setServices(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load services.");
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) =>
    service.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">
            <Wrench size={22} />
          </div>
          <span>HomeFix</span>
        </div>

        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
          <button className="login-btn">Login</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} />
            Trusted Home Services
          </div>

          <h1>
            Home services,
            <br />
            <span>made simple.</span>
          </h1>

          <p>
            Find trusted professionals for repairs, maintenance,
            and everyday home services.
          </p>

          <div className="search-box">
            <Search size={21} />
            <input
              type="text"
              placeholder="What service do you need?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button>Search</button>
          </div>

          <div className="hero-info">
            <span>
              <ShieldCheck size={17} />
              Verified professionals
            </span>
            <span>
              <Clock size={17} />
              Quick booking
            </span>
            <span>
              <Star size={17} />
              Quality service
            </span>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services-section" id="services">
        <div className="section-header">
          <div>
            <p className="section-label">OUR SERVICES</p>
            <h2>Popular Home Services</h2>
            <p>Choose a service and book a professional.</p>
          </div>

          <div className="location">
            <MapPin size={18} />
            Kathmandu
          </div>
        </div>

        {loading && (
          <div className="status">
            Loading services...
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="services-grid">
            {filteredServices.map((service) => (
              <div className="service-card" key={service.id}>
                <div className="service-icon">
                  <Wrench size={25} />
                </div>

                <div className="service-content">
                  <h3>{service.name}</h3>

                  <div className="rating">
                    <Star size={15} fill="currentColor" />
                    <span>4.8</span>
                    <span className="reviews">(120+ reviews)</span>
                  </div>

                  <p>
                    Professional and reliable {service.name?.toLowerCase()}{" "}
                    service for your home.
                  </p>

                  <div className="service-bottom">
                    <span className="price">
                      Rs. {service.price || "Contact"}
                    </span>

                    <button className="book-btn">
                      <Calendar size={16} />
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredServices.length === 0 && (
          <div className="status">
            No services found.
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="how-section" id="how-it-works">
        <div className="section-title">
          <p className="section-label">SIMPLE PROCESS</p>
          <h2>How HomeFix Works</h2>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Choose a service</h3>
            <p>Select the home service you need.</p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <h3>Book a professional</h3>
            <p>Choose a convenient date and time.</p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <h3>Get it fixed</h3>
            <p>A professional comes to your home.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="logo">
          <div className="logo-icon">
            <Wrench size={19} />
          </div>
          <span>HomeFix</span>
        </div>

        <p>Reliable home services, whenever you need them.</p>

        <span>© 2026 HomeFix</span>
      </footer>
    </div>
  );
}

export default App;