# swint-s3upload

[![Greenkeeper badge](https://badges.greenkeeper.io/Knowre-Dev/swint-s3upload.svg)](https://greenkeeper.io/)
AWS S3 uploader for Swint batch task manager(swint-task)

**Warning: This is not the final draft yet, so do not use this until its official version is launched**

## Installation
```sh
$ npm install --save swint-s3upload
```

## Testing
You may save your secret credentials for the test at `$HOME/.swint/swint-s3upload-test.json` in the format below:
```json
{
	"id": "ADJFNAIAMYAWSID",
	"secret": "DEJNARGMKAJENVADMMYAWSSECRET",
	"bucket": "swint-secret"
}
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
