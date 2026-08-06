export type KYCResult = {
  success: boolean
  verifyStatus: 'verified' | 'failed'
  payload: Record<string, unknown>
  error?: string
}

const isDev = process.env.NEXT_PUBLIC_ENV !== 'production'

async function mockDelay(ms = 2000) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function verifyAadhaar(aadhaarNumber: string): Promise<KYCResult> {
  if (isDev) {
    await mockDelay()
    return {
      success: true,
      verifyStatus: 'verified',
      payload: {
        source: 'mock',
        aadhaarNumber: aadhaarNumber.slice(-4).padStart(12, '*'),
        name: 'Mock Promoter Name',
        dob: '1985-06-15',
        gender: 'M',
        address: { state: 'Maharashtra', district: 'Pune' },
        verified: true,
      },
    }
  }

  const response = await fetch('https://api.sandbox.co.in/kyc/aadhaar/okyc/otp', {
    method: 'POST',
    headers: {
      'Authorization': process.env.SANDBOX_API_KEY!,
      'Content-Type': 'application/json',
      'x-api-key': process.env.SANDBOX_API_KEY!,
      'x-api-secret': process.env.SANDBOX_API_SECRET!,
      'x-api-version': '1.0',
    },
    body: JSON.stringify({ aadhaar_number: aadhaarNumber }),
  })

  const data = await response.json()
  if (!response.ok || !data.data?.status) {
    return { success: false, verifyStatus: 'failed', payload: data, error: data.message }
  }

  return { success: true, verifyStatus: 'verified', payload: data.data }
}

export async function verifyPAN(pan: string, name: string): Promise<KYCResult> {
  if (isDev) {
    await mockDelay()
    return {
      success: true,
      verifyStatus: 'verified',
      payload: {
        source: 'mock',
        pan,
        name,
        status: 'VALID',
        panType: 'FIRM',
        verified: true,
      },
    }
  }

  const response = await fetch('https://api.sandbox.co.in/kyc/pan/verify', {
    method: 'POST',
    headers: {
      'Authorization': process.env.SANDBOX_API_KEY!,
      'Content-Type': 'application/json',
      'x-api-key': process.env.SANDBOX_API_KEY!,
      'x-api-secret': process.env.SANDBOX_API_SECRET!,
      'x-api-version': '1.0',
    },
    body: JSON.stringify({ pan }),
  })

  const data = await response.json()
  if (!response.ok) {
    return { success: false, verifyStatus: 'failed', payload: data, error: data.message }
  }

  return { success: true, verifyStatus: 'verified', payload: data.data }
}

export async function verifyBankAccount(accountNumber: string, ifsc: string): Promise<KYCResult> {
  if (isDev) {
    await mockDelay()
    return {
      success: true,
      verifyStatus: 'verified',
      payload: {
        source: 'mock',
        accountNumber: accountNumber.slice(-4).padStart(12, '*'),
        ifsc,
        bankName: 'State Bank of India',
        accountHolderName: 'Mock Business Pvt Ltd',
        verified: true,
      },
    }
  }

  const response = await fetch('https://api.eko.in/ekoicici/1.0/tools/verifyaccount', {
    method: 'POST',
    headers: {
      'developer_key': process.env.EKO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ account: accountNumber, ifsc }),
  })

  const data = await response.json()
  if (!response.ok || data.status !== 0) {
    return { success: false, verifyStatus: 'failed', payload: data, error: data.message }
  }

  return { success: true, verifyStatus: 'verified', payload: data }
}
