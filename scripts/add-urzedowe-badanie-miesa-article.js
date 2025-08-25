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

async function addUrzedoweBadanieMiesaArticle() {
  try {
    // Find the "Urzędowe badanie mięsa" menu item
    const [menuRows] = await db.execute(
      "SELECT * FROM menu_items WHERE title = ?",
      ["Urzędowe badanie mięsa"]
    );

    if (menuRows.length === 0) {
      console.log("Menu item 'Urzędowe badanie mięsa' not found");
      return;
    }

    const menuItem = menuRows[0];
    console.log("Found menu item:", menuItem.title, "with ID:", menuItem.id);

    const content = `<div>
<h1>Urzędowe badanie mięsa</h1>
<p>Próbki mięsa dostarczone do Powiatowego Inspektoratu Weterynarii w Piszu są badane w Zakładzie Higieny Weterynaryjnej w Olsztynie.</p>
</div>`;

    // Create the article
    const title = "Urzędowe badanie mięsa";
    const articleData = {
      title: title,
      slug: generateSlug(title),
      content: content,
      excerpt: "Informacje o procedurach urzędowego badania mięsa przeprowadzanego przez Powiatowy Inspektorat Weterynarii w Piszu.",
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

addUrzedoweBadanieMiesaArticle();
