import mongoose from "mongoose";
// import gridfs from "mongoose-gridfs";

const setupDB = async () => {
  try {
    // console.log("here");
    await mongoose.connect(
      "mongodb+srv://ananyomaitroan2:bQsf5oBvgBMGQSLA@cluster0.6onwncj.mongodb.net/CDGIjournal",
      {}
    );

    // const conn = mongoose.connection;
    // gridfs.initialize(conn.db, mongoose.mongo);

    console.log("DB connected");
  } catch (error) {
    console.log("DB connection error", error);
  }
};
export default setupDB;