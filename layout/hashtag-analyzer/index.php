<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Hashtag Analyser</title>

    <link rel="stylesheet" href="assets/stylesheets/screen.css">
</head>

<body>

    <!-- HEADER -->
    <header>
        <div class="logo"></div>
        <input type="text">
        <ul class="list-inline">
            <li><a href="">Tweets</a>
            </li>
            <li><a href="">Media</a>
            </li>
        </ul>
    </header>

    <!-- MAIN -->
    <div class="container">
        <div class="row">

            <aside class="col-md-7">
                <section>
                    <div class="panel panel-default">
                        <div class="panel-heading">Media ></div>
                        <div class="panel-body">
                            images
                        </div>
                    </div>
                </section>
                <section>
                    <div class="panel panel-default">
                        <div class="panel-heading">Map ></div>
                        <div class="panel-body">
                            Map
                        </div>
                    </div>
                </section>
                <section>
                    <div class="panel panel-default">
                        <div class="panel-heading">Tweet over time ></div>
                        <div class="panel-body">
                            Chart
                        </div>
                    </div>
                </section>
                <section>
                    <div class="panel panel-default">
                        <div class="panel-heading">Top people ></div>
                        <div class="panel-body">
                            Images
                        </div>
                    </div>
                </section>
            </aside>

            <section class="col-md-17">
            
                <?php for ($tweets=1; $tweets<=10; $tweets++) { ?>
                    <?php require "views_components/tweet.php"; ?>
                <?php } ?>
                
            </section>

        </div>
    </div>

    <script src="bower_components/jquery/dist/jquery.min.js"></script>
    <script src="bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js"></script>
</body>

</html>