module.exports = function (grunt) {

    grunt.initConfig({

        uglify: {
            my_target: {
                files: [{
                    cwd: 'assets/scripts',
                    src: '**/*.js',
                    dest: 'assets/scripts/min',
                    expand: true,
                    flatten: true,
                    ext: '.min.js'
                }]
            }
        },

        watch: {
            minifyJs: {
                files: "assets/scripts/*.js",
                tasks: ["uglify"]
            },
        },

    });


    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', ['uglify']);

};
