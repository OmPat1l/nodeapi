const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
const PORT = 3001;

const serviceAccount = require("./serviceKey/servicekey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const usersCollection = db.collection("users");

app.use(express.json());
app.get("/users", async (req, res) => {
  try {
    const snapshot = await usersCollection.get();
    const users = snapshot.docs.map((doc) => doc.data());
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting users");
  }
});
app.post("/verify", async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const query = usersCollection
    .where("email", "==", email)
    .where("password", "==", password);
  const querySnapshot = await query.get();

  if (querySnapshot.empty) {
    let message = { message: "Invalid email or password" };

    res.status(401).send(message);
  } else {
    // const user = querySnapshot.docs[0].data();
    let message = { message: true };
    res.status(200).send(message);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
