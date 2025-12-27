const fs = require('fs');
const path = require('path');

// قائمة الملفات المراد حذفها
const filesToDelete = [
  "components/games/AudioIntercept.jsx",
  "components/games/FlashProtocol.jsx",
  "components/games/LogicGate.jsx",
  "components/games/RapidProtocol.jsx",
  "components/games/ReactorCore.jsx",
  "components/games/SyntaxHack.jsx",
  "components/ScrambleGame.jsx"
];

console.log("🚀 بدء عملية تنظيف الألعاب...");

filesToDelete.forEach((file) => {
  const filePath = path.join(__dirname, file);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ تم حذف: ${file}`);
    } else {
      console.log(`⚠️ الملف غير موجود (تم التخطي): ${file}`);
    }
  } catch (error) {
    console.error(`❌ خطأ أثناء حذف ${file}:`, error.message);
  }
});

console.log("✨ انتهت العملية! بقيت فقط لعبة الساعة.");