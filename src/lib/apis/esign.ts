export type EsignResult = {
  success: boolean
  esignRef?: string
  signUrl?: string
  signStatus: 'pending' | 'signed' | 'rejected'
  error?: string
}

const isDev = process.env.NEXT_PUBLIC_ENV !== 'production'

async function mockDelay(ms = 1500) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function initiateEsign(params: {
  dealerId: string
  contractType: string
  signerName: string
  signerEmail: string
  signerMobile: string
  documentUrl: string
}): Promise<EsignResult> {
  if (isDev) {
    await mockDelay()
    const mockRef = `LEEG-MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    return {
      success: true,
      esignRef: mockRef,
      signUrl: `https://sandbox.leegality.com/sign/${mockRef}`,
      signStatus: 'pending',
    }
  }

  const response = await fetch('https://api.leegality.com/v3.0/sign/invite', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LEEGALITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      document: { url: params.documentUrl },
      signers: [{
        name: params.signerName,
        email: params.signerEmail,
        phone: params.signerMobile,
        authType: 'AADHAAR_OTP',
        sequenceNo: 1,
      }],
      expiry: 72, // hours
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    return { success: false, signStatus: 'pending', error: data.message }
  }

  return {
    success: true,
    esignRef: data.id,
    signUrl: data.inviteUrl,
    signStatus: 'pending',
  }
}

export async function checkEsignStatus(esignRef: string): Promise<EsignResult> {
  if (isDev) {
    await mockDelay(500)
    return {
      success: true,
      esignRef,
      signStatus: Math.random() > 0.3 ? 'signed' : 'pending',
    }
  }

  const response = await fetch(`https://api.leegality.com/v3.0/sign/${esignRef}`, {
    headers: { 'Authorization': `Bearer ${process.env.LEEGALITY_API_KEY}` },
  })

  const data = await response.json()
  if (!response.ok) {
    return { success: false, signStatus: 'pending', error: data.message }
  }

  const status = data.status === 'COMPLETED' ? 'signed' : data.status === 'REJECTED' ? 'rejected' : 'pending'
  return { success: true, esignRef, signStatus: status }
}
