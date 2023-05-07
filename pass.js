const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
const PORT = 3002;

const serviceAccount = require("./serviceKey/servicekey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const passesCollection = db.collection("passes");

app.use(express.json());

app.post("/passQuery", async (req, res) => {
  const email = req.body.email;

  try {
    const query = passesCollection.where("email", "==", email);
    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      const docRef = await passesCollection.add({ email });
      const newDocId = docRef.id;
      res.json({ message: "New pass created", passId: newDocId });
    } else {
      const passId = querySnapshot.docs[0].id;
      res.json({ message: "Pass previously created", passId });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting pass");
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
