import React from 'react'
import CurrencyConverter from '../components/CurrencyConverter'
import Newsletter from '../components/Newsletter'

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-blue-950 mb-6">
            Real-Time Currency Conversion
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert between currencies instantly with live exchange rates. 
            Fast, accurate, and free.
          </p>
        </div>

        <CurrencyConverter />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-blue-950 mb-3">Real-Time Rates</h3>
            <p className="text-gray-600">Live exchange rates updated every minute for accurate conversions.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-blue-950 mb-3">Secure & Private</h3>
            <p className="text-gray-600">Your data is encrypted and never shared with third parties.</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-blue-950 mb-3">Mobile Friendly</h3>
            <p className="text-gray-600">Convert currencies on the go with our responsive design.</p>
          </div>
        </div>

        <Newsletter />
      </div>
    </div>
  )
}