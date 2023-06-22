import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
dotenv.config();
import movies from "./router/movies.router.js";
const app = express();

const PORT = 4000;

const MONGO_URL = process.env.MONGO_URL;
export const client = new MongoClient(MONGO_URL);
await client.connect();

app.use(express.json());
app.use(cors());
app.use("/movies", movies);

app.get("/", (request, response) => {
  response.send({ message: "Welcome to IMDB Clone !" });
});

async function generateHashedPasswords(password) {
  const no_of_rounds = 10;
  const salt = await bcrypt.genSalt(no_of_rounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  // console.log(salt);
  // console.log(hashedPassword);
  return hashedPassword;
}

//signup operation

app.post("/signup", async (request, response) => {
  const { username, password } = request.body;
  const hashedpassword = await generateHashedPasswords(password);
  const userfromDB = await client.db("imdb").collection("users").insertOne({
    username: username,
    password: hashedpassword,
  });
  userfromDB
    ? response.send({ message: "Signup Successful" })
    : response.send({ message: "Failed to sign up" });
});

//signin operation

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const userfromDB = await client
    .db("imdb")
    .collection("users")
    .findOne({ username: username });

  if (!userfromDB) response.send({ message: "user not found" });
  else {
    const storedpassword = userfromDB.password;

    const isPasswordvalid = await bcrypt.compare(password, storedpassword);

    if (!isPasswordvalid) {
      response.status(404).send({ message: "Invalid Password" });
    }
    const token = jwt.sign({ id: userfromDB._id }, process.env.SECRET_KEY);
    response.send({
      message: "Success",
      username : userfromDB.username,
      token,
    });
  }
});

app.listen(PORT, () => {
  console.log(`The Server is running on the port ${PORT}`);
});
