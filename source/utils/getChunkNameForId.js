export default function getChunkNameForId(id) {
  return id.substr(1).replace(/\.[a-zA-Z0-9]+$/, '').replace(/[^a-zA-Z0-9]+/g, '-')
}
