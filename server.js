const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();

const myLimit = process.argv[2] || '100kb';
console.log('Using limit:', myLimit);

app.use(bodyParser.json({ limit: myLimit }));

app.all('*', function (req, res, next) {
    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));

    if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else {
        const targetURL = req.header('Target-URL');
        if (!targetURL) {
            res.status(500).json({ error: 'There is no Target-Endpoint header in the request' });
            return;
        }
        request({
            url: targetURL + req.url,
            method: req.method,
            json: req.body,
            headers: { 'Authorization': req.header('Authorization') }
        }, function (error, response, body) {
            if (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('Response:', response.statusCode, body);
                res.status(response.statusCode).json(body);
            }
        });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Proxy server listening on port ' + port);
});
