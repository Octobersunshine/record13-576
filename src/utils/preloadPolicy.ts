export interface PreloadRule {
  pattern: RegExp;
  reason: string;
}

export interface PreloadPolicy {
  whitelist: PreloadRule[];
  blacklist: PreloadRule[];
}

const defaultPolicy: PreloadPolicy = {
  whitelist: [
    { pattern: /^\/(api|assets|favicon)/, reason: '自有业务资源' },
    { pattern: /fonts\.googleapis\.com/, reason: '字体服务' },
    { pattern: /fonts\.gstatic\.com/, reason: '字体静态资源' },
    { pattern: /^\/src\/main\.tsx$/, reason: '应用入口脚本' },
  ],

  blacklist: [
    { pattern: /doubleclick\.net/, reason: '广告追踪' },
    { pattern: /googleadservices\.com/, reason: 'Google 广告' },
    { pattern: /googlesyndication\.com/, reason: 'Google 广告联盟' },
    { pattern: /facebook\.net\/.*\/fbevents/, reason: 'Facebook 像素追踪' },
    { pattern: /analytics\.google\.com/, reason: 'Google 分析' },
    { pattern: /hotjar\.com/, reason: 'Hotjar 热力图追踪' },
    { pattern: /adservice\.google/, reason: '广告服务' },
    { pattern: /amazon-adsystem\.com/, reason: 'Amazon 广告' },
    { pattern: /adnxs\.com/, reason: 'AppNexus 广告平台' },
    { pattern: /ads\.twitter\.com/, reason: 'Twitter 广告' },
    { pattern: /analytics\.twitch\.tv/, reason: 'Twitch 分析' },
    { pattern: /cdn\.amplitude\.com/, reason: 'Amplitude 分析' },
    { pattern: /sentry\.io/, reason: 'Sentry 错误追踪（非关键）' },
    { pattern: /track\./, reason: '通用追踪域名' },
    { pattern: /ads?\./, reason: '通用广告域名' },
    { pattern: /pixel\./, reason: '像素追踪' },
    { pattern: /beacon\./, reason: '信标追踪' },
    { pattern: /telemetry\./, reason: '遥测追踪' },
    { pattern: /collect\?/, reason: '数据采集端点' },
  ],
};

export function getPreloadPolicy(): PreloadPolicy {
  return defaultPolicy;
}

export function isBlacklisted(url: string, policy: PreloadPolicy = defaultPolicy): boolean {
  return policy.blacklist.some((rule) => rule.pattern.test(url));
}

export function isWhitelisted(url: string, policy: PreloadPolicy = defaultPolicy): boolean {
  return policy.whitelist.some((rule) => rule.pattern.test(url));
}

export type PreloadVerdict = 'allowed' | 'blocked-blacklist' | 'blocked-not-in-whitelist';

export function checkPreloadAllowed(
  url: string,
  mode: 'whitelist' | 'blacklist' | 'both' = 'both',
  policy: PreloadPolicy = defaultPolicy,
): { verdict: PreloadVerdict; reason?: string } {
  if (mode === 'whitelist' || mode === 'both') {
    if (isBlacklisted(url, policy)) {
      const rule = policy.blacklist.find((r) => r.pattern.test(url));
      return { verdict: 'blocked-blacklist', reason: rule?.reason };
    }
  }

  if (mode === 'whitelist' || mode === 'both') {
    if (!isWhitelisted(url, policy)) {
      return { verdict: 'blocked-not-in-whitelist', reason: '资源不在白名单中' };
    }
  }

  if (mode === 'blacklist') {
    if (isBlacklisted(url, policy)) {
      const rule = policy.blacklist.find((r) => r.pattern.test(url));
      return { verdict: 'blocked-blacklist', reason: rule?.reason };
    }
  }

  return { verdict: 'allowed' };
}

export function getBlockedReason(url: string, policy: PreloadPolicy = defaultPolicy): string | null {
  const rule = policy.blacklist.find((r) => r.pattern.test(url));
  return rule?.reason ?? null;
}
