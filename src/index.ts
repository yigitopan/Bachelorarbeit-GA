import fs from 'fs'

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { dataEndpoint } from './routes/getData';

import { ChromosomController } from './controller/ChromosomController';
console.time();

fs.writeFile('Result.csv', '', (err) => {
    if (err) throw err;
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use("/data",dataEndpoint);

app.listen(process.env.PORT || 5001);

console.timeEnd();

