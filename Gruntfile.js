module.exports = function( grunt ) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        watch: {
        	scripts: {
                files: 'jquery.sticky.js',
                tasks: "uglify"
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= pkg.name %>.min.js': [ 'jquery.sticky.js' ]
                },
                options: {
                	banner: "/*! jquery.sticky.min.js */"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask( 'default', ['uglify']);
};