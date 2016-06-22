#!/usr/bin/env node
'use strict';

var path = require('path');
var fs = require('fs');
var configWeaver = require('config-weaver');
var banner = fs.readFileSync(path.join(__dirname, 'banner.txt')).toString();
var config = configWeaver.config();
console.log(banner);
configWeaver.showVars(config, config.application.name);
console.log('Started at', new Date().toString());
process.title = 'proxette';
var service = require('./service');
service.create(config).run();
