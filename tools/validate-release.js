/* eslint-env node */
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pluginFile = fs.readFileSync(path.join(root, 'tarifexa.php'), 'utf8');
const readmePath = path.join(root, 'readme.txt');
const readme = fs.readFileSync(readmePath, 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function requiredMatch(content, pattern, label) {
    const match = content.match(pattern);
    if (!match) { throw new Error(`Missing ${label}.`); }
    return match[1].trim();
}

const pluginVersion = requiredMatch(pluginFile, /^ \* Version:\s*(.+)$/m, 'plugin version');
const stableTag = requiredMatch(readme, /^Stable tag:\s*(.+)$/mi, 'Stable Tag');
const textDomain = requiredMatch(pluginFile, /^ \* Text Domain:\s*(.+)$/m, 'text domain');
const testedUpTo = requiredMatch(pluginFile, /^ \* Tested up to:\s*(.+)$/m, 'Tested up to');
const readmeTested = requiredMatch(readme, /^Tested up to:\s*(.+)$/mi, 'readme Tested up to');

if (pluginVersion !== stableTag || pluginVersion !== packageJson.version) {
    throw new Error(`Version mismatch: plugin=${pluginVersion}, stable=${stableTag}, package=${packageJson.version}`);
}
if (testedUpTo !== readmeTested) {
    throw new Error(`Tested up to mismatch: plugin=${testedUpTo}, readme=${readmeTested}`);
}
if (textDomain !== 'tarifexa') {
    throw new Error(`Unexpected text domain: ${textDomain}`);
}
if (fs.statSync(readmePath).size >= 10240) {
    throw new Error('readme.txt must remain below 10 KB.');
}

const lines = readme.split(/\r?\n/);
const headerEnd = lines.findIndex((line, index) => index > 0 && line.trim() === '');
const shortDescription = lines[headerEnd + 1] || '';
if (!shortDescription || shortDescription.length > 150) {
    throw new Error(`The short description must contain 1–150 characters; found ${shortDescription.length}.`);
}

const tags = requiredMatch(readme, /^Tags:\s*(.+)$/mi, 'tags').split(',').map((tag) => tag.trim()).filter(Boolean);
if (tags.length < 1 || tags.length > 5) {
    throw new Error(`WordPress.org allows 1–5 tags; found ${tags.length}.`);
}

const requiredFiles = [
    'LICENSE',
    'README.md',
    'readme.txt',
    'uninstall.php',
    'languages/tarifexa.pot',
    'languages/tarifexa-en_US.po',
    'languages/tarifexa-en_US.mo',
    'languages/tarifexa-fa_IR.po',
    'languages/tarifexa-fa_IR.mo'
];
requiredFiles.forEach((file) => {
    if (!fs.existsSync(path.join(root, file))) { throw new Error(`Missing release file: ${file}`); }
});

const publicFiles = [
    'tarifexa.php',
    'readme.txt',
    'uninstall.php',
    'includes/class-tarifexa.php',
    'templates/calculator.php',
    'assets/js/tarifexa-i18n.js',
    'assets/js/tarifexa-engine.js',
    'assets/js/tarifexa-ui.js',
    'assets/css/tarifexa.css'
];
publicFiles.forEach((file) => {
    const content = fs.readFileSync(path.join(root, file), 'utf8');
    if (/iran[\s_-]*karshenas|irankarshenas/i.test(content)) {
        throw new Error(`Disallowed legacy project name in ${file}.`);
    }
    if (/[A-Z]:\\(?:Users|Program Files)\\/i.test(content)) {
        throw new Error(`Local Windows path found in ${file}.`);
    }
    if (/\bload_plugin_textdomain\s*\(/.test(content)) {
        throw new Error(`Discouraged load_plugin_textdomain() call found in ${file}.`);
    }
});

console.log(`Release metadata valid for Tarifexa ${pluginVersion}.`);
console.log(`WordPress ${testedUpTo}; ${tags.length} tags; readme ${fs.statSync(readmePath).size} bytes.`);
