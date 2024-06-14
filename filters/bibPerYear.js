const Cite = require('citation-js');
const Autolinker = require('autolinker');
const fs =require('fs');

/**
 * Load BibTeX references as objects
 *
 * @param {*} file BibTeX file
 * @returns
 */
module.exports = async function(file, minyear, maxyear) {

    let relativeFilePath = `.${file}`;
    let content = fs.readFileSync(relativeFilePath, 'utf8', function(err, cont) {
        if (err) {
            throw new Error(err);
        }
        return cont;
    });

    let bibtexCounter = 1;

    // Parse bibtex string
    const input = await Cite.inputAsync(content);

    // Citation.js required unique IDs, so make sure they're unique.
    // I've always used "src" as ID, showing my BibTex incompetence.
    input.map(e => e.id = bibtexCounter++);

    selection = input.filter(function(e) {
        if (! ('issued' in e && 'date-parts' in e.issued)) {
            throw new Error(e.title + " has no date");
        }

        let y = e.issued['date-parts'][0][0];

        return ((maxyear === undefined &&
                 y >= minyear) ||
                (maxyear !== undefined &&
                 y >= minyear &&
                 y <= maxyear));
    });

    // Put in Cite object and get HTML out of it!
    const data = new Cite(selection);
    const html = data.format('bibliography', {
        format: 'html',
        template: 'apa',
        lang: 'pt'
    });


    // Convert all links in the output HTML to actual <a> tags
    return Autolinker.link(html, {
        newWindow: true,
        email: false,
        phone: false,
        stripPrefix: false,
        stripTrailingSlash: false,
        className: "no-underline",
        replaceFn: function(match) {
            var tag = match.buildTag();
            tag.setInnerHtml("↗️");
            return tag;
        }
    });
};
