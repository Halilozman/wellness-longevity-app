import type { AccessCategory, EligibilityResult } from '@/types';
import { getService, RULE_VERSION } from '@/data/catalog';

export const ENTITLEMENT_VERSION = RULE_VERSION;

/**
 * DEMO entitlement rules (configurable). These approximate the three customer
 * access categories. Real coverage depends on the ALZ products held and is
 * resolved against backend entitlement data — here it is a transparent stub.
 *  - aln        -> expanded eligible catalogue; some services included,
 *                      extras available as net pay-per-use.
 *  - insured_elsewhere -> a curated selection, pay-per-use only; never shown as
 *                      ALZ-covered.
 *  - uninsured      -> limited selected starter/access services, direct payment.
 * Everyone can EXPLORE the whole catalogue; purchasability differs.
 */
const ALZ_INCLUDED = new Set(['C01', 'C02', 'C05']);
const SELECTED_INSURED_ELSEWHERE = new Set([
  'C02', 'C03', 'C05', 'N02', 'SMPL_STRESS', 'SMPL_SLEEP', 'SMPL_WEIGHT', 'SMPL_ENERGY', 'SMPL_HABITS',
]);
const STARTER_UNINSURED = new Set(['C05', 'C02', 'N02', 'SMPL_STRESS', 'SMPL_ENERGY', 'SMPL_HABITS']);

export function evaluateEligibility(
  serviceId: string,
  accessCategory: AccessCategory,
  corporate = false,
): EligibilityResult {
  const svc = getService(serviceId);
  const base: EligibilityResult = {
    serviceId, accessCategory, visible: true, entitled: false, payPerUse: false,
    reasonTr: '', demoPriceTry: svc?.demoPriceTry,
  };
  if (!svc) return { ...base, visible: false, reasonTr: 'Servis bulunamadı.' };

  if (svc.status === 'soon') return { ...base, reasonTr: 'Yakında — bu servis henüz açılmadı.' };
  if (svc.status === 'request_info') return { ...base, reasonTr: 'Bilgi al / talep bırak — kapasite ve fiyat henüz onaylı değil.' };

  // corporate-sponsored demo
  if (corporate && serviceId === 'SMPL_WORK') {
    return { ...base, entitled: true, reasonTr: 'Kurumsal sponsorlu hak (demo) — işveren paketi kapsamında.' };
  }

  switch (accessCategory) {
    case 'alz':
      if (ALZ_INCLUDED.has(serviceId)) {
        return { ...base, entitled: true, reasonTr: 'Uygun teminatın kapsamında (demo). Ek ücret yok.' };
      }
      return { ...base, payPerUse: !!svc.demoPriceTry, reasonTr: 'Kapsam dışı ek hizmet — net ödemeyle (demo fiyatı).' };

    case 'insured_elsewhere':
      if (SELECTED_INSURED_ELSEWHERE.has(serviceId)) {
        return { ...base, payPerUse: !!svc.demoPriceTry, reasonTr: 'Seçili hizmet — doğrudan ödemeyle kullanabilirsin (demo fiyatı). ALZ teminatı gösterilmez.' };
      }
      return { ...base, reasonTr: 'Bu statüde satın alma yolu yok; bilgi alabilirsin.' };

    case 'uninsured':
      if (STARTER_UNINSURED.has(serviceId)) {
        return { ...base, payPerUse: !!svc.demoPriceTry, reasonTr: 'Başlangıç erişimi — doğrudan ödemeyle (demo fiyatı).' };
      }
      return { ...base, reasonTr: 'Bu statüde yalnızca seçili başlangıç servisleri satın alınabilir; bilgi alabilirsin.' };
  }
}

export function eligibilityActionLabel(e: EligibilityResult): string {
  if (e.entitled) return 'Hakkımı kullan';
  if (e.payPerUse) return 'Satın al (demo)';
  const svc = getService(e.serviceId);
  if (svc?.status === 'soon') return 'Yakında';
  return 'Bilgi al';
}
