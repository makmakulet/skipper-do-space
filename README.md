# Skipper Digital Ocean Space

Digital Ocean Space adapter for receiving [upstreams](https://github.com/balderdashy/skipper#what-are-upstreams). Particularly useful for handling streaming multipart file uploads from the [Skipper](https://github.com/balderdashy/skipper) body parser.

Comes equip with image compression using [sharp](https://www.npmjs.com/sharp)


## Installation

```
$ install as npm-github dependency
```

Also make sure you have skipper itself [installed as your body parser](http://beta.sailsjs.org/#/documentation/concepts/Middleware?q=adding-or-overriding-http-middleware).  This is the default configuration in [Sails](https://github.com/balderdashy/sails) as of v0.10.





## Additional Options

### space 
an object containing parameters to authenticate to digital ocean.

#### params

| Option | Type | Required | Default
|--|--|:--:|--|
| endpoint | string  | Y | sgp1.digitaloceanspaces.com 
| bucket | string  | Y | null
| key | string  | Y | null
| secret | string  | Y | null

### compress 
an object containing parameters to compress images

#### params

| Option | Type | Required | Default
|--|--|:--:|--|
| enabled | boolean  | N | false
| width | number (px)  | N | 500
| height | number (px) | N | null


## Example Usage

```javascript
req.file('avatar')
.upload({
  // Required
  adapter: require("skipper-do-space"),
  space: {
    endpoint: "sgp1.digitaloceanspaces.com",
    bucket: "test-bucket",
    key: "example-key",
    secret: "example-secret"
  },
  compress: {
  enabled: true,
  width: 600,
  height: null
  }
}, function (err, result) {
  //do whatever in the callback
});
```