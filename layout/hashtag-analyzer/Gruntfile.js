module.exports = function (grunt) {
    // 3. Where we tell Grunt we plan to use this plug-in.
    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt);

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            // 2. Configuration for concatinating files goes here.
            option: {
                separator: ';',
            },
            files: {
                src: ['prod/assets/scripts/templates.js'],
                dest: ['assets/scripts/mainApp.js']
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

        uglify: {
            options: {
                banner: '/* <%= pkg.name %> - <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
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

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeEmptyAttributes: true
                },
                files: {
                    'index.html': 'dev/index.html'
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


        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'images/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'prod/img'
                }]
            }
        },

        sass: {
            dis: {
                options: {
                    style: 'compressed',
                    compass: true
                },
                files: {
                    'stylesheets/screen.css': 'sass/screen.scss'
                }
            }
        },

        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },
            files: {
                src: ['assets/scripts/*.js']
            },
        },
        watch: {
            scripts: {
                files: ['assets/scripts/**/*.js', ],
                tasks: ['ngAnnotate', 'uglify', 'ngtemplates'],
                option: {
                    spawn: false,
                },
            },
            images: {
                files: ['images/*.{png,jpg,gif}'],
                tasks: ['imagemin'],
                option: {
                    spawn: false,
                }
            },
            css: {
                files: ['sass/*.scss'],
                tasks: ['sass'],
                option: {
                    spawn: false,
                }
            },
            html: {
                files: ['dev/*.html'],
                tasks: ['htmlmin'],
                options: {
                    spawn: false,
                }
            }
        }

    });

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['concat', 'uglify']);
    grunt.registerTask('htmlmini', ['htmlmin']);
    grunt.registerTask('angular', ['ngAnnotate', 'uglify', 'ngtemplates']);
    grunt.registerTask('dev', ['watch']);

};