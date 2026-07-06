import React, { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 my-20">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Stay Updated with Exchange Rates
        </h2>
        <p className="text-blue-100 mb-8">
          Get daily exchange rate alerts and market insights delivered to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Subscribe
          </button>
        </form>
        
        {subscribed && (
          <div className="mt-4 text-green-200 font-semibold animate-bounce">
            ✓ Thank you for subscribing!
          </div>
        )}
      </div>
    </div>
  )
}