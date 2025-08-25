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

async function addWskazowkiDlaRolnikowArticles() {
  try {
    // Find the "Wskazówki dla rolników" menu item
    const [menuRows] = await db.execute(
      "SELECT * FROM menu_items WHERE title = ?",
      ["Wskazówki dla rolników"]
    );

    if (menuRows.length === 0) {
      console.log("Menu item 'Wskazówki dla rolników' not found");
      return;
    }

    const menuItem = menuRows[0];
    console.log("Found menu item:", menuItem.title, "with ID:", menuItem.id);

    // Article 1 - Informacja dla posiadaczy zwierząt
    const article1Content = `<div>
<h1>Informacja powiatowego lekarza weterynarii dla posiadaczy zwierząt</h1>
<p>Informacja powiatowego lekarza weterynarii dla posiadaczy zwierząt, dokonujących uboju zwierząt gospodarskich na użytek własny.</p>
<p>Dokument zawiera szczegółowe wytyczne dotyczące:</p>
<ul>
<li>Procedur uboju zwierząt gospodarskich na użytek własny</li>
<li>Wymagań sanitarnych i weterynaryjnych</li>
<li>Obowiązków posiadaczy zwierząt</li>
<li>Dokumentacji wymaganej przy uboju</li>
</ul>
</div>`;

    const title1 = "Informacja dla posiadaczy zwierząt dokonujących uboju na użytek własny";
    const articleData1 = {
      title: title1,
      slug: generateSlug(title1),
      content: article1Content,
      excerpt: "Informacja powiatowego lekarza weterynarii dla posiadaczy zwierząt dokonujących uboju na użytek własny.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: new Date().toISOString().split('T')[0]
    };

    // Article 2 - Wykaz dokumentów dla gospodarstw
    const article2Content = `<div>
<h1>Wykaz dokumentów i zasad dla gospodarstw dostarczających na rynek</h1>
<p>Wykaz dokumentów i zasad jakie powinny być dostępne i przestrzegane w gospodarstwach dostarczających zwierzęta lub produkty z tych zwierząt na rynek – do konsumpcji publicznej.</p>
<p>Dokument obejmuje:</p>
<ul>
<li>Wymagane dokumenty dla gospodarstw</li>
<li>Zasady dostarczania zwierząt na rynek</li>
<li>Procedury kontroli weterynaryjnej</li>
<li>Wymagania sanitarne dla produktów pochodzenia zwierzęcego</li>
<li>Obowiązki producentów</li>
</ul>
</div>`;

    const title2 = "Wykaz dokumentów i zasad dla gospodarstw dostarczających na rynek";
    const articleData2 = {
      title: title2,
      slug: generateSlug(title2),
      content: article2Content,
      excerpt: "Wykaz dokumentów i zasad dla gospodarstw dostarczających zwierzęta lub produkty na rynek.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: new Date().toISOString().split('T')[0]
    };

    // Article 3 - Druki ułatwiające załatwianie spraw
    const article3Content = `<div>
<h1>Druki ułatwiające załatwianie spraw w PIW</h1>
<p>Zbiór druków i formularzy ułatwiających załatwianie spraw w Powiatowym Inspektoracie Weterynarii.</p>
<p>Dostępne druki:</p>
<ul>
<li>Wnioski o wydanie decyzji administracyjnych</li>
<li>Formularze rejestracyjne</li>
<li>Druki sprawozdawcze</li>
<li>Wzory dokumentów weterynaryjnych</li>
<li>Formularze wniosków o kontrolę</li>
</ul>
<p>Wszystkie druki są dostępne w formacie PDF do pobrania.</p>
</div>`;

    const title3 = "Druki ułatwiające załatwianie spraw w PIW";
    const articleData3 = {
      title: title3,
      slug: generateSlug(title3),
      content: article3Content,
      excerpt: "Zbiór druków i formularzy ułatwiających załatwianie spraw w Powiatowym Inspektoracie Weterynarii.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: new Date().toISOString().split('T')[0]
    };

    // Article 4 - Wymagania weterynaryjne przy sprzedaży bezpośredniej
    const article4Content = `<div>
<h1>Wymagania weterynaryjne przy sprzedaży bezpośredniej</h1>
<p>Wymagania weterynaryjne przy prowadzeniu działalności podlegającej nadzorowi inspekcji weterynaryjnej przy sprzedaży bezpośredniej i działalności marginalnej, lokalnej, ograniczonej.</p>
<p>Dokument zawiera informacje o:</p>
<ul>
<li>Definicji sprzedaży bezpośredniej</li>
<li>Wymaganiach dla działalności marginalnej</li>
<li>Procedurach rejestracji działalności</li>
<li>Wymaganiach sanitarnych i higienicznych</li>
<li>Obowiązkach przedsiębiorców</li>
<li>Kontrolach weterynaryjnych</li>
</ul>
</div>`;

    const title4 = "Wymagania weterynaryjne przy sprzedaży bezpośredniej i działalności marginalnej";
    const articleData4 = {
      title: title4,
      slug: generateSlug(title4),
      content: article4Content,
      excerpt: "Wymagania weterynaryjne przy prowadzeniu działalności przy sprzedaży bezpośredniej i działalności marginalnej.",
      status: "published",
      menu_item_id: menuItem.id,
      menu_category: null,
      responsible_person: null,
      created_by: 1,
      created_at: new Date().toISOString().split('T')[0]
    };

    // Create all articles
    const articles = [articleData1, articleData2, articleData3, articleData4];
    
    for (let i = 0; i < articles.length; i++) {
      const articleId = await Article.create(articles[i]);
      console.log(`Article ${i + 1} created successfully with ID:`, articleId);
    }

    console.log("All Wskazówki dla rolników articles created successfully!");

  } catch (error) {
    console.error("Error adding articles:", error);
  } finally {
    await db.end();
  }
}

addWskazowkiDlaRolnikowArticles();
