import { NextResponse } from 'next/server'

// In-memory store (use a database in production)
let trades = []

export async function GET() {
  return NextResponse.json({ trades })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const trade = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: body.orderType === 'market' ? 'filled' : 'pending',
      profit: 0,
      ...body,
    }
    trades.unshift(trade)
    return NextResponse.json({ trade }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { tradeId, ...updates } = await request.json()
    const index = trades.findIndex((t) => t.id === tradeId)
    if (index === -1) return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    trades[index] = { ...trades[index], ...updates }
    return NextResponse.json({ trade: trades[index] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 })
  }
}