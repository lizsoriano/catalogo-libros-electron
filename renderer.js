const DEFAULT_ENDPOINT = "http://34.51.99.221:5001/books";
const PAGE_SIZE = 9;
const storageKey = "catalog.endpoint";
let books = [];
let currentPage = 1;

const elements = {
  settings: document.querySelector("#settings"), endpoint: document.querySelector("#endpoint"),
  grid: document.querySelector("#book-grid"), pagination: document.querySelector("#pagination"),
  summary: document.querySelector("#summary"), status: document.querySelector("#status"),
  template: document.querySelector("#book-template")
};

elements.endpoint.value = localStorage.getItem(storageKey) || DEFAULT_ENDPOINT;

function textOf(node, ...names) {
  for (const name of names) {
    const value = node.querySelector(name)?.textContent?.trim();
    if (value) return value;
  }
  return "No disponible";
}

function parseBooks(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("El XML recibido no es válido.");
  const nodes = [...doc.querySelectorAll("books > book, book")];
  const uniqueNodes = [...new Set(nodes)];
  if (!uniqueNodes.length) throw new Error("El XML no contiene elementos <book>.");
  return uniqueNodes.map((node) => ({
    title: textOf(node, "title", "bookTitle"), isbn: textOf(node, "isbn"),
    genre: textOf(node, "genre", "category", "categoria"),
    price: textOf(node, "price", "precio"), authors: textOf(node, "authors", "author", "autores"),
    stock: textOf(node, "stock", "quantity", "existence"), year: textOf(node, "publicationYear", "year", "publishedYear"),
    image: node.querySelector("images > image > url, image > url, imageUrl, coverUrl")?.textContent?.trim() || ""
  }));
}

function render() {
  const totalPages = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleBooks = books.slice(start, start + PAGE_SIZE);
  elements.grid.replaceChildren(...visibleBooks.map(renderCard));
  elements.summary.textContent = `${books.length} libro${books.length === 1 ? "" : "s"} · página ${currentPage} de ${totalPages}`;
  renderPagination(totalPages);
}

function renderCard(book) {
  const fragment = elements.template.content.cloneNode(true);
  const image = fragment.querySelector("img");
  const fallback = fragment.querySelector(".fallback-cover");
  fragment.querySelector("h3").textContent = book.title;
  fragment.querySelector(".genre").textContent = book.genre;
  for (const field of ["authors", "isbn", "stock", "year", "price"]) {
    fragment.querySelector(`[data-field="${field}"]`).textContent = book[field];
  }
  if (book.image) {
    image.src = book.image;
    image.alt = `Portada de ${book.title}`;
    image.addEventListener("error", () => { image.hidden = true; fallback.hidden = false; });
  } else { image.hidden = true; fallback.hidden = false; }
  return fragment;
}

function renderPagination(totalPages) {
  elements.pagination.replaceChildren();
  if (totalPages < 2) return;
  const addButton = (label, page, disabled = false, current = false) => {
    const button = document.createElement("button"); button.type = "button"; button.textContent = label;
    button.disabled = disabled; button.classList.toggle("active", current);
    button.setAttribute("aria-current", current ? "page" : "false");
    button.addEventListener("click", () => { currentPage = page; render(); }); elements.pagination.append(button);
  };
  addButton("‹", currentPage - 1, currentPage === 1);
  for (let page = 1; page <= totalPages; page++) addButton(String(page), page, false, page === currentPage);
  addButton("›", currentPage + 1, currentPage === totalPages);
}

async function loadCatalog() {
  const endpoint = elements.endpoint.value.trim();
  elements.status.textContent = "Cargando catálogo XML…";
  try {
    books = parseBooks(await window.catalogApi.loadXml(endpoint));
    currentPage = 1; elements.status.textContent = ""; render();
  } catch (error) {
    books = []; elements.grid.replaceChildren(); elements.pagination.replaceChildren();
    elements.summary.textContent = "No fue posible cargar el catálogo.";
    elements.status.textContent = error.message;
  }
}

document.querySelector("#settings-button").addEventListener("click", (event) => {
  elements.settings.hidden = !elements.settings.hidden;
  event.currentTarget.setAttribute("aria-expanded", String(!elements.settings.hidden));
});
document.querySelector("#save-button").addEventListener("click", () => {
  localStorage.setItem(storageKey, elements.endpoint.value.trim()); loadCatalog();
});
document.querySelector("#reload-button").addEventListener("click", loadCatalog);
loadCatalog();
