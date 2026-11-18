import {
  cpSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import { screens } from "../src/prototype/catalog";
const root = "delivery/forma-uiux";
rmSync("delivery", { recursive: true, force: true });
mkdirSync(`${root}/website`, { recursive: true });
for (const name of [
  "src",
  "scripts",
  "figma-plugin",
  "public",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
  "index.html",
  "README.md",
  ".gitignore",
])
  cpSync(name, `${root}/${name}`, { recursive: true });
cpSync("dist", `${root}/website`, { recursive: true });
let html = readFileSync("dist/index.html", "utf8");
html = html.replace(
  /<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/,
  (_, path) =>
    `<script type="module">${readFileSync(`dist/${path.replace(/^\.\//, "").replace(/^\//, "")}`, "utf8").replaceAll("</script", "<\\/script")}</script>`,
);
html = html.replace(
  /<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/,
  (_, path) =>
    `<style>${readFileSync(`dist/${path.replace(/^\.\//, "").replace(/^\//, "")}`, "utf8")}</style>`,
);
writeFileSync(`${root}/website/OPEN-ME.html`, html);
cpSync("public/design/forma-design.json", `${root}/forma-design.json`);
const readme = `# حزمة Forma UI/UX\n\n## جرّبي الموقع فوراً\nافتحي website/OPEN-ME.html بمتصفح حديث. لا يحتاج npm أو خادم. إذا منع المتصفح تنزيل JSON من ملف محلي، استخدمي forma-design.json الموجود بجانب هذا الملف. الخطوط الخارجية اختيارية؛ التصميم يعمل بخط بديل بدون إنترنت.\n\n## التعديل على Figma\nملف JSON تنسيق خاص بالمشروع، وليس ملف Figma أصلياً ولا يفتح بالسحب المباشر.\n1. افتحي Figma Desktop وملف Design جديداً.\n2. من Plugins → Development → New Plugin أنشئي إضافة Figma Design محلية للحصول على id. انسخي قيمة id من manifest المُولّد إلى figma-plugin/manifest.json، ثم اختاري Import plugin from manifest. التفاصيل في figma-plugin/README.md. يتطلب ذلك صلاحية إضافات التطوير.\n3. شغّلي Forma importer، واختاري forma-design.json.\n4. الإضافة تنشئ ${screens.length} شاشة Desktop و${screens.length} شاشة Mobile كطبقات نصوص وأشكال قابلة للتعديل وروابط Prototype.\n5. اختاري إطار Overview واضغطي Present لتجربة الروابط. يمكن تعديل أي نص أو شكل أو رابط.\n\nالتصميم في Figma إعادة بناء بطبقات أصلية، وليس نسخة بكسلية مطابقة للمتصفح. إدخالات النماذج والبحث وحفظ البيانات تعمل بالموقع فقط؛ Figma يعرض حالات الانتقال المصممة. لم يُختبر الاستيراد داخل محرر Figma بحساب فعلي، لذا راجعي نتيجة الاستيراد قبل الاعتماد عليها للتسليم النهائي.\n\n## تشغيل وتطوير المصدر\nثبّتي Node.js 22.12+، ثم npm ci ثم npm run dev. الاختبارات: npm test. بناء الموقع والتصميم والحزمة: npm run deliver.\n\n## حدود التسليم\nهذا تسليم UI/UX تفاعلي، وليس SaaS بخادم حقيقي. تسجيل الدخول وOTP والصوت والفيديو والدفع وOAuth والتسجيل والإشعارات محاكاة، ولا يتم الاتصال بخدمات خارجية. الأدوار شاشات عرض وليست حدود صلاحيات أمنية. لا تدخلي بيانات حقيقية. لا توجد مفاتيح سرية داخل الحزمة.\n\nراجعي SCREEN-MAP.md لقائمة كل شاشة وروابطها.\n`;
writeFileSync(`${root}/START-HERE-AR.md`, readme);
writeFileSync(
  `${root}/SCREEN-MAP.md`,
  "# Screen and prototype inventory\n\n" +
    screens
      .map(
        (s) =>
          `## ${s.title} (${s.id})\nSection: ${s.section} · Type: ${s.kind}\n\n${s.description}\n\n${s.actions.map((a) => `- ${a.label} → ${a.target}`).join("\n")}\n`,
      )
      .join("\n"),
);
execFileSync("zip", ["-qr", "../Forma-UIUX-Complete.zip", "forma-uiux"], {
  cwd: "delivery",
});
if (!existsSync("Forma-UIUX-Complete.zip")) throw Error("ZIP missing");
console.log(
  `Packaged ${screens.length} screens, website, source, JSON, Figma importer and Arabic instructions.`,
);
