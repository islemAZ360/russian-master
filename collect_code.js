const fs = require('fs');
const path = require('path');

// اسم الملف النصي الذي سيتم إنتاجه
const outputFileName = 'PROJECT_CODE_DUMP.txt';

// المجلدات التي سيتم تجاهلها (لتقليل حجم الملف)
const ignoreDirs = [
    'node_modules', 
    '.git', 
    '.next', 
    '.vscode', 
    'build', 
    'dist',
    'public' // يمكنك إزالة هذا إذا كنت تريد تضمين الصور، لكن لا ينصح به للملفات النصية
];

// الملفات التي سيتم تجاهلها
const ignoreFiles = [
    'package-lock.json', 
    'yarn.lock', 
    '.DS_Store', 
    '.env', 
    '.env.local',
    'collect_code.js', // نتجاهل هذا السكريبت نفسه
    outputFileName // نتجاهل ملف الخرج
];

// الامتدادات المسموح بها (لضمان أننا نقرأ أكواداً فقط وليس صوراً)
const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.html', '.md'];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (!ignoreFiles.includes(file) && allowedExtensions.includes(path.extname(file))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(__dirname);
let fileContent = "=== START OF PROJECT DUMP ===\n\n";

console.log(`🔍 جاري فحص الملفات... وجدنا ${allFiles.length} ملفاً.`);

allFiles.forEach(filePath => {
    try {
        const relativePath = path.relative(__dirname, filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        
        fileContent += `\n==================================================================\n`;
        fileContent += `FILE: ${relativePath}\n`;
        fileContent += `==================================================================\n\n`;
        fileContent += content + "\n\n";
        
        console.log(`✅ تمت قراءة: ${relativePath}`);
    } catch (err) {
        console.error(`❌ تعذر قراءة: ${filePath}`);
    }
});

fs.writeFileSync(outputFileName, fileContent);

console.log(`\n🎉 تم الانتهاء!`);
console.log(`📄 كل الكود موجود الآن في ملف اسمه: ${outputFileName}`);