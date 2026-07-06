import React, { useState } from 'react'

export default function Portfolio() {
  const [portfolios] = useState([
    { currency: 'USD', amount: 5000, value: 5000, change: '+2.5%' },
    { currency: 'EUR', amount: 3000, value: 2760, change: '-1.2%' },
    { currency: 'GBP', amount: 2000, value: 1580, change: '+0.8%' },
    { currency: 'JPY', amount: 100000, value: 669, change: '+3.1%' },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-950 mb-6">Your Portfolio</h1>
          <p className="text-xl text-gray-600">Track your currency holdings and performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
            <h3 className="text-lg opacity-90 mb-2">Total Portfolio Value</h3>
            <p className="text-4xl font-bold">$10,009.00</p>
            <p className="text-green-300 mt-2">+5.2% this month</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-lg font-semibold text-blue-950 mb-4">Performance</h3>
            <div className="space-y-3">
              {portfolios.map((item) => (
                <div key={item.currency} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.currency}</span>
                  <span className={`font-semibold ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 bg-blue-950 text-white">
            <h2 className="text-2xl font-bold">Holdings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Currency</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Amount</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">USD Value</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {portfolios.map((item) => (
                  <tr key={item.currency} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-blue-950">{item.currency}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{item.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-gray-900">${item.value.toLocaleString()}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}