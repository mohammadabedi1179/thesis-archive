/* ══════════════════════════════════════════════════════════════
   نقشه‌راه — data registry
   This is the ONLY file you need to edit to add a new document
   once its .html export is sitting in /diagrams.
   See README.md for the exact steps.
   ══════════════════════════════════════════════════════════════ */

const CHAPTERS = [
  { id: 'ch3',      num: '۳', title: 'روش پژوهش و چهارچوب پیشنهادی',
    blurb: 'یادگیری تقویتی، فرمول‌بندی فرآیند تصمیم مارکوف و مقایسه الگوریتم‌ها' },
  { id: 'ch4',      num: '۴', title: 'طراحی و شبیه‌سازی',
    blurb: 'معماری سامانه، مدل ربات، فضای حالت و عمل، و طراحی عامل یادگیری تقویتی' },
  { id: 'ch5',      num: '۵', title: 'پیاده‌سازی عملی، ساخت نمونه و آزمون‌های واقعی',
    blurb: 'سخت‌افزار، لایه ادراک واقعی، کالیبراسیون و آزمون‌های میدانی' },
  { id: 'ch6',      num: '۶', title: 'ارزیابی و تحلیل نتایج',
    blurb: 'نتایج شبیه‌سازی، معیارهای آموزش و عملکرد در سناریوهای آزمون' },
  { id: 'appendix', num: 'پ', title: 'پیوست‌ها',
    blurb: 'مستندات تکمیلی و مواد پشتیبان' },
  { id: 'extra',    num: '+', title: 'موارد اضافی',
    blurb: 'ابزارها و تحلیل‌های جانبی خارج از ساختار اصلی متن' }
];

const ITEMS = [
  { id: 'apriltag-goal-cube', title: 'مکعب برچسب‌های AprilTag',
    subtitle: 'رمزگذاری هدف با برچسب‌های سه‌بعدی روی جعبه — نگاشت وجه به شناسه',
    file: 'apriltag-goal-cube.html', chapter: 'ch5', lang: 'fa' },

  { id: 'acquisition-pipeline', title: 'خط لوله دریافت تصویر استریو',
    subtitle: 'از دوربین تا شبکه — مسیر داده تصویر خام دو دوربینه',
    file: 'acquisition-pipeline-diagram.html', chapter: 'ch5', lang: 'fa' },

  { id: 'depth-accuracy', title: 'دقت نقشهٔ عمق',
    subtitle: 'تحلیل تعاملی خطای برآورد عمق استریو',
    file: 'depth-accuracy-interactive.html', chapter: 'ch5', lang: 'en' },

  { id: 'desk-quat-yaw', title: 'مقایسهٔ Yaw واحد اینرسی',
    subtitle: 'آزمون رومیزی مقایسهٔ زاویهٔ هدینگ حسگر IMU',
    file: 'desk-quat-yaw-comparison.html', chapter: 'ch5', lang: 'en' },

  { id: 'power-system', title: 'معماری سیستم توان و الکترونیک',
    subtitle: 'نقشهٔ کامل تغذیه، مبدل‌ها و اتصالات الکتریکی اسکوتر',
    file: 'power-system-diagram.html', chapter: 'ch5', lang: 'fa' },

  { id: 'sensor-control-system', title: 'معماری حسگری و کنترلی',
    subtitle: 'نقشهٔ اتصال حسگرها، رزبری‌پای و آردوینو در سامانهٔ واقعی',
    file: 'sensor-control-system-diagram.html', chapter: 'ch5', lang: 'fa' },

  { id: 'yuv-pipeline', title: 'استخراج صفحهٔ Y',
    subtitle: 'مرحلهٔ پردازش تصویر خام YUV دوربین استریو',
    file: 'yuv-pipeline-diagram.html', chapter: 'ch5', lang: 'fa' },

  { id: 'point-cloud-pipeline', title: 'از تصویر استریو تا ابرنقاط',
    subtitle: 'زنجیرهٔ تولید ابرنقاط برای لایهٔ ادراک',
    file: 'point-cloud-pipeline-diagram.html', chapter: 'ch4', lang: 'fa' },

  { id: 'state-representation', title: 'حلقهٔ تعامل کنشگر و محیط',
    subtitle: 'فضای حالت عامل یادگیری تقویتی — دوربین، فراصوت و IMU',
    file: 'state-representation-diagram.html', chapter: 'ch4', lang: 'fa' },

  { id: 'stereo-vision-pipeline', title: 'خط لولهٔ پردازش تصویر استریو',
    subtitle: 'نقشهٔ اختلاف دید، تشخیص اشیا و تخمین سرعت با فیلتر کالمن',
    file: 'stereo-vision-pipeline-diagram.html', chapter: 'ch4', lang: 'fa' },

  { id: 'skid-steering-comparison', title: 'مقایسهٔ چرخش Skid-Steering',
    subtitle: 'در برابر چرخش دیفرانسیلی ایده‌آل — مدل حرکتی ربات',
    file: 'skid-steering-comparison.html', chapter: 'ch4', lang: 'fa' },

  { id: 'tf-tree-3d-view', title: 'نمای سه‌بعدی درخت TF',
    subtitle: 'چارچوب‌های مرجع چرخ‌ها و شاسی در مدل ربات',
    file: 'tf-tree-3d-view.html', chapter: 'ch4', lang: 'fa' }
];
