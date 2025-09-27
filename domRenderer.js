// Bookkeeping bits, we need to store some data and ensure that no roots conflict.
const ROOT_KEY = "dlthmRootId";
const instancesByRootId = {};
let rootID = 1;

function isRoot(node) {
  if (node.dataset[ROOT_KEY]) {
    return true;
  }
  return false;
}

function render(element, node) {
  // first check if we've already rendered into this node. if so we should update
  // otherwise we should mount (this is initial render)
  if (isRoot(node)) {
    update(element, node);
  } else {
    mount(element, node);
  }
}

function mount(element, node) {
  // create the initial instance, this abstruct away initial rendering types
  let component = instantiateComponent(element);
  // store this for later update & unmounting
  instancesByRootId[rootID] = component;

  // mounting generates DOM nodes, this is where react determines if we're re-mounting server rendered content
  let renderedNode = Reconciler.mountComponent(component, node);

  // Do some DOM operations, marking this node as a  root, and inserting the new DOM as a child.
  node.dataset[ROOT_KEY] = rootID;
  DOM.empty(node);
  node.appendChild(renderedNode);
  rootID++;
}

function update(element, node) {
  // Find the internal instance and update it
  let id = node.dataset[ROOT_KEY];
  let instance = instancesByRootId[id];

  let prevElem = instance._currentElement;
  if (shouldUpdateComponent(prevElem, element)) {
    // send the new element to the instance
    Reconciler.receiveComponent(instance, element);
  } else {
    // unmount and then mount the new one
    unmountComponentAtNode(node);
    mount(element, node);
  }
}

// This determines if we're going to end up reusing an internal instance or not. this is one of the big shortcuts that React does
// stopping us from instantiating and comparing full trees.
// Instead we immediately throw away a subtree when updating from one element type to another
function shouldUpdateComponent(prevElement, nextElement) {
  // simply use element.type
  // 'div' !== 'span'
  //  colorSwatch !== CounterButton
  // Note: In React we would also look at keys.
  return prevElement.type === nextElement.type;
}

function mountComponent(component) {
  // This will generate the DOM node that will go into the DOM. we defer to the component instance since it will contain the renderer
  // specific implementation of what that means.
  // This allows the Reconciler to be reused across DOM & Native
  let markup = component.mountComponent();

  // React does more work here to ensure that refs work. we dont need to
  return markup;
}

function receiveComponent(component, element) {
  // Shortcut! We won't do anything if the next element is the same as the current one. This is unlikely in normal JSX usage, but it an optimization that can unlocked with
  // babel's inline element transform
  let prevElement = component._currentElement;
  if (prevElement === element) {
    return;
  }
  //   Defer to the instance to update itself
  component.receiveComponent(element);
}

function unmountComponent(component) {
  // Again, React will do more work here for ref's we won't.
  component.unmountComponent();
}

function performUpdateIfNecessary(component) {
  component.performUpdateIfNecessary();
}
