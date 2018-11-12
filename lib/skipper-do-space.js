// module.exports = require("./lib/skipper-voyager-ugc");
const WritableStream = require("stream").Writable;
const _ = require("lodash");
const errors = require("./error");


// Load the AWS SDK
const AWS = require("aws-sdk");

module.exports = (options) => {

  const adapter = {
    receive: StreamReceiver
  };

  return adapter;


  //--------------------------------------------------------------------------------
  function StreamReceiver (options) {

    options = options || {};
    _.defaults(options, { 
      maxBytes: 10000000, //10MB,
      organizeByDate: true
    });

    const receiver = WritableStream({ objectMode: true});
    const spaceConfig = options.space;
    AWS.config.update({accessKeyId: spaceConfig.key, secretAccessKey: spaceConfig.secret});                
    const s3 = new AWS.S3({ endpoint: new AWS.Endpoint(spaceConfig.endpoint) }); // Set S3 endpoint to DigitalOcean Spaces
    
    receiver._write = function onFile(__newFile, encoding, next) {
      let rawImageBuffer = [];

      //validate file size of uploaded image
      if (__newFile.byteCount > options.maxBytes) {
        return next(new errors.FileSizeLimitError());
      }

      __newFile.on('data', (data) => {
        rawImageBuffer.push(data);
      });

      /* Execute DO Space Upload when buffer reached last bit*/
      __newFile.on('end', (data)  => {
        const uploadParams = {
          Bucket: spaceConfig.bucket,
          Key: (options.organizeByDate) ? KeyWithDateDirectory( __newFile.fd ) : __newFile.fd,
          Body: new Buffer.concat(rawImageBuffer),
          ACL:'public-read',
          ContentType: _.get(__newFile, "headers[content-type]", "")
        }
        s3.putObject(uploadParams, next);          
      });      

    };

    return receiver;
  }

};

function KeyWithDateDirectory (key) {
  const dateObj = new Date();
  return [dateObj.getUTCFullYear(), dateObj.getUTCMonth() + 1, key].join("/");
}