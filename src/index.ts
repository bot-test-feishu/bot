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

app.get('/health', (req: Request, res: Response) => {
    console.log('Server is healthy');
    res.status(200).send('Hello world');
});

app.get('/', (req: Request, res: Response) => {
    console.log('Server is healthy');
    res.status(200).send('Hello world');
});

app.post('/github', async (req: Request, res: Response) => {
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
            const branch = parsedBody.ref?.split('/').pop() || 'Unknown branch';
            await sendMsg(title, sender, commit, repo, repoUrl,branch);
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

app.post('/err', async (req: Request, res: Response) => {

});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

const webhooks = new Webhooks({
    secret: process.env.SECRET ?? 'mysecret',
});

const handleWebhook = async (signature: string, body: string): Promise<boolean> => {
    console.log('env: ', process.env.SECRET);
    console.log('body: ', body);
    return webhooks.verify(body, signature);
};

export default handleWebhook;
