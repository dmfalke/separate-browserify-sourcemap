'use strict';

var path        =  require('path')
  , fs          =  require('fs')
  , browserify  =  require('browserify')
  , mold        =  require('mold-source-map')
  , bundlePath  =  path.join(__dirname, '..', 'bundle.js')
    // putting map file right next to bundle file
  , mapFilePath =  bundlePath +  '.map'
  , jsRoot      =  path.join(__dirname, '..', 'src');

function mapFileUrlComment(sourcemap, cb) {
  
  // make source files appear under the following paths:
  // /js
  //    foo.js
  //    main.js
  // /js/wunder
  //    bar.js 
  
  sourcemap.sourceRoot('src'); 
  sourcemap.mapSources(mold.mapPathRelativeTo(jsRoot));
  sourcemap.file('bundle.js');

  // write map file and return a sourceMappingUrl that points to it
  fs.writeFile(mapFilePath, sourcemap.toJSON(2), 'utf-8', function (err) {
    if (err) return console.error(err);
    // Giving just a filename instead of a path will cause the browser to look for the map file 
    // right next to where it loaded the bundle from.
    // Therefore this way the map is found no matter if the page is served or opened from the filesystem.
    cb('//# sourceMappingURL=' + path.basename(mapFilePath));
  });
}

browserify()
  .require(require.resolve('../src'), { entry: false })
  .bundle({ debug: true })
  .on('error', function (err) { console.error(err); })
  .pipe(mold.transform(mapFileUrlComment))
  .pipe(fs.createWriteStream(bundlePath));

console.log('An external map file was generated at: ', path.relative(process.cwd(), mapFilePath));
