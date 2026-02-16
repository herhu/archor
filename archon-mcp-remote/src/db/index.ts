import pgPromise from "pg-promise";

const pgp = pgPromise();

// Singleton DB instance
// In a larger app, you'd export a class or interface.
// For now, we export the connected 'db' object.

let db: pgPromise.IDatabase<any>;

export const getDb = () => {
  if (!db) throw new Error("DB not connected. Call connect() first.");
  return db;
};

export const database = {
  connect(url: string) {
    if (db) return db;
    db = pgp(url);
    // basic connectivity test
    return db.connect().then((obj) => {
      obj.done(); // success, release connection
      // eslint-disable-next-line no-console
      console.log("Database connected");
      return db;
    });
  },
  close() {
    return pgp.end();
  },
  // Re-export methods for convenience if needed,
  // or just use getDb() in repositories.
  get instance() {
    return getDb();
  },
  // Proxy common methods
  one: <T>(query: string, values?: any) => getDb().one<T>(query, values),
  oneOrNone: <T>(query: string, values?: any) =>
    getDb().oneOrNone<T>(query, values),
  many: <T>(query: string, values?: any) => getDb().many<T>(query, values),
  manyOrNone: <T>(query: string, values?: any) =>
    getDb().manyOrNone<T>(query, values),
  none: (query: string, values?: any) => getDb().none(query, values),
};

// simpler export for imports
export { database as db };
