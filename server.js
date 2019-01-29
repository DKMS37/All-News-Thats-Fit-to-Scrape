const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 8080;

// Initialize Express
var app = express();
// use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json({
  type: "application/json"
}));

// Set Handlebars.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

app.get("/scrape", function (req, res) {
    axios.get("https://www.motortrend.com/").then(function (response) {
        // Load the html body from request into cheerio
        var $ = cheerio.load(response.data);
        $("div.entry-summary").each(function (i, element) {

            // trim() removes whitespace because the items return \n and \t before and after the text
            var title = $(element).find("a.entry-title").text().trim();
            var link = $(element).find("a.entry-title").attr("href");
            var intro = $(element).children("div.entry-excerpt").children("span.excerpt").text().trim();

            // if these are present in the scraped data, create an article in the database collection
            if (title && link && intro) {
                db.Article.create({
                    title: title,
                    link: link,
                    intro: intro
                },
                    function (err, inserted) {
                        if (err) {
                            // log the error if one is encountered during the query
                            console.log(err);
                        } else {
                            // otherwise, log the inserted data
                            console.log(inserted);
                        }
                    });
                // if there are 20 articles, then return the callback to the frontend
                console.log(i);
                if (i === 20) {
                    return res.sendStatus(200);
                }
            }
        });
    });
});

// Hook mongojs configuration to the db variable
var db = require("./models");

// get all articles from the database that are not saved
app.get("/", function (req, res) {

    db.Article.find({
        saved: false
    },

        function (error, dbArticle) {
            if (error) {
                console.log(error);
            } else {
                res.render("index", {
                    articles: dbArticle
                });
            }
        })
});
// Routes
// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});
// route for retrieving all the saved articles
app.get("/saved", function (req, res) {
    db.Article.find({
        saved: true
    })
        .then(function (dbArticle) {
            // if successful, then render with the handlebars saved page
            res.render("saved", {
                articles: dbArticle
            })
        })
        .catch(function (err) {
            // If an error occurs, send the error back to the client
            res.json(err);
        })

});

// route for setting an article to saved
app.put("/saved/:id", function (req, res) {
    db.Article.findByIdAndUpdate(
        req.params.id, {
            $set: req.body
        }, {
            new: true
        })
        .then(function (dbArticle) {
            res.render("saved", {
                articles: dbArticle
            })
        })
        .catch(function (err) {
            res.json(err);
        });
});

// route for saving a new note to the db and associating it with an article
app.post("/submit/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            var articleIdFromString = mongoose.Types.ObjectId(req.params.id)
            return db.Article.findByIdAndUpdate(articleIdFromString, {
                $push: {
                    notes: dbNote._id
                }
            })
        })
        .then(function (dbArticle) {
            res.json(dbNote);
        })
        .catch(function (err) {
            // If an error occurs, send it back to the client
            res.json(err);
        });
});

// route to find a note by ID
app.get("/notes/article/:id", function (req, res) {
    db.Article.findOne({ "_id": req.params.id })
        .populate("notes")
        .exec(function (error, data) {
            if (error) {
                console.log(error);
            } else {
                res.json(data);
            }
        });
});

app.get("/notes/:id", function (req, res) {

    db.Note.findOneAndRemove({ _id: req.params.id }, function (error, data) {
        if (error) {
            console.log(error);
        } else {
        }
        res.json(data);
    });
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function () {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
});
