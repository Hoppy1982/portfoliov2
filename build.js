const browserify = require('browserify')
const fs = require('fs')
const path = require('path')
const SOURCEJSDIR = path.join(__dirname, '/client/static/source-js/')
const BUNDLEDJSDIR = path.join(__dirname, '/client/static/bundled-js/')

//first clear out old bundles
fs.readdir(BUNDLEDJSDIR, (err, files) => {
  if (err) throw err

  for (let file of files) {
    fs.unlink(BUNDLEDJSDIR + file, err => {
      if (err) throw err
      console.log(`${file} deleted..`)
    })
  }
})

//create a bundle for each source file
fs.readdir(SOURCEJSDIR, (err, files) => {
  if (err) throw err

  let filteredFiles = files.filter(file => file.match(/\.js$/))

  for (let filteredFile of filteredFiles) {
    let browserifyObj = browserify({entries: SOURCEJSDIR + filteredFile, debug: true})

    browserifyObj.bundle((err, buff) => {

      fs.writeFile(BUNDLEDJSDIR + 'bundled-' + filteredFile, buff, () => {
        console.log('file bundled..')
      })

    }).on('error',function(err) {
      console.log("!BUILD ERROR!")
      console.log(err)
    })
  }
})
