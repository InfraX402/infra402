export interface X402Challenge {
  scheme: string;
  params: Record<string, string>;
  rawHeader: string;
}

const trimQuotes = (value: string) => value.replace(/^"|"$/g, '');

export const parseX402Header = (header?: string | null): X402Challenge | null => {
  if (!header) {
    return null;
  }

  const [schemeRaw, paramString] = header.split(/\s+/, 2);
  if (!schemeRaw) {
    return null;
  }

  const params: Record<string, string> = {};
  if (paramString) {
    paramString
      .split(',')
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .forEach((chunk) => {
        const [key, value] = chunk.split('=');
        if (!key || !value) {
          return;
        }
        params[key.toLowerCase()] = trimQuotes(value.trim());
      });
  }

  return {
    scheme: schemeRaw.toLowerCase(),
    params,
    rawHeader: header,
  };
};
