/**
 * Shared props type for all landing page templates.
 * Templates accept these directly — never rely on useSearchParams().
 * Server contexts (custom-domain handler, /pages/[userId]) pass real data.
 * Preview context (/landing-pages/template-X) reads from searchParams once
 * at the route level and passes down as props.
 */
export interface TemplateProps {
  businessProfileId?: string;
  heroEffect?: string;
  service?: string;
  phone?: string;
  logoUrl?: string;
  companyName?: string;
  fontPair?: string;
  colorPalette?: string;
  bookingUrl?: string;
}

/**
 * Build TemplateProps from a Firestore businessProfile document.
 */
export function profileToTemplateProps(profile: Record<string, any>, id?: string): TemplateProps {
  return {
    businessProfileId: id || profile.id || '',
    heroEffect:   profile.heroEffect   || 'slideshow',
    service:      profile.service      || 'Handyman Services',
    phone:        profile.phoneNumber  || '',
    logoUrl:      profile.logoUrl      || '',
    companyName:  profile.businessName || '',
    fontPair:     profile.fontPair     || 'modern-corporate',
    colorPalette: profile.colorPalette || 'deep-midnight',
    bookingUrl:   profile.bookingUrl   || '',
  };
}

/**
 * Build TemplateProps from Next.js searchParams (for preview routes).
 */
export function searchParamsToTemplateProps(
  searchParams: Record<string, string | string[] | undefined>
): TemplateProps {
  const get = (key: string) =>
    Array.isArray(searchParams[key]) ? searchParams[key][0] : (searchParams[key] as string | undefined);

  return {
    heroEffect:   get('heroEffect')   || 'slideshow',
    service:      get('service')      || 'Handyman Services',
    phone:        get('phone')        || '(000) 000-0000',
    logoUrl:      get('logo')         || '',
    companyName:  get('companyName')  || '',
    fontPair:     get('fontPair')     || 'modern-corporate',
    colorPalette: get('colorPalette') || 'deep-midnight',
    bookingUrl:   get('bookingUrl')   || '',
  };
}
