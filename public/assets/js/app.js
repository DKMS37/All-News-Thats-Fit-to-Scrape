$(document).ready(function () {

    // when the save button is clicked, get the article ID and set its saved property to true
    $(".save-btn").on("click", function (event) {
      var newSavedArticle = $(this).data();
      newSavedArticle.saved = true;
      console.log("saved was clicked");
      var id = $(this).attr("data-articleid");
      $.ajax("/saved/" + id, {
        type: "PUT",
        data: newSavedArticle
      }).then(
        function (data) {
          location.reload();
        }
      );
    });
  
    // get new articles when the button is clicked
    $(".scrape-new").on("click", function (event) {
      event.preventDefault();
      $.get("/scrape", function (data) {
        window.location.reload();
      });
    });
  
    // when the button to removed a saved article from the saved list, get the article ID and set its saved property back to false
  
    $(".unsave-btn").on("click", function (event) {
      var newUnsavedArticle = $(this).data();
      var id = $(this).attr("data-articleid");
      newUnsavedArticle.saved = false;
      $.ajax("/saved/" + id, {
        type: "PUT",
        data: newUnsavedArticle
      }).then(
        function (data) {
          location.reload();
        }
      );
    });



});