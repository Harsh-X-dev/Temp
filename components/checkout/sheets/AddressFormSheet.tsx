'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useHasMounted } from '@/hooks/useHasMounted';
import type { AddressFormData } from '@/types/checkout.types';
import type { Address, AddressType } from '@/components/account/types';
import BackButton from '@/components/ui/buttons/BackButton';
import Select from '@/components/ui/inputs/Select';
import FormField from '@/components/ui/inputs/FormField';
import { INDIAN_STATES, PINCODE_PATTERN } from '@/lib/constants/india';

interface AddressFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => Promise<void>;
  isSubmitting: boolean;
  mode?: 'create' | 'edit';
  initialAddress?: Address | null;
}

type FormErrors = Partial<Record<keyof AddressFormData, string>>;

const INITIAL_FORM: AddressFormData = {
  fullName: '',
  phone: '',
  email: '',
  pincode: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  addressType: 'home',
};

const ADDRESS_TYPES: { id: AddressType; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'other', label: 'Other' },
];

/** Order used to focus the first invalid field — matches visual layout order */
const FIELD_ORDER: (keyof AddressFormData)[] = [
  'fullName',
  'phone',
  'pincode',
  'line1',
  'line2',
  'city',
  'state',
];

/** Pure validator */
function computeErrors(form: AddressFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.fullName || !form.fullName.trim()) {
    errors.fullName = 'Full Name is required';
  }

  const phone = form.phone?.trim() || '';
  if (!phone) {
    errors.phone = 'Phone Number is required';
  } else {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errors.phone = 'Enter a valid 10-digit phone number';
    }
  }

  const pincode = form.pincode.trim();
  if (!pincode) errors.pincode = 'Pincode is required';
  else if (!PINCODE_PATTERN.test(pincode)) errors.pincode = 'Enter a valid 6-digit pincode';

  if (!form.line1.trim()) errors.line1 = 'House / Flat / Floor is required';
  if (!form.city.trim()) errors.city = 'City is required';
  if (!form.state.trim()) errors.state = 'State is required';

  return errors;
}

function toFormData(address: Address): AddressFormData {
  return {
    fullName: address.fullName || '',
    phone: address.phone || '',
    email: address.email || '',
    pincode: address.pincode || '',
    line1: address.line1 || '',
    line2: address.line2 || '',
    city: address.city || '',
    state: address.state || '',
    addressType: address.addressType || 'home',
  };
}

export default function AddressFormSheet({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  mode = 'create',
  initialAddress,
}: AddressFormSheetProps) {
  const [form, setForm] = useState<AddressFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDefault, setIsDefault] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const uid = useId();
  const fieldId = (field: string) => `${uid}-${field}`;
  const errorId = (field: string) => `${uid}-${field}-error`;

  const isEdit = mode === 'edit';
  const title = isEdit ? 'Edit address' : 'Add new address';

  // Seed the form on the closed -> open transition
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevAddress, setPrevAddress] = useState(initialAddress);
  if (isOpen !== prevIsOpen || (isOpen && initialAddress !== prevAddress)) {
    setPrevIsOpen(isOpen);
    setPrevAddress(initialAddress);
    if (isOpen) {
      if (isEdit && initialAddress) {
        setForm(toFormData(initialAddress));
        setIsDefault(Boolean(initialAddress.isDefault));
      } else {
        setForm(INITIAL_FORM);
        setIsDefault(false);
      }
      setErrors({});
    }
  }

  // Focus the first field once the sheet slides in
  useEffect(() => {
    if (!isOpen) return;
    const timer = window.setTimeout(() => firstInputRef.current?.focus(), 350);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // Lock background scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  function updateField<K extends keyof AddressFormData>(
    field: K,
    value: AddressFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = computeErrors(form);
    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
    if (firstInvalid) {
      const element = document.getElementById(fieldId(firstInvalid));
      element?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      element?.focus({ preventScroll: true });
      return;
    }

    setSubmitError(null);
    try {
      await onSubmit({
        ...form,
        fullName: form.fullName?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        pincode: form.pincode.trim(),
        line1: form.line1.trim(),
        line2: form.line2?.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        isDefault,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';
      setSubmitError(message);
    }
  };

  const mounted = useHasMounted();
  if (!isOpen || !mounted) return null;

  const inputBaseClasses = (invalid = false) =>
    `h-[44px] w-full rounded-[12px] border px-[16px] font-['Montserrat'] text-[13px] text-[#211e1a] placeholder:text-[#a89a85] outline-none transition-colors focus:border-[#ff5400] focus:ring-1 focus:ring-[#ff5400]/20 ${
      invalid ? 'border-red-400 bg-red-50/20' : 'bg-white border-[#e5e0da]'
    }`;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[120] bg-black/40 transition-opacity duration-300 w-full max-w-full overflow-x-hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Modal */}
      <div
        role="dialog"
        aria-modal={isOpen}
        aria-label={title}
        inert={!isOpen}
        className={`fixed inset-0 z-[130] flex flex-col bg-[#fbf8f4] transition-transform duration-300 ease-out w-full max-w-full overflow-x-hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header matching Figma node 544:51 */}
        <div className="sticky top-0 z-10 flex shrink-0 h-[56px] items-center justify-between border-b border-[#f0ebe4] bg-white px-[16px] w-full max-w-full">
          <div className="flex items-center gap-[12px]">
            <BackButton onClick={onClose} className="size-[28px] rounded-[14px]" />
            <h2 className="font-['Montserrat'] text-[18px] font-semibold text-[#211e1a]">
              {title}
            </h2>
          </div>
          <div className="size-[28px] opacity-0" aria-hidden="true" />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col w-full max-w-full" noValidate>
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-[16px] py-[16px] w-full max-w-full no-scrollbar">
            <div className="flex flex-col gap-[16px]">
              
              {/* 1. Full Name */}
              <FormField
                label="Full Name"
                htmlFor={fieldId('fullName')}
                error={errors.fullName}
                errorId={errorId('fullName')}
              >
                <input
                  ref={firstInputRef}
                  id={fieldId('fullName')}
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter full name"
                  value={form.fullName || ''}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  className={inputBaseClasses(Boolean(errors.fullName))}
                />
              </FormField>

              {/* 2. Phone Number */}
              <FormField
                label="Phone Number"
                htmlFor={fieldId('phone')}
                error={errors.phone}
                errorId={errorId('phone')}
              >
                <input
                  id={fieldId('phone')}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={inputBaseClasses(Boolean(errors.phone))}
                />
              </FormField>

              {/* 3. Email (optional) */}
              <FormField
                label="Email (optional)"
                htmlFor={fieldId('email')}
                error={errors.email}
                errorId={errorId('email')}
              >
                <input
                  id={fieldId('email')}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter email address"
                  value={form.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={inputBaseClasses(Boolean(errors.email))}
                />
              </FormField>

              {/* 4. Pincode */}
              <FormField
                label="Pincode"
                htmlFor={fieldId('pincode')}
                error={errors.pincode}
                errorId={errorId('pincode')}
              >
                <input
                  id={fieldId('pincode')}
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  placeholder="Enter pincode"
                  value={form.pincode}
                  onChange={(e) =>
                    updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  aria-invalid={errors.pincode ? true : undefined}
                  aria-describedby={errors.pincode ? errorId('pincode') : undefined}
                  className={inputBaseClasses(Boolean(errors.pincode))}
                />
              </FormField>

              {/* 5. House / Flat / Floor */}
              <FormField
                label="House / Flat / Floor"
                htmlFor={fieldId('line1')}
                error={errors.line1}
                errorId={errorId('line1')}
              >
                <input
                  id={fieldId('line1')}
                  name="line1"
                  type="text"
                  autoComplete="address-line1"
                  placeholder="House no., building, floor"
                  value={form.line1}
                  onChange={(e) => updateField('line1', e.target.value)}
                  aria-invalid={errors.line1 ? true : undefined}
                  aria-describedby={errors.line1 ? errorId('line1') : undefined}
                  className={inputBaseClasses(Boolean(errors.line1))}
                />
              </FormField>

              {/* 6. Street / Area / Locality */}
              <FormField
                label="Street / Area / Locality"
                htmlFor={fieldId('line2')}
                error={errors.line2}
                errorId={errorId('line2')}
              >
                <input
                  id={fieldId('line2')}
                  name="line2"
                  type="text"
                  autoComplete="address-line2"
                  placeholder="Street, area, landmark"
                  value={form.line2 || ''}
                  onChange={(e) => updateField('line2', e.target.value)}
                  aria-invalid={errors.line2 ? true : undefined}
                  aria-describedby={errors.line2 ? errorId('line2') : undefined}
                  className={inputBaseClasses(Boolean(errors.line2))}
                />
              </FormField>

              {/* 7. City */}
              <FormField
                label="City"
                htmlFor={fieldId('city')}
                error={errors.city}
                errorId={errorId('city')}
              >
                <input
                  id={fieldId('city')}
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  aria-invalid={errors.city ? true : undefined}
                  aria-describedby={errors.city ? errorId('city') : undefined}
                  className={inputBaseClasses(Boolean(errors.city))}
                />
              </FormField>

              {/* 8. State */}
              <FormField
                label="State"
                htmlFor={fieldId('state')}
                error={errors.state}
                errorId={errorId('state')}
              >
                <Select
                  key={isOpen ? 'open' : 'closed'}
                  id={fieldId('state')}
                  name="state"
                  options={INDIAN_STATES}
                  value={form.state}
                  onChange={(next) => updateField('state', next)}
                  placeholder="State"
                  searchable
                  searchPlaceholder="Search state..."
                  emptyMessage="No state found"
                  invalid={Boolean(errors.state)}
                  aria-label="State"
                  aria-describedby={errors.state ? errorId('state') : undefined}
                />
              </FormField>

              {/* 9. Address Type */}
              <div className="flex flex-col gap-[8px]">
                <span
                  id={fieldId('addressType-label')}
                  className="font-['Montserrat'] text-[13px] font-medium text-[#6b6459]"
                >
                  Address Type
                </span>
                <div
                  role="group"
                  aria-labelledby={fieldId('addressType-label')}
                  className="flex gap-[8px]"
                >
                  {ADDRESS_TYPES.map((type) => {
                    const isActive = form.addressType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => updateField('addressType', type.id)}
                        aria-pressed={isActive}
                        className={`h-[32px] w-[80px] shrink-0 cursor-pointer rounded-[18px] font-['Montserrat'] text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#ff5400]/40 flex items-center justify-center ${
                          isActive
                            ? 'bg-[#ff5400] text-white border-transparent shadow-xs'
                            : 'border border-[#e5e0da] bg-white text-[#211e1a] hover:border-[#ff5400]/40'
                        }`}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 10. Set as default toggle matching Figma node 1287:78 */}
              <div className="flex items-center justify-between h-[46px] bg-white border border-[#e5e0da] rounded-[12px] px-[16px]">
                <span className="font-['Montserrat'] text-[13px] font-medium text-[#211e1a]">
                  Set as default
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDefault}
                  onClick={() => setIsDefault((prev) => !prev)}
                  className="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-[#ff5400]/40 p-[2px]"
                  style={{ backgroundColor: isDefault ? '#ff5400' : '#e5e0da' }}
                >
                  <span
                    className="pointer-events-none inline-block size-[18px] rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out"
                    style={{ transform: isDefault ? 'translateX(18px)' : 'translateX(0px)' }}
                  />
                </button>
              </div>

            </div>
          </div>

          {/* 11. Sticky Bottom Bar matching Figma node 544:96 */}
          <div className="shrink-0 bg-[#fcf9f5] flex flex-col items-center px-[16px] pt-[14px] pb-[28px] border-t border-[#f0ebe4]/60 w-full max-w-full gap-[10px]">
            {/* Backend error popup */}
            {submitError && (
              <div
                role="alert"
                aria-live="assertive"
                className="w-full flex items-start gap-[10px] rounded-[12px] border border-red-200 bg-red-50 px-[14px] py-[10px]"
              >
                <span className="mt-[1px] shrink-0 text-red-500" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
                <p className="flex-1 font-['Montserrat'] text-[12px] text-red-700 leading-[1.5]">
                  {submitError}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  aria-label="Dismiss error"
                  className="shrink-0 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="h-[50px] w-full rounded-[24px] bg-[#ff5400] hover:bg-[#e04a00] font-['Montserrat'] text-[14px] font-semibold text-white transition-colors cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </>,
    document.body
  );
}
