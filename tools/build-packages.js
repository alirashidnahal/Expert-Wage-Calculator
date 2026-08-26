/* eslint-env node */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const pluginRoot = path.resolve(__dirname, '..');
const packageSlug = 'tarifexa';
const outDir = process.env.TARIFEXA_DIST_DIR
    ? path.resolve(process.env.TARIFEXA_DIST_DIR)
    : path.join(pluginRoot, 'dist');

const sharedDirectories = ['assets', 'includes', 'languages', 'templates'];
const wordpressOrgFiles = [
    'tarifexa.php',
    'readme.txt',
    'uninstall.php',
    'LICENSE'
];
const installExtraFiles = [
    'readme-fa_IR.txt',
    'CHANGELOG.md'
];

function readPluginVersion() {
    const header = fs.readFileSync(path.join(pluginRoot, 'tarifexa.php'), 'utf8');
    const match = header.match(/^ \* Version:\s*(.+)$/m);
    if (!match) {
        throw new Error('Missing Version header in tarifexa.php.');
    }
    return match[1].trim();
}

function ensureCleanDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
}

function copyFile(relativePath, destinationRoot) {
    const source = path.join(pluginRoot, relativePath);
    if (!fs.existsSync(source)) {
        throw new Error(`Missing required package file: ${relativePath}`);
    }
    fs.copyFileSync(source, path.join(destinationRoot, path.basename(relativePath)));
}

function copyDirectory(relativePath, destinationRoot) {
    const source = path.join(pluginRoot, relativePath);
    if (!fs.existsSync(source)) {
        throw new Error(`Missing required package directory: ${relativePath}`);
    }
    fs.cpSync(source, path.join(destinationRoot, relativePath), { recursive: true });
}

function stagePackage(stageRoot, extraFiles) {
    const pluginDir = path.join(stageRoot, packageSlug);
    ensureCleanDir(pluginDir);

    sharedDirectories.forEach((directory) => {
        copyDirectory(directory, pluginDir);
    });
    wordpressOrgFiles.forEach((file) => {
        copyFile(file, pluginDir);
    });
    extraFiles.forEach((file) => {
        copyFile(file, pluginDir);
    });

    assertNoDisallowedPaths(pluginDir);
    return pluginDir;
}

function assertNoDisallowedPaths(pluginDir) {
    const disallowed = [
        '.git',
        '.github',
        '.wordpress-org',
        'docs',
        'node_modules',
        'tests',
        'tools',
        'vendor',
        'package.json',
        '.distignore',
        '.gitignore',
        '.gitattributes'
    ];

    disallowed.forEach((relative) => {
        if (fs.existsSync(path.join(pluginDir, relative))) {
            throw new Error(`Disallowed path leaked into package: ${relative}`);
        }
    });

    const phpFiles = [];
    const walk = (dir) => {
        fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
                return;
            }
            if (entry.name.endsWith('.php') || entry.name.endsWith('.js') || entry.name.endsWith('.css') || entry.name.endsWith('.txt')) {
                phpFiles.push(full);
            }
        });
    };
    walk(pluginDir);

    phpFiles.forEach((file) => {
        const content = fs.readFileSync(file, 'utf8');
        if (/[A-Z]:\\(?:Users|Program Files)\\/i.test(content)) {
            throw new Error(`Local Windows path found in packaged file: ${path.relative(pluginDir, file)}`);
        }
    });
}

function createZip(sourcePluginDir, zipPath) {
    fs.mkdirSync(path.dirname(zipPath), { recursive: true });
    fs.rmSync(zipPath, { force: true });

    const parent = path.dirname(sourcePluginDir);
    const folderName = path.basename(sourcePluginDir);

    if (process.platform === 'win32') {
        execFileSync(
            'powershell.exe',
            [
                '-NoProfile',
                '-NonInteractive',
                '-Command',
                `Compress-Archive -LiteralPath '${sourcePluginDir.replace(/'/g, "''")}' -DestinationPath '${zipPath.replace(/'/g, "''")}'`
            ],
            { stdio: 'inherit' }
        );
        return;
    }

    const result = spawnSync('zip', ['-r', '-q', zipPath, folderName], {
        cwd: parent,
        stdio: 'inherit'
    });
    if (result.status !== 0) {
        throw new Error(`zip failed for ${zipPath}`);
    }
}

function assertZipStructure(zipPath) {
    if (process.platform === 'win32') {
        return;
    }

    const listing = execFileSync('zipinfo', ['-1', zipPath], { encoding: 'utf8' });
    const entries = listing.split(/\r?\n/).filter(Boolean);
    if (!entries.some((entry) => entry === `${packageSlug}/tarifexa.php`)) {
        throw new Error(`${path.basename(zipPath)} is missing ${packageSlug}/tarifexa.php.`);
    }
    if (entries.some((entry) => entry.startsWith(`${packageSlug}/${packageSlug}/`))) {
        throw new Error(`${path.basename(zipPath)} contains a nested ${packageSlug}/${packageSlug}/ path.`);
    }
    if (entries.some((entry) => entry.includes('.git/') || entry.includes('.github/') || entry.includes('node_modules/'))) {
        throw new Error(`${path.basename(zipPath)} contains development paths.`);
    }
}

function packageSizeLimit(zipPath, maxBytes) {
    const size = fs.statSync(zipPath).size;
    if (size >= maxBytes) {
        throw new Error(`${path.basename(zipPath)} is ${size} bytes; WordPress.org expects under ${maxBytes} bytes.`);
    }
    return size;
}

function main() {
    const version = readPluginVersion();
    ensureCleanDir(outDir);

    const stageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tarifexa-package-'));
    try {
        const wordpressOrgDir = stagePackage(path.join(stageRoot, 'wordpress-org'), []);
        const installDir = stagePackage(path.join(stageRoot, 'install'), installExtraFiles);

        const wordpressOrgZip = path.join(outDir, `tarifexa-wordpress-org-${version}.zip`);
        const installZip = path.join(outDir, `tarifexa-install-${version}.zip`);

        createZip(wordpressOrgDir, wordpressOrgZip);
        createZip(installDir, installZip);

        if (process.platform !== 'win32') {
            assertZipStructure(wordpressOrgZip);
            assertZipStructure(installZip);
        }

        const wordpressOrgSize = packageSizeLimit(wordpressOrgZip, 10 * 1024 * 1024);
        const installSize = fs.statSync(installZip).size;

        const manifest = {
            version,
            slug: packageSlug,
            packages: {
                'wordpress-org': {
                    file: path.basename(wordpressOrgZip),
                    path: wordpressOrgZip,
                    bytes: wordpressOrgSize,
                    purpose: 'WordPress.org Plugins Directory / SVN trunk submission',
                    topLevelDirectory: packageSlug,
                    includes: wordpressOrgFiles.concat(sharedDirectories)
                },
                install: {
                    file: path.basename(installZip),
                    path: installZip,
                    bytes: installSize,
                    purpose: 'Direct upload via WordPress Plugins > Add New > Upload Plugin',
                    topLevelDirectory: packageSlug,
                    includes: wordpressOrgFiles.concat(installExtraFiles, sharedDirectories)
                }
            }
        };

        fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

        console.log(`Built WordPress.org ZIP: ${wordpressOrgZip} (${wordpressOrgSize} bytes)`);
        console.log(`Built install ZIP: ${installZip} (${installSize} bytes)`);
        console.log(`Version: ${version}`);
    } finally {
        fs.rmSync(stageRoot, { recursive: true, force: true });
    }
}

main();
