'use strict';

const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.port || 3030;

let browser;

app.use(async (request, response, next) => {
    // Enable CORS
    response.set('Access-Control-Allow-Origin', '*');

    // Run browser
    browser = await puppeteer.launch();
    next();
});

app.use(express.json());

app.get('/', (req, res) => res.send('Hi! This is screenshoter service!'));

app.post('/make', async (req, res) => {
    try {
        const page = await browser.newPage();
        await page.setContent(req.body.html);
        const elem = await page.$('body > *');

        let screenshot;
        if (elem) {
            screenshot = await elem.screenshot();
        } else {
            screenshot = await page.screenshot();
        }

        res.type('json').send({ screenshot });
        page.close();
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.listen(port, () => console.log(`app listening on port ${port}!`));

process.on('exit', async () => {
    console.log('shutdown...');
    await browser.close();
    console.log('browser are closed successfully');
});

// Solve 'possible EventEmitter memory leak detected'
process.setMaxListeners(0);