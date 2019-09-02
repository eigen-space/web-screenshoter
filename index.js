'use strict';

const { ArgumentParser } = require('@eigenspace/argument-parser');
const { EmulateActionType } = require('./common/enums/emulate-action-type.enum');
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const parser = new ArgumentParser();

const params = parser.get(process.argv.slice(2));

const httpParam = params.get('httpPort');
const port = httpParam || 3040;

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
        const { html, viewport } = req.body;

        const browser = await browserPromise;
        page = await browser.newPage();

        const devtoolsProtocolClient = await page.target().createCDPSession();
        await devtoolsProtocolClient.send('Performance.enable');

        if (viewport) {
            await page.setViewport(viewport);
        }

        await page.setContent(html);

        const elem = await page.$('body > *');

        await emulateAction(page);

        let firstMeaningfulPaint = 0;
        let performanceMetrics;
        while (firstMeaningfulPaint === 0) {
            await page.waitFor(100);
            performanceMetrics = await devtoolsProtocolClient.send('Performance.getMetrics');
            firstMeaningfulPaint = extractDataFromPerformanceMetrics(
                performanceMetrics.metrics,
                'FirstMeaningfulPaint'
            );
        }

        const metrics = performanceMetrics.metrics;
        console.log( metrics );

        console.log('aaaaaaa duration of all tasks', extractDataFromPerformanceMetrics(metrics, 'TaskDuration'));
        console.log('aaaaaaa duration of JavaScript execution', extractDataFromPerformanceMetrics(metrics, 'ScriptDuration'));
        console.log('aaaaaaa duration of all page style recalculations', extractDataFromPerformanceMetrics(metrics, 'RecalcStyleDuration'));
        console.log('aaaaaaa time it takes for a page\'s primary content to appear on the screen', getFirstMeaningfulPaintTimestamp(metrics));
        console.log('aaaaaaa JS heap size (MB)', getHeapSize(metrics));

        let screenshot;
        if (elem && !viewport) {
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

const server = app.listen(port, '0.0.0.0', () => console.log(`app listening on port ${port}!`));

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

let connections = [];

server.on('connection', connection => {
    connections.push(connection);
    connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

// Solve 'possible EventEmitter memory leak detected'
process.setMaxListeners(0);

// Functions

async function emulateAction(page) {
    await page.evaluate(
        (attribute) => {
            const scrollableItems = Array.from(document.querySelectorAll(`[${attribute}]`));
            scrollableItems.forEach(item => item.scrollTop = Number(item.getAttribute(attribute)));
        },
        [EmulateActionType.SCROLL_Y]
    );

    const elementToFocus = await page.$$(`[${EmulateActionType.FOCUS}]`);
    await elementToFocus.forEach(elem => elem.focus());

    const elementToHover = await page.$$(`[${EmulateActionType.HOVER}]`);
    await elementToHover.forEach(elem => elem.hover());
}

function countFps() {
}

function extractDataFromPerformanceMetrics(metrics, name) {
    return metrics.find(x => x.name === name).value
}

function getFirstMeaningfulPaintTimestamp(metrics) {
    const navigationStart = extractDataFromPerformanceMetrics(metrics, 'NavigationStart');
    const firstMeaningfulPaint = extractDataFromPerformanceMetrics(metrics, 'FirstMeaningfulPaint');
    return firstMeaningfulPaint - navigationStart;
}

function getHeapSize(metrics) {
    const size = extractDataFromPerformanceMetrics(metrics, 'JSHeapTotalSize');
    return size / 1024 ** 2;
}

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
