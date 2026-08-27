import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export type ToolUsageType = 'jadha' | 'diagnostic' | 'exam' | 'summary' | 'rayada' | 'download';

export type SubscriptionTierType = 'free' | 'basic' | 'semester' | 'advanced' | 'pro' | 'unlimited';

export const TIER_LIMITS: Record<SubscriptionTierType, number> = {
  free: 5,
  basic: 30,
  semester: 60,
  advanced: 60,
  pro: 100,
  unlimited: Infinity
};

export const TIER_NAMES: Record<SubscriptionTierType, string> = {
  free: 'الباقة المجانية (5 تحميلات)',
  basic: 'باقة الأستاذ الأساسية (30 تحميلاً)',
  semester: 'اشتراك الدورة / الأسدس (60 تحميلاً)',
  advanced: 'اشتراك الدورة المتقدمة (60 تحميلاً)',
  pro: 'الباقة المتقدمة Pro (100 تحميل)',
  unlimited: 'باقة VIP السنوية (غير محدود ∞)'
};

export interface UserUsageInfo {
  usageCount: number;
  downloadCount: number;
  toolsUsage: {
    jadha?: number;
    diagnostic?: number;
    exam?: number;
    summary?: number;
    rayada?: number;
    download?: number;
  };
  lastActiveAt?: any;
  lastAction?: string;
}

const TOOL_NAMES: Record<ToolUsageType, string> = {
  jadha: 'توليد جذاذة ديداكتيكية',
  diagnostic: 'التقويم التشخيصي والدعم',
  exam: 'توليد فروض وامتحانات',
  summary: 'ملخصات الدروس والخطاطات',
  rayada: 'مدارس الريادة والمساعد الذكي',
  download: 'تحميل ملف (Word / PDF)'
};

/**
 * Records an action/generation performed by the authenticated teacher.
 */
export async function trackUserUsage(tool: ToolUsageType, actionDescription?: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const label = actionDescription || TOOL_NAMES[tool] || 'استعمال أداة تربوية';

    const updates: Record<string, any> = {
      usageCount: increment(1),
      [`toolsUsage.${tool}`]: increment(1),
      lastActiveAt: serverTimestamp(),
      lastAction: label,
      updatedAt: serverTimestamp()
    };

    if (tool === 'download') {
      updates.downloadCount = increment(1);
    }

    await updateDoc(userRef, updates);
  } catch (error) {
    // Non-blocking: log warning only so UI operations are never interrupted
    console.warn('Failed to record user usage metrics:', error);
  }
}

/**
 * Validates download quota before performing any download across the entire platform.
 * Strictly prevents anyone who has reached 5 downloads on the free tier from downloading
 * until activating a paid or advanced subscription tier.
 */
export async function checkAndRecordDownload(documentDescription: string = 'تحميل وثيقة'): Promise<boolean> {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    toast.error('يرجى تسجيل الدخول أولاً للاستفادة من رصيدك المجاني المتاح (5 تحميلات)', {
      description: 'قم بإنشاء حسابك المجاني أو تسجيل الدخول لحفظ واستخراج الوثائق.',
      duration: 6000,
      action: {
        label: 'تسجيل الدخول / إنشاء حساب',
        onClick: () => window.dispatchEvent(new CustomEvent('open-auth-modal')),
      },
    });
    window.dispatchEvent(new CustomEvent('open-auth-modal'));
    return false;
  }

  const localKey = `_user_dl_count_${currentUser.uid}`;
  const localTierKey = `_user_tier_${currentUser.uid}`;

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userSnap = await getDoc(userRef);
    
    let tier: SubscriptionTierType = 'free';
    let currentDownloads = 0;

    if (userSnap.exists()) {
      const data = userSnap.data();
      tier = (data.subscriptionTier as SubscriptionTierType) || (data.isPremium ? 'unlimited' : 'free');
      currentDownloads = typeof data.downloadCount === 'number' ? data.downloadCount : 0;
      
      // Update local storage cache
      localStorage.setItem(localKey, String(currentDownloads));
      localStorage.setItem(localTierKey, tier);
    } else {
      const cachedDownloads = parseInt(localStorage.getItem(localKey) || '0', 10);
      const cachedTier = (localStorage.getItem(localTierKey) as SubscriptionTierType) || 'free';
      currentDownloads = cachedDownloads;
      tier = cachedTier;
    }

    const limit = TIER_LIMITS[tier] ?? 5;

    // Strict quota enforcement: if free tier or exceeded limit, block completely
    if (tier !== 'unlimited' && currentDownloads >= limit) {
      toast.error('⛔ استنفدت رصيدك المتاح (5 تحميلات مجانية)', {
        description: `لقد قمت بتحميل ${currentDownloads} وثائق ووصلت للحد الأقصى المجاني. يرجى تفعيل إحدى الباقات المتقدمة أو السنوية (VIP) لمتابعة التحميل غير المحدود.`,
        duration: 8000,
        action: {
          label: 'تفعيل الباقة الآن',
          onClick: () => window.dispatchEvent(new CustomEvent('open-pricing-modal')),
        },
      });
      window.dispatchEvent(new CustomEvent('open-pricing-modal'));
      return false;
    }

    // Increment and track in Firestore
    await trackUserUsage('download', documentDescription);
    localStorage.setItem(localKey, String(currentDownloads + 1));
    return true;
  } catch (error) {
    console.warn('Download quota check warning:', error);
    
    // Check offline cache strictly so user cannot bypass by provoking an error
    const cachedDownloads = parseInt(localStorage.getItem(localKey) || '0', 10);
    const cachedTier = (localStorage.getItem(localTierKey) as SubscriptionTierType) || 'free';
    const limit = TIER_LIMITS[cachedTier] ?? 5;

    if (cachedTier !== 'unlimited' && cachedDownloads >= limit) {
      toast.error('⛔ استنفدت رصيدك المتاح (5 تحميلات مجانية)', {
        description: `بلغت الحد الأقصى (${limit} تحميلاً). يرجى تفعيل اشتراكك للاستفادة من التحميل.`,
        duration: 8000,
        action: {
          label: 'تفعيل الباقة',
          onClick: () => window.dispatchEvent(new CustomEvent('open-pricing-modal')),
        },
      });
      window.dispatchEvent(new CustomEvent('open-pricing-modal'));
      return false;
    }

    // If still within limit, record usage and increment
    trackUserUsage('download', documentDescription).catch(() => {});
    localStorage.setItem(localKey, String(cachedDownloads + 1));
    return true;
  }
}

