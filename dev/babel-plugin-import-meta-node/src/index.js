module.exports = function(babel) {
  var t = babel.types;
  return {
    visitor: {
        MetaProperty: function(path) {
            if (path.node.meta.name == "import" && path.node.property.name == "meta")
                path.parentPath.replaceWith(t.identifier("__filename"));
        }
    }
  };
};
