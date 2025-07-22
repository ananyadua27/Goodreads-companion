# Goodreads Companion (Chrome Extension)  
### Intelligent Browser Extension for Book Metadata Extraction, Review NLP, and Library Availability

The **Goodreads Companion** is a full-featured browser extension that augments the Goodreads user experience by integrating natural language processing (NLP), structured data extraction, API integration, and client-side state management. This extension demonstrates DOM parsing, sentiment analysis, Chrome extension architecture, asynchronous programming, and data visualization.

---

## Overview

Upon navigating to a Goodreads book page, the extension automatically:

- Extracts book metadata (title, author, ISBN) from embedded `JSON-LD` structured data.
- Scrapes and processes user reviews from the DOM for natural language sentiment analysis.
- Uses the stored ZIP code (persisted with `chrome.storage.sync`) to:
  - Check Open Library for book availability using ISBN or title/author fallback.
  - Generate a WorldCat search query for location-based availability across libraries.
- Classifies each review into positive, neutral, or negative using a lexicon-based NLP scoring algorithm.
- Visualizes sentiment distribution in a client-rendered Plotly.js bar chart.
- Extracts the most frequently mentioned keywords and review themes using token frequency filtering and stopword removal.

---

## Technical Highlights

- **Frontend Architecture**: Modular content and popup scripts with clear separation of concerns and message passing.
- **NLP Integration**: Client-side sentiment classification and keyword extraction without external dependencies.
- **API Consumption**: Structured use of Open Library REST APIs and WorldCat deep links with fallback mechanisms.
- **State Management**: Persistent storage and retrieval of user input via `chrome.storage.sync`.
- **DOM Manipulation**: Content script logic for parsing `ld+json` metadata and extracting review content.
- **Data Visualization**: Custom chart generation with Plotly.js to summarize classified sentiment distribution.
- **Chrome Extension Development**: Manifest V3 compliance with modular, scalable file structure and background interaction.

---

## Technologies Used

- **JavaScript (ES6+)**
- **Chrome Extensions API (Manifest V3)**
- **JSON-LD Parsing & DOM Scripting**
- **Plotly.js** for in-browser data visualization
- **Open Library API** for book availability
- **WorldCat Integration** for location-based library search
- **Lexicon-based NLP** (rule-based sentiment scoring)
- **Local storage** via `chrome.storage.sync`

---

## Architecture

**content.js (runs on Goodreads pages):**
- Extracts metadata (`title`, `author`, `ISBN`) from structured `ld+json` scripts
- Scrapes review content from DOM
- Sends extracted data to `popup.js` via `chrome.runtime` messaging

**popup.js (runs in extension UI):**
- Retrieves saved ZIP code from `chrome.storage.sync`
- Uses ISBN/title/author to:
  - Query Open Library API
  - Generate WorldCat URL for location-based search
- Applies rule-based sentiment scoring to user reviews
- Performs keyword extraction using stopword filtering and frequency analysis
- Renders sentiment summary bar chart and keyword list using Plotly.js

---

## Setup & Installation
1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/goodreads-companion.git
   cd goodreads-companion

2. Load the Extension in Chrome
   - Navigate to chrome://extensions
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select the project root 

---

## Example Interface

![Example 1](img1.png "Initial Page Load. Save location (for next visit) and check availability")

![Example 3](img3.png "Link opens to WorldCat API")

![Example 4](img4.png "NLP + Sentiment Analysis")

---

## Sentiment Analysis

- A simple lexicon-based classifier is implemented for local sentiment analysis.
- Review text is tokenized and compared against curated sets of positive and negative keywords.
- Each review receives a numerical score:
  - Positive if score > 0
  - Neutral if score = 0
  - Negative if score < 0
- Results are visualized as a bar chart using Plotly.js.
- This approach prioritizes privacy, performance, and zero-dependency deployment.

---

## Keyword Extraction

- Stopword filtering based on an extended domain-specific stopword list.
- Frequency analysis across all review tokens.
- Top N frequent nontrivial keywords are surfaced as dominant review themes.
- Book title and author words are dynamically excluded.

---

## API Details

**Open Library (Book Availability)**  
- ISBN Lookup:  
  `https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data`  
- Title/Author Fallback:  
  `https://openlibrary.org/search.json?title={title}&author={author}&limit=3`

**WorldCat (Library Search)**  
- Location-based query via dynamic URL:  
  `https://www.worldcat.org/search?q={title}+{author}`

---

## Security & Privacy

- All processing occurs in-browser; no data is transmitted to third-party servers.
- The extension does not track user behavior, install background listeners, or require external authentication.
- Book data and ZIP code are only used for availability lookups and stored locally using Chrome's secure storage API.

---

## Potential Upgrades

- Upgrade sentiment model to a transformer-based classifier (e.g., DistilBERT via Hugging Face).
- Enable caching of book lookups and review summaries.
- Implement bookmarks or reading list functionality with export options.

---

## License

MIT License © Ananya Dua