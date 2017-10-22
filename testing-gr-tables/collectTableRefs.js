var fs = require('fs');

if (process.argv.length < 3) {
  console.log('Usage: node collectTableRefs.js <table JSON file>');
  process.exit(1);
}

var table = JSON.parse(fs.readFileSync(process.argv[2]));

var bibKeys = [];

for (theory in table) {
  for (prop in table[theory]) {
    if ((table[theory][prop] instanceof Object) && ('refs' in table[theory][prop])){
      bibKeys = bibKeys.concat(table[theory][prop]['refs']);
    }
  }
}

uniqueBibKeys = bibKeys.filter(function(item, pos, self) {
    return self.indexOf(item) == pos;
});

console.log(JSON.stringify(uniqueBibKeys,null,1));
