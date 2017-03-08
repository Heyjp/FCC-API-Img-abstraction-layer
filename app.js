var express = require("express");
var app = express();
var Imgur = require("imgur-search");
var mongo = require("mongodb").MongoClient;

var theDb = "mongodb://localhost:27017/searches";

// Imgur api authentication
var imgur = new Imgur('fab004f1a33bb89');

function tidyObj (obj) {

 delete obj.description;
 delete obj.datetime;
 delete obj.animated;
 delete obj.width;
 delete obj.height;
 delete obj.size;
 delete obj.bandwidth;
 delete obj.vote;
 delete obj.favorite;
 delete obj.nsfw;
 delete obj.section;
 delete obj["account_url"];
 delete obj["account_id"];
 delete obj["in_gallery"];
 delete obj.topic;
 delete obj["topic_id"]
 delete obj.webm;
 delete obj.mp4;
 delete obj["mp4_size"];
 delete obj["webm_size"];
 delete obj.looping;
 delete obj["comment_count"];
 delete obj.ups;
 delete obj.downs;
 delete obj.points;
 delete obj.score;
 delete obj["is_album"];
}


function returnResults (resp, num) {
  var page;

  if (typeof num !== Number) {
    page = 0;
  } else {
    page = num;
  }

  var obj = resp;
  var counter = 0;
  var newArray = [];
  // loop through the response object
  for (var i = page; i < page + 11; i++) {
    // push the required amount of objects to an array.
        if (counter < 10) {
        tidyObj(obj[i]);
        newArray.push(obj[i]);
        counter++;
    } else if (counter === 10) {
      console.log(newArray);
        return newArray;
    }
  }
   // End of returnResults
}

app.get("/api/:query", function(req, res) {

  var theDate = new Date();
  var query = req.params.query;
  var offset = parseInt(req.query.offset);

  if (offset === null) {
    offset = 0;
  }

  console.log(offset, "this is offset ", query, "this is query");

  var insertSearch = function (db, callback) {
        db.collection('searches').insertOne({
          query: query,
          date: theDate
        });
        db.collection('searches').find({}).count(function (err, count) {
            if (count > 5) {
              db.collection('searches').remove({
                justOne : true
              })
            }
        });
      }


  // searches Imgur for the query search_term returns resp object.
  imgur.search(query)
         .always(function (resp) {
                   // data in resp
  // 1) CREATE FUNCTION THAT DELIVERS 1-10 OF THE RESP object
  // 2) RETURN THAT OBJECT WITH OFFSET PARAMETER, RESP[offset] - RESP[offset + 10];
                   var results = returnResults(resp, offset);
                   res.send(results);
    });



    mongo.connect(theDb, function(err, db) {
      if (err) {
         console.error(err);
       }
 insertSearch(db, function(data) {
     db.close();
   });

   console.log("connected");
});
  // end of get request

});


app.listen("3000", function () {
  console.log("listening on port 3000");
});

app.get("/api/latest/pastsearch", function (req, res) {

  // mongodb, find query for the past 5 searches
 var findSearches = function (db, callback) {
   var cursor = db.collection('searches').find({});
   cursor.toArray(function(err, doc){
      res.send(doc);
   })
 }

  mongo.connect(theDb, function(err, db) {
    if (err) {
       console.error(err);
     }
 findSearches(db, function(data) {
     db.close();
 });
});

});
