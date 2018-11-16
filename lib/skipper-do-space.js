const WritableStream = require("stream").Writable;
const _ = require("lodash");
const errors = require("./error");

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

  set config (config) {
    this._config = config;
  }

  get config () {
    return this._config;
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
      organizeByDate: true
    });
    const config = options.space;
    AWS.config.update({accessKeyId: config.key, secretAccessKey: config.secret});                
    const s3 = new AWS.S3({ endpoint: new AWS.Endpoint(config.endpoint) }); // Set S3 endpoint to DigitalOcean Spaces    

    return (incomingStream, encoding, next) => {
      let rawImageBuffer = [];
      incomingStream.on('data', (data) => {
        rawImageBuffer.push(data);
      });

      /* Execute DO Space Upload when buffer reached last bit*/
      incomingStream.on('end', (data)  => {
        const uploadParams = {
          Bucket: _.get(options, "space.bucket", ""),
          Key: (options.organizeByDate) ? this.KeyWithDateDirectory( incomingStream.fd ) : incomingStream.fd,
          Body: new Buffer.concat(rawImageBuffer),
          ACL:'public-read',
          ContentType: _.get(incomingStream, "headers[content-type]", "")
        }
        s3.putObject(uploadParams, next);          
      });        
    }
  
  }

  KeyWithDateDirectory (key) {
    const dateObj = new Date();
    return [dateObj.getUTCFullYear(), dateObj.getUTCMonth() + 1, key].join("/");
  }  


}