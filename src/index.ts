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

    const isValid = await handleWebhook(signature, requestBody);
    console.log('isSignatureValid: ', isValid);
    if (isValid) {
        try {
            const parsedBody = JSON.parse(requestBody);
            const title = '新提交';
            const sender = parsedBody.sender?.login || 'Unknown sender';
            const commit = parsedBody.commits[0]?.message || 'Unknown commit';
            const repo = parsedBody.repository?.full_name || 'Unknown repo';
            const repoUrl = parsedBody.repository?.html_url || 'Unknown repo url';
            await sendMsg(title, sender, commit, repo, repoUrl);
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
    secret: process.env.SECRER || 'mysecret',
});

const handleWebhook = async (signature: string, body: string): Promise<boolean> => {
    console.log('env: ', process.env.SECRET);
    return webhooks.verify(body, signature);
};

export default handleWebhook;
