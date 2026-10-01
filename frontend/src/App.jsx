import { useEffect, useState } from 'react'
import {
  Link,
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Check,
  Droplets,
  Hammer,
  Home as HomeIcon,
  Menu,
  Sparkles,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import axios from 'axios'
import './App.css'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
})

/* ----------------------------- Header ----------------------------- */

function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header>
      <Link className="logo" to="/">
        homefix<span>.</span>
      </Link>

      <button
        className="menu"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X /> : <Menu />}
      </button>

      <nav className={open ? 'open' : ''}>
        <NavLink to="/services">Services</NavLink>
        <NavLink to="/professionals">Professionals</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>

        <Link className="button dark" to="/login">
          Log in <ArrowRight size={16} />
        </Link>
      </nav>
    </header>
  )
}

/* ----------------------------- Layout ----------------------------- */

function Layout({ children }) {
  return (
    <>
      <Header />

      <main>{children}</main>

      <footer>
        <Link className="logo" to="/">
          homefix<span>.</span>
        </Link>

        <span>Good help, right at home.</span>
      </footer>
    </>
  )
}

/* ----------------------------- Home ----------------------------- */

function Home() {
  const featuredServices = [
    {
      id: 'plumbing',
      name: 'Plumbing',
      Icon: Droplets,
      description:
        'Leaks, repairs, installations and everything in between.',
    },
    {
      id: 'electrical',
      name: 'Electrical',
      Icon: Zap,
      description:
        'Safe, reliable electrical work from certified experts.',
    },
    {
      id: 'home-cleaning',
      name: 'Cleaning',
      Icon: Sparkles,
      description:
        'A deeper clean for a home that feels like yours.',
    },
    {
      id: 'appliance-repair',
      name: 'Appliance Repair',
      Icon: Wrench,
      description:
        'Keep your essential appliances running smoothly.',
    },
  ]

  return (
    <Layout>
      <section className="hero">
        <div>
          <small>● TRUSTED HOME SERVICES, MADE SIMPLE</small>

          <h1>
            Your home,
            <br />
            <em>in good hands.</em>
          </h1>

          <p>
            From a dripping tap to a full home refresh, find the right
            professional and book with confidence.
          </p>

          <Link className="button dark" to="/services">
            Find a professional <ArrowRight size={17} />
          </Link>
        </div>

        <div className="illustration">
          <div className="sun" />

          <div className="house">
            <div className="door" />
          </div>

          <div className="rating">
            <strong>4.9</strong>
            <span>★★★★★</span>
            <small>from 12,000+ happy homes</small>
          </div>
        </div>
      </section>

      <section className="trust">
        Trusted by 12,000+ homeowners

        <span>
          ✓ Verified professionals · Easy booking · Real reviews
        </span>
      </section>

      <section className="section">
        <small>WHAT CAN WE HELP WITH?</small>

        <h2>
          Small fix or big change,
          <br />
          <em>we've got you.</em>
        </h2>

        <div className="grid">
          {featuredServices.map(service => {
            const Icon = service.Icon

            return (
              <Link
                className="card"
                to={`/services/${service.id}`}
                key={service.id}
              >
                <Icon />

                <h3>{service.name}</h3>

                <p>{service.description}</p>

                <b>
                  Explore <ArrowRight size={14} />
                </b>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="band">
        <small>THE HOMEFIX DIFFERENCE</small>

        <h2>
          Good work feels <em>better.</em>
        </h2>

        <p>
          <Shield />
          People you can trust
          <br />
          <span>
            Every professional is vetted and background checked.
          </span>
        </p>

        <p>
          <CalendarDays />
          Booking that fits your life
          <br />
          <span>
            Pick a time that works. We’ll handle the rest.
          </span>
        </p>
      </section>
    </Layout>
  )
}

/* ----------------------------- Services ----------------------------- */

function Services() {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState([])
  const [state, setState] = useState('loading')

  useEffect(() => {
    api
      .get('/services')
      .then(response => {
        setItems(response.data)
        setState('ready')
      })
      .catch(error => {
        console.error('Failed to load services:', error)
        setState('error')
      })
  }, [])

  const filtered = items.filter(service =>
    service.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Layout>
      <section className="page">
        <small>OUR SERVICES</small>

        <h1>
          Everything your home
          <br />
          <em>needs to thrive.</em>
        </h1>

        <p>
          Thoughtful, reliable help for the things that keep your
          home running beautifully.
        </p>

        <input
          className="search"
          placeholder="Search services"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        {state === 'loading' && <p>Loading services…</p>}

        {state === 'error' && (
          <p>
            We could not load services. Check that the API is running
            on port 5001.
          </p>
        )}

        {state === 'ready' && !filtered.length && (
          <p>No matching services found.</p>
        )}

        <div className="grid">
          {filtered.map(service => (
            <Link
              className="card"
              to={`/services/${service.slug}`}
              key={service.id}
            >
              <Wrench />

              <h3>{service.name}</h3>

              <p>{service.description}</p>

              <strong>
                From NPR {Number(service.base_price).toLocaleString()}
              </strong>

              <b>
                Explore <ArrowRight size={14} />
              </b>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  )
}

/* ----------------------------- Professionals ----------------------------- */

function Professionals() {
  const [items, setItems] = useState([])
  const [state, setState] = useState('loading')

  useEffect(() => {
    api
      .get('/professionals')
      .then(response => {
        setItems(response.data)
        setState('ready')
      })
      .catch(error => {
        console.error('Failed to load professionals:', error)
        setState('error')
      })
  }, [])

  return (
    <Layout>
      <section className="page">
        <small>THE PEOPLE BEHIND THE WORK</small>

        <h1>
          Meet your future
          <br />
          <em>home heroes.</em>
        </h1>

        <p>
          Skilled, kind and ready to help. Every HomeFix professional
          is vetted by us.
        </p>

        {state === 'loading' && <p>Loading professionals…</p>}

        {state === 'error' && (
          <p>
            We could not load professionals. Check that the API is
            running on port 5001.
          </p>
        )}

        {state === 'ready' && !items.length && (
          <p>No professionals found.</p>
        )}

        <div className="pro-grid">
          {items.map(professional => (
            <Link
              className="pro"
              to={`/professionals/${professional.id}`}
              key={professional.id}
            >
              <img
                src={professional.profile_image_url}
                alt={professional.full_name}
              />

              <span>
                <strong>{professional.full_name}</strong>

                <small>
                  {professional.profession} · {professional.location}
                </small>

                <span className="stars">
                  ★ {professional.rating}
                </span>
              </span>

              <ArrowRight />
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  )
}

/* ----------------------------- Booking ----------------------------- */

function Booking() {
  const [services, setServices] = useState([])
  const [professionals, setProfessionals] = useState([])

  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/services'),
      api.get('/professionals'),
    ])
      .then(([servicesResponse, professionalsResponse]) => {
        setServices(servicesResponse.data)
        setProfessionals(professionalsResponse.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to load booking data:', error)
        setError('Could not load services or professionals.')
        setLoading(false)
      })
  }, [])

  const submit = async e => {
    e.preventDefault()

    setError('')

    const form = e.currentTarget

    try {
      const formData = Object.fromEntries(new FormData(form))

      await api.post('/bookings', formData, {
        headers: {
          Authorization: `Bearer ${
            localStorage.getItem('homefix_token') || ''
          }`,
        },
      })

      setDone(true)
    } catch (error) {
      console.error('Booking failed:', error)

      setError(
        error.response?.data?.error ||
          'Could not create booking. Please log in first.'
      )
    }
  }

  return (
    <Layout>
      {done ? (
        <section className="success">
          <Check />

          <small>YOU'RE ALL SET</small>

          <h1>
            Your home is in
            <br />
            <em>good hands.</em>
          </h1>

          <p>
            Your booking has been successfully created.
          </p>

          <Link className="button dark" to="/dashboard">
            View my bookings <ArrowRight size={17} />
          </Link>
        </section>
      ) : (
        <section className="form-page">
          <div>
            <small>BOOK A SERVICE</small>

            <h1>
              Let's get your
              <br />
              <em>to-do done.</em>
            </h1>

            <p>
              Tell us a little about what you need. It only takes a
              minute.
            </p>

            {error && <p className="error">{error}</p>}
          </div>

          {loading ? (
            <p>Loading booking options…</p>
          ) : (
            <form onSubmit={submit}>
              <label>
                Service

                <select name="service_id" required>
                  <option value="">Select a service</option>

                  {services.map(service => (
                    <option
                      value={service.id}
                      key={service.id}
                    >
                      {service.name} — NPR{' '}
                      {Number(service.base_price).toLocaleString()}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Professional

                <select name="professional_id">
                  <option value="">No preference</option>

                  {professionals.map(professional => (
                    <option
                      value={professional.id}
                      key={professional.id}
                    >
                      {professional.full_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Date

                <input
                  type="date"
                  name="scheduled_date"
                  required
                />
              </label>

              <label>
                Time

                <select name="scheduled_time" required>
                  <option value="">Select a time</option>

                  <option value="09:00">
                    9:00 AM – 11:00 AM
                  </option>

                  <option value="12:00">
                    12:00 PM – 2:00 PM
                  </option>

                  <option value="15:00">
                    3:00 PM – 5:00 PM
                  </option>
                </select>
              </label>

              <label>
                Address

                <input
                  name="address"
                  placeholder="123 Main Street"
                  required
                />
              </label>

              <label>
                Notes

                <textarea name="notes" rows="4" />
              </label>

              <button className="button dark" type="submit">
                Request booking <ArrowRight size={17} />
              </button>
            </form>
          )}
        </section>
      )}
    </Layout>
  )
}

/* ----------------------------- Simple Pages ----------------------------- */

function Simple({ title, children }) {
  return (
    <Layout>
      <section className="page simple">
        <small>HOMEFIX</small>

        <h1>{title}</h1>

        <p>{children}</p>

        <Link className="button dark" to="/services">
          Find a professional <ArrowRight size={17} />
        </Link>
      </section>
    </Layout>
  )
}

/* ----------------------------- App Routes ----------------------------- */

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/services" element={<Services />} />

        <Route
          path="/services/:id"
          element={
            <Simple title="Service details">
              Connect with a vetted local expert who cares about the
              details.
            </Simple>
          }
        />

        <Route
          path="/professionals"
          element={<Professionals />}
        />

        <Route
          path="/professionals/:id"
          element={
            <Simple title="Your next home hero">
              Skilled, kind and ready to help.
            </Simple>
          }
        />

        <Route path="/booking" element={<Booking />} />

        <Route
          path="/dashboard"
          element={
            <Simple title="Your HomeFix dashboard">
              Your bookings and home services, all in one place.
            </Simple>
          }
        />

        <Route
          path="/login"
          element={
            <Simple title="Welcome back">
              Log in to manage your HomeFix bookings.
            </Simple>
          }
        />

        <Route
          path="/register"
          element={
            <Simple title="Make yourself at home.">
              Create your free HomeFix account.
            </Simple>
          }
        />

        <Route
          path="/about"
          element={
            <Simple title="Good help should feel this easy.">
              HomeFix pairs thoughtful homeowners with skilled local
              professionals.
            </Simple>
          }
        />

        <Route
          path="/contact"
          element={
            <Simple title="Let’s talk.">
              Our friendly support team is ready to help.
            </Simple>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

/* ----------------------------- Shield Icon ----------------------------- */

function Shield() {
  return <Check size={18} />
}

export default App