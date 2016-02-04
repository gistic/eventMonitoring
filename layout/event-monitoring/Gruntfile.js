module.exports = function (grunt) {
    // 3. Where we tell Grunt we plan to use this plug-in.
    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        cssmin: {
            target: {
                files: [{
                    expand: true,
                    src: 'assets/stylesheets/screen.css',
                    dest: 'prod/',
                    ext: '.min.css'
                }]
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
                    dest: 'prod/assets/scripts',
                    cwd: 'assets/scripts'
        }]
            }
        },

        watch: {
            scripts: {
                files: ['assets/scripts/**/*.js', ],
                tasks: ['uglify'],
                option: {
                    spawn: false,
                },
            },

            css: {
                files: ['assets/stylesheets/*'],
                tasks: ['cssmin'],
                option: {
                    spawn: false,
                }
            }
        }

    });

    // the default task can be run just by typing "grunt" on the command line

    // grunt.registerTask('default', ['watch']);
    grunt.registerTask('default', ['uglify:js']);

};