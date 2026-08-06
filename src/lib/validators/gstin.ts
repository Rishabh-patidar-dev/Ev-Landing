const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export function validateGSTIN(gstin: string): boolean {
  if (!GSTIN_REGEX.test(gstin)) return false
  return verifyGSTINChecksum(gstin)
}

function verifyGSTINChecksum(gstin: string): boolean {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let sum = 0
  for (let i = 0; i < 14; i++) {
    const digit = chars.indexOf(gstin[i])
    const factor = i % 2 === 0 ? 1 : 2
    const temp = digit * factor
    sum += Math.floor(temp / 36) + (temp % 36)
  }
  const checkDigit = (36 - (sum % 36)) % 36
  return chars[checkDigit] === gstin[14]
}

export function formatGSTIN(value: string): string {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15)
}
