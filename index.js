import express from "express";
import cors from 'cors';
import setupDB from "./db/db.js";
import login_router from "./user/login_page/login_register.control.js";
import journal_router from "./user/journal/journal.control.js";
const port = process.env.PORT || 3001;
const app = express();

app.use(express.json());
setupDB();  
app.use(cors());

app.use("/auth", login_router);
app.use("/journal", journal_router);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});