import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const base = searchParams.get('base') || 'USD'

  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    })

    if (!res.ok) throw new Error('API failed')
    const data = await res.json()

    return NextResponse.json({
      base: data.base,
      rates: data.rates,
      timestamp: Date.now(),
      source: 'exchangerate-api',
    })
  } catch {
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`)
      if (!res.ok) throw new Error('Fallback API failed')
      const data = await res.json()

      return NextResponse.json({
        base: data.base,
        rates: data.rates,
        timestamp: Date.now(),
        source: 'frankfurter',
      })
    } catch (error) {
      return NextResponse.json({ error: 'All APIs failed' }, { status: 500 })
    }
  }
}