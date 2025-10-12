{
	"translatorID": "0c005619-2eb8-4741-90ce-4f0ebede4850",
	"label": "_Kluwer Arbitration Blog v2024-10-19",
	"creator": "Eric Mann",
	"target": "^https:\\/\\/arbitrationblog\\.kluwerarbitration\\.com\\/",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2024-10-19 19:14:36"
}

function detectWeb(doc, url) {
	if (url.match(/arbitrationblog\.kluwerarbitration\.com\/\d{4}\/\d{2}\/\d{2}\//)) {
		return "blogPost";
	}
	return false;
};

async function doWeb(doc, url) {
	let item = new Zotero.Item("blogPost");

	// Title / Titel
	let title = text(doc, ".entry-title");
	if (title == "") {
		title = "ERROR";
	};
	item.title = title;

	// Authors / Autoren
	for (let i = 0; i < 10; i++) {
		let author = text(doc, ".entry-meta .author", i);
		item.creators.push(ZU.cleanAuthor(author, 'author', false));
	};

	// Blog Title / Titel des Blogs
	item.blogTitle = "Kluwer Arbitration Blog";

	// Website Type / Art der Website
	// No idea what's supposed to go here...

	// Date / Datum
	let date = text(doc, ".entry-meta .entry-date.published");
	item.date = date;

	// URL / URL 
	item.url = url;

	// Language / Sprache
	let metaLocale = doc.querySelector('meta[property="og:locale"]');
	let localeContent = metaLocale ? metaLocale.content : "";
	item.language = localeContent;

	// Extra / Extra
	// No need identified so far.

	// Attachments / Anhänge
	let pdfUrl = attr(doc, ".pdfbutton", "href");
	item.attachments.push({
		title: "Kluwer Arbitration Blog PDF",
		mimeType: "application/pdf",
		url: pdfUrl
	});

	// Finish up
	item.complete();
};

/** BEGIN TEST CASES **/
var testCases = [
]
/** END TEST CASES **/
