function createElemtent(type, props, ...children) {
  let props = Object.assign({}, props);
  props.children = children;
  return { type, props };
}
