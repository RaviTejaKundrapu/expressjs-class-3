const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Is Started and Running ...");
    });
  } catch (error) {
    console.log(`Db Error : ${error.message}`);
    process.exit(1);
  }
};
initializeServerAndDb();

//API getAllBooks
app.get("/books/", async (request, response) => {
  const getallbooks = `
    SELECT * FROM book ORDER BY book_id;`;
  const booksArray = await db.all(getallbooks);
  response.send(booksArray);
});

//API getSearchedBookById
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const getsearchedbook = `
  SELECT * FROM book WHERE book_id=${bookId};`;
  const displayBook = await db.get(getsearchedbook);
  response.send(displayBook);
});

//API TOCreateNewBook
app.post("/books", async (request, response) => {
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
  const addBookToDb = await db.run(addBookQuery);
  const bookId = addBookToDb.lastID;
  response.send({ bookId: bookId });
});

//API To Update book Details
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const updateBookQuery = `
  UPDATE
   book
  SET
   title='${title}',
   author_id=${authorId},
   rating=${rating},
   rating_count=${ratingCount},
   review_count=${reviewCount},
   description='${description}',
   pages=${pages},
   date_of_publication='${dateOfPublication}',
   edition_language='${editionLanguage}',
   price=${price},
   online_stores='${onlineStores}'
  WHERE
   book_id = ${bookId};`;
  await db.run(updateBookQuery);
  response.send("Book Updated Successfully");
});

// API delete a book
app.delete("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookQuery = `SELECT * FROM book WHERE book_id=${bookId}`;
  await db.run(deleteBookQuery);
  response.send("Book Deleted Successfully");
});

//API To get all books by author id
app.get("/authors/:authorId/books", async (request, response) => {
  const { authorId } = request.params;
  const authorsBooksById = `select * from book where author_id=${authorId};`;
  const authorBooksArray = await db.all(authorsBooksById);
  response.send(authorBooksArray);
});
