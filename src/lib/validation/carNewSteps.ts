import { z } from 'zod';
import { isValidNigerianPlate } from '@/lib/cars/nigerianPlate';
import { validateVin as validateVinChecksum } from '@/lib/migration/reconcile';

const step0Schema = z
  .object({
    brandId: z.string().min(1, 'Brand is required'),
    modelId: z.string().min(1, 'Model is required'),
    year: z.string().min(1, 'Year is required'),
    mileage: z.string().min(1, 'Mileage is required'),
    colour: z.string().min(1, 'Colour is required'),
    vin: z.string().trim(),
    plate: z.string().min(1, 'Plate number is required'),
  })
  .superRefine((data, ctx) => {
    const u = data.vin.toUpperCase();
    if (u.length !== 17) {
      ctx.addIssue({ code: 'custom', path: ['vin'], message: 'VIN must be 17 characters' });
    } else if (/[IOQ]/.test(u)) {
      ctx.addIssue({ code: 'custom', path: ['vin'], message: 'VIN cannot contain I, O, or Q' });
    }
    if (!isValidNigerianPlate(data.plate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['plate'],
        message: 'Enter a valid Nigerian plate (e.g. LND-234-KJ)',
      });
    }
    const chk = validateVinChecksum(u);
    if (!chk.valid && chk.reason) {
      ctx.addIssue({ code: 'custom', path: ['vin'], message: chk.reason });
    }
  });

export function validateCarStep0(
  form: {
    brandId: string;
    modelId: string;
    year: string;
    mileage: string;
    colour: string;
    vin: string;
    plate: string;
  },
  opts: { plateClash: boolean; vinExactDuplicate: boolean }
): Record<string, string> {
  const errs: Record<string, string> = {};
  const parsed = step0Schema.safeParse(form);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    for (const [k, v] of Object.entries(fe)) {
      if (Array.isArray(v) && v[0]) errs[k] = v[0];
    }
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === 'string' && !errs[k] && issue.message) errs[k] = issue.message;
    }
  }
  if (opts.plateClash) errs.plate = 'This plate may match an existing vehicle';
  if (opts.vinExactDuplicate) errs.vin = 'This VIN already exists in the system';
  return errs;
}

const step1Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\d{10}$/, 'Enter 10 digits after +234'),
});

export function validateCarStep1(
  form: { firstName: string; lastName: string; email: string; phone: string },
  opts?: { emailDuplicate?: boolean }
): Record<string, string> {
  const errs: Record<string, string> = {};
  const parsed = step1Schema.safeParse(form);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    for (const [k, v] of Object.entries(fe)) {
      if (Array.isArray(v) && v[0]) errs[k] = v[0];
    }
  }
  if (opts?.emailDuplicate) errs.email = 'This email matches an existing CRM contact';
  return errs;
}

const step2Schema = z.object({
  channel: z.string().min(1, 'Purchase channel is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  salesPerson: z.string().min(1, 'Sales person is required'),
  purchasePrice: z.string().min(1, 'Purchase price is required'),
});

export function validateCarStep2(form: {
  channel: string;
  purchaseDate: string;
  salesPerson: string;
  purchasePrice: string;
}): Record<string, string> {
  const errs: Record<string, string> = {};
  const parsed = step2Schema.safeParse(form);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    for (const [k, v] of Object.entries(fe)) {
      if (Array.isArray(v) && v[0]) errs[k] = v[0];
    }
  }
  const n = Number(String(form.purchasePrice).replace(/,/g, ''));
  if (form.purchasePrice && (!Number.isFinite(n) || n <= 0)) {
    errs.purchasePrice = 'Enter a valid purchase price';
  }
  return errs;
}
