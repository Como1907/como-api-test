const admin = require("firebase-admin");
const serviceAccount = require("./como-app-staging-firebase-adminsdk-umm3c-4b99f6558e.json");
//const serviceAccount = require("./provate-key_file.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https:///como-app-staging.firebaseio.com",
  //databaseURL: "https:///production-name.com",
});

const db = admin.firestore();
const firestore = admin.firestore;

module.exports = {
  db,
  firestore
};
