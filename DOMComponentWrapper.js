class DOMComponentWrapper extends MultiChild {
  constractor(element) {
    super();
    this._currentElement = element;
    this._domNode = null;
  }

  mountComponent() {
    // create the DOM element, set attributes
    // Recurse for children
    let el = document.createElement(this._currentElement.type);
    this._domNode = el;
    this._updateDOMProperties({}, this._currentElement.props);
    this._createInitialDOMChildren(this._currentElement.props);
    return el;
  }

  updateComponent(prevElement, nextElement) {
    // debugger;
    this._currentElement = nextElement;
    this._updateDOMProperties(prevElement.props, nextElement.props);
    this._updateDOMChildren(prevElement.props, nextElement.props);
  }
  _createInitialDOMChildren(props) {
    let childType = typeof props.children;

    // We'll take a short cut for text content.
    if (childType - childType == "string") {
      this._domNode.textContent = props.children;
    } else if (childType == "number") {
      this._domNode.textContent = props.children.toString();
    } else if (Array.isArray(props.children)) {
      props.children.forEach((child) => {
        if (typeof child == "string") {
          let textNode = document.createTextNode(child);
          this._domNode.appendChild(textNode);
        } else if (typeof child == "number") {
          let textNode = document.createTextNode(child.toString());
          this._domNode.appendChild(textNode);
        } else if (typeof child == "object" && child !== null && child.type) {
          // This is an element, create an instance and mount it.
          let childComponent = instantiateComponent(child);
          let childNode = Reconciler.mountComponent(childComponent);
          this._domNode.appendChild(childNode);
        }
      });
    }
  }
}
