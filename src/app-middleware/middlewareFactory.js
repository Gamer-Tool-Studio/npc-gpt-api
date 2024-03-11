const middlewareFactoryList = require('./middlewareFactoryList');

module.exports = function middlewareFactory(config) {
  return middlewareFactoryList.map((factory) => {
    return factory(config);
  });
};
