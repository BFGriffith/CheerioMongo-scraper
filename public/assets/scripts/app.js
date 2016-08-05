// SUBMIT comments:
$('.add_comment').on('click', function() {

  var commentSection = $(this).parent();
  $(commentSection).empty();

  $(commentSection).html( < form action="/update/`+$(commentSection).data('id')+`"
    method = "post" >
    <fieldset class="form-group">
    <label for = "commentBox" > comment: </label> <textarea class = "form-control"
    name = "comment"
    id = "commentBox"
    rows = "3"> </textarea> </fieldset>

    <input type = "submit"
    class = "btn btn-info"
    value = "ADD comment" />
    </form>
  );
});

// DELETE comments:
$('.list-group-item').on('click', function() {
  var comment = $(this).text().trim();
  var commentID = $(this).parent().data('id');
  var commentDelete = {
    comment: comment,
    commentID: commentID
  }
  console.log(commentDelete);

  var currentURL = window.location.origin;
  $.post(currentURL + "/delete", commentDelete);
});
