import { Article } from "../lib/models/Article.js";
import { createDB } from "./db-config.js";

const db = createDB();

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ł/g, "l")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/ź/g, "z")
    .replace(/ż/g, "z")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function addOrganyOsobyArticle() {
  try {
    // Find the "Organy i osoby sprawujące funkcje" menu item
    const [menuRows] = await db.execute(
      "SELECT * FROM menu_items WHERE title = ?",
      ["Organy i osoby sprawujące funkcje"]
    );

    if (menuRows.length === 0) {
      console.log("Menu item 'Organy i osoby sprawujące funkcje' not found");
      return;
    }

    const menuItem = menuRows[0];
    console.log("Found menu item:", menuItem.title, "with ID:", menuItem.id);

    const content = `<div class="art-layout-cell art-content clearfix">
<article id="post-57" class="art-post art-article  post-57 page type-page status-publish hentry">
<h1 class="art-postheader">Organy i osoby sprawujące funkcje</h1>
<div class="art-postcontent clearfix">
<h1 style="text-align: center;">Powiatowy Lekarz Weterynarii</h1>
<hr>
<p style="text-align: center;"><strong>lek. wet. Monika Kowalczyk – Czapla<br>
</strong>tel. 87 423 27 53 wew. 0451<br>
tel. kom. 696 429 046<br>
email: <a href="mailto:pisz.piw@pisz.piw.gov.pl">pisz.piw@pisz.piw.gov.pl</a></p>
<h1 style="text-align: center;">Zespół ds. bezpieczeństwa żywności</h1>
<hr>
<p style="text-align: center;"><strong>Starszy inspektor weterynaryjny</strong><br>
lek. wet. Magdalena Krajewska<br>
tel. 87 423 27 53 wew. 0457<br>
tel. kom.&nbsp;696&nbsp;429&nbsp;045<br>
email:&nbsp;<a href="mailto:magdalena.krajewska@pisz.piw.gov.pl">magdalena.krajewska@pisz.piw.gov.pl</a></p>
<p style="text-align: center;"><strong>Inspektor weterynaryjny</strong><br>
mgr Martyna Glazer<br>
tel. 87 423 27 53 wew. 0457<br>
tel. kom.&nbsp;722&nbsp;080 706<br>
email:&nbsp;<a href="mailto:martyna.glazer@pisz.piw.gov.pl">martyna.glazer@pisz.piw.gov.pl</a></p>
<h1 style="text-align: center;">Zespół ds. pasz i utylizacji</h1>
<hr>
<p style="text-align: center;"><strong>Inspektor weterynaryjny</strong><br>
<strong>mgr inż.&nbsp;Agnieszka Budzyńska </strong><br>
tel. 87 423 27 53 wew. 0460<br>
tel. kom. 721 060 602<br>
email:&nbsp;<a href="mailto:agnieszka.budzynska@pisz.piw.gov.pl">agnieszka.budzynska@pisz.piw.gov.pl</a></p>
<h1 style="text-align: center;">Zespół ds. zdrowia i ochrony zwierząt</h1>
<hr>
<p style="text-align: center;"><strong>Starszy Inspektor weterynaryjny</strong><br>
<strong>mgr inż. Monika Michalska<br>
</strong>tel. 87 423 27 53 wew. 0455<br>
tel. kom. 781 222 262<br>
email: <a href="mailto:monika.michalska@pisz.piw.gov.pl">monika.michalska@pisz.piw.gov.pl</a></p>
<p style="text-align: center;"><strong>Inspektor weterynaryjny</strong><br>
<strong>mgr inż. Ewa Pietrzak<br>
</strong>tel. 87 423 27 53 wew. 0453</p>
<p style="text-align: center;">tel. kom. 885 060 604<br>
email:&nbsp; <a href="mailto:ewa.pietrzak@pisz.piw.gov.pl">ewa.pietrzak@pisz.piw.gov.pl</a></p>
<p style="text-align: center;"><strong>Starszy inspektor weterynaryjny</strong><br>
lek. wet. Magdalena Krajewska<br>
tel. 87 423 27 53 wew. 0457<br>
tel. kom.&nbsp;696&nbsp;429&nbsp;045<br>
email:&nbsp;<a href="mailto:magdalena.krajewska@pisz.piw.gov.pl">magdalena.krajewska@pisz.piw.gov.pl</a></p>
<p style="text-align: center;"><strong>Starszy Kontroler Weterynaryjny ds. ochrony zdrowia zwierząt i zwalczania chorób zakaźnych zwierząt</strong><br>
<strong>&nbsp;st. tech. wet.&nbsp;Leszek Doniec</strong><br>
tel. 87 423 27 53 wew. 0452<br>
tel. kom. 721 060 603</p>
<p style="text-align: center;">email:&nbsp;<a href="mailto:l.doniec@pisz.piw.gov.pl">l.doniec@pisz.piw.gov.pl</a></p>
<h1 style="text-align: center;">Zespół ds. finansowo-księgowych i administracyjnych</h1>
<hr>
<p style="text-align: center;"><strong>Główny Księgowy</strong><br>
<strong>mgr Marta Tuzinowska<br>
</strong>tel. 87 423 27 53 wew. 0456<br>
tel. kom.&nbsp;885 060 603<br>
email: &nbsp;<a href="mailto:pisz.piw@pisz.piw.gov.pl" target="_blank" rel="noopener">pisz.piw@pisz.piw.gov.pl</a></p>
<p style="text-align: center;"><strong>Księgowy</strong><br>
<strong>mgr&nbsp;Alicja Święcka-Gawron<b><br>
</b></strong>tel. 87 423 27 53 wew. 0458<br>
email: <a href="mailto:pisz.piw@pisz.piw.gov.pl">pisz.piw@pisz.piw.gov.pl</a></p>
<p style="text-align: center;"><strong>Księgowy</strong><br>
<strong>Daria Siargiej</strong><br>
tel. 87 423 27 53 wew. 0459<br>
email: <a href="mailto:pisz.piw@pisz.piw.gov.pl">pisz.piw@pisz.piw.gov.pl</a></p>
<p style="text-align: center;"><strong>Referent Administracyjno-Księgowy</strong><br>
<strong>mgr&nbsp;Katarzyna Rydzewska<br>
</strong>tel. 87 423 27 53 wew. 0461<br>
email: <a href="mailto:pisz.piw@pisz.piw.gov.pl">pisz.piw@pisz.piw.gov.pl</a></p>
<p style="text-align: center;"><strong>Sekretarka</strong><br>
<strong>Emilia Wróblewska<br>
</strong>tel. 87 423 27 53 wew. 0452<br>
email: <a href="mailto:pisz.piw@pisz.piw.gov.pl">pisz.piw@pisz.piw.gov.pl</a></p>
<h1 style="text-align: center;">Samodzielne stanowisko ds. obsługi prawnej</h1>
<hr>
<p style="text-align: center;"><strong>Radca Prawny</strong><br>
<strong>Paweł Wądołowski</strong></p>
</div>
</article>
</div>`;

    // Create the article
    const title = "Organy i osoby sprawujące funkcje";
    const articleData = {
      title: title,
      slug: generateSlug(title),
      content: content,
      excerpt: "Informacje o organach kierowniczych i osobach sprawujących funkcje w Powiatowym Inspektoracie Weterynarii w Piszu.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: new Date().toISOString().split('T')[0]
    };

    const articleId = await Article.create(articleData);
    console.log("Article created successfully with ID:", articleId);

  } catch (error) {
    console.error("Error adding article:", error);
  } finally {
    await db.end();
  }
}

addOrganyOsobyArticle();
