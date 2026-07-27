export type ValidationResult = string | null;
export type Validator = (value: string) => ValidationResult;

export const V = {
  required:
    (label: string): Validator =>
    (value) =>
      value.trim() ? null : `${label} est requis.`,

  minLength:
    (min: number, label: string): Validator =>
    (value) =>
      value.trim().length >= min
        ? null
        : `${label} doit contenir au moins ${min} caractères.`,

  maxLength:
    (max: number, label: string): Validator =>
    (value) =>
      value.trim().length <= max
        ? null
        : `${label} ne doit pas dépasser ${max} caractères.`,

  tndAmount:
    (options?: { min?: number; max?: number; allowZero?: boolean }): Validator =>
    (value) => {
      const trimmed = value.trim();
      if (!trimmed) return 'Le montant est requis.';
      if (!/^\d+(\.\d{0,3})?$/.test(trimmed)) {
        return 'Format invalide. Utilisez jusqu\'à 3 décimales (ex: 125.500).';
      }
      const num = parseFloat(trimmed);
      if (Number.isNaN(num)) return 'Montant invalide.';
      if (!options?.allowZero && num <= 0) return 'Le montant doit être supérieur à 0.';
      if (options?.allowZero && num < 0) return 'Le montant ne peut pas être négatif.';
      if (options?.min !== undefined && num < options.min) {
        return `Le montant minimum est ${options.min.toLocaleString('fr-FR')} TND.`;
      }
      if (options?.max !== undefined && num > options.max) {
        return `Le montant maximum est ${options.max.toLocaleString('fr-FR')} TND.`;
      }
      return null;
    },

  depositAmount:
    (remaining: number): Validator =>
    (value) => {
      const amountError = V.tndAmount({ min: 0.001, max: 1_000_000 })(value);
      if (amountError) return amountError;
      const num = parseFloat(value.trim());
      if (num > remaining) {
        return `Le dépôt dépasse le montant restant (${remaining.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND).`;
      }
      return null;
    },

  cardNumber: (value: string): ValidationResult => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'Le numéro de carte est requis.';
    if (digits.length < 13 || digits.length > 19) {
      return 'Le numéro doit contenir entre 13 et 19 chiffres.';
    }
    if (/^(\d)\1+$/.test(digits)) return 'Numéro de carte invalide.';
    return null;
  },

  cardExpiry: (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) return "La date d'expiration est requise.";
    const match = trimmed.match(/^(\d{2})\/?(\d{2})$/);
    if (!match) return 'Format invalide. Utilisez MM/AA (ex: 09/28).';
    const month = parseInt(match[1], 10);
    const year = 2000 + parseInt(match[2], 10);
    if (month < 1 || month > 12) return 'Mois invalide (01–12).';
    const expiry = new Date(year, month);
    if (expiry <= new Date()) return 'Cette carte est expirée.';
    return null;
  },

  cardholderName: (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) return 'Le nom du titulaire est requis.';
    if (!/^[a-zA-ZÀ-ÿ\s'-]{3,}$/.test(trimmed)) {
      return 'Nom invalide (lettres, espaces et tirets uniquement).';
    }
    if (trimmed.split(/\s+/).filter(Boolean).length < 2) {
      return 'Entrez le prénom et le nom (ex: Nour Ben Salah).';
    }
    return null;
  },

  tunisianPhone: (value: string): ValidationResult => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('216')) digits = digits.slice(3);
    if (!digits) return 'Le numéro de contact est requis.';
    if (digits.length !== 8) {
      return 'Numéro tunisien invalide (8 chiffres après +216).';
    }
    if (!/^[24579]/.test(digits)) {
      return 'Numéro mobile invalide (doit commencer par 2, 4, 5, 7 ou 9).';
    }
    return null;
  },

  goalTitle: (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) return "Le nom de l'objectif est requis.";
    if (trimmed.length < 3) return 'Le nom doit contenir au moins 3 caractères.';
    if (trimmed.length > 60) return 'Le nom ne doit pas dépasser 60 caractères.';
    return null;
  },

  marketplaceTitle: (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) return 'Le titre est requis.';
    if (trimmed.length < 3) return 'Le titre doit contenir au moins 3 caractères.';
    if (trimmed.length > 80) return 'Le titre ne doit pas dépasser 80 caractères.';
    return null;
  },

  marketplaceDescription: (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) return 'La description est requise.';
    if (trimmed.length < 10) return 'La description doit contenir au moins 10 caractères.';
    if (trimmed.length > 500) return 'La description ne doit pas dépasser 500 caractères.';
    return null;
  },

  priceLabel: (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) return "L'affichage du prix est requis.";
    if (trimmed.length < 2) return 'Précisez le prix affiché (ex: 9.99 TND/mois).';
    return null;
  },

  documentTitle: (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) return 'Le titre du document est requis.';
    if (trimmed.length < 2) return 'Le titre doit contenir au moins 2 caractères.';
    if (trimmed.length > 80) return 'Le titre ne doit pas dépasser 80 caractères.';
    return null;
  },

  documentSubtitle:
    (docType: string): Validator =>
    (value) => {
      const trimmed = value.trim();
      const identityTypes = ['CIN', 'Passport', 'Permis', 'ID Card', 'Driver License'];
      if (identityTypes.includes(docType) && !trimmed) {
        return 'La référence / numéro est requise pour ce type de document.';
      }
      if (!trimmed) return null;
      if (
        (docType === 'CIN' || docType === 'ID Card') &&
        !/^\d{8}$/.test(trimmed.replace(/\s/g, ''))
      ) {
        return 'CIN invalide (8 chiffres attendus).';
      }
      if (trimmed.length > 120) return 'La référence ne doit pas dépasser 120 caractères.';
      return null;
    },

  listingTitle: (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) return "Le titre de l'annonce est requis.";
    if (trimmed.length < 5) return 'Le titre doit contenir au moins 5 caractères.';
    if (trimmed.length > 100) return 'Le titre ne doit pas dépasser 100 caractères.';
    return null;
  },

  listingDescription: (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.length < 15) {
      return 'Si vous ajoutez une description, elle doit contenir au moins 15 caractères.';
    }
    if (trimmed.length > 1000) return 'La description ne doit pas dépasser 1000 caractères.';
    return null;
  },

  orderNotes: (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.length > 200) return 'Les instructions ne doivent pas dépasser 200 caractères.';
    return null;
  },
};

export const format = {
  cardNumber: (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 19);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  },

  cardExpiry: (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  },

  tndAmount: (text: string) => {
    let cleaned = text.replace(/[^\d.]/g, '');
    const dotIndex = cleaned.indexOf('.');
    if (dotIndex !== -1) {
      const intPart = cleaned.slice(0, dotIndex);
      const decPart = cleaned.slice(dotIndex + 1).replace(/\./g, '').slice(0, 3);
      cleaned = `${intPart}.${decPart}`;
    }
    return cleaned;
  },

  tunisianPhone: (text: string) => {
    let digits = text.replace(/\D/g, '');
    if (!digits.startsWith('216')) {
      if (digits.startsWith('0')) digits = digits.slice(1);
      digits = `216${digits}`;
    }
    digits = digits.slice(0, 11);
    const local = digits.slice(3);
    if (local.length <= 2) return `+216 ${local}`;
    if (local.length <= 5) return `+216 ${local.slice(0, 2)} ${local.slice(2)}`;
    return `+216 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
  },
};

export type FieldSchema = {
  value: string;
  rules: Validator[];
};

export function runValidation(schema: Record<string, FieldSchema>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, { value, rules }] of Object.entries(schema)) {
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  return errors;
}

export function firstError(schema: Record<string, FieldSchema>): string | null {
  const errors = runValidation(schema);
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
}
