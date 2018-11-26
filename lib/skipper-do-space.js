const WritableStream = require("stream").Writable;
const _ = require("lodash");
const errors = require("./error");
const sharp = require("sharp");

// Load the AWS SDK
const AWS = require("aws-sdk");

module.exports = (options) => {

  return {
    receive: new SkipperDoSpace
  }

}


class SkipperDoSpace {

  constructor () {
    return this.StreamReceiver();
  }

  StreamReceiver () {

    return (options) => {
      const receiver = WritableStream({ objectMode: true});
      receiver._write = this.Write(options);
      return receiver;      
    }

  }

  Write (options) {
    options = options || {};
    _.defaults(options, { 
      maxBytes: 10000000, //10MB,
      organizeByDate: true,
      compress: {
        enabled: false,
        width: 500,
        height: null
      }
    });

    const config = options.space;
    AWS.config.update({accessKeyId: config.key, secretAccessKey: config.secret});                
    const s3 = new AWS.S3({ endpoint: new AWS.Endpoint(config.endpoint) }); // Set S3 endpoint to DigitalOcean Spaces    

    return (incomingStream, encoding, next) => {
      
      let rawImageBuffer = [];
      incomingStream.on('data', (data) => {
        rawImageBuffer.push(data);
      });


      incomingStream.on('end', (data)  => {

        const _body = new Buffer.concat(rawImageBuffer);
        const _key = (options.organizeByDate) ? this.KeyWithDateDirectory( incomingStream.fd ) : incomingStream.fd;
        _.set(incomingStream, "extra.spaceUploadPath", _key);
        let uploadParams = {
          Bucket: _.get(options, "space.bucket", ""),
          Key: _key,
          Body: _body,
          ACL:'public-read',
          ContentType: _.get(incomingStream, "headers[content-type]", "")
        };

        if (options.compress.enabled) {
          sharp(_body)
            .resize(options.compress.width, options.compress.height, {fit: 'outside'})
            .toBuffer()
            .then( (outputBuffer) => {
              _.set(uploadParams, "Body", outputBuffer);
              s3.putObject(uploadParams, next);
            });
        } else {
            s3.putObject(uploadParams, next);
        }
      });
    }

  }

  KeyWithDateDirectory (key) {
    const dateObj = new Date();
    return [dateObj.getUTCFullYear(), dateObj.getUTCMonth() + 1, key].join("/");
  }  


}