module.exports = function (grunt) {

        grunt.initConfig({

                express: {
                    all: {
                        options: {
                            port: 8080,
                            hostname: "0.0.0.0",
                            bases: [__dirname],
                            livereload: true
                        }
                    }
                },

                // grunt-open will open your browser at the project's URL
                open: {
                    all: {
                        // Gets the port from the connect configuration
                        path: 'http://localhost:<%= express.all.options.port%>'
                    }
                },

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

                watch: {
                    all: {
                        files: ['**/*.html'],
                        options: {
                            livereload: true
                        }
                    }
                }


                });


            grunt.loadNpmTasks('grunt-contrib-uglify');
            grunt.loadNpmTasks('grunt-open');
            grunt.loadNpmTasks('grunt-express');
            grunt.loadNpmTasks('grunt-contrib-watch');

            // the default task can be run just by typing "grunt" on the command line
            grunt.registerTask('default', ['uglify']);
            // Creates the `server` task
            grunt.registerTask('server', ['express', 'open', 'watch']);

        };
