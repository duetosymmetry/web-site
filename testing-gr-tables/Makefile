all: biblio.json biblio-filtered.json

biblio.json: biblio.bib
	node Bib2JSON.js $^ $@

biblio-filtered.json: biblio.bib tableRefs.json
	node Bib2JSON-filtered.js $^ $@

tableRefs.json: tables.json
	node collectTableRefs.js $^ > $@
