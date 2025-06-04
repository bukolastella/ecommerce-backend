import { createHash, randomBytes } from 'crypto';

export const hashString = (stringToHash: string) => {
  return createHash('sha256').update(stringToHash).digest('hex');
};

export function generateSecureSixDigitCode(): string {
  const buffer = randomBytes(4); // 4 bytes ~ 32 bits
  const num = buffer.readUInt32BE(0) % 1000000; // modulo to get 6 digits
  return num.toString().padStart(6, '0');
}
