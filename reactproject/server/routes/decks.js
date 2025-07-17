const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');

router.get('/', deckController.getDecks);
router.post('/', deckController.createDeck);
router.put('/:id', deckController.updateDeck);
router.delete('/:id', deckController.deleteDeck);

module.exports = router;
