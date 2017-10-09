export default {
  wrapper: 'Site',
  title: "Sitepack",
  content: require('./index.md'),
  children: [
    require('./guide/configuring.md'),
    require('./guide/site.md'),
  ]
}