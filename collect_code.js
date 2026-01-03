const fs = require('fs');
const path = require('path');

/**
 * AI Context Builder v3.0
 * سكريبت لتجهيز كود المشروع للذكاء الاصطناعي مع توضيح الهيكلية والملفات غير النصية.
 */

const outputFileName = 'PROJECT_CODE_DUMP.txt';

// 1. المجلدات التي سيتم تجاهلها تماماً (لن تظهر في الهيكل ولا في المحتوى)
const ignoreDirs = [
    'node_modules',
    '.git',
    '.next',
    '.vscode',
    'build',
    'dist',
    'coverage',
    '.firebase' // إذا كنت تستخدم firebase
];

// 2. الملفات التي سيتم تجاهلها تماماً
const ignoreFiles = [
    'collect_code.js',
    outputFileName,
    'package-lock.json',
    'yarn.lock',
    '.DS_Store',
    'thumbs.db',
    '.env',
    '.env.local' // حماية للمفاتيح السرية
];

// 3. الامتدادات التي سيتم قراءة "الكود" بداخلها
const textExtensions = [
    '.js', '.jsx', '.ts', '.tsx', 
    '.css', '.scss', '.sass', '.less',
    '.html', '.json', 
    '.md', '.txt', 
    '.mjs', '.cjs', 
    '.xml', '.svg' // الـ SVG نصي ويمكن قراءته
];

// دالة لمعرفة هل نتجاهل هذا المسار أم لا
function isIgnored(entryName) {
    return ignoreDirs.includes(entryName) || ignoreFiles.includes(entryName);
}

// دالة لرسم شجرة الملفات (الهيكلية)
function generateFileTree(dir, prefix = '') {
    let output = '';
    const items = fs.readdirSync(dir);
    
    // ترتيب: المجلدات أولاً ثم الملفات
    items.sort((a, b) => {
        const aStat = fs.statSync(path.join(dir, a));
        const bStat = fs.statSync(path.join(dir, b));
        if (aStat.isDirectory() && !bStat.isDirectory()) return -1;
        if (!aStat.isDirectory() && bStat.isDirectory()) return 1;
        return a.localeCompare(b);
    });

    const filteredItems = items.filter(item => !isIgnored(item));

    filteredItems.forEach((item, index) => {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        const isLast = index === filteredItems.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        
        output += `${prefix}${connector}${item}\n`;

        if (stats.isDirectory()) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            output += generateFileTree(fullPath, newPrefix);
        }
    });

    return output;
}

// دالة لجمع الملفات للمعالجة
function getAllFilesRecursively(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(function(file) {
        if (isIgnored(file)) return;

        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            getAllFilesRecursively(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

// --- التنفيذ الرئيسي ---

try {
    console.log("🚀 جاري تحليل هيكلية المشروع...");
    
    let finalContent = "";

    // الجزء الأول: هيكلية المشروع (Project Structure)
    const treeStructure = generateFileTree(__dirname);
    finalContent += `==================================================================\n`;
    finalContent += `PROJECT STRUCTURE (هيكل الملفات)\n`;
    finalContent += `Generated on: ${new Date().toLocaleString()}\n`;
    finalContent += `==================================================================\n\n`;
    finalContent += `(ROOT)\n${treeStructure}\n`;
    finalContent += `\n\n`;

    // الجزء الثاني: محتوى الملفات (File Contents)
    console.log("📦 جاري تجميع محتوى الملفات...");
    const allFiles = getAllFilesRecursively(__dirname);
    
    finalContent += `==================================================================\n`;
    finalContent += `FILE CONTENTS (محتوى الملفات)\n`;
    finalContent += `Total Files Scanned: ${allFiles.length}\n`;
    finalContent += `==================================================================\n\n`;

    allFiles.forEach((filePath, index) => {
        const relativePath = path.relative(__dirname, filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        finalContent += `\n------------------------------------------------------------------\n`;
        finalContent += `FILE: ${relativePath}\n`;
        finalContent += `------------------------------------------------------------------\n`;

        if (textExtensions.includes(ext)) {
            // إذا كان ملف نصي/كود، اقرأ المحتوى
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                finalContent += content + "\n";
            } catch (err) {
                finalContent += `[ERROR: Could not read text file]\n`;
            }
        } else {
            // إذا كان صورة أو ملف غير نصي، اكتفِ بذكر وجوده
            const size = (fs.statSync(filePath).size / 1024).toFixed(2);
            finalContent += `[ASSET/BINARY FILE DETECTED]\n`;
            finalContent += `Type: ${ext}\n`;
            finalContent += `Size: ${size} KB\n`;
            finalContent += `(Content skipped to preserve text format)\n`;
        }
    });

    fs.writeFileSync(outputFileName, finalContent, 'utf8');

    console.log(`\n✅ تمت العملية بنجاح!`);
    console.log(`📄 تم حفظ الهيكل والكود في: ${outputFileName}`);
    console.log(`👉 ارفع هذا الملف الآن للذكاء الاصطناعي.`);

} catch (e) {
    console.error("❌ حدث خطأ:", e.message);
}