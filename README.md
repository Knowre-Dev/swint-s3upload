# swint-s3upload
S3 uploader wrapper for Swint

**Warning: This is not the final draft yet, so do not use this until its official version is launched**

## Installation
```sh
$ npm install --save swint-s3upload
```

## Options
* `inDir` : `String`, default: `path.join(path.dirname(require.main.filename), '../out')`
* `outDir` : `String`, default: `''`
* `s3Info`
  * `key` : `String`, default: `'key'`
  * `secret` : `String`, default: `'secret'`
  * `bucket` : `String`, default: `'bucket'`

## Usage
```javascript
swintS3Upload({
	inDir: path.join(__dirname, 'out'),
	outDir: '',
	s3Info: {
		key: cred.id,
		secret: cred.secret,
		bucket: cred.bucket
	}
}, function(err, res) {
	// Afterwards...
});
```
