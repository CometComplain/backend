import session from 'express-session';
import MongoDBStoreFactory from 'connect-mongodb-session';

const MongoDBStore = MongoDBStoreFactory(session);

const createSessionStore = () => {
  const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: 'sessions',
  });

  store.on('error', (error) => {
    console.log(error);
  });

  return store;
};

export default createSessionStore;