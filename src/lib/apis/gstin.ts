export type GSTINResult = {
  success: boolean
  verifyStatus: 'verified' | 'failed'
  payload: Record<string, unknown>
  error?: string
}

const isDev = process.env.NEXT_PUBLIC_ENV !== 'production'

async function mockDelay(ms = 2000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function verifyGSTIN(gstin: string): Promise<GSTINResult> {
  if (isDev) {
    await mockDelay()
    return {
      success: true,
      verifyStatus: 'verified',
      payload: {
        source: 'mock',
        gstin,
        status: 'ACT',
        legalName: 'Mock EV Dealers Pvt Ltd',
        tradeName: 'Mock EV Dealers',
        registrationDate: '2022-04-01',
        stateCode: gstin.slice(0, 2),
        taxpayerType: 'Regular',
        verified: true,
      },
    }
  }

  // Try WhiteBooks first, fallback to Perfios
  try {
    const response = await fetch(`https://api.whitebooks.in/v1/gstin/${gstin}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.WHITEBOOKS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    if (response.ok && data.status === 'ACT') {
      return { success: true, verifyStatus: 'verified', payload: data }
    }
  } catch {
    // fallthrough to Perfios
  }

  const perfiosResponse = await fetch('https://api.perfios.com/kyc/gstin/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERFIOS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ gstin }),
  })

  const perfiosData = await perfiosResponse.json()
  if (!perfiosResponse.ok) {
    return { success: false, verifyStatus: 'failed', payload: perfiosData, error: perfiosData.message }
  }

  return { success: true, verifyStatus: 'verified', payload: perfiosData }
}

export async function verifyFinancials(documentUrl: string, docType: string): Promise<GSTINResult> {
  if (isDev) {
    await mockDelay(3000)
    return {
      success: true,
      verifyStatus: 'verified',
      payload: {
        source: 'mock',
        docType,
        analysisComplete: true,
        netWorth: 15000000,
        revenue: 45000000,
        profitMargin: 12.5,
        bankBalance: 5000000,
        verified: true,
      },
    }
  }

  const response = await fetch('https://api.perfios.com/kyc/financial/analyze', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERFIOS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documentUrl, documentType: docType }),
  })

  const data = await response.json()
  if (!response.ok) {
    return { success: false, verifyStatus: 'failed', payload: data, error: data.message }
  }

  return { success: true, verifyStatus: 'verified', payload: data }
}
