// The wrapper function
module.exports = function (grunt) {

    // Project and task configuration
    grunt.initConfig({
        concat: {
            dist: {
                src: [
                    'app/app.js',
                    'app/controllers/**/*.js',
                    'app/services/**/*.js',
                    'app/directives.js',
                    'app/filters.js'
                ],
                dest: 'web/js/main.js'
            }
        },
        less: {
            styles: {
                files: {
                    "web/css/main.css": "less/main.less"
                }
            }
        },
        watch: {
            styles: {
                files: [
                    'less/**/*.less'
                ],
                tasks: ['less'],
                options: {
                    livereload: 1337,
                    nospawn: true
                }
            },
            scripts: {
                files: ['app/**/*.js'],
                tasks: ['concat'],
                options: {
                    // Start a live reload server on the default port 35729
                    livereload: true,
                    nospawn: true
                }
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Define tasks
    grunt.registerTask('default', ['watch']);

};