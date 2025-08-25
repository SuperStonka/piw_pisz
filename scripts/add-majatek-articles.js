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

async function addMajatekArticles() {
  try {
    // Find the "Majątek" menu item
    const [menuRows] = await db.execute(
      "SELECT * FROM menu_items WHERE title = ?",
      ["Majątek"]
    );

    if (menuRows.length === 0) {
      console.log("Menu item 'Majątek' not found");
      return;
    }

    const menuItem = menuRows[0];
    console.log("Found menu item:", menuItem.title, "with ID:", menuItem.id);

    // Article 1 - March 2025 (Most recent)
    const article1Content = `<div>
<h1>Informacja o zbędnych i zużytych składnikach majątku ruchomego</h1>
<p><strong>Data:</strong> Marzec 2025</p>
<p><strong>Do pobrania:</strong></p>
<ul>
<li><a href="/download/Informacja-o-zbednych-i-zuzytych-skladnikach-majatku-sig.pdf" target="_blank">Informacja</a></li>
<li><a href="/download/Zalacznik-nr-1-wykaz-zbednych-zuzytych-skladnikow-majatku-PIW-w-Piszu-sig.pdf" target="_blank">Załącznik 1</a></li>
<li><a href="/download/Zalacznik-nr-2-wniosek-o-przekazanie-darowizne-skladnika-majatku-ruchomego.pdf" target="_blank">Załącznik 2</a></li>
<li><a href="/download/Zalacznik-nr-3-wniosek-o-zakup.pdf" target="_blank">Załącznik 3</a></li>
<li><a href="/download/Zalacznik-nr-4-klauzula-informacyjna.pdf" target="_blank">Załącznik 4</a></li>
</ul>
</div>`;

    const title1 = "Informacja o zbędnych i zużytych składnikach majątku ruchomego (2025)";
    const articleData1 = {
      title: title1,
      slug: generateSlug(title1) + "-marzec-2025",
      content: article1Content,
      excerpt: "Informacja o zbędnych i zużytych składnikach majątku ruchomego PIW w Piszu - 2025.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: "2025-03-01"
    };

    // Article 2 - November 2024
    const article2Content = `<div>
<h1>Ogłoszenie o zbędnym lub zużytym składniku rzeczowym majątku ruchomego</h1>
<p><strong>Data:</strong> 26 listopada 2024</p>
<p><strong>Do pobrania:</strong></p>
<ul>
<li><a href="/download/Informacja-o-zbednych-i-zuzytych-skladnikach-majatku-sig-2024-11.pdf" target="_blank">Ogłoszenie</a></li>
<li><a href="/download/Zalacznik-nr-1-do-ogloszenia-z-dnia-26-listopada-2024-r.-wykaz-zbednych-i-zuzytych-skladnikow-sig.pdf" target="_blank">Załącznik 1</a></li>
<li><a href="/download/Zalacznik-nr-2-do-ogloszenia-z-dnia-26-listopada-2024-r.-wniosek-o-darowizne.doc" target="_blank">Załącznik 2</a></li>
<li><a href="/download/Zalacznik-nr-3-do-ogloszenia-z-dnia-26-listopada-2024-r.-wniosek-o-zakup.docx" target="_blank">Załącznik 3</a></li>
<li><a href="/download/Zalacznik-nr-4-do-ogloszenia-z-dnia-26-listopada-2024-r.-klauzula-informacyjna.pdf" target="_blank">Załącznik 4</a></li>
</ul>
</div>`;

    const title2 = "Ogłoszenie o zbędnym składniku majątku ruchomego (listopad 2024)";
    const articleData2 = {
      title: title2,
      slug: generateSlug(title2) + "-listopad-2024",
      content: article2Content,
      excerpt: "Ogłoszenie o zbędnym lub zużytym składniku rzeczowym majątku ruchomego - listopad 2024.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: "2024-11-26"
    };

    // Article 3 - January 2024
    const article3Content = `<div>
<h1>Ogłoszenie o zbędnym lub zużytym składniku rzeczowym majątku ruchomego</h1>
<p><strong>Data:</strong> Styczeń 2024</p>
<p><strong>Do pobrania:</strong></p>
<ul>
<li><a href="/download/Ogloszenie-o-zbednych-lub-zuzytych-skladnikach-rzeczowych-matatku-ruchomego-PIW-Pisz.pdf" target="_blank">Ogłoszenie</a></li>
</ul>
</div>`;

    const title3 = "Ogłoszenie o zbędnym składniku majątku ruchomego (styczeń 2024)";
    const articleData3 = {
      title: title3,
      slug: generateSlug(title3) + "-styczen-2024",
      content: article3Content,
      excerpt: "Ogłoszenie o zbędnym lub zużytym składniku rzeczowym majątku ruchomego - styczeń 2024.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: "2024-01-01"
    };

    // Article 4 - June 2022
    const article4Content = `<div>
<h1>Informacja o zbędnym składniku majątku ruchomego</h1>
<p><strong>Data:</strong> Czerwiec 2022</p>
<p><strong>Do pobrania:</strong></p>
<ul>
<li><a href="/download/Zbedny-skladnik-majatku-ruchomego.pdf" target="_blank">Informacja</a></li>
</ul>
</div>`;

    const title4 = "Informacja o zbędnym składniku majątku ruchomego (2022)";
    const articleData4 = {
      title: title4,
      slug: generateSlug(title4) + "-czerwiec-2022",
      content: article4Content,
      excerpt: "Informacja o zbędnym składniku majątku ruchomego PIW w Piszu - 2022.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: "2022-06-01"
    };

    // Create all articles
    const articles = [articleData1, articleData2, articleData3, articleData4];
    
    for (let i = 0; i < articles.length; i++) {
      const articleId = await Article.create(articles[i]);
      console.log(`Article ${i + 1} created successfully with ID:`, articleId);
    }

    console.log("All Majątek articles created successfully!");

  } catch (error) {
    console.error("Error adding articles:", error);
  } finally {
    await db.end();
  }
}

addMajatekArticles();
