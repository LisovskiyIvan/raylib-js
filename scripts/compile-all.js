import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const parentDir = __dirname;
const scriptFiles = fs.readdirSync(parentDir)
  .filter(file => file.endsWith('.js') && file !== 'compile-all.js' && file.includes('compile'))
  .map(file => path.join(parentDir, file));

async function runScriptsSequentially() {
  for (const scriptPath of scriptFiles) {
    console.log(`Running script: ${path.basename(scriptPath)}`);
    await new Promise((resolve, reject) => {
      const proc = spawn('bun', [scriptPath], { stdio: 'inherit' });
      
    proc.on('close', (code) => {
      if (code === 0) {
          console.log(`✅ ${path.basename(scriptPath)} completed successfully`);
        resolve();
      } else {
          reject(new Error(`Script ${path.basename(scriptPath)} exited with code ${code}`));
      }
    });
  });
  }
}

runScriptsSequentially()
  .then(() => {
  console.log('All scripts completed successfully');
  })
  .catch(err => {
  console.error('One or more scripts failed:', err);
    process.exit(1);
});
