#!/usr/bin/env node
/**
 * Proxette entry point.
 * Initialises and runs the Proxette service.
 */
'use strict';

var path = require('path');
var fs = require('fs');
var configWeaver = require('config-weaver');
var banner = fs.readFileSync(path.join(__dirname, 'banner.txt')).toString();
var config = configWeaver.config();
console.log(banner);
console.log('Proxette started at', new Date().toString());
configWeaver.showVars(config, " " + config.application.name);
process.title = 'proxette';
var service = require('./service');
service.create(config).run();
