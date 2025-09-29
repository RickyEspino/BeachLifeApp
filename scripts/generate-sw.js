/* eslint-disable @typescript-eslint/no-require-imports */
const workboxBuild = require('workbox-build');
const path = require('path');

(async () => {
  try {
    const swDest = path.join(__dirname, '..', 'public', 'sw-generated.js');
    const { count, size } = await workboxBuild.injectManifest({
      swSrc: path.join(__dirname, 'sw-template.js'),
      swDest,
      globDirectory: path.join(__dirname, '..', 'public'),
      globPatterns: [
        '**/*.{html,js,css,png,svg,json}'
      ],
    });
    console.log(`Generated ${swDest}, which will precache ${count} files, totaling ${size} bytes.`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
