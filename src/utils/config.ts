export const DEFAULT_APPSCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzZfe6wVyo2pZbTdt-NMYL6itq5vi3_siWrj5yRZ6J34Vjq5KegSsqjB1saB9mxt9YJ/exec';

export const SPREADSHEET_ID = '1LrkFlhSFE5dkYzWYb4jqtnXkt5uaojXobRlaE9godQEnCK4OS8Efn22Y';
export const SPREADSHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

export function getAppScriptUrl(): string {
  try {
    const custom = localStorage.getItem('mmp_appscript_url');
    if (custom && custom.trim().startsWith('https://script.google.com/')) {
      return custom.trim();
    }
  } catch {
    // fallback
  }
  return DEFAULT_APPSCRIPT_URL;
}

export function setAppScriptUrl(url: string) {
  try {
    if (url && url.trim().startsWith('https://script.google.com/')) {
      localStorage.setItem('mmp_appscript_url', url.trim());
    } else {
      localStorage.removeItem('mmp_appscript_url');
    }
  } catch (e) {
    console.error(e);
  }
}
