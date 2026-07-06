import React from 'react'

export default function About() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-950 mb-6">About ASAP Currency</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner for real-time currency conversion and exchange rate monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-blue-950 mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We're on a mission to make currency conversion simple, transparent, and accessible 
              to everyone. Whether you're a traveler, business owner, or investor, ASAP Currency 
              provides the tools you need to make informed financial decisions.
            </p>
          </div>
          <div className="bg-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Why Choose Us?</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>Real-time exchange rates from trusted sources</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>No hidden fees or markups</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>User-friendly interface for all skill levels</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <span>24/7 access to historical data and trends</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-blue-950 mb-8 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'John Doe', role: 'CEO & Founder', emoji: '👨‍💼' },
              { name: 'Jane Smith', role: 'CTO', emoji: '👩‍💻' },
              { name: 'Mike Johnson', role: 'Head of Finance', emoji: '👨‍💼' }
            ].map((member) => (
              <div key={member.name} className="text-center">
                <div className="text-6xl mb-4">{member.emoji}</div>
                <h3 className="text-xl font-semibold text-blue-950">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}