const DataUriParser = require('datauri/parser.js');
const path = require('path');

const getDataUri = (file) => {
 const parser = new DataUriParser();
 const extName = path.extname(file.originalname).toLowerCase();//  return parser.format(extName, file.buffer);
 return parser.format(extName, file.buffer);
};

module.exports = getDataUri;