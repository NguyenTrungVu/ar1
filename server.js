const express = require('express');
const multer = require('multer');
const path = require('path');


const { createBrotliDecompress } = require('zlib');

const app = express();

const storage = multer.diskStorage({
    destination: function(req, res, next) {
        next(null, 'public/3d');
    },
    filename: function(req, res, next) {
        next(null, file.originalname);
    }
});

const upload = multer({storage});
app.post('/upload', upload.single('file'), (req, res) => {
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log("server listening on port 3000");
});