var db = require('../model/db.js');
var Imgur = require('imgur-search')
var theDb = process.env.DB_URL

var imgur = new Imgur(process.env.IMGUR_KEY)
// Imgur api authentication
// searches Imgur for the query search_term returns resp object.

exports.imgSearch = function(query, callback) {

    var query = query.query;
    var page = query.page;

    // imgur is a promise based query of the imgur-search
    imgur.search(query, 'top', page)
        .then(function(res) {
            // Save a copy of the search to the db
            insertSearch(query);

            // Extract relevant info and send back to app.js
            var results = filterSearches(res);
            return callback(null, results);
        });
};

function filterSearches(array) {
    const LIMIT = 10;
    // Take an array of data, extract relevant information i.e url, description
    let filteredArray = [];
    for (let i = 0; i < LIMIT; i++) {
        let newObj = {};
        newObj.title = array[i].title
        newObj.link = array[i].link
        filteredArray.push(newObj);
    }
    return filteredArray;
}

// Take the query from the search, place in db with date
function insertSearch(query) {
    // db pointer
    var collection = db.get().collection('searches')

    collection.insertOne({
        query: query,
        date: new Date()
    });

    // Keep the DB limited to 5 entries - displayed on front page
    collection.find({}).count(function(err, count) {
        if (count > 5) {
            return collection.remove({
                justOne: true
            })
        }
        return;
    });
}

// Return DB search query strings for display for client
exports.getQueries = function(callback) {
    var collection = db.get().collection('searches')
    // Search all entries in DB and callback
    collection.find({}).toArray(function(err, data) {
        if (err) {
            console.log(err, "error in toArray");
            return;
        }
        return callback(null, data);
    })
}
