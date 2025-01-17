const express = require('express');
const axios = require('axios');
const router = express.Router();

// Free APIs
const DATAMUSE_API = 'https://api.datamuse.com/words?rel_syn=';
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Fetch synonyms using Datamuse API
router.get('/synonyms', async (req, res) => {
    const word = req.query.word;
    if (!word) {
        return res.status(400).json({ error: 'No word provided.' });
    }

    try {
        const response = await axios.get(`${DATAMUSE_API}${encodeURIComponent(word)}`);
        const synonyms = response.data.map(entry => entry.word); // Extract synonyms
        res.json(synonyms);
    } catch (error) {
        console.error('Error fetching synonyms:', error.message);
        res.status(500).json({ error: 'Failed to fetch synonyms.' });
    }
});

// Fetch definitions using Free Dictionary API
router.get('/definitions', async (req, res) => {
    const word = req.query.word;
    if (!word) {
        return res.status(400).json({ error: 'No word provided.' });
    }

    try {
        const response = await axios.get(`${DICTIONARY_API}${encodeURIComponent(word)}`);
        const definitions = response.data[0]?.meanings.flatMap(meaning =>
            meaning.definitions.map(def => def.definition)
        ); // Extract definitions
        res.json(definitions || []);
    } catch (error) {
        console.error('Error fetching definitions:', error.message);
        res.status(500).json({ error: 'Failed to fetch definitions.' });
    }
});

module.exports = router;
