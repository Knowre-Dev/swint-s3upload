var s3 = require('s3'),
	path = require('path'),
	fs = require('fs'),
	os = require('os'),
	assert = require('assert'),
	swintS3Upload = require('../lib');

global.swintVar.printLevel = 5;

describe('secret', function() {
	this.timeout(20000);
	
	it('Error when no callback', function() {
		assert.throws(function() {
			swintS3Upload({});
		});
	});

	it('Error when inDir doesn\'t exist', function(done) {
		swintS3Upload({
			inDir: '/this-directory-does-not-exist'
		}, function(err, res) {
			assert.notEqual(err, null);
			done();
		});
	});

	it('Simple case', function(done) {
		var credPath = path.join(process.env.HOME, '.swint', 'swint-s3upload-test.json'),
			cred;

		try {
			fs.accessSync(credPath);
			cred = JSON.parse(fs.readFileSync(credPath));
		} catch(e) {
			cred = {
				key: process.env.SWINT_S3UPLOAD_TEST_KEY,
				secret: process.env.SWINT_S3UPLOAD_TEST_SECRET,
				bucket: process.env.SWINT_S3UPLOAD_TEST_BUCKET
			};
		}

		var	client = s3.createClient({
				s3Options: {
					accessKeyId: cred.key,
					secretAccessKey: cred.secret
				}
			}),
			params = {
				localDir: path.join(os.tmpDir(), 'swint-s3upload-download'),
				s3Params: {
					Bucket: cred.bucket,
					Prefix: ''
				}
			},
			ss = swintS3Upload({
				inDir: path.join(__dirname, '../test_case'),
				outDir: '',
				s3Info: {
					key: cred.key,
					secret: cred.secret,
					bucket: cred.bucket
				}
			}, function(err, res) {
				fs.mkdirSync(path.join(os.tmpDir(), 'swint-s3upload-download'));

				var downloader = client.downloadDir(params);

				downloader.on('error', function(err) {
					print(4, err);
					process.exit(-1);
				});

				downloader.on('end', function() {
					assert.deepEqual(
						fs.readFileSync(path.join(__dirname, '../test_case/common.js')),
						fs.readFileSync(path.join(os.tmpDir(), 'swint-s3upload-download/common.js'))
					);

					assert.deepEqual(
						fs.readFileSync(path.join(__dirname, '../test_case/common.css')),
						fs.readFileSync(path.join(os.tmpDir(), 'swint-s3upload-download/common.css'))
					);

					assert.deepEqual(
						fs.readFileSync(path.join(__dirname, '../test_case/img/flags.png')),
						fs.readFileSync(path.join(os.tmpDir(), 'swint-s3upload-download/img/flags.png'))
					);

					assert.deepEqual(
						fs.readFileSync(path.join(__dirname, '../test_case/img/tech.svg')),
						fs.readFileSync(path.join(os.tmpDir(), 'swint-s3upload-download/img/tech.svg'))
					);

					done();
				});

			});
	});

	after(function(done) {
		var credPath = path.join(process.env.HOME, '.swint', 'swint-s3upload-test.json'),
			cred;

		try {
			fs.accessSync(credPath);
			cred = JSON.parse(fs.readFileSync(credPath));
		} catch(e) {
			cred = {
				key: process.env.SWINT_S3UPLOAD_TEST_KEY,
				secret: process.env.SWINT_S3UPLOAD_TEST_SECRET,
				bucket: process.env.SWINT_S3UPLOAD_TEST_BUCKET
			};
		}

		var client = s3.createClient({
				s3Options: {
					accessKeyId: cred.key,
					secretAccessKey: cred.secret
				}
			}),
			params = {
				localDir: path.join(os.tmpDir(), 'swint-s3upload-empty'),
				deleteRemoved: true,
				s3Params: {
					Bucket: cred.bucket,
					Prefix: ''
				}
			};

		try {
			fs.accessSync(path.join(os.tmpDir(), 'swint-s3upload-download/.DS_Store'));
			fs.unlinkSync(path.join(os.tmpDir(), 'swint-s3upload-download/.DS_Store'));
		} catch(e) {
			;
		}
		fs.unlinkSync(path.join(os.tmpDir(), 'swint-s3upload-download/common.js'));
		fs.unlinkSync(path.join(os.tmpDir(), 'swint-s3upload-download/common.css'));
		fs.unlinkSync(path.join(os.tmpDir(), 'swint-s3upload-download/img/flags.png'));
		fs.unlinkSync(path.join(os.tmpDir(), 'swint-s3upload-download/img/tech.svg'));
		fs.rmdirSync(path.join(os.tmpDir(), 'swint-s3upload-download/img'));
		fs.rmdirSync(path.join(os.tmpDir(), 'swint-s3upload-download'));

		fs.mkdirSync(path.join(os.tmpDir(), 'swint-s3upload-empty'));

		var uploader = client.uploadDir(params);

		uploader.on('error', function(err) {
			print(4, err);
			process.exit(-1);
		});

		uploader.on('end', function() {
			fs.rmdirSync(path.join(os.tmpDir(), 'swint-s3upload-empty'));
			done();
		});
	});
});
