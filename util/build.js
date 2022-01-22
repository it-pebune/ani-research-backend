const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');
const editJsonFile = require('edit-json-file');


try {
  // Remove current build
  fs.removeSync('./dist/');
  // Copy front-end files
  fs.copySync('./web.config', './dist/web.config');
  fs.copySync('./iisnode.yml', './dist/iisnode.yml');
  fs.copySync('./util/module-alias.js', './dist/index.js');
  fs.copySync('./package-lock.json', './dist/package-lock.json');
  // Transpile the typescript files
  childProcess.exec('tsc --build tsconfig.prod.json', (error) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    fs.copySync('./env/production.env', './dist/env/production.env');
    // Remove dev dependency
    const file = editJsonFile(path.join(__dirname, '../dist/package.json'));
    file.unset('devDependencies');
    file.unset('apidoc');
    file.unset('scripts.apidoc');
    file.unset('scripts.build');
    file.unset('scripts.deploy');
    file.unset('scripts.deploy-doc');
    file.unset('scripts.deploy-docpriv');
    file.unset('scripts.start:dev');
    file.unset('scripts.lint');
    file.unset('scripts.test');
    file.unset('scripts.start');
    file.save();
  });
} catch (err) {
  console.log(err);
}
