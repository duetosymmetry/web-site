var fs     = require('fs'),
    Parser = require('./Parser');

if (process.argv.length < 4) {
  console.log('Usage: node Bib2JSON-filtered.js <bibtex file> <output JSON file>');
  process.exit(1);
}

var tableRefs = JSON.parse(fs.readFileSync(process.argv[3]));

fs.readFile(process.argv[2], 'utf-8', function(err, data) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  var result = Parser(data);
  var entries = result.entries;
  var errors = result.errors;

  if (errors.length) console.error(errors);

  // filter
  entries = entries.filter(function(entry) {
    return tableRefs.includes(entry.EntryKey);
  });

  entries = JSON.stringify(entries,null,1);

  if (process.argv[4]) {
    console.log('Read', data.length, 'bytes from', process.argv[1]);
    fs.writeFileSync(process.argv[4], entries);
  }
  else console.info(entries);
})
