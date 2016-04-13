// Generated on 2016-04-13
'use strict';

module.exports = function(grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Automatically load required grunt tasks
    require('jit-grunt')(grunt, {
        useminPrepare: 'grunt-usemin',
        ngtemplates: 'grunt-angular-templates'
    });

    // Configurable paths
    var config = {
        app: 'app',
        dist: 'dist',
        pkg: grunt.file.readJSON('package.json')
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        config: config,

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeEmptyAttributes: true
                },
                files: {
                    'index.html': 'app/index.html'
                }

            }
        },

        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            hashtagApplication: {
                files: {
                    'prod/assets/scripts/mainApp.js': ['assets/scripts/mainApp.js', 'prod/assets/scripts/templates.js'],
                    'prod/assets/scripts/mainAppServices.js': ['assets/scripts/services/services.js', 'assets/scripts/services/*.js'],
                    'prod/assets/scripts/mainAppControllers.js': ['assets/scripts/controllers/*.js'],
                    'prod/assets/scripts/mainAppDirectives.js': ['assets/scripts/directives/*.js'],
                    'prod/assets/scripts/mainAppFilters.js': ['assets/scripts/filters/*.js']
                },
            },
        },

        uglify: {
            options: {
                banner: '/* <%= config.pkg.name %> - <%= config.pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                report: 'min'
            },
            build: {
                files: {
                    'prod/assets/scripts/min/mainApp.min.js': ['prod/assets/scripts/mainApp.js'],
                    'prod/assets/scripts/min/mainAppServices.min.js': ['prod/assets/scripts/mainAppServices.js'],
                    'prod/assets/scripts/min/mainAppControllers.min.js': ['prod/assets/scripts/mainAppControllers.js'],
                    'prod/assets/scripts/min/mainAppDirectives.min.js': ['prod/assets/scripts/mainAppDirectives.js'],
                    'prod/assets/scripts/min/mainAppFilters.min.js': ['prod/assets/scripts/mainAppFilters.js']
                }
            }
        },

        ngtemplates: {
            options: {
                module: 'trackHashtagApp'
            },
            app: {
                src: 'views/views-components/*.html',
                dest: 'prod/assets/scripts/templates.js'
            }
        },

        browserSync: {
            options: {
                notify: false,
                background: true,
                watchOptions: {
                    ignored: ''
                }
            },
            livereload: {
                options: {
                    files: [
                        '<%= config.app %>/{,*/}*.html',
                        '.tmp/styles/{,*/}*.css',
                        '<%= config.app %>/images/{,*/}*',
                        '.tmp/scripts/{,*/}*.js'
                    ],
                    port: 9000,
                    server: {
                        baseDir: ['.tmp', config.app],
                        routes: {
                            '/bower_components': './bower_components'
                        }
                    }
                }
            },
            dist: {
                options: {
                    background: false,
                    server: '<%= config.dist %>'
                }
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            server: []
        },
        // Watches files for changes and runs tasks based on the changed files
        watch: {
            gruntfile: {
                files: ['Gruntfile.js']
            },
            angularFiles: {
            	files: ['views/views-components/{,*/}*.html', '<%= config.app %>/{,*/}*.html'],
            	tasks: ['ngtemplates', 'ngAnnotate', 'uglify', 'htmlmin:dist']
            }
        },
    });

    grunt.registerTask('serve', 'start the server and preview your app', function(target) {

        if (target === 'dist') {
            return grunt.task.run(['build', 'browserSync:dist']);
        }

        grunt.task.run([
            'watch',
            'browserSync:livereload',
            'concurrent:server'
        ]);
    });

    grunt.registerTask('server', function(target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run([target ? ('serve:' + target) : 'serve']);
    });

    grunt.registerTask('default', [
        'newer:eslint',
        'test',
        'build'
    ]);

};
