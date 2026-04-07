const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, '..', 'frontend', 'assets');

// Install sharp if not present
try {
    require('sharp');
} catch {
    console.log('Installing sharp...');
    execSync('npm install sharp --no-save', { cwd: __dirname, stdio: 'inherit' });
}

const sharp = require('sharp');

async function compress() {
    const iconPath = path.join(assetsDir, 'icon.png');
    const splashPath = path.join(assetsDir, 'splash-icon.png');
    const iconBackup = path.join(assetsDir, 'icon_original_backup.png');
    const splashBackup = path.join(assetsDir, 'splash-icon_original_backup.png');

    // --- Backup originals ---
    fs.copyFileSync(iconPath, iconBackup);
    fs.copyFileSync(splashPath, splashBackup);
    console.log('✅ Originals backed up.');

    const sizeBefore = {
        icon: fs.statSync(iconPath).size,
        splash: fs.statSync(splashPath).size,
    };

    // --- Compress icon.png ---
    // Keep 1024x1024 PNG, reduce to ~150KB
    await sharp(iconPath)
        .resize(1024, 1024, { fit: 'cover' })
        .png({ quality: 80, compressionLevel: 9, palette: false })
        .toBuffer()
        .then(buf => fs.writeFileSync(iconPath, buf));

    // --- Compress splash-icon.png ---
    // Keep full resolution, high quality JPEG-ish PNG
    await sharp(splashPath)
        .png({ quality: 75, compressionLevel: 9 })
        .toBuffer()
        .then(buf => fs.writeFileSync(splashPath, buf));

    const sizeAfter = {
        icon: fs.statSync(iconPath).size,
        splash: fs.statSync(splashPath).size,
    };

    const pct = (before, after) => Math.round((1 - after / before) * 100);

    console.log('\n📦 Compression Results:');
    console.log(`  icon.png      : ${(sizeBefore.icon/1024).toFixed(0)} KB → ${(sizeAfter.icon/1024).toFixed(0)} KB  (${pct(sizeBefore.icon, sizeAfter.icon)}% smaller)`);
    console.log(`  splash-icon.png: ${(sizeBefore.splash/1024).toFixed(0)} KB → ${(sizeAfter.splash/1024).toFixed(0)} KB  (${pct(sizeBefore.splash, sizeAfter.splash)}% smaller)`);
    console.log('\n✅ Done! Originals saved as icon_original_backup.png & splash-icon_original_backup.png');
}

compress().catch(console.error);
