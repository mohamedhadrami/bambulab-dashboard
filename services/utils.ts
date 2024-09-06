// @/services/utils.ts

import { HMS_MODULES, HMS_SEVERITY_LEVELS, HomeFlagValues } from "@/types/bambuApi/consts";

export const getProductImageURL = (productName: string) => {
  const productImageMap: { [key: string]: string } = {
    'X1 Carbon': 'https://cdn1.bambulab.com/compare/x1-42a163b1bf1b7.png',
    'P1S': 'https://cdn1.bambulab.com/compare/p1s-d957cf192ae26.png',
    'P1P': 'https://cdn1.bambulab.com/compare/p1p-2eb4e16a84005.png',
    'A1': 'https://cdn1.bambulab.com/compare/a1-99b27c5b40645.png',
    'A1 Mini': 'https://cdn1.bambulab.com/compare/a1-mini-61c6af3a149.png',
  };
  return productImageMap[productName] || 'default-image-url';
};



export function convertMinutesToTimeString(minutes: number): string {
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const remainingMinutes = minutes % 60;

  let timeString = '';

  if (days > 0) {
    timeString += `${days}d `;
  }

  if (hours > 0) {
    timeString += `${hours}h `;
  }

  if (days === 0 && hours === 0) {
    timeString += `${remainingMinutes}m`;
  } else {
    timeString += `${remainingMinutes}m`;
  }

  return timeString;
}


export const extractFlags = (homeFlag: number): HomeFlagValues[] => {
  const flags: HomeFlagValues[] = [];
  Object.values(HomeFlagValues).forEach((flag) => {
    if (typeof flag === 'number' && (homeFlag & flag)) {
      flags.push(flag);
    }
  });
  return flags;
};



export const getHmsSeverity = (code: number) => {
  const uintCode = code >>> 16;
  if (code > 0 && uintCode in HMS_SEVERITY_LEVELS) {
    return HMS_SEVERITY_LEVELS[uintCode];
  }
  return HMS_SEVERITY_LEVELS.default;
}

export const getHmsModule = (attr: number) => {
  const uintAttr = (attr >>> 24) & 0xFF;
  if (attr > 0 && uintAttr in HMS_MODULES) {
    return HMS_MODULES[uintAttr];
  }
  return HMS_MODULES.default;
}

export const hmsCode = (attr: number, code: number) => {
  if (attr > 0 && code > 0) {
    return `${(attr >>> 16).toString(16).toUpperCase().padStart(4, '0')}_${(attr & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}_${(code >>> 16).toString(16).toUpperCase().padStart(4, '0')}_${(code & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`;
  }
  return "";
}

export const wikiUrl = (attr: number, code: number) => {
  if (attr > 0 && code > 0) {
    const hmsCodeValue = hmsCode(attr, code);
    return `https://wiki.bambulab.com/en/x1/troubleshooting/hmscode/${hmsCodeValue}`;
  }
  return "";
}
