const fs = require('node:fs');
const path = require('node:path');

const DATA_FILES = [
  'wellVisit.json',
  'sickVisit.json',
  'examFindings.json',
  'apLibrary.json',
  'inbox.json',
  'corrections.json',
  'preferences.json'
];

function getDefaultDataDir() {
  if (process.env.VITE_DEV_SERVER_URL) {
    return path.join(__dirname, '..', 'data');
  }
  return path.join(process.resourcesPath, 'data');
}

function ensureUserDataDir(baseUserDataPath) {
  const userDataDir = path.join(baseUserDataPath, 'userData');
  fs.mkdirSync(userDataDir, { recursive: true });
  return userDataDir;
}

function parseJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function ensureUserDataFiles(baseUserDataPath) {
  const defaultDir = getDefaultDataDir();
  const userDataDir = ensureUserDataDir(baseUserDataPath);

  for (const fileName of DATA_FILES) {
    const targetPath = path.join(userDataDir, fileName);
    if (!fs.existsSync(targetPath)) {
      const sourcePath = path.join(defaultDir, fileName);
      const sourceJson = parseJson(sourcePath);
      writeJson(targetPath, sourceJson);
    }
  }

  return userDataDir;
}

function loadAllData(userDataDir) {
  return DATA_FILES.reduce((acc, fileName) => {
    const key = fileName.replace('.json', '');
    acc[key] = parseJson(path.join(userDataDir, fileName));
    return acc;
  }, {});
}

function saveDataFile(userDataDir, key, nextValue) {
  const fileName = `${key}.json`;
  if (!DATA_FILES.includes(fileName)) {
    throw new Error(`Unknown data key: ${key}`);
  }

  writeJson(path.join(userDataDir, fileName), nextValue);
}

module.exports = {
  DATA_FILES,
  ensureUserDataFiles,
  loadAllData,
  saveDataFile
};
