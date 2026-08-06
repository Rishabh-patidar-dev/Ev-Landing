const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/

export function validatePAN(pan: string): boolean {
  return PAN_REGEX.test(pan)
}

export function formatPAN(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
}
