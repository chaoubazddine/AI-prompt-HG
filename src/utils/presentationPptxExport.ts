import pptxgen from 'pptxgenjs';
import { PresentationData, PresentationSlide } from '../types/presentation';

// Rich color palettes tailored for Moroccan Social Studies curriculum
interface ThemePalette {
  primary: string;      // Deep main brand color
  primaryLight: string; // Soft tint of primary
  secondary: string;    // Complementary accent
  secondaryLight: string;
  accent: string;       // Vivid gold / amber accent
  accentLight: string;
  bg: string;           // Clean warm or cool light background
  cardBg: string;       // White card surface
  cardBorder: string;   // Crisp border
  textDark: string;     // Deep charcoal
  textMuted: string;    // Slate gray
  headerBg: string;     // Top banner fill
  boxBg: string;        // Box inner background
  successBg: string;    // Emerald soft
  successBorder: string;// Emerald border
  successText: string;  // Emerald deep
  white: string;        // Pure white
}

const THEMES: Record<string, ThemePalette> = {
  // History Theme: Royal Burgundy, Deep Crimson, Gold & Rose
  history: {
    primary: '881337',       // Rose-900 / Deep Burgundy
    primaryLight: 'FFE4E6',  // Rose-100
    secondary: '9F1239',     // Rose-800
    secondaryLight: 'FFF1F2',// Rose-50
    accent: 'D97706',        // Amber-600 Gold
    accentLight: 'FEF3C7',   // Amber-100
    bg: 'FDF8F6',            // Warm off-white
    cardBg: 'FFFFFF',
    cardBorder: 'FECDD3',    // Rose-200
    textDark: '1C1917',      // Stone-900
    textMuted: '57534E',     // Stone-600
    headerBg: '881337',
    boxBg: 'FFF5F5',
    successBg: 'F0FDF4',
    successBorder: 'BBF7D0',
    successText: '166534',
    white: 'FFFFFF'
  },
  // Geography Theme: Emerald, Forest Jade, Teal & Sunshine Amber
  geography: {
    primary: '065F46',       // Emerald-800
    primaryLight: 'D1FAE5',  // Emerald-100
    secondary: '0D9488',     // Teal-600
    secondaryLight: 'CCFBF1',// Teal-100
    accent: 'D97706',        // Amber
    accentLight: 'FEF3C7',
    bg: 'F0FDF4',            // Soft green tint
    cardBg: 'FFFFFF',
    cardBorder: 'A7F3D0',    // Emerald-200
    textDark: '0F172A',      // Slate-900
    textMuted: '475569',      // Slate-600
    headerBg: '065F46',
    boxBg: 'ECFDF5',
    successBg: 'F0FDF4',
    successBorder: '86EFAC',
    successText: '14532D',
    white: 'FFFFFF'
  },
  // Citizenship Theme: Royal Indigo, Deep Violet & Golden Amber
  citizenship: {
    primary: '3730A3',       // Indigo-800
    primaryLight: 'E0E7FF',  // Indigo-100
    secondary: '6366F1',     // Indigo-500
    secondaryLight: 'EEF2FF',// Indigo-50
    accent: 'EA580C',        // Orange-600
    accentLight: 'FFEDD5',
    bg: 'F8FAFC',            // Slate-50
    cardBg: 'FFFFFF',
    cardBorder: 'C7D2FE',    // Indigo-200
    textDark: '0F172A',
    textMuted: '475569',
    headerBg: '3730A3',
    boxBg: 'EEF2FF',
    successBg: 'F0FDF4',
    successBorder: 'BBF7D0',
    successText: '166534',
    white: 'FFFFFF'
  },
  // Papyrus Heritage / Ancient Egyptian & Moroccan Archives (البردي الذهبي التراثي)
  papyrus_heritage: {
    primary: '8B261E',       // Terracotta / Egyptian Red
    primaryLight: 'FDE8E4',  // Soft terracotta tint
    secondary: '1E3A8A',     // Royal Pharaonic / Moroccan Navy
    secondaryLight: 'DBEAFE',// Navy tint
    accent: 'B45309',        // Antique Gold / Amber
    accentLight: 'FEF3C7',   // Gold tint
    bg: 'F5EEDB',            // Warm Papyrus Parchment
    cardBg: 'FFFDF7',        // Creamy card surface
    cardBorder: 'C5A059',    // Gold ornate border
    textDark: '291B0E',      // Deep sepia charcoal
    textMuted: '6B5B45',     // Warm sepia gray
    headerBg: '8B261E',
    boxBg: '2F3E1B',         // Deep olive green for historic texts
    successBg: 'F0FDF4',
    successBorder: 'BBF7D0',
    successText: '166534',
    white: 'FFFFFF'
  },
  // Default Elegant Navy
  default: {
    primary: '1E293B',
    primaryLight: 'E2E8F0',
    secondary: '4F46E5',
    secondaryLight: 'EEF2FF',
    accent: 'D97706',
    accentLight: 'FEF3C7',
    bg: 'F8FAFC',
    cardBg: 'FFFFFF',
    cardBorder: 'CBD5E1',
    textDark: '0F172A',
    textMuted: '475569',
    headerBg: '1E293B',
    boxBg: 'F1F5F9',
    successBg: 'F0FDF4',
    successBorder: 'BBF7D0',
    successText: '166534',
    white: 'FFFFFF'
  }
};

const getThemeForSubject = (subject: string, themeStyle?: string): ThemePalette => {
  if (themeStyle === 'papyrus_heritage') return THEMES.papyrus_heritage;
  if (subject.includes('تاريخ')) return THEMES.history;
  if (subject.includes('جغرافيا')) return THEMES.geography;
  if (subject.includes('مواطنة')) return THEMES.citizenship;
  return THEMES.default;
};

export async function exportPresentationToPptx(presentation: PresentationData): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // 10 x 5.625 inches
  pptx.rtlMode = true; // RTL support for Arabic

  const theme = getThemeForSubject(presentation.subject, presentation.themeStyle);
  const totalSlides = presentation.slides.length;

  // Metadata
  pptx.author = 'منصة الاجتماعيات الذكية - HG-PROF.MA';
  pptx.company = 'المملكة المغربية - وزارة التربية الوطنية والتعليم الأولي والرياضة';
  pptx.title = `${presentation.subject}: ${presentation.title}`;
  pptx.subject = `${presentation.level} - ${presentation.term}`;

  // Common Header & Footer Chrome for Content Slides
  const addSlideChrome = (slide: any, slideNumber: number, badgeText?: string, stepText?: string) => {
    // Top Banner
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.44,
      fill: { color: theme.headerBg }
    });

    // Top Right: Subject & Level
    slide.addText(`المملكة المغربية 🇲🇦 | مادة ${presentation.subject} - ${presentation.level}`, {
      x: 0.5,
      y: 0.07,
      w: 6.0,
      h: 0.3,
      fontSize: 10,
      color: theme.white,
      fontFace: 'Arial',
      bold: true,
      align: 'right'
    });

    // Top Left: Platform Brand
    slide.addText('منصة الاجتماعيات الذكية (HG-PROF.MA)', {
      x: 6.8,
      y: 0.07,
      w: 2.7,
      h: 0.3,
      fontSize: 9,
      color: 'E2E8F0',
      fontFace: 'Arial',
      align: 'left'
    });

    // Step or Category Badge (Top Right Sub-header)
    const displayBadge = badgeText || stepText;
    if (displayBadge) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 7.3,
        y: 0.54,
        w: 2.2,
        h: 0.34,
        rectRadius: 0.08,
        fill: { color: theme.secondary },
        line: { color: theme.secondary, width: 1 }
      });
      slide.addText(displayBadge, {
        x: 7.3,
        y: 0.57,
        w: 2.2,
        h: 0.28,
        fontSize: 9,
        color: theme.white,
        bold: true,
        fontFace: 'Arial',
        align: 'center'
      });
    }

    // Bottom Divider & Footer
    slide.addShape(pptx.ShapeType.line, {
      x: 0.5,
      y: 5.18,
      w: 9.0,
      h: 0,
      line: { color: theme.cardBorder, width: 1 }
    });

    slide.addText(`الدرس: ${presentation.title} • ${presentation.term}`, {
      x: 0.5,
      y: 5.22,
      w: 7.0,
      h: 0.3,
      fontSize: 8.5,
      color: theme.textMuted,
      fontFace: 'Arial',
      align: 'right'
    });

    slide.addText(`شريحة ${slideNumber} من ${totalSlides}`, {
      x: 8.0,
      y: 5.22,
      w: 1.5,
      h: 0.3,
      fontSize: 8.5,
      color: theme.textMuted,
      fontFace: 'Arial',
      bold: true,
      align: 'left'
    });
  };

  // Render Each Slide
  presentation.slides.forEach((s, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: theme.bg };

    const slideNum = idx + 1;

    // ==========================================
    // 1. SLIDE 1: TITLE & GENERAL INFO SLIDE
    // ==========================================
    if (s.type === 'title' || s.type === 'general_info' || idx === 0) {
      // Main Card Frame
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5,
        y: 0.4,
        w: 9.0,
        h: 4.8,
        rectRadius: 0.15,
        fill: { color: theme.cardBg },
        line: { color: theme.primary, width: 2 }
      });

      // Top Moroccan Ministry Header Banner inside Card
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.7,
        y: 0.55,
        w: 8.6,
        h: 0.46,
        rectRadius: 0.08,
        fill: { color: theme.headerBg }
      });
      slide.addText(`المملكة المغربية 🇲🇦 - وزارة التربية الوطنية والتعليم الأولي والرياضة`, {
        x: 0.7,
        y: 0.63,
        w: 8.6,
        h: 0.3,
        fontSize: 11,
        color: theme.white,
        fontFace: 'Arial',
        bold: true,
        align: 'center'
      });

      // Lesson Big Title
      slide.addText(presentation.title, {
        x: 0.7,
        y: 1.1,
        w: 8.6,
        h: 0.8,
        fontSize: 24,
        color: theme.primary,
        fontFace: 'Arial',
        bold: true,
        align: 'center'
      });

      // Pedagogical Approach Subtitle
      if (presentation.pedagogicalApproach) {
        slide.addText(`النهج الديداكتيكي المعتمد: ${presentation.pedagogicalApproach}`, {
          x: 0.7,
          y: 1.88,
          w: 8.6,
          h: 0.3,
          fontSize: 11,
          color: theme.secondary,
          fontFace: 'Arial',
          bold: true,
          align: 'center'
        });
      }

      // -------------------------------------------------------------
      // General Info Structured Table Card (بطاقة المعلومات العامة للدرس)
      // -------------------------------------------------------------
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 2.25,
        w: 8.4,
        h: 2.2,
        rectRadius: 0.1,
        fill: { color: theme.boxBg },
        line: { color: theme.cardBorder, width: 1.2 }
      });

      // Info Table Header
      slide.addText('📋 بطاقة المعلومات العامة والتأطير الديداكتيكي للدرس', {
        x: 0.9,
        y: 2.32,
        w: 8.2,
        h: 0.28,
        fontSize: 10.5,
        color: theme.primary,
        bold: true,
        fontFace: 'Arial',
        align: 'right'
      });

      // 4 Grid Info Boxes
      const infoItems = [
        { label: 'المادة والمستوى', val: `${presentation.subject} • ${presentation.level}` },
        { label: 'الدورة والغلاف الزمني', val: `${presentation.term} • ${presentation.duration || 'ساعتان'}` },
        { label: 'المكون / المجزوءة', val: presentation.module || presentation.subject },
        { label: 'الكفاية المستهدفة', val: presentation.targetCompetency || 'ترسيخ المفاهيم المهيكلة والنهج التخصصي' }
      ];

      infoItems.forEach((info, iIdx) => {
        const row = Math.floor(iIdx / 2);
        const col = iIdx % 2;
        const boxX = col === 0 ? 5.1 : 0.9;
        const boxY = 2.65 + (row * 0.78);

        slide.addShape(pptx.ShapeType.roundRect, {
          x: boxX,
          y: boxY,
          w: 4.1,
          h: 0.7,
          rectRadius: 0.06,
          fill: { color: theme.cardBg },
          line: { color: theme.cardBorder, width: 1 }
        });

        slide.addText(info.label, {
          x: boxX + 0.1,
          y: boxY + 0.06,
          w: 3.9,
          h: 0.22,
          fontSize: 8.5,
          color: theme.secondary,
          bold: true,
          fontFace: 'Arial',
          align: 'right'
        });

        slide.addText(info.val, {
          x: boxX + 0.1,
          y: boxY + 0.28,
          w: 3.9,
          h: 0.38,
          fontSize: 9.5,
          color: theme.textDark,
          fontFace: 'Arial',
          bold: true,
          align: 'right'
        });
      });

      // Bottom Footer in Title Card
      slide.addText(`منصة الاجتماعيات الذكية (HG-PROF.MA) | هندسة الجذاذة البيداغوجية المتسلسلة`, {
        x: 0.7,
        y: 4.85,
        w: 8.6,
        h: 0.25,
        fontSize: 8.5,
        color: theme.textMuted,
        fontFace: 'Arial',
        align: 'center'
      });

    // ==========================================
    // 2. SLIDE 2: OBJECTIVES SLIDE
    // ==========================================
    } else if (s.type === 'objectives') {
      addSlideChrome(slide, slideNum, s.badge || 'أهداف التعلم', s.pedagogicalStep);

      // Slide Title
      slide.addText(s.title || 'أهداف الدرس والكفايات المسطرة', {
        x: 0.5,
        y: 0.5,
        w: 6.8,
        h: 0.45,
        fontSize: 17,
        color: theme.primary,
        fontFace: 'Arial',
        bold: true,
        align: 'right'
      });

      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.5,
          y: 0.96,
          w: 8.8,
          h: 0.25,
          fontSize: 10,
          color: theme.textMuted,
          fontFace: 'Arial',
          italic: true,
          align: 'right'
        });
      }

      // 3 Colored Objectives Columns (المعرفية - المنهجية/المهارية - الوجدانية/القيمية)
      const objCategories = [
        {
          title: '🎯 الأهداف المعرفية',
          color: theme.primary,
          bgColor: theme.boxBg,
          borderColor: theme.cardBorder,
          items: s.objectivesGroup?.cognitive || s.bulletPoints.slice(0, 2)
        },
        {
          title: '🛠️ الأهداف المنهجية والمهارية',
          color: theme.secondary,
          bgColor: theme.boxBg,
          borderColor: theme.cardBorder,
          items: s.objectivesGroup?.methodological || s.bulletPoints.slice(2, 4)
        },
        {
          title: '🌟 الأهداف الوجدانية والقيمية',
          color: theme.accent,
          bgColor: theme.boxBg,
          borderColor: theme.cardBorder,
          items: s.objectivesGroup?.attitudinal || s.bulletPoints.slice(4, 6)
        }
      ];

      objCategories.forEach((cat, cIdx) => {
        const colX = 6.6 - (cIdx * 3.05); // RTL positions: 6.6 (right), 3.55 (middle), 0.5 (left)
        slide.addShape(pptx.ShapeType.roundRect, {
          x: colX,
          y: 1.3,
          w: 2.9,
          h: 3.65,
          rectRadius: 0.12,
          fill: { color: cat.bgColor },
          line: { color: cat.borderColor, width: 1.5 }
        });

        // Column Header Pill
        slide.addShape(pptx.ShapeType.roundRect, {
          x: colX + 0.15,
          y: 1.45,
          w: 2.6,
          h: 0.45,
          rectRadius: 0.08,
          fill: { color: cat.color }
        });
        slide.addText(cat.title, {
          x: colX + 0.15,
          y: 1.53,
          w: 2.6,
          h: 0.3,
          fontSize: 10.5,
          color: theme.white,
          fontFace: 'Arial',
          bold: true,
          align: 'center'
        });

        // Items Text
        const textArr = (cat.items && cat.items.length > 0 ? cat.items : ['تحقيق التعلمات المقررة']).map(item => `✓ ${item}`).join('\n\n');
        slide.addText(textArr, {
          x: colX + 0.2,
          y: 2.05,
          w: 2.5,
          h: 2.75,
          fontSize: 10,
          color: theme.textDark,
          fontFace: 'Arial',
          align: 'right'
        });
      });

    // ==========================================
    // 3. SLIDE 3: PROBLEMATIC SLIDE (التمهيد الإشكالي)
    // ==========================================
    } else if (s.type === 'problematic') {
      addSlideChrome(slide, slideNum, s.badge || 'التمهيد الإشكالي', s.pedagogicalStep);

      // Slide Title
      slide.addText(s.title || 'التمهيد والتقديم الإشكالي', {
        x: 0.5,
        y: 0.5,
        w: 6.8,
        h: 0.45,
        fontSize: 17,
        color: theme.primary,
        fontFace: 'Arial',
        bold: true,
        align: 'right'
      });

      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.5,
          y: 0.96,
          w: 8.8,
          h: 0.25,
          fontSize: 10,
          color: theme.textMuted,
          fontFace: 'Arial',
          italic: true,
          align: 'right'
        });
      }

      // Context Box (Top Right)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5,
        y: 1.3,
        w: 9.0,
        h: 1.5,
        rectRadius: 0.1,
        fill: { color: theme.boxBg },
        line: { color: theme.cardBorder, width: 1.2 }
      });
      slide.addText('📌 سياق الانطلاق والوضعية التمهيدية:', {
        x: 0.7,
        y: 1.4,
        w: 8.6,
        h: 0.25,
        fontSize: 11,
        color: theme.primary,
        bold: true,
        fontFace: 'Arial',
        align: 'right'
      });

      const bulletsList = Array.isArray(s.bulletPoints) ? s.bulletPoints : [];
      const contextBullets = bulletsList.slice(0, 2).map(b => `• ${b}`).join('\n');
      slide.addText(contextBullets, {
        x: 0.7,
        y: 1.7,
        w: 8.6,
        h: 0.95,
        fontSize: 10.5,
        color: theme.textDark,
        fontFace: 'Arial',
        align: 'right'
      });

      // Questions Box (Bottom)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5,
        y: 2.95,
        w: 9.0,
        h: 2.05,
        rectRadius: 0.1,
        fill: { color: theme.cardBg },
        line: { color: theme.secondary, width: 1.5 }
      });

      slide.addText('❓ الإشكالية المركزية والتساؤلات المؤطرة للدرس:', {
        x: 0.7,
        y: 3.05,
        w: 8.6,
        h: 0.25,
        fontSize: 11,
        color: theme.secondary,
        bold: true,
        fontFace: 'Arial',
        align: 'right'
      });

      const questionBullets = (bulletsList.length > 2 ? bulletsList.slice(2) : bulletsList).map((q, qIdx) => `[${qIdx + 1}] ${q}`).join('\n\n');
      slide.addText(questionBullets, {
        x: 0.7,
        y: 3.35,
        w: 8.6,
        h: 1.5,
        fontSize: 11,
        color: theme.primary,
        bold: true,
        fontFace: 'Arial',
        align: 'right'
      });

    // ==========================================
    // 4. SLIDE: SYNTHESIS SLIDE (التركيب الجزئي للمقطع)
    // ==========================================
    } else if (s.type === 'synthesis') {
      addSlideChrome(slide, slideNum, s.badge || 'تركيب المقطع', s.pedagogicalStep || 'التركيب الجزئي');

      slide.addText(s.title || 'التركيب الجزئي للمقطع والمفاهيم المهيكلة', {
        x: 0.5,
        y: 0.5,
        w: 6.8,
        h: 0.45,
        fontSize: 17,
        color: theme.primary,
        fontFace: 'Arial',
        bold: true,
        align: 'right'
      });

      // Right Box: Main Synthesis Bullets
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 4.8,
        y: 1.25,
        w: 4.7,
        h: 3.75,
        rectRadius: 0.12,
        fill: { color: theme.cardBg },
        line: { color: theme.cardBorder, width: 1.2 }
      });

      slide.addText('📝 خلاصة وحصيلة المقطع التعلمي:', {
        x: 5.0,
        y: 1.4,
        w: 4.3,
        h: 0.28,
        fontSize: 11,
        color: theme.primary,
        bold: true,
        fontFace: 'Arial',
        align: 'right'
      });

      const synthBullets = (Array.isArray(s.bulletPoints) ? s.bulletPoints : []).map(bp => `✓ ${bp}`).join('\n\n');
      slide.addText(synthBullets, {
        x: 5.0,
        y: 1.75,
        w: 4.3,
        h: s.highlightBox ? 2.1 : 3.0,
        fontSize: 10.5,
        color: theme.textDark,
        fontFace: 'Arial',
        align: 'right'
      });

      if (s.synthesisGuidance || s.highlightBox) {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 5.0,
          y: 4.0,
          w: 4.3,
          h: 0.85,
          rectRadius: 0.08,
          fill: { color: theme.boxBg },
          line: { color: theme.secondary, width: 1 }
        });
        const noteTitle = s.synthesisGuidance ? '🎯 توجيه المتعلمين للتركيب:' : '💡 إضاءة واستنتاج:';
        const noteContent = s.synthesisGuidance || s.highlightBox;
        slide.addText(`${noteTitle} ${noteContent}`, {
          x: 5.1,
          y: 4.05,
          w: 4.1,
          h: 0.75,
          fontSize: 9.5,
          color: theme.textDark,
          fontFace: 'Arial',
          align: 'right'
        });
      }

      // Left Box: Key Concepts (معجم المفاهيم والمصطلحات المهيكلة)
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5,
        y: 1.25,
        w: 4.1,
        h: 3.75,
        rectRadius: 0.12,
        fill: { color: theme.boxBg },
        line: { color: theme.primary, width: 1.5 }
      });

      slide.addText('📖 المفاهيم والمصطلحات المهيكلة:', {
        x: 0.7,
        y: 1.4,
        w: 3.7,
        h: 0.28,
        fontSize: 11,
        color: theme.primary,
        bold: true,
        fontFace: 'Arial',
        align: 'right'
      });

      if (s.keyConcepts && s.keyConcepts.length > 0) {
        let conceptsBody = '';
        s.keyConcepts.forEach(kc => {
          conceptsBody += `🔹 ${kc.term}:\n${kc.definition}\n\n`;
        });
        slide.addText(conceptsBody, {
          x: 0.7,
          y: 1.75,
          w: 3.7,
          h: 3.1,
          fontSize: 9.5,
          color: theme.textDark,
          fontFace: 'Arial',
          align: 'right'
        });
      } else {
        slide.addText('ترسيخ الجهاز المفاهيمي للمادة وبناء الشبكة المفاهيمية المؤطرة للدرس.', {
          x: 0.7,
          y: 1.75,
          w: 3.7,
          h: 2.0,
          fontSize: 10,
          color: theme.textMuted,
          fontFace: 'Arial',
          align: 'right'
        });
      }

    // ==========================================
    // 5. SLIDE: FORMATIVE EVALUATION (التقويم المرحلي)
    // ==========================================
    } else if (s.type === 'formative_eval') {
      addSlideChrome(slide, slideNum, s.badge || 'تقويم مرحلي', s.pedagogicalStep || 'فحص الاستيعاب');

      slide.addText(s.title || 'التقويم المرحلي للمقطع التعلمي', {
        x: 0.5,
        y: 0.5,
        w: 6.8,
        h: 0.45,
        fontSize: 17,
        color: theme.primary,
        fontFace: 'Arial',
        bold: true,
        align: 'right'
      });

      // Question Card
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5,
        y: 1.25,
        w: 9.0,
        h: 3.75,
        rectRadius: 0.12,
        fill: { color: theme.cardBg },
        line: { color: theme.accent, width: 1.5 }
      });

      slide.addText('🎯 أنشطة الفحص والتقويم المرحلي الفوري:', {
        x: 0.8,
        y: 1.4,
        w: 8.4,
        h: 0.28,
        fontSize: 11.5,
        color: theme.accent,
        bold: true,
        fontFace: 'Arial',
        align: 'right'
      });

      if (s.interactiveQuestion) {
        // Main Question
        slide.addText(`❓ السؤال: ${s.interactiveQuestion.question}`, {
          x: 0.8,
          y: 1.75,
          w: 8.4,
          h: 0.5,
          fontSize: 12,
          color: theme.primary,
          bold: true,
          fontFace: 'Arial',
          align: 'right'
        });

        // Options
        if (s.interactiveQuestion.options && s.interactiveQuestion.options.length > 0) {
          const optsText = s.interactiveQuestion.options.map((opt, oIdx) => `[${oIdx + 1}] ${opt}`).join('     |     ');
          slide.addText(optsText, {
            x: 0.8,
            y: 2.3,
            w: 8.4,
            h: 0.4,
            fontSize: 10.5,
            color: theme.textDark,
            fontFace: 'Arial',
            align: 'right'
          });
        }

        // Correct Answer Box
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: 2.8,
          w: 8.4,
          h: 2.0,
          rectRadius: 0.08,
          fill: { color: theme.successBg },
          line: { color: theme.successBorder, width: 1.2 }
        });

        slide.addText(`✓ الإجابة النموذجية والتعليل:`, {
          x: 1.0,
          y: 2.92,
          w: 8.0,
          h: 0.25,
          fontSize: 10.5,
          color: theme.successText,
          bold: true,
          fontFace: 'Arial',
          align: 'right'
        });

        let ansBody = '';
        if (s.interactiveQuestion.correctAnswer) {
          ansBody += `• الإجابة: ${s.interactiveQuestion.correctAnswer}\n`;
        }
        ansBody += `• التعليل والتفسير: ${s.interactiveQuestion.explanation}`;

        slide.addText(ansBody, {
          x: 1.0,
          y: 3.2,
          w: 8.0,
          h: 1.5,
          fontSize: 10,
          color: theme.textDark,
          fontFace: 'Arial',
          align: 'right'
        });
      } else {
        const bulletsText = (Array.isArray(s.bulletPoints) ? s.bulletPoints : []).map(bp => `• ${bp}`).join('\n\n');
        slide.addText(bulletsText, {
          x: 0.8,
          y: 1.8,
          w: 8.4,
          h: 3.0,
          fontSize: 11,
          color: theme.textDark,
          fontFace: 'Arial',
          align: 'right'
        });
      }

    // ==========================================
    // 6. SLIDE: CONCLUSION (الخاتمة والامتدادات)
    // ==========================================
    } else if (s.type === 'conclusion') {
      addSlideChrome(slide, slideNum, s.badge || 'خاتمة الدرس', s.pedagogicalStep || 'الخاتمة والامتدادات');

      slide.addText(s.title || 'خاتمة الدرس والامتدادات المستقبلية', {
        x: 0.5,
        y: 0.5,
        w: 6.8,
        h: 0.45,
        fontSize: 17,
        color: theme.primary,
        fontFace: 'Arial',
        bold: true,
        align: 'right'
      });

      // Top Box: General Conclusion
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5,
        y: 1.25,
        w: 9.0,
        h: 2.2,
        rectRadius: 0.1,
        fill: { color: theme.cardBg },
        line: { color: theme.cardBorder, width: 1.2 }
      });
      slide.addText('🌟 الحصيلة العامة والخلاصة التركيبية للدرس:', {
        x: 0.7,
        y: 1.4,
        w: 8.6,
        h: 0.28,
        fontSize: 11.5,
        color: theme.primary,
        bold: true,
        fontFace: 'Arial',
        align: 'right'
      });

      const concBullets = (Array.isArray(s.bulletPoints) ? s.bulletPoints : []).map(bp => `✓ ${bp}`).join('\n');
      slide.addText(concBullets, {
        x: 0.7,
        y: 1.75,
        w: 8.6,
        h: 1.6,
        fontSize: 10.5,
        color: theme.textDark,
        fontFace: 'Arial',
        align: 'right'
      });

      // Bottom Box: Future Links & Extensions
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5,
        y: 3.6,
        w: 9.0,
        h: 1.4,
        rectRadius: 0.1,
        fill: { color: theme.boxBg },
        line: { color: theme.secondary, width: 1.2 }
      });
      slide.addText('🚀 الامتدادات والآفاق المستقبلية للتعلم:', {
        x: 0.7,
        y: 3.72,
        w: 8.6,
        h: 0.25,
        fontSize: 11,
        color: theme.secondary,
        bold: true,
        fontFace: 'Arial',
        align: 'right'
      });
      slide.addText(s.highlightBox || 'يشكل هذا الدرس مدخلاً لفهم الترابطات والتحولات اللاحقة في البرنامج الدراسي.', {
        x: 0.7,
        y: 4.02,
        w: 8.6,
        h: 0.9,
        fontSize: 10,
        color: theme.textDark,
        fontFace: 'Arial',
        align: 'right'
      });

    // ==========================================
    // 7. SLIDE: SUMMATIVE EVALUATION (التقويم الإجمالي)
    // ==========================================
    } else if (s.type === 'evaluation') {
      addSlideChrome(slide, slideNum, s.badge || 'تقويم إجمالي', s.pedagogicalStep || 'التقويم النهائي');

      slide.addText(s.title || 'أنشطة التقويم الإجمالي الشامل للدرس', {
        x: 0.5,
        y: 0.5,
        w: 6.8,
        h: 0.45,
        fontSize: 17,
        color: theme.primary,
        fontFace: 'Arial',
        bold: true,
        align: 'right'
      });

      // 3 Structured Evaluation Blocks
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5,
        y: 1.25,
        w: 9.0,
        h: 3.75,
        rectRadius: 0.12,
        fill: { color: theme.cardBg },
        line: { color: theme.primary, width: 1.5 }
      });

      slide.addText('📊 وضعيات قياس تحقق الكفايات والأهداف التعلمية:', {
        x: 0.8,
        y: 1.4,
        w: 8.4,
        h: 0.28,
        fontSize: 11.5,
        color: theme.primary,
        bold: true,
        fontFace: 'Arial',
        align: 'right'
      });

      const evalBullets = (Array.isArray(s.bulletPoints) ? s.bulletPoints : []).map((bp, bIdx) => `[المهمة ${bIdx + 1}] ${bp}`).join('\n\n');
      slide.addText(evalBullets, {
        x: 0.8,
        y: 1.75,
        w: 8.4,
        h: 2.0,
        fontSize: 10.5,
        color: theme.textDark,
        fontFace: 'Arial',
        align: 'right'
      });

      if (s.interactiveQuestion) {
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: 3.8,
          w: 8.4,
          h: 1.05,
          rectRadius: 0.08,
          fill: { color: theme.boxBg },
          line: { color: theme.secondary, width: 1 }
        });
        slide.addText(`🎯 سؤال تركيبي شامل: ${s.interactiveQuestion.question}\n✓ الحل: ${s.interactiveQuestion.correctAnswer || s.interactiveQuestion.explanation}`, {
          x: 0.9,
          y: 3.86,
          w: 8.2,
          h: 0.95,
          fontSize: 9.5,
          color: theme.textDark,
          fontFace: 'Arial',
          align: 'right'
        });
      }

    // ==========================================
    // 8. STANDARD ACTIVITY SLIDE (الأنشطة والدعامات)
    // ==========================================
    } else {
      addSlideChrome(slide, slideNum, s.badge, s.pedagogicalStep);

      // Slide Title
      slide.addText(s.title, {
        x: 0.5,
        y: 0.5,
        w: 6.8,
        h: 0.45,
        fontSize: 17,
        color: theme.primary,
        fontFace: 'Arial',
        bold: true,
        align: 'right'
      });

      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.5,
          y: 0.96,
          w: 8.8,
          h: 0.25,
          fontSize: 10,
          color: theme.textMuted,
          fontFace: 'Arial',
          italic: true,
          align: 'right'
        });
      }

      const contentStartY = s.subtitle ? 1.25 : 1.15;
      const hasSideBox = Boolean(s.activityDoc || s.visualDiagram);

      if (hasSideBox) {
        // Right Column: Analysis & Bullets (w: 5.4)
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 4.1,
          y: contentStartY,
          w: 5.4,
          h: 3.75,
          rectRadius: 0.12,
          fill: { color: theme.cardBg },
          line: { color: theme.cardBorder, width: 1.2 }
        });

        slide.addText('📋 عناصر التحليل والملاحظات المستخلصة:', {
          x: 4.25,
          y: contentStartY + 0.15,
          w: 5.1,
          h: 0.25,
          fontSize: 10.5,
          color: theme.primary,
          bold: true,
          fontFace: 'Arial',
          align: 'right'
        });

        const bulletArr = (Array.isArray(s.bulletPoints) ? s.bulletPoints : []).map(bp => `✓ ${bp}`).join('\n\n');
        slide.addText(bulletArr, {
          x: 4.25,
          y: contentStartY + 0.45,
          w: 5.1,
          h: s.highlightBox ? 2.1 : 3.1,
          fontSize: 10.5,
          color: theme.textDark,
          fontFace: 'Arial',
          align: 'right'
        });

        if (s.highlightBox) {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: 4.25,
            y: contentStartY + 2.7,
            w: 5.1,
            h: 0.9,
            rectRadius: 0.08,
            fill: { color: theme.boxBg },
            line: { color: theme.secondary, width: 1 }
          });
          slide.addText(`💡 استنتاج مركز: ${s.highlightBox}`, {
            x: 4.35,
            y: contentStartY + 2.75,
            w: 4.9,
            h: 0.8,
            fontSize: 9.5,
            color: theme.textDark,
            fontFace: 'Arial',
            align: 'right'
          });
        }

        // Left Column: Document Card (w: 3.4)
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.5,
          y: contentStartY,
          w: 3.4,
          h: 3.75,
          rectRadius: 0.12,
          fill: { color: theme.boxBg },
          line: { color: theme.primary, width: 1.5 }
        });

        if (s.activityDoc) {
          // Document Header
          slide.addText(`📑 دعامة: ${s.activityDoc.docType}`, {
            x: 0.6,
            y: contentStartY + 0.1,
            w: 3.2,
            h: 0.28,
            fontSize: 10.5,
            color: theme.primary,
            bold: true,
            fontFace: 'Arial',
            align: 'right'
          });

          let docBody = `• العنوان: ${s.activityDoc.title}\n`;
          if (s.activityDoc.contentSnippet) {
            docBody += `• المقتطف: "${s.activityDoc.contentSnippet}"\n\n`;
          }
          docBody += `❓ السؤال الموجه:\n${s.activityDoc.question}\n\n`;
          docBody += `✓ الاستنتاج:\n${s.activityDoc.conclusion}`;

          slide.addText(docBody, {
            x: 0.6,
            y: contentStartY + 0.42,
            w: 3.2,
            h: 3.2,
            fontSize: 9,
            color: theme.textDark,
            fontFace: 'Arial',
            align: 'right'
          });

        } else if (s.visualDiagram) {
          slide.addText(`📊 خطاطة ديداكتيكية: ${s.visualDiagram.title}`, {
            x: 0.6,
            y: contentStartY + 0.1,
            w: 3.2,
            h: 0.28,
            fontSize: 10.5,
            color: theme.secondary,
            bold: true,
            fontFace: 'Arial',
            align: 'right'
          });

          (s.visualDiagram.nodes || []).slice(0, 4).forEach((node, nIdx) => {
            const nodeY = contentStartY + 0.45 + (nIdx * 0.75);
            slide.addShape(pptx.ShapeType.roundRect, {
              x: 0.65,
              y: nodeY,
              w: 3.1,
              h: 0.65,
              rectRadius: 0.08,
              fill: { color: theme.cardBg },
              line: { color: theme.cardBorder, width: 1 }
            });
            slide.addText(`${node.badge ? `[${node.badge}] ` : ''}${node.title}`, {
              x: 0.75,
              y: nodeY + 0.05,
              w: 2.9,
              h: 0.25,
              fontSize: 9.5,
              color: theme.primary,
              bold: true,
              fontFace: 'Arial',
              align: 'right'
            });
            if (node.desc) {
              slide.addText(node.desc, {
                x: 0.75,
                y: nodeY + 0.3,
                w: 2.9,
                h: 0.3,
                fontSize: 8.5,
                color: theme.textMuted,
                fontFace: 'Arial',
                align: 'right'
              });
            }
          });
        }

      } else {
        // Full width card
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.5,
          y: contentStartY,
          w: 9.0,
          h: 3.75,
          rectRadius: 0.12,
          fill: { color: theme.cardBg },
          line: { color: theme.cardBorder, width: 1.2 }
        });

        const bulletArr = (Array.isArray(s.bulletPoints) ? s.bulletPoints : []).map(bp => `✓ ${bp}`).join('\n\n');
        slide.addText(bulletArr, {
          x: 0.7,
          y: contentStartY + 0.2,
          w: 8.6,
          h: 3.3,
          fontSize: 12,
          color: theme.textDark,
          fontFace: 'Arial',
          align: 'right'
        });
      }
    }
  });

  // Clean filename for Moroccan OS and PowerPoint
  const cleanTitle = presentation.title.replace(/[\/\\?%*:|"<>]/g, '-');
  const filename = `عرض-PPTX-${presentation.subject}-${cleanTitle}.pptx`;

  await pptx.writeFile({ fileName: filename });
}
