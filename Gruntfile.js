module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        jshint: {
            all: [
                'test/*.js',
                'app.js'
            ]
        },
        mocha_istanbul: {
            coverage: {
                src: 'test',
                options: {
                    mask: '*.js',
                    reportFormats: ['cobertura', 'html']
                }
            }
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    // Register tasks
    grunt.registerTask('test', ['jshint', 'mocha_istanbul:coverage']);
}
