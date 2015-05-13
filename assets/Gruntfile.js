module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                src: [
            'assets/scripts/**/*.js'
        ],
                dest: 'assets/scripts/production.js',
            }
        },

        uglify: {
            build: {
                src: 'assets/scripts/production.js',
                dest: 'assets/scripts/min/production.min.js'
            }
        },

//        uglifyByFile: {
//            my_target: {
//                files: [{
//                    cwd: 'assets/scripts',
//                    src: '**/*.js',
//                    dest: 'assets/scripts/min',
//                    expand: true,
//                    flatten: true,
//                    ext: '.min.js'
//                }]
//            }
//        },

        watch: {
            minifyJs: {
                files: "assets/scripts/*.js",
                tasks: ["uglify"]
            },
        },

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', ['concat', 'uglify']);

};
