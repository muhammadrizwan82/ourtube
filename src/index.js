import dotenv from 'dotenv';
import connectDB from './db/index.js';
import express from 'express';

dotenv.config({
  path: './.env.sample'
});

//dotenv.config()

const app = express();

connectDB();

/*
(async () => {
  try {
    const dbURL = `${process.env.MONGODB_URL}/${DB_NAME}`;
    console.log("Connecting to database at", dbURL);

    await mongoose.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database");

    app.on('error', (error) => {
      console.error('Server error:', error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error(`Error in connecting db:`, error);
    throw error;
  }
})();
*/