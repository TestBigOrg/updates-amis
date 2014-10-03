#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var through2 = require('through2');
var finder = require('..');
var queue = require('queue-async');
var _ = require('underscore');

var amiRegex = /ami-[a-z0-9]{8}/g;

var replace = through2(function(chunk, enc, callback) {
    var data = chunk.toString();
    var m, amis = [];
    var replacer = this;

    while (m = amiRegex.exec(chunk)) { amis.push(m[0]); }

    var q = queue();
    _(amis).uniq().forEach(function(oldami) {
        q.defer(function(cb) {
            finder.findUpdatedAmi(oldami, function(err, newami) {
                if (err) return cb(err);
                var re = new RegExp(oldami, 'g');
                data = data.replace(re, newami);
                cb();
            });
        });
    });
    q.await(function(err) {
        if (err) return callback(err);
        replacer.push(data);
        callback();
    });
});

var input, filepath, buf = new Buffer(0);

if (process.argv[2] && amiRegex.exec(process.argv[2])) {
    return finder.findUpdatedAmi(process.argv[2], function(err, newami) {
        if (err) throw err;
        console.log(newami);
    });
} else if (process.argv[2]) {
    filepath = path.resolve(process.argv[2]);
    input = fs.createReadStream(filepath);
} else {
    input = process.stdin;
}

input.pipe(replace)
    .on('error', function(err) {
        throw err;
    })
    .on('data', function(chunk) {
        if (!filepath) return process.stdout.write(chunk);
        buf = Buffer.concat([buf, chunk]);
    })
    .on('finish', function() {
        if (filepath) fs.writeFile(filepath, buf, 'utf8', function(err) {
            if (err) throw err;
            console.log('Updated ' + filepath);
        });
    });
