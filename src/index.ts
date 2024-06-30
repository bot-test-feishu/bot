import express, { type Request, type Response } from 'express';
import handleWebhook from './components/verify-webhook';
import { sendMsg, sendErr } from './components/msg-deliver';
import winston from 'winston';

const app = express();
const port = 8600;
app.use(express.json());

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});

app.post('/', async (req: Request, res: Response) => {
    const { headers, body } = req;
    const signature: string = headers['x-hub-signature-256'] as string || '';
    const Body = body;

    const result = await handleWebhook(signature, Body);
    if (result) {
        const tittle = 'post from github';
        const sender = JSON.parse(Body).sender.login || 'unknown sender';
        const commit = JSON.parse(Body).repository.full_name || 'unknown commit';
        await sendMsg(tittle, sender, commit);
        res.status(200).send('Webhook received');
    } else {
        await sendErr();
        logger.error('Webhook received but signature verification failed', { requestBody: Body });
        res.status(400).send('Webhook received but signature verification failed');

    }

    res.status(200).send('Webhook received');
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
