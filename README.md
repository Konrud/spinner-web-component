# spinner-web-component
Spinner Web Component (Using Custom Elements v1 and Shadow DOM)

## Preview
[You can see it live](https://konrud.github.io/spinner-web-component/index.html)

## Summary
The `<spinner-component></spinner-component>` represents spinner that can be used on the page during loading of the external resources or data. Component can hold text which can be set either via attribute `text` or via property on the component itself.
Component doesn't receive any children.

## How to use
Download [`spinner-web-component.js`](spinner-web-component.js) file and link it in your HTML document. Declare `<spinner-component></spinner-component>` in your HTML document.
```html
<!DOCTYPE html>
<html lang="en">
<head>...</head>
 <body>

  <spinner-component></spinner-component>
  
  <script src="spinner-web-component.js"></script>
 </body>
</html>
```


> **NOTE:** When component is insterted into the DOM, it automatically gets `hidden` attribute set on it, that is, it will be hidden by default.


## Browser Support
Chrome 54, Edge 79, Firefox 63, Opera 41, Safari 10.1, iOS Safari 10.3, Samsung Internet 6.0

## Polyfills
- Standalone [polyfill](https://github.com/webcomponents/custom-elements/) for Custom Elements v1.
- A suite of polyfills supporting the Web Components specs: [webcomponents.js loader](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs)


## Attributes
Common attributes like `id`, `hidden` are supported and can be used as with the regular HTML Elements.

Component also supports the following attributes:

  ### text
  Represent text that will be displayed when component is visible. 
  
  **NOTE:** If this attribute is set on the component via HTML and then `setup` method is called without setting `text.value`,
  then `text` attribute will be used, otherwise value set via `setup` method is used.
  
  If `text` attribute not set via attribute or as a property, and component doesn't have `aria-label` set on it, `aria-label="loading"` will be set by default. 
  Otherwise if `text` attribute is set, `aria-labelledby="spinnerText"` will be set.
  Each time `text` attribute is changed, either via attribute or as a property, `aria-label`/`aria-labelledby` will be changed accordingly.
  
  ```javascript
    // set via property
    const spinner = document.getElementById("spinner");
    spinner.text = "some text for spinner";
    
    // get via property
    const spinner = document.getElementById("spinner");
    const spinnerCurrentText = spinner.text;
  ```
  ```HTML
   // set on HTML Element
   <spinner-component text="some text for spinner"></spinner-component>
  ```
  
## Properties
Component supports the following properties:

  ### isShown [read-only]
  Boolean value determines whether component is visible.
  
  ```javascript  
    // get via property
    const spinner = document.getElementById("spinner");
    const isSpinnerVisible = spinner.isShown;
  ```
  

## Events

  ### show Event
  Event is fired when component is shown by calling `show` method, in addition its `isShown` property will be changed accordingly.
  You can determine current state of the component by reading `event.detail.isShown` property. This event bubbles up through the DOM.
  
   ```javascript
    document.addEventListener("show", function (e) {
      const isSpinnerShown = e.detail.isShown;
      console.log("from spinner-component SHOW EVENT");
    });
  ```
  
  ### hide Event
  Event is fired when component is hidden by calling `hide` method, its `isShown` property will be changed accordingly.
  You can determine current state of the component by reading `event.detail.isShown` property. This event bubbles up through the DOM.
   ```javascript
    document.addEventListener("hide", function (e) {
      const isSpinnerShown = e.detail.isShown;
      console.log("from spinner-component HIDE EVENT");
    });
  ```
  
## Methods

  ### setup
  Setup component with initial values.
  
  Method receives `options` object parameter with the following properties:
  
  - `{HTMLElement}` `parentContainer` - Containing Element for the component (coponent's container) 
    
  **NOTE:** container should have CSS `position` property other than static (e.g. `relative` or `absolute`)
  
  - `{Object}` `direction` - Custom directions to adjust component manually (e.g. `top: 10px` / `left: 50%` etc...)
    ```javascript
    Example: spinner.setup({..., "direction": {top: "41%"} });
    ```
    
  - `{String}` `color` - CSS Valid value for the color/background properties in string representation, 
  e.g. `grey`/`rgb(255, 30, 30)`/`#f1f1f1`
  
  - `{Number}` `size` - Size of the component, 1 is 100%, 0.5 is 50% of the spinner's original size 
  (**NOTE:** component's size, internally, set via `font-size` property)
  
  - `{Object}` `text` - Options for the component's text element:
  
    - `{String}` `color` - CSS Valid value for the color/background properties in string representation, 
    e.g. `grey`/`rgb(255, 30, 30)`/`#f1f1f1`
   
    - `{Number}` `size` - Size of the component's text, 1 is 100%, 0.5 is 50% of the component's original size
   
    - `{Object}` `direction` - Custom directions to adjust component's text manually (e.g. top: `10px` / `left: 50%` etc...)
      ```javascript
      Example: spinner.setup({..., text: { "direction": {top: "41%"} } });
      ```
   
    - `{String}` `value` - Component's text element's value (internally set via `HTMLElement.textContent`)
   
   > **NOTE:** If during setup `text.value` is set, it is used as component's text, otherwise text set via attribute on the component will be used
  
  
  **Examples:**
  
  ```html
  <spinner-component id="top-spinner"></spinner-component>
  ```
  
  ```javascript
  // Examples:
  // get element
  var topSpinner = document.getElementById("top-spinner");
  
  // setup - without setting `text.value`
  topSpinner.setup({size: 0.35, color: "cornflowerblue", text: {color: "firebrick"}});
  
  //setup - setting `text.value` explicitly
  topSpinner.setup({
  size: 2.5, 
  color: "yellow", 
  direction: {
      top: "2rem"
    }, 
  text: { 
      color: "firebrick", 
      value: "50% percents"
    }
  });
  
  // setup - setting parent container
  const parentElement = document.getElementById("container");
  
  topSpinner.setup({
  parentContainer: parentElement 
  color: "yellow", 
  text: { 
      color: "green", 
      value: "loading data"
    }
  });
  ```
  
  
  ### show
  Reveals component. 
  
  Also the following actions will be made:
  
  `show` event will be fired
  
  `aria-busy` will be set to `true` on the component's parent container (see [`aria-busy`](https://www.w3.org/TR/wai-aria-1.1/#aria-busy) for more info)
  
  `isShown` property of the component will be changed
  
  Example:
  
  ```javascript
  const spinner = document.getElementById("spinner");
  spinner.show();
  ```
  
  
  ### hide
  Hides component. 
  
  Also the following actions will be made:
  
  `hide` event will be fired
  
  `aria-busy` will be removed from the component's parent container (see [`aria-busy`](https://www.w3.org/TR/wai-aria-1.1/#aria-busy) for more info)
  
  `isShown` property of the component will be changed
    
  Example:
  
  ```javascript
  const spinner = document.getElementById("spinner");
  spinner.hide();
  ```
    
## Style

  ### Custom styles
  You can customize component, by setting your css on the component itself and by using CSS custom properties (a.k.a CSS variables).
  
  **NOTE:** component's dimension properties mainly defined in `em` unit (this unit is relative to the `font-size` property that defined on the element itself or on the parent element), thus, you can change its dimensions by setting `font-size` on the component itself or on the parent element.
  
  ```css
    // default values
    spinner-component {
       --hue: 0;
       --lightness: 100%;
       --saturation: 46%;
       --alpha: 0;

       --box-shadow-hue: var(--hue);
       --box-shadow-lightness: var(--lightness);
       --box-shadow-saturation: 18%;
       --box-shadow-alpha: var(--alpha);

       --box-shadow-x: 0px;
       --box-shadow-y: 0px;
       --box-shadow-blur: 3px;
       --box-shadow-spread: 0px;

       --spinner--color: hsla(var(--hue), var(--lightness), var(--saturation), var(--alpha));
       --spinner--size: 1rem;
       --spinner--backdrop: rgba(0, 0, 0, 0);
       --spinner--box-shadow: var(--box-shadow-x) var(--box-shadow-y) var(--box-shadow-blur) var(--box-shadow-spread) hsla(var(--box-shadow-hue), var(--box-shadow-lightness), var(--box-shadow-saturation), var(--box-shadow-alpha));
       --spinner--text-color: var(--spinner--color);
       --spinner--text-size: var(--spinner--size);

       --spinner--direction-left: 50%;
       --spinner--direction-top: 50%;

       --spinner-text-direction-left: 0;
       --spinner-text-direction-top: 0;
    }
  ```
  
  
  ### CSS custom properties
  The following properties can be used to customize the component:
  
   #### --hue
   Sets hue for component's `color`/`box-shadow` properties. [default value: 0]  
   
   #### --lightness
   Sets lightness for component's `color`/`box-shadow` properties. [default value: 100%] 
   
   #### --saturation
   Sets saturation for component's `color`/`box-shadow` properties. [default value: 46%] 
   
   #### --alpha
   Sets alpha for component's `color`/`box-shadow` properties. [default value: 0]
   
   #### --box-shadow-hue
   Sets hue for component's `box-shadow` property's color which is set via `hsla`. [default value: `var(--hue)`]
   
   #### --box-shadow-lightness
   Sets lightness for component's `box-shadow` property's color which is set via `hsla`. [default value: `var(--lightness)`]
   
   #### --box-shadow-saturation
   Sets saturation for component's `box-shadow` property's color which is set via `hsla`. [default value: 18%]
   
   #### --box-shadow-alpha
   Sets alpha for component's `box-shadow` property's color which is set via `hsla`. [default value: `var(--alpha)`]
   
   #### --box-shadow-x
   Sets x-offset for component's `box-shadow` property. [default value: 0]
   
   #### --box-shadow-y
   Sets y-offset for component's `box-shadow` property. [default value: 0]
   
   #### --box-shadow-blur
   Sets blur for component's `box-shadow` property. [default value: 3px]
   
   #### --box-shadow-spread
   Sets spread for component's `box-shadow` property. [default value: 0]
   
   #### --spinner--box-shadow
   Sets component's `box-shadow`. [default value: `var(--box-shadow-x) var(--box-shadow-y) var(--box-shadow-blur) var(--box-shadow-spread) hsla(var(--box-shadow-hue), var(--box-shadow-lightness), var(--box-shadow-saturation), var(--box-shadow-alpha))`]
   
   #### --spinner--color
   Sets component's `color` property. [default value: `hsla(var(--hue), var(--lightness), var(--saturation), var(--alpha))` if none of the custom properties are set, contaning block's `color` proerty value will be used]  
   
   #### --spinner--size
   Sets component's size. [default value: 1rem]
   
   #### --spinner--text-color
   Sets component's `text color`. [default value: `var(--spinner--color)`]
   
   #### --spinner--backdrop
   Sets component's backdrop which is displayed beneath the component when visible. [default value: `rgba(0, 0, 0, 0)`]
   
   #### --spinner--text-size
   Sets component's text size. [default value: `var(--spinner--size)`]
   
   #### --spinner--direction-left
   Sets component's direction `left`. [default value: 50%]
   
   #### --spinner--direction-top
   Sets component's direction `top`. [default value: 50%]
   
   #### --spinner-text-direction-left
   Sets component's text direction `left`. [default value: 0]
   
   #### --spinner-text-direction-top
   Sets component's text direction `top`. [default value: 0]
   

   
    
    
    
    
    
    
    
    
    
  
  
  
  
  
