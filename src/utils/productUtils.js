/**
 * Product Data & Description Utilities
 * Handles parsing and formatting of structured bilingual descriptions (Thai & English):
 * 1. รายละเอียดทั่วไป / General Details (Short Description & General Overview)
 * 2. หัวข้อเฉพาะ / Specific Topics & Specs (Technical Attributes & Specifications)
 * 3. อื่นๆ / Other Information (Warranty, Notes & Logistics)
 */

export const parseBilingualProductDescription = (rawDesc, fallbackShortDesc = '') => {
  const emptyLang = () => ({
    shortDescription: '',
    general: '',
    specific: '',
    other: '',
  });

  if (!rawDesc) {
    return {
      th: { ...emptyLang(), shortDescription: fallbackShortDesc },
      en: emptyLang(),
    };
  }

  let parsedObj = rawDesc;
  if (typeof rawDesc === 'string') {
    const trimmed = rawDesc.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        parsedObj = JSON.parse(trimmed);
      } catch (e) {
        parsedObj = trimmed;
      }
    } else {
      parsedObj = trimmed;
    }
  }

  // Check if bilingual structure { th: {...}, en: {...} }
  if (parsedObj && typeof parsedObj === 'object') {
    if (parsedObj.th || parsedObj.en) {
      const th = parsedObj.th || {};
      const en = parsedObj.en || {};
      return {
        th: {
          shortDescription: (th.shortDescription || fallbackShortDesc || '').trim(),
          general: (th.general || '').trim(),
          specific: (th.specific || '').trim(),
          other: (th.other || '').trim(),
        },
        en: {
          shortDescription: (en.shortDescription || '').trim(),
          general: (en.general || '').trim(),
          specific: (en.specific || '').trim(),
          other: (en.other || '').trim(),
        },
      };
    }

    // Flat object { general, specific, other, shortDescription }
    return {
      th: {
        shortDescription: (parsedObj.shortDescription || fallbackShortDesc || '').trim(),
        general: (parsedObj.general || '').trim(),
        specific: (parsedObj.specific || '').trim(),
        other: (parsedObj.other || '').trim(),
      },
      en: {
        shortDescription: '',
        general: '',
        specific: '',
        other: '',
      },
    };
  }

  // Plain text string
  const plainText = typeof rawDesc === 'string' ? rawDesc.trim() : '';
  return {
    th: {
      shortDescription: fallbackShortDesc,
      general: plainText,
      specific: '',
      other: '',
    },
    en: emptyLang(),
  };
};

export const parseProductDescription = (rawDesc, lang = 'th') => {
  const bilingual = parseBilingualProductDescription(rawDesc);
  const primary = lang === 'en' ? bilingual.en : bilingual.th;
  const secondary = lang === 'en' ? bilingual.th : bilingual.en;

  return {
    shortDescription: primary.shortDescription || secondary.shortDescription || '',
    general: primary.general || secondary.general || '',
    specific: primary.specific || secondary.specific || '',
    other: primary.other || secondary.other || '',
    hasEn: Boolean(
      bilingual.en.shortDescription ||
      bilingual.en.general ||
      bilingual.en.specific ||
      bilingual.en.other
    ),
    hasTh: Boolean(
      bilingual.th.shortDescription ||
      bilingual.th.general ||
      bilingual.th.specific ||
      bilingual.th.other
    ),
  };
};

export const serializeProductDescription = ({ general = '', specific = '', other = '', shortDescription = '' }) => {
  return JSON.stringify({
    shortDescription: (shortDescription || '').trim(),
    general: (general || '').trim(),
    specific: (specific || '').trim(),
    other: (other || '').trim(),
  });
};

export const serializeBilingualProductDescription = ({ th = {}, en = {} }) => {
  return JSON.stringify({
    th: {
      shortDescription: (th.shortDescription || '').trim(),
      general: (th.general || '').trim(),
      specific: (th.specific || '').trim(),
      other: (th.other || '').trim(),
    },
    en: {
      shortDescription: (en.shortDescription || '').trim(),
      general: (en.general || '').trim(),
      specific: (en.specific || '').trim(),
      other: (en.other || '').trim(),
    },
  });
};
