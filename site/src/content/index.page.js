export default {
  wrapper: 'Site',
  title: "Sitepack",
  content: require('./index.md'),
  children: [
    require('./guide/intro.md'),
    require('./guide/site.md'),
  ]
}