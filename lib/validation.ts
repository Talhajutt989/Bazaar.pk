/**
 * Validation Engine for Bazaar.pk
 * Strictly enforces authentic human names, realistic email addresses,
 * and valid Pakistani 11-digit WhatsApp phone numbers (03XX XXXXXXX).
 */

// Common keyboard mash patterns
const KEYBOARD_SMASH_PATTERNS = [
  /asdf/i,
  /qwer/i,
  /zxcv/i,
  /hjkl/i,
  /dfgh/i,
  /jkl;/i,
  /12345/,
  /54321/,
  /fghj/i,
  /ghjk/i,
  /bnm,/i,
  /xcvb/i,
];

/**
 * Checks if a string looks like random keyboard gibberish.
 */
export function isGibberish(str: string): { isGibberish: boolean; reason?: string } {
  const clean = str.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length < 3) return { isGibberish: false };

  // Check known keyboard smash patterns (e.g., 'asdf', 'qwer', 'zxcv', 'hjkl')
  for (const pattern of KEYBOARD_SMASH_PATTERNS) {
    if (pattern.test(clean)) {
      return { isGibberish: true, reason: 'Keyboard sequence pattern detected' };
    }
  }

  // Check for 3+ identical consecutive characters (e.g., 'aaa', 'xxx')
  if (/(.)\1{2,}/.test(clean)) {
    return { isGibberish: true, reason: 'Repeated character sequence detected' };
  }

  // Check for 4+ consecutive consonants (unpronounceable in English/Urdu names, e.g. "dchksdbv", "nwdkfrk", "sakjdgwrk")
  const CONSONANTS_RUN = /[bcdfghjklmnpqrstvwxyz]{4,}/i;
  if (CONSONANTS_RUN.test(clean)) {
    return { isGibberish: true, reason: 'Unnatural consonant cluster detected' };
  }

  // Vowel ratio check: real names/words usually have 20% - 70% vowels
  const vowelsCount = (clean.match(/[aeiou]/g) || []).length;
  const vowelRatio = vowelsCount / clean.length;

  if (clean.length >= 4 && (vowelRatio < 0.20 || vowelRatio > 0.85)) {
    return { isGibberish: true, reason: 'Unrealistic letter/vowel distribution' };
  }

  return { isGibberish: false };
}

/**
 * Validates a Customer / User Name.
 * Accepts:
 * - Single valid names: e.g. "Soban", "Talha", "Ali", "Hamza", "Zainab", "Usman", "Ayesha"
 * - Full names: e.g. "Muhammad Tariq", "Ayesha Iqbal", "Samera Khan", "Kinza Khan"
 * Rejects:
 * - Keyboard smashes: e.g. "sakjdgwrkheldhwr", "nwdkfrk", "hvdcjbsdknvdkghbvjfx", "ufshjkaelrfhrekfajns"
 */
export function validateCustomerName(name: string): { isValid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Name must be at least 3 characters long' };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Name cannot exceed 50 characters' };
  }

  // Only letters, spaces, dots, hyphens
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Name can only contain alphabetic letters and spaces' };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);

  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    if (cleanWord.length < 2 && words.length === 1) {
      return { isValid: false, error: 'Name is too short' };
    }
    const gib = isGibberish(cleanWord);
    if (gib.isGibberish) {
      return {
        isValid: false,
        error: 'Please enter a valid human name (e.g. Soban, Talha, Muhammad Tariq, Ayesha Iqbal)',
      };
    }
  }

  const totalClean = trimmed.replace(/\s+/g, '');
  const gibTotal = isGibberish(totalClean);
  if (gibTotal.isGibberish) {
    return {
      isValid: false,
      error: 'Please enter a valid human name (e.g. Soban, Talha, Muhammad Tariq, Samera Khan)',
    };
  }

  return { isValid: true };
}

// Alias for backwards compatibility
export const validateFullName = validateCustomerName;

/**
 * Validates Store / Merchant Name (e.g. "Lahore Tech Hub", "Karachi Fresh Mart", "Al-Rehman Traders").
 */
export function validateStoreName(storeName: string): { isValid: boolean; error?: string } {
  if (!storeName || typeof storeName !== 'string') {
    return { isValid: false, error: 'Store/Merchant name is required' };
  }

  const trimmed = storeName.trim();

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Store name must be at least 3 characters long' };
  }
  if (trimmed.length > 60) {
    return { isValid: false, error: 'Store name cannot exceed 60 characters' };
  }

  if (!/^[a-zA-Z0-9\s&.'-]+$/.test(trimmed)) {
    return { isValid: false, error: 'Store name contains invalid characters' };
  }

  const clean = trimmed.replace(/[^a-zA-Z]/g, '');
  if (clean.length >= 4) {
    const gib = isGibberish(clean);
    if (gib.isGibberish) {
      return {
        isValid: false,
        error: 'Please enter a realistic store name (e.g. Lahore Tech Hub, Karachi Fresh Mart)',
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates an Email Address.
 * Accepts:
 * - "infodigitalsoft@gmail.com", "muhammadtalhafsd2004@gmail.com", "talha.tariq@yahoo.com"
 * Rejects:
 * - "jbcfvhjkfdlmecjfb@gmail.com", "janksfhdjksdn,cs@gmail.com", "hvjsbdkncjfvhbkw@gmail.com"
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required' };
  }

  const trimmed = email.trim().toLowerCase();

  // Strictly disallow commas, spaces, double symbols
  if (trimmed.includes(',') || trimmed.includes(' ') || trimmed.includes('..')) {
    return { isValid: false, error: 'Email contains invalid characters (e.g. comma or spaces)' };
  }

  // RFC email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email format (e.g. name@example.com)' };
  }

  const [username, domain] = trimmed.split('@');

  if (!username || username.length < 3) {
    return { isValid: false, error: 'Email username is too short' };
  }
  if (username.length > 40) {
    return { isValid: false, error: 'Email username is too long' };
  }

  if (!domain || domain.length < 4 || !domain.includes('.')) {
    return { isValid: false, error: 'Email domain is invalid' };
  }

  // Strip digits and separators from username to check letter naturalness
  const alphaUser = username.replace(/[^a-z]/g, '');
  if (alphaUser.length >= 6) {
    const gib = isGibberish(alphaUser);
    if (gib.isGibberish) {
      return {
        isValid: false,
        error: 'Please enter a valid, authentic email address (e.g. infodigitalsoft@gmail.com, muhammadtalhafsd2004@gmail.com)',
      };
    }
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return { isValid: false, error: 'Invalid top-level domain' };
  }

  return { isValid: true };
}

/**
 * Validates a Pakistani 11-digit WhatsApp Phone Number.
 * Format: Exactly 11 digits starting with "03" (e.g. 03001234567, 03211234567, 03331234567, 03451234567).
 * Rejects:
 * - 10 digits (e.g. 0300123456)
 * - 12+ digits (e.g. 02589748318030-43928)
 * - Numbers not starting with 03 (e.g. 0258...)
 */
export function validatePakistaniPhone(rawPhone: string): {
  isValid: boolean;
  normalized?: string;
  digits?: string;
  error?: string;
} {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { isValid: false, error: 'WhatsApp phone number is required' };
  }

  // Extract all digits
  let digits = rawPhone.trim().replace(/\D/g, '');

  // If user entered with 923... (12 digits), strip country code
  if (digits.startsWith('923') && digits.length === 12) {
    digits = digits.substring(2); // now 10 digits starting with 3
  }

  // If user entered 10 digits starting with 3 (e.g. 3001234567), prepend 0 to make 11 digits (03001234567)
  if (digits.length === 10 && digits.startsWith('3')) {
    digits = '0' + digits;
  }

  // Check exact 11 digits requirement
  if (digits.length < 11) {
    return {
      isValid: false,
      error: `WhatsApp number must be exactly 11 digits (${digits.length}/11 entered). Example: 03001234567`,
    };
  }
  if (digits.length > 11) {
    return {
      isValid: false,
      error: `WhatsApp number cannot exceed 11 digits (${digits.length}/11 entered). Example: 03001234567`,
    };
  }

  // Must start with 03
  if (!digits.startsWith('03')) {
    return {
      isValid: false,
      error: 'Pakistani mobile number must start with 03 (e.g. 0300 1234567, 0321 1234567)',
    };
  }

  // Valid Pakistani network prefixes check: 0300 - 0349
  const prefix = parseInt(digits.substring(1, 3), 10);
  if (prefix < 30 || prefix > 35) {
    return {
      isValid: false,
      error: 'Invalid Pakistani mobile network. Supported prefixes start with 030x, 031x, 032x, 033x, 034x',
    };
  }

  // Normalized standard format: 03XX XXXXXXX and +923XXXXXXXXX
  const normalized = `+92${digits.substring(1)}`;

  return {
    isValid: true,
    normalized,
    digits,
  };
}

/**
 * Validates password strength (min 6 characters).
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }
  return { isValid: true };
}

/**
 * Top Pakistani Banks & Digital Wallets for Merchant Settlement
 */
export const PAKISTANI_BANKS = [
  'Meezan Bank Limited',
  'Habib Bank Limited (HBL)',
  'Bank Alfalah',
  'Allied Bank Limited (ABL)',
  'MCB Bank Limited',
  'United Bank Limited (UBL)',
  'Faysal Bank',
  'Askari Bank',
  'Standard Chartered Pakistan',
  'Bank of Punjab (BOP)',
  'Bank of Khyber (BOK)',
  'Soneri Bank',
  'JS Bank',
  'Samba Bank',
  'Dubai Islamic Bank',
  'Al Baraka Bank',
  'EasyPaisa (Telenor Microfinance Bank)',
  'JazzCash (Mobilink Microfinance Bank)',
  'SadaPay',
  'NayaPay',
];

/**
 * Formats raw 13 digits CNIC into standard Pakistani format: 35201-1234567-1
 */
export function formatCnicNumber(rawCnic: string): string {
  const digits = (rawCnic || '').replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
}

/**
 * Validates a Pakistani CNIC Number (13 digits).
 * Format: 35201-1234567-1
 */
export function validateCnicNumber(rawCnic: string): {
  isValid: boolean;
  formatted?: string;
  digits?: string;
  error?: string;
} {
  if (!rawCnic || typeof rawCnic !== 'string') {
    return { isValid: false, error: 'Government CNIC number is required' };
  }

  const digits = rawCnic.replace(/\D/g, '');

  if (digits.length < 13) {
    return {
      isValid: false,
      error: `CNIC must be exactly 13 digits (${digits.length}/13 entered). Example: 35201-1234567-1`,
    };
  }
  if (digits.length > 13) {
    return {
      isValid: false,
      error: `CNIC cannot exceed 13 digits (${digits.length}/13 entered). Example: 35201-1234567-1`,
    };
  }

  // 1st digit represents Province (1: KPK, 2: FATA, 3: Punjab, 4: Sindh, 5: Balochistan, 6: Islamabad, 7: GB/AJK)
  const provinceDigit = parseInt(digits.charAt(0), 10);
  if (provinceDigit < 1 || provinceDigit > 7) {
    return {
      isValid: false,
      error: 'Invalid CNIC: Province code digit must be between 1 and 7',
    };
  }

  // Check for repeated dummy digits like 0000000000000 or 1111111111111
  if (/^(\d)\1{12}$/.test(digits)) {
    return {
      isValid: false,
      error: 'Please enter a genuine, valid 13-digit Pakistani CNIC number',
    };
  }

  const formatted = formatCnicNumber(digits);

  return {
    isValid: true,
    formatted,
    digits,
  };
}

/**
 * Validates Pakistani Bank Settlement Details.
 */
export function validateBankDetails(
  bankName: string,
  accountTitle: string,
  ibanOrAccount: string
): { isValid: boolean; error?: string } {
  if (!bankName || bankName.trim().length < 2) {
    return { isValid: false, error: 'Please select or enter your settlement Bank Name' };
  }

  if (!accountTitle || accountTitle.trim().length < 3) {
    return { isValid: false, error: 'Account Title must be at least 3 characters long' };
  }

  const cleanIban = (ibanOrAccount || '').trim().replace(/\s+/g, '').toUpperCase();
  if (!cleanIban || cleanIban.length < 8) {
    return {
      isValid: false,
      error: 'Please enter a valid Bank Account Number or 24-character Pakistani IBAN (e.g. PK42MEZN0001234567890101)',
    };
  }

  if (cleanIban.startsWith('PK')) {
    if (cleanIban.length !== 24) {
      return {
        isValid: false,
        error: `Pakistani IBAN must be exactly 24 characters (${cleanIban.length}/24 entered). Example: PK42MEZN0001234567890101`,
      };
    }
  } else {
    if (!/^\d{8,24}$/.test(cleanIban)) {
      return {
        isValid: false,
        error: 'Bank Account Number must contain 8 to 24 numeric digits',
      };
    }
  }

  return { isValid: true };
}
