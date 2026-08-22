import { auth, db } from '../firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

export type ToolUsageType = 'jadha' | 'diagnostic' | 'exam' | 'summary' | 'rayada' | 'download';

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
