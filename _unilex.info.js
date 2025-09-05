{
	"translatorID": "c0b35821-4de6-4417-8469-793f837b4f9b",
	"label": "_unilex.info v2024-10-22",
	"creator": "Eric Mann",
	"target": "https:\\/\\/www\\.unilex\\.info\\/",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2024-10-22 12:10:17"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2024 Eric Mann

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


function detectWeb(doc, url) {
	// TODO: adjust the logic here
	if (url.includes('/case/')) {
		return 'case';
	}
	return false;
}


async function doWeb(doc, url) {
	var item = new Zotero.Item("case");
	item.title = "ERROR";
	var extras = "";

	for (let i = 0; i < 50; i++) {
		let left_column = text(doc, ".dl-horizontal > dt", i);
		let right_column = text(doc, ".dl-horizontal > dd", i);

		// Case Name
		if (left_column == "Parties:") {
			item.title = right_column;
		}

		// Court
		else if (left_column == "Court:") {
			item.court = right_column;
		}

		// Date
		else if (left_column == "Date:") {
			item.date = formatDate(right_column);
		}

		// Docket Number
		else if (left_column == "Number:") {
			item.docketNumber = right_column;
		}

		// Jurisdiction
		else if (left_column == "Country:") {
			let jurisdiction = right_column;
			extras += "jurisdiction: " + jurisdiction + "\n";
		}
	};

	// URL
	item.url = url;

	// Attachments
	/*item.attachments.push(
		{
			title: "HTML Snapshot",
			mimeType: "text/html",
			url: "https://www.unilex.info/cisg/case/121#abstract",   // Diese Unterseite zu öffnen und zu speichern klappt leider nicht.
			snapshot: true,
		}
	) */

	// Finalize item
	item.extra = extras;
	item.complete();
}


function formatDate(d) {
	d = d.replace("-01-", " Jan ");
	d = d.replace("-02-", " Feb ");
	d = d.replace("-03-", " Mar ");
	d = d.replace("-04-", " Apr ");
	d = d.replace("-05-", " May ");
	d = d.replace("-06-", " Jun ");
	d = d.replace("-07-", " Jul ");
	d = d.replace("-08-", " Aug ");
	d = d.replace("-09-", " Sep ");
	d = d.replace("-10-", " Oct ");
	d = d.replace("-11-", " Nov ");
	d = d.replace("-12-", " Dec ");
	return d;
}

/** BEGIN TEST CASES **/
var testCases = [
]
/** END TEST CASES **/
