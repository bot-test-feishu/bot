import { Webhooks } from "@octokit/webhooks";

const webhooks = new Webhooks({
    secret: 'aec_2024_sisi_lufor_moc',
});

const handleWebhook = (signature: string, body: string) => {


    if (!(webhooks.verify(body, signature))) {
        return false;
    } else {
        return true;
    }
};

export default handleWebhook;
