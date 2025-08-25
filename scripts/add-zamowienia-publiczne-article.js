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

async function addZamowieniaPubliczneArticle() {
  try {
    // Find the "Zamówienia publiczne" menu item
    const [menuRows] = await db.execute(
      "SELECT * FROM menu_items WHERE title = ?",
      ["Zamówienia publiczne"]
    );

    if (menuRows.length === 0) {
      console.log("Menu item 'Zamówienia publiczne' not found");
      return;
    }

    const menuItem = menuRows[0];
    console.log("Found menu item:", menuItem.title, "with ID:", menuItem.id);

    const content = `<article id="post-68" class="art-post art-article  post-68 page type-page status-publish hentry">
<h1 class="art-postheader">Zamówienia publiczne</h1>
<div class="art-postcontent clearfix">
<p>Informacja o wyborze najkorzystniejszej oferty w postępowaniu o udzielenie zamówienia na zakup samochodu osobowego dla Powiatowego Inspektoratu Weterynarii w Piszu o wartości szacunkowej poniżej 30 000 euro, prowadzonego w trybie zapytania ofertowego.</p>
<p><a href="/download/informacja.pdf" target="_blank" rel="noopener">
<img class="alignnone wp-image-71" src="/images/pdf-icon.png" width="50" height="50" alt="PDF">
</a></p>
</div>
</article>`;

    // Create the article
    const title = "Zamówienia publiczne";
    const articleData = {
      title: title,
      slug: generateSlug(title),
      content: content,
      excerpt: "Informacje o postępowaniach w zakresie zamówień publicznych Powiatowego Inspektoratu Weterynarii w Piszu.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: "2017-01-01"
    };

    const articleId = await Article.create(articleData);
    console.log("Article created successfully with ID:", articleId);

  } catch (error) {
    console.error("Error adding article:", error);
  } finally {
    await db.end();
  }
}

addZamowieniaPubliczneArticle();
