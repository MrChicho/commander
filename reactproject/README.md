# Commander Deckbuilder Fullstack App

## Overview
This project is a fullstack web application for building and managing Commander decks. It features:
- **React frontend** (in `/client`)
- **Node.js/Express backend** (in `/server`)
- **MySQL database** for users and decks

## Features
- User registration, login, logout, and session check
- Deck CRUD (create, read, update, delete)
- User bar showing signed-in status

## Getting Started

### Backend
1. Copy `.env` in `/server` and fill in your MySQL credentials.
2. Run `npm install` in `/server`.
3. Start the backend: `node index.js`

### Frontend
1. Run `npm install` in `/client`.
2. Start the frontend: `npm start`

## Folder Structure
- `/client` - React app
- `/server` - Node.js/Express API

## Notes
- Make sure your MySQL server is running and accessible.
- Update CORS and session settings as needed for production.
