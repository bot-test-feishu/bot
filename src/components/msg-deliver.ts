

const FEISHU_GITHUB_URL = process.env.URL ?? '';


async function sendMsg(tittle: string, sender: string, commit: string, repo: string,repoUrl:string, branch: string) {
    const modifiedMessage = {
        msg_type: 'post',
        content: {
            post: {
                zh_cn: {
                    title: tittle,
                    content: [
                        [{
                            tag: 'text',
                            text: '提交者： '
                        }, {
                            tag: 'text',
                            text: sender,
                        }, {
                            tag: 'text',
                            text: '\n'
                        },
                        {
                            tag: 'text',
                            text: '提交： '
                        }, {
                            tag: 'text',
                            text: commit,
                        },
                        {
                            tag: 'text',
                            text: '\n'
                        },
                        {
                            tag: 'text',
                            text: '仓库： '
                        }
                            , {
                            tag: 'a',
                            text: repo,
                            href: repoUrl
                        },{
                            tag: 'text',
                            text: '\n'
                        },{
                            tag: 'text',
                            text: '分支： '
                        },{
                            tag: 'text',
                            text: branch,
                        }]
                    ]
                }
            }
        }
    };

    try {
        const response = await fetch(FEISHU_GITHUB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(modifiedMessage),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

async function sendErr() {
    const modifiedMessage = {
        "msg_type": "text",
        "content": {
            "text": "err occurred, please check the log"
        }
    }
    try {
        const response = await fetch(FEISHU_GITHUB_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(modifiedMessage),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

export { sendMsg, sendErr };