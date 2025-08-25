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

async function addSprawozdaniaFinansoweArticles() {
  try {
    // Find the "Sprawozdania Finansowe" menu item
    const [menuRows] = await db.execute(
      "SELECT * FROM menu_items WHERE title = ?",
      ["Sprawozdania Finansowe"]
    );

    if (menuRows.length === 0) {
      console.log("Menu item 'Sprawozdania Finansowe' not found");
      return;
    }

    const menuItem = menuRows[0];
    console.log("Found menu item:", menuItem.title, "with ID:", menuItem.id);

    // Article 1 - 2024 (Most recent)
    const article2024Content = `<div>
<h1>Bilans i sprawozdanie finansowe za rok 2024</h1>
<p><strong>Dokumenty do pobrania:</strong></p>
<ul>
<li><a href="/download/bilans-jednostki-budzetowej-na-dzien-31.12.2024.pdf" target="_blank">Bilans</a></li>
<li><a href="/download/rachunek-zyskow-i-strat-jednostki-budzetowej-na-dzien-31.12.2024.pdf" target="_blank">Rachunek Zysków i Strat</a></li>
<li><a href="/download/zestawienie-zmian-w-funduszu-jednostki-budzetowej-na-dzien-31.12.2024.pdf" target="_blank">Zestawienie zmian w funduszu jednostki</a></li>
<li><a href="/download/informacja-dodatkowa-na-dzien-31.12.2024.pdf" target="_blank">Informacja Dodatkowa</a></li>
</ul>
</div>`;

    // Article 2 - 2023
    const article2023Content = `<div>
<h1>Bilans i sprawozdanie finansowe za rok 2023</h1>
<p><strong>Dokumenty do pobrania:</strong></p>
<ul>
<li><a href="/download/Bilans-2023.pdf" target="_blank">Bilans</a></li>
<li><a href="/download/Rachunek-zyskow-i-strat-2023.pdf" target="_blank">Rachunek Zysków i Strat</a></li>
<li><a href="/download/Zestawienie-zmian-w-funduszu-2023.pdf" target="_blank">Zestawienie zmian w funduszu jednostki</a></li>
<li><a href="/download/Informacja-dodatkowa-2023.pdf" target="_blank">Informacja Dodatkowa</a></li>
</ul>
</div>`;

    // Article 3 - 2022
    const article2022Content = `<div>
<h1>Bilans i sprawozdanie finansowe za rok 2022</h1>
<p><strong>Dokumenty do pobrania:</strong></p>
<ul>
<li><a href="/download/Bilans-2022.pdf" target="_blank">Bilans</a></li>
<li><a href="/download/Rachunek-zyskow-i-strat-2022.pdf" target="_blank">Rachunek Zysków i Strat</a></li>
<li><a href="/download/Zestawienie-zmian-w-funduszu-2022.pdf" target="_blank">Zestawienie zmian w funduszu jednostki</a></li>
<li><a href="/download/Informacja-dodatkowa-2022.pdf" target="_blank">Informacja Dodatkowa</a></li>
</ul>
</div>`;

    // Article 4 - 2021
    const article2021Content = `<div>
<h1>Bilans i sprawozdanie finansowe za rok 2021</h1>
<p><strong>Dokumenty do pobrania:</strong></p>
<ul>
<li><a href="/download/Bilans-sporzadzony-na-dzien-31.12.2021-.pdf" target="_blank">Bilans</a></li>
<li><a href="/download/Rachunek-zyskow-i-strat-sporzadzony-na-dzien-31.12.2021.pdf" target="_blank">Rachunek Zysków i Strat</a></li>
<li><a href="/download/Zestawienie-zmian-w-funduszu-jednostki-sporzadzony-na-dzien-31.12.2021.pdf" target="_blank">Zestawienie zmian w funduszu jednostki</a></li>
<li><a href="/download/Informacja-dodatkowa-sporzadzona-na-dzien-31.12.2021.pdf" target="_blank">Informacja Dodatkowa</a></li>
</ul>
</div>`;

    // Article 5 - 2020
    const article2020Content = `<div>
<h1>Bilans i sprawozdanie finansowe za rok 2020</h1>
<p><strong>Dokumenty do pobrania:</strong></p>
<ul>
<li><a href="/download/Bilans-za-2020.pdf" target="_blank">Bilans</a></li>
<li><a href="/download/Rachunek-zysków-i-strat-2020.pdf" target="_blank">Rachunek zysków i strat</a></li>
<li><a href="/download/Zestawienie-zmian-w-funduszu-2020.pdf" target="_blank">Zestawienie zmian w funduszu</a></li>
<li><a href="/download/Informacja-Dodatkowa-2020.pdf" target="_blank">Informacja dodatkowa</a></li>
</ul>
</div>`;

    // Article 6 - 2019
    const article2019Content = `<div>
<h1>Bilans i sprawozdanie finansowe za rok 2019</h1>
<p><strong>Dokumenty do pobrania:</strong></p>
<ul>
<li><a href="/download/bilans-2019.pdf" target="_blank">Bilans</a></li>
<li><a href="/download/rachunek-zysków-i-strat-2019.pdf" target="_blank">Rachunek zysków i strat</a></li>
<li><a href="/download/zestawienie-zmian-w-funduszu-2019.pdf" target="_blank">Zestawienie zmian w funduszu</a></li>
<li><a href="/download/Informacja-dodatkowa-2019.pdf" target="_blank">Informacja dodatkowa</a></li>
</ul>
</div>`;

    // Article 7 - 2018
    const article2018Content = `<div>
<h1>Bilans i sprawozdanie finansowe za rok 2018</h1>
<p><strong>Dokumenty do pobrania:</strong></p>
<ul>
<li><a href="/download/Bilans-2018.pdf" target="_blank">Bilans</a></li>
<li><a href="/download/Rachunek-zysków-i-strat-2018.pdf" target="_blank">Rachunek zysków i strat</a></li>
<li><a href="/download/Zestawienie-zmian-w-funduszu-2018.pdf" target="_blank">Zestawienie zmian w funduszu</a></li>
<li><a href="/download/Informacja-dodatkowa-2018.pdf" target="_blank">Informacja dodatkowa</a></li>
</ul>
</div>`;

    // Create articles array with proper dates
    const articles = [
      {
        title: "Sprawozdanie finansowe za rok 2024",
        slug: generateSlug("Sprawozdanie finansowe za rok 2024"),
        content: article2024Content,
        excerpt: "Bilans i sprawozdanie finansowe Powiatowego Inspektoratu Weterynarii w Piszu za rok 2024.",
        status: "published",
        menu_item_id: menuItem.id,
        menu_category: null,
        responsible_person: null,
        created_by: 1,
        created_at: "2025-05-01"
      },
      {
        title: "Sprawozdanie finansowe za rok 2023",
        slug: generateSlug("Sprawozdanie finansowe za rok 2023"),
        content: article2023Content,
        excerpt: "Bilans i sprawozdanie finansowe Powiatowego Inspektoratu Weterynarii w Piszu za rok 2023.",
        status: "published",
        menu_item_id: menuItem.id,
        menu_category: null,
        responsible_person: null,
        created_by: 1,
        created_at: "2024-05-01"
      },
      {
        title: "Sprawozdanie finansowe za rok 2022",
        slug: generateSlug("Sprawozdanie finansowe za rok 2022"),
        content: article2022Content,
        excerpt: "Bilans i sprawozdanie finansowe Powiatowego Inspektoratu Weterynarii w Piszu za rok 2022.",
        status: "published",
        menu_item_id: menuItem.id,
        menu_category: null,
        responsible_person: null,
        created_by: 1,
        created_at: "2023-05-01"
      },
      {
        title: "Sprawozdanie finansowe za rok 2021",
        slug: generateSlug("Sprawozdanie finansowe za rok 2021"),
        content: article2021Content,
        excerpt: "Bilans i sprawozdanie finansowe Powiatowego Inspektoratu Weterynarii w Piszu za rok 2021.",
        status: "published",
        menu_item_id: menuItem.id,
        menu_category: null,
        responsible_person: null,
        created_by: 1,
        created_at: "2022-06-01"
      },
      {
        title: "Sprawozdanie finansowe za rok 2020",
        slug: generateSlug("Sprawozdanie finansowe za rok 2020"),
        content: article2020Content,
        excerpt: "Bilans i sprawozdanie finansowe Powiatowego Inspektoratu Weterynarii w Piszu za rok 2020.",
        status: "published",
        menu_item_id: menuItem.id,
        menu_category: null,
        responsible_person: null,
        created_by: 1,
        created_at: "2021-05-01"
      },
      {
        title: "Sprawozdanie finansowe za rok 2019",
        slug: generateSlug("Sprawozdanie finansowe za rok 2019"),
        content: article2019Content,
        excerpt: "Bilans i sprawozdanie finansowe Powiatowego Inspektoratu Weterynarii w Piszu za rok 2019.",
        status: "published",
        menu_item_id: menuItem.id,
        menu_category: null,
        responsible_person: null,
        created_by: 1,
        created_at: "2020-05-01"
      },
      {
        title: "Sprawozdanie finansowe za rok 2018",
        slug: generateSlug("Sprawozdanie finansowe za rok 2018"),
        content: article2018Content,
        excerpt: "Bilans i sprawozdanie finansowe Powiatowego Inspektoratu Weterynarii w Piszu za rok 2018.",
        status: "published",
        menu_item_id: menuItem.id,
        menu_category: null,
        responsible_person: null,
        created_by: 1,
        created_at: "2019-05-01"
      }
    ];
    
    for (let i = 0; i < articles.length; i++) {
      const articleId = await Article.create(articles[i]);
      console.log(`Article for year ${2024 - i} created successfully with ID:`, articleId);
    }

    console.log("All Sprawozdania Finansowe articles created successfully!");

  } catch (error) {
    console.error("Error adding articles:", error);
  } finally {
    await db.end();
  }
}

addSprawozdaniaFinansoweArticles();
