// Deck viewer and card adder logic

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const deckId = getQueryParam('id');
let deckMeta = {};
let deckCards = [];

async function fetchDeck() {
  const res = await fetch(`/api/get_deck.php?id=${deckId}`);
  const data = await res.json();
  if (data.success) {
    deckMeta = data.deck;
    deckCards = data.cards;
    renderDeck();
  } else {
    document.getElementById('deckSections').innerHTML = `<p>Error: ${data.error}</p>`;
  }
}

function renderDeck() {
  document.getElementById('deckTitle').innerText = deckMeta.name || 'Deck';
  document.getElementById('deckMeta').innerHTML = `<p>${deckMeta.description || ''}</p>`;
  // Group cards by type
  const sections = {};
  for (const card of deckCards) {
    const type = card.card_type || 'Other';
    if (!sections[type]) sections[type] = [];
    sections[type].push(card);
  }
  const deckSections = document.getElementById('deckSections');
  deckSections.innerHTML = '';
  Object.entries(sections).forEach(([type, cards]) => {
    const section = document.createElement('div');
    section.className = 'deck-section';
    section.innerHTML = `<h3>${type}</h3>
      <div class="card-list">
        ${cards.map(card => `
          <div class="card-item">
            <img src="${card.image_uri || ''}" alt="${card.card_name}">
            <div class="card-name">${card.card_name}</div>
            <div class="card-qty">Qty: ${card.quantity}</div>
          </div>
        `).join('')}
      </div>`;
    deckSections.appendChild(section);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetchDeck();
  // Userbar
  fetch('/userbar.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('userbarContainer').innerHTML = html;
      if (window.setupUserBar) window.setupUserBar();
    });

  // Enable card search field for deck edit page
  const cardSearchInput = document.getElementById('cardSearchInput');
  if (cardSearchInput) cardSearchInput.disabled = false;

  // Add card form
  document.getElementById('addCardForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cardName = document.getElementById('cardSearchInput').value.trim();
    const quantity = parseInt(document.getElementById('cardQtyInput').value, 10) || 1;
    if (!cardName) return;
    // Fetch card info from Scryfall for type/scryfall_id
    const scryRes = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
    if (!scryRes.ok) {
      document.getElementById('addCardStatus').innerText = 'Card not found!';
      return;
    }
    const cardData = await scryRes.json();
    const cardType = cardData.type_line || '';
    const scryfall_id = cardData.id;
    const image_uri = cardData.image_uris ? cardData.image_uris.normal : '';
    // Add card to deck
    const res = await fetch('/api/add_card.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deck_id: deckId, card_name: cardName, card_type: cardType, scryfall_id, image_uri, quantity })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('addCardStatus').innerText = 'Added!';
      document.getElementById('addCardForm').reset();
      fetchDeck();
    } else {
      document.getElementById('addCardStatus').innerText = data.error || 'Error';
    }
    setTimeout(() => { document.getElementById('addCardStatus').innerText = ''; }, 2000);
  });
});
