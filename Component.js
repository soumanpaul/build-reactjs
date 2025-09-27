class Component {
  constructor(props) {
    // set up some fields for later use.
    this.props = props;
    this._currentElement = null;
    this._pendingState = null;
    this._renderedComponent = null;
    this._renderedNode = null;

    assert(
      typeof this.render === "function",
      "Components must have a render method"
    );
  }

  setState(partialState) {
    // React uses a queue here to allow batching multiple setStates together
    // we'll keep it simple and just store the last one
    this._pendingState = Object.assign({}, this.state, partialState);
    // trigger an update
    // this.updateComponent();
    Reconciler.performUpdateIfNecessary(this);
  }

  // We have a helper method here to avoid having
  // a wrapper instance. React does that - it's a
  // smarter implementation and hides required
  // helpers, internal data. That also allows
  // renderers to have their own implementation
  // specific wrappers. This ensures that
  // React. Component is available on Native.

  _construct(element) {
    this._currentElement = element;
  }

  mountComponent() {
    // This is where the magic starts to happen.
    // We call the render method to get our actual
    // rendered element. Note: since React
    // don't support Arrays or other types, we can
    // safely assume we have an element.
    let renderedElement = this.render();

    // TODO: call componentWillMount

    // Instantiate the rendered element, this will
    // create the actual instance that will be mounted
    let component = instantiateComponent(renderedElement);
    this._renderedComponent = component;

    // generate markup for component & recurse!
    // Science Composite components instance dont have a DOM representation of
    // their own, this markup will actually be the DOM nodes or native  views
    let renderedNode = Reaconciler.mountComponent(component);

    return renderedNode;
  }

  receiveComponent(nextElement) {
    this.updateComponent(nextElement);
  }

  updateComponent(nextElement) {
    let prevElement = this._currentElement;

    // When just updating state, nextElement will be the same as previously rendered element.
    // Otherwise, this update is the result of a parent re-rendering.
    if (prevElement !== nextElement) {
      // TODO: call componentWillReciveProps
    }

    // TODO: call shouldComponentUpdate
    // and return if false

    // TODO: call componentWillUpdate

    // Update instance data
    this._currentElement = nextElement;
    this.props = nextElement.props;
    if (this._pendingState) {
      this.state = this._pendingState;
      this._pendingState = null;
    }

    // Re-render
    // we need the preiviously rendered element (render() result) to compare to the next render() result.
    let nextRenderedElement = this.render();
    let prevRenderedElement = this._renderedComponent._currentElement;

    // just like a top level update, determine if we should update or replace
    let shouldUpdate = shouldUpdateComponent(
      prevRenderedElement,
      nextRenderedElement
    );
    if (shouldUpdate) {
      // pass the next element down to the rendered component
      Reconciler.receiveComponent(this._renderedComponent, nextRenderedElement);
    } else {
      // Unmount the current component, and instantiate the new one,
      // replace the content in the DOM
      Reconciler.unmountComponent(this._renderedComponent);
      let nextRenderedComponent = instantiateComponent(nextRenderedElement);
      let nextMarkup = Reconciler.mountComponent(nextRenderedComponent);
      DOM.replaceNode(this._renderedComponent._domNode, nextMarkup);
      this._renderedComponent = nextRenderedComponent;
    }
  }
}
