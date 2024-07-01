



async function sendMsg(tittle: string, sender: string, commit: string, repo: string,repoUrl:string) {
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
                        }]
                    ]
                }
            }
        }
    };

    try {
        const response = await fetch('https://open.feishu.cn/open-apis/bot/v2/hook/78096ca5-fe98-4455-992f-1364d09d619e', {
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
        const response = await fetch('https://open.feishu.cn/open-apis/bot/v2/hook/78096ca5-fe98-4455-992f-1364d09d619e', {
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