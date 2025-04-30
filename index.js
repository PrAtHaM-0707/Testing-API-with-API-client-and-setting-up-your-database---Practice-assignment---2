const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const DATA_PATH = path.join(__dirname, 'data.json');

const getBooks = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveBooks = (books) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(books, null, 2));
};

app.post('/books', (req, res) => {
  const { book_id, title, author, genre, year, copies } = req.body;

  if (!book_id || !title || !author || !genre || !year || !copies) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const books = getBooks();

  if (books.find(book => book.book_id == book_id)) {
    return res.status(409).json({ error: 'Book with this ID already exists.' });
  }

  const newBook = { book_id, title, author, genre, year, copies };
  books.push(newBook);
  saveBooks(books);

  res.status(201).json(newBook);
});

app.get('/books', (req, res) => {
  const books = getBooks();
  res.json(books);
});

app.get('/books/:id', (req, res) => {
  const books = getBooks();
  const book = books.find(b => b.book_id == req.params.id);

  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  res.json(book);
});

app.put('/books/:id', (req, res) => {
  const books = getBooks();
  const index = books.findIndex(b => b.book_id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  const updatedBook = { ...books[index], ...req.body };
  books[index] = updatedBook;
  saveBooks(books);

  res.json(updatedBook);
});

app.delete('/books/:id', (req, res) => {
  let books = getBooks();
  const index = books.findIndex(b => b.book_id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  const removed = books.splice(index, 1);
  saveBooks(books);

  res.json({ message: 'Book deleted successfully.', book: removed[0] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
