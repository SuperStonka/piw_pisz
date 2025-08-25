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

async function addNaborKandydatowArticles() {
  try {
    // Find the "Nabór kandydatów" menu item
    const [menuRows] = await db.execute(
      "SELECT * FROM menu_items WHERE title = ?",
      ["Nabór kandydatów"]
    );

    if (menuRows.length === 0) {
      console.log("Menu item 'Nabór kandydatów' not found");
      return;
    }

    const menuItem = menuRows[0];
    console.log("Found menu item:", menuItem.title, "with ID:", menuItem.id);

    // Article 1 - Most recent
    const article1Content = `<div>
<h1>Ogłoszenie nr 153719 / 07.07.2025</h1>
<h2>Inspektor Weterynaryjny</h2>
<p><strong>Do spraw:</strong> zdrowia i ochrony zwierząt w zespole ds. zdrowia i ochrony zwierząt</p>
<p><a href="/download/inspektor-weterynaryjny153719.pdf" target="_blank" rel="noopener">Ogłoszenie</a></p>
</div>`;

    const title1 = "Nabór - Inspektor Weterynaryjny (07.07.2025)";
    const articleData1 = {
      title: title1,
      slug: generateSlug(title1),
      content: article1Content,
      excerpt: "Ogłoszenie o naborze na stanowisko Inspektora Weterynaryjnego - lipiec 2025.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: "2025-07-07"
    };

    // Article 2
    const article2Content = `<div>
<h1>Ogłoszenie nr 152433 / 30.05.2025</h1>
<h2>Inspektor Weterynaryjny</h2>
<p><strong>Do spraw:</strong> ochrony zdrowia zwierząt i zwalczania chorób zakaźnych zwierząt w zespole ds. ochrony zdrowia zwierząt i zwalczania chorób zakaźnych zwierząt</p>
<p><a href="/download/inspektor-weterynaryjny152433.pdf" target="_blank" rel="noopener">Ogłoszenie</a></p>
</div>`;

    const title2 = "Nabór - Inspektor Weterynaryjny (30.05.2025)";
    const articleData2 = {
      title: title2,
      slug: generateSlug(title2),
      content: article2Content,
      excerpt: "Ogłoszenie o naborze na stanowisko Inspektora Weterynaryjnego - maj 2025.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: "2025-05-30"
    };

    // Article 3
    const article3Content = `<div>
<h1>Ogłoszenie nr 78010 / 08.05.2021</h1>
<h2>Inspektor Weterynaryjny</h2>
<p><strong>Do spraw:</strong> ochrony zdrowia zwierząt i zwalczania chorób zakaźnych zwierząt w zespole ds. ochrony zdrowia zwierząt i zwalczania chorób zakaźnych zwierząt</p>
<p><a href="/download/inspektor-weterynaryjny78010.pdf" target="_blank" rel="noopener">Ogłoszenie</a></p>
</div>`;

    const title3 = "Nabór - Inspektor Weterynaryjny (08.05.2021)";
    const articleData3 = {
      title: title3,
      slug: generateSlug(title3),
      content: article3Content,
      excerpt: "Ogłoszenie o naborze na stanowisko Inspektora Weterynaryjnego - maj 2021.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: "2021-05-08"
    };

    // Article 4
    const article4Content = `<div>
<h1>Ogłoszenie nr 76435 / 30.03.2021</h1>
<h2>Inspektor Weterynaryjny</h2>
<p><strong>Do spraw:</strong> ochrony zdrowia zwierząt i zwalczania chorób zakaźnych zwierząt w zespole ds. ochrony zdrowia zwierząt i zwalczania chorób zakaźnych zwierząt</p>
<p><a href="/download/inspektor-weterynaryjny76435.pdf" target="_blank" rel="noopener">Ogłoszenie</a></p>
</div>`;

    const title4 = "Nabór - Inspektor Weterynaryjny (30.03.2021)";
    const articleData4 = {
      title: title4,
      slug: generateSlug(title4),
      content: article4Content,
      excerpt: "Ogłoszenie o naborze na stanowisko Inspektora Weterynaryjnego - marzec 2021.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: "2021-03-30"
    };

    // Create all articles
    const articles = [articleData1, articleData2, articleData3, articleData4];
    
    for (let i = 0; i < articles.length; i++) {
      const articleId = await Article.create(articles[i]);
      console.log(`Article ${i + 1} created successfully with ID:`, articleId);
    }

    console.log("All Nabór kandydatów articles created successfully!");

  } catch (error) {
    console.error("Error adding articles:", error);
  } finally {
    await db.end();
  }
}

addNaborKandydatowArticles();
