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

async function addPrzedmiotDzialalnosciArticle() {
  try {
    // Find the "Przedmiot działalności i kompetencje" menu item
    const [menuRows] = await db.execute(
      "SELECT * FROM menu_items WHERE title = ?",
      ["Przedmiot działalności i kompetencje"]
    );

    if (menuRows.length === 0) {
      console.log("Menu item 'Przedmiot działalności i kompetencje' not found");
      return;
    }

    const menuItem = menuRows[0];
    console.log("Found menu item:", menuItem.title, "with ID:", menuItem.id);

    const content = `<div>
<h1>Przedmiot działalności i kompetencje</h1>

<p>Do zakresu działania Powiatowego Inspektoratu Weterynarii w Piszu należy w szczególności:</p>

<ul>
    <li>ochrona zdrowia zwierząt oraz bezpieczeństwa produktów pochodzenia zwierzęcego w celu zapewnienia ochrony zdrowia publicznego;</li>
    <li>zwalczanie chorób zakaźnych zwierząt, w tym chorób odzwierzęcych;</li>
    <li>badania kontrolne zakażeń zwierząt;</li>
    <li>monitorowanie chorób odzwierzęcych i odzwierzęcych czynników chorobotwórczych oraz związanej z nimi oporności na środki przeciwdrobnoustrojowe u zwierząt, w produktach pochodzenia zwierzęcego i środkach żywienia zwierząt;</li>
    <li>badanie zwierząt rzeźnych oraz produktów pochodzenia zwierzęcego;</li>
    <li>przeprowadzanie weterynaryjnej kontroli w handlu i wywozie oraz produktów w rozumieniu przepisów o kontroli weterynaryjnej w handlu;</li>
    <li>sprawowanie nadzoru nad:
        <ul type="a">
            <li>bezpieczeństwem produktów pochodzenia zwierzęcego, w tym nad wymaganiami weterynaryjnymi przy ich produkcji, umieszczaniu na rynku oraz sprzedaży bezpośredniej,</li>
            <li>wprowadzaniem na rynek zwierząt i ubocznych produktów pochodzenia zwierzęcego,</li>
            <li>wytwarzaniem, obrotem i stosowaniem pasz, dodatków stosowanych w żywieniu zwierząt, organizmów genetycznie zmodyfikowanych przeznaczonych do użytku paszowego i pasz genetycznie zmodyfikowanych oraz nad transgranicznym przemieszczaniem organizmów genetycznie zmodyfikowanych przeznaczonych do użytku paszowego,</li>
            <li>zdrowiem zwierząt przeznaczonych do rozrodu oraz jakością zdrowotną materiału biologicznego, jaj wylęgowych drobiu i produktów akwakultury,</li>
            <li>obrotem produktami leczniczymi weterynaryjnymi, wyrobami medycznymi przeznaczonymi dla zwierząt oraz warunkami ich wytwarzania,</li>
            <li>wytwarzaniem i stosowaniem pasz leczniczych,</li>
            <li>przestrzeganiem przepisów o ochronie zwierząt,</li>
            <li>przestrzeganiem zasad identyfikacji i rejestracji zwierząt, przemieszczaniem zwierząt oraz kontroli wzajemnej zgodności,</li>
            <li>przestrzeganiem wymagań weterynaryjnych w gospodarstwach utrzymujących zwierzęta gospodarskie,</li>
            <li>utrzymaniem, hodowlą, prowadzeniem ewidencji zwierząt doświadczalnych w jednostkach doświadczalnych, hodowlanych i u dostawców;</li>
        </ul>
    </li>
    <li>przyjmowanie informacji o niebezpiecznych produktach żywnościowych oraz paszach od organów Państwowej Inspekcji Ochrony Roślin i Nasiennictwa, Inspekcji Jakości Handlowej Artykułów Rolno – Spożywczych, w zakresie kompetencji tych inspekcji, oraz od organów Inspekcji Handlowej o niebezpiecznych produktach żywnościowych pochodzenia zwierzęcego oraz ocena ryzyka i stopnia zagrożenia spowodowanego niebezpiecznym produktem żywnościowym lub paszą, a następnie przekazywanie tych informacji do kierującego siecią systemu RASFF;</li>
    <li>prowadzenie wymiany informacji w ramach systemów wymiany informacji, o których mowa w przepisach Unii Europejskiej;</li>
    <li>wydawanie na wniosek podmiotu ubiegającego się o pomoc finansową opinii co do zgodności z warunkami weterynaryjnymi określonymi przepisami Unii Europejskiej przedsięwzięć i zrealizowanych inwestycji, których realizacja jest wspomagana przez Agencję Restrukturyzacji i Modernizacji Rolnictwa ze środków pochodzących z funduszy Unii Europejskiej.</li>
</ul>
</div>`;

    // Create the article
    const title = "Przedmiot działalności i kompetencje";
    const articleData = {
      title: title,
      slug: generateSlug(title),
      content: content,
      excerpt: "Szczegółowy wykaz zadań i kompetencji Powiatowego Inspektoratu Weterynarii w Piszu zgodnie z obowiązującymi przepisami.",
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

addPrzedmiotDzialalnosciArticle();
