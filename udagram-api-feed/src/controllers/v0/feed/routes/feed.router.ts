import {Router, Request, Response} from 'express';
import {FeedItem} from '../models/FeedItem';
import {NextFunction} from 'connect';
import * as jwt from 'jsonwebtoken';
import * as AWS from '../../../../aws';
import * as c from '../../../../config/config';
import { S3 } from 'aws-sdk';

const router: Router = Router();

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({message: 'No authorization headers.'});
  }
  
  if (req.headers.authorization === undefined) {
    return res.status(401).send({message: 'Malformed token.'});
  }

  const tokenBearer: string[] = req.headers.authorization.split(' ');
  if (tokenBearer.length != 2) {
    return res.status(401).send({message: 'Malformed token.'});
  }

  return jwt.verify(tokenBearer[1], c.config.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(500).send({auth: false, message: 'Failed to authenticate.'});
    }
    return next();
  });
}

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
  const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
  items.rows.map(async (item) => {
    if (item.url) {
      item.url = await AWS.getGetSignedUrlPromise(item.url);
    }
  });
  res.send(items);
});

// Get a feed resource
router.get('/:id',
    async (req: Request, res: Response) => {
      const {id} = req.params;
      const item = await FeedItem.findByPk(id);
      res.send(item);
    });

// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName',
    requireAuth,
    (req: Request, res: Response) => {
      const {fileName} = req.params;
      // const url = AWS.getPutSignedUrl(fileName);

      AWS.getPutSignedUrlPromise(fileName)
        .then((url: string) => {
            res.status(201).send({url: url});
          }).catch((error) => {
              console.log(error);
              res.status(400).send({message: 'Error  while retrieving the URL.'});
            });
          
        // const url = AWS.getGetSignedUrl(fileName);
        // res.status(201).send({url: url});
    });

// Create feed with metadata
router.post('/',
    requireAuth,
    async (req: Request, res: Response) => {
      const caption = req.body.caption;
      const fileName = req.body.url; // same as S3 key name

      if (!caption) {
        return res.status(400).send({message: 'Caption is required or malformed.'});
      }

      if (!fileName) {
        return res.status(400).send({message: 'File url is required.'});
      }

      const item = await new FeedItem({
        caption: caption,
        url: fileName,
      });

      const savedItem = await item.save();
      console.log(savedItem);

      savedItem.url = await AWS.getGetSignedUrlPromise(savedItem.url);
      console.log(savedItem);
      res.status(201).send(savedItem);
    });

export const FeedRouter: Router = router;
