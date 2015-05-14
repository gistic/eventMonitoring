module.exports = function (grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        concat: {
            css: {
                src: [
                    'assets/stylesheets/*'
                ],
                dest: 'assets/stylesheets/min.css'
            }
        },

        cssmin: {
            css: {
                src: 'assets/stylesheets/screen.css',
                dest: 'assets/stylesheets/min/screen.min.css'
            }
        },

        uglify: {
            options: {
                mangle: false
            },
            js: {
                files: [{
                    expand: true,
                    src: '**/*.js',
                    dest: 'assets/min',
                    cwd: 'assets/scripts'
        }]
            }
        },

        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'assets/images/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'assets/images/min/'
        }]
            }
        },

        watch: {
            files: ['assets/stylesheets/*', 'assets/scripts/**/*'],
            tasks: ['cssmin', 'uglify'],
            options: {
              spawn: false,
            },
        },

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', ['cssmin:css', 'uglify:js', 'imagemin']);

};
