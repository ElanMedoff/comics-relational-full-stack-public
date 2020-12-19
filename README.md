# Comics-Relational-Full-Stack

Install the dependencies:

```bash
npm install
```

Run the server and client concurrently:

```bash
npm run dev
```

A mini-app built for EN.601.315 (Databases, http://www.cs.jhu.edu/~yarowsky/cs415.html).

Overview:

1. Global state with useContext + useState to store user-created lists and user information
1. Sessions manually implemented
   - On login, creates a session id, stores it in the db with an expiration, sends
     it back to the client in a same-site cookie.
   - Any sensitive calls route through a middleware auth function to check the
     session id is stored in the db and not yet expired.
   - If the call references a user-created list, the auth function checks that the
     list belongs to the user in the cookie.
1. Comics and info are scraped from the Marvel API (https://developer.marvel.com/docs)
   and inserted into the SQLite db.

Shortcomings:

1. Search results are limited to 200. Removing the limit and including some kind of
   pagination would be cool.
1. The order of the search results are left up to SQL. It would be interesting to
   influence the order using data from the user-created lists?
1. The design is pretty barebones and isn't mobile-responsive.
