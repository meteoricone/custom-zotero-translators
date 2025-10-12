{
	"translatorID": "3870bf64-286f-40e9-b819-eba84228d672",
	"label": "_Pace IICL v2024-10-30",
	"creator": "",
	"target": "^https:\\/\\/iicl\\.law\\.pace\\.edu\\/cisg\\/case\\/",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2024-10-30 08:56:38"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2024 YOUR_NAME <- TODO

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
	if (url.includes('https://iicl.law.pace.edu/cisg/case/')) {
		return 'case';
	}
	return false;
}

async function doWeb(doc, url) {
	var newItem = new Zotero.Item("case");
	var extras = "";

	newItem.title = text(doc, "h1.page-header--case");
	if (newItem.title == "") {
		newItem.title = "ERROR";
	};
	newItem.dateDecided = text(doc, ".field-name-field-biblio-date-display > .field-items");

	// Court + Jurisdiction
	let court = text(doc, ".field-name-field-tribunal-tags > .field-items");
	if (court) {
		newItem.court = court;
		let jurisdiction = text(doc, ".field-name-field-jurisdiction-tags > .field-items");
		let region = text(doc, ".field-name-field-case-city > .field-items");
		if (region) {
			jurisdiction += " - " + region;
		}
		extras += "jurisdiction: " + jurisdiction + "\n";
	};

	// Alternatively: Arbitral Institution
	let institution = text(doc, ".field-name-field-case-arbitral-institution  > .field-items");
	if (institution){
		newItem.court = institution;
		extras += "jurisdiction: arb.cls\n";
		extras += "genre: Abitral Decision\n";
		extras += "event-place: Unknown Seat of Arbitration\n";
	};

	// DocketNumber
	newItem.docketNumber = text(doc, ".field-name-field-case-number-docket-number > .field-items");

	// History
	newItem.history = text(doc, ".field-name-field-case-history > .field-items");

	// Editorial Remarks
	editorialRemark = text(doc, ".field-name-field-editorial-remarks-body");
	// note: saving the editorial remarks via notes does not make sense as the styling is totally messed up -- it's pretty much unreadable
	/* if (editorialRemark) {
		editorialRemark = "EDITORIAL REMARK (Authors see website)\n\n" + editorialRemark;
		newItem.notes.push({ note: editorialRemark });
	}; */
	if (editorialRemark) {
		newItem.attachments.push({
			title: "Editorial Remarks (HTML Snapshot)",
			mimeType: "text/html",
			url: url,
			snapshot: true,
		});
	};

	newItem.url = url;
	newItem.extra = extras;
	newItem.complete();
}






// :D

/** BEGIN TEST CASES **/
var testCases = [
]
/** END TEST CASES **/
