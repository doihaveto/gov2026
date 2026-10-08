/* ==========================================================================
   נתוני המשחק – בחירות לכנסת ה-26 (27.10.2026)
   מקורות: ויקיפדיה (סקרים, רשימות מועמדים, הממשלה ה-37), דיווחי תקשורת.
   הנתונים נכונים לתחילת אוקטובר 2026.
   ========================================================================== */

/* ---------- מפלגות (בסדר אידאולוגי משמאל לימין – לתרשים הכנסת) ---------- */
const PARTIES = [
  {
    id: 'joint', name: 'הרשימה המשותפת', short: 'המשותפת', tag: 'חד״ש–תע״ל–בל״ד',
    color: '#2e8b57', bloc: 'arab',
    list: ['יוסף ג׳בארין', 'אחמד טיבי', 'פאתן ע׳טאס', 'בכר עואודה', 'עופר כסיף', 'יוסף עטאונה',
      'מהא כרכבי-סבאח', 'אחמד דראושה', 'נהאיה ושאחי', 'חסן נסאסרה', 'הייתם זחאלקה', 'איאס נאטור',
      'ג׳סאן עבדאללה', 'אורלי נוי', 'מור סטולר'],
    prefs: ['justice', 'finance', 'foreign', 'defense', 'welfare', 'health', 'housing', 'interior', 'education',
      'equality', 'regional', 'negev', 'labor', 'environment', 'agriculture', 'culture']
  },
  {
    id: 'raam', name: 'רע״ם', short: 'רע״ם', tag: 'הרשימה הערבית המאוחדת',
    color: '#7cb518', bloc: 'arab',
    list: ['מנסור עבאס', 'יואב סגלוביץ׳', 'וליד טאהא', 'ואליד אלהואשלה', 'אימאן ח׳טיב-יאסין', 'יאסר חוג׳יראת',
      'אברהים אל-טורי', 'עבד אל-כרים מסרי', 'עבד אל-כרים עזאם', 'אברהים אבו לבן'],
    prefs: ['finance', 'justice', 'foreign', 'defense', 'housing', 'interior', 'welfare', 'health', 'economy',
      'transport', 'education', 'negev', 'regional', 'agriculture', 'equality', 'labor', 'science']
  },
  {
    id: 'dem', name: 'הדמוקרטים', short: 'הדמוקרטים', tag: 'העבודה–מרצ',
    color: '#d62839', bloc: 'change',
    list: ['יאיר גולן', 'נעמה לזימי', 'גלעד קריב', 'אפרת רייטן', 'יאיא פינק', 'גבי לסקי', 'עמרי רונן',
      'מיכל רוזין', 'משה רדמן', 'סומיה בשיר', 'נמרוד שפר', 'מורן זר קצנשטיין', 'אבי דבוש', 'אמילי מואטי',
      'תומר אביטל'],
    prefs: ['justice', 'foreign', 'defense', 'finance', 'health', 'education', 'transport', 'welfare', 'natsec',
      'economy', 'energy', 'housing', 'environment', 'equality', 'regional', 'diaspora', 'culture', 'labor',
      'science', 'communications']
  },
  {
    id: 'yashar', name: 'ישר!', short: 'ישר!', tag: 'גדי איזנקוט',
    color: '#ff7a00', bloc: 'change',
    // בלי רוב יהודי, לאיזנקוט יש תמריץ לממשלת מיעוט בתמיכה ערבית מבחוץ כדי לשבור את יתרון המכהן של הליכוד
    minorityIncentive: true,
    list: ['גדי איזנקוט', 'יורם כהן', 'אורית פרקש-הכהן', 'עדי אלטשולר', 'מתן כהנא', 'חילי טרופר',
      'שאול מרידור', 'תאיר איפרגן', 'אושרת גני גונן', 'שירה שפירא', 'ענבר הרוש גיטי', 'אלעזר שטרן',
      'כמיל אבו רוקון', 'דבורה שריפיאן בכר', 'אלקס ריף', 'ענבר יחזקאלי', 'רועי פולקמן'],
    prefs: ['defense', 'foreign', 'justice', 'finance', 'education', 'natsec', 'interior', 'health', 'economy',
      'transport', 'energy', 'speaker', 'welfare', 'housing', 'fincom', 'intelligence', 'strategic', 'religious',
      'culture', 'science', 'communications', 'environment', 'diaspora', 'negev', 'equality']
  },
  {
    id: 'together', name: 'ביחד', short: 'ביחד', tag: 'בנט–לפיד',
    color: '#00a0b0', bloc: 'change',
    list: ['נפתלי בנט', 'יאיר לפיד', 'קרן טרנר', 'מירב בן ארי', 'לירן אבישר בן-חורין', 'נעם תיבון',
      'מיכל הירש נגרי', 'איתן גינזבורג', 'מירב כהן', 'יונתן שלו', 'ברוריה נעים ארמן', 'רם בן ברק',
      'אמיר סטרוגו', 'נאור שירי', 'ניסן זאבי', 'ולדימיר בליאק', 'אורלי אלידן-הראל', 'יוראי להב-הרצנו',
      'שחר ורון', 'יסמין פרידמן'],
    prefs: ['defense', 'finance', 'foreign', 'justice', 'education', 'economy', 'health', 'transport', 'energy',
      'speaker', 'interior', 'welfare', 'housing', 'natsec', 'fincom', 'science', 'communications', 'diaspora',
      'culture', 'environment', 'tourism', 'aliyah', 'equality', 'regional']
  },
  {
    id: 'bw', name: 'כחול לבן', short: 'כחול לבן', tag: 'בני גנץ',
    color: '#5aa9e6', bloc: 'change',
    list: ['בני גנץ', 'פנינה תמנו-שטה', 'עליזה בלוך', 'רועי קונקול', 'רותם אבידר צאליק', 'אלון שוסטר',
      'מופיד מרעי', 'יהודית אוליאל מלכה', 'אריאל בזיז', 'מוריה רודל-סילפן'],
    prefs: ['defense', 'foreign', 'justice', 'finance', 'education', 'interior', 'health', 'natsec', 'economy',
      'aliyah', 'science', 'strategic', 'culture', 'diaspora']
  },
  {
    id: 'reservists', name: 'המילואימניקים', short: 'המילואימניקים', tag: 'הנדל–זליכה',
    color: '#6b7f3a', bloc: 'change',
    list: ['יועז הנדל', 'ירון זליכה', 'עינת וילף', 'חביב ווליבוביץ׳', 'יואב אדומי', 'אופיר לנגמן',
      'שלומי דימרי', 'ליאור גלבוע', 'תהילה פרץ', 'שלום ביטון'],
    prefs: ['finance', 'defense', 'justice', 'foreign', 'economy', 'energy', 'transport', 'housing', 'fincom',
      'communications', 'strategic', 'intelligence', 'diaspora', 'labor', 'science', 'aliyah']
  },
  {
    id: 'yb', name: 'ישראל ביתנו', short: 'ישראל ביתנו', tag: 'אביגדור ליברמן',
    color: '#5e60ce', bloc: 'change',
    list: ['אביגדור ליברמן', 'רפי בן שטרית', 'טליה לנקרי', 'עודד פורר', 'יוליה מלינובסקי', 'שרון שרעבי',
      'חמד עמאר', 'יבגני סובה', 'אלוירה קוליחמן', 'דן אילוז', 'לילי בן עמי', 'יעל בנבנישתי'],
    prefs: ['finance', 'defense', 'foreign', 'justice', 'fincom', 'interior', 'economy', 'energy', 'natsec',
      'housing', 'transport', 'health', 'education', 'welfare', 'speaker', 'aliyah', 'agriculture', 'tourism',
      'science', 'communications', 'strategic', 'intelligence', 'environment', 'negev']
  },
  {
    id: 'amcha', name: 'עמך ישראל', short: 'עמך ישראל', tag: 'עופר וינטר',
    color: '#ad1457', bloc: 'right',
    list: ['עופר וינטר', 'יוסף חדאד', 'נטעלי שם טוב', 'ערן בן ארי', 'פלר חסן-נחום', 'ללי דרעי',
      'רונן בודנר', 'דוידי בן ציון', 'אביב עזרא'],
    prefs: ['defense', 'foreign', 'justice', 'finance', 'natsec', 'education', 'interior', 'housing', 'transport',
      'heritage', 'negev', 'settlement', 'strategic', 'intelligence', 'diaspora', 'mindefense']
  },
  {
    id: 'likud', name: 'הליכוד', short: 'הליכוד', tag: 'בנימין נתניהו',
    color: '#1d4f9c', bloc: 'bibi',
    list: ['בנימין נתניהו', 'אלי כהן', 'אמיר אוחנה', 'יריב לוין', 'מירי רגב', 'ישראל כ״ץ', 'גדעון סער',
      'אופיר כץ', 'טליק גואילי', 'יואב קיש', 'יעקב ברדוגו', 'מיקי זוהר', 'אלמוג כהן', 'עמיחי שיקלי',
      'אלישע מדן', 'דוד פטר', 'משה סעדה', 'חיים כץ', 'דודי אמסלם', 'אתי עטייה', 'בועז ביסמוט', 'דוד ביטן',
      'שלמה קרעי', 'ניר ברקת', 'גילה גמליאל', 'אלי גולדשמידט', 'ארז תדמור', 'שלמה יוסף לרנר', 'יצחק בונצל',
      'משה בנימין פרץ'],
    prefs: ['defense', 'foreign', 'justice', 'finance', 'speaker', 'education', 'transport', 'economy', 'interior',
      'energy', 'health', 'natsec', 'housing', 'welfare', 'fincom', 'communications', 'culture', 'intelligence',
      'strategic', 'diaspora', 'tourism', 'environment', 'agriculture', 'regional', 'science', 'equality',
      'aliyah', 'labor', 'heritage', 'negev', 'jerusalem']
  },
  {
    id: 'shas', name: 'ש״ס', short: 'ש״ס', tag: 'אריה דרעי',
    color: '#1b2a4a', bloc: 'bibi',
    list: ['אריה דרעי', 'ינון אזולאי', 'מיכאל מלכיאלי', 'יואב בן צור', 'חיים ביטון', 'דרור עמוס',
      'משה אבוטבול', 'אוריאל בוסו', 'יוסי טייב', 'יונתן מישרקי', 'יוסי אילנתנוב', 'ארז מלול',
      'סימיון מושיאשוילי'],
    // ש״ס אינה מתחרה על התיקים הבכירים: מעדיפה משרדים חברתיים ודתיים, ובראש דרישותיה – פטור מגיוס לתלמידי ישיבות
    noTop: true,
    demand: { text: 'ש״ס פרשה מהממשלה ביולי 2025 על רקע חוק הגיוס – הדרישה המרכזית שלה היא חוק שיעגן את מעמד תלמידי הישיבות, לצד משרדים חברתיים ודתיים', src: ['maariv-shas-quit-2025', 'he-wiki-shas'] },
    prefs: ['interior', 'health', 'welfare', 'housing', 'religious', 'labor', 'economy', 'education', 'negev',
      'jerusalem', 'heritage', 'communications', 'tourism', 'agriculture']
  },
  {
    id: 'utj', name: 'יהדות התורה', short: 'יהדות התורה', tag: 'דגל התורה–אגודת ישראל',
    color: '#4a4a4a', bloc: 'bibi',
    list: ['יעקב אשר', 'יצחק גולדקנופף', 'יצחק פינדרוס', 'מאיר פרוש', 'משה רוזנטל', 'אליקים שטארק',
      'יהודה וייספיש', 'יעקב טסלר', 'דוד זלץ', 'דוד אוחנה', 'משה רוט', 'אליהו ברוכי'],
    // יהדות התורה אינה מתחרה על התיקים הבכירים: שואפת לוועדת הכספים ולמשרדים ספציפיים, ובראש דרישותיה – פטור מגיוס
    noTop: true,
    demand: { text: 'יהדות התורה פרשה מהממשלה ב-2025 על רקע מעמד בחורי הישיבות; גולדקנופף דורש פטור מלא לכל תלמיד ישיבה, ואשר: ״מי שיצטרף לגוש שלנו ויבין את העניין הזה, אנחנו יכולים להיות איתו״', src: ['maariv-utj-quit-2025', 'jpost-winter-goldknopf', 'maariv-asher-torah'] },
    prefs: ['fincom', 'housing', 'health', 'jerusalem', 'education', 'interior', 'transport', 'welfare', 'religious',
      'heritage', 'labor', 'communications']
  },
  {
    id: 'rzp', name: 'הציונות הדתית–זהות', short: 'הציונות הדתית', tag: 'סמוטריץ׳–פייגלין',
    color: '#8d6e3f', bloc: 'bibi',
    list: ['בצלאל סמוטריץ׳', 'משה פייגלין', 'אורית סטרוק', 'שמחה רוטמן', 'צביקה מור', 'איתמר איתם',
      'צבי סוכות', 'יצחק זאגא', 'רעות בן חיים', 'עומר פציניאש ולדמן', 'ארקדי מוטר', 'אוהד טל'],
    prefs: ['finance', 'defense', 'justice', 'foreign', 'education', 'housing', 'interior', 'natsec', 'economy',
      'transport', 'energy', 'fincom', 'speaker', 'settlement', 'mindefense', 'aliyah', 'agriculture', 'heritage',
      'religious', 'negev', 'jerusalem']
  },
  {
    id: 'otzma', name: 'עוצמה יהודית', short: 'עוצמה יהודית', tag: 'איתמר בן גביר',
    color: '#e6b800', bloc: 'bibi',
    list: ['איתמר בן גביר', 'טלי גוטליב', 'יצחק וסרלאוף', 'עמיחי אליהו', 'לימור סון הר-מלך', 'יצחק קרויזר',
      'חנמאל דורפמן', 'צחי אליהו', 'יוסי גולדנברגר', 'איתיאל ניימן', 'דוד בבלי', 'ישי פליישר'],
    // כשעוצמה יהודית הכרחית לרוב, בן גביר צפוי להחזיק מעמד עד שיקבל לפחות ערך 6:
    // תיק בכיר ותיק בינוני-בכיר, או שני תיקים בינוניים-בכירים
    holdout: { minValue: 6, text: 'עוצמה יהודית הכרחית לרוב – ובן גביר כבר הוכיח שהוא מוכן לצאת מהממשלה: פרש בינואר 2025 וחזר במרץ ״לאחר שקיבלו את מבוקשם״. כשהוא הכרחי, הוא צפוי לעמוד על תיק בכיר ותיק בינוני-בכיר, או על שני תיקים בינוניים-בכירים', src: ['ynet-otzma-quit-2025', 'maariv-otzma-return-2025', 'ynet-bengvir-demands'] },
    demand: { text: 'בן גביר הציג (22.9.2026) את דרישות עוצמה יהודית: תיק הביטחון לעצמו, המשפטים לטלי גוטליב והביטחון הלאומי ליצחק וסרלאוף – אך לדבריו ״הכול תלוי במספר המנדטים״. ב-2022, עם 6 מנדטים, קיבלה את הביטחון הלאומי (בסמכויות מורחבות), הנגב והגליל והמורשת', src: ['ynet-bengvir-demands', 'inn-bengvir-demands', 'kipa-otzma-2022'] },
    prefs: ['defense', 'justice', 'finance', 'foreign', 'natsec', 'interior', 'education', 'housing', 'transport',
      'negev', 'heritage', 'settlement', 'jerusalem', 'religious', 'agriculture', 'mindefense']
  }
];

const BLOCS = {
  bibi: { name: 'גוש נתניהו', color: '#1d4f9c' },
  change: { name: 'גוש השינוי', color: '#ff7a00' },
  arab: { name: 'מפלגות ערביות', color: '#2e8b57' },
  right: { name: 'ימין, ממליצה על נתניהו', color: '#ad1457' }
};

/* ---------- תפקידים בממשלה (על בסיס משרדי הממשלה ה-37) ----------
   tier: special = ראש ממשלה / ראש ממשלה חליפי, top = בכיר, mid = בינוני, low = זוטר */
const POSITIONS = [
  { id: 'pm', name: 'ראש הממשלה', short: 'ראש הממשלה', tier: 'special' },
  { id: 'altpm', name: 'ראש הממשלה החליפי', short: 'רה״מ החליפי', tier: 'special', note: 'רק בהסכם רוטציה' },

  { id: 'defense', name: 'משרד הביטחון', short: 'ביטחון', tier: 'top' },
  { id: 'finance', name: 'משרד האוצר', short: 'אוצר', tier: 'top' },
  { id: 'foreign', name: 'משרד החוץ', short: 'חוץ', tier: 'top' },
  { id: 'justice', name: 'משרד המשפטים', short: 'משפטים', tier: 'top' },

  { id: 'interior', name: 'משרד הפנים', short: 'פנים', tier: 'mid', upper: true },
  { id: 'education', name: 'משרד החינוך', short: 'חינוך', tier: 'mid', upper: true },
  { id: 'natsec', name: 'המשרד לביטחון לאומי', short: 'ביטחון לאומי', tier: 'mid', upper: true },
  { id: 'health', name: 'משרד הבריאות', short: 'בריאות', tier: 'mid', upper: true },
  { id: 'transport', name: 'משרד התחבורה', short: 'תחבורה', tier: 'mid' },
  { id: 'economy', name: 'משרד הכלכלה והתעשייה', short: 'כלכלה', tier: 'mid' },
  { id: 'housing', name: 'משרד הבינוי והשיכון', short: 'בינוי ושיכון', tier: 'mid' },
  { id: 'welfare', name: 'משרד הרווחה והביטחון החברתי', short: 'רווחה', tier: 'mid' },
  { id: 'energy', name: 'משרד האנרגיה והתשתיות', short: 'אנרגיה', tier: 'mid' },
  { id: 'speaker', name: 'יו״ר הכנסת', short: 'יו״ר הכנסת', tier: 'mid', note: 'תפקיד פרלמנטרי' },
  { id: 'fincom', name: 'יו״ר ועדת הכספים', short: 'ועדת הכספים', tier: 'mid', note: 'תפקיד פרלמנטרי' },

  { id: 'communications', name: 'משרד התקשורת', short: 'תקשורת', tier: 'low' },
  { id: 'agriculture', name: 'משרד החקלאות וביטחון המזון', short: 'חקלאות', tier: 'low' },
  { id: 'labor', name: 'משרד העבודה', short: 'עבודה', tier: 'low' },
  { id: 'environment', name: 'המשרד להגנת הסביבה', short: 'הגנת הסביבה', tier: 'low' },
  { id: 'culture', name: 'משרד התרבות והספורט', short: 'תרבות וספורט', tier: 'low' },
  { id: 'tourism', name: 'משרד התיירות', short: 'תיירות', tier: 'low' },
  { id: 'aliyah', name: 'משרד העלייה והקליטה', short: 'עלייה וקליטה', tier: 'low' },
  { id: 'science', name: 'משרד החדשנות, המדע והטכנולוגיה', short: 'מדע וחדשנות', tier: 'low' },
  { id: 'religious', name: 'המשרד לשירותי דת', short: 'שירותי דת', tier: 'low' },
  { id: 'settlement', name: 'משרד ההתיישבות והמשימות הלאומיות', short: 'התיישבות', tier: 'low' },
  { id: 'negev', name: 'המשרד לפיתוח הנגב, הגליל והחוסן הלאומי', short: 'נגב וגליל', tier: 'low' },
  { id: 'heritage', name: 'משרד המורשת', short: 'מורשת', tier: 'low' },
  { id: 'jerusalem', name: 'המשרד לענייני ירושלים ומסורת ישראל', short: 'ירושלים ומסורת', tier: 'low' },
  { id: 'diaspora', name: 'משרד התפוצות והמאבק באנטישמיות', short: 'תפוצות', tier: 'low' },
  { id: 'equality', name: 'המשרד לשוויון חברתי וקידום מעמד האישה', short: 'שוויון חברתי', tier: 'low' },
  { id: 'intelligence', name: 'משרד המודיעין', short: 'מודיעין', tier: 'low' },
  { id: 'regional', name: 'המשרד לשיתוף פעולה אזורי', short: 'שת״פ אזורי', tier: 'low' },
  { id: 'strategic', name: 'המשרד לנושאים אסטרטגיים', short: 'נושאים אסטרטגיים', tier: 'low' },
  { id: 'mindefense', name: 'שר נוסף במשרד הביטחון', short: 'שר במשרד הביטחון', tier: 'low' }
];

const TIERS = {
  special: { name: 'ראשות הממשלה', weight: 4 },
  top: { name: 'דרג בכיר', weight: 4 },
  mid: { name: 'דרג בינוני', weight: 2 },
  low: { name: 'דרג זוטר', weight: 1 }
};

/* ---------- סקרים (מקור: ויקיפדיה – Opinion polling for the 2026 Israeli legislative election) ---------- */
const POLLS = [
  {
    id: 'c12-1005', outlet: 'חדשות 12', pollster: 'מדגם', date: '5.10.2026', sample: 501,
    seats: { likud: 21, together: 13, rzp: 6, otzma: 7, shas: 7, utj: 8, yb: 9, raam: 5, joint: 8, dem: 9, yashar: 23, reservists: 4 }
  },
  {
    id: 'kan-1004', outlet: 'כאן 11', pollster: 'קנטר', date: '4.10.2026', sample: 553,
    seats: { likud: 21, together: 12, rzp: 6, otzma: 8, shas: 8, utj: 8, yb: 9, raam: 5, joint: 8, dem: 8, yashar: 23, reservists: 4 }
  },
  {
    id: 'i24-1001', outlet: 'i24NEWS', pollster: 'דיירקט פולס', date: '1.10.2026', sample: 504,
    seats: { likud: 28, together: 9, rzp: 5, otzma: 8, shas: 7, utj: 8, yb: 7, raam: 5, joint: 8, dem: 9, yashar: 22, amcha: 4 }
  },
  {
    id: 'c14-1001', outlet: 'ערוץ 14', pollster: '', date: '1.10.2026', sample: 2175,
    seats: { likud: 32, together: 8, rzp: 7, otzma: 7, shas: 10, utj: 8, yb: 6, raam: 5, joint: 7, dem: 9, yashar: 21 }
  },
  {
    id: 'maariv-1001', outlet: 'מעריב', pollster: 'מכון לזר ופאנל4אול', date: '1.10.2026', sample: 602,
    seats: { likud: 19, together: 13, rzp: 5, otzma: 9, shas: 7, utj: 7, yb: 9, raam: 5, joint: 7, dem: 10, yashar: 21, reservists: 4, amcha: 4 }
  },
  {
    id: 'zman-1001', outlet: 'זמן ישראל', pollster: 'יוסי טטיקה', date: '1.10.2026', sample: 500,
    seats: { likud: 21, together: 10, rzp: 5, otzma: 6, shas: 9, utj: 8, yb: 10, raam: 5, joint: 8, dem: 8, yashar: 21, reservists: 5, amcha: 4 }
  },
  {
    id: 'c13-0930', outlet: 'חדשות 13', pollster: '', date: '30.9.2026', sample: 1013,
    seats: { likud: 19, together: 11, rzp: 7, otzma: 8, shas: 7, utj: 8, yb: 9, raam: 5, joint: 9, dem: 11, yashar: 21, amcha: 5 }
  },
  {
    id: 'mm-0929', outlet: 'מאגר מוחות', pollster: 'מאגר מוחות', date: '29.9.2026', sample: 550,
    seats: { likud: 19, together: 14, rzp: 6, otzma: 8, shas: 8, utj: 7, yb: 7, raam: 5, joint: 7, dem: 9, yashar: 21, reservists: 4, amcha: 5 }
  },
  {
    id: 'ih-0917', outlet: 'ישראל היום', pollster: 'קנטר', date: '17.9.2026', sample: 551,
    seats: { likud: 20, together: 13, rzp: 6, otzma: 8, shas: 7, utj: 7, yb: 8, raam: 5, joint: 7, dem: 9, yashar: 22, reservists: 4, amcha: 4 }
  }
];

/* ממוצע נוסף ללא כלי תקשורת שתוצאותיהם חריגות לעומת שאר הסקרים (לפי שם כלי התקשורת) */
const ADJUSTED_AVERAGE_EXCLUDE = ['ערוץ 14', 'i24NEWS'];

/* ---------- מקורות ----------
   כל הודעת מציאותיות במשחק מקשרת למקורות שלה. מקורות בעברית הועדפו; מקור באנגלית שימש רק כשלא נמצא מקור עברי.
   group: news = הצהרות ודיווחים, ref = חוק, תקדימים ורקע, data = נתוני המשחק */
const SRC_GROUPS = [
  { id: 'news', name: 'הצהרות ודיווחים (2025–2026)' },
  { id: 'ref', name: 'חוק, תקדימים ורקע' },
  { id: 'data', name: 'נתוני הסקרים והרשימות' }
];

const SRC = {
  // נתונים
  'wiki-polls': { group: 'data', pub: 'ויקיפדיה (אנגלית)', date: '', label: 'סקרי דעת קהל לקראת הבחירות לכנסת ה-26', url: 'https://en.wikipedia.org/wiki/Opinion_polling_for_the_2026_Israeli_legislative_election' },
  'he-wiki-2026': { group: 'data', pub: 'ויקיפדיה', date: '', label: 'הבחירות לכנסת העשרים ושש – רשימות המועמדים', url: 'https://he.wikipedia.org/wiki/הבחירות_לכנסת_העשרים_ושש' },
  'wiki-lists': { group: 'data', pub: 'ויקיפדיה (אנגלית)', date: '', label: 'רשימות המפלגות לבחירות 2026', url: 'https://en.wikipedia.org/wiki/Party_lists_for_the_2026_Israeli_legislative_election' },
  'he-wiki-37': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'ממשלת ישראל השלושים ושבע – הרכב, משרדים ושרים', url: 'https://he.wikipedia.org/wiki/ממשלת_ישראל_השלושים_ושבע' },

  // חוק ותקדימים
  'law-knesset': { group: 'ref', pub: 'ויקיטקסט', date: '', label: 'חוק-יסוד: הכנסת, סעיף 25 – הכנסת מחליטה ברוב המשתתפים בהצבעה; הנמנעים אינם נמנים', url: 'https://he.wikisource.org/wiki/חוק-יסוד:_הכנסת' },
  'law-gov': { group: 'ref', pub: 'ויקיטקסט', date: '', label: 'חוק-יסוד: הממשלה – הבעת אמון (13), שר שאינו ח״כ (5ב), מילוי מקום שר (24), הממשלה היוצאת ממשיכה בתפקידה עד שתיכון ממשלה חדשה (30ב)', url: 'https://he.wikisource.org/wiki/חוק-יסוד:_הממשלה' },
  'he-wiki-minority': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'ממשלת מיעוט', url: 'https://he.wikipedia.org/wiki/ממשלת_מיעוט' },
  'he-wiki-36': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'ממשלת ישראל השלושים ושש – אמון ברוב 60 מול 59, שמונה סיעות, פיזור הכנסת אחרי כשנה', url: 'https://he.wikipedia.org/wiki/ממשלת_ישראל_השלושים_ושש' },
  'he-wiki-bennett': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'נפתלי בנט – ראש ממשלה מטעם ימינה (7 מנדטים)', url: 'https://he.wikipedia.org/wiki/נפתלי_בנט' },
  'he-wiki-k22': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'הבחירות לכנסת ה-22: לראשונה, כישלון בהרכבת ממשלה הוביל ישירות לפיזור הכנסת (מאי 2019) במקום העברת המנדט למועמד אחר', url: 'https://he.wikipedia.org/wiki/הבחירות_לכנסת_העשרים_ושתיים' },
  'he-wiki-35': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'ממשלת ישראל ה-35: הרוטציה לגנץ נקבעה לנובמבר 2021; הכנסת התפזרה בדצמבר 2020 בשל אי העברת התקציב, ונתניהו כיהן עד יוני 2021', url: 'https://he.wikipedia.org/wiki/ממשלת_ישראל_השלושים_וחמש' },
  'arabcenter-bennett': { group: 'news', pub: 'Arab Center DC', date: '2026', label: 'בנט: ״המפלגות הערביות אינן ציוניות, ולכן לא נישען עליהן״; איזנקוט נמנע מלשלול תמיכה ערבית', url: 'https://arabcenterdc.org/resource/israels-election-and-eisenkots-arab-coalition-dilemma/' },
  'maariv-raam-shoulder': { group: 'news', pub: 'מעריב', date: '24.5.2026', label: 'עבאס: ״אנחנו נהיה מוכנים לתת כתף ולעזור להקים ממשלה אחרת״', url: 'https://www.maariv.co.il/news/politics/article-1324797' },
  'mako-eisenkot-abbas': { group: 'news', pub: 'מאקו', date: '23.7.2026', label: 'איזנקוט לא פוסל את עבאס: ״זו שיטת נתניהו של הפרד ומשול, להוציא מהמחנה 21% מאזרחי ישראל הערבים״', url: 'https://www.mako.co.il/news-israel-elections/2026/Article-7035128293d8f91027.htm' },
  'toi-tibi-minority': { group: 'news', pub: 'Times of Israel', date: '20.9.2026', label: 'טיבי רומז שממשלת מיעוט היא אפשרות', url: 'https://www.timesofisrael.com/senior-arab-mk-backs-replacing-knesset-speaker-after-election-hints-minority-government-an-option/' },
  'he-wiki-altpm': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'ראש ממשלת ישראל החלופי – התפקיד מבוטל החל מהכנסת ה-26', url: 'https://he.wikipedia.org/wiki/ראש_ממשלת_ישראל_החלופי' },
  'he-wiki-25': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'ממשלת ישראל העשרים וחמש – ממשלת מיעוט בתמיכה מבחוץ של חד״ש ומד״ע', url: 'https://he.wikipedia.org/wiki/ממשלת_ישראל_העשרים_וחמש' },
  'he-wiki-k13': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'הכנסת השלוש עשרה – חד״ש ומד״ע תמכו בקואליציה מבחוץ', url: 'https://he.wikipedia.org/wiki/הכנסת_השלוש_עשרה' },
  'idi-1992': { group: 'ref', pub: 'המכון הישראלי לדמוקרטיה', date: '', label: 'בחירות 1992 – רבין פסל שיתוף פורמלי של המפלגות הערביות; חד״ש ומד״ע תמכו מבחוץ', url: 'https://www.idi.org.il/policy/parties-and-elections/elections/1992/' },
  'he-wiki-raam': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'הרשימה הערבית המאוחדת – המגעים עם הליכוד (2021) וסירוב סמוטריץ׳', url: 'https://he.wikipedia.org/wiki/הרשימה_הערבית_המאוחדת' },
  'he-wiki-bader-ofer': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'חוק בדר-עופר – זהה לשיטת ד׳הונדט', url: 'https://he.wikipedia.org/wiki/חוק_בדר-עופר' },
  'huji-gamson': { group: 'ref', pub: 'האוניברסיטה העברית', date: '', label: 'עבודת תזה ״חלוקת שלל פוליטי בישראל״ – חוק גמסון: חלוקת התיקים יחסית למנדטים', url: 'https://public-policy.huji.ac.il/sites/default/files/public-policy/files/ido_elmakias_thesis.pdf' },
  'jdn-senior': { group: 'ref', pub: 'JDN', date: '6.11.2022', label: 'נתניהו: הליכוד ישמור על שלושת התיקים הבכירים – אוצר, חוץ וביטחון', url: 'https://www.jdn.co.il/news/politics/1852148/' },
  'maariv-2022-talks': { group: 'ref', pub: 'מעריב', date: '10.11.2022', label: 'המו״מ הקואליציוני 2022: דרעי לאוצר, סמוטריץ׳ לביטחון', url: 'https://www.maariv.co.il/elections-2022/Article-957554' },
  'walla-vacant': { group: 'ref', pub: 'וואלה', date: '22.1.2025', label: 'ראש הממשלה משמש ממלא מקום בתיקים הלא מאוישים', url: 'https://www.walla.co.il/news/politics/3721217' },
  'he-wiki-deri-pinhasi': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'הלכת דרעי-פנחסי – הגשת כתב אישום נגד שר עשויה לחייב את פיטוריו; ראש ממשלה נאשם רשאי לכהן (בג״ץ 2020)', url: 'https://he.wikipedia.org/wiki/הלכת_דרעי-פנחסי' },
  'ynet-netanyahu-ministries': { group: 'ref', pub: 'ynet', date: '12.12.2019', label: 'נתניהו לבג״ץ אחרי כתב האישום: ״אחדל לכהן כשר, אמשיך כראש הממשלה״', url: 'https://www.ynet.co.il/articles/mobile/0,7340,L-5641561,00.html' },
  'ynet-deri-hcj': { group: 'ref', pub: 'ynet', date: '18.1.2023', label: 'בג״ץ קבע ברוב של 10 מול 1 כי אריה דרעי פסול מלכהן כשר', url: 'https://www.ynet.co.il/news/article/byhaudbos' },
  'he-wiki-shas': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'ש״ס – העדיפה משרדים בעלי אופי סוציאלי כמו הרווחה, הבריאות, השיכון, העלייה והקליטה ודתות', url: 'https://he.wikipedia.org/wiki/ש%22ס_(מפלגה)' },
  'he-wiki-utj': { group: 'ref', pub: 'ויקיפדיה', date: '', label: 'יהדות התורה – נהגה שנים רבות שלא למנות שרים אלא סגני שרים; שואפת לעמוד בראש ועדת הכספים', url: 'https://he.wikipedia.org/wiki/יהדות_התורה' },
  'maariv-utj-quit-2025': { group: 'news', pub: 'מעריב', date: '15.7.2025', label: 'יהדות התורה פורשת: ״הממשלה הפרה פעם אחר פעם את התחייבויותיה לדאוג למעמדם של בחורי הישיבות״', url: 'https://www.maariv.co.il/news/politics/article-1214670' },
  'maariv-shas-quit-2025': { group: 'news', pub: 'מעריב', date: '16.7.2025', label: 'מועצת חכמי התורה מורה לנציגי ש״ס להתפטר מכל תפקידיהם בממשלה', url: 'https://www.maariv.co.il/news/politics/article-1215209' },
  'maariv-asher-torah': { group: 'news', pub: 'מעריב', date: '14.6.2026', label: 'יעקב אשר: ״יש לנו את הגוש שלנו, גוש של התורה״', url: 'https://www.maariv.co.il/news/politics/article-1332694' },
  'ynet-bengvir-demands': { group: 'news', pub: 'ynet', date: '22.9.2026', label: 'בן גביר: ״בקדנציה הקרובה אני מתכוון לדרוש את תפקיד שר הביטחון״; המשפטים לגוטליב, הביטחון הלאומי לוסרלאוף – ״הכול תלוי במספר המנדטים״', url: 'https://www.ynet.co.il/news/elections2026/article/bj7vpgx5gx' },
  'inn-bengvir-demands': { group: 'news', pub: 'ערוץ 7', date: '22.9.2026', label: 'בן גביר לביטחון, גוטליב למשפטים: הדרישה של עוצמה יהודית לממשלה הבאה', url: 'https://www.inn.co.il/news/706819' },
  'ynet-otzma-quit-2025': { group: 'news', pub: 'ynet', date: '19.1.2025', label: 'שרי עוצמה יהודית מתפטרים ״נוכח אישור ההסכם המופקר עם ארגון הטרור חמאס״', url: 'https://www.ynet.co.il/article/rkscuxqwjl' },
  'maariv-otzma-return-2025': { group: 'news', pub: 'מעריב', date: '18.3.2025', label: 'לאחר שקיבלו את מבוקשם: בן גביר ועוצמה יהודית חוזרים לממשלה', url: 'https://www.maariv.co.il/news/politics/article-1180942' },
  'kipa-otzma-2022': { group: 'ref', pub: 'כיפה', date: '25.11.2022', label: 'נחתם הסכם קואליציוני: בן גביר יעמוד בראש המשרד לביטחון לאומי', url: 'https://www.kipa.co.il/חדשות/פוליטי/1146176-0' },
  'walla-levin': { group: 'ref', pub: 'וואלה', date: '29.7.2025', label: 'לוין יקבל שלושה תיקים נוספים מעבר לתפקידו כשר המשפטים', url: 'https://www.walla.co.il/news/politics/3769019' },

  // מפלגות ערביות
  'mako-bibi-tibi': { group: 'news', pub: 'מאקו', date: '19.2.2026', label: 'קמפיין הליכוד: ״זה ביבי או טיבי״', url: 'https://www.mako.co.il/news-israel-elections/2026/Article-ec4ac22a5157c91026.htm' },
  'walla-likud-arab': { group: 'news', pub: 'וואלה', date: '20.6.2026', label: 'הליכוד: איזנקוט יזדקק למפלגות הערביות', url: 'https://www.walla.co.il/news/politics/3847185' },
  'jns-pact': { group: 'news', pub: 'JNS', date: '27.9.2026', label: 'ראשי האופוזיציה חתמו על הסכם שיתוף פעולה; נתניהו: איזנקוט יקים ממשלה עם המפלגות הערביות', url: 'https://www.jns.org/news/israel-news/israeli-opposition-leaders-sign-cooperation-pact-to-oust-netanyahu' },
  'schulman-pact': { group: 'news', pub: 'Marc Schulman', date: '27.9.2026', label: 'הצהרת העקרונות של חמשת ראשי האופוזיציה', url: 'https://marcschulman.substack.com/p/september-27-2026-opposition-leaders' },
  'kipa-smotrich-raam': { group: 'news', pub: 'כיפה', date: '25.3.2021', label: 'סמוטריץ׳: ״לא תקום ממשלת ימין שתתבסס על רע״ם… לא מבפנים, לא מבחוץ, לא בהמנעות״', url: 'https://www.kipa.co.il/חדשות/פוליטי/1108456-סמוטריץ-קובע-שלא-תקום-ממשלת-ימין-בתמיכת-רעם-תומכי-טרור/' },
  'srugim-smotrich-2021': { group: 'news', pub: 'סרוגים', date: '4.5.2021', label: 'סמוטריץ׳: לא נהיה שותפים לממשלה שתסתמך על רע״ם או תומכי טרור אחרים', url: 'https://www.srugim.co.il/550385-סמוטריץ-מבהיר-לא-נהיה-שוטפים-לשום-ממש' },
  'kipa-bengvir-raam': { group: 'news', pub: 'כיפה', date: '24.3.2021', label: 'בן גביר: ״לא אשב איתו ולא בתמיכתו״ (על מנסור עבאס)', url: 'https://www.kipa.co.il/חדשות/פוליטי/1108442-בן-גביר-לא-חוזר-בו-מנסור-עבאס-מחבל' },
  'toi-arab-broker': { group: 'news', pub: 'Times of Israel', date: '29.3.2021', label: 'גורם ערבי: המפלגות הערביות לא ישבו עם סמוטריץ׳ ובן גביר', url: 'https://www.timesofisrael.com/kingmaker-raam-party-wont-sit-in-coalition-with-far-right-warns-arab-broker/' },
  'maariv-bennett-arab': { group: 'news', pub: 'מעריב', date: '2.2.2026', label: 'בנט: ״אין מנדט במדינת ישראל להקים ממשלה שמושתת על מפלגות ערביות״', url: 'https://www.maariv.co.il/news/politics/article-1280302' },
  'mako-bennett-zionist': { group: 'news', pub: 'מאקו', date: '26.3.2026', label: 'בנט: ״אני אקים ממשלה ציונית, ממשלה שנשענת על מפלגות ציוניות״', url: 'https://www.mako.co.il/news-israel-elections/2026/Article-c0bd7d39aab2d91026.htm' },
  'maariv-eisenkot-principles': { group: 'news', pub: 'מעריב', date: '26.9.2026', label: 'איזנקוט: ״אני לא רואה מפלגה ערבית שמקבלת את העקרונות שלי״; ראש הממשלה ייקבע לפי גודל המפלגות', url: 'https://www.maariv.co.il/news/politics/article-1370825' },
  'toi-eisenkot-raam': { group: 'news', pub: 'Times of Israel', date: '26.9.2026', label: 'איזנקוט: רע״ם לא תהיה בממשלה שלי', url: 'https://www.timesofisrael.com/eisenkot-raam-wont-be-in-my-government-pms-approval-of-qatari-funds-between-breach-of-trust-and-treason/' },
  'maariv-lieberman-raam': { group: 'news', pub: 'מעריב', date: '11.8.2026', label: 'ליברמן: ״רע״ם לא יכולה להיות שותפה פוטנציאלית… אנחנו חייבים קואליציה ממלכתית ולא מגזרית״', url: 'https://www.maariv.co.il/news/politics/article-1354650' },
  'almonitor-lieberman-2020': { group: 'news', pub: 'Al-Monitor', date: '3.2020', label: 'ליברמן הסכים ב-2020 לממשלת מיעוט שהייתה נשענת על המשותפת', url: 'https://www.al-monitor.com/originals/2020/03/israel-benny-gantz-avigdor-liberman-joint-list-government.html' },
  'maariv-hendel-zionist': { group: 'news', pub: 'מעריב', date: '20.8.2026', label: 'הנדל: ״לא יהיה 61 על בסיס המפלגות הערביות… או על בסיס המפלגות החרדיות לביבי״; ״אני לא אשלים לנתניהו 61״', url: 'https://www.maariv.co.il/news/politics/article-1355353' },
  'jpost-hendel-61': { group: 'news', pub: 'Jerusalem Post', date: '23.8.2026', label: 'הנדל: לא נהיה המנדט ה-61 גם לאופוזיציה עם המפלגות הערביות', url: 'https://www.jpost.com/israel-election-2026/article-906335' },
  'jdn-hendel-haredim': { group: 'news', pub: 'JDN', date: '6.9.2026', label: 'הנדל: ״צריך להקים ממשלה ציונית. ללא מפלגות חרדיות וערביות״', url: 'https://www.jdn.co.il/news/2724045/' },
  'jpost-hendel-broad': { group: 'news', pub: 'Jerusalem Post', date: '23.7.2026', label: 'הנדל: ״נתניהו אינו הקו האדום שלי״ – יצטרף לממשלה ציונית רחבה גם אם נתניהו בה', url: 'https://jpost.com/israel-news/politics-and-diplomacy/article-903510' },
  'kipa-hendel-unity': { group: 'news', pub: 'כיפה', date: '18.8.2026', label: 'הנדל: ״אם תקום ממשלת אחדות רחבה של איזנקוט, בנט, ליברמן, נתניהו ואחרים – נהיה חלק ממנה״', url: 'https://www.kipa.co.il/%D7%97%D7%93%D7%A9%D7%95%D7%AA/1229815-0/' },
  'jpost-gantz-oped': { group: 'news', pub: 'Jerusalem Post', date: '26.9.2026', label: 'גנץ: ממשלה ציונית רחבה ומתונה, מהימין האחראי עד השמאל האחראי', url: 'https://www.jpost.com/opinion/article-909742' },
  'mako-abbas-bw': { group: 'news', pub: 'מאקו', date: '17.1.2026', label: 'עבאס מגיב לקמפיין כחול לבן נגד רע״ם: ״למה לפסול אותי?״', url: 'https://www.mako.co.il/news-politics/2026_q1/Article-06eb963a63dcb91027.htm' },
  'mako-haredi-arab-2021': { group: 'news', pub: 'מאקו', date: '1.4.2021', label: 'שיתופי פעולה בין ח״כים חרדים וערבים (חוק הגיוס, חוק המואזין)', url: 'https://www.mako.co.il/news-columns/2021_q1/Article-46ca858a0e28871027.htm' },
  'toi-gafni-raam': { group: 'news', pub: 'Times of Israel', date: '4.4.2021', label: 'יהדות התורה חלוקה בשאלת קואליציה בתמיכת רע״ם; גפני מתח ביקורת על הווטו של סמוטריץ׳', url: 'https://www.timesofisrael.com/ultra-orthodox-utj-split-over-potential-coalition-with-raam-support/' },
  'toi-arab-2026': { group: 'news', pub: 'Times of Israel', date: '18.2.2026', label: 'חד״ש ותע״ל צפויות לתמוך בגוש נגד נתניהו בעיקר מהאופוזיציה; בל״ד מתנגדת לתמיכה בכל קואליציה בהובלה ציונית', url: 'https://www.timesofisrael.com/reunifying-arab-parties-aim-for-more-power-but-may-wind-up-with-more-netanyahu/' },

  // נתניהו, ימין ומרכז-שמאל
  'mako-bennett-netanyahu': { group: 'news', pub: 'מאקו', date: '26.3.2026', label: 'בנט: ״אני לא אשב תחת נתניהו״; פוסל את הערבים וגם את סמוטריץ׳ ובן גביר', url: 'https://www.mako.co.il/news-israel-elections/2026/Article-ec4ac22a5157c91026.htm' },
  'toi-bennett-netanyahu': { group: 'news', pub: 'Times of Israel', date: '17.2.2026', label: 'בנט: לא אהיה חלק מההנהגה הכושלת של נתניהו', url: 'https://www.timesofisrael.com/in-first-bennett-implies-he-wont-sit-in-a-government-under-netanyahu/' },
  'srugim-lieberman-netanyahu': { group: 'news', pub: 'סרוגים', date: '6.5.2026', label: 'ליברמן: ״שיתהפך העולם – לא אשב עם נתניהו״', url: 'https://www.srugim.co.il/1303772-ליברמן-מבהיר-לא-אשב-עם-נתניהו' },
  'jdn-golan-netanyahu': { group: 'news', pub: 'JDN', date: '30.11.2025', label: 'גולן: ״לא אשב עם נתניהו, בן גביר וסמוטריץ׳״', url: 'https://www.jdn.co.il/?p=2526786' },
  'kipa-golan': { group: 'news', pub: 'כיפה', date: '27.5.2026', label: 'גולן: ״בתנאי שהליכוד, סמוטריץ׳ ובן גביר לא שם״; ״החרדים יהיו בחוץ – זו הבטחה״', url: 'https://www.kipa.co.il/חדשות/1225014-0/' },
  'srugim-gantz-blocs': { group: 'news', pub: 'סרוגים', date: '12.1.2026', label: 'גנץ: ״אני לא אתן לנתניהו את האצבע ה-61״; ״לא אתן לבן גביר להיות שר הביטחון״', url: 'https://www.srugim.co.il/1287634-גנץ-בהצהרה-דרמטית-תם-עידן-הגושים-לא-אש' },
  'jpost-gantz-aug': { group: 'news', pub: 'Jerusalem Post', date: '20.8.2026', label: 'גנץ: לא אתן לנתניהו את הקול ה-61; המפלגות החרדיות לא יכולות להיות בממשלה הבאה', url: 'https://jpost.com/israel-election-2026/article-906156' },
  'jpost-eisenkot-0924': { group: 'news', pub: 'Jerusalem Post', date: '24.9.2026', label: 'איזנקוט: ״ראש המפלגה הגדולה הוא המועמד לראשות הממשלה״; לא לרוטציה; ביקורת על סמוטריץ׳', url: 'https://jpost.com/israel-election-2026/article-909543' },
  'toi-cohen-smotrich': { group: 'news', pub: 'Times of Israel', date: '9.5.2026', label: 'יורם כהן (ישר!): סמוטריץ׳ ״שותף לגיטימי״, בן גביר לא', url: 'https://www.timesofisrael.com/after-joining-yashar-ex-head-of-shin-bet-says-smotrich-a-legitimate-partner-rules-out-ben-gvir/' },
  'mako-lieberman-coalition': { group: 'news', pub: 'מאקו', date: '19.2.2026', label: 'ליברמן: ״מי שדוגל בהדרת נשים ותומך בחוק ההשתמטות לא יהיה שותף בקואליציה״', url: 'https://www.mako.co.il/news-israel-elections/2026/Article-ec4ac22a5157c91026.htm' },
  'kipa-likud-camp': { group: 'news', pub: 'כיפה', date: '26.9.2026', label: 'הליכוד: נתניהו יקים את הממשלה הבאה על בסיס מפלגות המחנה הלאומי', url: 'https://www.kipa.co.il/חדשות/1231703-0/' },
  'srugim-unity': { group: 'news', pub: 'סרוגים', date: '26.8.2026', label: 'תרחיש ממשלה רחבה בראשות נתניהו ואיזנקוט ברוטציה, נתניהו ראשון', url: 'https://www.srugim.co.il/101009508-נתניהו-לנשיאות-איזנקוט-לראשות-הממשלה' },
  'jpost-unity': { group: 'news', pub: 'Jerusalem Post', date: '26.8.2026', label: 'נתניהו שוקל אפשרויות שלאחר הבחירות, כולל אחדות עם איזנקוט', url: 'https://jpost.com/israel-election-2026/article-906630' },

  // חרדים
  'maariv-lieberman-shas': { group: 'news', pub: 'מעריב', date: '12.7.2026', label: 'ליברמן: ״ש״ס לא תהיה שותפה לקואליציה שנקים״', url: 'https://www.maariv.co.il/news/opinions/article-1343603' },
  'mako-lieberman-haredim': { group: 'news', pub: 'מאקו', date: '25.5.2026', label: 'ליברמן: ״מי שבונה על קואליציה עם ש״ס ויהדות התורה מוותר מראש על חוק גיוס״', url: 'https://www.mako.co.il/news-israel-elections/2026/Article-83d6eaf45fe5e91026.htm' },
  'kikar-bennett-draft': { group: 'news', pub: 'כיכר השבת', date: '6.8.2026', label: 'בנט: ״הדלת נעולה למי שבעד השתמטות״', url: 'https://www.kikar.co.il/haredim-news/tjc2os' },
  'walla-bennett-lapid-draft': { group: 'news', pub: 'וואלה', date: '27.5.2026', label: 'בנט: ״לא יהיו שום פשרות בנושאי גיוס״; לפיד: פשרות עם החרדים הן ״שגיאה ערכית״', url: 'https://www.walla.co.il/news/politics/3841165' },
  'kikar-eisenkot-draft': { group: 'news', pub: 'כיכר השבת', date: '7.6.2026', label: 'איזנקוט: ״אם מה שיעמוד ביני לבין הקמת ממשלה זה חוק השתמטות, אני אעדיף ללכת לבחירות״', url: 'https://www.kikar.co.il/political-news/eisenkot-prefers-elections-over-haredi-draft-compr' },
  'walla-eisenkot-plan': { group: 'news', pub: 'וואלה', date: '30.10.2025', label: 'תוכנית הגיוס של איזנקוט: ״לא אשב בממשלה שלא תקדם חוק כזה״', url: 'https://www.walla.co.il/news/politics/3790711' },
  'maariv-eisenkot-shas': { group: 'news', pub: 'מעריב', date: '9.7.2026', label: 'איזנקוט: ״אני רואה בש״ס שותפה בתנאי״', url: 'https://www.maariv.co.il/news/politics/article-1342658' },
  'walla-yosef-eisenkot': { group: 'news', pub: 'וואלה', date: '11.7.2026', label: 'הרב יצחק יוסף בקריצה לאיזנקוט: ״נתניהו לא יחזור בתשובה – גדי אולי כן״', url: 'https://www.walla.co.il/news/politics/3852689' },
  'maariv-yosef-eisenkot': { group: 'news', pub: 'מעריב', date: '12.7.2026', label: 'הרב יצחק יוסף: ״אפשרי שנלך עם איזנקוט בבחירות הקרובות״', url: 'https://www.maariv.co.il/news/politics/article-1343439' },

  // עמך ישראל
  'walla-winter-0903': { group: 'news', pub: 'וואלה', date: '3.9.2026', label: 'וינטר: ״לא נהיה בממשלה שלא תעביר חוק גיוס לפני הקמתה״; ״ברור שלא נלך עם ליברמן ובנט״', url: 'https://www.walla.co.il/news/politics/3865150' },
  'toi-winter-1004': { group: 'news', pub: 'Times of Israel', date: '4.10.2026', label: 'וינטר: ידרוש גיוס חרדים, אך יישב בקואליציה עם החרדים; שולל ממשלה בראשות איזנקוט', url: 'https://www.timesofisrael.com/winter-says-hell-demand-ultra-orthodox-idf-service-but-will-still-join-coalition-with-haredim' },
  'jpost-winter-goldknopf': { group: 'news', pub: 'Jerusalem Post', date: '8.9.2026', label: 'גולדקנופף דורש פטור מלא לכל תלמיד ישיבה; וינטר: ״לא תהיה ממשלה בלי הסדרת מעמד המשרתים״', url: 'https://www.jpost.com/israel-election-2026/article-907884' },
  'maariv-amcha-1006': { group: 'news', pub: 'מעריב', date: '6.10.2026', label: 'מועמד עמך ישראל: ״לא נשב עם נתניהו בכל מחיר״; לא עם אנשי יאיר גולן וחותמי מכתב הטייסים', url: 'https://www.maariv.co.il/news/politics/article-1374024' },
  'inn-amcha-eisenkot': { group: 'news', pub: 'ערוץ 7', date: '10.2026', label: 'מועמד בעמך ישראל: ״לא אמרנו שנשב רק עם נתניהו, אמרנו שנמליץ על נתניהו״', url: 'https://www.inn.co.il/news/707819' },
  'ji-winter': { group: 'news', pub: 'Jewish Insider', date: '6.10.2026', label: 'וינטר ימליץ על נתניהו ולא ישב עם המפלגות הערביות או הדמוקרטים', url: 'https://jewishinsider.com/2026/10/amcha-yisrael-leader-ofer-winter-israeli-elections/' }
};

/* ---------- יחסים בין מפלגות (קווים אדומים ומתיחויות) ----------
   level: 2 = קו אדום (סירוב מפורש), 1 = מתיחות (תנאים סותרים / חיכוך). sup = הרמה כשאחת המפלגות רק תומכת מבחוץ (0 = אין בעיה).
   cond (אופציונלי): הכלל חל רק כשהתנאי מתקיים. src: מפתחות ב-SRC. ההערכות נכונות לתחילת אוקטובר 2026. */
const RELATIONS = [
  // מפלגות ערביות
  { a: 'joint', b: 'likud', level: 2, sup: 1, text: 'קמפיין הליכוד בנוי על האזהרה מפני ממשלה עם המפלגות הערביות (״ביבי או טיבי״)', src: ['mako-bibi-tibi', 'jns-pact'] },
  { a: 'joint', b: 'rzp', supExplicit: true, level: 2, sup: 2, text: 'סמוטריץ׳: ״לא נהיה שותפים לשום ממשלה שתסתמך אקטיבית או בהימנעות על רע״ם או תומכי טרור אחרים״', src: ['srugim-smotrich-2021', 'toi-arab-broker'] },
  { a: 'joint', b: 'otzma', level: 2, sup: 1, text: 'עוצמה יהודית והמפלגות הערביות שוללות זו את זו', src: ['kipa-bengvir-raam', 'toi-arab-broker'] },
  { a: 'joint', b: 'shas', level: 1, sup: 0, text: 'ש״ס בגוש נתניהו; אין התייחסות מ-2026, ובעבר היו שיתופי פעולה בין ח״כים חרדים וערבים (חוק הגיוס, חוק המואזין)', src: ['mako-haredi-arab-2021'] },
  { a: 'joint', b: 'utj', level: 1, sup: 0, text: 'יהדות התורה בגוש נתניהו; אין התייחסות מ-2026, ובעבר היו שיתופי פעולה בין ח״כים חרדים וערבים (חוק הגיוס, חוק המואזין)', src: ['mako-haredi-arab-2021'] },
  { a: 'joint', b: 'yb', level: 2, sup: 1, text: 'ליברמן: ״אנחנו חייבים קואליציה ממלכתית ולא מגזרית״ (2026); ב-2020 הסכים לממשלת מיעוט שהייתה נשענת על המשותפת', src: ['maariv-lieberman-raam', 'almonitor-lieberman-2020'] },
  { a: 'joint', b: 'yashar', level: 2, sup: 0, text: 'איזנקוט: ״אני לא רואה מפלגה ערבית שמקבלת את העקרונות שלי״ (את שאלת התמיכה מבחוץ לא שלל)', src: ['maariv-eisenkot-principles', 'toi-eisenkot-raam'] },
  { a: 'joint', b: 'together', supExplicit: true, level: 2, sup: 2, text: 'בנט: ״אין מנדט במדינת ישראל להקים ממשלה שמושתת על מפלגות ערביות״; ״המפלגות הערביות אינן ציוניות, ולכן לא נישען עליהן״', src: ['maariv-bennett-arab', 'mako-bennett-zionist', 'arabcenter-bennett'] },
  { a: 'joint', b: 'reservists', supExplicit: true, level: 2, sup: 2, text: 'הנדל: ״לא יהיה 61 על בסיס המפלגות הערביות״ – גם לא כמנדט ה-61 מבחוץ', src: ['maariv-hendel-zionist', 'jpost-hendel-61'] },
  { a: 'joint', b: 'amcha', level: 2, sup: 1, text: 'עמך ישראל לא תשב עם המפלגות הערביות', src: ['ji-winter'] },
  { a: 'joint', b: 'bw', level: 1, sup: 0, text: 'גנץ חותר ל״ממשלה ציונית רחבה״ מהימין האחראי עד השמאל האחראי', src: ['jpost-gantz-oped'] },
  { a: 'raam', b: 'likud', level: 2, sup: 1, text: 'קמפיין הליכוד בנוי על האזהרה מפני ממשלה עם המפלגות הערביות (אף שב-2021 ניהל עבאס מגעים עם הליכוד)', src: ['mako-bibi-tibi', 'walla-likud-arab', 'he-wiki-raam'] },
  { a: 'raam', b: 'rzp', supExplicit: true, level: 2, sup: 2, text: 'סמוטריץ׳: ״לא תקום ממשלת ימין שתתבסס על רע״ם… לא מבפנים, לא מבחוץ, לא בהמנעות״', src: ['kipa-smotrich-raam', 'he-wiki-raam'] },
  { a: 'raam', b: 'otzma', supExplicit: true, level: 2, sup: 2, text: 'בן גביר על עבאס: ״לא אשב איתו ולא בתמיכתו״', src: ['kipa-bengvir-raam'] },
  { a: 'raam', b: 'yashar', level: 2, sup: 0, text: 'איזנקוט: רע״ם לא תהיה בממשלה בראשותו (את שאלת התמיכה מבחוץ לא שלל)', src: ['maariv-eisenkot-principles', 'toi-eisenkot-raam'] },
  { a: 'raam', b: 'together', supExplicit: true, level: 2, sup: 2, text: 'בנט: ״המפלגות הערביות אינן ציוניות, ולכן לא נישען עליהן״ – למרות תקדים ממשלת 2021', src: ['maariv-bennett-arab', 'mako-bennett-zionist', 'arabcenter-bennett'] },
  { a: 'raam', b: 'yb', level: 2, sup: 1, text: 'ליברמן: ״רע״ם לא יכולה להיות שותפה פוטנציאלית כי היא קודם כל מפלגה מגזרית״ (אף שישב בממשלת 2021 שנשענה על רע״ם)', src: ['maariv-lieberman-raam'] },
  { a: 'raam', b: 'shas', level: 1, sup: 0, text: 'אין התייחסות מ-2026; ב-2021 היו שיתופי פעולה בין ח״כים חרדים וערבים, והחרדים הסתייגו מהווטו של סמוטריץ׳ על רע״ם', src: ['mako-haredi-arab-2021', 'toi-gafni-raam'] },
  { a: 'raam', b: 'utj', level: 1, sup: 0, text: 'אין התייחסות מ-2026; ב-2021 גפני מתח ביקורת על הווטו של סמוטריץ׳ על רע״ם', src: ['toi-gafni-raam', 'mako-haredi-arab-2021'] },
  { a: 'raam', b: 'reservists', supExplicit: true, level: 2, sup: 2, text: 'הנדל: ״אנחנו נקים רק ממשלה ציונית, עם מפלגות ציוניות. נקודה״ – וגם לא יהיה המנדט ה-61 לאופוזיציה עם המפלגות הערביות', src: ['maariv-hendel-zionist', 'jpost-hendel-61'] },
  { a: 'raam', b: 'amcha', level: 2, sup: 1, text: 'עמך ישראל לא תשב עם המפלגות הערביות', src: ['ji-winter'] },
  { a: 'raam', b: 'bw', level: 1, sup: 0, text: 'כחול לבן ניהלה קמפיין נגד רע״ם, וגנץ חותר ל״ממשלה ציונית רחבה״', src: ['mako-abbas-bw', 'jpost-gantz-oped'] },
  // ימין קיצוני מול מרכז-שמאל
  { a: 'otzma', b: 'dem', level: 2, sup: 2, supExplicit: 'dem', text: 'גולן: ״לא אשב עם נתניהו, בן גביר וסמוטריץ׳״; ״אני אצביע בעד, בתנאי שהליכוד, סמוטריץ׳ ובן גביר לא שם״', src: ['jdn-golan-netanyahu', 'kipa-golan'] },
  { a: 'otzma', b: 'yashar', level: 2, sup: 1, text: 'מס׳ 2 בישר!, יורם כהן: בן גביר אינו שותף לגיטימי', src: ['toi-cohen-smotrich'] },
  { a: 'otzma', b: 'together', level: 2, sup: 1, text: 'בנט פוסל את בן גביר: ״היום בן גביר מפרק את מדינת ישראל״', src: ['mako-bennett-netanyahu'] },
  { a: 'otzma', b: 'bw', level: 2, sup: 1, text: 'גנץ: ״לא אתן לבן גביר להיות שר הביטחון של הילדים שלנו״', src: ['srugim-gantz-blocs', 'jpost-gantz-aug'] },
  { a: 'rzp', b: 'dem', level: 2, sup: 2, supExplicit: 'dem', text: 'גולן: ״לא אשב עם נתניהו, בן גביר וסמוטריץ׳״; ״אני אצביע בעד, בתנאי שהליכוד, סמוטריץ׳ ובן גביר לא שם״', src: ['jdn-golan-netanyahu', 'kipa-golan'] },
  { a: 'rzp', b: 'together', level: 2, sup: 1, text: 'בנט פוסל את סמוטריץ׳ ובן גביר', src: ['mako-bennett-netanyahu'] },
  { a: 'rzp', b: 'yashar', level: 1, sup: 1, text: 'יורם כהן: סמוטריץ׳ ״שותף לגיטימי״; איזנקוט: לא יכול לקבל את תמיכתו בחוק השתמטות', src: ['toi-cohen-smotrich', 'jpost-eisenkot-0924'] },
  { a: 'rzp', b: 'yb', level: 1, sup: 1, text: 'ליברמן: ״מי שדוגל בהדרת נשים ותומך בחוק ההשתמטות לא יהיה שותף בקואליציה״', src: ['mako-lieberman-coalition'] },
  { a: 'rzp', b: 'reservists', level: 1, sup: 1, text: 'הנדל: ״סמוטריץ׳ באופן עקבי תומך בכל חוק שמעודד השתמטות המונית״ (אך לא פסל אותו)', src: ['maariv-hendel-zionist'] },
  // חרדים
  { a: 'shas', b: 'yb', level: 2, sup: 1, text: 'ליברמן: ״ש״ס לא תהיה שותפה לקואליציה שנקים״', src: ['maariv-lieberman-shas', 'mako-lieberman-haredim'] },
  { a: 'utj', b: 'yb', level: 2, sup: 1, text: 'ליברמן: ״מי שבונה על קואליציה עם ש״ס ויהדות התורה מוותר מראש על חוק גיוס״', src: ['mako-lieberman-haredim', 'maariv-lieberman-shas'] },
  { a: 'shas', b: 'together', level: 1, sup: 1, text: 'בנט: ״הדלת נעולה למי שבעד השתמטות״', src: ['kikar-bennett-draft', 'walla-bennett-lapid-draft'] },
  { a: 'utj', b: 'together', level: 1, sup: 1, text: 'בנט: ״הדלת נעולה למי שבעד השתמטות״; לפיד: פשרות עם החרדים הן ״שגיאה ערכית״', src: ['kikar-bennett-draft', 'walla-bennett-lapid-draft'] },
  { a: 'shas', b: 'dem', level: 2, sup: 1, text: 'גולן: ״החרדים יהיו בחוץ – זו הבטחה״', src: ['kipa-golan'] },
  { a: 'utj', b: 'dem', level: 2, sup: 1, text: 'גולן: ״החרדים יהיו בחוץ – זו הבטחה״', src: ['kipa-golan'] },
  { a: 'shas', b: 'reservists', supExplicit: true, level: 2, sup: 2, text: 'הנדל: ״צריך להקים ממשלה ציונית. ללא מפלגות חרדיות וערביות״; ״לא יהיה… 61 על בסיס המפלגות החרדיות״', src: ['jdn-hendel-haredim', 'maariv-hendel-zionist'] },
  { a: 'utj', b: 'reservists', supExplicit: true, level: 2, sup: 2, text: 'הנדל: ״צריך להקים ממשלה ציונית. ללא מפלגות חרדיות וערביות״; ״לא יהיה… 61 על בסיס המפלגות החרדיות״', src: ['jdn-hendel-haredim', 'maariv-hendel-zionist'] },
  { a: 'shas', b: 'bw', level: 2, sup: 1, text: 'גנץ: המפלגות החרדיות לא יכולות להיות בממשלה הבאה כל עוד לא יסכימו לחוק גיוס הוגן', src: ['jpost-gantz-aug'] },
  { a: 'utj', b: 'bw', level: 2, sup: 1, text: 'גנץ: המפלגות החרדיות לא יכולות להיות בממשלה הבאה כל עוד לא יסכימו לחוק גיוס הוגן', src: ['jpost-gantz-aug'] },
  { a: 'shas', b: 'yashar', level: 1, sup: 1, text: 'איזנקוט רואה בש״ס ״שותפה בתנאי״ – והתנאי כולל חוק גיוס', src: ['maariv-eisenkot-shas', 'kikar-eisenkot-draft'] },
  { a: 'utj', b: 'yashar', level: 1, sup: 1, text: 'איזנקוט: ״אם מה שיעמוד ביני לבין הקמת ממשלה זה חוק השתמטות, אני אעדיף ללכת לבחירות״', src: ['kikar-eisenkot-draft', 'walla-eisenkot-plan'] },
  // עמך ישראל (עופר וינטר)
  { a: 'amcha', b: 'shas', level: 1, sup: 1, text: 'וינטר: ״לא נהיה בממשלה שלא תעביר חוק גיוס לפני הקמתה״ – אך הצהיר שיסכים לשבת לצד המפלגות החרדיות', src: ['walla-winter-0903', 'toi-winter-1004'] },
  { a: 'amcha', b: 'utj', level: 1, sup: 1, text: 'וינטר דורש חוק גיוס לפני הקמת הממשלה, בעוד גולדקנופף דורש פטור מלא לכל תלמיד ישיבה – אך וינטר הצהיר שיסכים לשבת לצד החרדים', src: ['walla-winter-0903', 'jpost-winter-goldknopf', 'toi-winter-1004'] },
  { a: 'amcha', b: 'together', level: 1, sup: 1, text: 'וינטר: ״ברור שלא נלך עם ליברמן ובנט״ – אף שמועמדי המפלגה אמרו באוקטובר שאינם מתחייבים לשבת רק עם נתניהו', src: ['walla-winter-0903', 'maariv-amcha-1006'] },
  { a: 'amcha', b: 'yb', level: 1, sup: 1, text: 'וינטר: ״ברור שלא נלך עם ליברמן ובנט״ – אך באוקטובר אמר מועמד המפלגה שליברמן ״יצטרך להחליט״ אם להצטרף לממשלה', src: ['walla-winter-0903', 'maariv-amcha-1006'] },
  { a: 'amcha', b: 'dem', level: 2, sup: 1, text: 'מועמד עמך ישראל על אנשי יאיר גולן וחותמי מכתב הטייסים: ״אנחנו לא נהיה שם איתם״', src: ['maariv-amcha-1006', 'inn-amcha-eisenkot', 'ji-winter'] },
  // אחר
  { a: 'likud', b: 'dem', level: 2, sup: 2, supExplicit: 'dem', text: 'גולן פוסל את הליכוד כולו, לא רק את נתניהו: ״אני אצביע בעד, בתנאי שהליכוד, סמוטריץ׳ ובן גביר לא שם״', src: ['kipa-golan'], cond: s => s.pm !== 'likud' }
];

/* מפלגות שהצהירו שלא ישבו בממשלה בראשות נתניהו.
   onlyIfNeeded: הסירוב חל רק כשהמפלגה הכרחית לרוב (״לא אשלים לנתניהו 61״) – בממשלה רחבה אין בעיה. */
const ANTI_BIBI = {
  together: { level: 2, sup: 1, text: 'בנט: ״אני לא אשב תחת נתניהו״', src: ['mako-bennett-netanyahu', 'toi-bennett-netanyahu'] },
  yashar: { level: 1, sup: 1, text: 'איזנקוט: ״ראש המפלגה הגדולה הוא המועמד לראשות הממשלה״ ודחה רוטציה; לא נמצאה פסילה מפורשת של ישיבה תחת נתניהו', src: ['maariv-eisenkot-principles', 'jpost-eisenkot-0924'] },
  yb: { level: 2, sup: 1, text: 'ליברמן: ״שיתהפך העולם – לא אשב עם נתניהו״', src: ['srugim-lieberman-netanyahu'] },
  dem: { level: 2, sup: 2, supExplicit: 'dem', text: 'גולן: ״לא אשב עם נתניהו, בן גביר וסמוטריץ׳״; ״אני אצביע בעד, בתנאי שהליכוד, סמוטריץ׳ ובן גביר לא שם״', src: ['jdn-golan-netanyahu', 'kipa-golan'] },
  reservists: { level: 2, sup: 2, supExplicit: true, onlyIfNeeded: true, text: 'הנדל: ״אני לא אשלים לנתניהו 61״ – ובממשלה הזו הוא הכרחי לרוב (לממשלה רחבה שנתניהו בה – יצטרף)', src: ['maariv-hendel-zionist', 'jpost-hendel-broad', 'kipa-hendel-unity'] },
  bw: { level: 2, sup: 2, supExplicit: true, onlyIfNeeded: true, text: 'גנץ: ״אני לא אתן לנתניהו את האצבע ה-61״ – ובממשלה הזו הוא הכרחי לרוב', src: ['srugim-gantz-blocs', 'jpost-gantz-aug'] }
};

/* מפלגות שהצהירו שימליצו רק על נתניהו */
const BIBI_ONLY = {
  amcha: { level: 1, sup: 1, text: 'וינטר ימליץ על נתניהו ושלל ממשלה בראשות איזנקוט (4.10) – אך יומיים אחר כך אמרו מועמדי המפלגה: ״לא אמרנו שנשב רק עם נתניהו״', src: ['toi-winter-1004', 'maariv-amcha-1006', 'inn-amcha-eisenkot'] }
};

/* מגבלות אישיות על מועמדים (r = מקום ברשימה, מתחיל מ-0).
   onlyPM: רשאי/צפוי לכהן רק כראש הממשלה. noMinister: פסול מכהונת שר (תפקידים פרלמנטריים – אפשריים). */
const PERSON_LIMITS = [
  { p: 'likud', r: 0, onlyPM: true, tag: 'רק ראש ממשלה', text: 'נתניהו נאשם בפלילים, ולפי הלכת דרעי-פנחסי יכול לכהן כראש ממשלה אך לא כשר (ב-2019 חדל מסיבה זו לכהן כשר בתיקיו); הוא גם לא צפוי להסכים לשום תפקיד מלבד ראשות הממשלה', src: ['ynet-netanyahu-ministries', 'he-wiki-deri-pinhasi'] },
  { p: 'shas', r: 0, noMinister: true, tag: 'פסול מכהונת שר', text: 'בג״ץ קבע ב-2023, ברוב של 10 מול 1, כי דרעי פסול מלכהן כשר', src: ['ynet-deri-hcj'] }
];

/* מקורות להודעות הכלליות במשחק ('method:<section>' = הסבר בחלון ״איך זה עובד?״) */
const NOTICE_SRC = {
  likudNotPM: ['ynet-netanyahu-ministries', 'kipa-likud-camp', 'law-gov', 'he-wiki-k22', 'he-wiki-35'],
  minorityIncentive: ['toi-eisenkot-raam', 'mako-eisenkot-abbas', 'maariv-raam-shoulder', 'toi-tibi-minority', 'he-wiki-25', 'mako-bibi-tibi', 'he-wiki-36'],
  blocBreak: ['kipa-likud-camp', 'law-gov', 'he-wiki-k22', 'he-wiki-35', 'srugim-unity'],
  jointMember: ['he-wiki-k13', 'idi-1992', 'toi-arab-2026'],
  minority: ['he-wiki-25', 'idi-1992', 'he-wiki-minority'],
  manyParties: ['he-wiki-36'],
  smallPM: ['he-wiki-36', 'he-wiki-bennett'],
  rotation: ['he-wiki-altpm', 'jpost-eisenkot-0924'],
  naturalBloc: ['he-wiki-37'],
  pact: ['jns-pact', 'schulman-pact'],
  shasEisenkot: ['walla-yosef-eisenkot', 'maariv-yosef-eisenkot', 'maariv-eisenkot-shas'],
  unity: ['srugim-unity', 'jpost-unity', 'jpost-eisenkot-0924'],
  noMajority: ['law-knesset', 'he-wiki-36', 'he-wiki-minority'],
  alloc: ['method:alloc', 'huji-gamson', 'he-wiki-bader-ofer'],
  senior: ['method:alloc', 'jdn-senior', 'maariv-2022-talks'],
  seniorSmall: ['maariv-2022-talks', 'he-wiki-37'],
  pivotal: ['method:score'],
  noTop: ['he-wiki-shas', 'he-wiki-utj', 'method:alloc'],
  order: ['method:order'],
  outsideKnesset: ['law-gov'],
  multi: ['walla-levin'],
  unfilled: ['law-gov', 'walla-vacant']
};

/* נוסח ההודעות הכלליות */
const NOTICE_TEXT = {
  likudNotPM: 'הליכוד בראשות נתניהו בממשלה שבראשה אחר אינו ריאלי: נתניהו לא צפוי לכהן בתפקיד אחר מלבד ראש הממשלה (וכנאשם אינו יכול לכהן כשר), והליכוד מציג אותו כמי שירכיב את הממשלה הבאה; גם בתרחיש האחדות שנדון, נתניהו אמור לכהן ראשון. כממשלה מכהנת, הליכוד יכול להעדיף בחירות חוזרות ולהמשיך לשלוט בממשלת מעבר – כפי שעשה ב-2019 וב-2020',
  minorityIncentive: 'בלי רוב יהודי, לאיזנקוט יש תמריץ להקים ממשלת מיעוט בתמיכה ערבית מבחוץ: כך הוא שובר את יתרון המכהן של הליכוד, שאחרת ימשיך לשלוט בממשלת מעבר. איזנקוט לא שלל זאת (את רע״ם הוציא רק מהממשלה עצמה), ורע״ם מוכנה ״לתת כתף״ – כמו חד״ש ומד״ע לממשלת רבין. המחיר: ממשלה פגיעה, וחשיפה למתקפת ״ביבי או טיבי״ בבחירות הבאות (ממשלת 2021, שנשענה על רע״ם, נפלה כעבור שנה)',
  blocBreak: 'שבירת הגוש: הליכוד הצהיר שיקים את הממשלה על בסיס מפלגות המחנה הלאומי. כממשלה מכהנת, הוא יכול להעדיף בחירות חוזרות ולהמשיך לשלוט בממשלת מעבר על פני ממשלה בלי שותפיו החרדים (תקדימי 2019 ו-2020) – אם כי דווח שנתניהו שוקל אחדות עם איזנקוט כשהוא ראשון ברוטציה',
  jointMember: 'מפלגות הרשימה המשותפת מעולם לא היו חברות בקואליציה (חד״ש תמכה מבחוץ בממשלת רבין); ב-2026 חד״ש ותע״ל צפויות לתמוך לכל היותר מבחוץ, ובל״ד מתנגדת לתמיכה בכל קואליציה בהובלה ציונית',
  naturalBloc: 'גוש הימין והחרדים – השותפות שהרכיבה את הממשלה ה-37',
  pact: 'ראשי ישר!, ביחד, ישראל ביתנו והדמוקרטים חתמו ב-26.9.2026 על הסכם לשיתוף פעולה ולהקמת ממשלה משותפת אחרי הבחירות',
  shasEisenkot: 'הרב יצחק יוסף: ״אפשרי שנלך עם איזנקוט בבחירות הקרובות״; איזנקוט רואה בש״ס ״שותפה בתנאי״',
  unity: 'ממשלת אחדות בין הגושים – תרחיש שדווח שנתניהו שוקל (ברוטציה, כשהוא ראשון), ואיזנקוט דוחה רוטציה'
};
