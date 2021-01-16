; (function () {
    "use strict";

    class SpinnerComponent extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: "open" });
            this.shadowRoot.appendChild(_getHtmlContent());
        }

        static get observedAttributes() {
            return ["text", "hidden"];
        }

        connectedCallback(e) {
            if (!this.hasAttribute("hidden")) {
                this.setAttribute("hidden", "");
            }

            if (!this.hasAttribute("role")) {
                this.setAttribute("role", "status");
            }

            this.__setAriaLabel();

            // A user may set a property on an _instance_ of an element,
            // before its prototype has been connected to this class.
            // The `_upgradeProperty()` method will check for any instance properties
            // and run them through the proper class setters.
            // See the [lazy properites](/web/fundamentals/architecture/building-components/best-practices#lazy-properties)
            // section for more details.
            this._upgradeProperty("text");
        }

        disconnectedCallback(e) {

        }

        attributeChangedCallback(name, prevVal, curVal) {
            if ((curVal == undefined && name !== "hidden") || (prevVal === curVal)) {
                return;
            }
            
            if (name === "text") {
                this.text = curVal;
            }
            
            if (name === "hidden") {
                this.__setAriaBusy(!this.hidden);
            }
        }

        /**===  text ===**/
        get text() {
            const spinnerTextElem = this.shadowRoot.getElementById("spinnerText");
            if (spinnerTextElem) {
                return spinnerTextElem.textContent;
            }
        }


        set text(val) {
            const spinnerTextElem = this.shadowRoot.getElementById("spinnerText");
            if (spinnerTextElem) {
                spinnerTextElem.textContent = val;
                this.__setAriaLabel();
            }
        }

        /**===  isShown ===**/
        get isShown() {
            return !this.hidden && (window.getComputedStyle(this).display !== "none");
        }

        /*===========================
                PUBLIC API 
        =============================*/
        /**
         *  Setup spinner component
         * @param {Object} options - Object with options:
         *   @prop {HTMLElement} parentContainer - Containing Element for the spinner
         *   (Note: container should have CSS `position` property other than static)
         *   @prop {Object} direction - Custom directions to adjust spinner container manually (e.g. top: 10px / left: 50% etc...)
         *     example of use: spinner.setup({..., "direction": {top: "41%"} });
         *   @prop {String} color - CSS Valid value for the color/background properties in string representation, e.g. "grey"/"rgb(255, 30, 30)"/#f1f1f1
         *   @prop {Number} size - Size of the spinner, 1 is 100%, 0.5 is 50% of the spinner's original size
         *   @prop {Object} text - Options for the spinner's text element:
         *     @prop {String} color - CSS Valid value for the color/background properties in string representation, e.g. "grey"/"rgb(255, 30, 30)"/#f1f1f1
         *     @prop {Number} size - Size of the spinner's text, 1 is 100%, 0.5 is 50% of the spinner's original size
         *     @prop {Object} direction - Custom directions to adjust spinner's text manually (e.g. top: 10px / left: 50% etc...)
         *     example of use: spinner.setup({..., text: { "direction": {top: "41%"} } });
         *     @prop {String} value - Spinner's text element's value (set via HTMLElement.textContent)
         */
        setup(options) {
            const spinner = this.shadowRoot.getElementById("spinner");
            const spinnerBody = spinner.querySelector(`#spinnerBody`);
            const spinnerText = spinner.querySelector(`#spinnerText`);


            const defOpts = this._getMergedOptions(options);
            // if during setup `text.value` is set by user, we take it, otherwise we use text set via attribute on the component
            defOpts.text.value = defOpts.text.value || this.getAttribute("text");

            if (spinner) {
                this._resetSpinner(spinner);
                /**spinner**/
                this._setSpinnerColor(spinner, defOpts.color);
                this._setSpinnerSize(spinner, defOpts.size);
                this._adjustSpinnerDirection(spinnerBody, defOpts.direction);
                /**spinner's text**/
                this._setSpinnerTextSize(spinnerText, defOpts.text.size);
                this._setSpinnerTextColor(spinnerText, defOpts.text.color);
                this._adjustSpinnerTextDirection(spinnerText, defOpts.text.direction);
                this._setSpinnerTextValue(spinnerText, defOpts.text.value);
                defOpts.parentContainer.appendChild(this);
            }
        }

        /**
         * Reveals spinner component
         */
        show() {
            this.removeAttribute("hidden");
            this.__onSpinnerShow();
        }

        /**
         *  Hide spinner component
         */
        hide() {
            this.setAttribute("hidden", "");
            this.__onSpinnerHide();
        }

        /*===========================
        PRIVATE FUNCTIONS 
        =============================*/
        _upgradeProperty(prop) {
            if (this.hasOwnProperty(prop)) {
                const val = this[prop];
                delete this[prop];
                this[prop] = val;
            }
        }
        /**
         * Private method, gets default options for the spinner according to the received options
         * that need to be overwritten.
         * @param {Object} opts - Object with options to overwrite:
         *   @prop {HTMLElement} parentContainer - Containing block for the spinner
         *   (Note: container should have CSS `position` property other than static)
         *   @prop {Object} direction - Custom directions to adjust spinner container manually
         *   @prop {Object} text - Options for the spinner's text element
         * @return {Object} - Object with all merged options
         */
        _getMergedOptions(opts) {
            opts = opts || {};
            const defOptions = {
                parentContainer: opts.parentContainer instanceof window.HTMLElement ? opts.parentContainer : this.parentElement,
                direction: _isObject(opts.direction) ? opts.direction : {},
                text: _isObject(opts.text) ? opts.text : {}
            };
            return defOptions;
        }

        /**
         * Private method, sets spinner's color
         * @param {HTMLElement} spinner - HTMLElement that represents spinner
         * @param {String} spinnerColor - CSS Valid value for the color/background properties in string representation, e.g. "grey"/"rgb(255, 30, 30)"/#f1f1f1
         */
        _setSpinnerColor(spinner, spinnerColor) {
            if (!spinnerColor) return;

            if (spinner) {
                this._setInlineStyles(spinner, { color: spinnerColor });
            }
        }

        /**
         * Private method, sets spinner's size (Example: 1 is 100%, 0.5 is 50%)
         * @param {HTMLElement} spinner - HTMLElement that represents spinner
         * @param {Number} spinnerSize - Spinner size in number representation where 1 is 100%
         */
        _setSpinnerSize(spinner, spinnerSize) {
            if (!_isValidNumber(spinnerSize)) return;

            if (spinner) {
                this._setInlineStyles(spinner, { "font-size": (spinnerSize + "rem") });
            }
        }

        /**
         * Private method, adjusts spinner position according to the received directions.
         * @param {HTMLElement} spinnerBodyElem - HTMLElement that represents spinner's body
         * @param {Object} direction - Custom directions to adjust spinner container manually
         */
        _adjustSpinnerDirection(spinnerBodyElem, direction) {
            direction = direction || {};
            if (spinnerBodyElem) {
                this._setInlineStyles(spinnerBodyElem, direction);
            }
        }

        /**
         * Private method, sets spinner's text size (Example: 1 is 100%, 0.5 is 50%)
         * @param {HTMLElement} spinnerTextElem - HTMLElement that represents spinner's text
         * @param {Number} spinnerTextSize - Spinner's text size in number representation where 1 is 100%
         */
        _setSpinnerTextSize(spinnerTextElem, spinnerTextSize) {
            if (!_isValidNumber(spinnerTextSize)) return;

            if (spinnerTextElem) {
                this._setInlineStyles(spinnerTextElem, { "font-size": (spinnerTextSize + "rem") });
            }
        }

        /**
         * Private method, sets spinner's text color
         * @param {HTMLElement} spinnerTextElem - HTMLElement that represents spinner's text
         * @param {String} spinnerTextColor - CSS Valid value for the color/background properties in string representation, e.g. "grey"/"rgb(255, 30, 30)"/#f1f1f1
         */
        _setSpinnerTextColor(spinnerTextElem, spinnerTextColor) {
            if (!spinnerTextColor) return;

            if (spinnerTextElem) {
                this._setInlineStyles(spinnerTextElem, { color: spinnerTextColor });
            }
        }

        /**
         * Private method, adjusts spinner's text position according to the received directions.
         * @param {HTMLElement} spinnerTextElem - HTMLElement that represents spinner's text
         * @param {Object} direction - Custom directions to adjust spinner's text element manually
         */
        _adjustSpinnerTextDirection(spinnerTextElem, direction) {
            direction = direction || {};
            if (spinnerTextElem) {
                this._setInlineStyles(spinnerTextElem, direction);
            }
        }

        /**
         * Private method, sets spinner's text value
         * @param {HTMLElement} spinnerTextElem - HTMLElement that represents spinner's text
         * @param {String} spinnerText - Spinner's text value
         */
        _setSpinnerTextValue(spinnerTextElem, spinnerText) {
            if (spinnerTextElem) {
                spinnerTextElem.textContent = spinnerText;
            }
        }

        /**
         * Private method, resets all the styles that have been previously set.
         */
        _resetSpinner(spinner) {
            this._removeInlineStyle(spinner);
            const spinnerChildren = Array.from(this.shadowRoot.querySelectorAll("[style]")); // all children that have inline style

            if (spinnerChildren.length > 0) {
                spinnerChildren.forEach(function (elem) {
                    this._removeInlineStyle(elem);
                }, this);
            }
            const spinnerText = spinner.querySelector(`#spinnerText`);
            if (spinnerText) {
                this._setSpinnerTextValue(spinnerText, "");
            }
        }

        /**
         * Private method, sets inline styles on provided HTMLElement.
         * @param {HTMLElement} htmlElem - HTMLElement on which inline styles should be set
         * @param {Object} stylesObj - Object with values to set as inline styles on HTMLElement (@see @htmlElem)
         * (Note: @stylesObj properties names should match styles names of HTMLElement, e.g. webkitTransfrom)
         */
        _setInlineStyles(htmlElem, stylesObj) {
            for (var prop in stylesObj) {
                var stylePropVal = stylesObj[prop];
                if (stylePropVal) {
                    htmlElem.style[prop] = stylePropVal;
                }
            }
        }

        /**
         * Private method, method that removes, previously set, inline style from the provided element
         * @param {HTMLElement} elem - HTMLElement from which inline style should be removed.
         */
        _removeInlineStyle(elem) {
            elem.removeAttribute("style");
        }

        /**
         * Set `aria-busy` attribute on the component's parent element, if exists
         * @param {Boolean} isBusy - Determine whether `aria-busy` shoud be set 
         */
        __setAriaBusy(isBusy) {
            if (!this.parentElement) { return; }

            if (isBusy) {
                this.parentElement.setAttribute("aria-busy", isBusy);
            } else {
                this.parentElement.removeAttribute("aria-busy");
            }
        }

        /**
         * Sets Aria Label related attributes on the component
         */
        __setAriaLabel() {
            const spinnerText = this.shadowRoot.getElementById("spinnerText");
            // if spinner text doesn't have a value we set "aria-label" on the component
            if (spinnerText && !spinnerText.textContent.trim()) {
                this.removeAttribute("aria-labelledby");
                const ariaLabelValue = this.getAttribute("aria-label");
                if (!ariaLabelValue) {
                    const ariaLabelDefaultValue = "loading";
                    this.setAttribute("aria-label", ariaLabelDefaultValue);
                }
            } else {
                this.removeAttribute("aria-label");
                this.setAttribute("aria-labelledby", "spinnerText");
            }
        }

        /**
        * Creates and dispateches Custom Event
        *  @param {Object} externalEventArgs - Event arguments from the external source (like external event) [optional]
        **/
        __dispatchCustomEvent(externalEventArgs) {
            const customEventArgs = {
                detail: {
                    isShown: externalEventArgs.isShown
                },
                bubbles: true
            };

            const customChangeEvent = new CustomEvent(externalEventArgs.eventName, customEventArgs);

            this.dispatchEvent(customChangeEvent);
        }

        /*===========================
        PRIVATE EVENT HANDLERS 
        =============================*/
        __onSpinnerShow(e) {
            this.__dispatchCustomEvent({ eventName: "show", isShown: true });
        }

        __onSpinnerHide(e) {
            this.__dispatchCustomEvent({ eventName: "hide", isShown: false });
        }

    };

    /** UTILITY FUNCTIONS **/
    function _getHtmlContent() {
        const styles = _getCssContent();
        const template = document.createElement("template");
        template.innerHTML = `
      <style>
      ${styles}
      </style>
      <div id="spinner" class="o-spinner">
        <div id="spinnerBody" class="o-spinner__body">
            <ul class="o-spinner__items" aria-hidden="true">
                <li class="o-spinner__item"></li>
                <li class="o-spinner__item"></li>
                <li class="o-spinner__item"></li>
                <li class="o-spinner__item"></li>
                <li class="o-spinner__item"></li>
                <li class="o-spinner__item"></li>
                <li class="o-spinner__item"></li>
                <li class="o-spinner__item"></li>
                <li class="o-spinner__item"></li>
                <li class="o-spinner__item"></li>
                <li class="o-spinner__item"></li>
                <li class="o-spinner__item"></li>
            </ul>
            <p class="o-spinner__text" id="spinnerText"></p>
        </div>
      </div>
      `;
        return template.content.cloneNode(true);
    };

    function _getCssContent() {
        return `
        /*========================
                Spinner
        ==========================*/
        /**
         Initial style of the switch-component
         1. Nothing outside the element may affect its internal layout & vice versa.
         2. This is a Hack, we use it in order to set background-color of the each .o-spinner__item as currentColor 
        **/
        :host {
            --hue: 0;
            --lightness: 100%;
            --saturation: 46%;
            --alpha: 0;

            --box-shadow-hue: var(--hue);
            --box-shadow-lightness: var(--lightness);
            --box-shadow-alpha: var(--alpha);
            --box-shadow-saturation: 18%;

            --box-shadow-x: 0px;
            --box-shadow-y: 0px;
            --box-shadow-blur: 3px;
            --box-shadow-spread: 0px;

            --spinner--color: hsla(var(--hue), var(--lightness), var(--saturation), var(--alpha));
            --spinner--size: 1rem;
            --spinner--box-shadow: var(--box-shadow-x) var(--box-shadow-y) var(--box-shadow-blur) var(--box-shadow-spread) hsla(var(--box-shadow-hue), var(--box-shadow-lightness), var(--box-shadow-saturation), var(--box-shadow-alpha));
            --spinner--text-color: var(--spinner--color);
            --spinner--backdrop: rgba(0, 0, 0, 0);
            --spinner--text-size: var(--spinner--size);

            --spinner--direction-left: 50%;
            --spinner--direction-top: 50%;

            --spinner-text-direction-left: 0;
            --spinner-text-direction-top: 0;

            position: absolute;
            left: 0; top: 0;
            width: 100%; height: 100%;
            contain: layout; /*[1]*/
            font-size: var(--spinner-size);
            background: var(--spinner--backdrop);
            color: var(--spinner--color); /*[2]*/
            z-index: 9999;
        }

        :host([hidden]) {
            display: none;
        }

        /*========================
            Spinner Body
        ==========================*/
        .o-spinner__body {
            position: absolute;
            left: var(--spinner--direction-left);
            top: var(--spinner--direction-top);
            -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
        }

        /*========================
            Spinner Items
        ==========================*/
        .o-spinner__items {
            width: 9.375em; /*~150px*/
            height: 9.375em; /*~150px*/
            margin: 0 auto;
            padding: 0;
            list-style: none;
            -webkit-animation: spinner-rotate 1s steps(12, end) infinite;
            animation: spinner-rotate 1s steps(12, end) infinite;
        }

        /*========================
            Spinner Item
        ==========================*/
        /*
        1. Compensates item's width by a half.
        2. Half of the parent's container height.
        3. Removes inherited "display: list-item" value
        4. This is a Hack, we use it in order to set background-color of the each .o-spinner__item as currentColor
        and be able to change this color on the parent, it will be inhereted by all its children
        which are list items with the class .o-spinner__item. (currentColor represents color value of the color property it can be inhereted from the parent)
        */
        .o-spinner__item {
            display: block; /*[3]*/
            position: absolute;
            left: 50%;
            width: 0.625em; /*~10px*/
            height: 2.5em; /*~40px*/
            margin-left: -0.3125em; /*~-5px*/ /*[1]*/
            -webkit-transform-origin: 50% 4.6875em; /*~75px*/ /*[2]*/
            transform-origin: 50% 4.6875em; /*~75px*/ /*[2]*/
            border-radius: 9px;
            background: currentColor; /*[4]*/
            box-shadow: var(--spinner--box-shadow);
        }

        .o-spinner__item:nth-child(1) {
            opacity: 0.8;
        }

        .o-spinner__item:nth-child(2) {
            opacity: 0.167;
            -webkit-transform: rotate(30deg);
            transform: rotate(30deg);
        }

        .o-spinner__item:nth-child(3) {
            opacity: 0.25;
            -webkit-transform: rotate(60deg);
            transform: rotate(60deg);
        }

        .o-spinner__item:nth-child(4) {
            opacity: 0.33;
            -webkit-transform: rotate(90deg);
            transform: rotate(90deg);
        }

        .o-spinner__item:nth-child(5) {
            opacity: 0.4167;
            -webkit-transform: rotate(120deg);
            transform: rotate(120deg);
        }

        .o-spinner__item:nth-child(6) {
            opacity: 0.5;
            -webkit-transform: rotate(150deg);
            transform: rotate(150deg);
        }

        .o-spinner__item:nth-child(7) {
            opacity: 0.583;
            -webkit-transform: rotate(180deg);
            transform: rotate(180deg);
        }

        .o-spinner__item:nth-child(8) {
            opacity: 0.67;
            -webkit-transform: rotate(210deg);
            transform: rotate(210deg);
        }

        .o-spinner__item:nth-child(9) {
            opacity: 0.75;
            -webkit-transform: rotate(240deg);
            transform: rotate(240deg);
        }

        .o-spinner__item:nth-child(10) {
            opacity: 0.833;
            -webkit-transform: rotate(270deg);
            transform: rotate(270deg);
        }

        .o-spinner__item:nth-child(11) {
            opacity: 0.9167;
            -webkit-transform: rotate(300deg);
            transform: rotate(300deg);
        }

        .o-spinner__item:nth-child(12) {
            opacity: 1;
            -webkit-transform: rotate(330deg);
            transform: rotate(330deg);
        }

        /**
            1. Set to be able to adjust text's position (e.g. top: 3px;)
        **/
        .o-spinner__text {
            position: relative; /*[1]*/
            left: var(--spinner-text-direction-left);
            top: var(--spinner-text-direction-top);
            font-size: var(--spinner--text-size);
            color: var(--spinner--text-color);
            text-align: center;
        }

        .o-spinner__text:empty {
            display: none;
        }

        /*===================
            @KeyFrames
        =====================*/
        @-webkit-keyframes spinner-rotate {
            0% {
                -webkit-transform: rotate(0deg);
            }
            100% {
                -webkit-transform: rotate(360deg);
            }
        }

        @keyframes spinner-rotate {
            0% {
                transform: rotate(0);
            }          
            100% {
                transform: rotate(360deg);
            }
        }
        `;
    }

    /**
     * Determines whether provided input element is an Object
     * @param {any} obj - Input to check
     * @returns {Boolean} - True if provided input is an Object, otherwise returns False
     */
    function _isObject(obj) { // Array won't pass this validation
        return obj && typeof obj === "object" && !(obj instanceof Array);
    }

    /*
     * Determines if input is a valid number
     * @param {any} num - Value to check
     * @return {boolean} - True if input value is a valid number, otherwise returns False
     */
    function _isValidNumber(num) {
        return !isNaN(parseFloat(num)) && isFinite(num);
    };

    customElements.define("spinner-component", SpinnerComponent);

})();
