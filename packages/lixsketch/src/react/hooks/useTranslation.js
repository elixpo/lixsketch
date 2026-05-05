// Stub for the standalone product's i18n hook. The package ships
// English-only; consumers can wrap LixSketchCanvas in their own i18n
// provider later. t() returns the key when no translation is supplied.
export function useTranslation() {
  return {
    t: (key, fallback) => fallback ?? key,
    locale: 'en',
    setLocale: () => {},
  };
}

export default useTranslation;
