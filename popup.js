const zipInput = document.getElementById('zip');
const saveBtn = document.getElementById('save-location');
const checkBtn = document.getElementById('check-availability');
const bookTitleEl = document.getElementById('book-title');
const bookAuthorEl = document.getElementById('book-author');
const availabilityStatusEl = document.getElementById('availability-status');
const worldcatSection = document.getElementById('worldcat-section');
const worldcatButton = document.getElementById('worldcat-button');
const summaryTextEl = document.getElementById('summary-text');
const keywordsListEl = document.getElementById('keywords-list');

let userZip = null;
let currentBook = null;

chrome.storage.sync.get(['userZip'], (result) => {
  if (result.userZip) {
    userZip = result.userZip;
    zipInput.value = userZip;
  }
});

async function requestBookInfoAndReviews() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, { action: 'getBookInfo' }, (response) => {
      resolve(response || null);
    });
  });
}

function updateBookInfoUI(book) {
  if (!book || !book.title) {
    bookTitleEl.textContent = 'No book detected on this page.';
    bookAuthorEl.textContent = '';
    currentBook = null;
    worldcatSection.style.display = 'none';
  } else {
    bookTitleEl.textContent = book.title;
    bookAuthorEl.textContent = book.author || '';
    currentBook = book;

    const query = encodeURIComponent(`${book.title} ${book.author || ''}`);
    const url = `https://www.worldcat.org/search?q=${query}`;
    worldcatButton.onclick = () => window.open(url, '_blank');
    worldcatSection.style.display = 'flex';
  }
}

saveBtn.addEventListener('click', () => {
  const zip = zipInput.value.trim();
  if (!zip) {
    alert('Please enter a valid ZIP/postal code.');
    return;
  }
  userZip = zip;
  chrome.storage.sync.set({ userZip }, () => {
    alert(`Location saved: ${userZip}`);
  });
});

checkBtn.addEventListener('click', async () => {
  if (!userZip) {
    availabilityStatusEl.textContent = 'Please enter and save your ZIP/postal code first.';
    return;
  }
  if (!currentBook) {
    availabilityStatusEl.textContent = 'No book detected to check.';
    return;
  }

  availabilityStatusEl.textContent = 'Checking availability...';

  try {
    if (currentBook.isbn) {
      const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${currentBook.isbn}&format=json&jscmd=data`;
      const res = await fetch(url);
      const data = await res.json();
      const key = `ISBN:${currentBook.isbn}`;
      if (data[key]) {
        availabilityStatusEl.textContent = `Found in Open Library.\nTry your library with ISBN: ${currentBook.isbn}`;
      } else {
        availabilityStatusEl.textContent = 'Book not found by ISBN.';
      }
    } else {
      const title = encodeURIComponent(currentBook.title);
      const author = encodeURIComponent(currentBook.author || '');
      const url = `https://openlibrary.org/search.json?title=${title}&author=${author}&limit=3`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.numFound > 0) {
        availabilityStatusEl.textContent = `Found ${data.numFound} matches.\nTry searching by title at your library.`;
      } else {
        availabilityStatusEl.textContent = 'No matches found.';
      }
    }
  } catch (err) {
    availabilityStatusEl.textContent = 'Error checking availability.';
    console.error(err);
  }
});


const stopwords = new Set([
  'the', 'more', 'when', 'how', 'and', 'a', 'to', 'is', 'it', 'in', 'of', 'this', 'that', 'i', 'was',
  'for', 'with', 'as', 'but', 'on', 'not', 'are', 'they', 'you', 'my', 'have', 'be', 'so', 'if', 'or',
  'at', 'from', 'by', 'an', 'we', 'all', 'had', 'his', 'her', 'she', 'he', 'will', 'one', 'what',
  'about', 'like', 'just', 'out', 'up', 'has', 'can', 'me', 'no', 'do', 'did', 'much', 'does',
  'would', 'should', 'could', 'been', 'am', 'were', 'than', 'then', 'there', 'here', 'who', 'whom',
  'which', 'because', 'too', 'very', 'also', 'into', 'over', 'such', 'only', 'before', 'after',
  'again', 'why', 'while', 'where', 'each', 'any', 'both', 'between', 'own', 'same', 'few', 'most',
  'other', 'some', 'these', 'those', 'him', 'its', 'our', 'their', 'them', 'your', 'yours', 'ours',
  'theirs', 'really', 'actually', 'maybe', 'perhaps', 'probably', 'definitely', 'honestly',
  'basically', 'kind', 'kinda', 'sort', 'sorta', 'lot', 'lots', 'bit', 'bits', 'little', 'thing',
  'things', 'know', 'even', 'guess', 'que',
  'opinion', 'opinions', 'thought', 'thoughts', 'feel', 'felt', 'feeling', 'feelings', 'think',
  'thanks', 'thank', 'reviewer',
  'recommend', 'recommended', 'recommending', 'recommends', 'recommendation', 'recommendations',
  'rating', 'ratings', 'rated', 'rate', 'star', 'stars', 'starred',
  'good', 'great', 'excellent', 'amazing', 'awesome', 'nice', 'cool', 'bad', 'awful', 'terrible',
  'poor', 'mediocre', 'boring', 'okay', 'meh', 'fine', 'fun', 'funny', 'interesting', 'exciting',
  'excited', 'excites', 'bored', 'boredom', 'love', 'loved', 'loves', 'hate', 'hated', 'hates',
  'enjoy', 'enjoyed', 'enjoys', 'disappoint', 'disappointed', 'disappoints',
  'read', 'reading', 'book', 'books', 'title', 'series', 'novel', 'chapter', 'chapters', 'page',
  'pages', 'cover', 'copy', 'edition', 'arc', 'version', 'story', 'stories', 'blurb', 'synopsis',
  'beginning', 'middle', 'end', 'ending', 'start', 'starts', 'started', 'starting', 'begin',
  'begins', 'began', 'finish', 'finishes', 'finished', 'finishing', 'first', 'second', 'third',
  'last', 'next', 'afterwards', 'beforehand',
  'character', 'characters', 'plot', 'plots', 'theme', 'themes', 'dialogue', 'dialogues',
  'prose', 'tone', 'tones', 'style', 'styles', 'narrative', 'narratives', 'setting', 'settings',
  'scene', 'scenes', 'pace', 'pacing', 'trope', 'tropes', 'world', 'worlds',
  'spoiler', 'spoilers', 'spoiling', 'spoiled', 'warning', 'warnings', 'review', 'reviews',
  'reviewing', 'reviewed', 'critic', 'critics', 'critique', 'critiques', 'criticized',
  'criticizing', 'criticize', 'criticizes', 'comment', 'comments','show', 'likes', 'dislikes',
  'laugh', 'laughing', 'new', 'never', 'now', 'laughter', 'girl', 'boy', 'well', 'many', 'way', 'time', 'people', 'che','don', 'joke', 'jokes', 'joking', 'joked',
  'goodreads', 'netgalley'
]);



function simpleSentimentScore(text) {
  const positives = ['good', 'great', 'love', 'excellent', 'amazing', 'favorite', 'best', 'wonderful', 'enjoyed', 'beautiful', 'liked', 'awesome'];
  const negatives = ['bad', 'boring', 'waste', 'poor', 'disappoint', 'terrible', 'hate', 'annoying', 'worst', 'slow', 'confusing'];

  const words = text.toLowerCase().split(/\W+/);
  let score = 0;
  words.forEach(w => {
    if (positives.includes(w)) score++;
    else if (negatives.includes(w)) score--;
  });
  return score;
}

function extractTopThemes(reviews, topN = 7) {

   if (currentBook) {
    tokenizeToStopwords(currentBook.title || '').forEach(w => stopwords.add(w));
    tokenizeToStopwords(currentBook.author || '').forEach(w => stopwords.add(w));
  }
  const freq = {};

  reviews.forEach(review => {
    const words = review.toLowerCase().split(/\W+/);
    words.forEach(word => {
      if (
        word.length > 2 &&
        !stopwords.has(word)
      ) {
        freq[word] = (freq[word] || 0) + 1;
      }
    });
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

function tokenizeToStopwords(text) {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 1);
}

function analyzeReviewsAndRender(reviews) {
  if (!reviews || reviews.length === 0) {
    summaryTextEl.textContent = 'No reviews available.';
    keywordsListEl.innerHTML = '';

    Plotly.purge('sentiment-chart');
    return;
  }

  let pos = 0, neg = 0, neu = 0;
  reviews.forEach(r => {
    const score = simpleSentimentScore(r);
    if (score > 0) pos++;
    else if (score < 0) neg++;
    else neu++;
  });

  const total = reviews.length;
  const summary = [
    `Total Reviews Analyzed: ${total}; `,
    `Positive: ${pos}; `,
    `Neutral: ${neu}; `,
    `Negative: ${neg}`
  ].join('\n');

  summaryTextEl.textContent = summary;

  const themes = extractTopThemes(reviews, 7);
  keywordsListEl.innerHTML = '';
  themes.forEach(word => {
    const li = document.createElement('li');
    li.textContent = word;
    keywordsListEl.appendChild(li);
  });


  const data = [{
    x: ['Positive', 'Neutral', 'Negative'],
    y: [pos, neu, neg],
    type: 'bar',
    marker: {
      color: ['#5e17eb', '#5e17eb', '#5e17eb']
    }
  }];

  const layout = {
    margin: { t: 20, b: 30, l: 40, r: 20 },
    yaxis: { title: 'Number of Reviews' },
    xaxis: { title: 'Sentiment' }
  };

  Plotly.newPlot('sentiment-chart', data, layout, {displayModeBar: false, responsive: true});
}

requestBookInfoAndReviews().then((data) => {
  if (!data) {
    updateBookInfoUI(null);
    analyzeReviewsAndRender([]);
    return;
  }
  updateBookInfoUI(data.bookInfo);
  analyzeReviewsAndRender(data.reviews);
});