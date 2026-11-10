/*
 * Body scale card: people, body composition and growth of a smart scale.
 *
 * Shows open (unassigned) measurements with one button per person, and a
 * table of each person's measurements with "move" and "delete" per row.
 * Every change asks for confirmation first. Entities are found
 * automatically; no configuration is required.
 *
 *   type: custom:body-scale-card      
 *   person: jane            # optional: only this person (user id or name)
 *   rows: 10                # optional: rows before "show more"
 *   pending: true           # optional: show open measurements
 *   next_user: true         # optional: "who weighs next" buttons (incl. guest)
 *   chart: true             # optional: history graph from long-term statistics
 *   language: de            # optional: card language (default: profile language)
 *   info: true              # optional: "understanding the values" section
 *   sort: age               # optional: oldest first (default) or "name"
 *   profile: true           # optional: age, height and method under the name
 *   grid: true              # optional: false removes the graph grid and its toggle
 *   curves: true            # optional: false never draws the children's percentile curves
 *   overview: false         # optional: one row per person instead of tabs and graphs
 *   links: {jane: person-jane}  # optional (with overview): view path per person, row opens it; holding a person key opens it too
 *   list: false             # optional (with overview): no rows, the scale's person keys lead to the views
 *   display_hold: 10        # optional: minutes until the scale display goes idle
 *   skin: device            # optional: "theme" draws the scale in the dashboard theme's colours
 *
 * This list is a short overview; every option with its default is in docs/CARD.md
 * and in the visual editor (module 70-editor).
 *
 * The same file provides the dashboard strategy custom:body-scale-card-dashboard (see
 * BodyScaleDashboardStrategy below).
 *   columns: [weight, body_mass_index, body_fat_percentage, muscle_mass]
 */

const VERSION = "0.1.0";

/*
 * Module i18n: texts and languages
 *
 * Loads the texts of the card: German and English are built in, every other language is
 * fetched from body-scale-card.i18n.<code>.json next to the card (English fills missing keys).
 * Provides: uiText(lang), infoText(lang), editorText(lang), i18nListeners, I18N_NAMES.
 * The three placeholders below are filled by tools/build_card.py from translations/*.json.
 */

// German and English are embedded (the card always works). Every other language is
// loaded from body-scale-card.i18n.<code>.json next to this file; see translations/README.md.
const I18N_FN = {"ui":{"until":["t"],"confirmDiscard":["m"],"confirmBaby":["w","n"],"carriedFrom":["when"],"days":["n"],"years":["n"],"filterHint":["date"],"growthHint":["ref","licence"],"heightOld":["n"],"heightAsk":["name"],"confirmDelHeight":["h","p"],"allGood":["n"],"confirmAssign":["m","p"],"confirmMove":["m","f","t"],"confirmRemove":["m","p"],"pickTarget":["m"]},"info":{"avgForWeight":["v"],"realAge":["n"],"mifflin":["v"],"percentile":["p","c","ref","other"],"heightPct":["p","ref"]}};
const I18N_EMBEDDED = {"de":{"_meta":{"language":"Deutsch","machine_translated":false},"ui":{"title":"Waage","overview":"Waage","holdOpen":"lange drücken: Ansicht öffnen","pending":"Offene Messungen","noPending":"Keine offenen Messungen.","assignTo":"Zuordnen an","assign":"Zuordnen","next":"Als Nächstes wiegt sich","auto":"Automatisch","guest":"Gast","until":"bis {t}","discard":"Gast / verwerfen","discardShort":"Verwerfen","confirmDiscard":"Messung vom {m} verwerfen? Sie wird niemandem zugeordnet und nicht gespeichert.","guestResult":"Gast","chartLegendTitle":"Diagramm und Tabelle: Bedienung und Markierungen","chartLegend":[["_","Diagramm bedienen"],["views","Ansicht: Zusammensetzung, BMI, Größe; bei Kindern zusätzlich Gewicht + Perzentile."],["comppct","%: in der Zusammensetzung zwischen kg und Prozent (Gewicht + Fett in Prozent) umschalten."],["periods","Zeitraum: 30 Tage, 1 Jahr, alles. Ohne Filter kommt die Linie aus der Langzeitstatistik über alle Jahre (Tages-, bei „alles“ Wochenmittel)."],["fc","Filter Kleidung: egal, nur ohne oder nur mit Kleidung gewogen. Gilt bei Gewicht, BMI und Zusammensetzung."],["fi","Filter Impedanz: egal, nur mit oder nur ohne Impedanz. Gilt nur bei der Zusammensetzung (Fett, Wasser, Muskeln), denn nur dort braucht es die Impedanz. Gewicht, BMI und Größe hängen nicht davon ab."],["fnote","Mit einem Filter zählen nur die gespeicherten Einzelmessungen (so weit, wie die Integration sie aufbewahrt), nicht die Langzeitstatistik; ein Hinweis unter dem Diagramm nennt den Beginn. Gibt es keine passenden Einträge, bleibt das Diagramm leer. Die Größe hat keine Filter."],["grid","Raster ein/aus."],["curves","Kurven ein/aus. Erwachsene: BMI-Bereiche. Kinder: zwei Knöpfe WHO und DE (Kromeyer-Hauschild), Antippen wählt die Referenz, nochmal Antippen blendet die Kurven aus."],["_","Tabelle unter dem Diagramm (eine Zeile je Messung)"],["tshirt","T-Shirt: mit Kleidung gewogen (gefüllt) oder ohne (Umriss). Antippen schaltet um; die Messung wird dabei noch einmal mit derselben Zeit gespeichert und ersetzt die alte."],["move","Verschieben: gibt die Messung einer anderen Person (deren Profil rechnet die Körperwerte neu), nach Rückfrage."],["delete","Löschen: entfernt die Messung endgültig, nach Rückfrage. Löschen entfernt sie auch aus den Einzelmessungen, nicht aus der Langzeitstatistik der Sensoren."],["hight","Größe: In der Ansicht Größe steht eine eigene Tabelle. Stift = Eintrag korrigieren, Mülleimer = Eintrag löschen, Plus = neue Größe eintragen."],["_","Markierungen"],["est","Blass bzw. gepunktet: geschätzt. Für diese Zeit gibt es keinen gemessenen Wert, es gilt der letzte bzw. nächste bekannte, dazwischen wird überbrückt."],["old","Blasse Linie vor einem Methodenwechsel: Werte nach der früheren Berechnungsart des Körperfetts."],["switch","Methodenwechsel: 1 = Standard, 2 = Alternativ, + = Athlet. Hier von 1 auf 2."],["pct","Orange gepunktet: Perzentil-Kurven P3, P10, P50, P90 und P97 der gewählten Referenz (WHO oder DE)."]],"howTitle":"So funktioniert die Waage","how":[["auto","Automatik","Einfach draufstellen: Die Waage erkennt die Person am Gewicht, im Vergleich mit dem bisherigen Verlauf."],["tap","Vorwählen","Vorher eine Person, Gast oder Baby/Tier antippen. Die Taste leuchtet, die Wahl gilt wenige Minuten (bei Personen Rahmen dünner, bei Gast und Baby/Tier blinkt in der letzten Minute der Rahmen ihres Symbols im Display, Automatik nie). Läuft sie ab, wechselt die Waage in Automatik (aktiv, 00.00) für dieselbe Zeit, danach in Ruhe."],["done","Erkannt","Passt genau eine Person, bekommt sie die Messung. Ihre Taste leuchtet, das Ergebnis bleibt einige Minuten stehen (display_hold, Standard 5)."],["open","Unklar","Passt niemand oder mehrere, bleibt die Messung offen. Personen ohne Werte und die nächstliegende Person blinken im Wechsel mit der Gast-Taste. Person tippen = zuordnen, Gast-Taste = als Gast behalten, nicht speichern."],["guest","Gast","Nur Gewicht, nichts wird gespeichert."],["baby","Baby/Tier","Zwei Schritte: erst allein, dann mit Baby/Tier. Das Display zeigt die Differenz. Gibt es ein Baby (unter 2 Jahren) als Person, blinkt seine Taste im Wechsel mit der Gast-Taste: Baby tippen = nur das Gewicht speichern, Gast-Taste = nicht speichern."],["timer","Zeitablauf","Die Zeit einer Person zeigt ihre leuchtende Taste: der Rahmen wird dünner (Standard, `key_timer`), optional läuft ein Rand zurück oder die Taste dunkelt ab. Gast und Baby/Tier zeigen die Zeit am Symbol im Display: in der letzten Minute blinkt sein Rahmen. Automatik blinkt nie. Die drei Modustasten selbst leuchten nie. Es gibt vier Zeiten: Vorwahl (Wartezeit, einstellbar mit `choice_minutes`), danach Automatik aktiv (dieselbe Zeit), das Ergebnis (`display_hold`) und die Historie (`history_hold`)."],["sync","Nochmal wiegen","Kurz danach erneut draufstellen ersetzt die vorige Messung."],["hist","Ältere Messungen","Die Zahlen 1–10 oben im Display rufen sie auf. Ein zweiter Tipp oder nach history_hold Sekunden (Standard 30) geht es zurück in den vorherigen Zustand."],["fat","Körperfett","Methode 1 (Standard), 2 (Alternativ) oder Athlet. Ohne Impedanz (Socken, Schuhe) nur Gewicht."],["bmi","Kinder","BMI als Perzentil (WHO oder DE), Kurven im Diagramm."],["pending","Offene Messungen","Unter der Waage zuordnen, verschieben oder verwerfen. Die Benachrichtigung geht an die vorgeschlagenen Personen."]],"flowTitle":"Ablauf","flow":{"idle":"Ruhe","pre":"Vorwahl","weigh":"Wiegen","known":"Erkannt","gb":"Gast / Baby/Tier","open":"Unklar","result":"Ergebnis","hist":"Historie","auto":"Automatik","back":"Zurück","step":"wiegen","tap":"tippen","person":"Person tippen"},"flowNote":"Ruhe ist der Zustand ohne Anzeige. Wer auf die Waage steigt, wiegt in Automatik. Bei „Unklar“ geht es mit der Gast-Taste zurück in Ruhe (nicht gespeichert); Gast und Baby/Tier werden nur gezeigt.","timesTitle":"Zeiten","times":{"pre":"{T} Min.","auto":"{T} Min.","res":"{H} Min.","hist":"{Y} s"},"timesNote":"Alle Zeiten stellst du in der Karte ein: Vorwahl und Automatik mit choice_minutes (die Integration setzt nur die Vorwahl nach dieser Zeit zurück), das Ergebnis mit display_hold, die Historie mit history_hold. Ohne choice_minutes gilt die Wartezeit der Integration.","confirmBaby":"Das Baby-Ergebnis ({w} kg) für {n} speichern? Es wird nur das Gewicht gespeichert.","babySave":"Speichern","babyDismiss":"Nicht speichern","growthHint":"Perzentile und Kurven brauchen die Wachstumsdaten {ref} (eigene Datei, Lizenz {licence}).","growthEnable":"Aktivieren","legendTitle":"Symbole der Waage","legend":[["hist","Frühere Messung ansehen (1 = neueste), nochmal tippen = zurück"],["ohm","Impedanz in Ohm, daneben kg mit Änderung zur Messung davor"],["arrow","▲ gestiegen, ▼ gesunken, ▬ gleich (zur Messung davor)"],["bmi","BMI, bei Kindern die Perzentile (P)"],["fat","Körperfett in Prozent, nur mit Impedanz"],["shoe","Ohne Impedanz gemessen (Socken, Schuhe, trockene Füße): nur Gewicht"],["sync","Ersetzt die Messung von eben"],["lift","Athleten-Kurve"],["m1","Fett-Methode 1: Standard"],["m2","Fett-Methode 2: Alternativ"],["nosave","Nicht gespeichert (Gast, Baby/Tier)"],["auto","Automatik-Taste: die Waage erkennt die Person am Gewicht"],["guest","Gast-Taste (ein Tipp schaltet um, nicht gespeichert)"],["baby","Baby/Tier-Taste (zuerst allein, dann mit Baby/Tier)"],["dim","Gedimmt: aus. Ein gedimmter Rahmen um das Automatik-Symbol zeigt in Ruhe, dass Automatik vorgewählt ist."],["lit","Leuchtend: jetzt aktiv. Die Personentaste oder das Symbol im Display wartet auf eine Messung oder gehört zum gezeigten Ergebnis (Person, Gast, Baby/Tier). Die Modustasten bleiben dunkel."],["frame","Restzeit (Standard) der Personentaste: Der Rahmen ist erst dick und wird bis zum Ablauf dünner, bis er so dünn ist wie bei jeder Taste. Bei Gast und Baby/Tier blinkt stattdessen in der letzten Minute der Rahmen des Symbols im Display (Automatik nie)."],["ring","Optional (key_timer: ring): Der Rand läuft an der Personentaste zurück wie ein Zeiger."],["fade","Optional (key_timer: fade): Die Taste dunkelt ab. Blinken in der letzten Minute ist eine eigene Option (key_blink)."],["blink","Blinkend: Messung offen. Die vorgeschlagenen Personen und die Gast-Taste (mit Symbol) blinken im Wechsel."]],"guestNote":"nicht gespeichert","sincePrevious":"Änderung zur Messung davor","holdSteps":["1/2 allein","2/2 mit Baby/Tier"],"legendInv":{"hist":"Frühere Messung ansehen (1 = neueste): die aufgerufene Zahl ist hell hinterlegt. Nochmal tippen = zurück.","dim":"Eingestellt, ruhend: Das Symbol des Modus (z. B. Automatik in Ruhe) ist gedimmt hinterlegt, sonst zeigt es nur das gedimmte Symbol.","lit":"Aktiv: Das Symbol im Display ist hell hinterlegt, wenn der Modus auf eine Messung wartet oder zum Ergebnis gehört. Die Personentaste leuchtet. Die Modustasten bleiben dunkel."},"howInv":{"timer":"Die Zeit einer Person zeigt ihre leuchtende Taste (Rahmen, Ring oder Abdunkeln, `key_timer`). Gast und Baby/Tier zeigen die Zeit am Symbol im Display: In der letzten Minute pulsiert das gefüllte Feld langsam (hell und gedimmt). Automatik blinkt nie. Es gibt vier Zeiten: Vorwahl (`choice_minutes`), danach Automatik aktiv (dieselbe Zeit), das Ergebnis (`display_hold`) und die Historie (`history_hold`)."},"carriedFrom":"Stand {when} (letzte Messung mit diesem Wert)","holdSame":"Beide Messungen fast gleich: Wurde das Baby/Tier mitgewogen? Nichts zu speichern.","replaced":"ersetzt die Messung von eben","whoWasIt":"Wer war das? Taste antippen","hold":"Baby/Tier","latest":"Zuletzt","days":"{n} Tage","years":"{n} Jahre","noChart":"Noch kein Verlauf.","filterClothed":{"any":"Kleidung: egal","yes":"Nur mit Kleidung gewogen","no":"Nur ohne Kleidung gewogen"},"filterImpedance":{"any":"Impedanz: egal","with":"Nur Messungen mit Impedanz","without":"Nur Messungen ohne Impedanz"},"filterHint":"Mit Filter zählen nur die gespeicherten Einzelmessungen, ab {date}.","filterNone":"Mit Filter zählen nur gespeicherte Einzelmessungen, es gibt noch keine.","filterEmpty":"Mit diesem Filter gibt es keine Einträge mit diesen Werten. Körperwerte gibt es nur bei Messungen mit Impedanz.","clothedOn":"Mit Kleidung gewogen (tippen: ohne)","clothedOff":"Ohne Kleidung gewogen (tippen: mit Kleidung)","periods":{"month":"30 Tage","year":"1 Jahr","all":"Alles"},"chartViews":{"fat":"Gewicht + Fett","composition":"Zusammensetzung","percentile":"Gewicht + Perzentile","height":"Größe","bmi":"BMI"},"comp":{"ffm":"Fettfrei","tissue":"Gewebe","substances":"Stoffe","fat":"Fett","subcut":"Unterhautfett","restFat":"Übriges Fett (u. a. viszeral)","muscle":"Muskeln und Organe","bone":"Knochen","water":"Wasser","protein":"Protein","rest":"Übriges","visceral":"Viszeralfett","total":"Gewicht","pct":"Gewicht + Fett in Prozent","kg":"Zusammensetzung in kg"},"chartLabels":{"weight":"Gewicht","body_fat_percentage":"Fett","fat_mass":"Fettmasse","fat_free_mass":"Fettfreie Masse","bmi_percentile":"BMI-Perzentile","height":"Größe","height_percentile":"Größen-Perzentile","body_mass_index":"BMI"},"heightOld":"Größe vor {n} Monaten eingetragen","heightAsk":"Wie groß ist {name} jetzt?","heightEdit":"Größe ändern","heightAdd":"Größe eintragen","change":"Veränderung","confirmDelHeight":"Größe vom {h} bei {p} löschen?","private":"Nur für diese Person und Admins sichtbar","newMeasurement":"neue Messung","heightNow":"jetzt eintragen","heightRange":"Bitte eine Größe zwischen 40 und 250 cm eingeben.","save":"Speichern","grid":"Raster","bandsFor":{"male":"Jungen","female":"Mädchen"},"sexes":{"male":"männlich","female":"weiblich"},"curvesToggle":"Kurven ein/aus","zonesValue":"WHO · normal 18,5–25","zoneShort":["unter","normal","über","adipös"],"measurements":"Messungen","allGood":"{n} Werte im grünen Bereich","noMeasurements":"Noch keine Messungen.","date":"Datum","more":"Mehr anzeigen","less":"Weniger anzeigen","move":"Verschieben","remove":"Löschen","cancel":"Abbrechen","impedance":"mit Impedanz","noImpedance":"nur Gewicht","suggested":"passt zum Gewicht","confirmAssign":"Messung vom {m} {p} zuordnen?","confirmMove":"Messung vom {m} von {f} nach {t} verschieben? Die Körperwerte werden für {t} neu berechnet.","confirmRemove":"Messung vom {m} bei {p} endgültig löschen?","pickTarget":"Messung vom {m} verschieben an:","notFound":"Keine Waage gefunden. Bietet die Integration die Waagen-Schnittstelle (S) an, und ist Home Assistant neu gestartet?","failed":"Das hat nicht geklappt:","cols":{"weight":"Gewicht","body_mass_index":"BMI","body_fat_percentage":"Fett","muscle_mass":"Muskel","body_water_percentage":"Wasser","skeletal_muscle_percentage":"Skelettm.","bone_mass":"Knochen","protein_percentage":"Protein","basal_metabolic_rate":"Grundums.","fat_free_mass":"Fettfrei","visceral_fat":"Viszeral","subcutaneous_fat_percentage":"Unterhaut","metabolic_age":"Stoffw.-Alter","impedance":"Impedanz"}},"info":{"title":"Werte verstehen","bands":{"low":"niedrig","ok":"normal","high":"erhöht","veryHigh":"hoch"},"bmiBands":["Unter-","Normal-","Über-","Adipositas"],"howTitle":"So rechnet die Waage","how":["Die Waage misst nur zwei Dinge: das <b>Gewicht</b> und die <b>Impedanz</b>, also wie gut ein schwacher Strom von Fuß zu Fuß durch den Körper fließt.","Daraus wird mit einer Formel das <b>Körperfett</b> geschätzt. Alle anderen Werte (Wasser, Muskeln, Protein, Knochen, Grundumsatz) werden danach mit festen Faktoren aus Körperfett und Gewicht abgeleitet. Sie bewegen sich deshalb immer gemeinsam und sind keine eigenen Messungen.","Am verlässlichsten ist der <b>Trend</b> über Wochen, nicht der einzelne Wert."],"algoTitle":"Berechnungsarten","algos":{"standard":["Standard","Vor allem BMI, Alter und Geschlecht. Die Impedanz verschiebt das Ergebnis nur um etwa 1 Prozentpunkt. Sehr stabil, reagiert aber kaum auf Training."],"alternative":["Alternativ","Rechnet zuerst die fettfreie Masse aus Größe, Gewicht, Alter und Impedanz, der Rest ist Fett. Auch hier spielt die Impedanz nur eine kleine Rolle. Liegt meist 4–6 Prozentpunkte über Standard. Nimm die Variante, die zur App des Herstellers passt."],"athlete":["Athlet","Flachere Kurve ohne Impedanz. Für Menschen mit viel Muskulatur, bei denen ein hoher BMI nicht von Fett kommt. Ergibt durchweg deutlich weniger Fett, oft 5–8 Prozentpunkte."]},"yourValues":"Mit der letzten Messung ergäbe sich","active":"aktiv","activeNote":"Umrahmt: die eingestellte Methode.","normal":"normal","athleteCol":"Athlet","setHint":"Umstellen in den Einstellungen der Waagen-Integration (Einstellungen → Geräte & Dienste), beim Benutzer.","child":"Unter 18 gelten die Formeln und Bereiche für Erwachsene nicht. Bei Kindern und Jugendlichen zählt die BMI-Perzentile für Alter und Geschlecht, sie steht beim BMI. Die Berechnungsart ist fest auf Standard. Körperfett und abgeleitete Werte sind nur grobe Schätzungen.","avgForWeight":"Durchschnitt bei diesem Gewicht etwa {v} kg","realAge":"Tatsächliches Alter: {n} Jahre","ageBands":{"ok":"jünger","high":"älter"},"visceralBands":["gesund","erhöht","hoch"],"percentile":"BMI-Perzentile {p} ({ref}): {c}. Von 100 Kindern gleichen Alters und Geschlechts haben {p} einen niedrigeren BMI.{other}","categories":{"thinness":"Untergewicht","normal":"normal","overweight":"Übergewicht","obesity":"Adipositas"},"kidBmi":{"who":"Kinder und Jugendliche (WHO, 5–19 Jahre): unter Perzentile 2,3 Untergewicht, bis 84 normal, bis 97,7 Übergewicht, darüber Adipositas.","kh":"Kinder und Jugendliche (Kromeyer-Hauschild, 0–18 Jahre): unter Perzentile 10 Untergewicht, bis 90 normal, bis 97 Übergewicht, darüber Adipositas."},"kidRanges":{"body_fat_percentage":"Für Kinder gibt es keine verlässlichen Bereiche aus der Waage. Nur den eigenen Verlauf betrachten.","body_water_percentage":"Kinder haben anteilig mehr Wasser als Erwachsene. Die Bereiche für Erwachsene gelten nicht."},"mifflin":"Zum Vergleich nach Mifflin-St-Jeor (ohne Körperfett): {v} kcal","heightBands":["klein","normal","groß"],"heightCuts":"Üblicher Bereich: Perzentile 3 bis 97 (WHO: 2,3 bis 97,7). Außerhalb lohnt ein Gespräch mit der Kinderärztin oder dem Kinderarzt, wenn sich die Größe plötzlich verändert.","heightPct":"Größen-Perzentile {p} ({ref}): Von 100 Kindern gleichen Alters und Geschlechts sind {p} kleiner.","compTitle":"Zusammensetzung","compSub":"Fett / fettfrei","compIntro":"Dasselbe Gewicht in zwei Aufteilungen: nach Gewebe und nach Stoffen. Jeder Balken ergibt das ganze Gewicht, das Fett ist in beiden gleich und nach Tiefe geteilt (zwei Orange-Töne). Alles wird aus Fettanteil und Gewicht abgeleitet, es sind keine einzelnen Messungen.","compKid":"Bei Kindern sind das nur grobe Schätzungen.","compInfo":{"fat":"Anteil des Körperfetts am Gewicht, aus der Impedanz geschätzt. Alles andere ist die fettfreie Masse.","muscle":"Gewicht minus Fett minus Knochen. Enthält auch Organe und das Wasser in den Muskeln, nicht nur Muskeln.","bone":"Aus Fettanteil und Gewicht geschätzt, nicht gemessen.","subcut":"Fett direkt unter der Haut. Der Rest ist übriges Fett, darin steckt auch das viszerale Fett um die Organe.","restFat":"Übriges Fett, darin auch das viszerale Fett um die Organe.","visceral":"Stufenwert für das Fett um die Organe (bis 9 gesund), keine Masse. Es lässt sich nicht aus dem Gesamtfett herausrechnen.","water":"Körperwasser. Muskeln enthalten viel Wasser, Fett wenig.","protein":"Eiweiß, vor allem in den Muskeln.","rest":"Gewicht minus Wasser, Fett und Protein, vor allem Mineralstoffe."},"metrics":{"body_mass_index":["BMI","Gewicht geteilt durch Größe im Quadrat. Einfach und gut vergleichbar, unterscheidet aber nicht zwischen Muskeln und Fett.","Erwachsene (WHO): unter 18,5 Untergewicht, 18,5–24,9 normal, 25–29,9 Übergewicht, ab 30 Adipositas."],"body_fat_percentage":["Körperfett","Anteil des Fetts am Gewicht. Berechnet aus BMI, Alter, Geschlecht und Impedanz (siehe Berechnungsarten).","Gesunde Bereiche steigen mit dem Alter leicht an. Über den Tag schwankt der Wert um mehrere Prozentpunkte (Trinken, Essen, Sport)."],"body_water_percentage":["Körperwasser","Anteil des Wassers am Gewicht. Muskeln enthalten viel Wasser, Fett wenig. Hier aus dem Körperfett abgeleitet: weniger Fett bedeutet mehr Wasser.","Erwachsene etwa 45–60 % (Frauen) bzw. 50–65 % (Männer)."],"skeletal_muscle_percentage":["Skelettmuskel","Anteil der Muskeln, die an den Knochen sitzen und die du bewegen kannst. Aus dem Körperfett abgeleitet.","Steigt, wenn das Körperfett sinkt. Referenzbereiche: Herstellerwerte (Omron) für Haushaltswaagen, nach Geschlecht und Alter."],"muscle_mass":["Muskelmasse","Gewicht minus Fett minus Knochen. Enthält auch Organe und Wasser in den Muskeln, ist also mehr als reine Muskulatur.","Sinnvoll vor allem als eigener Verlauf."],"fat_free_mass":["Fettfreie Masse","Alles außer Fett: Muskeln, Organe, Knochen, Wasser.","Bleibt sie beim Abnehmen gleich, geht vor allem Fett."],"bone_mass":["Knochenmasse","Geschätztes Mineralgewicht der Knochen. Die Waage kann Knochen nicht messen, der Wert folgt aus Gewicht und Körperfett.","Ändert sich in Wirklichkeit nur sehr langsam. Für die Knochengesundheit sagt er nichts aus."],"protein_percentage":["Protein","Geschätzter Eiweißanteil am Gewicht, aus dem Körperfett abgeleitet.","Sinkt das Körperfett, steigt der Wert. Er hat keine eigene Aussagekraft."],"basal_metabolic_rate":["Grundumsatz","Energie, die der Körper in völliger Ruhe pro Tag verbraucht. Hier aus Gewicht und Körperfett geschätzt.","Der Tagesbedarf liegt je nach Bewegung etwa 20–80 % darüber."],"visceral_fat":["Viszeralfett","Schätzung des Fetts im Bauchraum rund um die Organe, als Stufe von 1 bis 30. Aus BMI und Körperfett abgeleitet; die Waage misst es nicht direkt.","Bis 9 gesund, 10–14 erhöht, ab 15 hoch. Schätzung, weicht von der App des Herstellers ab."],"subcutaneous_fat_percentage":["Unterhautfett","Schätzung des Fetts direkt unter der Haut, als Anteil am Gewicht: Körperfett ohne den Anteil im Bauchraum.","Folgt dem Körperfett. Schätzung, weicht von der App des Herstellers ab."],"metabolic_age":["Stoffwechselalter","Schätzung, zu welchem Alter Gewicht, BMI und Körperfett im Durchschnitt passen.","Unter dem tatsächlichen Alter ist gut. Schätzung, weicht von der App des Herstellers ab."],"impedance":["Impedanz","Widerstand des Körpers gegen einen schwachen Strom von Fuß zu Fuß, in Ohm. Mehr Wasser und Muskeln senken ihn.","Hängt stark von feuchten oder trockenen Füßen, Trinken und Uhrzeit ab. Typisch sind einige hundert Ohm."]},"tipsTitle":"Vergleichbar messen","tips":"Immer zur gleichen Zeit wiegen, am besten morgens nach dem Aufstehen und dem Toilettengang, barfuß, mit trockenen Füßen und vor dem Frühstück. Nach Sport, Sauna oder viel Trinken weichen die Körperwerte ab.","disclaimer":"Keine medizinische Beratung. Haushaltswaagen schätzen die Körperzusammensetzung nur. Bei Fragen zu den eigenen Werten bitte ärztlich abklären.","refNames":{"kh":"Kromeyer-Hauschild, Deutschland","who":"WHO, international"},"refShort":{"kh":"Kromeyer-Hauschild","who":"WHO"},"percentileOther":" Nach {name}: Perzentile {p}."},"editor":{"groups":{"basic":"Allgemein","look":"Darstellung","sections":"Bereiche","times":"Zeiten","timer":"Verhalten der Tasten","global":"Für alle Karten (Kinder, Erkennung)","scale":"Waage","view":"Darstellung"},"labels":{"title":"Titel","person":"Nur diese Person","rows":"Zeilen vor „mehr anzeigen“","values_max_age_days":"Werte ohne Impedanz übernehmen (Tage)","language":"Sprache","sort":"Reihenfolge der Personen","skin":"Aussehen der Waage","mode_field_width":"Breite von Rahmen und Feld der Modi","invert_brightness":"Helligkeit des aktiven Modus (invertiert)","invert_modes":"Modi invertiert (unten im Display)","invert_history":"Historienzahl invertiert (oben im Display)","overview":"Übersicht statt Reitern","list":"Zeilen in der Übersicht","hide_empty_pending":"Leere offene Messungen verstecken","pending":"Offene Messungen","next_user":"Waage anzeigen","chart":"Diagramm","profile":"Profilzeile","info":"Werte und Erklärungen","grid":"Raster im Diagramm","curves":"Kinder-Kurven","display_hold":"Ergebnis anzeigen (Minuten)","history_hold":"Historie anzeigen (Sekunden)","choice_minutes":"Dauer einer Vorwahl (Minuten)","refresh_seconds":"Neu zeichnen alle (Sekunden)","key_timer":"Restzeit an der Personentaste","key_blink":"Personentaste blinkt in der letzten Minute","blink_tolerance_kg":"Blinken bei offener Messung ab Abweichung (kg)","baby_max_months":"Baby/Tier bis Alter (Monate)","reference":"Referenz für Kinder","compare_references":"Beide Referenzen vergleichen","growth_who":"WHO-Wachstumsdaten verwenden","growth_kh":"Kromeyer-Hauschild-Daten verwenden","directory":"Verzeichnis-Entität"},"helpers":{"title":"Ohne Titel zeigt die Karte ein Waagen-Symbol.","person":"Name oder Kennung einer Person. Leer = alle.","rows":"Wie viele Messungen die Tabelle zuerst zeigt.","values_max_age_days":"Fehlt dem neuesten Eintrag ein Körperwert (Messung ohne Impedanz), zeigt die Kachel den Wert der letzten Messung damit, wenn sie höchstens so alt ist, blass mit Zeitangabe. 0 = aus.","language":"Automatisch: die Sprache deines Home-Assistant-Profils. Jede andere Wahl: immer diese Sprache.","sort":"Nach Alter: Älteste zuerst, Personen ohne Geburtsdatum zuletzt. Nach Name: alphabetisch.","skin":"Gerät: schwarze Waage mit rotem Display, wie ein echtes Gerät. Theme: Waage und alle Anzeigen (auch das Gewicht) in der Primärfarbe deines Dashboard-Themes, Fläche in Themefarben.","mode_field_width":"Schmal: Rahmen oder Feld sitzt eng um das Symbol (Standard). Breit: so breit wie die Taste darunter. Gilt für die Darstellung mit Rahmen und für die invertierte gleichermaßen, beide haben dieselbe Größe.","invert_brightness":"Nur bei invertierten Modi: Helligkeit des aktiven Feldes in Prozent der Display-Farbe (Standard 65). Niedriger = dezenter. Das eingestellte, ruhende Feld und die Pulsphase in der letzten Minute sind 40 % davon.","invert_modes":"Aus (heute): Das Symbol des aktiven Modus leuchtet, der eingestellte Modus hat einen Rahmen, in der letzten Minute blinkt der Rahmen. An: Das Symbol steht dunkel auf gefülltem Feld (aktiv hell, eingestellt ruhend gedimmt), in der letzten Minute pulsiert das Feld langsam. Die Legende passt sich an.","invert_history":"Aus (heute): Die aufgerufene Zahl 1–10 hat einen Rahmen. An: Die Zahl steht dunkel auf hellem Feld. Sie wird über die Zeit blasser. Die Legende passt sich an.","overview":"Eine Zeile je Person mit letztem Gewicht statt Reiter und Diagramm.","list":"In der Übersicht: aus = nur die Waage, die Personentasten führen zu den Ansichten (Verknüpfungen im YAML: `links`).","hide_empty_pending":"Den Bereich „Offene Messungen“ ausblenden, solange nichts offen ist.","pending":"Bereich mit offenen, noch nicht zugeordneten Messungen.","next_user":"Aus = die ganze Waage (Display, Modustasten, Personentasten) wird ausgeblendet. Ohne sie lässt sich nicht vorwählen.","key_blink":"Zusätzlich zur gewählten Art blinkt die Taste in der letzten Minute. Standard aus.","chart":"Verlaufsdiagramm unter der Tabelle.","profile":"Zeile mit Alter, Größe und Fett-Methode unter dem Namen.","info":"Wertekacheln mit Bewertung und der einklappbare Abschnitt „So rechnet die Waage“.","grid":"Aus = Diagramm ohne Raster und ohne Raster-Knopf.","curves":"Aus = nie Perzentil-Kurven der Kinder zeichnen.","display_hold":"So lange bleibt ein Ergebnis im Display, danach geht es in Ruhe.","history_hold":"So lange bleibt eine aufgerufene ältere Messung (1–10) stehen. Die Wahl bleibt erhalten.","choice_minutes":"Dauer von Vorwahl und anschließender Automatik. 0 = Wartezeit der Integration.","refresh_seconds":"0 = aus. Empfohlen 10, wenn mehrere Ansichten gleichzeitig offen sind.","key_timer":"Wie die leuchtende Personentaste die Restzeit zeigt, eine Art schließt die anderen aus. Rahmen wird dünner: dick am Anfang, am Ende wie jede Taste. Rand läuft zurück: ein Rand um die Taste schrumpft wie ein Zeiger. Taste dunkelt ab: sie wird bis zum Ablauf dunkler. Keine: nichts. Gast und Baby/Tier zeigen ihre Zeit am Symbol im Display (Rahmen blinkt in der letzten Minute), Automatik blinkt nie.","blink_tolerance_kg":"Bei einer offenen Messung blinken die Vorschläge und jede Person, deren letztes Gewicht höchstens so weit abweicht.","baby_max_months":"Personen unter diesem Alter bekommen das Baby/Tier-Ergebnis zum Speichern angeboten.","reference":"WHO 2007: internationale Referenz, 5–19 Jahre. Kromeyer-Hauschild: deutsche Referenz, 0–18 Jahre. Sie bestimmt Perzentile, Bewertung und Kurven.","compare_references":"Beide Referenzen nebeneinander zeigen (Diagramm, BMI-Erklärung).","growth_who":"Lädt die WHO-Tabelle 2007 (de Onis et al., Lizenz CC BY-NC-SA 3.0 IGO: Namensnennung, nicht kommerziell, gleiche Bedingungen) aus der Datei neben der Karte. Nötig für Perzentile und Kurven bei Kindern. Wird nur geladen, wenn hier aktiviert.","growth_kh":"Lädt die Tabelle von Kromeyer-Hauschild 2001 (Lizenz GPL-3.0-or-later, wie im R-Paket childsds) aus der Datei neben der Karte. Nötig für Perzentile und Kurven nach der deutschen Referenz. Wird nur geladen, wenn hier aktiviert.","directory":"Nur nötig, wenn die Karte das Verzeichnis nicht selbst findet."},"options":{"language":{"auto":"Automatisch"},"sort":{"age":"Nach Alter","name":"Nach Name"},"skin":{"device":"Gerät (schwarz/rot)","theme":"Theme"},"mode_field_width":{"narrow":"Schmal (um das Symbol)","wide":"Breit (Tastenbreite)"},"key_timer":{"frame":"Rahmen wird dünner","ring":"Rand läuft zurück","fade":"Taste dunkelt ab","none":"Keine","custom":"Benutzerdefiniert (YAML)"},"reference":{"who":"WHO 2007","kh":"Kromeyer-Hauschild"}}}},"en":{"_meta":{"language":"English","machine_translated":false},"ui":{"title":"Scale","overview":"Scale","holdOpen":"hold to open their view","pending":"Open measurements","noPending":"No open measurements.","assignTo":"Assign to","assign":"Assign","next":"Next on the scale","auto":"Automatic","guest":"Guest","until":"until {t}","discard":"Guest / discard","discardShort":"Discard","confirmDiscard":"Discard the measurement from {m}? It is not assigned to anyone and not stored.","guestResult":"Guest","chartLegendTitle":"Chart and table: controls and markings","chartLegend":[["_","Using the chart"],["views","View: composition, BMI, height; for children also weight + percentile."],["comppct","%: in the composition view, switch between kg and percent (weight + fat in percent)."],["periods","Period: 30 days, 1 year, all. Without a filter the line comes from the long-term statistics over all years (daily means, weekly for \"all\")."],["fc","Clothes filter: any, only weighed without or only with clothes. Applies to weight, BMI and composition."],["fi","Impedance filter: any, only with or only without impedance. Applies to the body composition only (fat, water, muscle), the only values that need impedance. Weight, BMI and height do not depend on it."],["fnote","With a filter only the stored single entries count (as far back as the integration keeps them), not the long-term statistics; a note under the chart gives the start. If no entry fits, the chart stays empty. Height has no filters."],["grid","Grid on/off."],["curves","Curves on/off. Adults: BMI ranges. Children: two buttons WHO and DE (Kromeyer-Hauschild); a tap picks the reference, a second tap hides the curves."],["_","Table under the chart (one row per reading)"],["tshirt","T-shirt: weighed with clothes (filled) or without (outline). A tap switches it; the reading is stored again with the same time and replaces the old one."],["move","Move: gives the reading to another person (their profile recalculates the body values), after confirmation."],["delete","Delete: removes the reading for good, after confirmation. It disappears from the single entries, not from the sensors' long-term statistics."],["hight","Height: the Height view has a table of its own. Pencil = correct an entry, bin = delete an entry, plus = add a new height."],["_","Markings"],["est","Faded or dotted: estimated. There is no measured value for that time, the last or next known one applies, with a bridge in between."],["old","Faded line before a method change: values from the earlier body-fat calculation."],["switch","Method change: 1 = standard, 2 = alternative, + = athlete. Here from 1 to 2."],["pct","Orange dotted: percentile curves P3, P10, P50, P90 and P97 of the chosen reference (WHO or DE)."]],"howTitle":"How the scale works","how":[["auto","Automatic","Just step on: the scale recognises the person by weight, compared with the history so far."],["tap","Preselect","Tap a person, guest or baby/pet first. The key lights up and the choice lasts a few minutes (a person's frame gets thinner; for guest and baby/pet the frame of their symbol in the display blinks in the last minute, automatic never). When it runs out the scale switches to Automatic (active, 00.00) for the same time, then to rest."],["done","Recognised","If exactly one person fits, they get the reading. Their key lights up and the result stays for a few minutes (display_hold, default 5)."],["open","Unclear","If nobody or several fit, the reading stays open. People without readings and the nearest person blink in turn with the guest key. Tap a person = assign, guest key = keep as a guest, not stored."],["guest","Guest","Weight only, nothing is stored."],["baby","Baby/pet","Two steps: alone first, then holding the baby/pet. The display shows the difference. If a baby (under 2 years) is a person, their key blinks in turn with the guest key: tap the baby = store the weight only, guest key = do not store."],["timer","Time running out","A person's time shows on their lit key: its frame gets thinner (default, `key_timer`), optionally an outline runs back or the key darkens. Guest and baby/pet show their time on their symbol in the display: its frame blinks in the last minute. Automatic never blinks. The three mode keys themselves never light up. There are four times: preselect (waiting time, set with `choice_minutes`), then Automatic active (the same time), the result (`display_hold`) and the history (`history_hold`)."],["sync","Weigh again","Stepping on again soon after replaces the previous reading."],["hist","Earlier readings","The numbers 1–10 at the top of the display call them up. A second tap, or history_hold seconds later (default 30), goes back to the previous state."],["fat","Body fat","Method 1 (standard), 2 (alternative) or athlete. Without impedance (socks, shoes) weight only."],["bmi","Children","BMI as a percentile (WHO or DE), curves in the chart."],["pending","Open readings","Assign, move or discard them below the scale. The notification goes to the suggested people."]],"flowTitle":"Flow","flow":{"idle":"Rest","pre":"Preselect","weigh":"Weigh","known":"Recognised","gb":"Guest / Baby/pet","open":"Unclear","result":"Result","hist":"History","auto":"Automatic","back":"Back","step":"weigh","tap":"tap","person":"tap a person"},"flowNote":"Rest is the state with nothing displayed. Whoever steps on the scale is weighed in Automatic. For “Unclear” the guest key returns to rest (not stored); guest and baby/pet are only shown.","timesTitle":"Times","times":{"pre":"{T} min","auto":"{T} min","res":"{H} min","hist":"{Y} s"},"timesNote":"You set all times in the card: preselect and automatic with choice_minutes (the integration only resets the preselection after that time), the result with display_hold, the history with history_hold. Without choice_minutes the integration's waiting time applies.","confirmBaby":"Store the baby result ({w} kg) for {n}? Only the weight is stored.","babySave":"Store","babyDismiss":"Do not store","growthHint":"Percentiles and curves need the growth data {ref} (separate file, licence {licence}).","growthEnable":"Enable","legendTitle":"Scale symbols","legend":[["hist","Look at an earlier reading (1 = newest), tap again = back"],["ohm","Impedance in ohms, beside it kg with the change since the reading before"],["arrow","▲ up, ▼ down, ▬ same (since the reading before)"],["bmi","BMI, for children the percentile (P)"],["fat","Body fat in percent, only with impedance"],["shoe","Measured without impedance (socks, shoes, dry feet): weight only"],["sync","Replaces the reading from a moment ago"],["lift","Athlete curve"],["m1","Body-fat method 1: standard"],["m2","Body-fat method 2: alternative"],["nosave","Not stored (guest, baby/pet)"],["auto","Automatic key: the scale recognises the person by weight"],["guest","Guest key (one tap switches, not stored)"],["baby","Baby/pet key (alone first, then holding the baby/pet)"],["dim","Dim: off. A dim frame around the Automatic symbol shows in rest that Automatic is preselected."],["lit","Lit: active now. The person key or the symbol in the display waits for a reading or belongs to the result shown (person, guest, baby/pet). The mode keys stay dark."],["frame","Time left (default) on a person key: the frame starts thick and thins out until it is as thin as on any key. For Guest and baby/pet the frame of the symbol in the display blinks instead, in the last minute (Automatic never)."],["ring","Optional (key_timer: ring): the outline of a person key runs back like a hand."],["fade","Optional (key_timer: fade): the key darkens. Blinking in the last minute is an option of its own (key_blink)."],["blink","Blinking: reading open. The suggested people and the guest key (with its symbol) blink in turn."]],"guestNote":"not stored","sincePrevious":"Change since the reading before","holdSteps":["1/2 alone","2/2 with baby/pet"],"legendInv":{"hist":"Look at an earlier reading (1 = newest): the number called up has a light background. Tap again to go back.","dim":"Set, resting: the mode's symbol (e.g. Automatic at rest) has a dim background, otherwise it only shows the dimmed symbol.","lit":"Active: the symbol in the display has a light background while the mode waits for a reading or belongs to the result. The person key lights up. The mode keys stay dark."},"howInv":{"timer":"A person's time shows on their lit key (frame, ring or darkening, `key_timer`). Guest and baby/pet show their time on their symbol in the display: in the last minute the filled field pulses slowly (bright and dim). Automatic never blinks. There are four times: preselect (`choice_minutes`), then Automatic active (the same time), the result (`display_hold`) and the history (`history_hold`)."},"carriedFrom":"As of {when} (last reading with this value)","holdSame":"Both readings almost equal: was the baby/pet on the scale? Nothing to store.","replaced":"replaces the reading from a moment ago","whoWasIt":"Who was it? Tap a key","hold":"Baby/pet","latest":"Latest","days":"{n} days","years":"{n} years","noChart":"No history yet.","filterClothed":{"any":"Clothes: any","yes":"Only weighed with clothes","no":"Only weighed without clothes"},"filterImpedance":{"any":"Impedance: any","with":"Only readings with impedance","without":"Only readings without impedance"},"filterHint":"With a filter only the stored single entries count, from {date}.","filterNone":"With a filter only stored single entries count; there are none yet.","filterEmpty":"With this filter there are no entries with these values. Body values exist only for readings with impedance.","clothedOn":"Weighed with clothes (tap: without)","clothedOff":"Weighed without clothes (tap: with clothes)","periods":{"month":"30 days","year":"1 year","all":"All"},"chartViews":{"fat":"Weight + fat","composition":"Composition","percentile":"Weight + percentile","height":"Height","bmi":"BMI"},"comp":{"ffm":"Fat-free","tissue":"Tissue","substances":"Substances","fat":"Fat","subcut":"Subcutaneous fat","restFat":"Remaining fat (incl. visceral)","muscle":"Muscle and organs","bone":"Bone","water":"Water","protein":"Protein","rest":"Remainder","visceral":"Visceral fat","total":"Weight","pct":"Weight + fat in percent","kg":"Composition in kg"},"chartLabels":{"weight":"Weight","body_fat_percentage":"Fat","fat_mass":"Fat mass","fat_free_mass":"Fat-free mass","bmi_percentile":"BMI percentile","height":"Height","height_percentile":"Height percentile","body_mass_index":"BMI"},"heightOld":"height entered {n} months ago","heightAsk":"How tall is {name} now?","heightEdit":"Change height","heightAdd":"Enter height","change":"Change","confirmDelHeight":"Delete the height from {h} for {p}?","private":"Only visible to this person and admins","newMeasurement":"new measurement","heightNow":"update now","heightRange":"Please enter a height between 40 and 250 cm.","save":"Save","grid":"Grid","bandsFor":{"male":"boys","female":"girls"},"sexes":{"male":"male","female":"female"},"curvesToggle":"Curves on/off","zonesValue":"WHO · normal 18.5–25","zoneShort":["under","normal","over","obese"],"measurements":"Measurements","allGood":"{n} values in range","noMeasurements":"No measurements yet.","date":"Date","more":"Show more","less":"Show less","move":"Move","remove":"Delete","cancel":"Cancel","impedance":"with impedance","noImpedance":"weight only","suggested":"matches the weight","confirmAssign":"Assign the measurement from {m} to {p}?","confirmMove":"Move the measurement from {m} from {f} to {t}? Body values are recalculated for {t}.","confirmRemove":"Permanently delete the measurement from {m} of {p}?","pickTarget":"Move the measurement from {m} to:","notFound":"No scale found. Does the integration offer the scale interface (S), and is Home Assistant restarted?","failed":"That did not work:","cols":{"weight":"Weight","body_mass_index":"BMI","body_fat_percentage":"Fat","muscle_mass":"Muscle","body_water_percentage":"Water","skeletal_muscle_percentage":"Skel. m.","bone_mass":"Bone","protein_percentage":"Protein","basal_metabolic_rate":"BMR","fat_free_mass":"Fat-free","visceral_fat":"Visceral","subcutaneous_fat_percentage":"Subcut.","metabolic_age":"Met. age","impedance":"Impedance"}},"info":{"title":"Understanding the values","bands":{"low":"low","ok":"normal","high":"elevated","veryHigh":"high"},"bmiBands":["Under","Normal","Over","Obese"],"howTitle":"How the scale calculates","how":["The scale measures only two things: <b>weight</b> and <b>impedance</b>, i.e. how well a weak current flows through the body from foot to foot.","A formula estimates <b>body fat</b> from these. All other values (water, muscle, protein, bone, metabolic rate) are then derived from body fat and weight with fixed factors. They therefore always move together and are not separate measurements.","The <b>trend</b> over weeks is more reliable than a single reading."],"algoTitle":"Calculation methods","algos":{"standard":["Standard","Mostly BMI, age and sex. Impedance shifts the result by only about 1 percentage point. Very stable, but barely reacts to training."],"alternative":["Alternative","First calculates fat-free mass from height, weight, age and impedance, the rest is fat. Impedance plays only a small part here too. Usually 4–6 percentage points above standard. Use whichever matches the manufacturer's app."],"athlete":["Athlete","Flatter curve without impedance. For people with a lot of muscle whose high BMI does not come from fat. Gives clearly less fat throughout, often 5–8 percentage points."]},"yourValues":"With the latest reading this would give","active":"active","activeNote":"Framed: the method in use.","normal":"normal","athleteCol":"Athlete","setHint":"Change it in the scale integration's settings (Settings → Devices & services), at the user.","child":"Under 18 the adult formulas and ranges do not apply. For children and teenagers the BMI percentile for age and sex is what counts; it is shown with the BMI. The calculation is fixed to standard. Body fat and the derived values are only rough estimates.","avgForWeight":"Average at this weight about {v} kg","realAge":"Actual age: {n} years","ageBands":{"ok":"younger","high":"older"},"visceralBands":["healthy","high","very high"],"percentile":"BMI percentile {p} ({ref}): {c}. Of 100 children of the same age and sex, {p} have a lower BMI.{other}","categories":{"thinness":"thinness","normal":"normal","overweight":"overweight","obesity":"obesity"},"kidBmi":{"who":"Children and teenagers (WHO, 5–19 years): below percentile 2.3 thinness, up to 84 normal, up to 97.7 overweight, above that obesity.","kh":"Children and teenagers (Kromeyer-Hauschild, 0–18 years): below percentile 10 thinness, up to 90 normal, up to 97 overweight, above that obesity."},"kidRanges":{"body_fat_percentage":"There are no reliable ranges from the scale for children. Only look at the trend.","body_water_percentage":"Children have a higher share of water than adults. The adult ranges do not apply."},"mifflin":"For comparison, Mifflin-St Jeor (without body fat): {v} kcal","heightBands":["short","normal","tall"],"heightCuts":"Usual range: percentiles 3 to 97 (WHO: 2.3 to 97.7). Outside it, talk to a paediatrician if the height changes suddenly.","heightPct":"Height percentile {p} ({ref}): of 100 children of the same age and sex, {p} are shorter.","compTitle":"Composition","compSub":"Fat / fat-free","compIntro":"The same weight in two splits: by tissue and by substance. Each bar adds up to the whole weight; the fat is the same in both and split by depth (two shades of orange). Everything is derived from body fat and weight; these are not separate measurements.","compKid":"For children these are only rough estimates.","compInfo":{"fat":"Share of body fat in weight, estimated from the impedance. Everything else is the fat-free mass.","muscle":"Weight minus fat minus bone. Includes organs and the water in muscle, not muscle alone.","bone":"Estimated from body fat and weight, not measured.","subcut":"Fat directly under the skin. The rest is remaining fat, which includes the visceral fat around the organs.","restFat":"Remaining fat, including the visceral fat around the organs.","visceral":"A level for the fat around the organs (up to 9 healthy), not a mass. It cannot be separated out of the total fat.","water":"Body water. Muscle holds a lot of water, fat little.","protein":"Protein, mostly in muscle.","rest":"Weight minus water, fat and protein, mostly minerals."},"metrics":{"body_mass_index":["BMI","Weight divided by height squared. Simple and comparable, but does not distinguish muscle from fat.","Adults (WHO): below 18.5 underweight, 18.5–24.9 normal, 25–29.9 overweight, 30 and above obese."],"body_fat_percentage":["Body fat","Share of fat in body weight. Calculated from BMI, age, sex and impedance (see calculation methods).","Healthy ranges rise slightly with age. During the day the value varies by several percentage points (drinking, eating, exercise)."],"body_water_percentage":["Body water","Share of water in body weight. Muscle holds a lot of water, fat little. Derived from body fat here: less fat means more water.","Adults about 45–60 % (women) or 50–65 % (men)."],"skeletal_muscle_percentage":["Skeletal muscle","Share of the muscles attached to the bones that you can move. Derived from body fat.","Rises when body fat falls. Reference ranges: manufacturer values (Omron) for home scales, by sex and age."],"muscle_mass":["Muscle mass","Weight minus fat minus bone. Also includes organs and the water in muscle, so it is more than muscle alone.","Most useful as your own trend."],"fat_free_mass":["Fat-free mass","Everything except fat: muscle, organs, bone, water.","If it stays the same while you lose weight, you are mainly losing fat."],"bone_mass":["Bone mass","Estimated mineral weight of the bones. The scale cannot measure bone; the value follows from weight and body fat.","In reality it changes only very slowly. It says nothing about bone health."],"protein_percentage":["Protein","Estimated share of protein in body weight, derived from body fat.","Rises when body fat falls. It has no meaning of its own."],"basal_metabolic_rate":["Basal metabolic rate","Energy the body uses per day at complete rest. Estimated from weight and body fat here.","Daily needs are about 20–80 % higher, depending on activity."],"visceral_fat":["Visceral fat","Estimate of the fat inside the abdomen around the organs, as a level from 1 to 30. Derived from BMI and body fat; the scale does not measure it directly.","Up to 9 healthy, 10–14 high, 15 and above very high. An estimate; differs from the manufacturer's app."],"subcutaneous_fat_percentage":["Subcutaneous fat","Estimate of the fat directly under the skin, as a share of body weight: body fat without the part inside the abdomen.","Follows body fat. An estimate; differs from the manufacturer's app."],"metabolic_age":["Metabolic age","Estimate of the age that weight, BMI and body fat match on average.","Below the actual age is good. An estimate; differs from the manufacturer's app."],"impedance":["Impedance","The body's resistance to a weak current from foot to foot, in ohms. More water and muscle lower it.","Depends strongly on damp or dry feet, drinking and time of day. A few hundred ohms are typical."]},"tipsTitle":"Measuring comparably","tips":"Weigh at the same time every day, ideally in the morning after getting up and using the toilet, barefoot, with dry feet and before breakfast. After exercise, sauna or drinking a lot the body values differ.","disclaimer":"Not medical advice. Bathroom scales only estimate body composition. Please ask a doctor about your own values.","refNames":{"kh":"Kromeyer-Hauschild, Germany","who":"WHO, international"},"refShort":{"kh":"Kromeyer-Hauschild","who":"WHO"},"percentileOther":" By {name}: percentile {p}."},"editor":{"groups":{"basic":"General","look":"Appearance","sections":"Sections","times":"Times","timer":"Key behaviour","global":"For all cards (children, recognition)","scale":"Scale","view":"Appearance"},"labels":{"title":"Title","person":"Only this person","rows":"Rows before “show more”","values_max_age_days":"Carry over values without impedance (days)","language":"Language","sort":"Order of people","skin":"Look of the scale","mode_field_width":"Width of the mode frame and field","invert_brightness":"Brightness of the active mode (inverted)","invert_modes":"Modes inverted (bottom of the display)","invert_history":"History number inverted (top of the display)","overview":"Overview instead of tabs","list":"Rows in the overview","hide_empty_pending":"Hide empty open measurements","pending":"Open measurements","next_user":"Show the scale","chart":"Graph","profile":"Profile line","info":"Values and explanations","grid":"Graph grid","curves":"Children's curves","display_hold":"Show result (minutes)","history_hold":"Show history (seconds)","choice_minutes":"Preselect duration (minutes)","refresh_seconds":"Redraw every (seconds)","key_timer":"Time left on the person key","key_blink":"Person key blinks in the last minute","blink_tolerance_kg":"Blink for an open reading within (kg)","baby_max_months":"Baby/pet up to age (months)","reference":"Reference for children","compare_references":"Compare both references","growth_who":"Use WHO growth data","growth_kh":"Use Kromeyer-Hauschild data","directory":"Directory entity"},"helpers":{"title":"Without a title the card shows a scale symbol.","person":"Name or id of one person. Empty = everybody.","rows":"How many readings the table shows first.","values_max_age_days":"If the newest reading lacks a body value (no impedance), the tile shows the value of the last reading that has it if that is at most this old, dimmed with its time. 0 = off.","language":"Automatic: the language of your Home Assistant profile. Any other choice: always that language.","sort":"By age: oldest first, people without a birth date last. By name: alphabetical.","skin":"Device: black scale with a red display, like a real device. Theme: scale and all displays (the weight too) in your dashboard theme's primary colour, surface in theme colours.","mode_field_width":"Narrow: the frame or field sits tight around the symbol (default). Wide: as wide as the key below. Applies to the frame style and the inverted one alike, both have the same size.","invert_brightness":"Only for inverted modes: brightness of the active field in percent of the display colour (default 65). Lower = more subtle. The set, resting field and the pulse phase in the last minute are 40 % of it.","invert_modes":"Off (today): the symbol of the active mode lights up, the set mode has a frame, in the last minute the frame blinks. On: the symbol is dark on a filled field (active bright, set and resting dim), in the last minute the field pulses slowly. The legend adapts.","invert_history":"Off (today): the number 1–10 called up has a frame. On: the number is dark on a light field. It fades over time. The legend adapts.","overview":"One row per person with the latest weight instead of tabs and graph.","list":"In the overview: off = only the scale, the person keys lead to the views (links in YAML: `links`).","hide_empty_pending":"Hide the open-measurements section while nothing is open.","pending":"Section with open, not yet assigned readings.","next_user":"Off = the whole scale (display, mode keys, person keys) is hidden. Without it nothing can be preselected.","key_blink":"In addition to the chosen kind the key blinks in the last minute. Default off.","chart":"History graph under the table.","profile":"Line with age, height and fat method under the name.","info":"Value tiles with a rating and the collapsible “How the scale calculates” section.","grid":"Off = graph without grid and without the grid button.","curves":"Off = never draw the children's percentile curves.","display_hold":"How long a result stays in the display before it goes idle.","history_hold":"How long an older reading (1–10) stays. The choice is kept.","choice_minutes":"Duration of a preselect and of the Automatic phase after it. 0 = the integration's waiting time.","refresh_seconds":"0 = off. 10 is recommended when several views are open at once.","key_timer":"How the lit person key shows the time left, one kind excludes the others. Frame gets thinner: thick at first, like any key at the end. Outline runs back: an outline around the key shrinks like a hand. Key darkens: it gets darker until the end. None: nothing. Guest and baby/pet show their time on their symbol in the display (frame blinks in the last minute), Automatic never blinks.","blink_tolerance_kg":"For an open reading the suggestions and everybody whose last weight is at most this far off blink.","baby_max_months":"People younger than this are offered the baby/pet result to store.","reference":"WHO 2007: international reference, 5–19 years. Kromeyer-Hauschild: German reference, 0–18 years. It decides percentiles, rating and curves.","compare_references":"Show both references side by side (graph, BMI explanation).","growth_who":"Loads the WHO 2007 table (de Onis et al., licence CC BY-NC-SA 3.0 IGO: attribution, non-commercial, share-alike) from the file next to the card. Needed for children's percentiles and curves. Loaded only when enabled here.","growth_kh":"Loads the Kromeyer-Hauschild 2001 table (licence GPL-3.0-or-later, as in the R package childsds) from the file next to the card. Needed for percentiles and curves after the German reference. Loaded only when enabled here.","directory":"Only needed if the card does not find the directory itself."},"options":{"language":{"auto":"Automatic"},"sort":{"age":"By age","name":"By name"},"skin":{"device":"Device (black/red)","theme":"Theme"},"mode_field_width":{"narrow":"Narrow (around the symbol)","wide":"Wide (key width)"},"key_timer":{"frame":"Frame gets thinner","ring":"Outline runs back","fade":"Key darkens","none":"None","custom":"Custom (YAML)"},"reference":{"who":"WHO 2007","kh":"Kromeyer-Hauschild"}}}}};
const I18N_NAMES = {"de":"Deutsch","en":"English","es":"Español","fr":"Français","it":"Italiano","ru":"Русский"};

const cardFolder = (() => {
  // Folder of this script (works as module and as classic script).
  try {
    let src = document.currentScript && document.currentScript.src;
    if (!src) {
      const m = String(new Error().stack).match(/(https?:\/\/[^\s)]*?body-scale-card[^\s):]*\.js)/);
      if (m) src = m[1];
    }
    if (!src) src = ([...document.querySelectorAll("script[src]")].find((s) => /body-scale-card[^/]*\.js/.test(s.src)) || {}).src;
    return src ? new URL("./", src.split("?")[0]).href : null;
  } catch (e) { return null; }
})();

// All files of the card lie flat in one folder (HACS installs only the files directly in dist/).
const i18nBase = cardFolder && cardFolder + "body-scale-card.i18n.";

const i18nFill = (text, vars) => String(text).replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
const i18nMerge = (base, over) => {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base) || Array.isArray(over) || typeof base !== "object" || typeof over !== "object" || base === null) return over;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = i18nMerge(base[k], over[k]);
  return out;
};
// Texts with values become functions (the code calls t.until(x), it.percentile(...)).
const i18nBuild = (raw) => {
  const ui = { ...raw.ui }, info = { ...raw.info }, editor = raw.editor;
  for (const [k, params] of Object.entries(I18N_FN.ui)) {
    const tpl = ui[k];
    ui[k] = (...a) => i18nFill(tpl, Object.fromEntries(params.map((p, i) => [p, a[i]])));
  }
  const times = ui.times;
  ui.times = (a) => Object.fromEntries(Object.entries(times).map(([k, v]) => [k, i18nFill(v, a)]));
  for (const [k, params] of Object.entries(I18N_FN.info)) {
    const tpl = info[k];
    if (k === "percentile" || k === "heightPct") {
      info[k] = (p, ...rest) => {
        const ref = k === "percentile" ? rest[1] : rest[0];
        const other = k === "percentile" ? rest[2] : null;
        const c = k === "percentile" ? rest[0] : "";
        const key = ref === "kh" ? "kh" : "who", otherKey = ref === "kh" ? "who" : "kh";
        const more = other != null ? i18nFill(info.percentileOther, { name: info.refShort[otherKey], p: other }) : "";
        return i18nFill(tpl, { p, c, ref: info.refNames[key], other: more });
      };
    } else info[k] = (...a) => i18nFill(tpl, Object.fromEntries(params.map((p, i) => [p, a[i]])));
  }
  return { ui, info, editor };
};
const i18nCache = {};
const i18nPending = {};
const i18nListeners = new Set();
const i18nCode = (lang) => String(lang || "en").slice(0, 2).toLowerCase();
function i18nLoad(code) {
  if (i18nPending[code] !== undefined || !i18nBase || !/^[a-z]{2}$/.test(code)) return;
  i18nPending[code] = true;
  fetch(`${i18nBase}${code}.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
    .then((json) => {
      I18N_EMBEDDED[code] = json;
      I18N_NAMES[code] = (json._meta && json._meta.language) || code;
      delete i18nCache[code];
      i18nListeners.forEach((fn) => { try { fn(); } catch (e) { console.warn("body-scale-card: redraw after language load failed", e); } });
    })
    .catch((e) => console.warn(`body-scale-card: no translation for "${code}" (${e && e.message}); using English`));
}
function i18n(lang) {
  const code = i18nCode(lang);
  if (i18nCache[code]) return i18nCache[code];
  const raw = I18N_EMBEDDED[code];
  if (!raw) { i18nLoad(code); return i18n("en"); }
  return (i18nCache[code] = i18nBuild(code === "en" ? raw : i18nMerge(I18N_EMBEDDED.en, raw)));
}
const uiText = (lang) => i18n(lang).ui;
const infoText = (lang) => i18n(lang).info;
const editorText = (lang) => i18n(lang).editor;

/*
 * Module constants: fixed lists and reference values
 *
 * Units, chart views and periods, default table columns, healthy ranges (body fat,
 * muscle, water), the value tiles and which metrics need impedance. No logic.
 */

const UNITS = {
  weight: "kg",
  body_fat_percentage: "%",
  body_water_percentage: "%",
  skeletal_muscle_percentage: "%",
  protein_percentage: "%",
  subcutaneous_fat_percentage: "%",
  muscle_mass: "kg",
  bone_mass: "kg",
  fat_free_mass: "kg",
  basal_metabolic_rate: "kcal",
  impedance: "Ω",
};

// Graph: two values, each with its own axis (`shared: true` would share one).
const CHART_VIEWS = {
  fat: { left: "weight", right: "body_fat_percentage", load: ["weight", "body_fat_percentage"] },
  // Own axis each, too: on one kg axis (20 vs 64 kg) a 1 kg change looks flat.
  composition: { left: "fat_free_mass", right: "fat_mass", load: ["weight", "fat_free_mass"] },
  percentile: { left: "weight", right: "bmi_percentile", load: ["weight", "bmi_percentile"] },
  height: { left: "height", right: "height_percentile", bands: "height_percentile", load: ["height", "height_percentile"] },
  bmi: { left: "body_mass_index", right: "bmi_percentile", bands: "bmi_percentile", load: ["body_mass_index", "bmi_percentile"] },
};
const CHART_UNITS = {
  weight: "kg", fat_mass: "kg", fat_free_mass: "kg", body_fat_percentage: "%",
  bmi_percentile: "P", height: "cm", height_percentile: "P", body_mass_index: "",
};
const CURVE_LABELS = [3, 10, 50, 90, 97];

const PERIODS = {
  month: { days: 30, period: "day" },
  year: { days: 365, period: "day" },
  all: { days: 365 * 30, period: "week" },
};

const DEFAULT_COLUMNS = [
  "weight",
  "body_mass_index",
  "body_fat_percentage",
  "muscle_mass",
  "body_water_percentage",
];

// Healthy body-fat ranges for adults by age (Gallagher et al. 2000,
// Am J Clin Nutr 72:694): [low below, healthy up to, overfat up to].
const FAT_BANDS = {
  male: [[39, 8, 20, 25], [59, 11, 22, 28], [200, 13, 25, 30]],
  female: [[39, 21, 33, 39], [59, 23, 34, 40], [200, 24, 36, 42]],
};
// Skeletal muscle (whole body) of adults by age, Omron Healthcare reference values:
// [age up to, low below, high from].
const SMM_BANDS = {
  male: [[39, 33.3, 39.4], [59, 33.1, 39.2], [200, 32.9, 39.0]],
  female: [[39, 24.3, 30.4], [59, 24.1, 30.2], [200, 23.9, 30.0]],
};
// Typical total body water of adults (consumer BIA reference values).
const WATER_BANDS = { male: [50, 65], female: [45, 60] };

const INFO_METRICS = [
  "body_mass_index",
  "body_fat_percentage",
  "body_water_percentage",
  "skeletal_muscle_percentage",
  "muscle_mass",
  "fat_free_mass",
  "bone_mass",
  "protein_percentage",
  "basal_metabolic_rate",
  "visceral_fat",
  "subcutaneous_fat_percentage",
  "metabolic_age",
  "impedance",
];
const TILE_ORDER = [
  "composition", "body_mass_index", "height", "body_fat_percentage", "visceral_fat", "muscle_mass", "skeletal_muscle_percentage",
  "body_water_percentage", "bone_mass", "subcutaneous_fat_percentage", "fat_free_mass", "protein_percentage",
  "metabolic_age", "basal_metabolic_rate", "impedance",
];
// One symbol per body value (tiles under the graph).
// How long a person key is held to open the person's view.
const HOLD_MS = 800;
// Height of the band above the plot that holds the graph's title and toggles.
const HEAD_H = 38;

const METRIC_ICONS = {
  body_mass_index: "body_scale:bmi", body_fat_percentage: "body_scale:body-fat", body_water_percentage: "mdi:water-percent",
  skeletal_muscle_percentage: "body_scale:knee", muscle_mass: "mdi:arm-flex", fat_free_mass: "mdi:human-male",
  bone_mass: "body_scale:bone-mass", protein_percentage: "mdi:hexagon-multiple-outline", basal_metabolic_rate: "body_scale:basal-metabolic",
  visceral_fat: "mdi:stomach", subcutaneous_fat_percentage: "body_scale:subcutaneous-fat", metabolic_age: "mdi:dna",
  impedance: "mdi:flash-outline",
};
// Estimates the manufacturer's app also shows; adults only, so no tile without a value.
// Values that change with the body-fat method.
const METHOD_VALUES = ["body_fat_percentage", "body_water_percentage", "skeletal_muscle_percentage", "muscle_mass", "fat_free_mass", "bone_mass", "protein_percentage", "basal_metabolic_rate", "visceral_fat", "subcutaneous_fat_percentage", "metabolic_age"];
const ESTIMATES = ["visceral_fat", "subcutaneous_fat_percentage", "metabolic_age"];

// The parts a source may offer: scale (S) and history (H).
const SCALE_CAPS = ["next_user", "pending", "guest", "set_entry", "set_height"];
const HISTORY_SERVICES = { entries: "get_entries", series: "get_series", write: "delete_entry", set_entry: "set_entry", set_height: "set_height" };
// Metrics a line can be asked for (the vocabulary of interface H).
// Values that do not depend on the impedance (the rest needs it for the body values).
const IMPEDANCE_FREE = ["weight", "body_mass_index", "height", "bmi_percentile", "height_percentile"];
const SERIES_METRICS = ["weight", "body_mass_index", "body_fat_percentage", "body_water_percentage", "skeletal_muscle_percentage", "protein_percentage", "subcutaneous_fat_percentage", "muscle_mass", "bone_mass", "fat_free_mass", "basal_metabolic_rate", "visceral_fat", "metabolic_age"];

/*
 * Module chart-math: axis ticks and smooth lines
 *
 * Pure helpers for the graph: round axis values, date ticks, and a smooth line that
 * never overshoots its points. No access to the card.
 */

// About `count` round axis values (steps of 1, 2 or 5 times a power of ten).
function niceTicks(v0, v1, count) {
  const raw = (v1 - v0) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((f) => f * mag).find((s) => s >= raw) || 10 * mag;
  const out = [];
  for (let v = Math.ceil(v0 / step) * step; v <= v1; v += step) out.push(+v.toFixed(6));
  out.digits = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  return out;
}

// Month starts (or year starts over long spans) between t0 and t1, at most ~8.
function timeTicks(t0, t1) {
  const span = t1 - t0;
  if (span <= 0) return [];
  if (span < 10 * 86400000) {
    // A few days: every day, or every second one.
    const d = new Date(t0);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() < t0) d.setDate(d.getDate() + 1);
    const out = [];
    for (; d.getTime() <= t1; d.setDate(d.getDate() + (span > 5 * 86400000 ? 2 : 1))) out.push(d.getTime());
    return out;
  }
  if (span < 62 * 86400000) {
    // Short spans: Mondays (every second one over a month).
    const d = new Date(t0);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7));
    const out = [];
    for (; d.getTime() <= t1; d.setDate(d.getDate() + (span > 35 * 86400000 ? 14 : 7))) if (d.getTime() >= t0) out.push(d.getTime());
    return out;
  }
  const years = span > 430 * 86400000;
  const d = new Date(t0);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  if (years) d.setMonth(0);
  const stepMonths = years ? 12 * Math.max(1, Math.ceil(span / (8 * 365 * 86400000))) : Math.max(1, Math.ceil(span / (8 * 30.4 * 86400000)));
  const out = [];
  while (d.getTime() <= t1) {
    if (d.getTime() >= t0) out.push(d.getTime());
    d.setMonth(d.getMonth() + stepMonths);
  }
  return out;
}

// A smooth line through the points that never overshoots them (monotone
// cubic, Fritsch–Butland tangents): between two readings it stays within
// their values, so it shows no highs or lows that were never measured.
const smoothPath = (pts) => {
  const f = (v) => v.toFixed(1);
  if (pts.length < 3) return pts.map(([px, py], i) => `${i ? "L" : "M"}${f(px)},${f(py)}`).join("");
  const n = pts.length;
  const dx = [], slope = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    slope.push(dx[i] ? (pts[i + 1][1] - pts[i][1]) / dx[i] : 0);
  }
  const m = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    const a = slope[i - 1], b = slope[i];
    m.push(a * b <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / a + (dx[i] + 2 * dx[i - 1]) / b));
  }
  m.push(slope[n - 2]);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], h = dx[i] / 3;
    d += `C${f(x0 + h)},${f(y0 + m[i] * h)} ${f(x1 - h)},${f(y1 - m[i + 1] * h)} ${f(x1)},${f(y1)}`;
  }
  return d;
};

/*
 * Module icons: own symbols and small SVG marks
 *
 * Registers the icon set "body_scale:" with Home Assistant and builds the small
 * marks the card draws itself (period calendar sheet, body-fat method scale, dumbbell).
 */

// Own symbols, language-neutral: body fat (drop with fat bubbles), BMI
// (framed letters), muscle (biceps with a bone / with "kg"), basal metabolism
// and metabolic age (thin cycle ring around flame / hourglass), subcutaneous
// fat (skin, fat, muscle) and the fat/lean pair. Registered as an icon set, so
// renpho:<name> works anywhere in Home Assistant; the sensors carry them too.
const BODY_SCALE_ICONS = {
  "body-fat": "M12,2.1C12,2.1 4.6,10.1 4.6,14.6A7.4,7.4 0 0,0 19.4,14.6C19.4,10.1 12,2.1 12,2.1ZM12,4.5C12,4.5 17.6,10.7 17.6,14.6A5.6,5.6 0 0,1 6.4,14.6C6.4,10.7 12,4.5 12,4.5ZM8.5,13.6A1.7,1.7 0 1,0 11.9,13.6A1.7,1.7 0 1,0 8.5,13.6ZM12.6,16A1.3,1.3 0 1,0 15.2,16A1.3,1.3 0 1,0 12.6,16ZM12.45,12.2A0.95,0.95 0 1,0 14.35,12.2A0.95,0.95 0 1,0 12.45,12.2Z",
  "basal-metabolic": "M1.76,8.27A10.9,10.9 0 0,1 20.35,4.99L19.58,5.64A9.9,9.9 0 0,0 2.7,8.61ZM22.41,8.43L18.07,7.26L22.32,3.93ZM22.24,15.73A10.9,10.9 0 0,1 3.65,19.01L4.42,18.36A9.9,9.9 0 0,0 21.3,15.39ZM1.59,15.57L5.93,16.74L1.68,20.07ZM 15.7807578779,11.4668226852 C 15.6274201684,11.2668169772 15.4407481743,11.0934786969 15.267409894,10.9201404167 C 14.8207304795,10.5201290007 14.3140493526,10.2334541526 13.8873705089,9.81344216578 C 12.8940088258,8.84008105353 12.674002547,7.23336853264 13.3073539557,6 C 12.674002547,6.15333770946 12.1206534216,6.50001426999 11.6473065793,6.88002511518 C 9.92059063362,8.26673135728 9.24057122644,10.7134678518 10.0539277723,12.8135277857 C 10.0805952,12.880196355 10.1072626278,12.9468649244 10.1072626278,13.0335340645 C 10.1072626278,13.180204917 10.0072597738,13.3135420557 9.87392263509,13.3668769112 C 9.72058492563,13.4335454805 9.56058035923,13.3935443389 9.4339100775,13.286874628 C 9.3939089359,13.2535403433 9.36724150817,13.2202060586 9.34057408044,13.1735380601 C 8.58721924699,12.2201775187 8.46721582219,10.8534718474 8.97389694911,9.76010731031 C 7.86053184127,10.6667998532 7.25384786035,12.2001769479 7.34051700048,13.6468849024 C 7.38051814208,13.980227749 7.42051928368,14.3135705957 7.53385585155,14.6469134423 C 7.62719184861,15.0469248583 7.80719698581,15.4469362743 8.0072026938,15.8002796918 C 8.72722324258,16.9536459412 9.97392548909,17.7803362009 11.3139637327,17.9470076243 C 12.7406711164,18.1270127614 14.2673813541,17.8670053411 15.3607458911,16.8803105149 C 16.5807807099,15.773612264 17.0074595536,14.0002283198 16.3807750019,12.480184939 L 16.2941058617,12.3068466588 C 16.1541018661,12.0001712399 15.7807578779,11.4668226852 15.7807578779,11.4668226852 M 13.674031087,15.6669425531 C 13.4873590929,15.8269471195 13.1806836739,16.0002853998 12.9406768244,16.0669539691 C 12.1939888478,16.3336282464 11.4473008713,15.9602842582 11.0072883137,15.5202717006 C 11.8006442888,15.3335997064 12.273991131,14.7469162963 12.4139951266,14.1535660293 C 12.5273316945,13.6202174746 12.3139922726,13.180204917 12.2273231325,12.6668569332 C 12.1473208493,12.1735095201 12.1606545632,11.7534975333 12.3406597004,11.2934844049 C 12.4673299821,11.5468249684 12.6006671208,11.8001655319 12.7606716872,12.0001712399 C 13.274019671,12.6668569332 14.0807093599,12.9601986382 14.2540476402,13.8668911811 C 14.2807150679,13.9602271782 14.2940487818,14.0535631753 14.2940487818,14.1535660293 C 14.3140493526,14.7002482978 14.074042503,15.3002654218 13.674031087,15.6669425531 L 13.674031087,15.6669425531 Z",
  "subcutaneous-fat": "M2,3.6H22V6.8H2ZM3,11.4A2.3,2.3 0 1,0 7.6,11.4A2.3,2.3 0 1,0 3,11.4ZM9.7,11.4A2.3,2.3 0 1,0 14.3,11.4A2.3,2.3 0 1,0 9.7,11.4ZM16.4,11.4A2.3,2.3 0 1,0 21,11.4A2.3,2.3 0 1,0 16.4,11.4ZM2,16.4H4.2V20.6H2ZM5.5,16.4H7.7V20.6H5.5ZM9,16.4H11.2V20.6H9ZM12.5,16.4H14.7V20.6H12.5ZM16,16.4H18.2V20.6H16ZM19.5,16.4H21.7V20.6H19.5Z",
  "composition-bars": "M3,4H21V8H3ZM3,10H17V14H3ZM3,16H11V20H3Z",
  "knee": "M11.399999999999999,1.5H12.599999999999998A2.2,2.2 0 0,1 14.799999999999999,3.7V7.499999999999999A2.2,2.2 0 0,1 12.599999999999998,9.7H11.399999999999999A2.2,2.2 0 0,1 9.2,7.499999999999999V3.7A2.2,2.2 0 0,1 11.399999999999999,1.5ZM7.7,10.6A2.9,2.9 0 1,1 13.5,10.6A2.9,2.9 0 1,1 7.7,10.6ZM11.1,10.6A2.9,2.9 0 1,1 16.9,10.6A2.9,2.9 0 1,1 11.1,10.6ZM8.6,14.2H15.400000000000002A1.2,1.2 0 0,1 16.6,15.399999999999999V15.399999999999999A1.2,1.2 0 0,1 15.400000000000002,16.599999999999998H8.6A1.2,1.2 0 0,1 7.4,15.399999999999999V15.399999999999999A1.2,1.2 0 0,1 8.6,14.2ZM11.6,16H12.399999999999999A2,2 0 0,1 14.399999999999999,18V20.5A2,2 0 0,1 12.399999999999999,22.5H11.6A2,2 0 0,1 9.6,20.5V18A2,2 0 0,1 11.6,16ZM2.9,12.4A2.1,2.1 0 1,1 7.1,12.4A2.1,2.1 0 1,1 2.9,12.4Z",
  "bone-mass": "M 7.75735931288,10.5857864376 A 3,3 45 0,1 3.51471862576,10.5857864376 A 3,3 45 0,1 3.51471862576,6.34314575051 C 4.05919084728,5.79867352899 4.75922656065,5.50875974871 5.46633334184,5.46633334184 C 5.50875974871,4.75922656065 5.79867352899,4.05919084728 6.34314575051,3.51471862576 A 3,3 45 0,1 10.5857864376,3.51471862576 A 3,3 45 0,1 10.5857864376,7.75735931288 C 11.4696699141,8.75437987435 12.3535533906,9.76554257145 13.2940054096,10.7059945904 C 14.2344574285,11.6464466094 15.2456201256,12.5303300859 16.2426406871,13.4142135624 A 3,3 45 0,1 20.4852813742,13.4142135624 A 3,3 45 0,1 20.4852813742,17.6568542495 C 19.9408091527,18.201326471 19.2407734394,18.4912402513 18.5336666582,18.5336666582 C 18.4912402513,19.2407734394 18.201326471,19.9408091527 17.6568542495,20.4852813742 A 3,3 45 0,1 13.4142135624,20.4852813742 A 3,3 45 0,1 13.4142135624,16.2426406871 C 12.5303300859,15.2456201256 11.6464466094,14.2344574285 10.7059945904,13.2940054096 C 9.76554257145,12.3535533906 8.75437987435,11.4696699141 7.75735931288,10.5857864376 Z",
  "weight-fat": "M 3.1,1.8 L 12.9,1.8 A 1.4,1.4 0 0,1 14.3,3.2 L 14.3,14.4 A 1.4,1.4 0 0,1 12.9,15.8 L 3.1,15.8 A 1.4,1.4 0 0,1 1.7,14.4 L 1.7,3.2 A 1.4,1.4 0 0,1 3.1,1.8 M 8,3.2 A 2.8,2.8 0 0,0 5.2,6 L 7.482,6 L 7.195,4.061 L 8.63,6 L 10.8,6 A 2.8,2.8 0 0,0 8,3.2 M 3.1,7.4 L 3.1,14.4 L 12.9,14.4 L 12.9,7.4 L 3.1,7.4 ZM18.04,11.302C18.04,11.302,13.452,16.262,13.452,19.052A4.588,4.588,0,0,0,22.628,19.052C22.628,16.262,18.04,11.302,18.04,11.302ZM18.04,12.79C18.04,12.79,21.512,16.634,21.512,19.052A3.472,3.472,0,0,1,14.568,19.052C14.568,16.634,18.04,12.79,18.04,12.79ZM15.87,18.432A1.054,1.054,0,1,0,17.978,18.432A1.054,1.054,0,1,0,15.87,18.432ZM18.412,19.92A0.806,0.806,0,1,0,20.024,19.92A0.806,0.806,0,1,0,18.412,19.92ZM18.319,17.564A0.589,0.589,0,1,0,19.497,17.564A0.589,0.589,0,1,0,18.319,17.564Z",
  bmi: "M2.5,5L21.5,5Q23,5 23,6.5L23,17.5Q23,19 21.5,19L2.5,19Q1,19 1,17.5L1,6.5Q1,5 2.5,5ZM2.6,6.4L2.6,17.6L21.4,17.6L21.4,6.4ZM4.5,8.5L8.3,8.5L9,9.2L9,11.3L8.6,11.9L9.2,12.5L9.2,14.8L8.5,15.5L4.5,15.5ZM6,9.8L6,11.3L7.6,11.3L7.6,9.8ZM6,12.6L6,14.2L7.8,14.2L7.8,12.6ZM10.2,15.5L10.2,8.5L11.6,8.5L12.8,11.5L14,8.5L15.4,8.5L15.4,15.5L14,15.5L14,11.6L13.3,13.3L12.3,13.3L11.6,11.6L11.6,15.5ZM16.6,8.5L19.5,8.5L19.5,9.8L18.8,9.8L18.8,14.2L19.5,14.2L19.5,15.5L16.6,15.5L16.6,14.2L17.3,14.2L17.3,9.8L16.6,9.8Z",
};
window.customIcons = window.customIcons || {};
if (!window.customIcons.body_scale) {
  window.customIcons.body_scale = {
    getIcon: async (name) => ({ path: BODY_SCALE_ICONS[name] || "" }),
    getIconList: async () => Object.keys(BODY_SCALE_ICONS).map((name) => ({ name })),
  };
}

// One pictogram per graph view; the name shows as the title above the graph.
const VIEW_ICONS = {
  fat: "body_scale:weight-fat", composition: "mdi:chart-areaspline", percentile: "mdi:chart-bell-curve-cumulative",
  height: "mdi:human-male-height", bmi: "body_scale:bmi",
};

// Small calendar sheet with a number as language-neutral period label
// (the same symbol as in the water softener card).
const calendar = (mark) =>
  `<svg class="cal" viewBox="0 0 28 20" aria-hidden="true"><rect x="1" y="2.5" width="26" height="16.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.4"/>` +
  `<path d="M1 5a2.5 2.5 0 0 1 2.5-2.5h21A2.5 2.5 0 0 1 27 5v1.8H1Z" fill="currentColor"/>` +
  `<rect x="6" y="0.5" width="1.8" height="3.5" rx=".9" fill="currentColor"/><rect x="20.2" y="0.5" width="1.8" height="3.5" rx=".9" fill="currentColor"/>` +
  `<text x="14" y="16.4" text-anchor="middle" font-size="${String(mark).length > 2 ? 8.5 : 10}" font-weight="700" fill="currentColor" font-family="sans-serif">${mark}</text></svg>`;
const PERIOD_MARKS = { month: "30", year: "365", all: "Σ" };

// Body fat method as a small scale (same build as the calendar sheet) with
// its number on the platform: 1 standard, 2 alternative; a level dumbbell
// beside it for the athlete curve.
const DUMBBELL = `<svg class="m-lift" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="1.5" y="9" width="2.5" height="6" rx="1"/>` +
  `<rect x="4.5" y="6.5" width="3" height="11" rx="1.2"/><rect x="7.5" y="11" width="9" height="2" rx="1"/>` +
  `<rect x="16.5" y="6.5" width="3" height="11" rx="1.2"/><rect x="20" y="9" width="2.5" height="6" rx="1"/></svg>`;
// Chart values that depend on the body-fat method.
const METHOD_METRICS = ["body_fat_percentage", "fat_mass", "fat_free_mass"];

const methodIcon = (prof, title) =>
  `<span class="method" title="${esc(title)}" aria-label="${esc(title)}"><svg class="scale-mark" viewBox="0 0 26 22" aria-hidden="true">` +
  `<rect x="1" y="1" width="24" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
  `<rect x="8" y="3.5" width="10" height="3.6" rx="1" fill="currentColor"/>` +
  `<text x="13" y="18.2" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor" font-family="sans-serif">${prof.alternative ? 2 : 1}</text></svg>` +
  `${prof.athlete ? DUMBBELL : ""}</span>`;

// Fat method for the scale's display: a small scale with its number (1 standard, 2 alternative).
const methodMark = (n) =>
  `<svg class="meth" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/>` +
  `<path d="M3 6.5A3.5 3.5 0 0 1 6.5 3h11A3.5 3.5 0 0 1 21 6.5V8H3Z" fill="currentColor"/>` +
  `<text x="12" y="19" text-anchor="middle" font-size="10.5" font-weight="700" fill="currentColor" font-family="DejaVu Sans Mono,monospace">${n}</text></svg>`;

/*
 * Module helpers: small shared functions
 *
 * Digits per metric, average bone mass, initials, person symbol, HTML escaping, and the
 * conversion of flat interface-H rows to the card's own row names.
 */

const metricDigits = (metric) => (["bmi_percentile", "height", "height_percentile"].includes(metric) ? 0 : metric === "weight" ? 2 : 1);
// Average bone mass by sex and weight (Tanita reference values for adults).
function averageBone(sex, weight) {
  if (sex === "female") return weight < 50 ? 1.95 : weight <= 75 ? 2.4 : 2.95;
  return weight < 65 ? 2.66 : weight <= 95 ? 3.29 : 3.69;
}

// Shortest distinct start of each name: one letter, more where names share it.
const initials = (names) =>
  names.map((name) => {
    const others = names.filter((o) => o !== name).map((o) => o.toLowerCase());
    let k = 1;
    while (k < name.length && others.some((o) => o.startsWith(name.slice(0, k).toLowerCase()))) k += 1;
    return name.slice(0, k);
  });

// Person symbol from the profile: child under 18, otherwise by sex.
const personIcon = (profile) =>
  profile.minor ? "mdi:human-child" : profile.sex === "female" ? "mdi:human-female" : profile.sex === "male" ? "mdi:human-male" : "mdi:account";

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);

// One entry of interface H (a flat row): the card's own names are `measurement_id`
// for `entry_id` and `timestamp` for `at`.
function entryRow(row) {
  return { ...row, measurement_id: row.entry_id, timestamp: row.at };
}

// The other body-fat methods of the newest entry (`entry_variants`, flat rows)
// as the nested table the comparison shows: methods[standard|alternative][normal|athlete].
function variantMethods(variants) {
  const out = {};
  for (const v of variants || []) {
    const values = {};
    for (const [k, x] of Object.entries(v)) if (typeof x === "number") values[k] = x;
    ((out[v.method] = out[v.method] || {})[v.athlete ? "athlete" : "normal"]) = values;
  }
  return Object.keys(out).length ? out : null;
}

/*
 * Module growth: children's percentiles (maths and loading)
 *
 * The WHO 2007 and Kromeyer-Hauschild tables are NOT part of this file: they are separate
 * data files (body-scale-card.growth.*.json next to the card, each with source and licence in its head).
 * They are loaded only after the user ticked the option in the editor; without them the
 * card works, just without percentiles and children's curves.
 */

// ---- BEGIN growth: percentile maths and loading of the LMS tables.
// Sources of the data files: de Onis et al. 2007, Bull World Health Organ 85:660-7 (WHO,
// CC BY-NC-SA); Kromeyer-Hauschild et al. 2001, Monatsschrift Kinderheilkunde 149:807-818
// (tables from the R package childsds, GPL-3). Tested against growth.py.
// GROWTH.who / GROWTH.kh are the parsed files, null until loaded.
const GROWTH = { who: null, kh: null };
const GROWTH_FILES = { who: "who_2007.json", kh: "kromeyer_hauschild_2001.json" };
const GROWTH_LICENSE = { who: "CC BY-NC-SA 3.0 IGO", kh: "GPL-3.0-or-later" };
// Per reference: does the file exist next to the card (probe), is it loading.
const growthState = { who: { exists: null, loading: false }, kh: { exists: null, loading: false } };
const growthUrl = (ref) => (cardFolder ? `${cardFolder}body-scale-card.growth.${GROWTH_FILES[ref]}` : null);
const growthChanged = () => globalOptions.cards.forEach((c) => c._render?.());
// Is the file there? (HEAD request, once per page.)
function growthProbe(ref) {
  const st = growthState[ref];
  if (st.exists !== null || st.probing) return;
  st.probing = true;
  const url = growthUrl(ref);
  (url ? fetch(url, { method: "HEAD" }).then((r) => r.ok) : Promise.resolve(false))
    .catch(() => false)
    .then((ok) => { st.exists = ok; st.probing = false; growthChanged(); });
}
// Load the file (only called with the user's consent).
function growthLoad(ref) {
  const st = growthState[ref];
  if (GROWTH[ref] || st.loading || st.failed) return;
  const url = growthUrl(ref);
  if (!url) return;
  st.loading = true;
  fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
    .then((data) => {
      if (!data || !data.bmi || !data.height) throw new Error("not a growth table");
      GROWTH[ref] = data;
    })
    .catch((e) => { st.failed = true; console.warn("body-scale-card: growth data", ref, "not loaded", e); })
    .finally(() => { st.loading = false; growthChanged(); });
}
// "ready" = file exists but not allowed yet, "loaded", or "absent".
const growthStatus = (ref) => (GROWTH[ref] ? "loaded" : growthState[ref].exists ? "ready" : "absent");
function growthErf(x) {
  // Series up to |x| = 4, beyond that erf is 1 to better than 1e-8.
  const a = Math.abs(x);
  if (a >= 4) return Math.sign(x);
  let sum = 0, term = a;
  for (let n = 0; n < 80; n++) {
    sum += term / (2 * n + 1);
    term *= (-a * a) / (n + 1);
    if (Math.abs(term) < 1e-18) break;
  }
  const v = (2 / Math.sqrt(Math.PI)) * sum;
  return Math.sign(x) * Math.min(v, 1);
}
const growthPercentOf = (z) => Math.round(50 * (1 + growthErf(z / Math.SQRT2)) * 10) / 10;
const growthRound = (v, d) => Math.round(v * 10 ** d) / 10 ** d;
function growthLms(ref, kind, sex, months) {
  const side = sex === "female" ? "female" : "male";
  if (!GROWTH[ref === "kh" ? "kh" : "who"]) return null;
  if (ref === "kh") {
    const table = GROWTH.kh[kind][side];
    const years = months / 12;
    if (years < table[0][0] || years > table[table.length - 1][0]) return null;
    for (let i = 0; i + 1 < table.length; i++) {
      const a = table[i], b = table[i + 1];
      if (a[0] <= years && years <= b[0]) {
        const f = b[0] > a[0] ? (years - a[0]) / (b[0] - a[0]) : 0;
        return [1, 2, 3].map((k) => a[k] + (b[k] - a[k]) * f);
      }
    }
    return table[table.length - 1].slice(1);
  }
  if (months < GROWTH.who.first_month || months > GROWTH.who.last_month) return null;
  const table = GROWTH.who[kind][side];
  const whole = Math.floor(months);
  const low = whole - GROWTH.who.first_month, high = Math.min(low + 1, table.length - 1), frac = months - whole;
  return table[low].map((v, i) => v + (table[high][i] - v) * frac);
}
// { z, p } of a BMI or height (kind "bmi" / "height") at an age in whole months, or null.
function growthPercentile(ref, kind, value, sex, months) {
  if (!(value > 0)) return null;
  const params = growthLms(ref, kind, sex, months);
  if (!params) return null;
  const [l, m, s] = params;
  let z = l ? (Math.pow(value / m, l) - 1) / (l * s) : 0;
  // Beyond +-3 SD the WHO extends the BMI curve linearly in BMI units.
  if (ref === "who" && kind === "bmi" && Math.abs(z) > 3) {
    const sign = z > 0 ? 1 : -1;
    const sd3 = m * Math.pow(1 + l * s * 3 * sign, 1 / l), sd2 = m * Math.pow(1 + l * s * 2 * sign, 1 / l);
    z = sign * 3 + (value - sd3) / Math.abs(sd3 - sd2);
  }
  return { z: growthRound(z, 2), p: growthPercentOf(z) };
}
// WHO cut-offs (-2 / +1 / +2 SD) or the German ones (P10 / P90 / P97).
function growthCategory(ref, z) {
  if (ref === "kh") return z < -1.2816 ? "thinness" : z > 1.8808 ? "obesity" : z > 1.2816 ? "overweight" : "normal";
  return z < -2 ? "thinness" : z > 2 ? "obesity" : z > 1 ? "overweight" : "normal";
}
const GROWTH_CURVE_Z = [-1.8808, -1.2816, 0, 1.2816, 1.8808];
// [months, P3, P10, P50, P90, P97] rows.
function growthCurves(ref, kind, sex, from, to, step = 1) {
  const rows = [];
  for (let months = Math.max(0, from); months <= to; months += step) {
    const params = growthLms(ref, kind, sex, months);
    if (!params) continue;
    const [l, m, s] = params;
    rows.push([months, ...GROWTH_CURVE_Z.map((z) => growthRound(l ? m * Math.pow(1 + l * s * z, 1 / l) : m * Math.exp(s * z), 2))]);
  }
  return rows;
}
// Whole months between a birth date (YYYY-MM-DD) and a time, like age_in_months.
function growthAgeMonths(born, ms) {
  const b = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(born || ""));
  if (!b) return null;
  const on = new Date(ms);
  let months = (on.getFullYear() - Number(b[1])) * 12 + on.getMonth() + 1 - Number(b[2]);
  if (on.getDate() < Number(b[3])) months -= 1;
  return months >= 0 ? months : null;
}
// ---- END growth

/*
 * Module global-options: settings shared by all cards of a user
 *
 * Reference, compare, baby age, blink tolerance and the consent to load the growth data are kept in Home Assistant user data
 * (frontend/set_user_data) and written by the editor. The card's own YAML wins over them.
 */

// Options that hold for every card of a user: kept in Home Assistant's user data
// (frontend/set_user_data, key "body_scale_card"), written by the editor. A card's
// own YAML wins over it.
const GLOBAL_KEYS = ["reference", "compare_references", "baby_max_months", "blink_tolerance_kg", "growth_who", "growth_kh"];
const GLOBAL_STORE_KEY = "body_scale_card";
// Key of the settings before the card was renamed; taken over once.
const OLD_STORE_KEY = "renpho_scale_card";
const globalOptions = { values: {}, loaded: false, loading: false, cards: new Set() };
// A translation arrived (loaded from its file): draw the open cards again.
i18nListeners.add(() => globalOptions.cards.forEach((c) => { if (c._config && c._hass) c._render(); }));

function loadGlobalOptions(hass) {
  if (globalOptions.loaded || globalOptions.loading || !hass?.callWS) return;
  globalOptions.loading = true;
  Promise.resolve(hass.callWS({ type: "frontend/get_user_data", key: GLOBAL_STORE_KEY }))
    .then(async (res) => {
      let values = (res && res.value) || {};
      if (!Object.keys(values).length) {
        // Nothing saved under the new key yet: take over the old settings once.
        const old = await Promise.resolve(hass.callWS({ type: "frontend/get_user_data", key: OLD_STORE_KEY })).catch(() => null);
        if (old && old.value && Object.keys(old.value).length) {
          values = old.value;
          hass.callWS({ type: "frontend/set_user_data", key: GLOBAL_STORE_KEY, value: values }).catch(() => {});
        }
      }
      globalOptions.values = values;
      globalOptions.loaded = true;
    })
    .catch(() => { globalOptions.loaded = true; })
    .finally(() => {
      globalOptions.loading = false;
      globalOptions.cards.forEach((c) => c._render?.());
    });
}

async function saveGlobalOptions(hass, values) {
  globalOptions.values = { ...values };
  globalOptions.cards.forEach((c) => c._render?.());
  await hass.callWS({ type: "frontend/set_user_data", key: GLOBAL_STORE_KEY, value: globalOptions.values });
}

/*
 * Module card-core: the card element
 *
 * The custom element: configuration, lifecycle, hass updates, language and the main
 * _render(). Everything else of the card is added by the card-* modules after this
 * one with mixin(); a method is found by name, whatever file it lives in.
 */

class BodyScaleCard extends HTMLElement {
  // An option: the card's own YAML first, then the user-wide setting.
  _opt(name) {
    const own = this._config?.[name];
    if (own !== undefined && own !== null && own !== "") return own;
    return GLOBAL_KEYS.includes(name) ? globalOptions.values[name] : undefined;
  }

  static getStubConfig() {
    return {};
  }

  static getConfigElement() {
    return document.createElement("body-scale-card-editor");
  }

  setConfig(config) {
    this._config = {
      rows: 10,
      pending: true,
      columns: DEFAULT_COLUMNS,
      ...(config || {}),
    };
    this._expanded = false;
    this._signature = null;
    this._armRefresh();
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    if (this._hass) this._render();
  }

  connectedCallback() {
    globalOptions.cards.add(this);
    if (this._popClose) return;
    this._popClose = (ev) => {
      if (!this._openMetric) return;
      if (ev.type === "keydown") {
        if (ev.key !== "Escape") return;
      } else if (ev.composedPath().some((el) => el.classList && (el.classList.contains("val-detail") || el.classList.contains("val") || el.classList.contains("g")))) {
        return;
      }
      this._openMetric = null;
      this._render();
    };
    window.addEventListener("click", this._popClose, true);
    window.addEventListener("keydown", this._popClose);
    // A page that was in the background or asleep draws itself again when it
    // comes back, so several open pages (phone, tablet, computer) agree.
    this._wake = () => {
      if (document.visibilityState !== "hidden" && this._hass && this._config) this._render();
    };
    document.addEventListener("visibilitychange", this._wake);
    window.addEventListener("focus", this._wake);
    window.addEventListener("pageshow", this._wake);
    this._armRefresh();
  }

  disconnectedCallback() {
    globalOptions.cards.delete(this);
    if (!this._popClose) return;
    window.removeEventListener("click", this._popClose, true);
    window.removeEventListener("keydown", this._popClose);
    document.removeEventListener("visibilitychange", this._wake);
    window.removeEventListener("focus", this._wake);
    window.removeEventListener("pageshow", this._wake);
    clearTimeout(this._keyTimer);
    clearTimeout(this._keyEnd);
    clearTimeout(this._optTimer);
    clearTimeout(this._histTimer);
    clearInterval(this._refresh);
    this._keyRO?.disconnect();
    this._popClose = null;
  }

  // Optional fixed refresh (refresh_seconds, 0 = off): the card draws itself again
  // from the newest state this page has, unless a dialog or pop-up is open.
  _armRefresh() {
    clearInterval(this._refresh);
    const s = Number(this._config?.refresh_seconds);
    if (!(s > 0) || !this.isConnected) return;
    this._refresh = setInterval(() => {
      if (document.visibilityState === "hidden" || this._dialog || this._openMetric || !this._hass || !this._config) return;
      this._render();
    }, Math.max(2, s) * 1000);
  }

  set hass(hass) {
    this._hass = hass;
    loadGlobalOptions(hass);
    const signature = this._computeSignature();
    if (signature !== this._signature) {
      this._signature = signature;
      this._render();
    }
  }

  getCardSize() {
    return 6;
  }

  get _t() {
    return uiText(this._lang);
  }

  get _lang() {
    // `language: de` in the card config overrides the user's profile language.
    return this._config?.language || this._hass?.locale?.language || this._hass?.language || "de";
  }

  _computeSignature() {
    if (!this._hass) return null;
    const dir = this._directoryState();
    if (!dir) return `|${this._lang}`;
    // Everything the card shows comes from the directory entity (entries are
    // fetched again when its `revision` changes).
    return `${dir.entity_id}:${dir.last_updated}:${dir.last_changed}|${this._lang}`;
  }

  // -------------------------------------------------------------- render

  _render() {
    if (!this.shadowRoot || !this._hass || !this._config) return;
    const t = this._t;
    const data = this._discover();
    this._data = data;
    if (!data) {
      this.shadowRoot.innerHTML = `${this._styles()}<ha-card><div class="msg">${esc(t.notFound)}</div></ha-card>`;
      return;
    }
    let people = data.people.filter((p) => p.visible);
    const only = this._config.person;
    if (only) {
      const key = String(only).toLowerCase();
      people = people.filter((p) => p.id.toLowerCase() === key || p.name.toLowerCase() === key);
    }
    if (!people.find((p) => p.id === this._selected)) {
      this._selected = this._restoreTab(people) || people[0]?.id;
    }
    // "Enter height →" in the reminder opens the card with ?body_scale_height=<user>.
    const ask = new URLSearchParams(window.location.search).get("body_scale_height");
    if (ask && this._can("set_height") && people.find((p) => p.id === ask) && !this._dialog) {
      this._selected = ask;
      const url = new URL(window.location.href);
      url.searchParams.delete("body_scale_height");
      window.history.replaceState(window.history.state, "", url);
      setTimeout(() => this._openHeight(ask), 0);
    }
    const title = this._config.title ?? (only && people[0] ? people[0].name : null);

    let html = `${this._styles()}<ha-card>`;
    // Without a title of its own the card shows a scale symbol instead of a word.
    // One person: their values at a glance beside the name.
    const glanceInHeader = !!(title && only && people.length === 1 && this._config.info !== false);
    if (title) html += `<h1 class="card-header ${glanceInHeader ? "with-glance" : ""}"><span class="title-text">${esc(title)}</span>${glanceInHeader ? this._renderGlance(people[0], t) : ""}</h1>`;
    else if (this._config.title === undefined && (this._config.next_user === false || !data.next)) {
      html += `<h1 class="card-header icon-header" title="${esc(t.title)}"><ha-icon icon="mdi:scale-bathroom"></ha-icon></h1>`;
    }
    // Who weighs next and the guest / baby-pet results belong together (overview only).
    if (this._config.next_user !== false) {
      const dev = this._renderNext(data, t);
      html += dev + (dev ? this._renderLegend(t) + this._renderHow(t) + (this._config.info !== false ? this._renderScaleInfo(t) : "") : "");
    } else {
      this._shownPending = null;
    }
    if (this._config.pending !== false) html += this._renderPending(data, t);
    html += this._renderPeople(people, t, !only, glanceInHeader);
    html += `</ha-card><div class="dialog-host"></div>`;
    this.classList.toggle("skin-theme", this._config.skin === "theme");
    this.shadowRoot.innerHTML = html;
    this._bind();
    this._fitKeys();
    this._armKeyTimer();
    this._runGlide();
    if (this._dialog) this._renderDialog();
  }
}

// Adds the methods of one card-* module to the card. Like class methods they are not
// enumerable; getters and setters keep working.
function mixin(cls, methods) {
  for (const [key, d] of Object.entries(Object.getOwnPropertyDescriptors(methods))) {
    d.enumerable = false;
    Object.defineProperty(cls.prototype, key, d);
  }
}

/*
 * Module card-data: reading the interfaces S and H
 *
 * Finds the scale's directory entity, calls the services of the two interfaces
 * (get_entries, get_series, set_entry, ...), caches entries and lines per person,
 * applies the clothes and impedance filters, orders the people.
 */

mixin(BodyScaleCard, {
  // ---------------------------------------------------------------- data

  // Interface S: the directory entity carries the scale record and the tables
  // (people, heights, pending, ...). Without one the card has nothing to show.
  _directoryState() {
    const hass = this._hass;
    const ok = (st) => st && st.attributes && st.attributes.scale?.scale_interface === 1 && Array.isArray(st.attributes.people);
    const named = this._config.directory || this._config.scale;
    if (named && ok(hass.states[named])) return hass.states[named];
    if (this._dirId && ok(hass.states[this._dirId])) return hass.states[this._dirId];
    this._dirId = null;
    if (Date.now() - (this._dirScan || 0) < 30000) return null;
    this._dirScan = Date.now();
    const st = Object.values(hass.states).find(ok);
    if (st) this._dirId = st.entity_id;
    return st || null;
  },
  _discover() {
    const dir = this._directoryState();
    if (!dir) return null;
    const hass = this._hass;
    const a = dir.attributes;
    const reg = hass.entities?.[dir.entity_id] || {};
    const domain = reg.platform || null;
    const scale = a.scale || {};
    const caps = new Set(String(scale.capabilities || "").split(",").map((c) => c.trim()).filter(Boolean));
    const heightsOf = (id) => (a.heights || []).filter((h) => h.person_id === id).map((h) => [h.at, h.cm]);
    this._src = { domain, deviceId: reg.device_id || null };
    const people = a.people
      .map((u) => ({
        id: u.person_id,
        name: u.name || u.person_id,
        rows: this._entries?.[u.person_id]?.rows || [],
        private: !!u.private,
        loginUserId: u.owner || null,
        born: u.birthdate || null,
        sex: u.sex || null,
        heights: heightsOf(u.person_id),
        method: u.method || "standard",
        athlete: !!u.athlete,
      }))
      .map((p) => ({ ...p, visible: this._mayView(p), isBaby: this._isBaby(p.born) }))
      .sort((x, y) => this._comparePeople(x, y));
    // Open measurements with the people they may belong to (and who is suggested).
    const who = {}, hint = {};
    for (const c of a.pending_candidates || []) {
      (who[c.measurement_id] = who[c.measurement_id] || []).push(c.person_id);
      if (c.suggested) (hint[c.measurement_id] = hint[c.measurement_id] || []).push(c.person_id);
    }
    const pending = caps.has("pending")
      ? (a.pending || []).map((p) => ({ measurement_id: p.measurement_id, timestamp: p.at, weight: p.weight, impedance: p.impedance, candidates: who[p.measurement_id] || [], suggested: hint[p.measurement_id] || [] }))
      : [];
    const guest = caps.has("guest") && a.guest ? { timestamp: a.guest.at, weight: a.guest.weight, impedance: a.guest.impedance } : null;
    this._loadHistoryInfo();
    this._ensureEntries(scale.revision, people);
    return {
      domain,
      directory: dir.entity_id,
      capabilities: caps,
      scaleDeviceId: reg.device_id || null,
      revision: scale.revision,
      pending,
      guest,
      next: caps.has("next_user") ? this._nextFromState(a) : null,
      people,
    };
  },
  // The choices of interface S as the card works with them: the order auto,
  // guest, people (labels), and the selected one by its label.
  _nextFromState(a) {
    const nx = a.next, choices = a.next_choices;
    if (!nx || !Array.isArray(choices)) return null;
    const label = (c) => c.label || c.choice_id;
    const auto = choices.find((c) => c.kind === "auto"), guest = choices.find((c) => c.kind === "guest");
    if (!auto || !guest) return null;
    const people = choices.filter((c) => c.kind === "person");
    const selected = choices.find((c) => c.choice_id === nx.selected) || auto;
    return {
      state: label(selected),
      attributes: { options: [label(auto), label(guest), ...people.map(label)], valid_until: nx.valid_until, auto_selected_at: nx.auto_selected_at, timeout_minutes: nx.timeout_minutes },
    };
  },
  // Interface H: a call of the history with an answer. The same integration
  // serves it (the card has no other source yet).
  async _service(name, data) {
    const src = this._src || {};
    const res = await this._hass.callWS({
      type: "call_service",
      domain: src.domain,
      service: name,
      service_data: { ...(src.deviceId ? { device_id: src.deviceId } : {}), ...data },
      return_response: true,
    });
    return res?.response || {};
  },
  // What the history offers (once per card): entries, series, variants, write.
  _loadHistoryInfo() {
    if (this._hcaps !== undefined || this._hcapsLoading || !this._src?.domain || !this._hass.services?.[this._src.domain]?.get_info) return;
    this._hcapsLoading = true;
    this._service("get_info")
      .then((res) => { this._hcaps = new Set(String(res.history?.capabilities || "").split(",").map((c) => c.trim()).filter(Boolean)); })
      .catch(() => { this._hcaps = new Set(); })
      .finally(() => { this._hcapsLoading = false; this._render(); });
  },
  // The newest entries of every person, again whenever the scale's `revision`
  // changes (a new weighing, a deleted entry, a changed profile).
  _ensureEntries(revision, people) {
    const svc = this._hass.services?.[this._src.domain]?.get_entries;
    if (!svc) return;
    this._entries = this._entries || {};
    for (const p of people) {
      if (!p.visible) continue;
      const cached = this._entries[p.id];
      if (cached && (cached.revision === revision || cached.loading)) continue;
      this._entries[p.id] = { revision: cached?.revision ?? null, rows: cached?.rows || [], loading: true };
      this._fetchEntries(p.id, revision);
    }
  },
  async _fetchEntries(id, revision) {
    let rows = this._entries[id]?.rows || [];
    try {
      const res = await this._service("get_entries", { person_id: id, limit: 100, variants: true });
      rows = (res.entries || []).map(entryRow);
      const methods = variantMethods(res.entry_variants);
      if (rows[0] && methods) rows[0].methods = methods;
    } catch (err) {
      // Kept as they were; asked again at the next change.
    }
    this._entries[id] = { revision, rows, loading: false };
    this._render();
  },
  // Whether an optional part of the interfaces is offered: declared by the
  // scale (capabilities) or the history (get_info), and the service exists.
  // The parts the card shows depend on it.
  _can(cap) {
    const caps = SCALE_CAPS.includes(cap) ? this._data?.capabilities : this._hcaps;
    if (caps && !caps.has(cap)) return false;
    const service = HISTORY_SERVICES[cap];
    return service ? this._hasService(service) : true;
  },
  _hasService(name) {
    const d = this._data?.domain;
    return !!(d && this._hass?.services?.[d]?.[name]);
  },
  _comparePeople(a, b) {
    // Oldest first (stable over the years: parents, then children); people
    // without a birth date last. `sort: name` sorts alphabetically.
    if (this._config?.sort !== "name" && a.born !== b.born) {
      if (!a.born) return 1;
      if (!b.born) return -1;
      return a.born < b.born ? -1 : 1;
    }
    return a.name.localeCompare(b.name, this._lang);
  },
  _ordered(names, data) {
    const rank = new Map(data.people.map((p, i) => [p.name, i]));
    return names.slice().sort((a, b) => (rank.get(a) ?? 1e9) - (rank.get(b) ?? 1e9));
  },
  // ---------------------------------------------------------- history

  // Whether a line of this metric can exist for the person: weight always, the
  // rest when some of their entries carry it (body values need impedance).
  _hasMetric(person, metric) {
    if (metric === "weight") return true;
    if (metric === "height") return this._heightHistory(person).length > 0;
    const key = metric === "fat_mass" ? "fat_free_mass" : metric;
    return person.rows.some((r) => r[key] != null && r[key] !== "");
  },
  // The filters the user chose: with or without clothes, with or without
  // impedance (any = no filter).
  _filterNow() {
    const f = this._filter || {};
    return { clothed: f.clothed || "any", impedance: f.impedance || "any" };
  },
  // The chart view in use for a person.
  _viewOf(person) {
    const views = this._chartViews(person);
    return views.includes(this._chartView) ? this._chartView : views[0];
  },
  // What the filters can mean in the view shown: the height depends on neither;
  // weight and BMI do not depend on the impedance (only on the clothes); the body
  // composition depends on both. The chart and the table use the same.
  _filterScope(person) {
    const view = this._viewOf(person);
    if (view === "height") return { clothed: false, impedance: false };
    const spec = CHART_VIEWS[view === "composition" && this._compPctOn() ? "fat" : view];
    return { clothed: true, impedance: spec.load.some((m) => !IMPEDANCE_FREE.includes(m)) };
  },
  _effFilter(person) {
    const f = this._filterNow(), scope = this._filterScope(person);
    return { clothed: scope.clothed ? f.clothed : "any", impedance: scope.impedance ? f.impedance : "any" };
  },
  _filterKey(person) {
    const f = this._effFilter(person);
    return `${f.clothed}|${f.impedance}`;
  },
  // Entries that pass the filters (the table and the fallback line).
  _rowsFiltered(person) {
    const f = this._effFilter(person);
    return person.rows.filter((r) => (f.clothed === "any" || !!r.clothed === (f.clothed === "yes"))
      && (f.impedance === "any" || (r.impedance != null) === (f.impedance === "with")));
  },
  _series(person, metric) {
    // The line of interface H (window means from the long-term statistics, or
    // from the stored entries when a filter is on) once it is loaded; until
    // then the newest entries.
    const period = this._period || "month";
    const cached = this._stats?.[`${person.id}|${metric}|${period}|${this._filterKey(person)}`];
    if (cached && cached.points.length) return cached.points;
    const cutoff = Date.now() - PERIODS[period].days * 86400000;
    return this._rowsFiltered(person)
      .filter((r) => r[metric] != null && r[metric] !== "")
      .map((r) => ({ t: new Date(r.timestamp).getTime(), v: Number(r[metric]) }))
      .filter((p) => !Number.isNaN(p.t) && !Number.isNaN(p.v) && p.t >= cutoff)
      .sort((a, b) => a.t - b.t);
  },
  async _loadStats(person, metric) {
    const period = this._period || "month";
    if (!SERIES_METRICS.includes(metric) || !this._can("series") || !this._hasMetric(person, metric)) return;
    const key = `${person.id}|${metric}|${period}|${this._filterKey(person)}`;
    this._stats = this._stats || {};
    // Again when an entry came, went or changed (the revision of the scale).
    const stamp = String(this._data.revision);
    const cached = this._stats[key];
    if (cached && (cached.stamp === stamp || cached.loading)) return;
    this._stats[key] = { points: cached?.points || [], entriesFrom: cached?.entriesFrom || null, stamp, loading: true };
    try {
      const spec = PERIODS[period], f = this._effFilter(person);
      const res = await this._service("get_series", {
        person_id: person.id, metric, bucket: spec.period,
        from: new Date(Date.now() - spec.days * 86400000).toISOString(), to: new Date().toISOString(),
        ...(this._hass.config?.time_zone ? { tz: this._hass.config.time_zone } : {}),
        ...(f.clothed !== "any" ? { clothed: f.clothed } : {}), ...(f.impedance !== "any" ? { impedance: f.impedance } : {}),
      });
      const points = (res.points || []).map((p) => ({ t: Date.parse(p.at), v: Number(p.value) })).filter((p) => !Number.isNaN(p.t) && !Number.isNaN(p.v));
      this._stats[key] = { points, entriesFrom: res.series_info?.entries_from || null, stamp, loading: false };
      // When the body-fat method changed in the period: [{ t, from, to }].
      this._switches = this._switches || {};
      this._switches[`${person.id}|${period}`] = (res.method_changes || [])
        .map((c) => ({ t: Date.parse(c.at), from: c.from_method + (c.from_athlete ? "_athlete" : ""), to: c.to_method + (c.to_athlete ? "_athlete" : "") }))
        .filter((c) => !Number.isNaN(c.t));
    } catch (err) {
      this._stats[key] = { points: [], entriesFrom: null, stamp, loading: false };
    }
    this._render();
  },
  _methodSwitches(person) {
    return this._switches?.[`${person.id}|${this._period || "month"}`] || [];
  },
  _loadStatsFor(person, metric, period) {
    const saved = this._period;
    this._period = period;
    this._loadStats(person, metric);
    this._period = saved;
  },
  _person(id) {
    return this._data.people.find((p) => p.id === id);
  },
  async _call(service, data) {
    await this._hass.callService(this._data.domain, service, {
      ...(this._data.scaleDeviceId ? { device_id: this._data.scaleDeviceId } : {}),
      ...data,
    });
  },
});

/*
 * Module card-format: numbers, dates and labels
 *
 * Number and date formatting for the card (display digits, weights, times, ticks).
 */

mixin(BodyScaleCard, {
  // ------------------------------------------------------------ formatting

  _num(value, digits = 1) {
    if (value === null || value === undefined || value === "") return "–";
    const n = Number(value);
    if (Number.isNaN(n)) return esc(value);
    return n.toLocaleString(this._lang, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  },
  // Display digits: always a point, whatever the language (like a device).
  _lcd(value, digits = 1) {
    const n = Number(value);
    if (value === null || value === undefined || value === "" || Number.isNaN(n)) return "–";
    return n.toFixed(digits).replace("-", "−");
  },
  // Weight like the scale shows it: 0.05 kg raster, two digits before the
  // point; from 100 kg one decimal.
  _w2(value) {
    const n = Number(value);
    if (value === null || value === undefined || value === "" || Number.isNaN(n)) return null;
    if (n >= 100) return n.toFixed(1);
    return (Math.round(n * 20) / 20).toFixed(2).padStart(5, "0");
  },
  _when(row) {
    if (row.timestamp) {
      const d = new Date(row.timestamp);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleString(this._lang, {
          day: "2-digit", month: "2-digit", year: "2-digit",
          hour: "2-digit", minute: "2-digit",
        });
      }
    }
    return row.time || row.timestamp_display || "";
  },
  _pendingLabel(p) {
    // Hidden when it may belong to a private person this viewer can't see.
    const hidden = (p.candidates || []).some((id) => {
      const person = this._data?.people.find((x) => x.id === id);
      return person && !person.visible;
    });
    if (hidden) return `${this._when(p)} · ${this._t.newMeasurement}`;
    const unit = p.weight_unit || "kg";
    return `${this._when(p)} · ${this._num(p.weight, 2)} ${unit}`;
  },
  _weightChange(person, days) {
    // Latest weight minus the weight `days` ago (own rows, else statistics).
    const latest = person.rows[0];
    if (!latest) return null;
    const history = person.rows
      .map((r) => ({ t: new Date(r.timestamp).getTime(), v: Number(r.weight) }))
      .filter((p) => !Number.isNaN(p.t) && !Number.isNaN(p.v))
      .sort((a, b) => a.t - b.t);
    const stats = this._stats?.[`${person.id}|weight|year`]?.points || this._stats?.[`${person.id}|weight|month`]?.points || [];
    const ms = Date.now() - days * 86400000;
    const ref = this._valueAt(history, ms) || this._valueAt(stats, ms);
    return ref ? Number(latest.weight) - ref.v : null;
  },
  _valueAt(points, ms) {
    let found = null;
    for (const p of points) {
      if (p.t <= ms) found = p;
      else break;
    }
    return found;
  },
  _cm(v) {
    // One way everywhere: 140 cm, 126,5 cm.
    const n = Number(v);
    return `${this._num(n, Number.isInteger(n) ? 0 : 1)} cm`;
  },
  _fmtTick(ms, span) {
    const d = new Date(ms);
    // Over about 14 months: years; otherwise months (with the year on January).
    if (span > 430 * 86400000) return String(d.getFullYear());
    if (span < 62 * 86400000) return d.toLocaleDateString(this._lang, { day: "numeric", month: "numeric" });
    return d.toLocaleDateString(this._lang, d.getMonth() === 0 ? { month: "short", year: "2-digit" } : { month: "short" });
  },
  _fmtDate(ms, period) {
    return new Date(ms).toLocaleDateString(this._lang, { day: "2-digit", month: "2-digit", year: period === "month" ? undefined : "2-digit" });
  },
  _rowLabel(userId, mid) {
    const row = (this._person(userId)?.rows || []).find((r) => r.measurement_id === mid);
    return row ? `${this._when(row)} (${this._num(row.weight, 2)} kg)` : mid;
  },
});

/*
 * Module card-profile: person profile, growth and references
 *
 * Age, height, sex and body-fat method of a person; children's growth and percentiles
 * (WHO / Kromeyer-Hauschild); the profile line and the summary under the name.
 */

mixin(BodyScaleCard, {
  // A baby / pet is decided here, from the birth date; the integration only
  // stores a weight for whoever the card names.
  _isBaby(born) {
    const b = Date.parse(born || "");
    if (Number.isNaN(b)) return false;
    const limit = Number(this._opt("baby_max_months")) > 0 ? Number(this._opt("baby_max_months")) : 24;
    return (Date.now() - b) / (30.4375 * 86400000) < limit;
  },
  // The reference in use (and the other one): from the card's options, else
  // from the percentile sensors of an older integration, else WHO.
  _growthCtx(person) {
    const cfg = this._config || {};
    const ref = this._opt("reference") === "kh" ? "kh" : "who";
    const compare = this._opt("compare_references") === true;
    // The tables are separate files: look for them, load them if the user allowed it.
    for (const r of ["who", "kh"]) {
      growthProbe(r);
      if (this._opt(`growth_${r}`) === true && growthState[r].exists) growthLoad(r);
    }
    return { chosen: ref, other: ref === "kh" ? "who" : "kh", compare, sex: person.sex === "female" ? "female" : "male", born: person.born || null };
  },
  // Height at a time: the last entry of the height history before it (the
  // first one before the history starts), else the profile height.
  _heightAt(person, ms, fallback) {
    const history = this._heightHistory(person);
    if (!history.length) return fallback;
    let v = history[0].v;
    for (const h of history) if (h.t <= ms) v = h.v;
    return v;
  },
  // Percentile and rating of a BMI / height at a time after a reference.
  _growthAt(person, kind, value, ms, ref) {
    const ctx = this._growthCtx(person);
    const months = growthAgeMonths(ctx.born, ms);
    if (months == null) return null;
    const r = growthPercentile(ref, kind, value, ctx.sex, months);
    return r ? { p: r.p, z: r.z, category: growthCategory(ref, r.z) } : null;
  },
  // A child's BMI percentile readings after the reference in use.
  _pctRows(person, prof) {
    const out = [];
    for (const r of person.rows) {
      const t = Date.parse(r.timestamp), w = Number(r.weight);
      if (Number.isNaN(t) || !(w > 0)) continue;
      const h = this._heightAt(person, t, prof.heightCm);
      if (!(h > 0)) continue;
      const g = this._growthAt(person, "bmi", w / (h / 100) ** 2, t, prof.reference);
      if (g) out.push({ t, v: g.p });
    }
    return out.sort((a, b) => a.t - b.t);
  },
  // The percentile at a reading (within ten minutes) and the one before it.
  _pctAt(person, prof, ts) {
    const rows = this._pctRows(person, prof);
    const t0 = Date.parse(ts);
    let k = -1, best = Infinity;
    rows.forEach((r, i) => {
      const d = Math.abs(r.t - t0);
      if (d < best) { best = d; k = i; }
    });
    if (k < 0 || best > 600000) return [null, null];
    return [Number(rows[k].v), k > 0 ? Number(rows[k - 1].v) : null];
  },
  // ------------------------------------------------------- explanations

  _profileOf(person) {
    return this._profileFromDirectory(person);
  },
  // Profile from the interface directory: birth date, sex, method, heights.
  _profileFromDirectory(person) {
    const hs = this._heightHistory(person);
    const last = hs[hs.length - 1];
    const heightCm = last ? last.v : null;
    const b = Date.parse(person.born || "");
    let age = null;
    if (!Number.isNaN(b)) {
      const bd = new Date(b), n = new Date();
      age = n.getFullYear() - bd.getUTCFullYear() - (n < new Date(n.getFullYear(), bd.getUTCMonth(), bd.getUTCDate()) ? 1 : 0);
    }
    return {
      heightAgeDays: last ? (Date.now() - last.t) / 86400000 : null,
      age,
      minor: age != null && age < 18,
      heightCm,
      sex: person.sex === "male" || person.sex === "female" ? person.sex : null,
      athlete: !!person.athlete,
      alternative: person.method === "alternative",
      ...this._percentilesOf(person, age, heightCm),
    };
  },
  // The latest BMI and the height as percentiles after the reference in use
  // and the other one (children only).
  _percentilesOf(person, age, heightCm) {
    const ctx = this._growthCtx(person);
    const base = { reference: ctx.chosen, compare: ctx.compare, percentile: null, percentileCategory: null, percentileOther: null, categoryOther: null, heightPercentile: null, heightPercentileOther: null };
    if (age == null || age >= 18 || !ctx.born) return base;
    const row = person.rows[0];
    const t = Date.parse(row?.timestamp), w = Number(row?.weight);
    if (!Number.isNaN(t) && w > 0 && heightCm > 0) {
      const bmi = w / (heightCm / 100) ** 2;
      const a = this._growthAt(person, "bmi", bmi, t, ctx.chosen), b = this._growthAt(person, "bmi", bmi, t, ctx.other);
      base.percentile = a ? a.p : null;
      base.percentileCategory = a ? a.category : null;
      base.percentileOther = b ? b.p : null;
      base.categoryOther = b ? b.category : null;
    }
    if (heightCm > 0) {
      const now = Date.now();
      const a = this._growthAt(person, "height", heightCm, now, ctx.chosen), b = this._growthAt(person, "height", heightCm, now, ctx.other);
      base.heightPercentile = a ? a.p : null;
      base.heightPercentileOther = b ? b.p : null;
    }
    return base;
  },
  _renderProfile(person, t) {
    // Age, height and method at a glance: BMI, fat and percentile depend on
    // them, so an outdated height shows up here first.
    const prof = this._profileOf(person);
    const it = infoText(this._lang);
    // Symbol and value, the words as tooltip; height opens its dialog.
    const item = (icon, text, title, extra = "") =>
      `<span class="pf" title="${esc(title)}"><ha-icon icon="${icon}"></ha-icon>${text ? `<span>${esc(text)}</span>` : ""}${extra}</span>`;
    const items = [];
    if (prof.sex) items.push(item(prof.sex === "female" ? "mdi:gender-female" : "mdi:gender-male", "", t.sexes[prof.sex]));
    if (prof.age != null) items.push(item("mdi:cake-variant-outline", String(prof.age), t.years(prof.age)));
    const canHeight = this._can("set_height");
    if (prof.heightCm && !canHeight) items.push(item("mdi:human-male-height", this._cm(prof.heightCm), t.chartLabels.height));
    if (prof.heightCm && canHeight) {
      items.push(`<button class="pf inline-link" data-action="height" data-user="${esc(person.id)}" title="${esc(t.heightEdit)}" aria-label="${esc(t.heightEdit)}">
        <ha-icon icon="mdi:human-male-height"></ha-icon><span>${esc(this._cm(prof.heightCm))}</span><ha-icon class="pen" icon="mdi:pencil-outline"></ha-icon></button>`);
    }
    if (prof.sex) {
      const name = [it.algos[prof.alternative ? "alternative" : "standard"][0], prof.athlete && it.algos.athlete[0]].filter(Boolean).join(", ");
      items.push(`<span class="pf">${methodIcon(prof, `${it.algoTitle}: ${name}`)}</span>`);
    }
    if (person.private) items.push(item("mdi:eye-off-outline", "", t.private));
    // Children grow: remind when the height is older than half a year.
    if (canHeight && prof.minor && prof.heightAgeDays != null && prof.heightAgeDays > 182) {
      items.push(`<button class="pf inline-link stale" data-action="height" data-user="${esc(person.id)}">${esc(`${t.heightOld(Math.floor(prof.heightAgeDays / 30.4))} · ${t.heightNow}`)}</button>`);
    }
    if (!items.length) return "";
    return `<div class="profile">${items.join("")}</div>`;
  },
  _renderSummary(person, t) {
    const latest = person.rows[0];
    if (!latest) return "";
    const unit = "kg";
    const delta = (days) => {
      const d = this._weightChange(person, days);
      if (d == null) return "";
      const sign = d > 0.05 ? "+" : d < -0.05 ? "−" : "±";
      return `<span class="kpi" title="${esc(t.days(days))}"><span class="kpi-label muted" aria-label="${esc(t.days(days))}">${calendar(days)}</span><span>${sign}${this._num(Math.abs(d), 2)} ${unit}</span></span>`;
    };
    const parts = [
      `<span class="kpi" title="${esc(t.latest)}"><span class="kpi-label muted" aria-label="${esc(t.latest)}"><ha-icon icon="mdi:scale-bathroom"></ha-icon></span><span class="strong">${this._num(latest.weight, 2)} ${unit}</span></span>`,
    ];
    if (this._config.info === false && latest.body_mass_index != null) parts.push(`<span class="kpi"><span class="muted small">BMI</span><span>${this._num(latest.body_mass_index, 1)}</span></span>`);
    if (this._config.info === false && latest.body_fat_percentage != null) parts.push(`<span class="kpi"><span class="muted small">${esc(t.cols.body_fat_percentage)}</span><span>${this._num(latest.body_fat_percentage, 1)} %</span></span>`);
    parts.push(delta(7), delta(30));
    // Equal columns, label above value: one line on every width.
    const kpis = parts.filter(Boolean);
    return `<div class="summary" style="--k:${kpis.length}">${kpis.join("")}</div>`;
  },
  _references(person, key) {
    // [chosen in the options, the other one]; the curves come from the tables in the card.
    const ctx = this._growthCtx(person);
    const kind = key === "height_percentile" ? "height" : "bmi";
    const has = (ref) => !!growthLms(ref, kind, ctx.sex, ref === "kh" ? 120 : 120);
    return { attrs: {}, chosen: ctx.chosen, other: ctx.other, hasOther: has(ctx.other), compare: ctx.compare };
  },
  // A child's current percentile of a metric after a reference.
  _pctNow(person, metric, ref) {
    const prof = this._profileOf(person);
    const first = ref === prof.reference;
    return metric === "height_percentile" ? (first ? prof.heightPercentile : prof.heightPercentileOther) : (first ? prof.percentile : prof.percentileOther);
  },
  _refAvailable(person, ref) {
    // The reference has curves for this child.
    return !!this._bands(person, "bmi_percentile", ref === this._references(person, "bmi_percentile").chosen ? "ref" : "other");
  },
  _refSeries(person, metric, ref) {
    // The percentile after a reference, computed here: per weight (BMI, with
    // the height of that time) or per height entry.
    const prof = this._profileOf(person);
    const from = Date.now() - PERIODS[this._period || "month"].days * 86400000;
    if (metric !== "height_percentile") {
      return this._series(person, "weight")
        .map((p) => {
          const h = this._heightAt(person, p.t, prof.heightCm);
          const g = h > 0 ? this._growthAt(person, "bmi", p.v / (h / 100) ** 2, p.t, ref) : null;
          return g ? { t: p.t, v: g.p } : null;
        })
        .filter(Boolean);
    }
    const all = this._heightHistory(person)
      .map((r) => {
        const g = this._growthAt(person, "height", r.v, r.t, ref);
        return g ? { t: r.t, v: g.p } : null;
      })
      .filter(Boolean);
    const points = all.filter((p) => p.t >= from);
    // Held like the height itself: to the period start and to now.
    const before = all.filter((p) => p.t < from).pop();
    if (before) points.unshift({ t: from, v: before.v, synthetic: true });
    const last = points[points.length - 1];
    if (last && Date.now() - last.t > 60000) points.push({ t: Date.now(), v: last.v, synthetic: true });
    return points;
  },
});

/*
 * Module card-scale: the scale device
 *
 * The scale as a device: display, mode keys, person keys, preselection timers, the
 * history digits, the glide animation and the key layout.
 */

mixin(BodyScaleCard, {
  // Brightness of an active inverted field, percent of the LED colour (20 to 100, default 65).
  _invBrightness() {
    const v = Number(this._config?.invert_brightness);
    return v >= 20 && v <= 100 ? v : 65;
  },
  // Choose who steps on next (`kind` is auto, guest or a person_id).
  _setNext(nx, kind, option, minutes) {
    return this._call("set_next_user", { choice: kind, ...(minutes > 0 ? { minutes } : {}) });
  },
  _runGlide() {
    // Move each series from its old scale into the new one; curves fade in.
    const before = this._glide, after = this._scales;
    this._glide = null;
    const svg = this.shadowRoot.querySelector("svg.chart");
    if (!before || !after || !svg) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !Element.prototype.animate) return;
    const ease = { duration: 300, easing: "ease-out" };
    for (const side of ["left", "right"]) {
      const from = before[side], to = after[side];
      if (!from || !to || from.key !== to.key || from.h !== to.h) continue;
      const k = (to.v1 - to.v0) / (from.v1 - from.v0);
      const dy = to.top + ((from.v1 - to.v1) / (from.v1 - from.v0)) * to.h - k * to.top;
      if (Math.abs(k - 1) < 1e-3 && Math.abs(dy) < 0.5) continue;
      const sel = side === "left" ? ".line.left, .dot.left, .last.left, .area" : ".line.right, .dot.right, .last.right";
      svg.querySelectorAll(sel).forEach((el) => {
        el.style.transformOrigin = "0 0";
        el.animate([{ transform: `translate(0px, ${dy}px) scale(1, ${k})` }, { transform: "none" }], ease);
      });
    }
    svg.querySelectorAll(".guide, .band-line, .band-median, .axis").forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], ease));
  },
  // Baby / pet mode, kept in the card: the integration is set to Guest; the
  // first new guest reading is the carrier alone (base), the second the
  // carrier with the baby; the difference is the result. Guest readings the
  // mode used up never show as guest results.
  _holdStart(data) {
    this._holdUsed = new Set(this._holdUsed || []);
    if (data.guest?.timestamp) this._holdUsed.add(data.guest.timestamp);
    this._hold = { stage: 1, base: null, at: Date.now() };
  },
  _holdAdvance(data, next, guest) {
    const used = (this._holdUsed = this._holdUsed || new Set());
    const g = data.guest;
    const h = this._hold;
    if (h) {
      const lost = next.state !== guest && Date.now() - h.at > 4000;
      const old = Date.now() - h.at > (Number(this._config.choice_minutes) > 0 ? Number(this._config.choice_minutes) : Number(next.attributes.timeout_minutes) || 5) * 60000 + 4000;
      if (lost || old) this._hold = null;
    }
    if (this._hold && g && g.timestamp && !used.has(g.timestamp)) {
      const hh = this._hold;
      used.add(g.timestamp);
      if (hh.stage === 1) {
        hh.base = { timestamp: g.timestamp, weight: Number(g.weight), impedance: g.impedance };
        hh.stage = 2;
        hh.at = Date.now();
        // Arm the guest again for the second weighing.
        const cm = Number(this._config.choice_minutes);
        Promise.resolve(this._setNext(next, "guest", guest, cm)).catch(() => {});
      } else {
        // Order does not matter (with the baby first or second): heavy minus light.
        const a = Number(g.weight), b = hh.base.weight;
        const total = Math.max(a, b), base = Math.min(a, b);
        const diff = Math.round((total - base) * 100) / 100;
        this._holdResult = { timestamp: g.timestamp, weight: diff, total, base, same: diff < 0.1 };
        this._hold = null;
      }
    }
    if (g && used.has(g.timestamp)) data.guest = null;
  },
  // The scale as a device: the display shows the latest weighing and what
  // happens next; the two mode keys under it and the person keys choose the
  // mode. A key that is armed is pressed again to go back to "automatic".
  // Display and keys keep their places in every state.
  _renderNext(data, t) {
    const next = data.next;
    if (!next || !Array.isArray(next.attributes?.options)) return "";
    // Fixed choices first (automatic, guest, then the people). Baby/pet is a mode
    // of the card itself: two guest readings, the difference is the result.
    const [auto, guest] = next.attributes.options;
    const holdLabel = this._can("guest") && this._can("set_entry") ? t.hold : "";
    const names = this._ordered(next.attributes.options.slice(2), data);
    this._holdAdvance(data, next, guest);
    // A tap counts at once (before Home Assistant has answered), so nothing of the
    // previous choice or result is carried over.
    const choice = this._choice;
    const optimistic = !!choice && Date.now() - choice.at < 3000 && choice.option !== next.state;
    if (choice && !optimistic) this._choice = null;
    clearTimeout(this._optTimer);
    if (optimistic) this._optTimer = setTimeout(() => this._render(), 3100);
    let current = optimistic ? choice.option : next.state;
    // While the card runs the baby/pet mode the integration waits for a guest.
    if (this._hold && current === guest) current = holdLabel;
    // A choice that has run out counts as Automatik from then on (same time again).
    const vu = Date.parse(next.attributes.valid_until || "");
    if (current !== next.attributes.options[0] && !optimistic && !Number.isNaN(vu)) {
      if (Date.now() < vu) this._lastChoice = { end: vu, start: Date.parse(next.last_changed) || 0 };
      else current = next.attributes.options[0];
    }
    const modes = [[guest, t.guest], [auto, t.auto], ...(holdLabel ? [[holdLabel, t.hold]] : [])];
    // Person keys with a view to jump to: holding the key opens it.
    const links = this._config.links || {};
    const linkOf = (option) => {
      const p = data.people.find((x) => x.name === option);
      return p && links[p.id] ? links[p.id] : "";
    };
    const hold = (option) => (linkOf(option) ? ` data-link="${esc(linkOf(option))}"` : "");
    const tip = (option, label) => (linkOf(option) ? `${label} · ${t.holdOpen}` : label);
    const ringOn = this._timerModes().has("ring");
    const key = (option, label, inner, cls = "") => {
      // The three mode keys stay neutral (like unlit keys): the symbol in the display
      // shows the state and the time. Only person keys light up.
      const isMode = cls !== "person";
      const on = option === lit && !isMode;
      const timed = on && end != null;
      const ring = timed && ringOn && cls === "person"
        ? `<svg class="ring" preserveAspectRatio="none" aria-hidden="true"><path/></svg>` : "";
      const title = tip(option, label) + (timed && until ? ` · ${until}` : "");
      return `<button class="key ${cls} ${on ? "on" : ""}" data-action="next" data-option="${esc(option)}"${timed ? ` data-end="${end}" data-start="${start}"` : ""}${hold(option)} title="${esc(title)}" aria-label="${esc(label)}" aria-pressed="${option === lit}">${inner}${ring}</button>`;
    };

    // The latest events: a person's weighing, guest, baby/pet, unclear reading.
    const people = data.people.filter((p) => p.visible);
    const stage = this._hold && current === holdLabel ? this._hold.stage : 0;
    const events = [];
    const latest = people
      .map((p) => ({ p, row: p.rows[0] }))
      .filter((x) => x.row && x.row.weight != null)
      .sort((a, b) => (Date.parse(b.row.timestamp) || 0) - (Date.parse(a.row.timestamp) || 0))[0];
    if (latest) events.push({ kind: "person", ts: latest.row.timestamp, weight: latest.row.weight, ohm: latest.row.impedance, person: latest.p, replaced: latest.row.replaced, idx: 0 });
    if (data.guest) events.push({ kind: "guest", ts: data.guest.timestamp, weight: data.guest.weight, ohm: data.guest.impedance });
    if (this._holdResult) events.push({ kind: "hold", ts: this._holdResult.timestamp, weight: this._holdResult.weight, hold: this._holdResult });
    const base = this._hold?.base;
    if (stage === 2 && base) events.push({ kind: "base", ts: base.timestamp, weight: base.weight, ohm: base.impedance });
    // The newest unclear reading, unless it may belong to someone this viewer can't see.
    const open = data.pending[0];
    const candidates = open ? (open.candidates || []).map((id) => data.people.find((x) => x.id === id)).filter(Boolean) : [];
    // Only the suggested person (nearest by last weight) blinks, with the guest key (discard).
    // Blinking: the integration's suggestion plus everybody whose last weight lies
    // within blink_tolerance_kg (default 2) of the reading.
    const tol = this._opt("blink_tolerance_kg") != null && Number(this._opt("blink_tolerance_kg")) >= 0 ? Number(this._opt("blink_tolerance_kg")) : 2;
    const suggestedIds = open ? new Set(open.suggested?.length ? open.suggested : open.candidates || []) : new Set();
    if (open && Number(open.weight) > 0) {
      for (const p of data.people) {
        const last = Number(p.rows[0]?.weight);
        if (last > 0 && Math.abs(last - Number(open.weight)) <= tol) suggestedIds.add(p.id);
      }
    }
    const suggested = open ? [...suggestedIds].map((id) => data.people.find((x) => x.id === id)).filter(Boolean) : [];
    if (open && candidates.every((x) => x.visible)) {
      events.push({ kind: "open", ts: open.timestamp, weight: open.weight, ohm: open.resistance_1, open, candidates, suggested });
    }
    let ev = events.sort((a, b) => (Date.parse(b.ts) || 0) - (Date.parse(a.ts) || 0))[0] || null;
    const lc = this._lastChoice;
    if (lc && current === auto && !optimistic && Date.now() >= lc.end) {
      // Not used up by a reading since the choice: Automatik is active from the end of it.
      if (!(ev && (Date.parse(ev.ts) || 0) > lc.start)) this._autoWake = lc.end;
      this._lastChoice = null;
    }
    // A tap on any key ends the result shown (an unclear reading stays).
    const clickAt = this._clickAt || 0;
    if (ev && ev.kind !== "open" && clickAt > (Date.parse(ev.ts) || 0)) ev = null;
    // A key pressed after the last reading: ready, like a real scale
    // (00.00 and the chosen name); an older reading never gets their name.
    // A tap on Automatik wakes the display like the other keys (00.00, lit) for display_hold minutes.
    const holdMs = (Number(this._config.display_hold) > 0 ? Number(this._config.display_hold) : 5) * 60000;
    // Same time as a choice of any other key: the integration's setting.
    const cfgMin = Number(this._config.choice_minutes);
    const wakeMs = (cfgMin > 0 ? cfgMin : Number(next.attributes.timeout_minutes) > 0 ? Number(next.attributes.timeout_minutes) : 5) * 60000;
    // Automatic chosen on any view (the integration stamps it) wakes this one, too.
    const autoSel = current === auto && !optimistic ? Date.parse(next.attributes.auto_selected_at || "") : NaN;
    const autoWake = Math.max(this._autoWake || 0, Number.isNaN(autoSel) ? 0 : autoSel);
    const wakeAt = current === auto && autoWake && Date.now() < autoWake + wakeMs ? autoWake : 0;
    const waiting = people.find((p) => p.name === current) ? "person" : current === guest ? "guest" : stage === 1 ? "hold" : wakeAt ? "auto" : null;
    const since = Math.max(Date.parse(next.last_changed) || 0, clickAt, wakeAt);
    const ready = !!waiting && (!ev || since > (Date.parse(ev.ts) || 0));
    if (ready) ev = null;
    this._shownPending = ev?.kind === "open" ? ev.open.measurement_id : null;

    // Time left: until the choice runs out, or until the result is put away
    // (display_hold minutes after the reading). An unclear reading stays.
    const validUntil = Date.parse(next.attributes.valid_until || "");
    let end = null, start = null;
    if (ev?.kind !== "open") {
      if ((ready || stage === 2) && current !== auto && !Number.isNaN(validUntil) && !optimistic) {
        end = validUntil;
        start = Date.parse(next.last_changed) || end - holdMs;
      } else if (ev) {
        start = Date.parse(ev.ts) || 0;
        end = start + holdMs;
      } else if (ready && wakeAt) {
        start = wakeAt;
        end = wakeAt + wakeMs;
      }
    }
    const idle0 = ev?.kind !== "open" && ((end != null && end - Date.now() <= 0) || (!ready && !ev));
    if (idle0) end = null;

    // History: the ten newest readings of all visible people.
    const list = this._histList(data);
    const key0 = list[0]?.row.timestamp || "";
    if (this._histKey !== key0) {
      this._histKey = key0;
      this._hist = null;
    }
    if (this._hist && !list[this._hist - 1]) this._hist = null;
    const h = this._hist ? list[this._hist - 1] : null;
    // A reading called up from the history is never idle.
    const idle = idle0 && !h;
    let shown = idle ? null : ev;
    if (h) {
      shown = { kind: "person", ts: h.row.timestamp, weight: h.row.weight, ohm: h.row.impedance, person: h.p, replaced: h.row.replaced, idx: h.i };
      end = null;
    }
    // The mode is only shown while nothing is displayed: not with a result, an old
    // reading from the history or an open reading (their keys show who it is).
    const modeOpt = h || shown ? null : current;
    // The key that is lit: the person or mode of the reading shown, else the choice.
    // Lit = active now (a result of it, or the scale waiting for it); framed =
    // the mode that is set (automatic when nothing is chosen). Idle: all dim, automatic framed.
    let lit = null;
    if (h) lit = h.p.name;
    else if (shown?.kind === "person") lit = shown.person.name;
    else if (shown?.kind === "guest") lit = guest;
    else if (shown?.kind === "hold" || shown?.kind === "base") lit = holdLabel;
    else if (ready) lit = current;

    const icon = (i) => `<ha-icon icon="${i}"></ha-icon>`;
    const val = (row, m) => (row && row[m] != null && row[m] !== "" && !Number.isNaN(Number(row[m])) ? Number(row[m]) : null);
    const arrow = (now, prev, digits) => {
      if (now == null || prev == null) return "";
      const d = Number((now - prev).toFixed(digits));
      return `<span class="d-ar">${d > 0 ? "▲" : d < 0 ? "▼" : "▬"}</span>`;
    };
    const algos = infoText(this._lang).algos;

    // Whose reading it is: the weighed person, else the one chosen.
    const chosen = people.find((p) => p.name === current);
    const who = shown?.kind === "person" ? shown.person : !shown && ready && chosen ? chosen : null;
    const prof = who ? this._profileOf(who) : null;

    // Left part of the values row: BMI (children: percentile) and fat; the
    // fat only when measured with impedance. Trend beside kg.
    const measured = Number(shown?.ohm) > 0;
    let trend = "";
    let leftHtml = "";
    if (shown?.kind === "person") {
      const rows = shown.person.rows || [];
      const row = rows[shown.idx], prev = rows[shown.idx + 1];
      const w0 = val(row, "weight"), w1 = val(prev, "weight");
      if (w0 != null && w1 != null) {
        const d = Number((w0 - w1).toFixed(1));
        trend = `${d > 0 ? "▲" : d < 0 ? "▼" : "▬"}${d ? this._lcd(Math.abs(d), 1) : ""}`;
      }
      let bmi = "--.-";
      let bmiLabel = t.chartLabels.body_mass_index;
      if (prof.minor && prof.percentile != null) {
        const [p0, p1] = this._pctAt(shown.person, prof, shown.ts);
        const p = p0 != null ? p0 : h ? null : prof.percentile;
        bmi = p != null ? `P${this._lcd(p, 0)}${arrow(p0, p1, 0)}` : "P--";
        bmiLabel = t.chartLabels.bmi_percentile;
      } else if (val(row, "body_mass_index") != null) {
        bmi = `${this._lcd(val(row, "body_mass_index"), 1)}${arrow(val(row, "body_mass_index"), val(prev, "body_mass_index"), 1)}`;
      }
      leftHtml = `<span class="d-val" title="${esc(bmiLabel)}">${icon("body_scale:bmi")}${bmi}</span>`;
      if (measured) {
        const f0 = val(row, "body_fat_percentage");
        const fat = f0 != null ? `${this._lcd(f0, 1)}%${arrow(f0, val(prev, "body_fat_percentage"), 1)}` : "--.-%";
        leftHtml += `<span class="d-val" title="${esc(t.chartLabels.body_fat_percentage)}">${icon("body_scale:body-fat")}${fat}</span>`;
      }
    } else if (shown?.kind === "hold" && shown.hold.base != null) {
      leftHtml = `<span class="d-sum"${shown.hold.same ? ` title="${esc(t.holdSame)}"` : ""}>${shown.hold.same ? icon("mdi:alert-outline") : ""}${this._w2(shown.hold.total)} − ${this._w2(shown.hold.base)}</span>`;
    } else if (stage) {
      leftHtml = `<span class="d-steps" title="${esc(t.holdSteps[stage - 1] || `${stage}/2`)}"><span class="hs ${stage === 1 ? "now" : ""}">${icon("mdi:account")}</span><span class="ar">→</span>` +
        `<span class="hs ${stage === 2 ? "now" : ""}">${icon("mdi:account")}<span class="pl">+</span>${icon("mdi:baby-face-outline")}${icon("mdi:paw")}</span></span>`;
    }

    // Right block: three slots of equal width: replaced · athlete · method
    // (or "not stored" in place of the method).
    const nosave = !h && (["guest", "hold", "base"].includes(shown?.kind) || (ready && (waiting === "guest" || waiting === "hold")) || stage > 0);
    const slot = (inner, title) => `<span class="d-sl"${inner && title ? ` title="${esc(title)}"` : ""}>${inner || ""}</span>`;
    const methodTitle = prof ? [algos[prof.alternative ? "alternative" : "standard"][0], prof.athlete && algos.athlete[0]].filter(Boolean).join(" + ") : "";
    const cluster = `<span class="d-cl">${slot(shown?.kind === "person" && !h && shown.replaced ? icon("mdi:sync") : "", t.replaced)}` +
      `${slot(prof?.athlete ? icon("mdi:weight-lifter") : "", algos.athlete[0])}` +
      `${prof ? slot(methodMark(prof.alternative ? 2 : 1), methodTitle) : nosave ? slot(icon("mdi:content-save-off-outline"), t.guestNote) : slot("")}</span>`;

    // Weight on the scale's 0.05 raster; the other lines dim when idle.
    const wTxt = shown ? this._w2(shown.weight) : ready ? "00.00" : "--.--";
    const [wa, wb] = (wTxt || "--.--").split(".");
    const ohmHtml = idle ? "" : shown && measured ? `${this._lcd(shown.ohm, 0)}<span class="d-u">Ω</span>` : shown?.kind === "person" ? `<span title="${esc(t.noImpedance)}">${icon("mdi:shoe-sneaker")}</span>` : "";
    const two = (n) => String(n).padStart(2, "0");
    let date = "", time = "";
    if (h) {
      const d = new Date(h.row.timestamp);
      if (!Number.isNaN(d.getTime())) {
        date = `${two(d.getDate())}.${two(d.getMonth() + 1)}`;
        time = `${two(d.getHours())}:${two(d.getMinutes())}`;
      }
    }
    const until = !h && !Number.isNaN(validUntil) && current !== auto
      ? t.until(new Date(validUntil).toLocaleTimeString(this._lang, { hour: "2-digit", minute: "2-digit" })) : "";
    const kgTrend = shown?.kind === "person" && !h ? trend : "";
    const side = `<div class="d-side ${idle ? "dim" : ""}"><div class="d-l"><div class="d-s">${ohmHtml}</div><div class="d-zn">${date ? `<span class="d-dt">${date}</span>` : ""}</div></div>` +
      `<div class="d-l d-l2"><div class="d-kgl">${idle ? "" : "kg"}<span class="d-tr" title="${esc(t.sincePrevious)}">${kgTrend}</span></div><div class="d-zn">${time ? `<span class="d-dt">${time}</span>` : ""}</div></div></div>`;

    // An unclear reading: any person key assigns it, the guest key keeps it as a guest's.
    const openId = ev?.kind === "open" ? ev.open.measurement_id : null;
    const candNames = new Set(ev?.kind === "open" ? ev.suggested.map((x) => x.name) : []);
    const candList = ev?.kind === "open" ? ev.suggested.map((x) => x.name) : [];
    // The guest key blinks in turn: choosing it keeps the reading as a guest's (not assigned).
    // A baby/pet result: the babies' keys blink in turn with the guest key.
    const babyPeople = shown?.kind === "hold" && !h && !shown.hold.same && this._can("set_entry") ? people.filter((x) => x.isBaby) : [];
    const babyList = babyPeople.map((x) => x.name);
    const blink = openId ? [...candList, guest] : babyList.length ? [...babyList, guest] : [];
    // Last row: the three modes as symbols, each above its slim key.
    const cycle = (i, n) => (n > 1 ? `style="animation: rs${n} ${n}s step-end infinite; animation-delay: -${(n - i) % n}s"` : "");
    const shorts = initials(names);
    const mode = (opt, i, title) => {
      const blinking = blink.length && opt === guest;
      const timed = lit === opt && end != null;
      return `<span class="d-m ${opt === modeOpt ? "mode" : ""} ${lit === opt ? "on" : ""} ${blinking ? "cand cyc" : ""}"${timed ? ` data-end="${end}" data-start="${start}"${opt === auto ? " data-auto" : ""}` : ""} ${blinking ? cycle(blink.length - 1, blink.length) : ""} title="${esc(title + (timed && until ? ` · ${until}` : ""))}">${i}</span>`;
    };
    const bottom = `<div class="d-bot" style="--m:${modes.length}">${mode(guest, icon("mdi:account-question-outline"), t.guest)}${mode(auto, icon("mdi:account-search-outline"), t.auto)}` +
      (holdLabel ? mode(holdLabel, icon("mdi:baby-face-outline") + icon("mdi:paw"), t.hold) : "") + `</div>`;
    const hist = `<div class="d-hist ${idle ? "off" : ""}">${[...Array(10).keys()].map((k) => {
      const i = k + 1, row = list[k];
      return row
        ? `<span class="${this._hist === i ? "cur" : ""}" data-action="hist" data-i="${i}" role="button" tabindex="0" title="${esc(this._when(row.row))}">${i}</span>`
        : `<span class="none">${i}</span>`;
    }).join("")}</div>`;

    // An unclear reading: any person key assigns it, the guest key discards it.

    const keyFor = (option, label, inner, cls = "") => {
      if (openId && option === guest) {
        return `<button class="key ${cls} cand cyc" ${cycle(blink.length - 1, blink.length)} data-action="discard" data-mid="${esc(openId)}" title="${esc(t.discard)}" aria-label="${esc(t.discard)}">${inner}</button>`;
      }
      if (babyList.length && option === guest) {
        return `<button class="key ${cls} cand cyc" ${cycle(blink.length - 1, blink.length)} data-action="baby-dismiss" title="${esc(t.babyDismiss)}" aria-label="${esc(t.babyDismiss)}">${inner}</button>`;
      }
      const baby = babyList.indexOf(option);
      if (baby >= 0) {
        const bp = babyPeople[baby];
        return `<button class="key ${cls} cand cyc" ${cycle(baby, blink.length)} data-action="baby-assign" data-user="${esc(bp.id)}" data-w="${esc(this._w2(shown.weight))}" data-raw="${esc(shown.weight)}" data-ts="${esc(shown.ts)}"${hold(option)} title="${esc(tip(option, label))}" aria-label="${esc(label)}">${inner}</button>`;
      }
      const person = openId && data.people.find((x) => x.name === option);
      if (person) {
        const i = candList.indexOf(option);
        return `<button class="key ${cls} ${candNames.has(option) ? "cand cyc" : ""}" ${i >= 0 ? cycle(i, blink.length) : ""} data-action="assign" data-mid="${esc(openId)}" data-user="${esc(person.id)}"${hold(option)} title="${esc(tip(option, label))}" aria-label="${esc(label)}">${inner}</button>`;
      }
      return key(option, label, inner, cls);
    };
    const modeKeys2 = modes.map(([o, label]) => keyFor(o, label, "")).join("");
    const personKeys2 = names.map((n, i) => keyFor(n, n, `<span class="full">${esc(n)}</span><span class="short">${esc(shorts[i])}</span>`, "person")).join("");
    const n = blink.length;
    const frames = n > 1 ? `<style>@keyframes rs${n} { 0% { opacity: 1; } ${(100 / n).toFixed(2)}% { opacity: 0.25; } 100% { opacity: 0.25; } }</style>` : "";
    return `<section class="device-wrap">${frames}<div class="device ${this._config.skin === "theme" ? "theme" : ""} ${this._config.invert_modes === true ? "inv-modes" : ""} ${this._config.invert_history === true ? "inv-hist" : ""} ${this._config.mode_field_width === "wide" ? "fw-wide" : ""}" style="--inv: ${this._invBrightness()}" role="group" aria-label="${esc(t.next)}">
        <div class="device-top">
          <div class="display" aria-live="off">
            ${hist}
            <div class="d-wrow"><div class="d-weight ${idle ? "dim" : ""}">${wa}<span class="dp"><i></i></span>${wb}</div>${side}</div>
            <div class="d-row"><span class="d-vv">${leftHtml}</span>${cluster}</div>
            ${bottom}
          </div>
          <div class="mode-keys">${modeKeys2}</div>
        </div>
        <div class="person-keys" style="--n:${names.length}">${personKeys2}</div>
        <div class="feet"><span></span><span></span></div>
      </div></section>`;
  },
  // The ten newest readings of all visible people (no guest, no baby/pet).
  _histList(data) {
    const out = [];
    for (const p of data.people.filter((x) => x.visible)) {
      (p.rows || []).forEach((row, i) => {
        if (row.weight != null) out.push({ p, row, i });
      });
    }
    return out.sort((a, b) => (Date.parse(b.row.timestamp) || 0) - (Date.parse(a.row.timestamp) || 0)).slice(0, 10);
  },
  // How long a reading called up from the history stays (seconds in the option).
  _histHold() {
    const v = Number(this._config?.history_hold);
    return (v > 0 ? v : 30) * 1000;
  },
  // How the lit key shows the time left: key_timer = frame (default: thick frame
  // that thins to the normal one), ring (outline runs back), fade (key darkens),
  // all, none; combinable with commas. The old key_timer_ring / key_timer_fade
  // switch the ring / fading on when set to true.
  _timerModes() {
    const c = this._config || {};
    if (c.key_timer != null) {
      const set = new Set(String(c.key_timer).split(/[\s,+]+/).filter(Boolean));
      if (set.has("all")) return new Set(["frame", "ring", "fade"]);
      if (set.has("none")) return new Set();
      return set;
    }
    const m = new Set(["frame"]);
    if (c.key_timer_ring === true) m.add("ring");
    if (c.key_timer_fade === true) m.add("fade");
    return m;
  },
  // The lit key shows the time left by itself, without numbers: its outline
  // runs back and it fades (each can be switched off with key_timer_ring /
  // key_timer_fade), and it blinks in the last minute. Everything is derived
  // from the end time, so a redraw never restarts it.
  _armKeyTimer() {
    clearTimeout(this._keyTimer);
    (this._keyAnims || []).forEach((a) => a.cancel());
    this._keyAnims = [];
    // The history number called up fades over the time it stays.
    const cur = this.shadowRoot.querySelector(".d-hist span.cur");
    if (cur && this._hist && Element.prototype.animate) {
      const hl = this._histAt + this._histHold() - Date.now();
      if (hl > 0) this._keyAnims.push(cur.animate([{ opacity: 1 }, { opacity: 0.5 }], { duration: hl, easing: "linear", fill: "forwards" }));
    }
    const el = this.shadowRoot.querySelector(".device .key[data-end], .device .d-m[data-end]");
    if (!el) return;
    const symbol = el.classList.contains("d-m");
    const end = Number(el.dataset.end), start = Number(el.dataset.start);
    const now = Date.now(), total = Math.max(1, end - start), left = end - now;
    if (left <= 0) {
      this._render();
      return;
    }
    const elapsed = total - left;
    const modes = symbol ? new Set() : this._timerModes();
    this._keyRO?.disconnect();
    if (Element.prototype.animate && modes.has("frame")) {
      // The frame starts thick and thins out to the normal one over the time left.
      const cs = getComputedStyle(el);
      const led = cs.getPropertyValue("--led").trim() || cs.color;
      const glow = cs.getPropertyValue("--glow").trim() || "transparent";
      const sh = (px) => `inset 0 0 0 ${px.toFixed(2)}px ${led}, 0 0 8px ${glow}`;
      const opts = { duration: left, easing: "linear", fill: "forwards" };
      this._keyAnims.push(el.animate([{ boxShadow: sh(1 + 2 * (left / total)) }, { boxShadow: sh(1) }], opts));
    }
    if (Element.prototype.animate) {
      const ring = el.querySelector(".ring path");
      if (ring && !(el.clientWidth > 0 && el.clientHeight > 0)) {
        // Not laid out yet (hidden view, first draw): draw the ring once it has a size.
        if (window.ResizeObserver) {
          this._keyRO = new ResizeObserver(() => {
            if (el.clientWidth > 0) {
              this._keyRO.disconnect();
              this._armKeyTimer();
            }
          });
          this._keyRO.observe(el);
        }
      } else if (ring) {
        // Drawn in real pixels, always from the top centre clockwise, so every
        // browser starts at the same place.
        const w = el.clientWidth, h = el.clientHeight, r = 9, x0 = 1.2, y0 = 1.2, x1 = w - 1.2, y1 = h - 1.2, m = w / 2;
        ring.parentNode.setAttribute("viewBox", `0 0 ${w} ${h}`);
        ring.setAttribute("d", `M${m} ${y0}H${x1 - r}A${r} ${r} 0 0 1 ${x1} ${y0 + r}V${y1 - r}A${r} ${r} 0 0 1 ${x1 - r} ${y1}H${x0 + r}A${r} ${r} 0 0 1 ${x0} ${y1 - r}V${y0 + r}A${r} ${r} 0 0 1 ${x0 + r} ${y0}H${m}`);
        const len = ring.getTotalLength ? ring.getTotalLength() : 0;
        if (len > 0) {
          ring.style.strokeDasharray = `${len} ${len}`;
          this._keyAnims.push(ring.animate([{ strokeDasharray: `${(left / total) * len} ${len}` }, { strokeDasharray: `0 ${len}` }], { duration: left, easing: "linear", fill: "forwards" }));
        }
      }
      if (modes.has("fade")) {
        // Clearly darker already by half time (70 %), then faster, down to 35 % at the end.
        const slow = 0.5 * total, quick = Math.max(slow, total - 60000);
        const pts = [[0, 1], [slow, 0.7], [quick, 0.5], [total, 0.35]];
        const at = (x) => {
          for (let i = 1; i < pts.length; i++) {
            if (x <= pts[i][0]) {
              const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
              return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
            }
          }
          return pts[pts.length - 1][1];
        };
        const frames = [{ offset: 0, opacity: at(elapsed) }];
        for (const [x, y] of pts) if (x > elapsed && x < total) frames.push({ offset: (x - elapsed) / left, opacity: y });
        frames.push({ offset: 1, opacity: pts[pts.length - 1][1] });
        this._keyAnims.push(el.animate(frames, { duration: left, easing: "linear", fill: "forwards" }));
      }
    }
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // Mode symbol (guest, baby/pet): calm, its frame blinks in the last minute;
    // Automatic never blinks. Person key: only with key_blink: true.
    const wantsBlink = symbol ? !el.hasAttribute("data-auto") : this._config.key_blink === true;
    const blink = () => { if (!reduce) el.classList.add("expiring"); };
    if (wantsBlink) {
      if (left <= 60000) blink();
      else this._keyTimer = setTimeout(blink, left - 60000);
    }
    clearTimeout(this._keyEnd);
    this._keyEnd = setTimeout(() => this._render(), left + 50);
  },
  // Full names on the person keys while they fit on one line; otherwise the
  // initials, spread evenly over as few rows as six to a row allow.
  _fitKeys() {
    const glance = this.shadowRoot?.querySelector(".glance");
    if (glance) {
      glance.classList.remove("compact");
      if (glance.scrollWidth > glance.clientWidth + 1) glance.classList.add("compact");
    }
    if (!this._resizer && window.ResizeObserver) {
      this._resizer = new ResizeObserver(() => this._fitKeys());
      this._resizer.observe(this);
    }
    this._placeDetail();
    const box = this.shadowRoot?.querySelector(".person-keys");
    if (!box) return;
    if (this._keyBox !== box && this._resizer) {
      // The key row itself is watched, too (shown again after a tab switch).
      this._keyBox = box;
      this._resizer.observe(box);
    }
    if (!this._fontsWatched && document.fonts?.ready) {
      this._fontsWatched = true;
      document.fonts.ready.then(() => this._fitKeys());
    }
    const n = box.children.length;
    // Full names on one row, else on two even rows, else initials; all keys
    // alike. Decided by calculation (text width in the key's own font against
    // the key width), not by a one-off look at the layout, and with a small
    // tolerance in favour of the last choice so it does not flip at the edge.
    box.classList.remove("short");
    box.closest(".device")?.classList.remove("short-keys");
    box.classList.toggle("one", n === 1);
    box.style.setProperty("--cols", n);
    const keys = [...box.children];
    const width = box.clientWidth;
    if (!width || !keys.length) return;
    const names = keys.map((k) => k.querySelector(".full")?.textContent || "");
    const cs = getComputedStyle(keys[0]);
    const ctx = (this._measure = this._measure || document.createElement("canvas").getContext("2d"));
    let widest = 0;
    if (ctx) {
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      widest = Math.max(...names.map((nm) => ctx.measureText(nm).width));
    }
    if (!widest) widest = Math.max(...keys.map((k) => k.querySelector(".full")?.offsetWidth || 0));
    const gap = 7;
    const keyWidth = (cols) => (width - (cols - 1) * gap) / cols;
    const key = `${names.join("|")}|${n}`;
    const last = this._keyMode?.key === key ? this._keyMode.mode : null;
    const room = (cols, mode) => keyWidth(cols) - (widest + 14) + (last === mode ? 6 : 0) >= 0;
    let mode = "short";
    if (room(n, "one")) mode = "one";
    else if (n > 1 && Math.ceil(n / 2) <= 6 && room(Math.ceil(n / 2), "two")) mode = "two";
    this._keyMode = { key, mode };
    if (mode === "two") box.style.setProperty("--cols", Math.ceil(n / 2));
    if (mode === "short") {
      box.classList.add("short");
      box.closest(".device")?.classList.add("short-keys");
      box.style.setProperty("--cols", Math.ceil(n / Math.ceil(n / 6)));
    }
  },
  // An opened value tile's explanation goes below the end of its row, so the
  // tiles beside it keep their places.
  _placeDetail() {
    // The pop-up spans the tiles' width with its arrow at the open tile:
    // above it where the card has room (the graph is there), else below.
    const grid = this.shadowRoot?.querySelector(".vals");
    const pop = grid?.querySelector(".val-detail");
    const tile = grid?.querySelector(".val.open");
    if (!pop || !tile) return;
    const g = grid.getBoundingClientRect();
    const r = tile.getBoundingClientRect();
    if (!g.width || !r.width) {
      // Not laid out yet: try again with the next frame.
      if (!this._placeLater) this._placeLater = requestAnimationFrame(() => { this._placeLater = null; this._placeDetail(); });
      return;
    }
    const card = this.shadowRoot.querySelector("ha-card")?.getBoundingClientRect() || g;
    const gap = 10;
    const h = pop.offsetHeight;
    const above = r.top - card.top >= h + gap + 8;
    pop.classList.toggle("below", !above);
    pop.style.top = `${above ? r.top - g.top - h - gap : r.bottom - g.top + gap}px`;
    pop.style.setProperty("--arrow", `${Math.round(r.left - g.left + r.width / 2)}px`);
  },
});

/*
 * Module card-legend: legends and "How the scale works"
 *
 * The collapsible explanation sections: scale symbols, chart and table legend,
 * "How the scale works" with the flow diagram, and the scale info.
 */

mixin(BodyScaleCard, {
  // The explanation of how the scale calculates is the same for everyone:
  // it sits with the scale, not with each person.
  _renderScaleInfo(t) {
    const it = infoText(this._lang);
    const open = this._infoOpen ?? this._restoreFlag("info");
    const head = `<button class="info-toggle" data-action="info" aria-expanded="${open ? "true" : "false"}">
        <ha-icon icon="mdi:information-outline"></ha-icon><span>${esc(it.howTitle)}</span><span class="spacer"></span>
        <ha-icon icon="${open ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon></button>`;
    if (!open) return `<div class="info">${head}</div>`;
    let html = `<div class="info">${head}<div class="info-body">`;
    html += `<div class="explain">${it.how.map((p) => `<p>${p}</p>`).join("")}</div>`;
    html += `<div class="explain"><h3>${esc(it.algoTitle)}</h3><dl class="algos">${["standard", "alternative", "athlete"]
      .map((k) => `<dt>${esc(it.algos[k][0])}</dt><dd>${esc(it.algos[k][1])}</dd>`)
      .join("")}</dl><p class="muted small">${esc(it.setHint)}</p></div>`;
    html += `<div class="note"><ha-icon icon="mdi:clock-outline"></ha-icon><span><b>${esc(it.tipsTitle)}:</b> ${esc(it.tips)}</span></div>`;
    html += `<p class="muted small disclaimer">${esc(it.disclaimer)}</p></div></div>`;
    return html;
  },
  // Legend of the display symbols, right below the scale.
  _renderLegend(t) {
    if (!t.legend) return "";
    const open = !!this._legendOpen;
    const ic = (i) => `<ha-icon icon="${i}"></ha-icon>`;
    const sym = {
      hist: "<b>1 2 3</b>", ohm: "Ω kg", arrow: "▲▼▬", bmi: ic("body_scale:bmi"), fat: ic("body_scale:body-fat"),
      shoe: ic("mdi:shoe-sneaker"), sync: ic("mdi:sync"), lift: ic("mdi:weight-lifter"), m1: methodMark(1), m2: methodMark(2),
      nosave: ic("mdi:content-save-off-outline"), guest: ic("mdi:account-question-outline"), auto: ic("mdi:account-search-outline"), baby: ic("mdi:baby-face-outline") + ic("mdi:paw"),
      dim: `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true"><rect x="1" y="1" width="28" height="10" rx="4" class="ck-k dim"/></svg>`,
      lit: `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true"><rect x="1" y="1" width="28" height="10" rx="4" class="ck-k lit"/></svg>`,
      frame: `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true"><rect x="1.5" y="1.5" width="11" height="9" rx="4" class="ck-k lit thick"/><rect x="17.5" y="1.5" width="11" height="9" rx="4" class="ck-k thin"/></svg>`,
      ring: `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true"><rect x="1" y="1" width="28" height="10" rx="4" class="ck-k dim"/><rect x="1" y="1" width="28" height="10" rx="4" pathLength="100" class="ck-k lit part"/></svg>`,
      fade: `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true"><rect x="1" y="1" width="12" height="10" rx="4" class="ck-k lit"/><rect x="17" y="1" width="12" height="10" rx="4" class="ck-k lit half"/></svg>`,
      blink: `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true"><rect x="1" y="1" width="12" height="10" rx="4" class="ck-k lit"/><rect x="17" y="1" width="12" height="10" rx="4" class="ck-k dim"/></svg>`,
    };
    const head = `<button class="info-toggle" data-action="legend" aria-expanded="${open}">
        <ha-icon icon="mdi:shape-outline"></ha-icon><span>${esc(t.legendTitle)}</span><span class="spacer"></span>
        <ha-icon icon="${open ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon></button>`;
    // Inverted displays (invert_modes / invert_history): the legend shows what is switched on.
    const invM = this._config.invert_modes === true, invH = this._config.invert_history === true;
    const gi = ic("mdi:account-question-outline");
    if (invM) {
      sym.dim = `<span class="lg-m set">${gi}</span>`;
      sym.lit = `<span class="lg-m on">${gi}</span>`;
    }
    if (invH) sym.hist = `<b>1 <span class="lg-h">2</span> 3</b>`;
    const legendText = (k, text) => ((invM && (k === "dim" || k === "lit")) || (invH && k === "hist")) && t.legendInv?.[k] ? t.legendInv[k] : text;
    const scale = open
      ? `<div class="info scale-legend">${head}<div class="info-body"><dl class="legend-list">${t.legend.map(([k, text]) => `<dt>${sym[k] || ""}</dt><dd>${esc(legendText(k, text))}</dd>`).join("")}</dl></div></div>`
      : `<div class="info scale-legend">${head}</div>`;
    return scale;
  },
  // Legend of the chart and table, below them (not with the scale symbols).
  _renderChartLegend(t) {
    if (!(t.chartLegend || []).length) return "";
    const chartOpen = !!this._chartLegendOpen;
    const svg = (inner) => `<svg class="ck" viewBox="0 0 30 12" aria-hidden="true">${inner}</svg>`;
    const ico = (n) => `<ha-icon icon="${n}"></ha-icon>`;
    const keys = {
      views: ico(VIEW_ICONS.composition) + ico(VIEW_ICONS.bmi) + ico(VIEW_ICONS.height) + ico(VIEW_ICONS.percentile),
      comppct: `<span class="ck-tag">%</span>`,
      periods: `<span class="ck-tag">30</span><span class="ck-tag">365</span><span class="ck-tag">Σ</span>`,
      fc: ico("mdi:tshirt-crew-outline") + ico("mdi:tshirt-crew"),
      fi: ico("mdi:flash-outline") + ico("mdi:flash") + ico("mdi:flash-off-outline"),
      fnote: `<span class="ck-tag">✓ ✕</span>`,
      grid: ico("mdi:grid"),
      curves: ico("mdi:chart-bell-curve") + `<span class="ck-tag">WHO</span><span class="ck-tag">DE</span>`,
      tshirt: ico("mdi:tshirt-crew") + ico("mdi:tshirt-crew-outline"),
      move: ico("mdi:account-switch-outline"),
      delete: ico("mdi:delete-outline"),
      hight: ico("mdi:pencil-outline") + ico("mdi:plus"),
      est: svg('<path d="M1 9 L29 4" class="ck-line ck-est"/>'),
      old: svg('<path d="M1 9 L29 4" class="ck-line ck-old"/>'),
      switch: `<span class="ck-tag">1→2</span>`,
      pct: svg('<path d="M1 6 L29 6" class="ck-pct"/>'),
    };
    const chartHead = `<button class="info-toggle" data-action="clegend" aria-expanded="${chartOpen}">
        <ha-icon icon="mdi:chart-line-variant"></ha-icon><span>${esc(t.chartLegendTitle)}</span><span class="spacer"></span>
        <ha-icon icon="${chartOpen ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon></button>`;
    return chartOpen
      ? `<div class="info scale-legend chart-legend">${chartHead}<div class="info-body"><dl class="legend-list chart-keys">${t.chartLegend.map(([k, text]) => (k === "_" ? `<dt></dt><dd class="lg-head"><b>${esc(text)}</b></dd>` : `<dt>${keys[k] || ""}</dt><dd>${esc(text)}</dd>`)).join("")}</dl></div></div>`
      : `<div class="info scale-legend chart-legend">${chartHead}</div>`;
  },
  // How the scale works: bullet points with the scale's own symbols and a flow chart.
  _renderHow(t) {
    if (!t.how) return "";
    const open = !!this._howOpen;
    const ic = (i) => `<ha-icon icon="${i}"></ha-icon>`;
    const sym = {
      auto: ic("mdi:account-search-outline"), tap: ic("mdi:gesture-tap"), done: ic("mdi:check-bold"), open: ic("mdi:help-circle-outline"),
      guest: ic("mdi:account-question-outline"), baby: ic("mdi:baby-face-outline") + ic("mdi:paw"), sync: ic("mdi:sync"),
      timer: ic("mdi:clock-outline"), hist: "<b>1 2 3</b>", fat: ic("body_scale:body-fat"), bmi: ic("body_scale:bmi"), pending: ic("mdi:scale-unbalanced"),
    };
    const head = `<button class="info-toggle" data-action="how" aria-expanded="${open}">
        <ha-icon icon="mdi:graph-outline"></ha-icon><span>${esc(t.howTitle)}</span><span class="spacer"></span>
        <ha-icon icon="${open ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon></button>`;
    if (!open) return `<div class="info scale-legend">${head}</div>`;
    const f = t.flow;
    const box = (x, y, w, label) => `<rect x="${x}" y="${y}" width="${w}" height="40" rx="9" class="fl-box"/><text x="${x + w / 2}" y="${y + 24.5}" class="fl-t">${esc(label)}</text>`;
    const arrow = (d, both) => `<path d="${d}" class="fl-a" marker-end="url(#fl-h)"${both ? ' marker-start="url(#fl-h)"' : ""}/>`;
    const label = (x, y, text, anchor) => `<text x="${x}" y="${y}" class="fl-l" text-anchor="${anchor}">${esc(text)}</text>`;
    const defs = `<defs><marker id="fl-h" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 z" class="fl-head"/></marker></defs>`;
    const svg = `<svg class="flow" viewBox="0 0 340 312" role="img" aria-label="${esc(t.flowTitle)}">${defs}
        ${box(110, 6, 120, f.idle)}${box(252, 6, 82, f.hist)}${box(6, 70, 120, f.pre)}${box(110, 134, 120, f.weigh)}
        ${box(4, 200, 100, f.known)}${box(114, 200, 112, f.gb)}${box(236, 200, 100, f.open)}${box(110, 266, 120, f.result)}
        ${arrow("M230 26 H252", true)}
        ${arrow("M110 26 H66 V70")}${label(60, 52, f.tap, "end")}
        ${arrow("M170 46 V134")}${label(177, 120, f.step, "start")}
        ${arrow("M126 90 H170")}
        ${arrow("M170 174 V186 H54 V200")}${arrow("M170 174 V200")}${arrow("M170 186 H286 V200")}
        ${arrow("M54 240 V253 H150 V266")}${arrow("M170 240 V266")}${arrow("M286 240 V253 H190 V266")}${label(240, 290, "← " + f.person, "start")}
      </svg>`;
    const a = this._data?.next?.attributes || {};
    const T = Number(a.timeout_minutes) > 0 ? Number(a.timeout_minutes) : 5;
    const H = Number(this._config.display_hold) > 0 ? Number(this._config.display_hold) : 5;
    const Y = Math.round(this._histHold() / 1000);
    const tm = t.times({ T, H, Y });
    const svg2 = `<svg class="flow" viewBox="0 0 340 190" role="img" aria-label="${esc(t.timesTitle)}">${defs}
        ${box(6, 6, 80, f.pre)}${box(130, 6, 80, f.auto)}${box(254, 6, 80, f.idle)}
        ${arrow("M86 26 H130")}${label(108, 20, tm.pre, "middle")}${arrow("M210 26 H254")}${label(232, 20, tm.auto, "middle")}
        ${box(6, 66, 80, f.result)}${box(254, 66, 80, f.idle)}${arrow("M86 86 H254")}${label(170, 80, tm.res, "middle")}
        ${box(6, 126, 80, f.hist)}${box(254, 126, 80, f.back)}${arrow("M86 146 H254")}${label(170, 140, tm.hist, "middle")}
      </svg>`;
    return `<div class="info scale-legend">${head}<div class="info-body"><dl class="legend-list how">${t.how.map(([k, title, text]) => `<dt>${sym[k] || ""}</dt><dd><b>${esc(title)}</b> ${esc(this._config.invert_modes === true && k === "timer" && t.howInv ? t.howInv.timer : text)}</dd>`).join("")}</dl>
      <h3 class="legend-sub">${esc(t.flowTitle)}</h3>${svg}<p class="muted small">${esc(t.flowNote)}</p>
      <h3 class="legend-sub">${esc(t.timesTitle)}</h3>${svg2}<p class="muted small">${esc(t.timesNote)}</p></div></div>`;
  },
});

/*
 * Module card-values: value tiles and explanations
 *
 * "Understanding the values": tiles with ratings and trends, the detail pop-ups,
 * the calculation-method table and the glance row.
 */

mixin(BodyScaleCard, {
  _bar(value, stops, labels, min, max, classes = ["low", "ok", "high", "veryHigh"]) {
    // stops: band boundaries between min and max; labels/classes per band.
    const pct = (v) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
    const edges = [min, ...stops, max];
    const segs = labels
      .map((label, i) => {
        const width = pct(edges[i + 1]) - pct(edges[i]);
        // Narrow bands stay unlabelled; the tooltip still names them.
        return `<span class="band ${classes[i]}" style="width:${width.toFixed(2)}%" title="${esc(label)}">${width >= 22 ? esc(label) : ""}</span>`;
      })
      .join("");
    const ticks = stops
      .map((s) => `<span class="tick" style="left:${pct(s).toFixed(2)}%">${this._num(s, Number.isInteger(s) ? 0 : 1)}</span>`)
      .join("");
    const marker = value == null ? "" : `<span class="marker" style="left:${pct(Number(value)).toFixed(2)}%"></span>`;
    return `<div class="bar"><div class="bands">${segs}${marker}</div><div class="ticks">${ticks}</div></div>`;
  },
  _metricStatus(m, v, prof) {
    // low / ok / high / veryHigh where a range is established, else null.
    if (v == null) return null;
    const adult = !prof.minor;
    const by = (stops, classes) => classes[stops.filter((x) => v >= x).length];
    if (m === "body_mass_index") {
      if (adult) return by([18.5, 25, 30], ["low", "ok", "high", "veryHigh"]);
      return { thinness: "low", normal: "ok", overweight: "high", obesity: "veryHigh" }[prof.percentileCategory] || null;
    }
    if (!adult) return null;
    if (m === "body_fat_percentage" && prof.sex && prof.age != null) {
      const [, lo, ok, hi] = FAT_BANDS[prof.sex].find((b) => prof.age <= b[0]);
      return by([lo, ok, hi], ["low", "ok", "high", "veryHigh"]);
    }
    if (m === "body_water_percentage" && prof.sex) {
      const [lo, hi] = WATER_BANDS[prof.sex];
      return v < lo ? "low" : v <= hi ? "ok" : "high";
    }
    if (m === "skeletal_muscle_percentage" && prof.sex && prof.age != null) {
      const [, lo] = SMM_BANDS[prof.sex].find((b) => prof.age <= b[0]);
      return v < lo ? "low" : "ok";
    }
    if (m === "visceral_fat") return by([10, 15], ["ok", "high", "veryHigh"]);
    if (m === "metabolic_age" && prof.age != null) return v <= prof.age ? "ok" : "high";
    return null;
  },
  _statusLabel(m, status, it) {
    if (m === "body_mass_index") return it.categories[{ low: "thinness", ok: "normal", high: "overweight", veryHigh: "obesity" }[status]];
    if (m === "visceral_fat") return it.visceralBands[["ok", "high", "veryHigh"].indexOf(status)];
    if (m === "metabolic_age") return it.ageBands[status];
    return it.bands[status];
  },
  // Every rated value as a small coloured symbol, the noteworthy ones first.
  // Where they don't all fit, the good ones collapse into a tick with their
  // number (see _fitKeys). A tap jumps to the tile and opens it.
  _renderGlance(person, t) {
    const latest = person.rows[0];
    if (!latest) return "";
    const it = infoText(this._lang);
    const prof = this._profileOf(person);
    const order = ["veryHigh", "high", "low", "ok"];
    const rated = INFO_METRICS
      .map((m) => ({ m, status: this._metricStatus(m, latest[m] == null || latest[m] === "" ? null : Number(latest[m]), prof) }))
      .filter((x) => x.status)
      .sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
    if (!rated.length) return "";
    const good = rated.filter((x) => x.status === "ok").length;
    const icons = rated.map(({ m, status }) => {
      const label = `${it.metrics[m][0]}: ${this._statusLabel(m, status, it)}`;
      return `<button class="g ${status}" data-action="glance" data-metric="${m}" title="${esc(label)}" aria-label="${esc(label)}"><ha-icon icon="${METRIC_ICONS[m]}"></ha-icon></button>`;
    }).join("");
    const count = good ? `<button class="g ok g-count" data-action="glance" data-metric="" title="${esc(t.allGood(good))}" aria-label="${esc(t.allGood(good))}"><ha-icon icon="mdi:check"></ha-icon>${good}</button>` : "";
    return `<span class="glance">${icons}${count}</span>`;
  },
  _renderValues(person, t) {
    // Every body value at a glance: symbol, value and, where a range is
    // established, whether it lies in it. A tap opens the explanation.
    const it = infoText(this._lang);
    const latest = person.rows[0] || {};
    const prof = this._profileOf(person);
    const adult = !prof.minor;
    // A body value the newest reading lacks (no impedance) is taken from the last
    // reading that has it, if that is at most values_max_age_days old (default 3).
    const maxAge = Number(this._config.values_max_age_days ?? 3) * 86400000;
    const carried = {};
    const value = (m) => {
      if (latest[m] != null && latest[m] !== "") return Number(latest[m]);
      if (!(maxAge > 0) || ["weight", "body_mass_index", "impedance", "height"].includes(m)) return null;
      const now = Date.now();
      const row = person.rows.find((r) => r[m] != null && r[m] !== "" && now - (Date.parse(r.timestamp) || 0) <= maxAge);
      if (!row) return null;
      carried[m] = row;
      return Number(row[m]);
    };
    const before = person.rows[1] || {};
    const w = value("weight");
    const metrics = INFO_METRICS.filter((m) => !(m === "impedance" || ESTIMATES.includes(m)) || value(m) != null);
    const comp = this._compContent(person, t, it);
    if (!adult && prof.heightCm != null && prof.heightPercentile != null) metrics.push("height");
    if (comp) metrics.push("composition");
    // Composition first, then the important indicators, technical values last.
    const order = TILE_ORDER;
    metrics.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    let pop = "";
    const tiles = metrics.map((m) => {
      if (m === "height") {
        const open = this._openMetric === m;
        const head = `<button class="val none ${open ? "open" : ""}" data-action="metric" data-metric="${m}" aria-expanded="${open}">
          <span class="val-icon"><ha-icon icon="mdi:human-male-height"></ha-icon></span>
          <span class="val-text"><span class="val-name">${esc(t.chartLabels.height)}</span>
          <span class="val-value">${this._cm(prof.heightCm)}</span>
          <span class="val-status"><span class="muted">P${this._num(prof.heightPercentile, 0)}</span></span></span></button>`;
        if (open) {
          const refs = [[prof.reference, prof.heightPercentile]];
          if (prof.compare && prof.heightPercentileOther != null) refs.push([prof.reference === "kh" ? "who" : "kh", prof.heightPercentileOther]);
          refs.sort((a, b) => (a[0] === "who" ? -1 : 1) - (b[0] === "who" ? -1 : 1));
          pop = `<div class="val-detail" role="dialog" aria-label="${esc(t.chartLabels.height)}"><span class="pop-arrow"></span>${this._bar(prof.heightPercentile, prof.reference === "kh" ? [3, 97] : [2.3, 97.7], it.heightBands, 0, 100, ["low", "ok", "high"])}${refs.map(([ref, p]) => `<p class="small">${esc(it.heightPct(this._num(p, 0), ref))}</p>`).join("")}<p class="muted small">${esc(it.heightCuts)}</p></div>`;
        }
        return head;
      }
      if (m === "composition") {
        const open = this._openMetric === m;
        const head = `<button class="val none ${open ? "open" : ""}" data-action="metric" data-metric="${m}" aria-expanded="${open}">
          <span class="val-icon"><ha-icon icon="body_scale:composition-bars"></ha-icon></span>
          <span class="val-text"><span class="val-name">${esc(it.compTitle)}</span>
          <span class="val-value">${this._num(comp.fat, 1)} / ${this._num(comp.ffm, 1)} kg</span>
          <span class="val-status"><span class="muted">${esc(it.compSub)}</span></span></span></button>`;
        if (open) {
          pop = `<div class="val-detail" role="dialog" aria-label="${esc(it.compTitle)}"><span class="pop-arrow"></span>${comp.bars}<p>${esc(it.compIntro)}</p>${adult ? "" : `<p class="muted small">${esc(it.compKid)}</p>`}</div>`;
        }
        return head;
      }
      const [name, what, range] = it.metrics[m];
      const v = value(m);
      const digits = ["basal_metabolic_rate", "impedance", "visceral_fat", "metabolic_age"].includes(m) ? 0 : 1;
      const unit = UNITS[m] ? ` ${UNITS[m]}` : "";
      const status = this._metricStatus(m, v, prof);
      const open = this._openMetric === m;
      // Change to the reading before: arrow and amount, neutral colour
      // (whether up is good depends on the value).
      let trend = "";
      const prev = before[m] == null || before[m] === "" ? null : Number(before[m]);
      if (v != null && prev != null && !Number.isNaN(prev)) {
        const d = Number((v - prev).toFixed(digits));
        if (d !== 0) {
          trend = `<span class="val-delta" title="${esc(t.sincePrevious)}"><ha-icon icon="${d > 0 ? "mdi:arrow-top-right" : "mdi:arrow-bottom-right"}"></ha-icon>${d > 0 ? "+" : "−"}${this._num(Math.abs(d), digits)}</span>`;
        }
      }
      // Children: the BMI percentile is what the rating rests on.
      const pct = !adult && m === "body_mass_index" && prof.percentile != null ? ` · P${this._num(prof.percentile, 0)}` : "";
      const old = carried[m];
      const oldText = old ? t.carriedFrom(this._when(old)) : "";
      if (old) trend = "";
      const head = `<button class="val ${status || "none"} ${old ? "old" : ""} ${open ? "open" : ""}" data-action="metric" data-metric="${m}" aria-expanded="${open}"${old ? ` title="${esc(oldText)}"` : ""}>
          <span class="val-icon"><ha-icon icon="${METRIC_ICONS[m]}"></ha-icon></span>
          <span class="val-text"><span class="val-name">${esc(name)}</span>
          <span class="val-value">${v == null ? "–" : `${this._num(v, digits)}${unit}`}</span>
          <span class="val-status">${status ? `<span class="val-rating">${esc(this._statusLabel(m, status, it))}${pct}</span>` : ""}${trend}${old ? `<span class="val-old">${esc(oldText)}</span>` : ""}${status || trend || old ? "" : "&nbsp;"}</span></span></button>`;
      if (!open) return head;
      let extra = "";
      if (adult && m === "body_mass_index") {
        extra = this._bar(v, [18.5, 25, 30], it.bmiBands, 15, 40);
      } else if (!adult && m === "body_mass_index" && prof.percentile != null) {
        // WHO cut-offs -2 / +1 / +2 SD = percentiles 2.3 / 84.1 / 97.7; German ones P10 / P90 / P97.
        const stops = prof.reference === "kh" ? [10, 90, 97] : [2.3, 84.1, 97.7];
        extra = this._bar(prof.percentile, stops, it.bmiBands, 0, 100);
        if (prof.compare && prof.percentileOther != null) {
          // One explanation per reference.
          const otherRef = prof.reference === "kh" ? "who" : "kh";
          extra += [[prof.reference, prof.percentile, prof.percentileCategory], [otherRef, prof.percentileOther, prof.categoryOther]]
            .sort((a, b) => (a[0] === "who" ? -1 : 1) - (b[0] === "who" ? -1 : 1))
            .map(([ref, p, c]) => `<p class="small">${esc(it.percentile(this._num(p, 0), it.categories[c] || "", ref, null))}</p>`).join("");
        } else {
          extra += `<p class="small">${esc(it.percentile(this._num(prof.percentile, 0), it.categories[prof.percentileCategory] || "", prof.reference, null))}</p>`;
        }
        if (prof.compare && prof.percentileOther != null) {
          // Both ratings side by side: they can differ (other cut-offs and populations).
          const other = prof.reference === "kh" ? "who" : "kh";
          const one = (ref, p, c) => `<span class="ref-rate ${c || ""}"><b>${ref === "kh" ? "DE" : "WHO"}</b> P${esc(this._num(p, 0))}${c ? ` · ${esc(it.categories[c] || c)}` : ""}</span>`;
          const pair = [[prof.reference, prof.percentile, prof.percentileCategory], [other, prof.percentileOther, prof.categoryOther]]
            .sort((a, b) => (a[0] === "who" ? -1 : 1) - (b[0] === "who" ? -1 : 1));
          extra += `<p class="small ref-compare">${pair.map((x) => one(...x)).join("")}</p>`;
        }
      } else if (adult && m === "body_fat_percentage" && prof.sex && prof.age != null) {
        const [, lo, ok, hi] = FAT_BANDS[prof.sex].find((b) => prof.age <= b[0]);
        extra = this._bar(v, [lo, ok, hi], [it.bands.low, it.bands.ok, it.bands.high, it.bands.veryHigh], Math.max(0, lo - 8), hi + 10);
      } else if (adult && m === "body_water_percentage" && prof.sex) {
        const [lo, hi] = WATER_BANDS[prof.sex];
        extra = this._bar(v, [lo, hi], [it.bands.low, it.bands.ok, it.bands.high], lo - 10, hi + 10);
      } else if (adult && m === "skeletal_muscle_percentage" && prof.sex && prof.age != null) {
        const [, lo, hi] = SMM_BANDS[prof.sex].find((b) => prof.age <= b[0]);
        extra = this._bar(v, [lo, hi], [it.bands.low, it.bands.ok, it.bands.veryHigh], lo - 10, hi + 10, ["low", "ok", "ok"]) +
          `<p class="muted small">Omron Healthcare</p>`;
      } else if (adult && m === "bone_mass" && prof.sex && w) {
        extra = `<p class="muted small">${esc(it.avgForWeight(this._num(averageBone(prof.sex, w), 1)))}</p>`;
      } else if (m === "visceral_fat" && v != null) {
        extra = this._bar(v, [10, 15], it.visceralBands, 1, 30, ["ok", "high", "veryHigh"]);
      } else if (m === "metabolic_age" && prof.age != null) {
        extra = `<p class="muted small">${esc(it.realAge(prof.age))}</p>`;
      } else if (adult && m === "basal_metabolic_rate" && w && prof.heightCm && prof.age != null && prof.sex) {
        const msj = 10 * w + 6.25 * prof.heightCm - 5 * prof.age + (prof.sex === "male" ? 5 : -161);
        extra = `<p class="muted small">${esc(it.mifflin(this._num(msj, 0)))}</p>`;
      }
      // Percent values also in kilograms; body fat of an adult also after the other methods.
      if (v != null && w && ["body_fat_percentage", "body_water_percentage", "skeletal_muscle_percentage", "protein_percentage", "subcutaneous_fat_percentage"].includes(m)) {
        const kg = m === "body_fat_percentage" && value("fat_mass") != null ? value("fat_mass") : (v * w) / 100;
        extra = `<p class="kg-line"><b>${this._num(kg, 1)} kg</b></p>` + extra;
      }
      if (adult && METHOD_VALUES.includes(m) && w && latest.methods?.standard?.normal?.[m] != null) {
        extra += `<div class="methods-pop"><p class="muted small">${esc(it.algoTitle)}:</p>${this._methodTable(prof, latest.methods, w, it, m)}</div>`;
      }
      pop = `<div class="val-detail" role="dialog" aria-label="${esc(name)}"><span class="pop-arrow"></span>${extra}<p>${esc(what)}</p>
          <p class="muted small">${esc(adult ? range : m === "body_mass_index" ? (prof.compare ? `${it.kidBmi.who} ${it.kidBmi.kh}` : it.kidBmi[prof.reference]) : it.kidRanges[m] || range)}</p></div>`;
      return head;
    });
    // The explanation floats at its tile as a pop-up, so the rows stay put.
    return `<div class="vals" lang="${esc(this._lang.slice(0, 2))}">${tiles.join("")}${pop}</div>`;
  },
  // One value of a reading after each method (normal / athlete, standard /
  // alternative); percent values also in kilograms; the method in use is
  // marked and the cells carry the colour of their rating.
  _methodTable(prof, methods, w, it, metric = "body_fat_percentage") {
    const digits = ["basal_metabolic_rate", "visceral_fat", "metabolic_age"].includes(metric) ? 0 : 1;
    const unit = UNITS[metric] ? ` ${UNITS[metric]}` : "";
    const pct = ["body_fat_percentage", "body_water_percentage", "skeletal_muscle_percentage", "protein_percentage", "subcutaneous_fat_percentage"].includes(metric);
    const cell = (alt, ath) => {
      const v = methods[alt ? "alternative" : "standard"]?.[ath ? "athlete" : "normal"]?.[metric];
      if (v == null) return `<td class="num">–</td>`;
      const on = prof.alternative === alt && prof.athlete === ath;
      const st = this._metricStatus(metric, v, prof);
      return `<td class="num ${on ? "on" : ""} ${st ? `st-${st}` : ""}">${this._num(v, digits)}${unit}${pct ? `<span class="muted small" style="display:block">${this._num((v * w) / 100, 1)} kg</span>` : ""}</td>`;
    };
    return `<table class="algo"><tr><th></th><th class="num">${esc(it.normal)}</th><th class="num">${esc(it.athleteCol)}</th></tr>
        <tr><th>${esc(it.algos.standard[0])}</th>${cell(false, false)}${cell(false, true)}</tr>
        <tr><th>${esc(it.algos.alternative[0])}</th>${cell(true, false)}${cell(true, true)}</tr></table><p class="muted small algo-note">${esc(it.activeNote)}</p>`;
  },
});

/*
 * Module card-chart: the history graph
 *
 * Views (weight + fat, composition, BMI, height), series, curves and percentile
 * bands, the SVG drawing, tooltips and the stacked composition chart.
 */

mixin(BodyScaleCard, {
  // Composition view: kilograms stacked (default) or weight + fat in percent.
  _compPctOn() {
    return this._compPct ?? this._restoreFlag("comp-pct");
  },
  // Fat-free and fat mass at the weigh-ins (newest last). Where a weigh-in has
  // no fat value, the fat share is bridged between the nearest known ones (or
  // held before the first / after the last) and applied to the real weight;
  // those points carry real: false.
  _stackSeries(person) {
    const ffm = this._series(person, "fat_free_mass");
    const wt = this._series(person, "weight").slice();
    const row = person.rows[0];
    const rt = Date.parse(row?.timestamp);
    const rw = Number(row?.weight);
    if (row && !Number.isNaN(rt) && !Number.isNaN(rw) && (!wt.length || wt[wt.length - 1].t < rt - 60000)) wt.push({ t: rt, v: rw, synthetic: true });
    const known = [];
    let j = 0;
    for (const p of wt) {
      while (j + 1 < ffm.length && Math.abs(ffm[j + 1].t - p.t) <= Math.abs(ffm[j].t - p.t)) j++;
      if (ffm[j] && Math.abs(ffm[j].t - p.t) < 12 * 3600000 && p.v > 0) {
        const f = 1 - ffm[j].v / p.v;
        if (f >= 0 && f < 1) known.push({ t: p.t, f });
      }
    }
    if (!known.length) return [];
    const realAt = new Set(known.map((k) => k.t));
    const share = (tm) => {
      if (tm <= known[0].t) return known[0].f;
      const last = known[known.length - 1];
      if (tm >= last.t) return last.f;
      for (let i = 1; i < known.length; i++) {
        if (tm <= known[i].t) {
          const a = known[i - 1], b = known[i];
          return a.f + ((b.f - a.f) * (tm - a.t)) / Math.max(b.t - a.t, 1);
        }
      }
      return last.f;
    };
    return wt.map((p) => {
      const f = share(p.t);
      return { t: p.t, ffm: p.v * (1 - f), fat: p.v * f, real: realAt.has(p.t), synthetic: !!p.synthetic };
    });
  },
  // The kilogram stack as SVG: fat-free mass below, fat above, the top edge is the weight.
  _stackSvg(pts, grid, t) {
    const W = Math.max(280, Math.min(900, (this.offsetWidth || 600) - 32));
    const H = (W < 450 ? 170 : 200) + HEAD_H, L = 40, R = 12, T = HEAD_H + 6, B = 22;
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    const x = (tm) => L + ((tm - t0) / Math.max(t1 - t0, 1)) * (W - L - R);
    const hi = Math.max(...pts.map((p) => p.ffm + p.fat));
    const v0 = 0, v1 = hi * 1.04;
    const y = (v) => T + (1 - (v - v0) / (v1 - v0)) * (H - T - B);
    const base = H - B;
    const bottom = pts.map((p) => [x(p.t), y(p.ffm)]);
    const top = pts.map((p) => [x(p.t), y(p.ffm + p.fat)]);
    const dB = smoothPath(bottom), dT = smoothPath(top);
    const rev = smoothPath(bottom.slice().reverse());
    let back = "", axes = "";
    const xTicks = timeTicks(t0, t1);
    if (grid) back += xTicks.map((tm) => `<line x1="${x(tm).toFixed(1)}" x2="${x(tm).toFixed(1)}" y1="${T}" y2="${base}" class="grid dotted"/>`).join("");
    axes += xTicks.map((tm) => `<text x="${x(tm).toFixed(1)}" y="${H - 6}" class="axis" text-anchor="middle">${esc(this._fmtTick(tm, t1 - t0))}</text>`).join("");
    const ticks = niceTicks(v0, v1, H < 180 ? 4 : 5);
    for (const v of ticks) {
      if (grid) back += `<line x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="grid dotted"/>`;
      axes += `<text x="${L - 6}" y="${(y(v) + 4).toFixed(1)}" class="axis left" text-anchor="end">${this._num(v, ticks.digits)}</text>`;
    }
    const a = pts[0], z = pts[pts.length - 1];
    const layer = (cls) => `<path d="${dB}L${x(z.t).toFixed(1)},${base}L${x(a.t).toFixed(1)},${base}Z" class="stack-ffm ${cls}"/>`
      + `<path d="${dT}${rev.replace(/^M/, "L")}Z" class="stack-fat ${cls}"/>`
      + `<path d="${dB}" class="line left ${cls}"/><path d="${dT}" class="line right ${cls}"/>`;
    // Estimated stretches (no fat value measured) are drawn faded; the solid
    // layer is clipped to the stretches between two measured weigh-ins.
    const runs = [];
    for (let i = 1; i < pts.length; i++) if (pts[i - 1].real && pts[i].real) runs.push([x(pts[i - 1].t), x(pts[i].t)]);
    const faded = pts.some((p) => !p.real);
    const paths = (faded ? `<clipPath id="stkreal">${runs.map(([x0, x1]) => `<rect x="${x0.toFixed(1)}" y="0" width="${Math.max(x1 - x0, 0.5).toFixed(1)}" height="${H}"/>`).join("")}</clipPath>${layer("est")}<g clip-path="url(#stkreal)">${layer("")}</g>` : layer(""))
      + pts.filter((p) => !p.synthetic && p.real && pts.length <= 60).map((p) => `<circle cx="${x(p.t).toFixed(1)}" cy="${y(p.ffm + p.fat).toFixed(1)}" r="2.5" class="dot right"><title>${esc(this._fmtDate(p.t, this._period || "month"))}: ${this._num(p.ffm + p.fat, 2)} kg · ${this._num(p.fat, 1)} kg</title></circle>`).join("")
      + `<circle cx="${x(z.t).toFixed(1)}" cy="${y(z.ffm).toFixed(1)}" r="4" class="last left"/><circle cx="${x(z.t).toFixed(1)}" cy="${y(z.ffm + z.fat).toFixed(1)}" r="4" class="last right"/>`;
    this._scales = {};
    return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(t.comp.kg)}"><line x1="${L}" x2="${W - R}" y1="${base}" y2="${base}" class="grid"/>${back}${paths}${axes}</svg>`;
  },
  // The latest reading split in two equal bars: by tissue (fat, muscle and
  // organs, bone) and by substance (water, fat, protein, remainder). The fat
  // section is split into subcutaneous and remaining fat where known. Below, a
  // colour-keyed explanation per value. Null without enough values.
  _compContent(person, t, it) {
    const row = person.rows[0];
    const n = (k) => (row && row[k] != null && row[k] !== "" && !Number.isNaN(Number(row[k])) ? Number(row[k]) : null);
    const w = n("weight"), ffm = n("fat_free_mass");
    if (w == null || ffm == null || w <= 0) return null;
    const c = t.comp, info = it.compInfo;
    const fat = Math.max(w - ffm, 0);
    const bone = n("bone_mass");
    const subPct = n("subcutaneous_fat_percentage");
    const sub = subPct != null && fat > 0 ? Math.min((subPct * w) / 100, fat) : null;
    const wPct = n("body_water_percentage"), pPct = n("protein_percentage");
    const entries = {};
    const note = (key, label, kg, cls, extra = {}) => { if (kg != null && kg > 0 && !entries[key]) entries[key] = { key, label, kg, cls, text: info[key], ...extra }; };
    const seg = (kg, icon, key, label, cls) => {
      if (kg == null || kg <= 0) return "";
      note(key, label, kg, cls);
      const share = (kg / w) * 100;
      const title = `${label}: ${this._num(kg, 1)} kg (${this._num(share, 0)} %)`;
      return `<div class="seg-c ${cls}" style="flex:${kg.toFixed(3)} 1 0" title="${esc(title)}">${share >= 8 ? `<ha-icon icon="${icon}"></ha-icon>` : ""}${share >= 14 ? `<b>${this._num(kg, 1)}</b>` : ""}</div>`;
    };
    // The fat section in two shades (the same in both bars) when the split is known.
    const fatSeg = () => {
      if (fat <= 0) return "";
      note("fat", c.fat, fat, "c-fat");
      if (sub == null) return seg(fat, "body_scale:body-fat", "fat", c.fat, "c-fat");
      const rest = Math.max(fat - sub, 0);
      note("subcut", c.subcut, sub, "c-sub");
      note("restFat", c.restFat, rest, "c-restfat");
      const share = (fat / w) * 100;
      const title = `${c.fat}: ${this._num(fat, 1)} kg (${this._num(share, 0)} %) · ${c.subcut} ${this._num(sub, 1)} kg · ${c.restFat} ${this._num(rest, 1)} kg`;
      return `<div class="seg-c seg-fat" style="flex:${fat.toFixed(3)} 1 0" title="${esc(title)}"><span class="fat-parts"><i class="c-sub" style="flex:${sub.toFixed(3)} 1 0"></i><i class="c-restfat" style="flex:${rest.toFixed(3)} 1 0"></i></span>${share >= 8 ? `<ha-icon icon="body_scale:body-fat"></ha-icon>` : ""}${share >= 14 ? `<b>${this._num(fat, 1)}</b>` : ""}</div>`;
    };
    const rowOf = (label, parts) => `<div class="comp-row"><span class="comp-cap">${esc(label)}</span><div class="comp-bar">${parts.join("")}</div></div>`;
    let html = "";
    if (bone != null) {
      const muscle = Math.max(w - fat - bone, 0);
      html += rowOf(c.tissue, [fatSeg(), seg(muscle, "mdi:arm-flex", "muscle", c.muscle, "c-muscle"), seg(bone, "body_scale:bone-mass", "bone", c.bone, "c-bone")]);
    }
    if (wPct != null && pPct != null) {
      const water = (wPct * w) / 100, prot = (pPct * w) / 100;
      const rest = Math.max(w - water - fat - prot, 0);
      html += rowOf(c.substances, [seg(water, "mdi:water-outline", "water", c.water, "c-water"), fatSeg(), seg(prot, "mdi:hexagon-multiple-outline", "protein", c.protein, "c-protein"), seg(rest, "mdi:dots-horizontal", "rest", c.rest, "c-rest")]);
    }
    if (!html) return null;
    const vis = n("visceral_fat");
    if (vis != null) entries.visceral = { key: "visceral", label: c.visceral, level: this._num(vis, 0), cls: "c-none", text: info.visceral };
    const order = ["fat", "subcut", "restFat", "muscle", "bone", "water", "protein", "rest", "visceral"];
    const list = order.map((k) => entries[k]).filter(Boolean);
    const dl = `<dl class="comp-info">${list.map((e) => `<dt><span class="sw ${e.cls}"></span></dt><dd><b>${esc(e.label)}</b> ${e.level != null ? esc(e.level) : `${this._num(e.kg, 1)} kg`}<span class="muted small"> ${esc(e.text || "")}</span></dd>`).join("")}</dl>`;
    return { fat, ffm, bars: `<div class="comp-bars">${html}</div>${dl}` };
  },
  _chartViews(person) {
    return this._profileOf(person).minor ? ["composition", "percentile", "bmi", "height"] : ["composition", "bmi", "height"];
  },
  _heightHistory(person) {
    // Every height change with its time (the heights table), oldest first.
    return (person.heights || [])
      .map(([at, cm]) => ({ at, t: Date.parse(at), v: Number(cm) }))
      .filter((p) => !Number.isNaN(p.t) && !Number.isNaN(p.v))
      .sort((a, b) => a.t - b.t);
  },
  _heightSeries(person) {
    // The exact entries in the period, held flat to its start and to now.
    const history = this._heightHistory(person);
    if (!history.length) return null;
    const now = Date.now();
    const from = now - PERIODS[this._period || "month"].days * 86400000;
    const before = history.filter((p) => p.t < from).pop();
    const points = history.filter((p) => p.t >= from).map((p) => ({ t: p.t, v: p.v }));
    if (before) points.unshift({ t: from, v: before.v, synthetic: true });
    const last = points[points.length - 1];
    if (last && now - last.t > 60000) points.push({ t: now, v: last.v, synthetic: true });
    return points;
  },
  _chartSeries(person, metric) {
    if (metric === "height") return this._heightSeries(person) || this._series(person, metric);
    if (metric !== "fat_mass") return this._series(person, metric);
    // Fat in kg = weight - fat-free mass, paired with the nearest point
    // of the same day (statistics periods line up; table rows are equal).
    const ffm = this._series(person, "fat_free_mass");
    const out = [];
    let j = 0;
    for (const p of this._series(person, "weight")) {
      while (j + 1 < ffm.length && Math.abs(ffm[j + 1].t - p.t) <= Math.abs(ffm[j].t - p.t)) j++;
      if (ffm[j] && Math.abs(ffm[j].t - p.t) < 12 * 3600000) out.push({ t: p.t, v: p.v - ffm[j].v });
    }
    return out;
  },
  _curveMode(person, key) {
    // "ref" (settings), "other" (the other reference) or "off"; per device.
    let mode = this._curves;
    if (!mode) {
      try {
        mode = window.localStorage.getItem("body-scale-card:curves-mode");
      } catch (e) {
        mode = null;
      }
      if (!mode) mode = this._restoreFlagOff("curves") ? "off" : "ref";
    }
    if (mode === "other" && !this._references(person, key).hasOther) mode = "ref";
    return ["ref", "other", "off"].includes(mode) ? mode : "ref";
  },
  // Elements of the graph that come and go with the percentile switch carry
  // data-fx: before a re-render their drawing is kept, afterwards new ones fade
  // in, removed ones fade out and paths that remain morph to their new shape.
  _fxCapture() {
    const svg = this.shadowRoot.querySelector("svg.chart");
    return svg ? [...svg.querySelectorAll("[data-fx]")].map((el) => ({ k: el.dataset.fx, d: el.getAttribute("d"), html: el.outerHTML, clip: !!el.closest("[clip-path]") })) : [];
  },
  _fxRun(prev) {
    const svg = this.shadowRoot.querySelector("svg.chart");
    if (!svg || !Element.prototype.animate || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const canMorph = !!window.CSS?.supports?.("d", "path('M0 0L1 1')");
    const opt = { duration: 350, easing: "ease-in-out" };
    const old = new Map(prev.map((p) => [p.k, p]));
    const now = new Set();
    svg.querySelectorAll("[data-fx]").forEach((el) => {
      const k = el.dataset.fx;
      now.add(k);
      const was = old.get(k);
      const d = el.getAttribute("d");
      if (!was) el.animate([{ opacity: 0 }, { opacity: 1 }], opt);
      else if (d && was.d && was.d !== d) {
        if (canMorph) el.animate([{ d: `path("${was.d}")` }, { d: `path("${d}")` }], opt);
        else el.animate([{ opacity: 0.2 }, { opacity: 1 }], opt);
      }
    });
    for (const p of prev) {
      if (now.has(p.k)) continue;
      const wrap = p.clip ? `<g clip-path="url(#plotclip)">${p.html}</g>` : p.html;
      svg.insertAdjacentHTML("beforeend", wrap);
      const ghost = svg.lastElementChild;
      const a = ghost.animate([{ opacity: 1 }, { opacity: 0 }], opt);
      a.onfinish = () => ghost.remove();
    }
  },
  _curveState(person, view) {
    // Children: which reference (who / kh) and whether its curves or guide
    // lines show, per view and device; the percentile line keeps the
    // reference when they are off.
    const key = CHART_VIEWS[view]?.bands || "bmi_percentile";
    const refs = this._references(person, key);
    this._curveStates = this._curveStates || {};
    let state = this._curveStates[view];
    if (!state) {
      try {
        state = JSON.parse(window.localStorage.getItem(`body-scale-card:curves2:${view}`) || "null");
      } catch (e) {
        state = null;
      }
      if (!state || typeof state !== "object") state = { ref: refs.chosen, on: false };
    }
    const has = (ref) => (CHART_VIEWS[view]?.bands ? !!this._bands(person, key, ref === refs.chosen ? "ref" : "other") : this._refAvailable(person, ref));
    // Without the curves shown the preset reference applies, whatever was chosen before.
    const ref = state.on === true && refs.compare && ["who", "kh"].includes(state.ref) && has(state.ref) ? state.ref : refs.chosen;
    return { ref, on: state.on === true, has, refs };
  },
  _bands(person, key, mode = "ref") {
    // P3-P97 curves of a reference over the whole reference range, on the time axis.
    // Children only; adults have no percentile curves.
    if (!this._profileOf(person).minor) return null;
    const ctx = this._growthCtx(person);
    const ref = mode === "other" ? ctx.other : ctx.chosen;
    const kind = key === "height_percentile" ? "height" : "bmi";
    const born = Date.parse(ctx.born || "");
    if (Number.isNaN(born)) return null;
    this._bandCache = this._bandCache || new Map();
    const id = `${ref}|${kind}|${ctx.sex}|${ctx.born}|${GROWTH[ref] ? 1 : 0}`;
    if (!this._bandCache.has(id)) {
      const rows = growthCurves(ref, kind, ctx.sex, 0, 228, 1);
      this._bandCache.set(id, rows.length ? rows.map(([months, ...values]) => ({ t: born + months * 30.4375 * 86400000, values })) : null);
    }
    return this._bandCache.get(id);
  },
  _gridOn() {
    if (this._config.grid === false) return false;
    return this._grid ?? !this._restoreFlagOff("grid");
  },
  _renderChart(person, t) {
    const views = this._chartViews(person);
    const view = views.includes(this._chartView) ? this._chartView : views[0];
    const compView = view === "composition";
    const pctMode = compView && this._compPctOn();
    const stack = compView && !pctMode;
    const spec = CHART_VIEWS[pctMode ? "fat" : view];
    const period = this._period || "month";
    for (const m of spec.load) this._loadStats(person, m);
    if (period !== "year") this._loadStatsFor(person, "weight", "year");
    const grid = this._gridOn();
    const minor = this._profileOf(person).minor;
    const kid = minor && (spec.bands || view === "percentile") ? this._curveState(person, view) : null;
    // The percentile line after the reference picked on the buttons.
    const lineOther = !!kid && kid.ref !== kid.refs.chosen;
    const lines = [spec.left, spec.right]
      .map((metric, i) => metric && ({ metric, side: i ? "right" : "left",
        points: (kid && metric.endsWith("_percentile") && this._refSeries(person, metric, kid.ref).length ? this._refSeries(person, metric, kid.ref) : null) || this._chartSeries(person, metric) }))
      // e.g. no height percentile for adults
      .filter((l) => l && (l.side === "left" || (l.metric.endsWith("_percentile") ? this._profileOf(person).minor : this._hasMetric(person, l.metric))));
    // A line that starts later than another (no value measured before) is held
    // at its first known value back to the common start, drawn faded.
    const withPts = lines.filter((l) => l.points.length && l.metric !== "height");
    if (withPts.length && lines.length > 1) {
      const start = Math.min(...lines.filter((l) => l.points.length).map((l) => l.points[0].t));
      for (const l of withPts) {
        if (l.points[0].t > start + 36 * 3600000) {
          l.estUntil = l.points[0].t;
          l.points = [{ t: start, v: l.points[0].v, synthetic: true }, ...l.points];
        }
      }
    }
    // Both lines run to the same end with today's value (statistics only hold
    // whole days, the height history is held to now), and the height starts
    // where its percentile does: the profile had it before the first change.
    const current = (metric) => {
      if (metric.endsWith("_percentile")) {
        const v = this._pctNow(person, metric, kid ? kid.ref : this._profileOf(person).reference);
        if (v != null) return v;
      } else if (metric === "height") {
        const hh = this._heightHistory(person);
        if (hh.length) return hh[hh.length - 1].v;
      }
      const row = person.rows[0];
      if (metric === "fat_mass") return row && row.fat_free_mass != null && row.weight != null ? Number(row.weight) - Number(row.fat_free_mass) : null;
      const v = row ? Number(row[metric]) : NaN;
      return row && row[metric] != null && row[metric] !== "" && !Number.isNaN(v) ? v : null;
    };
    const lastReading = Date.parse(person.rows[0]?.timestamp) || 0;
    const endT = Math.max(lastReading, ...lines.filter((l) => l.points.length).map((l) => l.points[l.points.length - 1].t));
    for (const l of lines) {
      const pts = l.points = l.points.slice();
      const v = current(l.metric);
      if (pts.length && v != null && pts[pts.length - 1].t < endT - 60000) pts.push({ t: endT, v, synthetic: true });
    }
    const [hl, pl] = lines;
    if (hl?.metric === "height" && pl?.points.length && hl.points.length && pl.points[0].t < hl.points[0].t) {
      hl.points.unshift({ t: pl.points[0].t, v: hl.points[0].v, synthetic: true });
    }
    // Curves exist for this child; drawn unless switched off on the legend tile.
    // A tap on the curves tile goes: reference from the settings → the other one → off.
    const curveMode = kid ? (kid.on ? (lineOther && spec.bands ? "other" : "ref") : "off")
      : spec.bands || view === "bmi" ? this._curveMode(person, spec.bands || "bmi_percentile") : "off";
    const curvesOn = curveMode !== "off";
    const curveRows = spec.bands && this._config.curves !== false ? this._bands(person, spec.bands, curveMode === "other" ? "other" : "ref") : null;
    const bandRows = curvesOn ? curveRows : null;
    // Adults: the fixed WHO ranges instead of curves, switched on the same tile.
    const adultZones = view === "bmi" && !this._profileOf(person).minor && this._config.curves !== false;
    const zonesOn = adultZones;
    // Weight + BMI percentile: guide lines P3–P97 across a 0–100 scale. A
    // percentile is already relative to age, so they hold over all the time.
    const guides = view === "percentile" && this._config.curves !== false;
    const guidesOn = guides && curvesOn;
    // With curves the percentile line would repeat them on another scale: legend only.
    const drawn = lines.filter((l) => l.points.length >= 2 && !(spec.bands && l.side === "right") && !(view === "percentile" && kid && !curvesOn && l.side === "right"));
    // Draw at the real width so labels keep their size on a phone.
    const W = Math.max(280, Math.min(900, (this.offsetWidth || 600) - 32));
    const chartH = W < 450 ? 170 : 200;
    let svg, stackPts = null;
    if (stack) stackPts = this._stackSeries(person);
    if (stack && stackPts.length >= 2) {
      svg = this._stackSvg(stackPts, grid, t);
    } else if (!drawn.length) {
      const filtered = this._effFilter(person);
      svg = `<div class="muted chart-empty" style="height:${chartH + HEAD_H}px">${esc(filtered.clothed !== "any" || filtered.impedance !== "any" ? t.filterEmpty : t.noChart)}</div>`;
    } else {
      const hasRight = drawn.some((l) => l.side === "right") || !!bandRows || zonesOn || !!kid;
      // The top band holds the title and the display toggles (see chart-head).
      const H = chartH + HEAD_H, L = 40, R = zonesOn ? 50 : hasRight ? 40 : 12, T = HEAD_H + 6, B = 22;
      // The time window never depends on what is switched on.
      const all = (kid ? lines.filter((l) => !(spec.bands && l.side === "right") && l.points.length >= 2) : drawn).flatMap((l) => l.points);
      const t0 = Math.min(...all.map((p) => p.t)), t1 = Math.max(...all.map((p) => p.t));
      const x = (tm) => L + ((tm - t0) / Math.max(t1 - t0, 1)) * (W - L - R);
      // Curves inside the window (interpolated at the edges) widen the left scale.
      const winBands = (rows) => {
        if (!rows) return null;
        const at = (tm) => {
          for (let i = 1; i < rows.length; i++) {
            const a = rows[i - 1], b = rows[i];
            if (tm >= a.t && tm <= b.t) {
              const f = (tm - a.t) / Math.max(b.t - a.t, 1);
              return { t: tm, values: a.values.map((v, k) => v + (b.values[k] - v) * f) };
            }
          }
          return null;
        };
        const inside = rows.filter((r) => r.t > t0 && r.t < t1);
        const out = [at(t0), ...inside, at(t1)].filter(Boolean);
        return out.length < 2 ? null : out;
      };
      const bands = winBands(bandRows);
      // The scale always has room for both references' curves (on or off), so
      // nothing moves when they are switched.
      const reserve = kid && spec.bands && this._config.curves !== false
        ? [winBands(this._bands(person, spec.bands, "ref")), winBands(this._bands(person, spec.bands, "other"))].filter(Boolean) : [];
      const scale = (points, metric, extra = []) => {
        const vs = points.map((p) => p.v).concat(extra);
        let v0 = Math.min(...vs), v1 = Math.max(...vs);
        const pad = Math.max((v1 - v0) * 0.08, metric.endsWith("_percentile") ? 5 : metric === "height" ? 1 : 0.5);
        return { v0: v0 - pad, v1: v1 + pad };
      };
      let back = kid ? `<clipPath id="plotclip"><rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}"/></clipPath>` : "", paths = "", axes = "";
      const scales = this._scales = {};
      // Body-fat method switches (from the method sensor's history).
      const switches = spec.load.some((m) => METHOD_METRICS.includes(m)) ? this._methodSwitches(person) : [];
      const marked = new Set();
      const algos = infoText(this._lang).algos;
      const methodName = (m) => [algos[m.startsWith("alternative") ? "alternative" : "standard"][0], m.endsWith("_athlete") && algos.athlete[0]].filter(Boolean).join(" + ");
      const methodNo = (m) => `${m.startsWith("alternative") ? 2 : 1}${m.endsWith("_athlete") ? "+" : ""}`;
      // Vertical grid at month or year starts, with dates on the axis.
      const xTicks = timeTicks(t0, t1);
      if (grid) {
        back += xTicks.map((tm) => `<line x1="${x(tm).toFixed(1)}" x2="${x(tm).toFixed(1)}" y1="${T}" y2="${H - B}" class="grid dotted"/>`).join("");
      }
      axes += xTicks.map((tm) => `<text x="${x(tm).toFixed(1)}" y="${H - 6}" class="axis" text-anchor="middle">${esc(this._fmtTick(tm, t1 - t0))}</text>`).join("");
      for (const line of drawn) {
        const extra = line.side === "left" ? reserve.flatMap((r) => r.flatMap((b) => [b.values[0], b.values[4]])) : [];
        if (line.side === "left" && zonesOn) {
          // Widen to the next range limit below and above, so the own range is always framed.
          const vs = line.points.map((p) => p.v);
          const lo = Math.min(...vs), hi = Math.max(...vs);
          const below = [18.5, 25, 30].filter((b) => b <= lo).pop(), above = [18.5, 25, 30].find((b) => b >= hi);
          if (below != null) extra.push(below - 0.5);
          if (above != null) extra.push(above + 0.5);
        }
        const sc = guidesOn && line.side === "right" ? { v0: 0, v1: 100 } : scale(line.points, line.metric, extra);
        const y = (v) => T + (1 - (v - sc.v0) / (sc.v1 - sc.v0)) * (H - T - B);
        scales[line.side] = { key: `${person.id}|${view}`, v0: sc.v0, v1: sc.v1, top: T, h: H - T - B };
        const cls = line.side;
        if (guidesOn && line.side === "right") {
          for (const p of CURVE_LABELS) {
            back += `<line data-fx="g-${p}" x1="${L}" x2="${W - R}" y1="${y(p).toFixed(1)}" y2="${y(p).toFixed(1)}" class="guide ${p === 50 ? "mid" : ""}"/>`;
          }
          // Labels keep 10 px apart from the bottom up.
          let prev = Infinity;
          for (const p of CURVE_LABELS) {
            prev = Math.min(y(p) + 4, prev - 10);
            axes += `<text data-fx="gl-${p}" x="${W - R + 6}" y="${prev.toFixed(1)}" class="axis right">P${p}</text>`;
          }
        }
        if (line.side === "left" && bands) {
          // The five reference curves, dotted; labels on the right.
          const edge = (k) => bands.map((b) => `${x(b.t).toFixed(1)},${y(b.values[k]).toFixed(1)}`);
          // The child's own scale stays as it is: curves outside it are cut off.
          back += `<g clip-path="url(#plotclip)">${[0, 1, 2, 3, 4].map((k) => `<path data-fx="band-${k}" d="M${edge(k).join("L")}" class="${k === 2 ? "band-median" : "band-line"}"/>`).join("")}</g>`;
          const last = bands[bands.length - 1];
          // Labels only for curves inside the plot, 10 px apart from the bottom up.
          let prev = Infinity;
          const ys = last.values.map((v) => { prev = Math.min(y(v) + 3, prev - 10); return [prev, y(v) >= T && y(v) <= H - B]; });
          axes += CURVE_LABELS.map((p, k) => (ys[k][1] ? `<text data-fx="bl-${k}" x="${W - R + 4}" y="${ys[k][0].toFixed(1)}" class="axis band-label">P${p}</text>` : "")).join("");
        }
        const d = smoothPath(line.points.map((p) => [x(p.t), y(p.v)]));
        if (line.side === "left" && zonesOn) {
          // Under 18.5, normal to 25, over to 30, obese: only where visible.
          const zones = [[-Infinity, 18.5, "zone-low"], [18.5, 25, "zone-ok"], [25, 30, "zone-high"], [30, Infinity, "zone-veryhigh"]];
          zones.forEach(([lo, hi, cls], k) => {
            const top = y(Math.min(hi, sc.v1)), bottom = y(Math.max(lo, sc.v0));
            if (bottom - top <= 0) return;
            back += `<rect x="${L}" y="${top.toFixed(1)}" width="${W - L - R}" height="${(bottom - top).toFixed(1)}" class="${cls}"/>`;
            if (bottom - top >= 14) {
              axes += `<text x="${W - R + 4}" y="${((top + bottom) / 2 + 4).toFixed(1)}" class="axis band-label">${esc(t.zoneShort[k])}</text>`;
            }
          });
          for (const v of [18.5, 25, 30]) {
            if (v > sc.v0 && v < sc.v1) back += `<line x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="band-median"/>`;
          }
        }
        if (line.side === "left" && !bands && !zonesOn) {
          paths += `<path d="${d}L${x(line.points[line.points.length - 1].t).toFixed(1)},${H - B}L${x(line.points[0].t).toFixed(1)},${H - B}Z" class="area"/>`;
        }
        // Values from an earlier body-fat method faded, up to the switch.
        const cuts = METHOD_METRICS.includes(line.metric)
          ? switches.filter((sw) => sw.t > line.points[0].t && sw.t <= line.points[line.points.length - 1].t) : [];
        if (cuts.length) {
          const sw = cuts[cuts.length - 1];
          const real = line.points.filter((p) => !p.synthetic || p === line.points[line.points.length - 1]);
          const before = real.filter((p) => p.t < sw.t).pop(), after = real.find((p) => p.t >= sw.t);
          // Daily means mix both methods on the day of the switch: the cut
          // lies between the last old and the first new point.
          const xs = before && after ? Math.min(Math.max(x(sw.t), x(before.t) + 0.6 * (x(after.t) - x(before.t))), x(after.t)) : x(sw.t);
          const id = `cut-${cls}`;
          paths += `<clipPath id="${id}-a"><rect x="0" y="0" width="${xs.toFixed(1)}" height="${H}"/></clipPath><clipPath id="${id}-b"><rect x="${xs.toFixed(1)}" y="0" width="${W}" height="${H}"/></clipPath>`;
          paths += `<path d="${d}" class="line ${cls} old" clip-path="url(#${id}-a)"/><path d="${d}" class="line ${cls}" clip-path="url(#${id}-b)"/>`;
          for (const c of cuts) {
            if (marked.has(c.t)) continue;
            marked.add(c.t);
            const cx = c === sw ? xs : x(c.t);
            const label = `${t.chartLabels.body_fat_percentage}: ${methodName(c.from)} → ${methodName(c.to)}`;
            const tx = Math.min(Math.max(cx - 17, L + 2), W - R - 36);
            back += `<line x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" y1="${T}" y2="${H - B}" class="method-switch"/>`;
            axes += `<g class="method-tag" transform="translate(${tx.toFixed(1)},${T + 2})"><title>${esc(label)}</title><rect width="34" height="15" rx="4"/><text x="17" y="11" text-anchor="middle">${methodNo(c.from)}→${methodNo(c.to)}</text></g>`;
          }
        } else if (line.estUntil) {
          const xe = x(line.estUntil).toFixed(1), id = `est-${cls}`;
          paths += `<clipPath id="${id}-a"><rect x="0" y="0" width="${xe}" height="${H}"/></clipPath><clipPath id="${id}-b"><rect x="${xe}" y="0" width="${W}" height="${H}"/></clipPath>`;
          paths += `<path d="${d}" class="line ${cls} est" clip-path="url(#${id}-a)"/><path d="${d}" class="line ${cls}" clip-path="url(#${id}-b)"/>`;
        } else {
          paths += `<path ${kid && line.side === "right" ? 'data-fx="right-line" ' : ""}d="${d}" class="line ${cls}"/>`;
        }
        if (line.points.length <= 60) {
          paths += line.points.filter((p) => !p.synthetic).map((p) => `<circle ${kid && line.side === "right" ? `data-fx="right-dot-${Math.round(p.t)}" ` : ""}cx="${x(p.t).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="2.5" class="dot ${cls}"><title>${esc(this._fmtDate(p.t, period))}: ${this._num(p.v, metricDigits(line.metric))}</title></circle>`).join("");
        }
        const last = line.points[line.points.length - 1];
        paths += `<circle ${kid && line.side === "right" ? 'data-fx="right-last" ' : ""}cx="${x(last.t).toFixed(1)}" cy="${y(last.v).toFixed(1)}" r="4" class="last ${cls}"/>`;
        // Round values on the axis; dotted lines across for the left one.
        const ax = line.side === "left" ? L - 6 : W - R + 6;
        const anchor = line.side === "left" ? "end" : "start";
        const ticks = guidesOn && line.side === "right" ? [] : niceTicks(sc.v0, sc.v1, H < 180 ? 4 : 5);
        for (const v of ticks) {
          if (line.side === "left" && grid) back += `<line x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="grid dotted"/>`;
          axes += `<text x="${ax}" y="${(y(v) + 4).toFixed(1)}" class="axis ${cls}" text-anchor="${anchor}">${this._num(v, ticks.digits)}</text>`;
        }
      }
      svg = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(t.chartViews[view])}">
          <line x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}" class="grid"/>${back}${paths}${axes}
        </svg>`;
    }
    // One entry per series in the chart head: colour mark, label, latest value.
    const lastStack = stackPts && stackPts[stackPts.length - 1];
    const stackLegend = lastStack ? `<span class="legend left"><span class="swatch"></span><span class="legend-label">${esc(t.comp.ffm)}</span><span class="legend-value">${this._num(lastStack.ffm, 1)} kg</span></span>`
      + `<span class="legend right"><span class="swatch"></span><span class="legend-label">${esc(t.comp.fat)}</span><span class="legend-value">${this._num(lastStack.fat, 1)} kg</span></span>` : "";
    const legend = stackLegend || lines.map((l) => {
      let last = l.points[l.points.length - 1];
      // Current values come from the latest reading or the sensors, not from
      // daily statistics, so they match the summary and the value tiles.
      const row = person.rows[0];
      if (row && row[l.metric] != null && row[l.metric] !== "" && !Number.isNaN(Number(row[l.metric]))) last = { v: Number(row[l.metric]) };
      if (l.metric.endsWith("_percentile")) {
        // After the reference shown (the other one's value with its curves).
        const v = this._pctNow(person, l.metric, kid ? kid.ref : this._profileOf(person).reference);
        if (v != null) last = { v };
      } else if (l.metric === "height") {
        const hh = this._heightHistory(person);
        if (hh.length) last = { v: hh[hh.length - 1].v };
      }
      let value = "–";
      if (last) {
        const n = this._num(last.v, metricDigits(l.metric));
        value = l.metric === "height" ? this._cm(last.v)
          : CHART_UNITS[l.metric] === "P" ? `P${n}` : CHART_UNITS[l.metric] ? `${n} ${CHART_UNITS[l.metric]}` : n;
      }
      // Not drawn (shown by the curves instead): value without a colour mark.
      const mark = `<span class="swatch ${drawn.includes(l) ? "" : "ghost"}"></span>`;
      // Which reference the percentile follows: short, in the same line (tooltip: full name, sex).
      let refMark = "";
      if (l.metric.endsWith("_percentile")) {
        const ref = kid ? kid.ref : this._profileOf(person).reference;
        const sx = this._profileOf(person).sex;
        const full = `${ref === "kh" ? "Kromeyer-Hauschild" : "WHO"}${sx && t.bandsFor[sx] ? ` · ${t.bandsFor[sx]}` : ""}`;
        refMark = `<span class="legend-ref" title="${esc(full)}">${ref === "kh" ? "DE" : "WHO"}${sx ? `<ha-icon icon="mdi:gender-${sx === "female" ? "female" : "male"}"></ha-icon>` : ""}</span>`;
      } else if (zonesOn && l.metric === "body_mass_index") {
        refMark = `<span class="legend-ref" title="${esc(t.zonesValue)}">WHO</span>`;
      }
      return `<span class="legend ${l.side}">${mark}<span class="legend-label">${esc(t.chartLabels[l.metric])}</span><span class="legend-value">${esc(value)}</span>${refMark}</span>`;
    }).join("");
    // Fixed places: the same buttons in every view, unavailable ones greyed out.
    const seg = (items) => `<div class="seg">${items.join("")}</div>`;
    const viewSeg = seg(views.map((v) => `<button class="${v === view ? "on" : ""}" data-action="chartview" data-view="${v}"
        title="${esc(t.chartViews[v])}" aria-label="${esc(t.chartViews[v])}" aria-pressed="${v === view}"><ha-icon icon="${VIEW_ICONS[v]}"></ha-icon></button>`));
    const refs = curveRows ? this._references(person, spec.bands) : null;
    const shownRef = refs ? (curveMode === "other" ? refs.other : refs.chosen) : null;
    const canCurves = !!curveRows || adultZones || guides;
    const toggles = [];
    if (compView) {
      toggles.push(`<button class="ref-key ${pctMode ? "on" : ""}" data-action="comppct" title="${esc(pctMode ? t.comp.kg : t.comp.pct)}" aria-label="${esc(pctMode ? t.comp.kg : t.comp.pct)}" aria-pressed="${pctMode}">%</button>`);
    }
    if (this._config.grid !== false) {
      toggles.push(`<button class="${grid ? "on" : ""}" data-action="grid" title="${esc(t.grid)}" aria-label="${esc(t.grid)}" aria-pressed="${grid}"><ha-icon icon="mdi:grid"></ha-icon></button>`);
    }
    if (this._config.curves !== false && kid) {
      // Two buttons: a tap picks the reference, a second tap hides its curves.
      // Without comparing (settings) only the chosen reference: one button.
      for (const ref of kid.refs.compare ? ["who", "kh"] : [kid.refs.chosen]) {
        const on = kid.on && kid.ref === ref, can = kid.has(ref);
        const label = `${ref === "kh" ? "Kromeyer-Hauschild" : "WHO"}: ${t.curvesToggle}`;
        toggles.push(`<button class="ref-key ${on ? "on" : ""}" data-action="curves" data-ref="${ref}" title="${esc(label)}" aria-label="${esc(label)}"
            aria-pressed="${on}" ${can ? "" : "disabled"}>${ref === "kh" ? "DE" : "WHO"}</button>`);
      }
    } else if (this._config.curves !== false && canCurves && !adultZones) {
      const badge = curvesOn && shownRef ? `<span class="badge">${shownRef === "kh" ? "DE" : "WHO"}</span>` : "";
      toggles.push(`<button class="${canCurves && curvesOn ? "on" : ""}" data-action="curves" title="${esc(t.curvesToggle)}" aria-label="${esc(t.curvesToggle)}"
          aria-pressed="${canCurves && curvesOn}" ${canCurves ? "" : "disabled"}><ha-icon icon="mdi:chart-bell-curve"></ha-icon>${badge}</button>`);
    }
    const periodSeg = seg(Object.keys(PERIODS).map((p) => `<button class="${p === period ? "on" : ""}" data-action="period" data-period="${p}"
        title="${esc(t.periods[p])}" aria-label="${esc(t.periods[p])}" aria-pressed="${p === period}">${calendar(PERIOD_MARKS[p])}</button>`));
    // Title: the series with their latest values, and which reference the curves or ranges follow.
    const sex = this._profileOf(person).sex;
    const sub = "";
    const title = `<span class="chart-title" aria-label="${esc(t.chartViews[view])}">${legend}${sub ? `<span class="ct-sub muted">${esc(sub)}</span>` : ""}</span>`;
    // One bar for what is shown (view, period); title and display toggles
    // (grid, curves) sit inside the graph, they only change how it looks.
    // Filters: which entries count (clothes, impedance). Without one the line is the
    // long-term statistics; with one only the stored single entries.
    const fl = this._filterNow(), scope = this._filterScope(person), eff = this._effFilter(person);
    const flBtn = (kind, icons, titles) => `<button class="${fl[kind] !== "any" ? "on" : ""}" data-action="filter" data-kind="${kind}" title="${esc(titles[fl[kind]])}" aria-label="${esc(titles[fl[kind]])}" aria-pressed="${fl[kind] !== "any"}"><ha-icon icon="${icons[fl[kind]]}"></ha-icon>${fl[kind] === "any" ? "" : `<span class="badge">${fl[kind] === "yes" || fl[kind] === "with" ? "✓" : "✕"}</span>`}</button>`;
    const filterBtns = (scope.clothed ? flBtn("clothed", { any: "mdi:tshirt-crew-outline", yes: "mdi:tshirt-crew", no: "mdi:tshirt-crew-outline" }, t.filterClothed) : "")
      + (scope.impedance ? flBtn("impedance", { any: "mdi:flash-outline", with: "mdi:flash", without: "mdi:flash-off-outline" }, t.filterImpedance) : "");
    const filterSeg = filterBtns && this._can("series") && this._can("entries") ? `<div class="seg toggles">${filterBtns}</div>` : "";
    let hint = "";
    if (eff.clothed !== "any" || eff.impedance !== "any") {
      const from = spec.load.map((m) => this._stats?.[`${person.id}|${m}|${period}|${this._filterKey(person)}`]?.entriesFrom).find(Boolean);
      hint = `<div class="muted small chart-hint">${esc(from ? t.filterHint(new Date(from).toLocaleDateString(this._lang)) : t.filterNone)}</div>`;
    }
    // Children: percentiles and curves need the growth data; offer them once per user.
    if (this._profileOf(person).minor && this._config.curves !== false) {
      for (const r of this._growthCtx(person).compare ? ["who", "kh"] : [this._growthCtx(person).chosen]) {
        if (growthStatus(r) === "ready") {
          hint += `<div class="muted small chart-hint growth-hint">${esc(t.growthHint(r === "kh" ? "Kromeyer-Hauschild" : "WHO", GROWTH_LICENSE[r]))}
            <button class="link-btn" data-action="growthon" data-ref="${r}">${esc(t.growthEnable)}</button></div>`;
        }
      }
    }
    return `<div class="chart-box"><div class="chart-controls">${viewSeg}<span class="spacer"></span>${filterSeg}${periodSeg}</div>
      <div class="chart-area"><div class="chart-head">${title}${toggles.length ? `<span class="chart-toggles">${toggles.join("")}</span>` : ""}</div>${svg}</div>${hint}</div>`;
  },
});

/*
 * Module card-table: tables, people, open measurements, dialogs
 *
 * The people tabs, the overview, open measurements, the measurement table, the height
 * table and the confirmation dialogs.
 */

mixin(BodyScaleCard, {
  _renderPending(data, t) {
    // The newest unclear reading is handled on the scale's display; the list
    // only holds the others and stays away while there are none.
    const pending = data.pending.filter((p) => p.measurement_id !== this._shownPending);
    if (!pending.length) return "";
    const items = pending
      .map((p) => {
        const hasImp = p.resistance_1 !== null && p.resistance_1 !== undefined && Number(p.resistance_1) > 0;
        const candidates = new Set(p.candidates || []);
        const buttons = data.people
          .map((person) => {
            // No hint towards a private person this viewer cannot see.
            const hint = candidates.has(person.id) && person.visible;
            return `<button class="chip ${hint ? "hint" : ""}" data-action="assign" data-mid="${esc(p.measurement_id)}" data-user="${esc(person.id)}" title="${hint ? esc(t.suggested) : ""}">${esc(person.name)}</button>`;
          })
          .join("");
        const discard = `<button class="chip muted-chip" data-action="discard" data-mid="${esc(p.measurement_id)}">${esc(t.discard)}</button>`;
        return `<div class="pending">
            <div class="pending-head"><span class="strong">${esc(this._pendingLabel(p))}</span>
            <span class="tag ${hasImp ? "ok" : ""}">${esc(hasImp ? t.impedance : t.noImpedance)}</span></div>
            <div class="chips"><span class="muted small">${esc(t.assignTo)}</span>${buttons}${discard}</div>
          </div>`;
      })
      .join("");
    return `<section><h2>${esc(t.pending)} <span class="count">${pending.length}</span></h2>${items}</section>`;
  },
  _renderOverview(people, t) {
    // One row per person; the graphs live in each person's own view.
    const links = this._config.links || {};
    const rows = people.map((p) => {
      const latest = p.rows[0];
      const change = this._weightChange(p, 7);
      const weight = latest ? `${this._num(latest.weight, 2)} kg` : "–";
      const delta = change == null ? "" : `${change > 0.05 ? "+" : change < -0.05 ? "−" : "±"}${this._num(Math.abs(change), 2)}`;
      const link = links[p.id];
      const inner = `<ha-icon class="who" icon="${personIcon(this._profileOf(p))}"></ha-icon>
        <span class="ov-name">${esc(p.name)}${p.private ? ` <ha-icon class="pen" icon="mdi:eye-off-outline" title="${esc(t.private)}"></ha-icon>` : ""}</span>
        <span class="ov-weight">${esc(weight)}</span><span class="ov-delta" title="${esc(t.days(7))}">${esc(delta)}</span>
        ${link ? `<ha-icon class="chev" icon="mdi:chevron-right"></ha-icon>` : ""}`;
      return link
        ? `<button class="ov-row" data-action="open" data-path="${esc(link)}">${inner}</button>`
        : `<div class="ov-row">${inner}</div>`;
    });
    return `<section><h2>${esc(t.measurements)}</h2><div class="overview">${rows.join("")}</div></section>`;
  },
  _renderPeople(people, t, showTabs, glanceInHeader = false) {
    if (!people.length) return "";
    if (this._config.overview) return this._config.list === false ? "" : this._renderOverview(people, t);
    let html = "<section>";
    if (showTabs && people.length > 1) {
      html += `<div class="tabs">${people
        .map((p) => `<button class="tab ${p.id === this._selected ? "active" : ""}" data-action="tab" data-user="${esc(p.id)}"><ha-icon icon="${personIcon(this._profileOf(p))}"></ha-icon>${esc(p.name)}</button>`)
        .join("")}</div>`;
    }
    const person = people.find((p) => p.id === this._selected) || people[0];
    if (!glanceInHeader && this._config.info !== false) html += `<div class="glance-row">${this._renderGlance(person, t)}</div>`;
    if (this._config.profile !== false) html += this._renderProfile(person, t);
    html += this._renderSummary(person, t);
    if (this._config.chart !== false && person.rows.length) html += this._renderChart(person, t);
    if (this._config.info !== false && person.rows.length) html += this._renderValues(person, t);
    // In the height view the table lists the heights instead of the weigh-ins.
    const views = this._chartViews(person);
    const view = views.includes(this._chartView) ? this._chartView : views[0];
    html += this._config.chart !== false && view === "height" && this._heightHistory(person).length
      ? this._renderHeightTable(person, t)
      : this._renderTable(person, t);
    if (person.rows.length) html += this._renderChartLegend(t);
    return html + "</section>";
  },
  _renderHeightTable(person, t) {
    const rows = this._heightHistory(person).reverse();
    // Each entry's percentile at its own date (children only).
    const refNow = this._references(person, "height_percentile").chosen;
    const pct = new Map();
    if (this._profileOf(person).minor) {
      for (const r of rows) {
        const g = this._growthAt(person, "height", r.v, r.t, refNow);
        if (g) pct.set(r.at, g.p);
      }
    }
    const date = (ms) => new Date(ms).toLocaleDateString(this._lang, { day: "2-digit", month: "2-digit", year: "2-digit" });
    const draft = this._heightRow?.user === person.id ? this._heightRow : null;
    const user = esc(person.id);
    const canEditH = this._can("set_height");
    // The inline row: −/+ in 0.5 cm steps or typed, ✓ saves, ✕ cancels.
    const edit = (when) => `<tr class="draft"><td class="when">${esc(when)}</td>
      <td class="num" colspan="${pct.size ? 3 : 2}"><span class="stepper">
        <button class="icon" data-action="hstep" data-d="-0.5" aria-label="−0,5 cm"><ha-icon icon="mdi:minus"></ha-icon></button>
        <label class="hval"><input type="number" inputmode="decimal" min="40" max="250" step="0.5" value="${esc(String(draft.v))}"><span>cm</span></label>
        <button class="icon" data-action="hstep" data-d="0.5" aria-label="+0,5 cm"><ha-icon icon="mdi:plus"></ha-icon></button></span>
        ${draft.error ? `<div class="error">${esc(draft.error)}</div>` : ""}</td>
      <td class="actions"><button class="icon ok" data-action="hsave" title="${esc(t.save)}" aria-label="${esc(t.save)}" ${draft.busy ? "disabled" : ""}><ha-icon icon="mdi:check"></ha-icon></button><button class="icon" data-action="hcancel" title="${esc(t.cancel)}" aria-label="${esc(t.cancel)}"><ha-icon icon="mdi:close"></ha-icon></button></td></tr>`;
    const body = rows.map((row, i) => {
      if (draft && draft.at === row.at) return edit(date(row.t));
      const older = rows[i + 1];
      let change = "–";
      if (older) {
        const d = row.v - older.v;
        if (Math.abs(d) >= 0.05) change = `<span class="delta ${d > 0 ? "up" : "down"}">${d > 0 ? "+" : "−"}${this._num(Math.abs(d), Number.isInteger(d) ? 0 : 1)}</span>`;
      }
      const p = pct.get(row.at);
      const del = rows.length > 1 && canEditH
        ? `<button class="icon danger" data-action="delheight" data-at="${esc(row.at)}" data-user="${user}" title="${esc(t.remove)}" aria-label="${esc(t.remove)}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>`
        : "";
      return `<tr><td class="when">${esc(date(row.t))}</td>
        <td class="num">${esc(this._cm(row.v))}</td><td class="num">${change}</td>${pct.size ? `<td class="num">${p != null ? `P${Math.round(p)}` : "–"}</td>` : ""}
        <td class="actions">${canEditH ? `<button class="icon" data-action="hedit" data-at="${esc(row.at)}" data-user="${user}" title="${esc(t.heightEdit)}" aria-label="${esc(t.heightEdit)}"><ha-icon icon="mdi:pencil-outline"></ha-icon></button>` : ""}${del}</td></tr>`;
    }).join("");
    const th = (icon, label, cls = "num") => `<th class="${cls}" title="${esc(label)}" aria-label="${esc(label)}"><ha-icon icon="${icon}"></ha-icon></th>`;
    const add = draft || !canEditH ? "" : `<button class="icon add-h" data-action="hadd" data-user="${user}" title="${esc(t.heightAdd)}" aria-label="${esc(t.heightAdd)}"><ha-icon icon="mdi:plus"></ha-icon></button>`;
    return `<div class="table-wrap htable"><table><tr>${th("mdi:calendar-blank-outline", t.date, "")}${th("mdi:human-male-height", t.chartLabels.height)}${th("mdi:delta", t.change)}${pct.size ? th("mdi:chart-bell-curve", t.chartLabels.height_percentile) : ""}<th class="actions">${add}</th></tr>
      ${draft && draft.at == null ? edit(date(Date.now())) : ""}${body}</table></div>`;
  },
  _renderTable(person, t) {
    const rows = this._rowsFiltered(person);
    if (!rows.length) return `<div class="muted">${esc(t.noMeasurements)}</div>`;
    const columns = (this._config.columns || DEFAULT_COLUMNS).filter((c) => t.cols[c]);
    const limit = this._expanded ? rows.length : Math.min(rows.length, Number(this._config.rows) || 10);
    const head = `<tr><th>${esc(t.date)}</th>${columns
      .map((c, i) => `<th class="num ${i >= 3 ? "wide" : ""}">${esc(t.cols[c])}${UNITS[c] ? `<span class="unit"> ${UNITS[c]}</span>` : ""}</th>`)
      .join("")}<th></th></tr>`;
    const body = rows
      .slice(0, limit)
      .map((row, index) => {
        const cells = columns
          .map((c, i) => {
            const digits = ["basal_metabolic_rate", "impedance", "visceral_fat", "metabolic_age"].includes(c) ? 0 : c === "weight" ? 2 : 1;
            let cell = this._num(row[c], digits);
            if (c === "weight") {
              const older = rows[index + 1];
              if (older && older.weight != null && row.weight != null) {
                const delta = Number(row.weight) - Number(older.weight);
                if (Math.abs(delta) >= 0.05) {
                  cell += ` <span class="delta ${delta > 0 ? "up" : "down"}">${delta > 0 ? "+" : "−"}${this._num(Math.abs(delta), 2)}</span>`;
                }
              }
            }
            return `<td class="num ${i >= 3 ? "wide" : ""}">${cell}</td>`;
          })
          .join("");
        const mid = esc(row.measurement_id);
        const others = this._data.people.length > 1 && this._can("set_entry") && this._can("write");
        const canDelete = this._can("write");
        const dressed = !!row.clothed;
        const clothes = this._can("set_entry") && row.weight != null
          ? `<button class="icon ${dressed ? "on" : ""}" data-action="clothed" data-mid="${mid}" data-user="${esc(person.id)}" title="${esc(dressed ? t.clothedOn : t.clothedOff)}" aria-label="${esc(dressed ? t.clothedOn : t.clothedOff)}" aria-pressed="${dressed}"><ha-icon icon="${dressed ? "mdi:tshirt-crew" : "mdi:tshirt-crew-outline"}"></ha-icon></button>`
          : "";
        return `<tr><td class="when">${esc(this._when(row))}</td>${cells}
          <td class="actions">
            ${clothes}
            ${others ? `<button class="icon" data-action="move" data-mid="${mid}" data-user="${esc(person.id)}" title="${esc(t.move)}" aria-label="${esc(t.move)}"><ha-icon icon="mdi:account-switch-outline"></ha-icon></button>` : ""}
            ${canDelete ? `<button class="icon danger" data-action="remove" data-mid="${mid}" data-user="${esc(person.id)}" title="${esc(t.remove)}" aria-label="${esc(t.remove)}"><ha-icon icon="mdi:delete-outline"></ha-icon></button>` : ""}
          </td></tr>`;
      })
      .join("");
    let html = `<div class="table-wrap"><table>${head}${body}</table></div>`;
    if (rows.length > (Number(this._config.rows) || 10)) {
      html += `<div class="chips table-actions"><button class="chip small-chip toggle-chip muted-chip" data-action="expand"><ha-icon icon="${this._expanded ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon>${esc(this._expanded ? t.less : t.more)}</button></div>`;
    }
    return html;
  },
  _renderDialog() {
    const host = this.shadowRoot.querySelector(".dialog-host");
    if (!host) return;
    const dlg = this._dialog;
    if (!dlg) {
      host.innerHTML = "";
      return;
    }
    const t = this._t;
    const targets = dlg.targets
      ? `<div class="chips">${dlg.targets
          .map((p) => `<button class="chip" data-target="${esc(p.id)}">${esc(p.name)}</button>`)
          .join("")}</div>`
      : "";
    const input = dlg.input
      ? `<label class="dlg-input"><input type="number" inputmode="decimal" min="${dlg.input.min}" max="${dlg.input.max}" step="${dlg.input.step}"
          value="${esc(String(dlg.input.value))}"><span>${esc(dlg.input.unit)}</span></label>`
      : "";
    host.innerHTML = `<div class="backdrop"><div class="dialog" role="dialog" aria-modal="true">
        <p>${esc(dlg.text)}</p>${targets}${input}
        ${dlg.error ? `<p class="error">${esc(t.failed)} ${esc(dlg.error)}</p>` : ""}
        <div class="buttons">
          <button class="btn" data-dlg="cancel">${esc(t.cancel)}</button>
          ${dlg.run ? `<button class="btn primary ${dlg.danger ? "danger" : ""}" data-dlg="ok" ${dlg.busy ? "disabled" : ""}>${esc(dlg.confirm)}</button>` : ""}
        </div></div></div>`;
    host.querySelector(".backdrop").addEventListener("click", (ev) => {
      if (ev.target.classList.contains("backdrop")) this._closeDialog();
    });
    host.querySelector('[data-dlg="cancel"]').addEventListener("click", () => this._closeDialog());
    host.querySelectorAll("[data-target]").forEach((el) =>
      el.addEventListener("click", () => {
        const target = dlg.targets.find((p) => p.id === el.dataset.target);
        if (target) dlg.pick(target);
      })
    );
    const field = host.querySelector(".dlg-input input");
    if (field) {
      field.focus();
      field.select();
      field.addEventListener("input", () => { dlg.input.value = field.value; });
      field.addEventListener("keydown", (ev) => { if (ev.key === "Enter") host.querySelector('[data-dlg="ok"]')?.click(); });
    }
    const ok = host.querySelector('[data-dlg="ok"]');
    if (ok) {
      ok.addEventListener("click", async () => {
        dlg.busy = true;
        this._renderDialog();
        try {
          await dlg.run(dlg.input?.value);
          if (this._dialog === dlg) this._closeDialog();
        } catch (err) {
          dlg.busy = false;
          dlg.error = err?.message || String(err);
          if (this._dialog === dlg) this._renderDialog();
        }
      });
    }
  },
});

/*
 * Module card-events: clicks and actions
 *
 * Binds the events after every render and handles every action (assign, move, delete,
 * filters, tabs, height edits, dialogs).
 */

mixin(BodyScaleCard, {
  // Private people: only their own Home Assistant user and administrators
  // see them (dashboard visibility, not access control).
  _mayView(person) {
    const user = this._hass.user;
    if (!person.private || !user) return true;
    return !!user.is_admin || (!!person.loginUserId && person.loginUserId === user.id);
  },
  // ------------------------------------------------------------- actions

  _bind() {
    this.shadowRoot.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", (ev) => {
        if (this._held) {
          this._held = false;
          return;
        }
        this._onAction(ev.currentTarget.dataset);
      });
    });
    // Holding a person key fills it with light, then opens the person's view;
    // let go earlier and it is an ordinary tap.
    this.shadowRoot.querySelectorAll(".person-keys .key[data-link]").forEach((el) => {
      let timer = null;
      const cancel = () => {
        clearTimeout(timer);
        timer = null;
        el.classList.remove("holding");
      };
      el.addEventListener("pointerdown", (ev) => {
        if (ev.button > 0) return;
        this._held = false;
        el.classList.add("holding");
        timer = setTimeout(() => {
          timer = null;
          this._held = true;
          el.classList.remove("holding");
          el.classList.add("held");
          setTimeout(() => this._onAction({ action: "open", path: el.dataset.link }), 150);
          setTimeout(() => el.classList.remove("held"), 700);
        }, HOLD_MS);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((name) => el.addEventListener(name, () => timer && cancel()));
      el.addEventListener("contextmenu", (ev) => ev.preventDefault());
    });
    const field = this.shadowRoot.querySelector(".htable .hval input");
    if (field) {
      field.addEventListener("input", () => { if (this._heightRow) this._heightRow.v = field.value; });
      field.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") this._saveHeightRow();
        else if (ev.key === "Escape") this._onAction({ action: "hcancel" });
      });
    }
  },
  _onAction(d) {
    const t = this._t;
    if (d.action === "open") {
      // The person's view on this dashboard: same path, last part replaced.
      const path = window.location.pathname.replace(/[^/]*$/, d.path);
      window.history.pushState(null, "", path);
      window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
    } else if (d.action === "tab") {
      this._selected = d.user;
      this._expanded = false;
      this._saveTab(d.user);
      this._render();
    } else if (d.action === "delheight") {
      const row = this._heightHistory(this._person(d.user) || {}).find((r) => r.at === d.at);
      const label = row ? `${new Date(row.t).toLocaleDateString(this._lang)} (${this._cm(row.v)})` : d.at;
      this._openDialog({
        text: t.confirmDelHeight(label, this._person(d.user)?.name),
        confirm: t.remove,
        danger: true,
        run: () => this._call("delete_height", { person_id: d.user, at: d.at }),
      });
    } else if (d.action === "height") {
      this._openHeight(d.user);
    } else if (d.action === "hadd" || d.action === "hedit") {
      const person = this._person(d.user);
      const row = d.at ? this._heightHistory(person || {}).find((r) => r.at === d.at) : null;
      this._heightRow = { user: d.user, at: d.at || null, v: row ? row.v : this._profileOf(person).heightCm ?? "" };
      this._render();
      this.shadowRoot.querySelector(".htable .hval input")?.focus();
    } else if (d.action === "hstep") {
      const v = this._heightInput() ?? Number(this._heightRow.v) ?? 0;
      this._heightRow.v = Math.min(250, Math.max(40, Math.round((v + Number(d.d)) * 2) / 2));
      const field = this.shadowRoot.querySelector(".htable .hval input");
      if (field) field.value = this._heightRow.v;
    } else if (d.action === "hcancel") {
      this._heightRow = null;
      this._render();
    } else if (d.action === "hsave") {
      this._saveHeightRow();
    } else if (d.action === "curves") {
      const person = this._person(this._selected);
      const views = person ? this._chartViews(person) : [];
      const view = views.includes(this._chartView) ? this._chartView : views[0];
      // Curves fade in and out and morph between WHO and DE; the scales stay.
      const fxBefore = this._fxCapture();
      if (d.ref && person) {
        const cur = this._curveState(person, view);
        // Plain on/off per button: the shown reference hides its curves, any
        // other button shows its own (one reference at a time).
        const next = cur.ref === d.ref && cur.on ? { ref: d.ref, on: false } : { ref: d.ref, on: true };
        this._curveStates = { ...(this._curveStates || {}), [view]: next };
        try {
          window.localStorage.setItem(`body-scale-card:curves2:${view}`, JSON.stringify(next));
        } catch (e) {
          /* private mode: not remembered */
        }
      } else {
        // Adults: the WHO ranges on or off.
        const mode = person ? this._curveMode(person, "bmi_percentile") : "ref";
        this._curves = mode === "off" ? "ref" : "off";
        try {
          window.localStorage.setItem("body-scale-card:curves-mode", this._curves);
        } catch (e) {
          /* private mode: not remembered */
        }
      }
      this._render();
      this._fxRun(fxBefore);
    } else if (d.action === "grid") {
      this._grid = !this._gridOn();
      this._saveFlag("grid-off", !this._grid);
      this._render();
    } else if (d.action === "growthon") {
      // Consent to load a growth table, kept per user.
      saveGlobalOptions(this._hass, { ...globalOptions.values, [`growth_${d.ref}`]: true }).catch((e) => console.warn("body-scale-card: saving failed", e));
    } else if (d.action === "comppct") {
      this._compPct = !this._compPctOn();
      this._saveFlag("comp-pct", this._compPct);
      this._render();
      // Two different drawings: fade the new one in instead of jumping.
      if (Element.prototype.animate && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
        this.shadowRoot.querySelectorAll("svg.chart, .chart-title").forEach((el) => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease-out" }));
      }
    } else if (d.action === "chartview") {
      this._chartView = d.view;
      this._render();
    } else if (d.action === "period") {
      this._period = d.period;
      this._render();
    } else if (d.action === "filter") {
      // any -> first value -> second value -> any
      const order = d.kind === "clothed" ? ["any", "no", "yes"] : ["any", "with", "without"];
      const f = this._filterNow();
      f[d.kind] = order[(order.indexOf(f[d.kind]) + 1) % order.length];
      this._filter = f;
      this._expanded = false;
      this._render();
    } else if (d.action === "clothed") {
      // Clothes are set afterwards by storing the same weighing again (it replaces
      // the entry at that time).
      const row = this._person(d.user)?.rows.find((r) => r.measurement_id === d.mid);
      if (row && row.weight != null) {
        Promise.resolve(this._call("set_entry", {
          person_id: d.user, at: row.at, weight: Number(row.weight),
          ...(row.impedance ? { impedance: Number(row.impedance) } : {}), clothed: !row.clothed,
        })).catch((err) => this._openDialog({ text: `${t.failed} ${err?.message || err}` }));
      }
    } else if (d.action === "legend") {
      this._legendOpen = !this._legendOpen;
      this._render();
    } else if (d.action === "how") {
      this._howOpen = !this._howOpen;
      this._render();
    } else if (d.action === "clegend") {
      this._chartLegendOpen = !this._chartLegendOpen;
      this._render();
    } else if (d.action === "info") {
      this._infoOpen = !(this._infoOpen ?? this._restoreFlag("info"));
      this._saveFlag("info", this._infoOpen);
      this._render();
    } else if (d.action === "glance") {
      // Jump to the values; a symbol also opens its tile.
      if (d.metric) this._openMetric = d.metric;
      this._render();
      const target = this.shadowRoot.querySelector(d.metric ? `.val[data-metric="${d.metric}"]` : ".vals");
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (d.action === "metric") {
      this._openMetric = this._openMetric === d.metric ? null : d.metric;
      this._render();
    } else if (d.action === "how") {
      this._howOpen = !(this._howOpen ?? this._restoreFlag("how"));
      this._saveFlag("how", this._howOpen);
      this._render();
    } else if (d.action === "expand") {
      this._expanded = !this._expanded;
      this._render();
    } else if (d.action === "assign") {
      const p = this._data.pending.find((x) => x.measurement_id === d.mid);
      const label = p ? this._pendingLabel(p) : d.mid;
      this._openDialog({
        text: t.confirmAssign(label, this._person(d.user)?.name),
        confirm: t.assign,
        run: () => this._call("assign_measurement", { measurement_id: d.mid, person_id: d.user }),
      });
    } else if (d.action === "hist") {
      const i = Number(d.i);
      // The choice stays as it is; after the history view the display returns to it.
      this._hist = this._hist === i ? null : i;
      clearTimeout(this._histTimer);
      if (this._hist) {
        this._histAt = Date.now();
        this._histTimer = setTimeout(() => {
          this._hist = null;
          this._render();
        }, this._histHold());
      }
      this._render();
    } else if (d.action === "next") {
      // Choosing a key or person ends the history view.
      this._hist = null;
      clearTimeout(this._histTimer);
      // Whatever a key was showing ends with the tap; the new choice starts from zero.
      this._clickAt = Date.now();
      this._autoWake = this._data.next && d.option === this._data.next.attributes.options[0] ? this._clickAt : 0;
      this._lastChoice = null;
      const isHold = d.option === t.hold;
      this._hold = null;
      this._holdResult = null;
      if (this._data.next) {
        // A key switches to its mode; pressing the lit one again changes nothing
        // (automatic has a key of its own).
        const nx = this._data.next, cm = Number(this._config.choice_minutes);
        const person = this._data.people.find((x) => x.name === d.option);
        const kind = d.option === nx.attributes.options[0] ? "auto" : d.option === nx.attributes.options[1] || isHold ? "guest" : person?.id;
        const option = isHold ? nx.attributes.options[1] : d.option;
        this._choice = { option, at: Date.now() };
        if (isHold) this._holdStart(this._data);
        // With choice_minutes the card hands the duration of the choice to the integration.
        const send = this._setNext(nx, kind, option, cm);
        Promise.resolve(send)
          .catch((err) => {
            this._choice = null;
            this._render();
            this._openDialog({ text: `${t.failed} ${err?.message || err}` });
          });
      }
      this._render();
    } else if (d.action === "baby-dismiss") {
      this._clickAt = Date.now();
      this._render();
    } else if (d.action === "baby-assign") {
      this._openDialog({
        text: t.confirmBaby(d.w, this._person(d.user)?.name),
        confirm: t.babySave,
        run: async () => {
          await this._call("set_entry", { person_id: d.user, at: d.ts, weight: Number(d.raw) });
          this._holdResult = null;
          this._clickAt = Date.now();
        },
      });
    } else if (d.action === "discard") {
      const p = this._data.pending.find((x) => x.measurement_id === d.mid);
      this._openDialog({
        text: t.confirmDiscard(p ? this._pendingLabel(p) : d.mid),
        confirm: t.discardShort,
        danger: true,
        run: () => this._call("discard_measurement", { measurement_id: d.mid }),
      });
    } else if (d.action === "move") {
      const label = this._rowLabel(d.user, d.mid);
      this._openDialog({
        text: t.pickTarget(label),
        targets: this._data.people.filter((p) => p.id !== d.user),
        pick: (target) => {
          this._openDialog({
            text: t.confirmMove(label, this._person(d.user)?.name, target.name),
            confirm: t.move,
            run: async () => {
              // Moving = the same weighing for the other person (their profile
              // computes the body values), then removing it from the first.
              const row = this._person(d.user)?.rows.find((r) => r.measurement_id === d.mid);
              if (!row || row.weight == null) throw new Error("entry not found");
              await this._call("set_entry", {
                person_id: target.id, at: row.at, weight: Number(row.weight),
                ...(row.impedance ? { impedance: Number(row.impedance) } : {}),
                ...(row.clothed ? { clothed: true } : {}),
              });
              await this._call("delete_entry", { person_id: d.user, entry_id: d.mid });
            },
          });
        },
      });
    } else if (d.action === "remove") {
      this._openDialog({
        text: t.confirmRemove(this._rowLabel(d.user, d.mid), this._person(d.user)?.name),
        confirm: t.remove,
        danger: true,
        run: () => this._call("delete_entry", { person_id: d.user, entry_id: d.mid }),
      });
    }
  },
  _openHeight(userId) {
    const t = this._t;
    const person = this._person(userId);
    if (!person) return;
    const cm = this._profileOf(person).heightCm;
    this._openDialog({
      text: t.heightAsk(person.name),
      input: { value: cm ?? "", min: 40, max: 250, step: 0.5, unit: "cm" },
      confirm: t.save,
      run: (value) => {
        const v = Number(String(value).replace(",", "."));
        if (!(v >= 40 && v <= 250)) throw new Error(t.heightRange);
        return this._call("set_height", { person_id: userId, cm: v });
      },
    });
  },
  _heightInput() {
    const field = this.shadowRoot.querySelector(".htable .hval input");
    const v = field ? Number(String(field.value).replace(",", ".")) : NaN;
    return field && field.value !== "" && !Number.isNaN(v) ? v : null;
  },
  async _saveHeightRow() {
    const row = this._heightRow;
    if (!row || row.busy) return;
    const v = this._heightInput();
    row.v = v ?? row.v;
    if (!(v >= 40 && v <= 250)) {
      row.error = this._t.heightRange;
      this._render();
      return;
    }
    row.busy = true;
    row.error = null;
    try {
      await this._call("set_height", { person_id: row.user, cm: v, ...(row.at ? { at: row.at } : {}) });
      if (this._heightRow === row) this._heightRow = null;
    } catch (err) {
      row.busy = false;
      row.error = `${this._t.failed} ${err?.message || err}`;
    }
    this._render();
  },
  _openDialog(dialog) {
    this._dialog = { ...dialog, error: null, busy: false };
    this._renderDialog();
  },
  _closeDialog() {
    this._dialog = null;
    this._renderDialog();
  },
});

/*
 * Module card-storage: remembering tabs and switches
 *
 * Keeps the selected person, view, period and the on/off switches per browser.
 */

mixin(BodyScaleCard, {
  // ---------------------------------------------------------- persistence

  _tabKey() {
    return `body-scale-card:${this._config.title || ""}:tab`;
  },
  _restoreTab(people) {
    try {
      const id = window.localStorage.getItem(this._tabKey());
      return people.find((p) => p.id === id) ? id : null;
    } catch (e) {
      return null;
    }
  },
  _restoreFlag(name) {
    try {
      return window.localStorage.getItem(`body-scale-card:${name}`) === "1";
    } catch (e) {
      return false;
    }
  },
  _restoreFlagOff(name) {
    return this._restoreFlag(`${name}-off`);
  },
  _saveFlag(name, on) {
    try {
      window.localStorage.setItem(`body-scale-card:${name}`, on ? "1" : "0");
    } catch (e) {
      /* private mode: not remembered */
    }
  },
  _saveTab(id) {
    try {
      window.localStorage.setItem(this._tabKey(), id);
    } catch (e) {
      /* private mode: the tab is simply not remembered */
    }
  },
});

/*
 * Module card-styles: CSS
 *
 * The stylesheet of the card as one template string (all themes, skins and the legend).
 */

mixin(BodyScaleCard, {
  // --------------------------------------------------------------- styles

  _styles() {
    return `<style>
      :host { display: block; }
      ha-card { padding-bottom: 8px; overflow: hidden; }
      .card-header { margin: 0; padding: 16px 16px 4px; font-size: 1.4em; font-weight: 400; }
      .card-header.icon-header { --mdc-icon-size: 48px; color: var(--secondary-text-color); line-height: 0; }
      .who-icons { display: inline-flex; vertical-align: -4px; --mdc-icon-size: 20px; color: var(--secondary-text-color); }
      .tag.step { display: inline-flex; align-items: center; gap: 2px; --mdc-icon-size: 14px; }
      .device-wrap { padding: 16px 16px 4px; display: flex; justify-content: center; }
      /* Default skin: black scale, red LED display. skin: theme takes the dashboard theme's colours. */
      .device { --led: #ff3b30; --glow: color-mix(in srgb, var(--led) 45%, transparent); --body: linear-gradient(145deg, #2b2b2e, #111); --edge: #444;
        --screen: #050505; --key: #1b1b1d; --key-edge: #3a3a3c; --key-on: #2a0b09; --foot: #555;
        width: 100%; max-width: 420px; aspect-ratio: 1 / 1; border-radius: 26px; padding: 14px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px;
        background: var(--body); box-shadow: inset 0 0 0 1px var(--edge); }
      .device.theme { --led: var(--primary-color); --glow: transparent; --body: var(--secondary-background-color, #f0f0f0); --edge: var(--divider-color, #ddd);
        --screen: var(--card-background-color, #fff); --key: var(--card-background-color, #fff); --key-edge: var(--divider-color, #ddd);
        --key-on: color-mix(in srgb, var(--primary-color) 14%, var(--card-background-color, #fff)); --foot: var(--divider-color, #ccc); }
      .device.theme .display { box-shadow: inset 0 0 0 1px var(--edge); }
      .device.theme .d-weight { color: var(--primary-color); }
      /* Display with the mode keys as slim bars below it, centred like on a real scale. */
      .device { container-type: inline-size; --key-label: #8e8e93; }
      .device-top { display: flex; flex-direction: column; gap: 3px; width: min(296px, 86%); align-self: center; container-type: inline-size; }
      /* Sizes: 54 weight / 20 lines / 14 small (phone 44 / 16 / 13); symbols 20, status symbols 22. */
      .display { --fs-big: 54px; --fs: 20px; --fs-s: 14px; --ic: 20px; --zone: 60px; position: relative; border-radius: 10px; background: var(--screen); color: var(--led);
        text-shadow: 0 0 5px var(--glow); padding: 8px 10px 4px; box-sizing: border-box; display: flex; flex-direction: column; gap: 5px; min-width: 0;
        font-family: "DejaVu Sans Mono", Menlo, Consolas, monospace; }
      .display ha-icon { --mdc-icon-size: var(--ic); width: var(--ic); height: var(--ic); filter: drop-shadow(0 0 3px var(--glow)); display: inline-flex; }
      .d-hist { display: flex; justify-content: space-between; font-size: var(--fs-s); line-height: 1; }
      .d-hist span { opacity: 0.4; min-width: 1.5em; text-align: center; padding: 3px 0; cursor: pointer; }
      .d-hist span.none { opacity: 0.15; cursor: default; }
      .d-hist span.cur { opacity: 1; font-weight: 700; text-shadow: 0 0 6px var(--glow), 0 0 2px var(--glow); box-shadow: inset 0 0 0 1px var(--led); border-radius: 4px; }
      .d-hist.off { opacity: 0.4; }
      .d-wrow { display: flex; align-items: flex-end; gap: 2px; min-width: 0; }
      .d-weight { font-size: var(--fs-big); font-weight: 700; line-height: 0.9; white-space: nowrap; letter-spacing: -1px; }
      .d-weight .dp { display: inline-block; width: 0.22em; text-align: center; }
      .d-weight .dp i { display: inline-block; width: 0.13em; height: 0.13em; border-radius: 1px; background: currentColor; box-shadow: 0 0 5px var(--glow); }
      .d-weight.dim, .d-side.dim > * { opacity: 0.28; }
      .d-side { display: flex; flex-direction: column; justify-content: flex-end; gap: 5px; align-self: stretch; flex: 1; min-width: 0; margin-left: 0; white-space: pre; line-height: 1; }
      .d-l { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      .d-l2 { align-items: flex-end; }
      .d-s { font-size: var(--fs-s); display: flex; align-items: center; gap: 4px; }
      .d-s ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; }
      .d-u { opacity: 0.7; margin-left: 4px; }
      .d-kgl { display: flex; align-items: baseline; gap: 5px; font-size: var(--fs); height: var(--fs); }
      .d-tr { font-size: var(--fs-s); opacity: 0.75; }
      .d-zn { width: var(--zone); height: var(--fs); position: relative; display: flex; justify-content: flex-end; align-items: center; flex: none; }
      .d-dt { font-size: var(--fs); white-space: pre; letter-spacing: 0; }
      .d-row { display: flex; align-items: center; justify-content: space-between; font-size: var(--fs); height: var(--ic); letter-spacing: 1px; white-space: nowrap; min-width: 0; }
      .d-vv { display: flex; align-items: center; gap: 16px; min-width: 0; }
      .d-val { display: inline-flex; align-items: center; gap: 5px; letter-spacing: 0; }
      /* BMI cell of fixed width, so the fat symbol stays put between "25.1" and "P80". */
      .d-vv .d-val:first-child { min-width: calc(var(--ic) + 5px + 2.4em); }
      .d-ar { font-size: var(--fs-s); margin-left: 2px; }
      .d-sum { letter-spacing: 0; }
      .d-cl { display: flex; align-items: center; margin-left: auto; }
      .d-sl { display: inline-flex; width: calc(var(--zone) / 3); height: 20px; align-items: center; justify-content: center; }
      .meth { width: 20px; height: 20px; color: var(--led); filter: drop-shadow(0 0 3px var(--glow)); }
      .d-bot { display: grid; grid-template-columns: repeat(var(--m, 3), minmax(0, 1fr)); gap: 10px; height: 24px; margin: auto 0 0; padding-top: 0; }
      .d-m { display: flex; justify-content: center; justify-self: center; align-items: center; height: 24px; width: 44px; margin: 0; padding: 0; border-radius: 8px; opacity: 0.25; }
      .device.fw-wide .d-m { justify-self: stretch; width: auto; margin: 0 6px; }
      .d-m.on { opacity: 1; }
      .d-m ha-icon { --mdc-icon-size: 22px; width: 22px; height: 22px; }
      @keyframes rs-soft { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      .val.old .val-value { opacity: 0.6; }
      .val-old { font-size: 0.75em; color: var(--secondary-text-color); }
      .d-cands { display: flex; gap: 14px; }
      .d-steps { display: inline-flex; align-items: center; }
      .d-steps .hs { display: inline-flex; align-items: center; gap: 1px; opacity: 0.28; }
      .d-steps .hs.now { opacity: 1; }
      .d-steps .ar { opacity: 0.5; margin: 0 5px; font-size: var(--fs-s); }
      .d-steps .pl { margin: 0 1px; font-size: var(--fs-s); }
      @container (max-width: 280px) {
        .display { --fs-big: 44px; --fs: 16px; --fs-s: 13px; --ic: 18px; --zone: 54px; }
        .d-dt { font-size: var(--fs-s); }
        .d-m ha-icon { --mdc-icon-size: 20px; width: 20px; height: 20px; }
      }
      .device .key.cand { opacity: 1; box-shadow: inset 0 0 0 1px var(--led), 0 0 8px var(--glow); }
      /* Unclear reading: names and keys light up in turn; still for reduced motion. */
      @media (prefers-reduced-motion: reduce) { .cyc { animation: none !important; } }
      /* Last minute: the lit key blinks. */
      .device .key.expiring > * { animation: rs-soft 1.6s ease-in-out infinite; }
      /* Inverted (invert_modes / invert_history): a filled field with a dark symbol. */
      @keyframes rs-pulse { 0%, 100% { background-color: color-mix(in srgb, var(--led) calc(var(--inv, 65) * 1%), var(--screen)); } 50% { background-color: color-mix(in srgb, var(--led) calc(var(--inv, 65) * 0.4%), var(--screen)); } }
      .device.inv-modes .d-m.mode, .device.inv-modes .d-m.on { box-shadow: none; text-shadow: none; color: var(--screen); }
      .device.inv-modes .d-m.mode { background: color-mix(in srgb, var(--led) calc(var(--inv, 65) * 0.4%), var(--screen)); opacity: 1; }
      .device.inv-modes .d-m.on { background: color-mix(in srgb, var(--led) calc(var(--inv, 65) * 1%), var(--screen)); opacity: 1; }
      .device.inv-modes .d-m.on ha-icon, .device.inv-modes .d-m.mode ha-icon { filter: none; }
      .device.inv-modes .d-m[data-end] { box-shadow: none; }
      .device.inv-modes .d-m.expiring { animation: rs-pulse 2s ease-in-out infinite; }
      .device.inv-hist .d-hist span.cur { background: var(--led); color: var(--screen); box-shadow: none; text-shadow: none; opacity: 1; }
      .lg-m { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 8px; }
      .lg-m.set { background: color-mix(in srgb, var(--lg-fg) 28%, transparent); }
      .lg-m.on { background: var(--lg-fg); }
      .lg-m ha-icon { color: var(--lg-bg) !important; }
      .lg-h { display: inline-block; padding: 0 5px; border-radius: 4px; background: var(--lg-fg); color: var(--lg-bg); }
      @keyframes rs-frame { 0%, 100% { box-shadow: inset 0 0 0 1px var(--led); } 50% { box-shadow: inset 0 0 0 1px transparent; } }
      .d-m[data-end] { box-shadow: inset 0 0 0 1px var(--led); opacity: 1; }
      .d-m.expiring { animation: rs-frame 0.9s ease-in-out infinite; }
      .person-keys .key .ring { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
      .person-keys .key .ring path { fill: none; stroke: var(--led); stroke-width: 3; filter: drop-shadow(0 0 3px var(--glow)); }
      /* Dim = off, frame = the mode that is set, lit = active now. */
      .device .mode-keys .key.cand::after { box-shadow: inset 0 0 0 1px var(--led), 0 0 8px var(--glow); }
      .d-m.mode { opacity: 0.4; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--led) 60%, transparent); }
      .d-m.mode.on, .d-m.cand { opacity: 1; }
      .d-m.cand { box-shadow: inset 0 0 0 1px var(--led); }
      .ck-k { fill: none; stroke: currentColor; stroke-width: 1.4; }
      .ck-k.dim { opacity: 0.35; }
      .ck-k.lit { filter: drop-shadow(0 0 2px currentColor); stroke-width: 1.8; }
      .ck-k.part { stroke-dasharray: 55 100; }
      .ck-k.thick { stroke-width: 3; }
      .ck-k.thin { stroke-width: 1; }
      .ck-k.half { opacity: 0.5; }
      .flow { display: block; width: 100%; max-width: 420px; height: auto; margin: 6px auto; }
      .fl-box { fill: var(--card-background-color, #fff); stroke: var(--secondary-text-color, #727272); stroke-width: 1.4; }
      .fl-t { fill: var(--primary-text-color, #212121); font: 600 12px sans-serif; text-anchor: middle; }
      .fl-a { fill: none; stroke: var(--secondary-text-color, #727272); stroke-width: 1.4; }
      .fl-head { fill: var(--secondary-text-color, #727272); }
      .fl-l { fill: var(--secondary-text-color, #727272); font: 11px sans-serif; }
      .device .key { border: 0; border-radius: 10px; background: var(--key); box-shadow: inset 0 0 0 1px var(--key-edge); color: var(--led); opacity: 0.6; cursor: pointer;
        display: flex; align-items: center; justify-content: center; padding: 0 4px; font: inherit; min-width: 0; }
      .device .key.on { font-weight: 700; opacity: 1; box-shadow: inset 0 0 0 1px var(--led), 0 0 8px var(--glow); text-shadow: 0 0 4px var(--glow); }
      .device .key:focus-visible { outline: 2px solid var(--led); outline-offset: 2px; }
      .mode-keys { display: flex; gap: 10px; }
      .device .mode-keys .key { flex: 1; height: 24px; padding: 0; border-radius: 0; background: none; box-shadow: none; opacity: 1; text-shadow: none; }
      .mode-keys .key::after { content: ""; display: block; width: 100%; height: 10px; border-radius: 5px; background: var(--key); box-shadow: inset 0 0 0 1px var(--key-edge); }
      /* Holding a person key: it fills with light, then opens the person's view. */
      .person-keys .key { position: relative; overflow: hidden; touch-action: manipulation; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
      .person-keys .key > span { position: relative; }
      .person-keys .key::before { content: ""; position: absolute; inset: 0; background: var(--led); opacity: 0.35; transform: scaleX(0); transform-origin: left; transition: transform 0.15s; }
      .person-keys .key.holding::before { transform: scaleX(1); transition: transform 0.8s linear; }
      .person-keys .key.held::before { transform: scaleX(1); opacity: 0.6; }
      /* Square scale: the keys sit at the bottom edge above the feet, like a device. */
      .person-keys { flex: 1; display: grid; grid-template-columns: repeat(var(--cols, var(--n)), minmax(0, 1fr)); gap: 12px 7px; align-content: end; padding-bottom: 6px; }
      .person-keys.one { grid-template-columns: minmax(0, calc((100% - 14px) / 3)); justify-content: center; }
      .person-keys:empty { display: none; }
      .person-keys .key { height: 38px; font-size: 15px; white-space: nowrap; overflow: hidden; }
      .person-keys .short { display: none; }
      .person-keys.short .full { display: none; }
      .person-keys.short .short { display: inline; font-family: "DejaVu Sans Mono", Menlo, Consolas, monospace; font-weight: 700; font-size: 17px; }
      .feet { display: flex; justify-content: space-between; padding: 0 22%; }
      .feet span { width: 32px; height: 5px; border-radius: 3px; background: var(--foot); }
      .chip.icon-only { display: inline-flex; align-items: center; gap: 2px; padding-left: 12px; padding-right: 12px; --mdc-icon-size: 20px; }
      section { padding: 8px 16px; }
      h2 { margin: 8px 0; font-size: 1em; font-weight: 500; color: var(--secondary-text-color); }
      .count { display: inline-block; min-width: 1.4em; padding: 0 6px; border-radius: 10px; text-align: center;
               background: var(--warning-color, #ffa600); color: #fff; font-size: 0.85em; }
      .muted { color: var(--secondary-text-color); }
      .small { font-size: 0.85em; margin-right: 4px; }
      .msg { padding: 16px; }
      .pending { padding: 10px 12px; margin-bottom: 8px; border-radius: 12px;
                 background: var(--secondary-background-color); }
      .pending-head { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; }
      .strong { font-weight: 500; }
      .tag { font-size: 0.8em; padding: 2px 8px; border-radius: 10px; color: var(--secondary-text-color);
             border: 1px solid var(--divider-color); }
      .tag.ok { color: var(--success-color, #43a047); border-color: var(--success-color, #43a047); }
      .chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px; }
      button { font: inherit; cursor: pointer; }
      .chip { border: 1px solid var(--primary-color); color: var(--primary-color); background: transparent;
              border-radius: 16px; padding: 4px 12px; min-height: 32px; }
      .chip.hint { background: var(--primary-color); color: var(--text-primary-color, #fff); }
      .chip.muted-chip { border-color: var(--divider-color); color: var(--secondary-text-color); }
      .pending.guest { border-left: 4px solid var(--primary-color); }
      .profile { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 18px; margin: 4px 0 8px; font-size: 0.92em; color: var(--secondary-text-color); }
      .pf { display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; }
      .pf > ha-icon:first-child { color: var(--secondary-text-color); }
      .method { display: inline-flex; align-items: center; gap: 2px; color: var(--secondary-text-color); }
      .method .scale-mark { width: 26px; height: 22px; display: block; }
      .method .m-lift { width: 17px; height: 17px; }
      .profile .stale { color: var(--warning-color, #ffa600); }
      .inline-link { border: none; background: none; padding: 0; font: inherit; color: inherit; cursor: pointer; }
      .profile .pen { --mdc-icon-size: 14px; vertical-align: -2px; }
      .inline-link .pen { color: var(--primary-color); }
      .table-actions { margin: 8px 0 4px; }
      .inline-link.stale { color: var(--warning-color, #ffa600); }
      .inline-link:hover { color: var(--primary-color); }
      .dlg-input { display: flex; align-items: center; gap: 8px; margin: 4px 0 0; }
      .dlg-input input { flex: 1; min-width: 0; font: inherit; font-size: 1.2em; padding: 8px 10px; border-radius: 8px;
        border: 1px solid var(--divider-color, #ccc); background: var(--card-background-color, #fff); color: var(--primary-text-color); }
      .summary { display: flex; margin: 6px 0 12px; container-type: inline-size; }
      .kpi { display: flex; align-items: center; gap: 6px; white-space: nowrap; overflow: hidden; font-size: 1.1em; font-weight: 600; line-height: 1.2; padding: 2px 16px; }
      .kpi + .kpi { border-left: 1px solid var(--divider-color, #e0e0e0); }
      .kpi .small { font-size: 0.6em; font-weight: 400; }
      .kpi .strong { font-weight: inherit; }
      .kpi-label { display: flex; align-items: center; flex: none; height: 20px; --mdc-icon-size: 20px; }
      .kpi-label .cal { width: 26px; height: 19px; }
      /* Narrow phones: smaller values so all three stay on one line. */
      @container (max-width: 380px) { .kpi { font-size: 1em; padding: 2px 10px; gap: 4px; } }
      @container (max-width: 320px) { .kpi { font-size: 0.9em; padding: 2px 7px; } .kpi-label .cal { width: 22px; height: 16px; } }
      .kpi:first-child { padding-left: 0; }
      .seg .cal { width: 26px; height: 19px; display: block; }
      .card-header.with-glance { display: flex; align-items: center; gap: 12px; }
      .title-text { flex: none; }
      .glance { display: flex; gap: 4px; margin-left: auto; min-width: 0; overflow: hidden; justify-content: flex-end; }
      .glance-row { display: flex; margin: 6px 0 2px; }
      .glance-row .glance { margin-left: 0; justify-content: flex-start; }
      .glance .g { flex: none; height: 26px; min-width: 26px; border: 0; border-radius: 13px; padding: 0; display: inline-flex; align-items: center; justify-content: center;
        gap: 2px; --mdc-icon-size: 16px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
      .glance .g-count { display: none; padding: 0 8px 0 5px; }
      .glance.compact .g.ok:not(.g-count) { display: none; }
      .glance.compact .g-count { display: inline-flex; }
      .g.low { color: var(--info-color, #039be5); background: rgba(3, 155, 229, 0.14); }
      .g.ok { color: var(--success-color, #43a047); background: rgba(67, 160, 71, 0.14); }
      .g.high { color: var(--warning-color, #ffa600); background: rgba(255, 166, 0, 0.16); }
      .g.veryHigh { color: var(--error-color, #db4437); background: rgba(219, 68, 55, 0.14); }
      .chart-box { margin: 4px 0 12px; }
      .chart-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin: 0 0 6px; min-height: 34px; }
      .overview { display: flex; flex-direction: column; }
      .ov-row { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 2px; border: none;
        border-top: 1px solid var(--divider-color); background: none; font: inherit; color: var(--primary-text-color); text-align: left; }
      button.ov-row { cursor: pointer; }
      button.ov-row:hover { background: var(--secondary-background-color); }
      .ov-row .who { color: var(--secondary-text-color); --mdc-icon-size: 22px; }
      .ov-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ov-name .pen { --mdc-icon-size: 14px; color: var(--secondary-text-color); vertical-align: -2px; }
      .ov-weight { font-weight: 500; font-variant-numeric: tabular-nums; }
      .ov-delta { width: 3.2em; text-align: right; font-size: 0.85em; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; }
      .ov-row .chev { color: var(--secondary-text-color); --mdc-icon-size: 20px; }
      .chart-title { flex: 1; min-width: 0; display: flex; flex-direction: column; flex-wrap: nowrap; align-items: flex-start; gap: 0 14px; line-height: 1.25; max-height: ${HEAD_H}px; overflow: hidden; }
      .ct-sub { font-size: 0.75em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .seg { display: inline-flex; flex: none; border: 1px solid var(--primary-color); border-radius: 18px; overflow: hidden; }
      .seg button { border: none; background: none; color: var(--primary-color); font: inherit; font-size: 0.9em;
        height: 32px; min-width: 42px; padding: 0 10px; display: inline-flex; align-items: center; justify-content: center;
        gap: 2px; cursor: pointer; --mdc-icon-size: 20px; }
      .seg button + button { border-left: 1px solid var(--primary-color); }
      .seg button.on { background: var(--primary-color); color: var(--text-primary-color, #fff); }
      .seg.toggles { border-color: var(--divider-color); }
      .seg.toggles button { color: var(--secondary-text-color); min-width: 38px; padding: 0 8px; }
      .seg.toggles button + button { border-left-color: var(--divider-color); }
      .seg.toggles button.on { color: var(--primary-color); background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12); }
      .seg button:disabled { opacity: 0.35; cursor: default; background: none; }
      .seg .badge { font-size: 9px; font-weight: 700; }
      .chart-hint { margin: 2px 4px 0; }
  .link-btn { background: none; border: 0; padding: 0 0 0 6px; font: inherit; color: var(--primary-color); text-decoration: underline; cursor: pointer; }
      .chart-keys dt { white-space: nowrap; }
      .chart-keys dt ha-icon { --mdc-icon-size: 18px; }
      .chart-keys .lg-head { margin-top: 6px; }
      button.icon.on { color: var(--primary-color); }
      .small-chip { min-height: 28px; padding: 2px 10px; font-size: 0.9em; }
      .spacer { flex: 1; }
      .chart { width: 100%; height: auto; display: block; }
      .chart-area { position: relative; }
      .chart-box { container-type: inline-size; }
      /* Narrow phones: slimmer buttons so view and period stay on one line. */
      @container (max-width: 360px) { .chart-controls .seg button { min-width: 0; padding: 0 7px; } }
      .chart-head { position: absolute; top: 0; left: 0; right: 0; height: ${HEAD_H}px; display: flex; align-items: center; gap: 8px; pointer-events: none; }
      .chart-head .chart-title { padding-left: 4px; }
      .chart-toggles { display: flex; gap: 6px; pointer-events: auto; }
      .chart-toggles button { border: 1px solid var(--divider-color, #e0e0e0); background: none; color: var(--secondary-text-color); border-radius: 8px; width: 28px; height: 28px; padding: 0; cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center; position: relative; --mdc-icon-size: 16px; }
      .chart-toggles button.on { color: var(--primary-color); border-color: var(--primary-color); }
      .chart-toggles button:disabled { opacity: 0.35; cursor: default; }
      .chart-toggles .ref-key { width: auto; min-width: 34px; padding: 0 6px; font-size: 11px; font-weight: 700; letter-spacing: .3px; }
      .ref-compare { display: flex; flex-wrap: wrap; gap: 6px 14px; }
      .ref-rate b { margin-right: 4px; }
      .ref-rate.normal { color: var(--success-color, #43a047); }
      .ref-rate.overweight { color: var(--warning-color, #ffa600); }
      .ref-rate.obesity { color: var(--error-color, #db4437); }
      .ref-rate.thinness { color: var(--info-color, #039be5); }
      .chart-toggles .ref-key.picked { box-shadow: inset 0 -2px 0 var(--body-scale-card-second-color, #ff9800); }
      .chart-toggles .badge { position: absolute; bottom: -2px; right: -4px; font-size: 8px; font-weight: 700; }
      .chart .line { fill: none; stroke: var(--primary-color); stroke-width: 2; }
      .chart .line.right { stroke: var(--body-scale-card-second-color, #ff9800); }
      .chart .line.old { opacity: 0.4; }
      .chart .method-switch { stroke: var(--secondary-text-color); stroke-width: 1; stroke-dasharray: 3 3; opacity: 0.7; }
      .chart .method-tag rect { fill: var(--card-background-color, var(--ha-card-background, #fff)); stroke: var(--secondary-text-color); stroke-width: 1; }
      .chart .method-tag text { font-size: 10px; fill: var(--secondary-text-color); font-family: "DejaVu Sans Mono", Menlo, Consolas, monospace; }
      .chart .line, .chart .guide { vector-effect: non-scaling-stroke; }
      .chart .dot.right { fill: var(--body-scale-card-second-color, #ff9800); }
      .chart .last.right { stroke: var(--body-scale-card-second-color, #ff9800); }
      .chart .axis.right { fill: var(--body-scale-card-second-color, #ff9800); }
      .legend { display: inline-flex; align-items: center; gap: 6px; min-width: 0; white-space: nowrap; }
      .legend-label { font-size: 0.8em; color: var(--secondary-text-color); }
      .legend-value { font-weight: 500; font-variant-numeric: tabular-nums; }
      .legend-ref { display: inline-flex; align-items: center; gap: 1px; font-size: 0.7em; color: var(--secondary-text-color); letter-spacing: 0.3px; --mdc-icon-size: 12px; }
      .legend-ref ha-icon { width: 12px; height: 12px; }
      .stack-ffm { fill: var(--primary-color); opacity: 0.45; }
      .stack-fat { fill: var(--body-scale-card-second-color, #ff9800); opacity: 0.55; }
      .stack-ffm.est, .stack-fat.est { opacity: 0.18; }
      .chart .line.est { opacity: 0.4; stroke-dasharray: 3 4; }
      .comp-bars { margin: 8px 0 6px; display: grid; gap: 10px; }
      .comp-row { display: grid; gap: 3px; }
      .comp-cap { font-size: 0.8em; color: var(--secondary-text-color); }
      .comp-bar { display: flex; gap: 2px; height: 30px; border-radius: 8px; overflow: hidden; }
      .seg-c { position: relative; min-width: 0; display: flex; align-items: center; justify-content: center; gap: 4px; color: #fff; overflow: hidden; font-size: 0.85em; }
      .seg-c ha-icon { position: relative; flex: none; --mdc-icon-size: 18px; width: 18px; height: 18px; }
      .seg-c b { position: relative; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
      .fat-parts { position: absolute; inset: 0; display: flex; }
      .fat-parts i { display: block; min-width: 0; }
      .c-fat { background: var(--body-scale-card-second-color, #ff9800); }
      .c-sub { background: color-mix(in srgb, var(--body-scale-card-second-color, #ff9800) 78%, #000); }
      .c-restfat { background: color-mix(in srgb, var(--body-scale-card-second-color, #ff9800) 60%, #fff); }
      .c-muscle { background: var(--primary-color, #03a9f4); }
      .c-bone { background: #9e9e9e; }
      .c-water { background: color-mix(in srgb, var(--primary-color, #03a9f4) 70%, #fff); }
      .c-protein { background: #43a047; }
      .c-rest { background: #bdbdbd; color: #333; }
      .comp-info { display: grid; grid-template-columns: 14px minmax(0, 1fr); gap: 4px 8px; margin: 6px 0; font-size: 0.9em; }
      .comp-info dt { display: flex; padding-top: 4px; }
      .comp-info .sw { width: 12px; height: 12px; border-radius: 3px; display: block; }
      .comp-info .sw.c-none { background: none; border: 1px solid var(--secondary-text-color); }
      .comp-info dd { margin: 0; line-height: 1.35; overflow-wrap: anywhere; }
      .swatch { width: 14px; height: 3px; border-radius: 2px; background: var(--primary-color); flex: none; }
      .legend.right .swatch { background: var(--body-scale-card-second-color, #ff9800); }
      .swatch.ghost { visibility: hidden; }
      .toggle-chip { display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; }
      .chart .dotted { stroke-dasharray: 2 3; opacity: 0.8; }
      .chart .zone-low { fill: var(--info-color, #039be5); opacity: 0.08; }
      .chart .zone-ok { fill: var(--success-color, #43a047); opacity: 0.10; }
      .chart .zone-high { fill: var(--warning-color, #ffa600); opacity: 0.10; }
      .chart .zone-veryhigh { fill: var(--error-color, #db4437); opacity: 0.10; }
      .chart .band-line { fill: none; stroke: var(--body-scale-card-second-color, #ff9800); stroke-width: 1.2; stroke-dasharray: 1.5 4; stroke-linecap: round; opacity: 0.7; vector-effect: non-scaling-stroke; }
      .chart .guide { stroke: var(--body-scale-card-second-color, #ff9800); stroke-width: 1.2; stroke-dasharray: 1.5 4; stroke-linecap: round; opacity: 0.6; }
      .chart .guide.mid { opacity: 0.85; }
      .chart .band-median { fill: none; stroke: var(--body-scale-card-second-color, #ff9800); stroke-width: 1.5; stroke-dasharray: 1.5 4; stroke-linecap: round; opacity: 0.9; vector-effect: non-scaling-stroke; }
      .chart .band-label { fill: var(--body-scale-card-second-color, #ff9800); }
      .icon-chip { padding: 2px 6px; --mdc-icon-size: 18px; line-height: 0; }
      .tab ha-icon { --mdc-icon-size: 18px; margin-right: 4px; vertical-align: -3px; }
      .chart .area { fill: var(--primary-color); opacity: 0.08; }
      .chart .grid { stroke: var(--divider-color); stroke-width: 1; }
      .chart .axis { fill: var(--secondary-text-color); font-size: 11px; }
      .chart .dot { fill: var(--primary-color); }
      .chart .last { fill: var(--card-background-color, #fff); stroke: var(--primary-color); stroke-width: 2; }
      .chart-empty { padding: 24px 0; text-align: center; }
      .tabs { display: flex; gap: 4px; overflow-x: auto; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; }
      .tab { border: none; background: none; padding: 8px 12px; color: var(--secondary-text-color);
             border-bottom: 2px solid transparent; white-space: nowrap; }
      .tab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 500; }
      .table-wrap { overflow-x: auto; }
      table { width: 100%; border-collapse: collapse; font-size: 0.95em; }
      th { text-align: left; font-weight: 500; color: var(--secondary-text-color); padding: 6px 4px;
           border-bottom: 1px solid var(--divider-color); white-space: nowrap; }
      td { padding: 6px 4px; border-bottom: 1px solid var(--divider-color); white-space: nowrap; }
      tr:last-child td { border-bottom: none; }
      .num { text-align: right; font-variant-numeric: tabular-nums; }
      .unit { font-weight: 400; font-size: 0.85em; }
      .when { color: var(--primary-text-color); }
      .delta { font-size: 0.8em; color: var(--secondary-text-color); }
      .htable th { --mdc-icon-size: 18px; }
      .htable th.num { text-align: right; }
      .htable .add-h { color: var(--primary-color); box-shadow: inset 0 0 0 1px var(--primary-color); }
      .htable tr.draft td { background: color-mix(in srgb, var(--primary-color) 10%, transparent); }
      .htable .stepper { display: inline-flex; align-items: center; gap: 4px; }
      .htable .hval { display: inline-flex; align-items: baseline; gap: 4px; font-weight: 600; }
      .htable .hval input { width: 4.2em; text-align: right; font: inherit; color: inherit; background: transparent; border: 0; border-bottom: 1px solid var(--primary-color); padding: 2px 0; outline: none; -moz-appearance: textfield; }
      .htable .hval input:focus { border-bottom-width: 2px; }
      .htable .hval input::-webkit-inner-spin-button, .htable .hval input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      .htable .icon.ok { color: var(--primary-color); }
      .htable .error { color: var(--error-color, #db4437); font-size: 12px; text-align: right; white-space: normal; }
      .actions { text-align: right; width: 1%; }
      .icon { border: none; background: none; padding: 4px; border-radius: 50%; color: var(--secondary-text-color);
              --mdc-icon-size: 20px; line-height: 0; }
      .icon:hover { background: var(--secondary-background-color); color: var(--primary-color); }
      .icon.danger:hover { color: var(--error-color, #db4437); }
      .link { border: none; background: none; color: var(--primary-color); padding: 8px 0; }
      @media (max-width: 480px) { .wide { display: none; } }
      .backdrop { position: fixed; inset: 0; z-index: 10; background: rgba(0,0,0,0.45);
                  display: flex; align-items: center; justify-content: center; padding: 16px; }
      .dialog { background: var(--card-background-color, #fff); color: var(--primary-text-color);
                border-radius: 16px; padding: 20px; max-width: 420px; width: 100%;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
      .dialog p { margin: 0 0 12px; line-height: 1.4; }
      .error { color: var(--error-color, #db4437); }
      .buttons { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
      .btn { border: none; background: none; color: var(--primary-color); padding: 8px 14px; border-radius: 18px; font-weight: 500; }
      .btn.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); }
      .btn.primary.danger { background: var(--error-color, #db4437); }
      .btn[disabled] { opacity: 0.5; cursor: default; }
      .info { margin-top: 12px; border-top: 1px solid var(--divider-color); }
      .info-toggle { display: flex; align-items: center; gap: 8px; width: 100%; border: none; background: none;
                     padding: 12px 0; color: var(--primary-text-color); font-weight: 500; text-align: left; }
      .info-toggle.sub { padding-left: 4px; padding-right: 4px; font-size: 0.95em; }
      .info-toggle ha-icon { color: var(--secondary-text-color); --mdc-icon-size: 20px; }
      .info-body { display: flex; flex-direction: column; gap: 12px; padding-bottom: 8px; }
      .explain { padding: 12px 14px; border-radius: 12px; background: var(--secondary-background-color); }
      .explain h3, .tile h3 { margin: 0 0 6px; font-size: 1em; font-weight: 500; }
      .explain p { margin: 6px 0; line-height: 1.45; font-size: 0.95em; }
      .algos { font-size: 0.95em; }
      .algos { display: grid; grid-template-columns: max-content 1fr; gap: 6px 12px; margin: 8px 0; }
      .algos dt { font-weight: 500; }
      .algos dd { margin: 0; line-height: 1.4; }
      @media (max-width: 480px) { .algos { grid-template-columns: 1fr; } .algos dd { margin-bottom: 6px; } }
      :host { --lg-fg: #ff3b30; --lg-bg: #050505; --lg-glow: rgba(255, 59, 48, 0.45); }
      :host(.skin-theme) { --lg-fg: var(--primary-color); --lg-bg: var(--secondary-background-color, #f0f0f0); --lg-glow: transparent; }
      .legend-list { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 6px 14px; align-items: center; margin: 4px 0 8px; --mdc-icon-size: 20px; }
      .legend-list dt { display: flex; gap: 4px; align-items: center; justify-content: center; color: var(--lg-fg); background: var(--lg-bg); text-shadow: 0 0 5px var(--lg-glow); padding: 3px 8px; border-radius: 6px; white-space: nowrap; min-height: 26px; box-sizing: border-box; }
      .legend-list dd { margin: 0; font-size: 0.92em; white-space: normal; overflow-wrap: anywhere; }
      .legend-list ha-icon { color: var(--lg-fg); }
      .legend-sub { margin: 12px 0 4px; font-size: 0.95em; font-weight: 500; }
      .legend-list.chart-keys dt { background: none; text-shadow: none; color: var(--primary-text-color); }
      .legend-list.chart-keys ha-icon { color: var(--primary-text-color); }
      .chart-legend { margin-top: 12px; }
      .ck { width: 30px; height: 12px; }
      .ck-line { fill: none; stroke: var(--primary-color); stroke-width: 2; stroke-linecap: round; }
      .ck-est { opacity: 0.45; stroke-dasharray: 3 4; }
      .ck-old { opacity: 0.35; }
      .ck-pct { fill: none; stroke: var(--body-scale-card-second-color, #ff9800); stroke-width: 2; stroke-dasharray: 1.5 4; stroke-linecap: round; }
      .ck-tag { font: 700 10px "DejaVu Sans Mono", Menlo, Consolas, monospace; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--secondary-text-color); color: var(--secondary-text-color); }
      .legend-list.how dt { background: none; text-shadow: none; color: var(--primary-text-color); }
      .legend-list.how ha-icon { color: var(--secondary-text-color); }
      .legend-list .meth { width: 20px; height: 20px; color: var(--lg-fg); }
      table.algo { width: auto; min-width: 260px; margin: 4px 0; }
      .val-detail table.algo { min-width: 0; width: 100%; }
      table.algo th, table.algo td { border-bottom: 1px solid var(--divider-color); }
      table.algo tr:last-child th, table.algo tr:last-child td { border-bottom: none; }
      table.algo td.on { font-weight: 600; box-shadow: inset 0 0 0 1.5px var(--primary-color, #03a9f4); border-radius: 8px; }
      .algo-note { margin: 2px 0 0; }
      table.algo td.st-low { color: var(--info-color, #039be5); }
      table.algo td.st-ok { color: var(--success-color, #43a047); }
      table.algo td.st-high { color: var(--warning-color, #ffa600); }
      table.algo td.st-veryHigh { color: var(--error-color, #db4437); }
      table.algo td.on:not([class*="st-"]) { color: var(--primary-color); }
      .pill { margin-left: 6px; padding: 1px 6px; border-radius: 8px; font-size: 0.75em;
              background: var(--primary-color); color: var(--text-primary-color, #fff); }
      .vals { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin: 8px 0 12px; }
      .val { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; text-align: left;
        border: 1px solid var(--divider-color); background: none; font: inherit; color: inherit; cursor: pointer; min-width: 0; }
      .val.open { border-color: var(--primary-color); }
      .val-icon { flex: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        --mdc-icon-size: 20px; color: var(--secondary-text-color); background: var(--secondary-background-color, rgba(127,127,127,.1)); }
      .val.low .val-icon { color: var(--info-color, #039be5); background: rgba(3, 155, 229, 0.12); }
      .val.ok .val-icon { color: var(--success-color, #43a047); background: rgba(67, 160, 71, 0.12); }
      .val.high .val-icon { color: var(--warning-color, #ffa600); background: rgba(255, 166, 0, 0.14); }
      .val.veryHigh .val-icon { color: var(--error-color, #db4437); background: rgba(219, 68, 55, 0.12); }
      .val-text { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
      .val-name { font-size: 0.75em; color: var(--secondary-text-color); hyphens: auto; overflow-wrap: break-word; }
      .val-value { font-weight: 500; font-variant-numeric: tabular-nums; }
      .val-status { font-size: 0.75em; display: flex; flex-wrap: wrap; gap: 0 8px; }
      .val-delta { font-weight: 400; color: var(--secondary-text-color); white-space: nowrap;
        --mdc-icon-size: 14px; }
      .val-delta ha-icon { vertical-align: -2px; }
      .val.low .val-rating { color: var(--info-color, #039be5); }
      .val.ok .val-rating { color: var(--success-color, #43a047); }
      .val.high .val-rating { color: var(--warning-color, #ffa600); }
      .val.veryHigh .val-rating { color: var(--error-color, #db4437); }
      .vals { position: relative; }
      .val-detail { position: absolute; left: 0; right: 0; z-index: 3; padding: 4px 12px 10px; border-radius: 12px; border: 1px solid var(--primary-color);
        background: var(--card-background-color, var(--ha-card-background, #fff)); box-shadow: 0 6px 24px rgba(0,0,0,.35); }
      .val-detail::before { content: ""; position: absolute; inset: 0; border-radius: inherit; background: var(--secondary-background-color, rgba(127,127,127,.06)); opacity: .5; pointer-events: none; }
      .val-detail > * { position: relative; }
      .pop-arrow { position: absolute !important; left: var(--arrow, 50%); bottom: -7px; width: 12px; height: 12px; margin-left: -6px; transform: rotate(45deg);
        background: var(--card-background-color, var(--ha-card-background, #fff)); border: solid var(--primary-color); border-width: 0 1px 1px 0; }
      .val-detail.below .pop-arrow { bottom: auto; top: -7px; border-width: 1px 0 0 1px; }
      .val-detail .kg-line { margin: 6px 0 0; font-size: 1.05em; }
      .val-detail .methods-pop { margin-top: 6px; }
      .val-detail p { margin: 6px 0 0; line-height: 1.4; font-size: 0.9em; }
      .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
      .tile { padding: 12px 14px; border-radius: 12px; border: 1px solid var(--divider-color); }
      .tile p { margin: 6px 0 0; line-height: 1.4; font-size: 0.9em; }
      .tile-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
      .tile-value { font-size: 1.15em; font-variant-numeric: tabular-nums; }
      .bar { margin: 10px 0 2px; }
      .bands { position: relative; display: flex; height: 18px; border-radius: 9px; overflow: visible; font-size: 0.7em; }
      .band { display: flex; align-items: center; justify-content: center; overflow: hidden; white-space: nowrap;
              color: #fff; opacity: 0.85; }
      .band:first-child { border-radius: 9px 0 0 9px; }
      .band:last-of-type { border-radius: 0 9px 9px 0; }
      .band.low { background: var(--info-color, #039be5); }
      .band.ok { background: var(--success-color, #43a047); }
      .band.high { background: var(--warning-color, #ffa600); }
      .band.veryHigh { background: var(--error-color, #db4437); }
      .marker { position: absolute; top: -4px; bottom: -4px; width: 4px; margin-left: -2px; border-radius: 2px;
                background: var(--primary-text-color); box-shadow: 0 0 0 2px var(--card-background-color, #fff); }
      .ticks { position: relative; height: 14px; font-size: 0.7em; color: var(--secondary-text-color); }
      .tick { position: absolute; transform: translateX(-50%); top: 2px; }
      .note { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 12px;
              background: var(--secondary-background-color); line-height: 1.4; }
      .note ha-icon { color: var(--secondary-text-color); --mdc-icon-size: 20px; flex: none; }
      .note.warn { border-left: 4px solid var(--warning-color, #ffa600); }
      .disclaimer { margin: 0; }
    </style>`;
  },
});

/*
 * Module strategy: the dashboard strategy
 *
 * custom:body-scale-card-dashboard builds an overview plus one view per person from the
 * integration's entities, so a dashboard needs no names at all.
 */

// Dashboard strategy: builds an overview plus one view per person from the
// integration's entities, so a dashboard needs no names at all:
//
//   strategy:
//     type: custom:body-scale-card-dashboard
//     language: de      # optional, passed to the cards
//     theme: my-theme   # optional, applied to every view
//     sort: name        # optional, default oldest first
// First letter of the name in a circle: the dashboard header shows one icon per view.
function initialIcon(name) {
  const letter = String(name || "").normalize("NFD").replace(/[^A-Za-z]/g, "").charAt(0).toLowerCase();
  return letter ? `mdi:alpha-${letter}-circle-outline` : null;
}

class BodyScaleDashboardStrategy extends HTMLElement {
  static async generate(config, hass) {
    // Only the card's helpers are needed, not an element: no constructor,
    // which would fail if another copy owns the "body-scale-card" tag.
    const probe = Object.create(BodyScaleCard.prototype);
    probe._config = { language: config.language, sort: config.sort, reference: config.reference, compare_references: config.compare_references, baby_max_months: config.baby_max_months };
    probe._hass = hass;
    const data = probe._discover();
    const lang = (config.language || hass.locale?.language || hass.language || "en").slice(0, 2);
    const t = uiText(lang);
    const common = {
      type: "custom:body-scale-card", title: "",
      ...Object.fromEntries(Object.entries(config).filter(([k, v]) =>
        !["type", "theme", "view_icons", "title", "strategy"].includes(k) && v !== undefined && v !== null)),
    };
    const { title: _noTitle, ...personCard } = common;
    const view = (extra) => ({ type: "sections", ...(config.theme ? { theme: config.theme } : {}), ...extra });
    const pathOf = (p) => `person-${p.id}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    // Generated in each viewer's browser: private people only for themselves.
    const visible = data ? data.people.filter((p) => p.visible) : [];
    // Overview: who weighs next, open measurements, one row per person linking to their view.
    const overview = view({
      title: config.title || t.overview,
      path: "overview",
      icon: "mdi:scale-bathroom",
      max_columns: 1,
      sections: [{ type: "grid", cards: [{
        ...common, overview: true, list: false, links: Object.fromEntries(visible.map((p) => [p.id, pathOf(p)])),
        grid_options: { columns: "full" },
      }] }],
    });
    if (!data) return { title: config.title, views: [overview] };
    const people = visible.map((p) => view({
      title: p.name,
      path: pathOf(p),
      icon: config.view_icons === "initials" ? initialIcon(p.name) || personIcon(probe._profileOf(p)) : personIcon(probe._profileOf(p)),
      max_columns: 1,
      sections: [{
        type: "grid",
        // No empty title here: the card shows the person's name as its heading.
        cards: [{
          ...personCard, person: p.id, next_user: false, hide_empty_pending: true, rows: 30,
          columns: ["weight", "body_mass_index", "body_fat_percentage", "muscle_mass", "body_water_percentage",
            "skeletal_muscle_percentage", "bone_mass", "basal_metabolic_rate"],
          grid_options: { columns: "full" },
        }],
      }],
    }));
    return { title: config.title, views: [overview, ...people] };
  }
}

/*
 * Module editor: the visual card editor
 *
 * ha-form based editor with a help text for every option. Options that are not set stay
 * out of the YAML; options the form does not know (e.g. links) are kept.
 */

// ------------------------------------------------------------------ editor
//
// Visual editor (ha-form): every option of the card with a short explanation.
// Options that are not set stay out of the YAML; a value equal to its default
// is removed again. Options the form does not know (e.g. `links`) are kept.
const EDITOR_DEFAULTS = {
  rows: 10, pending: true, next_user: true, chart: true, profile: true, info: true, grid: true, curves: true,
  invert_modes: false, invert_history: false, invert_brightness: 65, mode_field_width: "narrow", overview: false, list: true, hide_empty_pending: false, values_max_age_days: 3, display_hold: 5, history_hold: 30, choice_minutes: 0,
  refresh_seconds: 0, key_blink: false, blink_tolerance_kg: 2, baby_max_months: 24, key_timer: "frame", reference: "who",
  compare_references: false, growth_who: false, growth_kh: false, sort: "age", skin: "device", language: "auto",
};


class BodyScaleCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...(config || {}) };
    if (!this._i18n) { this._i18n = () => this._draw(); i18nListeners.add(this._i18n); }
    this._draw();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    else this._draw();
  }

  _text() {
    const lang = (this._hass?.locale?.language || this._hass?.language || "de").slice(0, 2);
    const tx = editorText(lang);
    // Language list: all languages that ship with the card, each in its own name.
    return { ...tx, options: { ...tx.options, language: { auto: tx.options.language.auto, ...I18N_NAMES } } };
  }

  // The key_timer value as one choice; combinations are shown as custom.
  _timerChoice(value) {
    if (value == null) return "frame";
    return ["frame", "ring", "fade", "none"].includes(String(value)) ? String(value) : "custom";
  }

  _schema(tx) {
    const sel = (name) => {
      const opts = tx.options[name];
      return { name, selector: { select: { mode: "dropdown", options: Object.entries(opts).map(([value, label]) => ({ value, label })) } } };
    };
    const num = (name, min, max, step, unit) => ({ name, selector: { number: { min, max, step, mode: "box", ...(unit ? { unit_of_measurement: unit } : {}) } } });
    const bool = (name) => ({ name, selector: { boolean: {} } });
    const text = (name) => ({ name, selector: { text: {} } });
    const timer = this._timerChoice(this._config.key_timer) === "custom"
      ? sel("key_timer")
      : { name: "key_timer", selector: { select: { mode: "dropdown", options: ["frame", "ring", "fade", "none"].map((value) => ({ value, label: tx.options.key_timer[value] })) } } };
    return [
      { type: "expandable", name: "", title: tx.groups.basic, expanded: true, schema: [text("title"), text("person"), sel("language"), sel("sort"), bool("overview"), bool("list"), num("rows", 1, 100, 1), num("values_max_age_days", 0, 30, 1, "d")] },
      { type: "expandable", name: "", title: tx.groups.look, schema: [sel("skin"), sel("mode_field_width"), bool("invert_modes"), { name: "invert_brightness", selector: { number: { min: 20, max: 100, step: 5, mode: "slider", unit_of_measurement: "%" } } }, bool("invert_history")] },
      { type: "expandable", name: "", title: tx.groups.sections, schema: [bool("next_user"), bool("pending"), bool("hide_empty_pending"), bool("chart"), bool("profile"), bool("info"), bool("grid"), bool("curves")] },
      { type: "expandable", name: "", title: tx.groups.times, schema: [num("display_hold", 1, 120, 1, "min"), num("history_hold", 5, 600, 5, "s"), num("choice_minutes", 0, 120, 1, "min"), num("refresh_seconds", 0, 3600, 1, "s")] },
      { type: "expandable", name: "", title: tx.groups.timer, schema: [timer, bool("key_blink")] },
      { type: "expandable", name: "", title: tx.groups.scale, schema: [text("directory")] },
      { type: "expandable", name: "", title: tx.groups.global, schema: [sel("reference"), bool("compare_references"), ...["who", "kh"].filter((r) => growthStatus(r) !== "absent").map((r) => bool(`growth_${r}`)), num("baby_max_months", 1, 60, 1, ""), num("blink_tolerance_kg", 0, 50, 0.5, "kg")] },
    ];
  }

  _data() {
    const d = { ...EDITOR_DEFAULTS, ...globalOptions.values, ...this._config };
    d.language = this._config.language || "auto";
    d.key_timer = this._timerChoice(this._config.key_timer);
    return d;
  }

  _render() {
    this._draw();
  }

  _globalNote() {
    const de = (this._hass?.locale?.language || this._hass?.language || "de").startsWith("de");
    const who = this._hass?.user?.name || "";
    return de
      ? ` Gilt für alle Waagen-Karten von ${who ? `Benutzer „${who}“` : "diesem Benutzer"} auf allen Geräten. Gespeichert in den Benutzerdaten von Home Assistant, nicht im YAML der Karte. Steht die Option im YAML einer Karte, gilt dort das YAML.`
      : ` Applies to all scale cards of ${who ? `user “${who}”` : "this user"} on all devices. Stored in Home Assistant's user data, not in the card's YAML. If the option is in a card's YAML, the YAML wins there.`;
  }

  _draw() {
    if (!this._config || !this._hass) return;
    loadGlobalOptions(this._hass);
    globalOptions.cards.add(this);
    growthProbe("who"); growthProbe("kh");
    const tx = this._text();
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.addEventListener("value-changed", (ev) => this._changed(ev.detail.value));
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    this._form.data = this._data();
    this._form.schema = this._schema(tx);
    this._form.computeLabel = (item) => tx.labels[item.name] || item.name;
    this._form.computeHelper = (item) => (tx.helpers[item.name] || "") + (GLOBAL_KEYS.includes(item.name) ? this._globalNote() : "");
  }

  _changed(value) {
    const next = { ...this._config };
    const globals = { ...globalOptions.values };
    let globalChanged = false;
    for (const [key, val] of Object.entries(value || {})) {
      if (key === "key_timer" && val === "custom") continue;
      if (GLOBAL_KEYS.includes(key)) {
        // User-wide: into the user data, and out of this card's own options.
        const current = this._config[key] ?? globalOptions.values[key] ?? EDITOR_DEFAULTS[key];
        if (val !== current) {
          const dflt = EDITOR_DEFAULTS[key] !== undefined && EDITOR_DEFAULTS[key] === val;
          if (dflt || val === undefined || val === null || val === "") delete globals[key];
          else globals[key] = val;
          globalChanged = true;
          delete next[key];
        }
        continue;
      }
      const empty = val === undefined || val === null || val === "";
      const isDefault = EDITOR_DEFAULTS[key] !== undefined && EDITOR_DEFAULTS[key] === val;
      if (empty || isDefault) delete next[key];
      else next[key] = val;
    }
    if (globalChanged && this._hass) {
      saveGlobalOptions(this._hass, globals).catch((err) => console.warn("body-scale-card: saving user-wide options failed", err));
    }
    this._config = next;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }
}

/*
 * Module register: register the elements
 *
 * Defines the custom elements (each on its own, so an older copy cannot block the others),
 * adds the card to the card picker and logs the version.
 */

// Each element on its own: an older copy of the card loaded first (e.g. a
// leftover dashboard resource) must not keep the strategy from registering.
const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
};
define("ll-strategy-dashboard-body-scale-card-dashboard", BodyScaleDashboardStrategy);
define("body-scale-card-editor", BodyScaleCardEditor);
define("body-scale-card", BodyScaleCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "body-scale-card")) {
  window.customCards.push({
    type: "body-scale-card",
    name: "Body Scale Card",
    description: "Open measurements with one button per person, history graph and measurement table with move and delete.",
  });
}
console.info(`%c BODY-SCALE-CARD %c ${VERSION} `, "background:#03a9f4;color:#fff", "");
