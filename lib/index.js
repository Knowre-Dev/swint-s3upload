'use strict';

var path = require('path'),
	fs = require('fs'),
	swintHelper = require('swint-helper'),
	defaultize = swintHelper.defaultize,
	print = swintHelper.print,
	s3 = require('s3');

module.exports = function(options, callback) {
	defaultize({
		inDir: path.join(path.dirname(require.main.filename), '../out'),
		outDir: '',
		s3Info: {
			key: 'key',
			secret: 'secret',
			bucket: 'bucket'
		}
	}, options);

	return proceed(options, callback);
};

var proceed = function(options, callback) {
	if (callback === undefined) {
		var msg = 'swint-s3upload function needs callback';
		print(4, msg);
		throw new Error(msg);
	}

	if (!fs.existsSync(options.inDir)) {
		callback('swint-s3upload: inDir doesn\'t exist', false);
		return;
	}

	var s3Options = {
		accessKeyId: options.s3Info.key,
		secretAccessKey: options.s3Info.secret
	};

	if (options.s3Info.hasOwnProperty('region')) {
		s3Options.endpoint = 'https://s3-' + options.s3Info.region + '.amazonaws.com';
		s3Options.region = options.s3Info.region;
	}

	var s3Client = s3.createClient({
			s3Options: s3Options
		}),
		uploader = s3Client.uploadDir({
			localDir: options.inDir,
			getS3Params: function(localFile, stat, callback) {
				var ret = {};

				switch (path.extname(localFile)) {
					case '.html':
						ret.ContentType = 'text/html';
						break;
					case '.js':
						ret.ContentType = 'text/javascript';
						break;
					case '.css':
						ret.ContentType = 'text/css';
						break;
					case '.png':
						ret.ContentType = 'image/png';
						break;
					case '.gif':
						ret.ContentType = 'image/gif';
						break;
					case '.jpeg':
					case '.jpg':
						ret.ContentType = 'image/jpeg';
						break;
					case '.svg':
						ret.ContentType = 'image/svg+xml';
						break;
					case '.woff':
						ret.ContentType = 'application/font-woff';
						break;
					case '.ttf':
						ret.ContentType = 'application/x-font-ttf';
						break;
					case '.eot':
						ret.ContentType = 'application/vnd.ms-fontobject';
						break;
					case '.otf':
						ret.ContentType = 'application/x-font-opentype';
						break;
				}

				callback(null, ret);
			},
			s3Params: {
				Prefix: options.outDir.replace('\\', '/'),
				Bucket: options.s3Info.bucket,
				ACL: 'public-read'
			}
		});

	uploader.on('error', function(err) {
		callback(err, true);
	});

	uploader.on('end', function() {
		callback(null, true);
	});
};
