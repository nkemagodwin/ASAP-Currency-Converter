import React, { useReducer } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Trade from './pages/Trade'
import About from './pages/About'
import Portfolio from './pages/Portfolio'
import FAQ from './pages/FAQ'
import History from './pages/History'
import Contact from './pages/Contact'
import SignUp from './auth/SignUp'
import SignIn from './auth/SignIn'
import ProtectedRoute from './components/ProtectedRoute' // You'll need to create this component

// Define your reducer function
const initialState = {
  user: null,
  isAuthenticated: false,
  // other state properties
}

function reducer(state, action) {
  switch (action.type) {
    case 'SignIn':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false
      }
    // other cases
    default:
      return state
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar state={state} dispatch={dispatch} />
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trade" element={
              <ProtectedRoute isAuthenticated={state.isAuthenticated}>
                <Trade />
                <History />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute isAuthenticated={state.isAuthenticated}>
                <History />
              </ProtectedRoute>
            } />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signup" element={<SignUp dispatch={dispatch} />} />
            <Route path="/signin" element={<SignIn dispatch={dispatch} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App