var ArticleSchema = new Schema({
    // 'title' is required and of type String
    title: {
        type: String,
        require: true,
        unique: true
    },
    // 'link' is required and of type String
    link: {
        type: String,
        unique: true,
        require: true
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
