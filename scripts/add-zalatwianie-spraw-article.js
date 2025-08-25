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

async function addZalatwianieSprawArticle() {
  try {
    // Find the "Załatwianie spraw w Inspektoracie" menu item
    const [menuRows] = await db.execute(
      "SELECT * FROM menu_items WHERE title = ?",
      ["Załatwianie spraw w Inspektoracie"]
    );

    if (menuRows.length === 0) {
      console.log("Menu item 'Załatwianie spraw w Inspektoracie' not found");
      return;
    }

    const menuItem = menuRows[0];
    console.log("Found menu item:", menuItem.title, "with ID:", menuItem.id);

    const content = `<div class="art-layout-cell art-content clearfix">
<article id="post-59" class="art-post art-article  post-59 page type-page status-publish hentry">
<h1 class="art-postheader">Załatwianie spraw w Inspektoracie</h1>
<div class="art-postcontent clearfix">
<p><strong>Dni i godziny przyjmowania interesantów w sprawach skarg i wniosków przez Powiatowego Lekarza Weterynarii w Piszu:</strong></p>
<ul>
<li>Poniedziałki w godz. 8<u><sup>00</sup></u>– 8<u><sup>30</sup></u></li>
</ul>
<p><strong>&nbsp;Przyjmowanie podań wniesionych ustnie do protokołu w sprawach:</strong></p>
<ul>
<li>Skarg kierowanych do Powiatowego Lekarza Weterynarii w Piszu codziennie 8<u><sup>15 &nbsp;</sup></u>&nbsp;14<u><sup>00</sup></u>&nbsp; w siedzibie Powiatowego Inspektoratu Weterynarii w Piszu Al. J. Piłsudskiego 15A/1.</li>
</ul>
<p><strong>&nbsp;Skargi i wnioski wnoszone na piśmie należy przesyłać na adres:</strong></p>
<ul>
<li>Powiatowy Lekarz Weterynarii w Piszu Al. J. Piłsudskiego 15A/1,&nbsp; 12 – 200 Pisz</li>
<li>bądź przesyłać faksem na numer: 87 424 09 89.</li>
</ul>
<p><strong>&nbsp;Przyjmowanie korespondencji:</strong></p>
<ul>
<li>W sekretariacie Inspektoratu w Piszu Al. J. Piłsudskiego 15A/1.</li>
</ul>
<p>Skargi, wnioski i petycje są przyjmowane i rozpatrywane w trybie przepisów Kodeksu Postępowania Administracyjnego – Dział VIII (Dz. U. z 2000 r, Nr 98, poz. 1071 – tekst jednolity).</p>
</div>
</article>
</div>`;

    // Create the article
    const title = "Załatwianie spraw w Inspektoracie";
    const articleData = {
      title: title,
      slug: generateSlug(title),
      content: content,
      excerpt: "Procedury i informacje dotyczące załatwiania spraw w Powiatowym Inspektoracie Weterynarii w Piszu.",
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

addZalatwianieSprawArticle();
