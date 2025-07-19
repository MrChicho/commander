document.addEventListener('DOMContentLoaded', () => {
  const decksContainer = document.getElementById('decks');
  function renderDecks(decks) {
    if (!decks || decks.length === 0) {
      decksContainer.innerHTML = '<p>No decks yet.</p>';
      return;
    }
    decksContainer.innerHTML = '';
    decks.forEach(deck => {
      const div = document.createElement('div');
      div.className = 'deck-card';
      div.innerHTML = `
        <h3>${deck.name}</h3>
        <p>${deck.description || ''}</p>
        <small>Created: ${deck.created_at ? new Date(deck.created_at).toLocaleDateString() : ''}</small>
        <div class="actions">
          <a href="/deck.html?id=${deck.id}" style="text-decoration:none;">🧙 View</a>
          <button onclick="deleteDeck(${deck.id}, this)">🗑 Delete</button>
        </div>
      `;
      decksContainer.appendChild(div);
    });
  }

  function loadDecks() {
    fetch('/api/get_decks.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.decks)) {
          renderDecks(data.decks);
        } else {
          decksContainer.innerHTML = '<p>Error loading decks.</p>';
        }
      })
      .catch(() => {
        decksContainer.innerHTML = '<p>Error connecting to server.</p>';
      });
  }

  window.deleteDeck = function(deckId, btn) {
    if (!confirm('Are you sure you want to delete this deck?')) return;
    fetch('/api/delete_deck.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deckId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          btn.closest('.deck-card').remove();
        } else {
          alert('Failed to delete deck.');
        }
      })
      .catch(() => {
        alert('Network error.');
      });
  };

  // Deck creation
  document.getElementById('deckForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const description = document.getElementById('description').value.trim();
    fetch('/api/create_deck.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById('deckForm').reset();
          loadDecks();
        } else {
          alert('Error creating deck: ' + data.error);
        }
      });
  });

  // Deck search
  document.getElementById('searchInput').addEventListener('input', function() {
    const q = this.value.toLowerCase();
    fetch('/api/get_decks.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.decks)) {
          const filtered = data.decks.filter(deck =>
            deck.name.toLowerCase().includes(q) || (deck.description || '').toLowerCase().includes(q)
          );
          renderDecks(filtered);
        }
      });
  });

  loadDecks();
});

function deleteDeck(deckId, cardElement) {
  if (!confirm('Are you sure you want to delete this deck?')) return;

  fetch('/api/delete_deck.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: deckId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        cardElement.remove();
      } else {
        alert('Failed to delete deck.');
      }
    })
    .catch(() => {
      alert('Network error.');
    });
}
