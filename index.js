var AWS = require('aws-sdk');
var _ = require('underscore');
var queue = require('queue-async');

module.exports = new Finder();

function Finder() {
    var finder = {
        cache: {},
        regions: [
            'ap-northeast-1',
            'ap-southeast-1',
            'ap-southeast-2',
            // 'cn-north-1', authentication failure
            'eu-west-1',
            'eu-central-1',
            'sa-east-1',
            'us-east-1',
            // 'us-gov-west-1', authentication failure
            'us-west-1',
            'us-west-2'
        ]
    };

    finder.amiInfo = function(imageid, callback) {
        var q = queue();
        finder.regions.forEach(function(region) {
            var ec2 = new AWS.EC2({ region: region });
            q.defer(function(cb) {
                ec2.describeImages({ ImageIds: [ imageid ] }, function(err, data) {
                    if (err && err.code === 'InvalidAMIID.NotFound') return cb(null, false);
                    if (err) return cb(err);
                    return cb(null, _({}).extend(data.Images[0], { region: region }));
                });
            });
        });
        q.awaitAll(function(err, results) {
            if (err) return callback(err);

            var info = _(results).find(function(info) {
                return !!info;
            });

            if (!info) return callback(new Error('No info found for ' + imageid));

            finder.cache[imageid] = info;
            callback(null, info);
        });
    };

    finder.findUpdatedAmi = function(imageid, callback) {
        var finder = this;
        if (!finder.cache[imageid]) return finder.amiInfo(imageid, haveInfo);
        haveInfo(null, finder.cache[imageid]);

        function haveInfo(err, info) {
            if (err) return callback(err);
            if (info.replaceWith) return callback(null, info.replaceWith);

            var filters = _({
                'architecture': info.Architecture,
                'state': 'available',
                'owner-id': info.OwnerId,
                'root-device-type': info.RootDeviceType,
                'virtualization-type': info.VirtualizationType
            }).map(function(value, key) {
                return { Name: key, Values: [ value ] };
            });

            var ec2 = new AWS.EC2({ region: info.region });

            ec2.describeImages({
                Filters: filters
            }, function(err, data) {
                if (err) return callback(err);

                // Kinda chintzy that in the end we have to rely on naming conventions
                var searchFor = info.Name.slice(0, info.Name.lastIndexOf('-'));

                var newami = _(data.Images).chain()
                    .filter(function(image) {
                        return image.Name && image.Name.indexOf(searchFor) === 0;
                    })
                    .sortBy('Name')
                    .map(function(image) {
                        return image.ImageId;
                    })
                    .last()
                    .value();

                finder.cache[imageid].replaceWith = newami;
                callback(null, newami);
            });
        }
    };

    return finder;
}
