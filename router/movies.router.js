import express from "express";
import { client } from "../index.js";
import { auth } from "../middleware/auth.js";
import { ObjectId } from "mongodb";

const movies = express.Router();

//GET movies list from API
movies.get("/", auth, async (req, res) => {
  const getAllmovies = await client
    .db("imdb")
    .collection("movies")
    .find()
    .toArray();

  getAllmovies
    ? res.send(getAllmovies)
    : res.status(401).send({ message: "Failed to load movies" });
});

//GET Full cast of a specific movie

movies.get("/:id", async (req, res) => {
  const { id } = req.params;
  const getMoviefromDB = await client
    .db("imdb")
    .collection("movies")
    .findOne({ _id: new ObjectId(id) });
  getMoviefromDB
    ? res.send(getMoviefromDB)
    : res.status(401).send({ message: "Failed to load the subject movie" });
});

movies.post("/", async (req, res) => {
  const data = req.body;
  console.log(data);
  const newData = await client.db("imdb").collection("movies").insertMany(data);
  newData
    ? res.send({ message: "Movies inserted successfully" })
    : res.status(401).send({ message: "failed to load movies" });
});

movies.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, year, summary } = req.body;
  const checkIdfromDB = await client
    .db("imdb")
    .collection("movies")
    .findOne({ _id: new ObjectId(id) });
  if (!checkIdfromDB) res.status(401).send({ message: "Movie doesn't exist" });
  else {
    const editedMovie = await client
      .db("imdb")
      .collection("movies")
      .updateOne({ _id: new ObjectId(id) }, { $set: { name, year, summary } });
    editedMovie
      ? res.send({ message: "Details updated successfully" })
      : res.status(401).send({ message: "Failed to update movie" });
  }
});

movies.post("/", async (req, res) => {
  const { name, year, summary, poster, actors, producer, director } = req.body;
  const newMovie = await client.db("imdb").collection("movies").insertMany({
    name,
    year,
    summary,
    poster,
    actors,
    producer,
    director,
  });
  newMovie
    ? res.send({ message: "New Movie added successfully" })
    : res.status(401).send({ message: "failed to load new movie" });
});

export default movies;
