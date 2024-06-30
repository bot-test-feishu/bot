import express, { type Request, type Response } from 'express';
import { sendMsg, sendErr } from './components/msg-deliver';
import winston from 'winston';
import { Webhooks } from '@octokit/webhooks';

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

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Hello world');
});

app.post('/', async (req: Request, res: Response) => {
    const { headers, body } = req;
    const signature: string = headers['x-hub-signature-256'] as string || '';
    const requestBody = JSON.stringify(body); // Ensure body is a string for verification
    console.log('Received webhook');

    const isValid = handleWebhook(signature, requestBody);
    if (await isValid) {
        try {
            const parsedBody = JSON.parse(requestBody);
            const title = 'Post from GitHub';
            const sender = parsedBody.sender?.login || 'Unknown sender';
            const commit = parsedBody.repository?.full_name || 'Unknown commit';
            
            await sendMsg(title, sender, commit);
            res.status(200).send('Webhook received');
        } catch (error) {
            logger.error('Error parsing webhook body:', error);
            await sendErr();
            res.status(500).send('Internal Server Error');
        }
    } else {
        logger.error('Webhook received but signature verification failed', { requestBody });
        await sendErr();
        res.status(400).send('Webhook received but signature verification failed');
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

const webhooks = new Webhooks({
    secret: 'aec_2024_sisi_lufor_moc',
});

const  handleWebhook = async (signature: string, body: string): Promise<boolean> => {
    return webhooks.verify(body, signature);
};

export default handleWebhook;
