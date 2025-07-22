// content.js - Extract book info and reviews from Goodreads page

function extractISBNFromJSONLD() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      if (!data) continue;

      if (data['@type'] === 'Book' && data.isbn) {
        return data.isbn;
      }
      if (Array.isArray(data['@graph'])) {
        for (const node of data['@graph']) {
          if (node['@type'] === 'Book' && node.isbn) {
            return node.isbn;
          }
        }
      }
    } catch (e) {
      // skip malformed script
    }
  }
  return null;
}

function extractTitleFromJSONLD() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      if (!data) continue;

      if (data['@type'] === 'Book' && data.name) {
        return data.name;
      }
      if (Array.isArray(data['@graph'])) {
        for (const node of data['@graph']) {
          if (node['@type'] === 'Book' && node.name) {
            return node.name;
          }
        }
      }
    } catch (e) {}
  }
  return null;
}

function extractAuthorFromJSONLD() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      if (!data) continue;

      if (data['@type'] === 'Book' && data.author) {
        return parseAuthor(data.author);
      }

      if (Array.isArray(data['@graph'])) {
        for (const node of data['@graph']) {
          if (node['@type'] === 'Book' && node.author) {
            return parseAuthor(node.author);
          }
        }
      }
    } catch (e) {}
  }
  return null;
}

function parseAuthor(authorField) {
  if (typeof authorField === 'string') {
    return authorField;
  }

  if (Array.isArray(authorField)) {
    return authorField
      .map((a) => (typeof a === 'string' ? a : a.name || ''))
      .filter(Boolean)
      .join(', ');
  }

  if (typeof authorField === 'object' && authorField.name) {
    return authorField.name;
  }

  return null;
}

function getBookInfo() {
  const title = extractTitleFromJSONLD();
  const author = extractAuthorFromJSONLD();
  const isbn = extractISBNFromJSONLD();

  console.log("Extracted book info:", { title, author, isbn });
  return { title, author, isbn };
}

function extractReviewsFromDOM(limit = 30) {
  const reviewNodes = document.querySelectorAll('article.ReviewCard, .Review'); 
  const reviews = [];

  for (let i = 0; i < reviewNodes.length && reviews.length < limit; i++) {
    const card = reviewNodes[i];

    const content = card.querySelector('section.ReviewCard__content, .Review__body');
    if (content && content.innerText.trim()) {
      reviews.push(content.innerText.trim());
    }
  }

  console.log("Extracted reviews:", reviews);
  return reviews;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBookInfo') {
    const bookInfo = getBookInfo();
    const reviews = extractReviewsFromDOM();
    sendResponse({ bookInfo, reviews });
  }
  return true;
});
