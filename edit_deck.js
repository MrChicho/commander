// edit_deck.js
// Handles card search, add, and real-time deck card list for edit_deck.html

// Utility to get query param
function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const deckId = getQueryParam('deck_id');
let deckCards = [];

async function fetchDeckInfo() {
  // Optionally fetch deck name/description for header
  // Not implemented here, but can be added if needed
}

async function fetchDeckCards() {
  const res = await fetch(`/api/list_deck_cards.php?deck_id=${deckId}`);
  const data = await res.json();
  if (data.success) {
    deckCards = data.cards;
    renderDeckCards();
  } else {
    document.getElementById('deckCardsList').innerHTML = `<p>Error: ${data.error}</p>`;
  }
}

function renderDeckCards() {
  const container = document.getElementById('deckCardsList');
  if (!deckCards || deckCards.length === 0) {
    container.innerHTML = '<em>No cards in this deck yet.</em>';
    return;
  }
  container.innerHTML = deckCards.map(card => {
    const imgSrc = card.image_uri ? card.image_uri :
      (card.scryfall_id ? `https://cards.scryfall.io/normal/front/${card.scryfall_id.slice(0,1)}/${card.scryfall_id.slice(1,3)}/${card.scryfall_id}.jpg` : '');
    return `
      <div class="deck-card">
        <img src="${imgSrc}" alt="${card.card_name}">
        <div class="card-name">${card.card_name}</div>
        <div class="card-qty">Qty: ${card.quantity}</div>
      </div>
    `;
  }).join('');
}

async function searchCards(q) {
  const res = await fetch(`/api/search_cards.php?q=${encodeURIComponent(q)}`);
  const data = await res.json();
  if (data.success && data.cards.length > 0) {
    renderSearchResults(data.cards);
  } else {
    document.getElementById('cardSearchResults').innerHTML = '<em>No results</em>';
  }
}

function renderSearchResults(cards) {
  const container = document.getElementById('cardSearchResults');
  container.innerHTML = cards.map(card => `
    <div class="search-card-result">
      <img src="https://cards.scryfall.io/normal/front/${card.scryfall_id.slice(0,1)}/${card.scryfall_id.slice(1,3)}/${card.scryfall_id}.jpg" alt="${card.NAME}">
      <div style="flex:1;">
        <div><strong>${card.NAME}</strong> <small style="color:#aaa;">[${card.set_code}]</small></div>
      </div>
      <button onclick="addCardToDeck('${card.scryfall_id}', '${card.NAME.replace(/'/g, "\\'")}')">Add</button>
    </div>
  `).join('');
}

window.addCardToDeck = async function(scryfall_id, cardName) {
  const res = await fetch('/api/add_card_to_deck.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deck_id: deckId, scryfall_id, card_name: cardName, quantity: 1 })
  });
  const data = await res.json();
  if (data.success) {
    await fetchDeckCards();
  } else {
    alert('Error adding card: ' + (data.error || 'Unknown error'));
  }
}

document.addEventListener('DOMContentLoaded', function() {
  fetchDeckCards();
  const searchInput = document.getElementById('cardSearchInput');
  const searchBtn = document.getElementById('cardSearchBtn');
  searchInput.disabled = false;
  searchBtn.disabled = false;
  searchBtn.addEventListener('click', () => {
    const q = searchInput.value.trim();
    if (q.length < 2) return;
    searchCards(q);
  });
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q.length < 2) return;
      searchCards(q);
    }
  });
});
