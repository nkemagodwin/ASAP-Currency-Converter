import React, { useState } from 'react'

const faqs = [
  {
    question: 'How often are exchange rates updated?',
    answer: 'Our exchange rates are updated in real-time, typically every 60 seconds, to ensure you always get the most accurate conversion rates available.'
  },
  {
    question: 'Is ASAP Currency free to use?',
    answer: 'Yes! Our basic currency converter is completely free. We also offer premium features for advanced users and businesses.'
  },
  {
    question: 'How accurate are the exchange rates?',
    answer: 'We source our rates from leading financial institutions and data providers, ensuring accuracy within 0.1% of interbank rates.'
  },
  {
    question: 'Can I convert multiple currencies at once?',
    answer: 'Our portfolio feature allows you to track multiple currencies simultaneously. Premium users can convert between multiple currencies in bulk.'
  },
  {
    question: 'Is my data secure?',
    answer: 'We use bank-level encryption (256-bit SSL) to protect all data transmissions. Your personal information is never shared with third parties.'
  },
  {
    question: 'Do you offer an API for developers?',
    answer: 'Yes! We provide a RESTful API for developers. Check our documentation or contact us for API access and pricing.'
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-950 mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our currency conversion service.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-blue-950">{faq.question}</span>
                <svg
                  className={`w-6 h-6 text-blue-600 transform transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`transition-all duration-300 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 py-4 bg-gray-50 text-gray-600 border-t border-gray-200">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}