"use strict";
// Vergleich der drei Langenfelde-Läufe in der Tour.
// Hängt sich von außen an die Tour der Webkarte (TOUR, TD, BEREIT aus dem Hauptskript); der Code der Karte bleibt unverändert.
// Auf Folien des Empfehlungskapitels (das letzte Kapitel der Tour, in allen drei Läufen „Konzept“) stehen oben rechts
// am Kartenbild drei Reiter: Lauf 1 | Lauf 2 | Lauf 3. Ein Reiter öffnet denselben Folienplatz im anderen Lauf:
//   ../<n>/kombi.html#tour=empfehlung&s=<folie>   (folie zählt ab 1 innerhalb des Kapitels)
(() => {
  const LAEUFE = [1, 2, 3];
  const STANDORT = "langenfelde";
  const lauf = +(location.pathname.match(/\/laeufe\/(\d+)\//) || [])[1] || 0;

  const S = () => (typeof TD !== "undefined" && TD && TD.standorte && TD.standorte[STANDORT]) || null;
  const kapitel = s => s && s.kapitel[s.kapitel.length - 1].id;   // Empfehlung = letztes Kapitel
  const folien = s => s ? s.schritte.filter(q => q.kap === kapitel(s)) : [];

  function ziel() {   // #tour=empfehlung&s=3 → 3
    const h = new URLSearchParams(location.hash.slice(1));
    if (h.get("tour") !== "empfehlung") return null;
    return Math.max(1, parseInt(h.get("s"), 10) || 1);
  }

  let reiter = null, hinweis = "", zuletzt = "";
  function baue() {
    reiter = document.createElement("nav");
    reiter.className = "vgl-reiter";
    reiter.setAttribute("aria-label", "Lauf wählen");
    reiter.innerHTML = LAEUFE.map(n =>
      `<button type="button" data-lauf="${n}" class="${n === lauf ? "an" : ""}" aria-pressed="${n === lauf}">Lauf ${n}</button>`).join("") +
      `<span class="vgl-hinweis" hidden></span>`;
    reiter.addEventListener("click", ev => {
      const b = ev.target.closest("[data-lauf]");
      if (!b || +b.dataset.lauf === lauf) return;
      const k = platz();
      location.href = `../${b.dataset.lauf}/kombi.html#tour=empfehlung&s=${k || 1}`;
    });
    document.getElementById("work").appendChild(reiter);
  }

  function platz() {   // Folie innerhalb des Empfehlungskapitels (ab 1), sonst 0
    const s = S();
    if (!s || !TOUR.aktiv || TOUR.folie < 0) return 0;
    const f = s.schritte[TOUR.folie];
    return f && f.kap === kapitel(s) ? folien(s).indexOf(f) + 1 : 0;
  }

  function pruefe() {   // läuft fortlaufend: Reiter nur auf Empfehlungsfolien zeigen
    const k = platz();
    const an = k > 0;
    const ohneRahmen = an && !!document.querySelector("#tour.dunkel, #tDeck.da");   // Deckblatt, Schluss, Leitfragen: kein Kartenbild
    const zustand = an + ":" + k + ":" + ohneRahmen;
    if (zustand === zuletzt) return;
    const warAn = document.body.classList.contains("vgl-an");
    zuletzt = zustand;
    if (!reiter || !document.contains(reiter)) baue();
    document.body.classList.toggle("vgl-an", an);
    reiter.hidden = !an;
    reiter.classList.toggle("frei", ohneRahmen);
    const h = reiter.querySelector(".vgl-hinweis");
    h.hidden = !(an && hinweis);
    h.textContent = hinweis;
    if (an) history.replaceState(null, "", `#tour=empfehlung&s=${k}`);
    else if (gesprungen && ziel() !== null) history.replaceState(null, "", location.pathname + location.search);
    if (an && hinweis && k !== gesucht) { hinweis = ""; h.hidden = true; }   // Hinweis gilt nur für die angesprungene Folie
    // Titelzeile bekommt rechts Platz für die Reiter: Folie neu vermessen (wie bei geänderter Fenstergröße)
    if (an !== warAn) dispatchEvent(new Event("resize"));
  }

  let gesucht = 0, gesprungen = false;   // gesprungen: Adresse erst nach dem Sprung anpassen, sonst ginge #tour=… beim Laden verloren
  async function springe() {
    const k = ziel();
    if (k === null) { gesprungen = true; return; }
    await BEREIT;
    // Tourdaten können nach der Karte fertig werden: bis zu 30 s auf TD und die Tour warten
    for (let i = 0; i < 200 && !(S() && TOUR.hat(STANDORT) && typeof baueWillkommen === "function"); i++) await new Promise(r => setTimeout(r, 150));
    await new Promise(r => setTimeout(r, 300));   // Startfenster zuerst aufbauen lassen, dann schließen
    const s = S();
    if (!s) { gesprungen = true; return console.warn("Vergleich: keine Tour für", STANDORT); }
    const f = folien(s);
    if (!f.length) return;
    gesucht = Math.min(k, f.length);
    if (k > f.length) hinweis = `Lauf ${lauf} hat hier keine Folie ${k}`;
    if (typeof willkommen === "function") willkommen(false, false);   // Startfenster zu, die Tour beginnt direkt
    if (!TOUR.aktiv) await TOUR.start(STANDORT, false);
    TOUR.zeige(f[gesucht - 1].n - 1);
    gesprungen = true;
  }

  function los() {
    setInterval(pruefe, 150);
    springe().catch(e => console.warn("Vergleich: Sprung in die Tour nicht möglich:", e));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los, { once: true });
  else los();
})();
