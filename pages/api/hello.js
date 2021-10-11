// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Cors from 'cors';
import { create as ipfsHttpClient } from 'ipfs-http-client';

function initMiddleware(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
}

const cors = initMiddleware(
  Cors({
    methods: ['GET', 'POST', 'OPTIONS'],
  })
);

export default async function handler(req, res) {
  await cors(req, res);

  const file = req.body;
  const data = JSON.stringify(file);

  console.log('Req body is: ');
  console.log(data);

  res.status(200).json({ message: 'ok' });
}
