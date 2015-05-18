<?php 
  if(isset($GLOBALS['tweet'])){
    $tweet_additional_classes = implode(" ", $GLOBALS['tweet']);
  }else{
    $tweet_additional_classes = "";
  }
?>

<?php 
    $user_images = scandir("assets/images/users");
    // var_dump($user_images);return;
    $random = rand(2, count($user_images)-2);
    $random_image = $user_images[$random];
?>


<article class="media clearfix tweet <?php echo $tweet_additional_classes; ?>">
    <div class="pull-left">
        <img class="media-object" alt="" src="assets/images/users/<?php echo $random_image ?>">
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
    </div>

</article>

<?php
  unset($GLOBALS['tweet']);
?>