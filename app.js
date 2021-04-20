const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    // It gets the root query
    res.send('Hello from Yelp Camp!');
})

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})