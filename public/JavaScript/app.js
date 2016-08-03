// SUBMIT comment:
function submitComment(article_id) {

	// get textarea element and the comment and store in a variable
	var comment_box = $('.comment_box[data-role="' + article_id + '"]');
	var comment = $(comment_box).val();

	// clear out the comment details
	var comment_details = {};

	// build the comment object
	comment_details = {
		comment: comment,
		posted: Date.now(),
		article_id: article_id
	};

	// ajax post that adds comments to the database
	$.ajax({
		type: 'POST',
		url: '/submit',
		dataType: 'json',
		data: comment_details
	})
	.done(function(data) {
		//console.log(data);
	}); // end ajax(/submit)

	// build the comments display div, p and a elements for the comment the user just submitted
	var comments_display = $('.comments_display[data-role="' + article_id + '"]');
	var comment_div = $('<div class="comments_container">').attr('data-role', comment_details.posted);
	var comment_p = $('<p>' + comment + '</p>').attr('class', comment_details.posted);
	var comment_delete_btn = $('<a href="" class="btn btn-danger delete_comment">DELETE comment</a>').attr('data-role', comment_details.posted);

	// append elements to each other and to the containing div at the top of the comments section
	$(comment_p).appendTo(comment_div);
	$(comment_delete_btn).appendTo(comment_div);
	$(comment_div).prependTo(comments_display);

	// empty comment textarea once comment has been submitted
	$(comment_box).val('');

} // END submitComment()

// DELETE comment:
function deleteComment(posted_time, article_id) {

	// build comment to delete identifiers with posted time of comment and article_id
	var comment_to_delete = {
		article_id: article_id,
		posted: posted_time
	};

	// ajax post to delete comment
	$.ajax({
		type: 'POST',
		url: '/delete',
		dataType: 'json',
		data: comment_to_delete
	})
	.done(function(data) {
		//console.log(data);
	});// END ajax(/delete)

	// capture comment-container div to remove once user has clicked the DELETE button
	var comment_del_quick = $('.comment_container[data-role="' + posted_time + '"]');

	// remove div, which takes the comment and button with it
	$(comment_del_quick).remove();

} // END deleteComment()

/* click handlers */
// SUBMIT comment:
$('.submit_comment').on('click', function() {

	// data role for the button
	var data_role = $(this).attr('data-role');

	// call submitComment function and pass the article_id
	submitComment(data_role);
	return false; // (so we don’t refresh the page)
}); // END submit-comment.on()

// delete comment (call containing div so dynammically added comments can be deleted)
$('.comments_display').on('click', '.delete_comment', function() {
	// grab the posted time for this comment and the article id
	var posted_time = $(this).attr('data-role');
	var article_id = $(this).parents('div.comments_display').attr('data-role');

	// call deleteComment function and pass posted time of the comment and the article id
	deleteComment(posted_time, article_id);
	return false; // (so we don’t refresh the page)
});// END delete-comment.on()
