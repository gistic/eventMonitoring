<?php 
  if(isset($GLOBALS['tweet'])){
    $tweet_additional_classes = implode(" ", $GLOBALS['tweet']);
  }else{
    $tweet_additional_classes = "";
  }
?>


<article class="media clearfix tweet <?php echo $tweet_additional_classes; ?>">
    <div class="pull-left">
        <img class="media-object" />
    </div>
    <div class="tweet-content pull-left">
        <h6 class="tweet-user">
            User name
            <small>
                <a href="#" target="_blank">
            @ tweet.user.screen_name
            </a>
            </small>
        </h6>
        <p>tweet.text</p>
        <small class="text-muted">Country : tweet.user.country || "none"</small>
        <br>
        <small class="text-muted">Location : tweet.user.location || "none"</small>
    </div>

</article>

<?php
  unset($GLOBALS['tweet']);
?>