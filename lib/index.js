'use strict';

var path = require('path'),
	fs = require('fs'),
	async = require('async'),
	swintHelper = require('swint-helper'),
	defaultize = swintHelper.defaultize,
	walk = swintHelper.walk,
	print = swintHelper.print,
	aws = require('aws-sdk');

module.exports = function(options, callback) {
	defaultize({
		inDir: path.join(path.dirname(require.main.filename), '../out'),
		outDir: '',
		s3Info: {
			key: 'key',
			secret: 'secret',
			bucket: 'bucket'
		},
		limit: 10
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
		if (options.s3Info.region.substr(0,2) === 'cn')
			s3Options.endpoint = 'http://s3.'+options.s3Info.region+'.amazonaws.com.cn';
		else 
			s3Options.endpoint = 'https://s3-' + options.s3Info.region + '.amazonaws.com';
		
		s3Options.region = options.s3Info.region;
		
		if (['ap-northeast-2','cn-north-1'].indexOf(s3Options.region) !== -1) {
			s3Options.signatureVersion = 'v4';
		}
	}

	var s3Client = new aws.S3(s3Options),
		files = walk({
			dir: options.inDir
		});

	async.parallelLimit(
		files.map(function(f) {
			return function(cb) {
				var prefix = options.outDir.replace(/\\/g, '/') + (options.outDir === '' ? '' : '/'),
					key = prefix + f.replace(options.inDir + path.sep, '').replace(/\\/g, '/');

				s3Client.putObject({
					Bucket: options.s3Info.bucket,
					Key: key,
					ACL: 'public-read',
					ContentType: getS3Params(f),
					Body: fs.readFileSync(f)
				}, function(err) {
					if (err) {
						cb(err, false);
						return;
					}

					cb(null, true);
				});
			};
		}),
		options.limit,
		function(err, res) {
			if (err) {
				print(4, err);
				process.exit(-1);
				return;
			}

			callback(null, res);
		}
	);
};

var getS3Params = function(file) {
	switch (path.extname(file)) {
		case '.html':
			return 'text/html';
		case '.js':
			return 'text/javascript';
		case '.css':
			return 'text/css';
		case '.png':
			return 'image/png';
		case '.gif':
			return 'image/gif';
		case '.jpeg':
		case '.jpg':
			return 'image/jpeg';
		case '.svg':
			return 'image/svg+xml';
		case '.woff':
			return 'application/font-woff';
		case '.ttf':
			return 'application/x-font-ttf';
		case '.eot':
			return 'application/vnd.ms-fontobject';
		case '.otf':
			return 'application/x-font-opentype';
	}
};
