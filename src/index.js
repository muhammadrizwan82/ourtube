import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';


dotenv.config({
  path: './.env.sample'
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is listening at PORT:${process.env.PORT}`);
    })
  })
  .catch((err) => {
    console.log('Mongodb Connection Failed !!!', err)
  })