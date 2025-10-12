const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const parentDir = path.dirname(__dirname + "/scripts");
const scriptFiles = fs.readdirSync(parentDir)
  .filter(file => file.endsWith('.js') && file !== 'compile-all.js')
  .map(file => path.join(parentDir, file));

console.log(parentDir);
  console.log(scriptFiles);

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
