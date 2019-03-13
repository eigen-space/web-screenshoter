'use strict';

const { EmulateActionType } = require('./common/enums/emulate-action-type.enum');
const express = require('express');
const puppeteer = require('puppeteer');
const argv = require('minimist')(process.argv.slice(2));

const app = express();
const port = argv.port || 3030;

const browserPromise = puppeteer.launch({ args: ['--no-sandbox'] });

app.use(async (request, response, next) => {
    // Enable CORS
    response.set('Access-Control-Allow-Origin', '*');
    next();
});

app.use(express.json({ limit: '10mb', extended: true }));

app.get('/', (req, res) => res.send('Hi! This is screenshoter service!'));

app.post('/make', async (req, res) => {
    let page;
    try {
        const browser = await browserPromise;
        page = await browser.newPage();
        await page.setContent(req.body.html);
        const elem = await page.$('body > *');

        await emulateAction(page);

        let screenshot;
        if (elem) {
            const clip = await elem.boundingBox();
            clip.width = clip.width || 1;
            clip.height = clip.height || 1;
            screenshot = await elem.screenshot({ clip });
        } else {
            screenshot = await page.screenshot();
        }

        res.type('json').send({ screenshot });
    } catch (err) {
        res.status(500).send(err.toString());
    } finally {
        page.close();
    }
});

async function emulateAction(page) {
    await page.evaluate(
        (attribute) => {
            const scrollableItems = Array.from(document.querySelectorAll(`[${attribute}]`));
            scrollableItems.forEach(item => item.scrollTop = Number(item.getAttribute(attribute)));
        },
        [EmulateActionType.SCROLL_Y]
    );

    try {
        await page.focus(`[${EmulateActionType.FOCUS}]`);
    } catch (e) {
    }

    try {
        await page.hover(`[${EmulateActionType.HOVER}]`);
    } catch (e) {
    }
}

const server = app.listen(port, '0.0.0.0', () => console.log(`app listening on port ${port}!`));

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

let connections = [];

server.on('connection', connection => {
    connections.push(connection);
    connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

async function shutDown() {
    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);

    const browser = await browserPromise;

    if (browser) {
        await browser.close();
        console.log('Browser are closed successfully!');
    }

    connections.forEach(curr => curr.end());
    setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}

// Solve 'possible EventEmitter memory leak detected'
process.setMaxListeners(0);