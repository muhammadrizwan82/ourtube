import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';


dotenv.config({
  path: './.env.sample'
});

connectDB()
  .then(() => {
    const appPort = process.env.PORT || 3000;
    app.listen(appPort, () => {
      console.log(`Server is listening at PORT:${appPort}`);
    })
  })
  .catch((err) => {
    console.log('Mongodb Connection Failed !!!', err)
  })