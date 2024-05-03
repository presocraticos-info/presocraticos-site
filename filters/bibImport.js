const Cite = require('citation-js');
const Autolinker = require('autolinker');
const fs =require('fs');

/**
 * Converts Bibtex references into APA-styled HTML.
 *
 * @param {*} file BibTeX file
 * @returns
 */
module.exports = async function(filelist) {
    files = filelist.split("\n").filter(Boolean);

    content = files.map((f) => {
        let relativeFilePath = `.${f}`;
        let c = fs.readFileSync(relativeFilePath, 'utf8', function(err, cont) {
            if (err) {
                throw new Error(err);
            }
            return cont;
        });

        return c;
    }).join("\n");


    let bibtexCounter = 1;

    // Parse bibtex string
    const input = await Cite.inputAsync(content);

    // Citation.js required unique IDs, so make sure they're unique.
    // I've always used "src" as ID, showing my BibTex incompetence.
    input.map(e => e.id = bibtexCounter++);


    // Put in Cite object and get HTML out of it!
    const data = new Cite(input);
    const html = data.format('bibliography', {
        format: 'html',
        template: 'apa',
        lang: 'en-US'
    });


    // Convert all links in the output HTML to actual <a> tags
    return Autolinker.link(html, {
        newWindow: true,
        email: false,
        phone: false,
        stripPrefix: false,
        stripTrailingSlash: false,
        className: "no-underline",
    });
};
