{
	"translatorID": "d6f4842a-f42f-4e8c-9aa1-5d4833226bc4",
	"label": "_beck-online PRIO v2025-10-19",
	"creator": "Eric Mann (based on work by Philipp Zumstein)",
	"target": "^https?:\\/\\/beck-online\\.beck\\.de\\/",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 98,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-10-19 16:29:46"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2025 YOUR_NAME <- TODO

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



// mapping by Philipp Zumstein
var literaturgattungen = {
	ZAUFSATZ: 'journalArticle',
	ZRSPR: 'case', // Rechtssprechung
	ZRSPRAKT: 'case',
	BECKRS: 'case',
	ZENTB: 'journalArticle', // Entscheidungsbesprechung
	ZBUCHB: 'journalArticle', // Buchbesprechung
	ZSONST: 'journalArticle', // Sonstiges, z.B. Vorwort,
	LSK: 'journalArticle', // Artikel in Leitsatzkartei
	ZINHALTVERZ: 'multiple', // Inhaltsverzeichnis
	KOMMENTAR: 'encyclopediaArticle',
	ALTEVERSION: 'encyclopediaArticle',
	'ALTEVERSION KOMMENTAR': 'encyclopediaArticle',
	HANDBUCH: 'encyclopediaArticle',
	BUCH: 'book',
	// ? 'FESTSCHRIFT' : 'bookSection'
};



var literaturtypen = {
	"kommentar": 				"encyclopediaArticle",			// Kommentar Standard
	"alteversion kommentar": 	"encyclopediaArticle",			// Kommentar Altauflagen
	"handbuch": 				"encyclopediaArticle",			// Handbuch
};



function detectWeb(doc, url) {
	// wenn alles richtig funktioniert, dann wird beim Return-Value false einfach der nächste Translator niedrigerer Prio gecallt
	// dh ich kann Kommentare erkennen und sonst false returnen, und dann sollte der normale beck-online translator laufen

	// Haupt-div hat entweder die ID "dokument" oder "trefferliste", und als className ist dann der Literaturtyp abrufbar
	let mainDiv = doc.getElementById("dokument");
	if (mainDiv) {
		if (literaturtypen[mainDiv.className] == "encyclopediaArticle") {
			return 'encyclopediaArticle';
		};
	}

	// TODO: clean this shit up
	/*
	// ## todo: Auswahl aus Liste mittels dieser Funktion
	else if (getSearchResults(doc, true)) {
		return 'multiple';
	}
	*/

	// wenn kein unterstützter Literaturtyp: return false -> allgemeinerer Translator versucht Erkennung
	return false;
}

// todo: das ist die Funktion für die Liste bei mehreren Literaturobjekten
/*
function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	// TODO: adjust the CSS selector
	var rows = doc.querySelectorAll('h2 > a.title[href*="/article/"]');
	for (let row of rows) {
		// TODO: check and maybe adjust
		let href = row.href;
		// TODO: check and maybe adjust
		let title = ZU.trimInternal(row.textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}
*/

async function doWeb(doc, url) {

	/* todo: Speichern mehrerer aus Suchergebnisliste mittels dieser Funktion
	if (detectWeb(doc, url) == 'multiple') {
		let items = await Zotero.selectItems(getSearchResults(doc, false));
		if (!items) return;
		for (let url of Object.keys(items)) {
			await scrape(await requestDocument(url));
		}
	}
	*/
	if (detectWeb(doc, url) == "encyclopediaArticle"){
		await scrapeCommentary(doc, url);
	}
	/* todo: andere Literaturgattungen
	else {
		await scrape(doc, url);
	}
	*/
}

async function scrapeCommentary(doc, url) {


	/* Welche Arten von Kommentaren hat beck-online und welche Probleme ergeben sich daraus:

	- BeckOGK: die verschiedenen BeckOGKs sind nur anhand der Gesamtherausgeber auseinanderzuhalten

	- MüKo: Band nur links im Inhaltsverzeichnis erkennbar

	- Kommentare, die nur von einem Autor verantwortet werden
		(z.B. Koch, AktG) 													- hier scheint beck-online das auch zu checken
		Epiney/Diezig/Pirker/Reitemeyer, Aarhus-Konvention					- hier scheint beck-onlien das nicht zu checken

	- Schulz/Hauß, Familienrecht -- Zitiervorschlag unten fehlt einfach lol

	Sachtitel automatisch erkennen?
	MüKo: Oben "Münchener Kommentar", unten "MüKo" 							- anders und Sachtitel
	Jauernig" Oben "Jauernig, ...", unten "Jauernig/..."					- gleich und Person
	BeckOK: Oben "BeckOK BGB, Hau/Poseck", unten "BeckOK BGB"				- gleich und Sachtitel

	*/


	// neues Item erstellen
	let item = new Zotero.Item("encyclopediaArticle");
	item.title = "##";

	// Variable vorbereiten
	let matches = [];
	let abschnitt = "##";
	let kurztitel = "##";
	let auflage = "##";
	let datum = "##";
	let zitiervorschlag = "##";
	let altauflage = false;
	let bearbeiter = "##";
	let kommentartitel = "##";
	let extras = "";


	// Website-Titel scrapen (##todo)
	let websiteTitle = text(doc, "title");
	websiteTitle = websiteTitle.replace(" - beck-online", "");
	let [altKurztitel, altAbschnitt] = websiteTitle.split(" | ");
	//item.notes.push({note: websiteTitle});
	kurztitel = altKurztitel;
	item.shortTitle = kurztitel;

	let regexAltAbschnitt = /(.*?)(?: Rn\. .+)?$/;
	matches = altAbschnitt.match(regexAltAbschnitt);
	if (matches) {
		altAbschnitt = matches[1];
		altAbschnitt = altAbschnitt.replace(/Art\. /g, "Art\.\u00A0");
		altAbschnitt = altAbschnitt.replace(/§ /g, "§\u00A0");

	};
	abschnitt = altAbschnitt;
	item.pages = abschnitt;



	// Bearbeiter ermitteln
	bearbeiter = text(doc, ".autor");

	if (bearbeiter) {
		let bearbeiters = bearbeiter.split("/");
		for (let i = 0; i < bearbeiters.length; i++) {
			item.creators.push(ZU.cleanAuthor(bearbeiters[i], "author", false));
		};
	};



	// Altauflage?
	// wird im Extra-Feld als "Version Number: " auftauchen
	if (doc.getElementById("dokument").className == "alteversion kommentar") {
		item.version = "Altauflage";
		altauflage = true;
	};





	// Zitiervorschlag mit Auflage scrapen
	if (altauflage) {
		zitiervorschlag = text(doc, "#zitStandard");
	} else {
		zitiervorschlag = text(doc, "#zitMitAuflage");
	};

	// Zitiervorschlag auftrennen
	let z1 = "";
	let z2 = "";
	let z3 = "";

	let regexInfos = /([^,]+), ([^,]+), (.+)/;
	matches = zitiervorschlag.match(regexInfos);
	if (matches) {
		z1 = matches[1];
		z2 = matches[2];
		z3 = matches[3];
	};

/*

	// Kurztitel aus Zitiervorschlag ermitteln
	// TODO: Daten übernehmen, wenn kein Zitiervorschlag vorhanden
	let regexKurztitel = new RegExp(`(.+)\/${bearbeiter}`);
	matches = z1.match(regexKurztitel);
	if (matches) {
		kurztitel = matches[1];
		item.shortTitle = kurztitel;
	};

*/

	// Auflage und Datum aus Zitiervorschlag ermitteln
	if(kurztitel.includes("BeckOGK")) {
		datum = z2;
		item.date = datum;
	} else {
		// Normal und BeckOK
		let regexDatum = /(\d+)\. (?:Aufl|Ed)\. ([\d\.]+)/;
		matches = z2.match(regexDatum);
		if (matches) {
			auflage = matches[1];
			datum = matches[2];
			item.edition = auflage;
			item.date = datum;
		};
	};

	/*

	// Abschnitt aus Zitiervorschlag ermitteln
	let regexAbschnitt = /(.*?)(?: Rn\. .+)?$/;
	matches = z3.match(regexAbschnitt);
	if (matches) {
		abschnitt = matches[1];
		abschnitt = abschnitt.replace(/Art\. /g, "Art\.\u00A0");
		abschnitt = abschnitt.replace(/§ /g, "§\u00A0");
		item.pages = abschnitt;
	};

*/






	// Titel für Ansicht in Zotero generieren
	if (altauflage) {
		item.title = kurztitel + " (" + datum + ") " + abschnitt;
	} else {
		item.title = kurztitel + " " + abschnitt;
	};








	// Zitierinfo scrapen (##todo: Auswertung der Daten)
	let zitierinfo = doc.querySelectorAll(".citation")[0].innerHTML;

	// nur zu Testzwecken aktivieren
	//item.notes.push({note: zitierinfo});


	if (zitierinfo.includes("beck-online.GROSSKOMMENTAR")) {			// BeckOGK
		let regexHrsg = />Hrsg: (\S+)</;
		matches = zitierinfo.match(regexHrsg);
		if (matches) {
			let hrsg = matches[1];
			let etAl = false;
			if (hrsg.includes(" u.a.")) {
				etAl = true;
				hrsg = hrsg.replace(" u.a.", "");
			};
			let hrsgs = hrsg.split("/");
			for (let i = 0; i < hrsgs.length; i++) {
				item.creators.push(ZU.cleanAuthor(hrsgs[i], "editor", false));
			};
			if (etAl) {
				item.creators.push(ZU.cleanAuthor("##u.a.##", "editor", false));
			};
		};
		extras += "submitted: " + datum.toString() + "\n";

	} else if (zitierinfo.includes("BeckOK")) {				// BeckOK
		let regexHrsg = /, (.+?)<br>/;
		matches = zitierinfo.match(regexHrsg);
		if (matches) {
			let hrsg = matches[1];
			let etAl = false;
			if (hrsg.includes(" u.a.")) {
				etAl = true;
				hrsg = hrsg.replace(" u.a.", "");
			};
			let hrsgs = hrsg.split("/");
			for (let i = 0; i < hrsgs.length; i++) {
				item.creators.push(ZU.cleanAuthor(hrsgs[i], "editor", false));
			};
			if (etAl) {
				item.creators.push(ZU.cleanAuthor("##u.a.##", "editor", false));
			};
		};
		extras += "submitted: " + datum.toString() + "\n";
	} else {																		// Sonstige

		let regexSonstige = /(.+?), (.+?)<br>/;
		matches = zitierinfo.match(regexSonstige);
		if (matches) {
			let hrsg = matches[1];
			let etAl = false;
			if (hrsg.includes(" u.a.")) {
				etAl = true;
				hrsg = hrsg.replace(" u.a.", "");
			};
			let hrsgs = hrsg.split("/");
			for (let i = 0; i < hrsgs.length; i++) {
				item.creators.push(ZU.cleanAuthor(hrsgs[i], "editor", false));
			};
			if (etAl) {
				item.creators.push(ZU.cleanAuthor("##u.a.##", "editor", false));
			};
			kommentartitel = matches[2];
		};
	};
	// ##todo: Kommentare mit Sachentitel (?), jedenfalls aber MüKo hat keine Hrsg.-Angabe hier und deshalb kein Komma und ist somit noch nicht erfasst

	// Auflage + Datum, sofern kein Zitiervorschlag vorhanden
	if (auflage == "##") {
		let regexAltAuflage = /(\d+)\. Auflage (\d\d\d\d)/;
		matches = zitierinfo. match(regexAltAuflage);
		if (matches) {
			item.edition = matches[1];
			item.date = matches[2];
		};
	};


	// ## todo - wip: Langtitel, damit man das beim Zitieren besser findet
	if (kommentartitel == "##") {
		kommentartitel = ZU.xpathText(doc, '//*[@id="toccontent"]/ul/li/a[2]');
	};

	// Enzyklopädietitel für das Tracking über CSL-M generieren
	// Das Jahr wird hinzugefügt, damit Altauflagen im LitV separat auftauchen
	// TODO: Info bzgl. Band hinzufügen, damit diese separat im LitV aufgeführt werden
	if (altauflage) {
		item.encyclopediaTitle = kommentartitel + " (" + datum + ")";
	} else {
		item.encyclopediaTitle = kommentartitel;
	};





	// URL scrapen
	item.url = text(doc, "#docUrl");


	// User Info
	let userInfo = 	"Kein autom. PDF-Download! " + 
					"";
	item.notes.push({note: userInfo});


	// TODO: Online-Kommentar als solchen abspeichern
	// TODO: Loseblattsammlung als solche abspeichern (zB Dürig GG)


	// Finalize item
	item.extra = extras;

	// Item abspeichern
	item.complete();

}

async function scrape(doc, url = doc.location.href) {
	// TODO: implement or add a scrape function template

}

/** BEGIN TEST CASES **/
var testCases = [
]
/** END TEST CASES **/
