const MATERIAL_SYMBOLS_ID =
  'yum-ta-dum-material-symbols-font';

const MATERIAL_SYMBOLS_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200';

export function ensureMaterialSymbolsFont(): void {
  if (
    typeof document === 'undefined'
  ) {
    return;
  }

  if (
    document.getElementById(
      MATERIAL_SYMBOLS_ID,
    )
  ) {
    return;
  }

  const preconnectGoogle =
    document.createElement('link');

  preconnectGoogle.rel =
    'preconnect';

  preconnectGoogle.href =
    'https://fonts.googleapis.com';

  const preconnectGstatic =
    document.createElement('link');

  preconnectGstatic.rel =
    'preconnect';

  preconnectGstatic.href =
    'https://fonts.gstatic.com';

  preconnectGstatic.crossOrigin =
    'anonymous';

  const fontLink =
    document.createElement('link');

  fontLink.id =
    MATERIAL_SYMBOLS_ID;

  fontLink.rel =
    'stylesheet';

  fontLink.href =
    MATERIAL_SYMBOLS_URL;

  document.head.append(
    preconnectGoogle,
    preconnectGstatic,
    fontLink,
  );
}