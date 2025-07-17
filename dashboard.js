// Navigates to edit_deck.html with the selected deck id
window.editDeck = function(deckId) {
  window.location.href = `edit_deck.html?deck_id=${deckId}`;
}
function setupUserBar() {
  async function checkSession() {
    const res = await fetch('/api/me.php');
    const data = await res.json();
    const userStatus = document.getElementById('userStatus');
    const logoutBtn = document.getElementById('logoutBtn');

    if (data.logged_in) {
      userStatus.innerText = `ðŸ‘‹ ${data.email}`;
      logoutBtn.style.display = 'inline-block';
    } else {
      userStatus.innerHTML = `Not logged in. <a href="/login.html">Login</a> or <a href="/register.html">Register</a>`;
      logoutBtn.style.display = 'none';
    }
  }

  checkSession();
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/logout.php');
      window.location.href = '/login.html';
    });
  }
}
let allDecks = [];

function renderDecks() {
  const searchInput = document.getElementById('searchInput');
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  const decksContainer = document.getElementById('decks');
  if (!decksContainer) return;
  const filtered = allDecks.filter(deck =>
    deck.name.toLowerCase().includes(search) || (deck.description || '').toLowerCase().includes(search)
  );
  if (filtered.length === 0) {
    decksContainer.innerHTML = '<p>No decks yet.</p>';
  } else {
    decksContainer.innerHTML = '';
    filtered.forEach(deck => {
      const div = document.createElement('div');
      div.className = 'deck';
      div.style = 'background:#222;padding:1rem 1.5rem;border-radius:8px;box-shadow:0 2px 8px #0002;margin-bottom:1.2rem;border:1px solid #333;';
      div.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h3 style="margin:0;">${deck.name}</h3>
            <p style="margin:0 0 0.5rem 0;color:#aaa;">${deck.description || ''}</p>
            <small>Created: ${deck.created_at}</small>
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button class="editBtn" onclick="editDeck(${deck.id})">Edit</button>
            <button class="deleteBtn" onclick="deleteDeck(${deck.id})">Delete</button>
          </div>
        </div>
      `;
      decksContainer.appendChild(div);
    });
  }
}

async function loadDecks() {
  const res = await fetch('/api/get_decks.php');
  const data = await res.json();
  if (data.success) {
    allDecks = data.decks;
    renderDecks();
    afterDecksLoaded();
  } else {
    document.getElementById('decks').innerHTML = `<p>Error: ${data.error}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const deckForm = document.getElementById('deckForm');
  if (deckForm) {
    deckForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const description = document.getElementById('description').value.trim();

      const res = await fetch('/api/create_deck.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });

      const data = await res.json();
      if (data.success) {
        document.getElementById('deckForm').reset();
        loadDecks();
      } else {
        alert('Error creating deck: ' + data.error);
      }
    });
  }
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', renderDecks);
  }
});

window.deleteDeck = async function(id) {
  if (!confirm('Delete this deck?')) return;

  const res = await fetch('/api/delete_deck.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deck_id: id })
  });

  const data = await res.json();
  if (data.success) {
    loadDecks();
  } else {
    alert('Error: ' + data.error);
  }
}



// Card Search/Add UI
let selectedDeckId = null;
function selectFirstDeck() {
  if (allDecks.length > 0) {
    selectedDeckId = allDecks[0].id;
  } else {
    selectedDeckId = null;
  }
}
function afterDecksLoaded() {
  selectFirstDeck();
}

document.addEventListener('DOMContentLoaded', function() {
  const cardSearchInput = document.getElementById('cardSearchInput');
  const cardSearchResults = document.getElementById('cardSearchResults');
  let cardSearchTimeout = null;
  cardSearchInput.addEventListener('input', function() {
    clearTimeout(cardSearchTimeout);
    const q = cardSearchInput.value.trim();
    if (q.length < 2) {
      cardSearchResults.innerHTML = '';
      return;
    }
    cardSearchResults.innerHTML = '<em>Searching...</em>';
    cardSearchTimeout = setTimeout(async () => {
      const res = await fetch(`/api/search_cards.php?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.cards.length > 0) {
        cardSearchResults.innerHTML = data.cards.map(card => {
          const safeName = card.NAME.replace(/"/g, '&quot;');
          return `<div style="padding:4px 0;border-bottom:1px solid #333;display:flex;align-items:center;justify-content:space-between;">
            <span><strong>${card.NAME}</strong> <small style='color:#aaa;'>[${card.set_code}]</small></span>
            <button style='background:#00cc88;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;' onclick="addCardToDeck('${card.scryfall_id}', '${safeName}')">Add</button>
          </div>`;
        }).join('');
      } else {
        cardSearchResults.innerHTML = '<em>No results</em>';
      }
    }, 300);
  });
});

window.addCardToDeck = async function(scryfall_id, cardName) {
  if (!selectedDeckId) {
    alert('Please create or select a deck first.');
    return;
  }
  const quantity = 1;
  const res = await fetch('/api/add_card_to_deck.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deck_id: selectedDeckId, scryfall_id, card_name: cardName, quantity })
  });
  const data = await res.json();
  if (data.success) {
    alert(`Added ${cardName} to deck!`);
  } else {
    alert('Error adding card: ' + (data.error || 'Unknown error'));
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Load userbar.html into #userbarContainer
  const userbarContainer = document.getElementById('userbarContainer');
  if (userbarContainer) {
    fetch('/userbar.html')
      .then(res => res.text())
      .then(html => {
        userbarContainer.innerHTML = html;
        // Try to call setupUserBar if it is defined in the loaded HTML
        if (window.setupUserBar) window.setupUserBar();
      });
  }

  loadDecks();
});
