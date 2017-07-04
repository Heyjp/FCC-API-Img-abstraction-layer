require('dotenv').config();

var express = require("express");
var app = express();
var path = require('path')

// DB object
var config = require('./model/config.js').url
var db = require('./model/db.js');

var controller = require('./controller/index.js');

// View Engine
var ejs = require('ejs');
app.set('view engine', ejs);

app.use(express.static(path.join(__dirname, 'public')));

// connect to the database
db.connect(config, function(err) {
    if (err) {
        console.log("connection unavailable");
        return;
    } else {
        app.listen(process.env.PORT || 3000, function() {
            console.log("listening on port 3000");
        });
    }
})

app.get("/", function(req, res) {

    // Search DB for latest queries and return them for template engine
    controller.getQueries(function(err, data) {
        if (err) {
            console.error(err, "getQuery error")
            return res.render('index.ejs');
        } else {
            res.render('index.ejs', {
                queries: data
            });
        }
    })

});


app.get('/api/', function(req, res) {
    // Retrieve search term and page number for results from query string
    var data = {
        query: req.query.query,
        page: req.query.page
    }

    // query imgur and return json with results
    controller.imgSearch(req.query, function(err, data) {
        if (err) {
            return;
        }
        res.json(data);
    });
});
