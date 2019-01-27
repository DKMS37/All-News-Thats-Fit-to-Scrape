var mongoose = require("mongoose");

// save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
// create a new article schema. The link should be unique, but the other properties are not required because they may not exist on the website to be scraped. There is validation on the route to add them to the database on if these properties exist.
var ArticleSchema = new Schema({
  title: {
    type: String,
    unique: true,
    require: false
  },
  link: {
    type: String,
    unique: true,
    require: false
  },
  intro: {
    type: String,
    require: false
  },
  saved: {
    type: Boolean,
    default: false
  },

  // 'note' is an object that stores a Note id 
  // The ref property links the ObjectId to the Note model
  // This allows us to populate the Article with associated Note
  notes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Note"
    }
  ]
});

// create model
var Article = mongoose.model("Article", ArticleSchema);

// export the model
module.exports = Article;
