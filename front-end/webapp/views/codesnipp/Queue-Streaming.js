// Create the Queue Streaming
$scope.createTweetsQueue = function () {

	var source = new EventSource('tweets_queue');


	source.onmessage = function (e) {
		var tweet = JSON.parse(e.data);

		var buttons = '<div class="btn-toolbar pull-right tweet-options" role="toolbar" >' +

			'<div class="btn-group" role="group">' +
			'<button type="button" class="btn btn-default" onclick="approve(this)"><i class="fa fa-check"></i></button>' +
			'<button type="button" class="btn btn-default" onclick="approveStarred(this)"><i class="fa fa-star"></i></button>' +
			'<button type="button" class="btn btn-default" onclick="ignore(this)"><i class="fa fa-times"></i></button>' +
			'</div>' +

			'<div class="btn-group" role="group">' +
			'<button type="button" class="btn btn-default"><i class="fa fa-thumbs-o-up"></i></button>' +
			'<button type="button" class="btn btn-default"><i class="fa fa-bell-slash"></i></button>' +
			'</div>' +

			'</div>';

		var content = '<article id="' + tweet.tweet_id + '" class="media clearfix tweet">' +
			'<div class="pull-left">' +
			'<img class="media-object" src="' + tweet.profile_image_url + '" >' +
			'</div>' +
			'<div class="tweet-content pull-left">' +
			'<h6 class="tweet-user">' +
			tweet.name +
			'<small><a href="http://twitter.com/' + tweet.screen_name + '">' + ' @' + tweet.screen_name + '</a></small>' +
			'</h6>' +
			'<p>' +
			tweet.text +
			'</p>' +
			'</div>' +
			buttons +
			'</article>';
		document.getElementById('toApproveDiv').innerHTML = content + document.getElementById('toApproveDiv').innerHTML;

	};
}