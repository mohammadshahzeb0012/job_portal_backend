function getMediaName (url){
  let urlArr = url.split("/")
  const image = urlArr.length-1
  const imageName = urlArr[image].split('.')
  return imageName[0]
}
module.exports = getMediaName