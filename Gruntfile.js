'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json');
    require('load-grunt-config')(grunt);
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-sonar-runner');

    var tokenFile = path.join(process.env.HOME, '.sonar/token');
    var token;
    if (fs.existsSync(tokenFile)) {
        token = fs.readFileSync(tokenFile).toString().trim();
    }

    var createSonarConfiguration = function(mode) {
        var options = {
            sonar: {
                analysis: {
                    mode: mode
                },
                host: {
                    url: 'http://sonar.digital.gov.uk'
                },
                projectKey: pkg.name,
                projectName: "Proxette",
                projectVersion: pkg.version,
                projectDescription: pkg.description,
                sources: 'src',
                language: 'js',
                sourceEncoding: 'UTF-8',
                javascript: {
                    lcov: {
                        reportPath: 'target/coverage/lcov.info'
                    }
                }
            }
        };
        if (token) {
          options.sonar.login = token;
        }
        return options;
    };

    grunt.initConfig({

        copy: {
            test: {
                files: [
                    {
                        expand: true,
                        src: ['src/*.txt'],
                        dest: 'target/src/'
                    }
                ],
            },
        },

        instrument: {
            files: [
                'src/*.js',
            ],
            options: {
                lazy: true,
                basePath: 'target/'
            }
        },

        jasmine_node: {
            test: {
                all: ['test'],
                src: '*.js',
                verbose: true,
                options: {
                    specs: 'test/*_spec.js',
                    helpers: 'test/*_helper.js',
                    forceExit: true,
                    extensions: 'js',
                    specNameMatcher: 'spec',
                    jUnit: {
                        report: false,
                        savePath: "target/reports/",
                        useDotNotation: true,
                        consolidate: true
                    }
                }
            }
        },

        storeCoverage: {
            options: {
                dir: 'target/coverage'
            }
        },

        makeReport: {
            src: 'target/coverage/*.json',
            options: {
                type: 'lcov',
                dir: 'target/coverage',
                print: 'detail'
            }
        },

        sonarRunner: {
            analysis: {
                options: createSonarConfiguration('publish')
            },
            preview: {
                options: createSonarConfiguration('preview')
            }
        }

    });

};
