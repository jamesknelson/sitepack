import createSite from 'sitepack-virtual-createSite'
export default Promise.resolve().then(() => createSite({ environment: 'static' })).then(site => site._finalize())
