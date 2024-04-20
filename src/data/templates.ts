export const checkoutTemplate = `
<!doctype html>
<html amp4email data-css-strict>

<head>
    <meta charset="utf-8">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-list" src="https://cdn.ampproject.org/v0/amp-list-0.1.js"></script>
    <script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>
    <script async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js"></script>
    <script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"></script>
    <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>
    <style amp4email-boilerplate>
        body {
            visibility: hidden;
        }
    </style>

    <style amp-custom>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        h1 {
            font-size: 14px;
            font-weight: 600;
        }

        p {
            font-size: 12px;
            font-weight: 500;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
        }

        .product {
            width: 200px;
            align-self: stretch;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            padding-top: 16px;
            padding-bottom: 16px;
        }

        .productImage {
            object-fit: contain;
            margin: 0;
        }

        .productDetails {
            margin-top: 8px;
        }

        .productImages {
            border-radius: 8px;
        }

        .actions {
            margin-top: 16px;
        }

        .amp-carousel-button-prev,
        .amp-carousel-button-next {
            border-radius: 50%;
            cursor: pointer;
            outline: none;
        }

        input {
            width: 100%;
            padding: 10px 16px;
            border: 2px solid #aaabbb66;
            outline: none;
            border-radius: 8px;
        }

        .list-overflow {
            background: rgb(255, 255, 255);
            background: linear-gradient(to bottom, #ffffff00 0, #ffffffff 100%);
            bottom: 0%;
            width: 100%;
            height: 80px;
            z-index: 50;
            justify-content: center;
            align-items: end;
        }

        .btn {
            height: 40px;
            padding: 8px 16px;
            border: 2px solid #000;
            font-weight: 500;
            background: transparent;
            cursor: pointer;
            position: relative;
            display: flex;
            align-items: center;
            gap: 6px;
            border-radius: 6px;
            font-weight: 600;
        }

        .btn.filled {
            background-color: #000;
            color: #fff;
        }

        .btn:hover {
            background-color: #00000015;
        }

        .btn.filled:hover {
            background-color: #fff;
            color: #000;
        }

        .linkBtn {
            padding: 0;
            border: none;
            text-decoration: underline;
            color: #aaabbbff;
            font-size: 12px;
            font-weight: 400;
            cursor: pointer;
            height: auto;
        }

        .linkBtn:hover {
            background-color: transparent;
            color: #000;
        }

        a {
            width: 100%;
            text-align: center;
            text-decoration: none;
            color: inherit;
        }

        .quantityBtn {
            height: 32px;
            width: 32px;
            border-radius: 50%;
            border: 1px solid #000;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            background-color: transparent;
            cursor: pointer;
        }

        .quantityBtn:hover {
            background-color: #00000015;
        }

        .ampListBestSeller>div {
            display: flex;
            gap: 16px;
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            position: relative;
        }

        .cartButtonIcon {
            background: url('https://static.thenounproject.com/png/117629-200.png');
            height: 24px;
            width: 24px;
            background-size: contain;
            background-repeat: no-repeat;
        }

        .cartButtonIconLoader {
            background: url("https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca.gif");
            height: 24px;
            width: 24px;
            background-size: contain;
            background-repeat: no-repeat;
        }

        .lineItemOuter {
            position: relative;

        }

        .lineItemLoader {
            background-color: #00000050;
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }


        .lineItemLoaderHidden {
            height: 0%;
        }

        .ampListBetSellerContainer {
            padding: 0px 16px;
        }

        .icon-close-white {
            width: 24px;
            height: 24px;
            background-size: 24px 24px;
            background-image: url(https://i.postimg.cc/mgZy82sq/icons8-close-48.png);
            background-repeat: no-repeat;
            display: inline-block
        }

        .interactive {
            padding: 0px 16px;
        }

        .interactiveInner {
            border-radius: 8px;
            box-shadow: rgba(0, 0, 0, 0.1) 0px 3px 8px;
            border: 1px solid #ebebeb;
        }

        .big-spinner {
            position: absolute;
            z-index: 20;
            left: 0;
            right: 0;
            margin-left: auto;
            margin-right: auto;
            height: 0px;
            width: 0px;
            border-radius: 50%;
            border: 6px solid #FF4B00;
            border-top: 5px solid transparent;
            background-color: transparent;
        }

        .btn-spinner {
            height: 0px;
            width: 0px;
            border-radius: 50%;
            border: 4px solid #FF4B00;
            border-top: 4px solid transparent;
            background-color: transparent;
        }

        .spinner-rotate {
            opacity: 1;
            transition: transform 100000s;
            transform: rotate(100000000deg);
            height: 20px;
            width: 20px;
        }

        .big-spinner-rotate {
            opacity: 1;
            transition: transform 100000s;
            transform: rotate(100000000deg);
            height: 45px;
            width: 45px;
        }

        .spinner-hide {
            border: transparent;
        }

        .custom-option-list {
            max-height: 200px;
            position: absolute;
            width: calc(100% - 2px);
            padding: 0;
            margin: 0;
            background: #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, .08), inset 0 0 0 1px rgba(0, 0, 0, .16);
            border-radius: 8px;
            z-index: 100;
            padding: 8px;
            margin-top: 4px;
            margin-left: -2px;
            overflow-y: scroll;
        }

        .custom-option {
            background: url(https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/down-arrow.png) no-repeat right calc(calc(18px * 0.7) - 4px) center/1rem;
            border-radius: 6px;
            border: 1px solid #aaabbb66;
            height: 40px;
            font-size: 14px;
            width: 100%;
            margin: 1px;
            color: #444444;
            appearance: none
        }

        .custom-option:hover {
            border: 1px solid #000;
        }

        .custom-option-selected {
            border: 1px solid #000;

        }


        .custom-option-container {
            height: 40px;
            z-index: 99;
            margin: 0;
            cursor: pointer;
            padding: 0 calc(18px * 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center
        }

        .custom-option-cell {
            height: 34px;
            padding: 2px 6px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background-color: transparent;
        }

        .custom-option-cell:hover {
            background: rgba(0, 0, 0, .08);
            border-radius: 4px
        }

        .item-option {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
            align-items: center;
            margin: calc(calc(18px * 0.4) - 2px) 0;
        }

        .outside-label {
            display: flex;
            position: absolute;
            top: 11px;
            right: 0;
            left: 8px;
            box-sizing: border-box;
            text-align: left;
            font-size: 14px;
            background-color: transparent;
            z-index: 4;
            transform-origin: left center;
            transform: scale(.7) translate(0, -28px);
            transition: transform .2s ease-in-out
        }



        @media (max-width:600px) {
            .slides-mobile {
                display: block;
            }

            .slides-desktop {
                display: none;
            }
        }

        @media (min-width:600px) {
            .slides-desktop {
                display: block;
            }

            .slides-mobile {
                display: none;
            }
        }
    </style>



</head>

<body>
    <amp-state id="zamaState">
        <script type="application/json">
        {
          "addingToCart": -1,
          "updatingItem":-1,
          "disableCheckout": "true",
          "applyingDiscount":"false",
          "removingDiscount": "false",
          "learnMoreOpen": false,
          "revealDiscount": false,
          "optionExpanded":""
        }
      </script>
    </amp-state>

    <div class="banner">
        <div style="border-radius: 8px; background-color: #F4F4F6; font-size: 14px;">
            <div [hidden]="zamaState.learnMoreOpen" style="padding: 16px;">
                <div style="display: flex; align-items: center; justify-content: flex-start;">
                    <amp-img style="margin:-30px;" height="60" width="60" layout="fixed"
                        src="https://s6.gifyu.com/images/S6r3u.gif"></amp-img>
                    <div style="font-weight:300; margin: 0px 20px;">This is an
                        interactive email</div>
                    <div style="font-weight:500; margin-left:auto; cursor: pointer;" tabindex="1" role=""
                        on="tap:AMP.setState({ zamaState: { learnMoreOpen: true } })">
                        Learn More</div>
                </div>
            </div>
            <div hidden="" [hidden]="!zamaState.learnMoreOpen" class="slides-desktop"
                style="position:relative;padding: 16px;">
                <div class="close-button"
                    style="position: absolute;cursor:pointer; z-index: 10; background-color: rgba(0,0,0,.5); width: 32px; height: 32px; border-radius: 50%; top: 8px;right: 8px; display: flex; align-items: center; justify-content: center; "
                    tabindex="1" role="" on="tap:AMP.setState({zamaState: {learnMoreOpen: false}})">
                    <div class="icon-close-white"></div>
                </div>
                <div style="display: flex;align-items: center">
                    <div
                        style="padding: 12px;min-height:225px; min-width:300px;display: flex;flex-direction: column;justify-content: center;">
                        <amp-img style="border-radius: 8px" layout="responsive" height="225" width="400"
                            src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/sign/zama/assets/interactive.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ6YW1hL2Fzc2V0cy9pbnRlcmFjdGl2ZS53ZWJwIiwiaWF0IjoxNzA5NjU5NTcxLCJleHAiOjIwMjUwMTk1NzF9.24mXPhbpmqYgx3IKVzD6JeqAI7aWUscYEbOLPMmq9ZE"></amp-img>
                    </div>
                    <div>
                        <div style="padding: 12px;font-weight: 600; font-size: 24px; color: #444; text-align: left">
                            This is an interactive email
                        </div>
                        <div style="padding: 12px; font-weight: 300; font-size: 16px; color: #444; text-align: left">
                            You can now click on buttons, fill out forms, and more without leaving your inbox.
                        </div>
                    </div>
                </div>
            </div>
            <div hidden="" [hidden]="!zamaState.learnMoreOpen" class="slides-mobile"
                style="position:relative;padding: 16px;">
                <div class="close-button"
                    style="position: absolute;cursor:pointer; z-index: 10; background-color: rgba(0,0,0,.5); width: 32px; height: 32px; border-radius: 50%; top: 8px;right: 8px; display: flex; align-items: center; justify-content: center; "
                    tabindex="1" role="" on="tap:AMP.setState({zamaState: {learnMoreOpen: false}})">
                    <div class="icon-close-white"></div>
                </div>
                <div style="flex-direction: column;display: flex;align-items: center;">
                    <amp-img style="border-radius: 8px" height="225" width="400" layout="fixed"
                        src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/sign/zama/assets/interactive.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ6YW1hL2Fzc2V0cy9pbnRlcmFjdGl2ZS53ZWJwIiwiaWF0IjoxNzA5NjU5NTcxLCJleHAiOjIwMjUwMTk1NzF9.24mXPhbpmqYgx3IKVzD6JeqAI7aWUscYEbOLPMmq9ZE"></amp-img>
                </div>
                <div style="padding-top: 12px;font-weight: 600; font-size: 24px;text-align: center">
                    This is an interactive email
                </div>
                <div style="padding: 12px 18px 18px 18px; font-weight: 300; font-size: 16px;text-align: center">
                    You can now click on buttons, fill out forms, and more without leaving your inbox.
                </div>
            </div>
        </div>
        <div style="width: 100%; height:20px"></div>
    </div>
    <div class="outerContainer" style="padding: 16px;">
        <div class="container">
            <div style="padding: 16px;display: flex; justify-content: space-between;align-items: center;gap: 16px;">
                <div style="width: 150px;">
                    <amp-img
                        src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/zama_full.png"
                        height="38" width="112" layout="fixed"></amp-img>
                </div>
                <div style="display: flex;gap: 4px;flex-grow: 1;">

                    <a href="http://zama-merchant.myshopify.com" style="font-size: 14px;" target="_blank"
                        rel="noopener noreferrer">Shopify
                        Shop</a>
                    <a href="http://zama.agency" style="font-size: 14px;" target="_blank" rel="noopener noreferrer">Zama
                        (Product)</a>
                </div>
            </div>
            <div>
                <amp-img
                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/zama_banner.png"
                    alt="zama_banner" layout="responsive" height="200" width="600"></amp-img>
            </div>
            <div style="padding:16px;">
                <h1 style="font-size: 24px;margin-bottom: 24px;text-align: center;">You cart has abandonment issues...
                </h1>
                <p style="font-size: 14px;margin-bottom: 8px;">Hey there,</p>
                <p style="font-size: 14px;margin-bottom: 8px;">We noticed you left some items in your shopping cart</p>
                <p style="font-size: 14px;margin-bottom: 8px;">Save it hours of therapy, buy them quickly</p>
                <p style="font-size: 14px;margin-bottom: 8px;">As we can see some of the products very popular (you have
                    a good taste) but
                    they might sell out soon, So hurry up and order today</p>
                <p style="font-size: 14px;margin-bottom: 8px;"></p>

            </div>
            <div style="height: 250px;background-color: #F6F4D2;margin-bottom: 24px;">
                <div [hidden]="zamaState.revealDiscount"
                    style="padding: 16px;height: 100%;display: flex;justify-content: center;align-items: flex-start;flex-direction: column;">
                    <h1 style="font-size: 20px;font-weight: 600;">Discount Hunt</h1>
                    <p style="font-size: 14px;margin: 8px 0px;">Click the button below and if you are lucky, you will
                        get a
                        discount coupon which can be used with
                        any order</p>
                    <button class="btn" style="margin-top: 16px;"
                        on="tap:AMP.setState({ zamaState: { revealDiscount: true } })">Reveal Discount</button>
                </div>

                <div hidden [hidden]="!zamaState.revealDiscount" class="discount">
                    <amp-list layout="fixed-height" height="250" binding="always"
                        src="{checkoutLink}"
                        items=".">
                        <template type="amp-mustache">
                            <div [hidden]="{{showDiscountSection}}"
                                style="padding: 16px;height: 250px;display: flex;justify-content: center;align-items: flex-start;flex-direction: column;">
                                <h1 style="font-size: 20px;font-weight: 600;">OOPS..!</h1>
                                <p style="font-size: 14px;margin: 8px 0px;">Sorry. No discount codes available at this
                                    time. </p>
                            </div>
                            <div [hidden]="{{!showDiscountSection}}"
                                style="padding: 16px;height: 250px;display: flex;justify-content: center;align-items: flex-start;flex-direction: column;">
                                <h1 style="font-size: 20px;font-weight: 600;">Discount Code: {{checkoutDiscountCode}}
                                </h1>
                                <p style="font-size: 14px;margin: 8px 0px;">You will get {{checkoutDiscountPercentage}}%
                                    discount upon applying
                                    this coupon, click the button below to apply it</p>
                                <button style="margin-top: 16px;" class="btn"
                                    on="tap:AMP.setState({ zamaState: { applyingDiscount: 'true' } }),apply_given_discount_form.submit()">Apply
                                    Coupon<div
                                        [class]="'btn-spinner ' + (zamaState.applyingDiscount == 'true' ? 'spinner-rotate' : 'spinner-hide')">
                                    </div></button>
                                <form method="post" id="apply_given_discount_form" action-xhr="{applyDiscountLink}"
                                    on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { applyingDiscount: '' } });submit-error:AMP.setState({ zamaState: { applyingDiscount: '' } })">
                                    <div style="display: flex;gap: 8px;">
                                        <input hidden type="text" required value="{{checkoutDiscountCode}}"
                                            name="discountCode" placeholder="Discount Code">
                                        <input type="text" hidden value="{{checkoutId}}" name="checkoutId">

                                    </div>

                                    <div submit-error style="margin-top: 4px;">
                                        <p style="color: red;font-size: 14px;">
                                            {{{message}}}
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </template></amp-list>
                </div>

            </div>
            <div class="interactive">
                <div class="interactiveInner">
                    <div style="padding: 16px;border-bottom: 1px solid #ebebeb;">
                        <h1 style="font-size: 20px;font-weight: 500;">Your Shopping Cart</h1>
                    </div>
                    <div>
                        <amp-list id="checkout" class="ampListCheckout" layout="fixed-height" height="450"
                            binding="always"
                            src="{checkoutLink}"
                            items=".">
                            <template type="amp-mustache">
                                {{#items}}
                                <div class="lineItemOuter">
                                    <div class="lineItem"
                                        style="margin-bottom: 8px;border-bottom: 1px solid #aaabbb66; padding: 16px;">
                                        <div
                                            style="display: flex;justify-content: space-between;align-items: center; margin-bottom: 16px;">
                                            <h1 title="{{title}}" style="font-size: 16px;font-weight: 600;">
                                                {{title}}</h1>
                                            <div style="display: flex;gap: 4px;align-items: center;">
                                                <p style="font-size: 14px;"><b>{{price}}</b></p>
                                                <p style="font-size: 12px;text-decoration: line-through;">
                                                    {{comparePrice}}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            style="display: flex;align-items: center;justify-content: space-between;gap: 16px;">
                                            <div class="img" style="width: 250px;">
                                                <amp-carousel height="200" layout="fixed-height" type="slides"
                                                    role="region" aria-label="Basic usage carousel">
                                                    {{#images}}
                                                    <amp-img src="{{src}}" layout="fill" class="productImage"
                                                        alt="{{alt}}"></amp-img>
                                                    {{/images}}
                                                </amp-carousel>
                                            </div>
                                            <div
                                                style="flex-grow: 1; align-self: stretch;display: flex;flex-direction: column; width: 100%; justify-content: space-between;">
                                                <div>
                                                    <h1 style="margin-bottom: 8px;">Variants</h1>
                                                    <div>
                                                        {{#variants}}
                                                        <form method="post" action-xhr="{updateLineItemLink}"
                                                            on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { updatingItem: -1 } })"
                                                            id="update_line_item_{{index}}_{{variantIndex}}_form">

                                                            <input type="text" name="checkoutId" value="{{checkoutId}}"
                                                                placeholder="Checkout Id" hidden />
                                                            <input type="text" name="lineItemId" value="{{id}}"
                                                                placeholder="Line Item Id" hidden />
                                                            <input type="text" name="quantity" value="{{quantity}}"
                                                                placeholder="Quantity" hidden />
                                                            <input type="text" name="operation" value="?"
                                                                placeholder="Operation" hidden />
                                                            <input hidden name="variantId" value="{{vId}}" />
                                                        </form>
                                                        {{/variants}}
                                                        <div class="item-option">
                                                            <div
                                                                style="display: inline-flex; position: relative; align-items: baseline; width: 100%">
                                                                <div [class]="zamaState.optionExpanded == 'variant_selector_{{index}}'?'custom-option custom-option-selected':'custom-option'"
                                                                    id="variant_selector_{{index}}">
                                                                    <div class="custom-option-container" on="tap:AMP.setState({zamaState: { optionExpanded: zamaState.optionExpanded == 'variant_selector_{{index}}'?'':'variant_selector_{{index}}'}}),
                                                                    checkout.changeToLayoutContainer()">
                                                                        <p tabindex="" role="">
                                                                            {{variantTitle}}
                                                                        </p>
                                                                    </div>
                                                                    <ul class="custom-option-list" hidden=""
                                                                        [hidden]="zamaState.optionExpanded != 'variant_selector_{{index}}'">
                                                                        {{#variants}}
                                                                        <div class="custom-option-cell"
                                                                            on="tap:AMP.setState({ zamaState: { updatingItem: {{index}}, optionExpanded:'' }}),update_line_item_{{index}}_{{variantIndex}}_form.submit"
                                                                            [hidden]="'{{title}}' == '{{variantTitle}}'"
                                                                            role="" tabindex="">
                                                                            <p
                                                                                style="height: 35px;font-size: 14px;display: flex;align-items: center;cursor: pointer;">
                                                                                {{title}}
                                                                            </p>
                                                                        </div>
                                                                        {{/variants}}
                                                                    </ul>
                                                                </div>
                                                                <label class="outside-label"
                                                                    style="display: flex; flex-direction: row; justify-content: space-between; color: #00000010">
                                                                    <span style="padding: 0 4px;">{{name}}</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        style="display: flex; gap: 12px;align-items: center;margin-top: 16px;">
                                                        <form method="post" action-xhr="{updateLineItemLink}"
                                                            on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { updatingItem: -1 } })"
                                                            id="reduce_line_item_{{index}}">
                                                            <input type="text" name="variantId" value="{{variantId}}"
                                                                placeholder="Variant Id" hidden />
                                                            <input type="text" name="checkoutId" value="{{checkoutId}}"
                                                                placeholder="Checkout Id" hidden />
                                                            <input type="text" name="lineItemId" value="{{id}}"
                                                                placeholder="Line Item Id" hidden />
                                                            <input type="text" name="quantity" value="{{quantity}}"
                                                                placeholder="Quantity" hidden />
                                                            <input type="text" name="operation" value="-"
                                                                placeholder="Operation" hidden />
                                                        </form>
                                                        <div
                                                            style="display: flex;justify-content: flex-start;gap: 16px;align-items: center;">

                                                            <button
                                                                on="tap:AMP.setState({ zamaState: { updatingItem: {{index}} } }), reduce_line_item_{{index}}.submit"
                                                                tabindex="1" role="" class="quantityBtn">
                                                                <amp-img
                                                                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/minus.png"
                                                                    alt="minus" height="45" width="18"
                                                                    layout="fixed"></amp-img></button>
                                                            <p style="font-size: 18px;font-weight: 600;">
                                                                {{quantity}}
                                                            </p>
                                                            <button
                                                                on="tap:AMP.setState({ zamaState: { updatingItem: {{index}} } }), add_line_item_{{index}}.submit"
                                                                tabindex="1" role="" class="quantityBtn">
                                                                <amp-img
                                                                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/plus.png"
                                                                    alt="plus" height="16" width="16"
                                                                    layout="fixed"></amp-img>
                                                            </button>
                                                        </div>
                                                        <form method="post" action-xhr="{updateLineItemLink}"
                                                            on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { updatingItem: -1 } })"
                                                            id="add_line_item_{{index}}">
                                                            <input type="text" name="variantId" value="{{variantId}}"
                                                                placeholder="Variant Id" hidden />
                                                            <input type="text" name="checkoutId" value="{{checkoutId}}"
                                                                placeholder="Checkout Id" hidden />
                                                            <input type="text" name="lineItemId" value="{{id}}"
                                                                placeholder="Line Item Id" hidden />
                                                            <input type="text" name="quantity" value="{{quantity}}"
                                                                placeholder="Quantity" hidden />
                                                            <input type="text" name="operation" value="+"
                                                                placeholder="Operation" hidden />
                                                        </form>
                                                    </div>
                                                </div>
                                                <div>

                                                    <form method="post" id="remove_line_item_{{index}}"
                                                        action-xhr="{removeLineItemLink}"
                                                        on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { updatingItem: -1 } })">
                                                        <div>
                                                            <input type="text" name="lineItemId" value="{{id}}"
                                                                placeholder="Line Item Id" hidden />
                                                            <input type="text" name="checkoutId" value="{{checkoutId}}"
                                                                placeholder="Checkout Id" hidden />
                                                        </div>
                                                    </form>
                                                    <button tabindex="1" role="" class="btn linkBtn"
                                                        on="tap:AMP.setState({ zamaState: { updatingItem: {{index}} } }), remove_line_item_{{index}}.submit">Remove</button>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        [class]="(zamaState.updatingItem == {{index}} ? 'lineItemLoader' : 'lineItemLoaderHidden')">
                                        <div
                                            [class]="'big-spinner ' + (zamaState.updatingItem == {{index}} ? 'big-spinner-rotate' : 'spinner-hide')">

                                        </div>
                                    </div>
                                </div>
                                {{/items}}
                                <div style="padding: 16px;">
                                    <form method="post" action-xhr="{applyDiscountLink}"
                                        on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { applyingDiscount: '' } });submit-error:AMP.setState({ zamaState: { applyingDiscount: '' } })">
                                        <div style="display: flex;gap: 8px;">
                                            <input type="text" required value="" name="discountCode"
                                                placeholder="Discount Code">
                                            <input type="text" hidden value="{{checkoutId}}" name="checkoutId">
                                            <button class="btn" tabindex="1" role=""
                                                on="tap:AMP.setState({ zamaState: { applyingDiscount: 'true' } })">
                                                <div
                                                    [text]="(zamaState.applyingDiscount == 'true' ? 'Submitting' : 'Submit')">
                                                </div>
                                                <div
                                                    [class]="'btn-spinner ' + (zamaState.applyingDiscount == 'true' ? 'spinner-rotate' : 'spinner-hide')">
                                                </div>
                                            </button>
                                        </div>

                                        <div submit-error style="margin-top: 4px;">
                                            <p style="color: red;font-size: 14px;">
                                                {{{message}}}
                                            </p>
                                        </div>
                                    </form>
                                </div>
                                <div style="padding: 16px; padding-top: 0px;">
                                    {{#discountCodes}}
                                    <form method="post" style="display: flex;gap: 8px;"
                                        action-xhr="{removeDiscountLink}"
                                        on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { removingDiscount: 'true' } })">
                                        <input type="text" hidden value="{{checkoutId}}" name="checkoutId">
                                        <button tabindex="1" role=""
                                            style="background-color: #ebebeb;padding: 8px 16px;border: none;outline: none;border-radius: 8px;cursor: pointer;">{{code}}
                                            &#10060;</button>
                                    </form>
                                    {{/discountCodes}}
                                </div>
                                <div style="padding: 16px;">
                                    <div
                                        style="border-top: 1px solid #aaabbb66;border-bottom: 1px solid #aaabbb66;margin-bottom: 16px;padding: 16px 0px;">
                                        <div
                                            style="margin-bottom: 8px;display: flex;justify-content: space-between;align-items: center;">
                                            <p style="font-size: 16px; font-weight: 400;color: #aaabbbff;">
                                                Subtotal
                                            </p>
                                            <p style="font-size: 16px;">{{subtotal}}</p>
                                        </div>
                                        <div
                                            style="margin-bottom: 8px;display: flex;justify-content: space-between;align-items: center;">
                                            <p style="font-size: 16px; font-weight: 400;color: #aaabbbff;">
                                                Discounts
                                            </p>
                                            <p style="font-size: 16px;">-{{discountAmount}}</p>

                                        </div>
                                        <div style="display: flex;justify-content: space-between;align-items: center;">
                                            <p style="font-size: 16px; font-weight: 400;color: #aaabbbff;">
                                                Taxes
                                            </p>
                                            <p style="font-size: 16px;">Calculated at next step</p>

                                        </div>

                                    </div>
                                    <div style="display: flex;justify-content: space-between;align-items: center;">
                                        <p style="font-size: 16px; font-weight: 600;">Total</p>
                                        <p style="font-size: 16px;">{{total}}</p>
                                    </div>
                                </div>
                            </template>
                            <div overflow class="list-overflow" style="display: flex;">
                                <h1 style="font-size: 18;font-weight: 600;">
                                    See more
                                </h1>
                                <div
                                    style="background-image: url('https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/chevron-down.png');height: 24px;width: 24px;background-size: 24px 24px;background-repeat: no-repeat;">
                                </div>
                            </div>
                        </amp-list>
                    </div>
                    <amp-list id="checkoutActions" class="ampListCheckoutActions" layout="fixed-height" height="100"
                        binding="always"
                        src="{checkoutLink}"
                        items=".">
                        <template type="amp-mustache">
                            <div
                                style="display: flex;flex-direction: column;justify-content: center;align-items: center; padding: 16px;">
                                <a class="btn" style="width: 100%;justify-content: center;" href="{{checkoutUrl}}"
                                    target="_blank">Checkout
                                    from email</a>
                                <p style="font-size: 12;font-weight: 400;margin-top: 8px;">Don't worry this is safe af
                                </p>
                            </div>
                        </template>
                    </amp-list>
                    <div
                        style="padding: 16px;display: flex;justify-content: space-between;border-bottom: 1px solid #ebebeb;">
                        <h1 style="font-size: 20px;font-weight: 500;">You may also Like</h1>
                    </div>
                    <div class="ampListBetSellerContainer">
                        <amp-list class="ampListBestSeller" layout="fixed-height" height="400" binding="always"
                            src="{bestSellerLink}">

                            <template type="amp-mustache">
                                <div class="product">
                                    <div class="productImages">
                                        <amp-carousel height="200" layout="fixed-height" type="slides" role="region"
                                            aria-label="Basic usage carousel">
                                            {{#images}}
                                            <amp-img src="{{src}}" layout="fill" class="productImage"
                                                alt="{{alt}}"></amp-img>
                                            {{/images}}
                                            {{^images}}
                                            <amp-img
                                                src="https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg"
                                                layout="fill" class="productImage" alt="No image placeholder"></amp-img>
                                            {{/images}}
                                        </amp-carousel>
                                    </div>
                                    <div
                                        style="display: flex;flex-direction: column; justify-content: space-between;flex-grow: 1;">
                                        <div class="productDetails">
                                            <div style="display: flex;gap: 4px;">
                                                <p style="font-size: 14px;"><b>{{variant.price}}</b></p>
                                                <p style="font-size: 12px;text-decoration: line-through;">
                                                    {{variant.compare_at_price}}
                                                </p>
                                            </div>
                                            <div>
                                                <h1>
                                                    {{title}}
                                                </h1>
                                                <div>
                                                    <div>
                                                        <p style="margin-top: 4px;">{{{body_html}}}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="actions">
                                            <form method="post" id="add_to_cart_{{index}}"
                                                action-xhr="{addLineItemLink}"
                                                on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { addingToCart: -1 } })">
                                                <div>
                                                    <input type="text" name="variantId" value="{{variant.id}}"
                                                        placeholder="Variant Id" hidden />
                                                    <input type="number" name="quantity" value="1"
                                                        placeholder="Quantity" hidden />
                                                    <input type="text" name="checkoutId" value="{{checkoutId}}"
                                                        placeholder="Checkout Id" hidden />
                                                      
                                                </div>

                                            </form>
                                            <button tabindex="1" role="" class="btn"
                                                on="tap:AMP.setState({ zamaState: { addingToCart: {{index}} } }), add_to_cart_{{index}}.submit">
                                                <p class="cart"
                                                    [text]="(zamaState.addingToCart == {{index}} ? 'Adding to cart' : 'Add to cart')">
                                                    Add To Cart
                                                <div
                                                    [class]="(zamaState.addingToCart == {{index}} ? '' : 'cartButtonIcon')">
                                                </div>
                                                <div
                                                    [class]="'btn-spinner ' + (zamaState.addingToCart == {{index}} ? 'spinner-rotate' : 'spinner-hide')">
                                                </div>
                                                </p>
                                            </button>

                                        </div>
                                    </div>
                                </div>

                            </template>

                        </amp-list>
                    </div>
                    <div style="display: flex;justify-content: flex-end;">
                        <div>
                            <a href="https://zama.agency" target="_blank"
                                style="padding: 16px;display: flex;align-items: center;gap: 8px;flex-grow: 0;">
                                <amp-img
                                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/zama_speaker.png"
                                    height="20" width="20" layout="fixed"></amp-img>
                                <p> Powered By Zama</p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div style="height: 2px;width: 100%;margin: 40px 0px;padding: 0px 16px;">
                <div style="background-color: #00000015;height: 100%;width: 100%;"></div>
            </div>

            <div style="display: flex;flex-direction: column;align-items: center;padding-bottom: 32px;">
                <amp-img
                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/zama_full.png"
                    alt="zama full" width="150" height="51" layout="fixed"></amp-img>
                <p style="font-size: 14px;margin-top: 8px;">Boost conversions with an engaging inbox experience</p>
                <p style="font-size: 14px;margin-top: 24px;">2024 | All Rights Reserved</p>
                <p style="font-size: 14px;margin-top: 8px;">Built with ❤️ By <a href="https://twitter.com/hyvip_ai"
                        target="_blank" rel="noopener noreferrer">Rajat Mondal</a></p>
            </div>

        </div>
    </div>
</body>

</html>
`;

export const checkoutFallbackTemplate = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
            padding: 16px;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
            margin:auto;
        }

        .btn {
            height: 40px;
            padding: 8px 16px;
            border: 2px solid #000;
            font-weight: 500;
            background: transparent;
            cursor: pointer;
            position: relative;
            gap: 6px;
            border-radius: 6px;
            font-weight: 600;
            display: block;
            text-decoration: none;
            color: #000!important;
            text-align: center;
        }

        .btn:hover {
            background-color: #00000015;
        }

        p {
            font-size: 14px;
        }
        .product{
            display: flex;
            gap: 16px;
            margin:16px auto;
        }
        .productDetails{
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 8px;
            margin-left:16px;
        }
    </style>
</head>

<body>
    <div class="outerContainer">
        <div class="container">
            <div style="padding:16px;">
                <div>
                    <h1 style="margin-bottom: 16px;">zama-merchant</h1>
                    <p style="margin-bottom: 8px;">You left items in your cart...</p>
                    <p style="margin-bottom: 8px;">Hi, you added items to your shopping cart and haven't completed your
                        purchase. You can complete
                        it
                        now
                        while they're still available.</p>
                    <p style="margin-bottom: 8px;">This is an example fallback template, even if your customers, don't
                        have dynamic email enabled,
                        they
                        will
                        be able to see the items and go to checkout from here</p>
                    <p style="margin-bottom: 16px;">To enable dynamic email go to settings > all settings > enable
                        dynamic email</p>
                    <a href="{abandonedCheckoutURL}" class="btn" style="width: 100%;justify-content: center;margin-bottom: 24px;">Go To
                        Checkout</a>
                </div>
                <div>
                        {{products}}
                </div>
            </div>
        </div>

    </div>
</body>

</html>
`;

export const upsellEmailTemplate = `
<!doctype html>
<html amp4email data-css-strict>

<head>
    <meta charset="utf-8">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-list" src="https://cdn.ampproject.org/v0/amp-list-0.1.js"></script>
    <script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>
    <script async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js"></script>
    <script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"></script>
    <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>
    <style amp4email-boilerplate>
        body {
            visibility: hidden;
        }
    </style>

    <style amp-custom>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        h1 {
            font-size: 14px;
            font-weight: 600;
        }

        p {
            font-size: 12px;
            font-weight: 500;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
        }

        .product {
            width: 200px;
            align-self: stretch;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            padding-top: 16px;
            padding-bottom: 16px;
        }

        .productImage {
            object-fit: contain;
            margin: 0;
        }

        .productDetails {
            margin-top: 8px;
        }

        .productImages {
            border-radius: 8px;
        }

        .actions {
            margin-top: 16px;
        }

        .amp-carousel-button-prev,
        .amp-carousel-button-next {
            border-radius: 50%;
            cursor: pointer;
            outline: none;
        }

        input {
            width: 100%;
            padding: 10px 16px;
            border: 2px solid #aaabbb66;
            outline: none;
            border-radius: 8px;
        }

        .list-overflow {
            background: rgb(255, 255, 255);
            background: linear-gradient(to bottom, #ffffff00 0, #ffffffff 100%);
            bottom: 0%;
            width: 100%;
            height: 80px;
            z-index: 50;
            justify-content: center;
            align-items: end;
        }

        .btn {
            height: 40px;
            padding: 8px 16px;
            border: 2px solid #000;
            font-weight: 500;
            background: transparent;
            cursor: pointer;
            position: relative;
            display: flex;
            align-items: center;
            gap: 6px;
            border-radius: 6px;
            font-weight: 600;
        }

        .btn.filled {
            background-color: #000;
            color: #fff;
        }

        .btn:hover {
            background-color: #00000015;
        }

        .btn.filled:hover {
            background-color: #fff;
            color: #000;
        }

        .linkBtn {
            padding: 0;
            border: none;
            text-decoration: underline;
            color: #aaabbbff;
            font-size: 12px;
            font-weight: 400;
            cursor: pointer;
            height: auto;
        }

        .linkBtn:hover {
            background-color: transparent;
            color: #000;
        }

        a {
            width: 100%;
            text-align: center;
            text-decoration: none;
            color: inherit;
        }

        .quantityBtn {
            height: 32px;
            width: 32px;
            border-radius: 50%;
            border: 1px solid #000;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            background-color: transparent;
            cursor: pointer;
        }

        .quantityBtn:hover {
            background-color: #00000015;
        }

        .ampListRecmmendation>div>div>div {
            display: flex;
            gap: 16px;
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            position: relative;
        }

        .cartButtonIcon {
            background: url('https://static.thenounproject.com/png/117629-200.png');
            height: 24px;
            width: 24px;
            background-size: contain;
            background-repeat: no-repeat;
        }

        .cartButtonIconLoader {
            background: url("https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca.gif");
            height: 24px;
            width: 24px;
            background-size: contain;
            background-repeat: no-repeat;
        }

        .lineItemOuter {
            position: relative;

        }

        .lineItemLoader {
            background-color: #00000050;
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }


        .lineItemLoaderHidden {
            height: 0%;
        }


        .icon-close-white {
            width: 24px;
            height: 24px;
            background-size: 24px 24px;
            background-image: url(https://i.postimg.cc/mgZy82sq/icons8-close-48.png);
            background-repeat: no-repeat;
            display: inline-block
        }

        .interactive {
            padding: 0px 16px;
        }

        .interactiveInner {
            border-radius: 8px;
            box-shadow: rgba(0, 0, 0, 0.1) 0px 3px 8px;
            border: 1px solid #ebebeb;
        }

        .big-spinner {
            position: absolute;
            z-index: 20;
            left: 0;
            right: 0;
            margin-left: auto;
            margin-right: auto;
            height: 0px;
            width: 0px;
            border-radius: 50%;
            border: 6px solid #FF4B00;
            border-top: 5px solid transparent;
            background-color: transparent;
        }

        .btn-spinner {
            height: 0px;
            width: 0px;
            border-radius: 50%;
            border: 4px solid #FF4B00;
            border-top: 4px solid transparent;
            background-color: transparent;
        }

        .spinner-rotate {
            opacity: 1;
            transition: transform 100000s;
            transform: rotate(100000000deg);
            height: 20px;
            width: 20px;
        }

        .big-spinner-rotate {
            opacity: 1;
            transition: transform 100000s;
            transform: rotate(100000000deg);
            height: 45px;
            width: 45px;
        }

        .spinner-hide {
            border: transparent;
        }

        .custom-option-list {
            max-height: 200px;
            position: absolute;
            width: calc(100% - 2px);
            padding: 0;
            margin: 0;
            background: #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, .08), inset 0 0 0 1px rgba(0, 0, 0, .16);
            border-radius: 8px;
            z-index: 100;
            padding: 8px;
            margin-top: 4px;
            margin-left: -2px;
            overflow-y: scroll;
        }

        .custom-option {
            background: url(https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/down-arrow.png) no-repeat right calc(calc(18px * 0.7) - 4px) center/1rem;
            border-radius: 6px;
            border: 1px solid #aaabbb66;
            height: 40px;
            font-size: 14px;
            width: 100%;
            margin: 1px;
            color: #444444;
            appearance: none
        }

        .custom-option:hover {
            border: 1px solid #000;
        }

        .custom-option-selected {
            border: 1px solid #000;

        }


        .custom-option-container {
            height: 40px;
            z-index: 99;
            margin: 0;
            cursor: pointer;
            padding: 0 calc(18px * 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center
        }

        .custom-option-cell {
            height: 34px;
            padding: 2px 6px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background-color: transparent;
        }

        .custom-option-cell:hover {
            background: rgba(0, 0, 0, .08);
            border-radius: 4px
        }

        .item-option {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
            align-items: center;
            margin: calc(calc(18px * 0.4) - 2px) 0;
        }

        .outside-label {
            display: flex;
            position: absolute;
            top: 11px;
            right: 0;
            left: 8px;
            box-sizing: border-box;
            text-align: left;
            font-size: 14px;
            background-color: transparent;
            z-index: 4;
            transform-origin: left center;
            transform: scale(.7) translate(0, -28px);
            transition: transform .2s ease-in-out
        }



        @media (max-width:600px) {
            .slides-mobile {
                display: block;
            }

            .slides-desktop {
                display: none;
            }
        }

        @media (min-width:600px) {
            .slides-desktop {
                display: block;
            }

            .slides-mobile {
                display: none;
            }
        }
    </style>



</head>

<body>
    <amp-state id="zamaState">
        <script type="application/json">
        {
          "addingToCart": -1,
          "updatingItem":-1,
          "disableCheckout": "true",
          "applyingDiscount":"false",
          "removingDiscount": "false",
          "learnMoreOpen": false,
          "revealDiscount": false,
          "optionExpanded":""
        }
      </script>
    </amp-state>

    <div class="banner">
        <div style="border-radius: 8px; background-color: #F4F4F6; font-size: 14px;">
            <div [hidden]="zamaState.learnMoreOpen" style="padding: 16px;">
                <div style="display: flex; align-items: center; justify-content: flex-start;">
                    <amp-img style="margin:-30px;" height="60" width="60" layout="fixed"
                        src="https://s6.gifyu.com/images/S6r3u.gif"></amp-img>
                    <div style="font-weight:300; margin: 0px 20px;">This is an
                        interactive email</div>
                    <div style="font-weight:500; margin-left:auto; cursor: pointer;" tabindex="1" role=""
                        on="tap:AMP.setState({ zamaState: { learnMoreOpen: true } })">
                        Learn More</div>
                </div>
            </div>
            <div hidden="" [hidden]="!zamaState.learnMoreOpen" class="slides-desktop"
                style="position:relative;padding: 16px;">
                <div class="close-button"
                    style="position: absolute;cursor:pointer; z-index: 10; background-color: rgba(0,0,0,.5); width: 32px; height: 32px; border-radius: 50%; top: 8px;right: 8px; display: flex; align-items: center; justify-content: center; "
                    tabindex="1" role="" on="tap:AMP.setState({zamaState: {learnMoreOpen: false}})">
                    <div class="icon-close-white"></div>
                </div>
                <div style="display: flex;align-items: center">
                    <div
                        style="padding: 12px;min-height:225px; min-width:300px;display: flex;flex-direction: column;justify-content: center;">
                        <amp-img style="border-radius: 8px" layout="responsive" height="225" width="400"
                            src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/sign/zama/assets/interactive.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ6YW1hL2Fzc2V0cy9pbnRlcmFjdGl2ZS53ZWJwIiwiaWF0IjoxNzA5NjU5NTcxLCJleHAiOjIwMjUwMTk1NzF9.24mXPhbpmqYgx3IKVzD6JeqAI7aWUscYEbOLPMmq9ZE"></amp-img>
                    </div>
                    <div>
                        <div style="padding: 12px;font-weight: 600; font-size: 24px; color: #444; text-align: left">
                            This is an interactive email
                        </div>
                        <div style="padding: 12px; font-weight: 300; font-size: 16px; color: #444; text-align: left">
                            You can now click on buttons, fill out forms, and more without leaving your inbox.
                        </div>
                    </div>
                </div>
            </div>
            <div hidden="" [hidden]="!zamaState.learnMoreOpen" class="slides-mobile"
                style="position:relative;padding: 16px;">
                <div class="close-button"
                    style="position: absolute;cursor:pointer; z-index: 10; background-color: rgba(0,0,0,.5); width: 32px; height: 32px; border-radius: 50%; top: 8px;right: 8px; display: flex; align-items: center; justify-content: center; "
                    tabindex="1" role="" on="tap:AMP.setState({zamaState: {learnMoreOpen: false}})">
                    <div class="icon-close-white"></div>
                </div>
                <div style="flex-direction: column;display: flex;align-items: center;">
                    <amp-img style="border-radius: 8px" height="225" width="400" layout="fixed"
                        src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/sign/zama/assets/interactive.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ6YW1hL2Fzc2V0cy9pbnRlcmFjdGl2ZS53ZWJwIiwiaWF0IjoxNzA5NjU5NTcxLCJleHAiOjIwMjUwMTk1NzF9.24mXPhbpmqYgx3IKVzD6JeqAI7aWUscYEbOLPMmq9ZE"></amp-img>
                </div>
                <div style="padding-top: 12px;font-weight: 600; font-size: 24px;text-align: center">
                    This is an interactive email
                </div>
                <div style="padding: 12px 18px 18px 18px; font-weight: 300; font-size: 16px;text-align: center">
                    You can now click on buttons, fill out forms, and more without leaving your inbox.
                </div>
            </div>
        </div>
        <div style="width: 100%; height:20px"></div>
    </div>
    <div class="outerContainer" style="padding: 16px;">
        <div class="container">
            <div style="padding: 16px;display: flex; justify-content: space-between;align-items: center;gap: 16px;">
                <div style="width: 150px;">
                    <amp-img
                        src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/zama_full.png"
                        height="38" width="112" layout="fixed"></amp-img>
                </div>
                <div style="display: flex;gap: 4px;flex-grow: 1;">

                    <a href="http://zama-merchant.myshopify.com" style="font-size: 14px;" target="_blank"
                        rel="noopener noreferrer">Shopify
                        Shop</a>
                    <a href="http://zama.agency" style="font-size: 14px;" target="_blank" rel="noopener noreferrer">Zama
                        (Product)</a>
                </div>
            </div>
            <div>
                <amp-img
                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/zama_banner.png"
                    alt="zama_banner" layout="responsive" height="200" width="600"></amp-img>
            </div>
            <div style="padding:16px;">
                <h1 style="font-size: 24px;margin-bottom: 24px;text-align: center;">
                    Introducing Our Newest Obsession!
                </h1>
                <p style="font-size: 14px;margin-bottom: 8px;">Hey there,</p>
                <p style="font-size: 14px;margin-bottom: 8px;">We couldn't wait to share this hot seller with you!</p>
                <p style="font-size: 14px;margin-bottom: 8px;">Don't miss out—grab yours now!</p>
                <p style="font-size: 14px;margin-bottom: 8px;"></p>

            </div>

            <div class="interactive">
                <div class="interactiveInner">
                    <div style="padding: 16px;border-bottom: 1px solid #ebebeb;">
                        <h1 style="font-size: 20px;font-weight: 500;">Your Shopping Cart</h1>
                    </div>
                    <div>
                        <amp-list id="checkout" class="ampListCheckout" layout="fixed-height" height="450"
                            binding="always" src="{checkoutLink}" items=".">
                            <template type="amp-mustache">
                                {{#items}}
                                <div class="lineItemOuter">
                                    <div class="lineItem"
                                        style="margin-bottom: 8px;border-bottom: 1px solid #aaabbb66; padding: 16px;">
                                        <div
                                            style="display: flex;justify-content: space-between;align-items: center; margin-bottom: 16px;">
                                            <h1 title="{{title}}" style="font-size: 16px;font-weight: 600;">
                                                {{title}}</h1>
                                            <div style="display: flex;gap: 4px;align-items: center;">
                                                <p style="font-size: 14px;"><b>{{price}}</b></p>
                                                <p style="font-size: 12px;text-decoration: line-through;">
                                                    {{comparePrice}}
                                                </p>
                                            </div>
                                        </div>
                                        <div
                                            style="display: flex;align-items: center;justify-content: space-between;gap: 16px;">
                                            <div class="img" style="width: 250px;">
                                                <amp-carousel height="200" layout="fixed-height" type="slides"
                                                    role="region" aria-label="Basic usage carousel">
                                                    {{#images}}
                                                    <amp-img src="{{src}}" layout="fill" class="productImage"
                                                        alt="{{alt}}"></amp-img>
                                                    {{/images}}
                                                </amp-carousel>
                                            </div>
                                            <div
                                                style="flex-grow: 1; align-self: stretch;display: flex;flex-direction: column; width: 100%; justify-content: space-between;">
                                                <div>
                                                    <h1 style="margin-bottom: 8px;">Variants</h1>
                                                    <div>
                                                        {{#variants}}
                                                        <form method="post" action-xhr="{updateLineItemLink}"
                                                            on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { updatingItem: -1 } })"
                                                            id="update_line_item_{{index}}_{{variantIndex}}_form">

                                                            <input type="text" name="checkoutId" value="{{checkoutId}}"
                                                                placeholder="Checkout Id" hidden />
                                                            <input type="text" name="upsellId" value="{{upsellId}}"
                                                                placeholder="Upsell Id" hidden />
                                                            <input type="text" name="lineItemId" value="{{id}}"
                                                                placeholder="Line Item Id" hidden />
                                                            <input type="text" name="quantity" value="{{quantity}}"
                                                                placeholder="Quantity" hidden />
                                                            <input type="text" name="operation" value="?"
                                                                placeholder="Operation" hidden />
                                                            <input hidden name="variantId" value="{{vId}}" />
                                                        </form>
                                                        {{/variants}}
                                                        <div class="item-option">
                                                            <div
                                                                style="display: inline-flex; position: relative; align-items: baseline; width: 100%">
                                                                <div [class]="zamaState.optionExpanded == 'variant_selector_{{index}}'?'custom-option custom-option-selected':'custom-option'"
                                                                    id="variant_selector_{{index}}">
                                                                    <div class="custom-option-container" on="tap:AMP.setState({zamaState: { optionExpanded: zamaState.optionExpanded == 'variant_selector_{{index}}'?'':'variant_selector_{{index}}'}}),
                                                                    checkout.changeToLayoutContainer()">
                                                                        <p tabindex="" role="">
                                                                            {{variantTitle}}
                                                                        </p>
                                                                    </div>
                                                                    <ul class="custom-option-list" hidden=""
                                                                        [hidden]="zamaState.optionExpanded != 'variant_selector_{{index}}'">
                                                                        {{#variants}}
                                                                        <div class="custom-option-cell"
                                                                            on="tap:AMP.setState({ zamaState: { updatingItem: {{index}}, optionExpanded:'' }}),update_line_item_{{index}}_{{variantIndex}}_form.submit"
                                                                            [hidden]="'{{title}}' == '{{variantTitle}}'"
                                                                            role="" tabindex="">
                                                                            <p
                                                                                style="height: 35px;font-size: 14px;display: flex;align-items: center;cursor: pointer;">
                                                                                {{title}}
                                                                            </p>
                                                                        </div>
                                                                        {{/variants}}
                                                                    </ul>
                                                                </div>
                                                                <label class="outside-label"
                                                                    style="display: flex; flex-direction: row; justify-content: space-between; color: #00000010">
                                                                    <span style="padding: 0 4px;">{{name}}</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        style="display: flex; gap: 12px;align-items: center;margin-top: 16px;">
                                                        <form method="post" action-xhr="{updateLineItemLink}"
                                                            on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { updatingItem: -1 } })"
                                                            id="reduce_line_item_{{index}}">
                                                            <input type="text" name="variantId" value="{{variantId}}"
                                                                placeholder="Variant Id" hidden />
                                                            <input type="text" name="checkoutId" value="{{checkoutId}}"
                                                                placeholder="Checkout Id" hidden />
                                                            <input type="text" name="upsellId" value="{{upsellId}}"
                                                                placeholder="upsell Id" hidden />
                                                            <input type="text" name="lineItemId" value="{{id}}"
                                                                placeholder="Line Item Id" hidden />
                                                            <input type="text" name="quantity" value="{{quantity}}"
                                                                placeholder="Quantity" hidden />
                                                            <input type="text" name="operation" value="-"
                                                                placeholder="Operation" hidden />
                                                        </form>
                                                        <div
                                                            style="display: flex;justify-content: flex-start;gap: 16px;align-items: center;">

                                                            <button
                                                                on="tap:AMP.setState({ zamaState: { updatingItem: {{index}} } }), reduce_line_item_{{index}}.submit"
                                                                tabindex="1" role="" class="quantityBtn">
                                                                <amp-img
                                                                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/minus.png"
                                                                    alt="minus" height="45" width="18"
                                                                    layout="fixed"></amp-img></button>
                                                            <p style="font-size: 18px;font-weight: 600;">
                                                                {{quantity}}
                                                            </p>
                                                            <button
                                                                on="tap:AMP.setState({ zamaState: { updatingItem: {{index}} } }), add_line_item_{{index}}.submit"
                                                                tabindex="1" role="" class="quantityBtn">
                                                                <amp-img
                                                                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/plus.png"
                                                                    alt="plus" height="16" width="16"
                                                                    layout="fixed"></amp-img>
                                                            </button>
                                                        </div>
                                                        <form method="post" action-xhr="{updateLineItemLink}"
                                                            on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { updatingItem: -1 } })"
                                                            id="add_line_item_{{index}}">
                                                            <input type="text" name="variantId" value="{{variantId}}"
                                                                placeholder="Variant Id" hidden />
                                                            <input type="text" name="checkoutId" value="{{checkoutId}}"
                                                                placeholder="Checkout Id" hidden />
                                                            <input type="text" name="upsellId" value="{{upsellId}}"
                                                                placeholder="upsell Id" hidden />
                                                            <input type="text" name="lineItemId" value="{{id}}"
                                                                placeholder="Line Item Id" hidden />
                                                            <input type="text" name="quantity" value="{{quantity}}"
                                                                placeholder="Quantity" hidden />
                                                            <input type="text" name="operation" value="+"
                                                                placeholder="Operation" hidden />
                                                        </form>
                                                    </div>
                                                </div>
                                                <div>

                                                    <form method="post" id="remove_line_item_{{index}}"
                                                        action-xhr="{removeLineItemLink}"
                                                        on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { updatingItem: -1 } })">
                                                        <div>
                                                            <input type="text" name="lineItemId" value="{{id}}"
                                                                placeholder="Line Item Id" hidden />
                                                            <input type="text" name="checkoutId" value="{{checkoutId}}"
                                                                placeholder="Checkout Id" hidden />
                                                            <input type="text" name="upsellId" value="{{upsellId}}"
                                                                placeholder="upsell Id" hidden />
                                                        </div>
                                                    </form>
                                                    <button tabindex="1" role="" class="btn linkBtn"
                                                        on="tap:AMP.setState({ zamaState: { updatingItem: {{index}} } }), remove_line_item_{{index}}.submit">Remove</button>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        [class]="(zamaState.updatingItem == {{index}} ? 'lineItemLoader' : 'lineItemLoaderHidden')">
                                        <div
                                            [class]="'big-spinner ' + (zamaState.updatingItem == {{index}} ? 'big-spinner-rotate' : 'spinner-hide')">

                                        </div>
                                    </div>
                                </div>
                                {{/items}}
                                <div style="padding: 16px;">
                                    <form method="post" action-xhr="{applyDiscountLink}"
                                        on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { applyingDiscount: '' } });submit-error:AMP.setState({ zamaState: { applyingDiscount: '' } })">
                                        <div style="display: flex;gap: 8px;">
                                            <input type="text" required value="" name="discountCode"
                                                placeholder="Discount Code">
                                            <input type="text" hidden value="{{checkoutId}}" name="checkoutId">
                                            <input type="text" hidden value="{{upsellId}}" name="upsellId">
                                            <button class="btn" tabindex="1" role=""
                                                on="tap:AMP.setState({ zamaState: { applyingDiscount: 'true' } })">
                                                <div
                                                    [text]="(zamaState.applyingDiscount == 'true' ? 'Submitting' : 'Submit')">
                                                </div>
                                                <div
                                                    [class]="'btn-spinner ' + (zamaState.applyingDiscount == 'true' ? 'spinner-rotate' : 'spinner-hide')">
                                                </div>
                                            </button>
                                        </div>

                                        <div submit-error style="margin-top: 4px;">
                                            <p style="color: red;font-size: 14px;">
                                                {{{message}}}
                                            </p>
                                        </div>
                                    </form>
                                </div>
                                <div style="padding: 16px; padding-top: 0px;">
                                    {{#discountCodes}}
                                    <form method="post" style="display: flex;gap: 8px;"
                                        action-xhr="{removeDiscountLink}"
                                        on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { removingDiscount: 'true' } })">
                                        <input type="text" hidden value="{{checkoutId}}" name="checkoutId">
                                        <input type="text" hidden value="{{upsellId}}" name="upsellId">
                                        <button tabindex="1" role=""
                                            style="background-color: #ebebeb;padding: 8px 16px;border: none;outline: none;border-radius: 8px;cursor: pointer;">{{code}}
                                            &#10060;</button>
                                    </form>
                                    {{/discountCodes}}
                                </div>
                                <div style="padding: 16px;">
                                    <div
                                        style="border-top: 1px solid #aaabbb66;border-bottom: 1px solid #aaabbb66;margin-bottom: 16px;padding: 16px 0px;">
                                        <div
                                            style="margin-bottom: 8px;display: flex;justify-content: space-between;align-items: center;">
                                            <p style="font-size: 16px; font-weight: 400;color: #aaabbbff;">
                                                Subtotal
                                            </p>
                                            <p style="font-size: 16px;">{{subtotal}}</p>
                                        </div>
                                        <div
                                            style="margin-bottom: 8px;display: flex;justify-content: space-between;align-items: center;">
                                            <p style="font-size: 16px; font-weight: 400;color: #aaabbbff;">
                                                Discounts
                                            </p>
                                            <p style="font-size: 16px;">-{{discountAmount}}</p>

                                        </div>
                                        <div style="display: flex;justify-content: space-between;align-items: center;">
                                            <p style="font-size: 16px; font-weight: 400;color: #aaabbbff;">
                                                Taxes
                                            </p>
                                            <p style="font-size: 16px;">Calculated at next step</p>

                                        </div>

                                    </div>
                                    <div style="display: flex;justify-content: space-between;align-items: center;">
                                        <p style="font-size: 16px; font-weight: 600;">Total</p>
                                        <p style="font-size: 16px;">{{total}}</p>
                                    </div>
                                </div>
                            </template>
                            <div overflow class="list-overflow" style="display: flex;">
                                <h1 style="font-size: 18;font-weight: 600;">
                                    See more
                                </h1>
                                <div
                                    style="background-image: url('https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/chevron-down.png');height: 24px;width: 24px;background-size: 24px 24px;background-repeat: no-repeat;">
                                </div>
                            </div>
                        </amp-list>
                    </div>
                    <amp-list id="checkoutActions" class="ampListCheckoutActions" layout="fixed-height" height="100"
                        binding="always" src="{checkoutLink}" items=".">
                        <template type="amp-mustache">
                            <div
                                style="display: flex;flex-direction: column;justify-content: center;align-items: center; padding: 16px;">
                                <a class="btn" style="width: 100%;justify-content: center;"
                                    href="{abandonedCheckoutURL}" target="_blank">Checkout
                                    from email</a>
                                <p style="font-size: 12;font-weight: 400;margin-top: 8px;">Don't worry this is safe af
                                </p>
                            </div>
                        </template>
                    </amp-list>
                    <div class="ampListRecommendationContainer">
                        <amp-list class="ampListRecmmendation" layout="fixed-height" height="800" binding="always"
                            src="{recommendationLink}" items=".">

                            <template type="amp-mustache">
                                <div
                                    style="padding: 16px;display: flex;justify-content: space-between;border-bottom: 1px solid #ebebeb;">
                                    <h1 style="font-size: 20px;font-weight: 500;">You may also Like</h1>
                                </div>
                                <div style="padding: 0px 16px;display:flex;gap:8;align-items:center">
                                    {{#relatedProducts}}
                                    <div class="product">
                                        <div class="productImages">
                                            <amp-carousel height="200" layout="fixed-height" type="slides" role="region"
                                                aria-label="Basic usage carousel">
                                                {{#images}}
                                                <amp-img src="{{src}}" layout="fill" class="productImage"
                                                    alt="{{alt}}"></amp-img>
                                                {{/images}}
                                                {{^images}}
                                                <amp-img
                                                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/noimg.avif"
                                                    layout="fill" class="productImage"
                                                    alt="No image placeholder"></amp-img>
                                                {{/images}}
                                            </amp-carousel>
                                        </div>
                                        <div
                                            style="display: flex;flex-direction: column; justify-content: space-between;flex-grow: 1;">
                                            <div class="productDetails">
                                                <div style="display: flex;gap: 4px;">
                                                    <p style="font-size: 14px;"><b>{{variant.price}}</b></p>
                                                    <p style="font-size: 12px;text-decoration: line-through;">
                                                        {{variant.compare_at_price}}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h1>
                                                        {{title}}
                                                    </h1>
                                                    <div>
                                                        <div>
                                                            <p style="margin-top: 4px;">{{{description}}}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="actions">
                                                <form method="post" id="add_to_cart_{{index}}"
                                                    action-xhr="{addLineItemLink}"
                                                    on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { addingToCart: -1 } })">
                                                    <div>
                                                        <input type="text" name="variantId" value="{{variant.id}}"
                                                            placeholder="Variant Id" hidden />
                                                        <input type="number" name="quantity" value="1"
                                                            placeholder="Quantity" hidden />
                                                        <input type="text" name="checkoutId" value="{globalCheckoutId}"
                                                            placeholder="Checkout Id" hidden />
                                                        <input type="text" name="upsellId" value="{{upsellId}}"
                                                            placeholder="Upsell Id" hidden />
                                                    </div>

                                                </form>
                                                <button tabindex="1" role="" class="btn"
                                                    on="tap:AMP.setState({ zamaState: { addingToCart: {{index}} } }), add_to_cart_{{index}}.submit">
                                                    <p class="cart"
                                                        [text]="(zamaState.addingToCart == {{index}} ? 'Adding to cart' : 'Add to cart')">
                                                        Add To Cart
                                                    <div
                                                        [class]="(zamaState.addingToCart == {{index}} ? '' : 'cartButtonIcon')">
                                                    </div>
                                                    <div
                                                        [class]="'btn-spinner ' + (zamaState.addingToCart == {{index}} ? 'spinner-rotate' : 'spinner-hide')">
                                                    </div>
                                                    </p>
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                    {{/relatedProducts}}
                                    {{^relatedProducts}}
                                    <div style="padding: 16;text-align: center;width: 100%;">No items founds.</div>
                                    {{/relatedProducts}}


                                </div>

                                <div
                                    style="padding: 16px;display: flex;justify-content: space-between;border-bottom: 1px solid #ebebeb;">
                                    <h1 style="font-size: 20px;font-weight: 500;">Pair it with</h1>
                                </div>
                                <div style="padding: 0px 16px;display:flex;gap:8;align-items:center">
                                    {{#complementaryProducts}}
                                    <div class="product">
                                        <div class="productImages">
                                            <amp-carousel height="200" layout="fixed-height" type="slides" role="region"
                                                aria-label="Basic usage carousel">
                                                {{#images}}
                                                <amp-img src="{{src}}" layout="fill" class="productImage"
                                                    alt="{{alt}}"></amp-img>
                                                {{/images}}
                                                {{^images}}
                                                <amp-img
                                                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/noimg.avif"
                                                    layout="fill" class="productImage"
                                                    alt="No image placeholder"></amp-img>
                                                {{/images}}
                                            </amp-carousel>
                                        </div>
                                        <div
                                            style="display: flex;flex-direction: column; justify-content: space-between;flex-grow: 1;">
                                            <div class="productDetails">
                                                <div style="display: flex;gap: 4px;">
                                                    <p style="font-size: 14px;"><b>{{variant.price}}</b></p>
                                                    <p style="font-size: 12px;text-decoration: line-through;">
                                                        {{variant.compare_at_price}}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h1>
                                                        {{title}}
                                                    </h1>
                                                    <div>
                                                        <div>
                                                            <p style="margin-top: 4px;">{{{description}}}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="actions">
                                                <form method="post" id="add_to_cart_{{index}}"
                                                    action-xhr="{addLineItemLink}"
                                                    on="submit-success:checkout.refresh,checkoutActions.refresh,AMP.setState({ zamaState: { addingToCart: -1 } })">
                                                    <div>
                                                        <input type="text" name="variantId" value="{{variant.id}}"
                                                            placeholder="Variant Id" hidden />
                                                        <input type="number" name="quantity" value="1"
                                                            placeholder="Quantity" hidden />
                                                        <input type="text" name="checkoutId" value="{globalCheckoutId}"
                                                            placeholder="Checkout Id" hidden />
                                                        <input type="text" name="upsellId" value="{{upsellId}}"
                                                            placeholder="Upsell Id" hidden />
                                                    </div>

                                                </form>
                                                <button tabindex="1" role="" class="btn"
                                                    on="tap:AMP.setState({ zamaState: { addingToCart: {{index}} } }), add_to_cart_{{index}}.submit">
                                                    <p class="cart"
                                                        [text]="(zamaState.addingToCart == {{index}} ? 'Adding to cart' : 'Add to cart')">
                                                        Add To Cart
                                                    <div
                                                        [class]="(zamaState.addingToCart == {{index}} ? '' : 'cartButtonIcon')">
                                                    </div>
                                                    <div
                                                        [class]="'btn-spinner ' + (zamaState.addingToCart == {{index}} ? 'spinner-rotate' : 'spinner-hide')">
                                                    </div>
                                                    </p>
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                    {{/complementaryProducts}}
                                    {{^complementaryProducts}}
                                    <div style="padding: 16;text-align: center;width: 100%;">No items founds.</div>
                                    {{/complementaryProducts}}
                                </div>
                            </template>

                        </amp-list>
                    </div>
                    <div style="display: flex;justify-content: flex-end;">
                        <div>
                            <a href="https://zama.agency" target="_blank"
                                style="padding: 16px;display: flex;align-items: center;gap: 8px;flex-grow: 0;">
                                <amp-img
                                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/zama_speaker.png"
                                    height="20" width="20" layout="fixed"></amp-img>
                                <p> Powered By Zama</p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div style="height: 2px;width: 100%;margin: 40px 0px;padding: 0px 16px;">
                <div style="background-color: #00000015;height: 100%;width: 100%;"></div>
            </div>

            <div style="display: flex;flex-direction: column;align-items: center;padding-bottom: 32px;">
                <amp-img
                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/zama_full.png"
                    alt="zama full" width="150" height="51" layout="fixed"></amp-img>
                <p style="font-size: 14px;margin-top: 8px;">Boost conversions with an engaging inbox experience</p>
                <p style="font-size: 14px;margin-top: 24px;">2024 | All Rights Reserved</p>
                <p style="font-size: 14px;margin-top: 8px;">Built with ❤️ By <a href="https://twitter.com/hyvip_ai"
                        target="_blank" rel="noopener noreferrer">Rajat Mondal</a></p>
            </div>

        </div>
    </div>
</body>

</html>
`;

export const upsellFallbackTemplate = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
            padding: 16px;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
            margin:auto;
        }

        .btn {
            height: 40px;
            padding: 8px 16px;
            border: 2px solid #000;
            font-weight: 500;
            background: transparent;
            cursor: pointer;
            position: relative;
            gap: 6px;
            border-radius: 6px;
            font-weight: 600;
            display: block;
            text-decoration: none;
            color: #000!important;
            text-align: center;
        }

        .btn:hover {
            background-color: #00000015;
        }

        p {
            font-size: 14px;
        }
        .product{
            display: flex;
            gap: 16px;
            margin:16px auto;
        }
        .productDetails{
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 8px;
            margin-left:16px;
        }
    </style>
</head>

<body>
    <div class="outerContainer">
        <div class="container">
            <div style="padding:16px;">
                <div>
                    <h1 style="margin-bottom: 16px;">zama-merchant</h1>
                    <p style="margin-bottom: 8px;">You left items in your cart...</p>
                    <p style="margin-bottom: 8px;">Hi, you added items to your shopping cart and haven't completed your
                        purchase. You can complete
                        it
                        now
                        while they're still available.</p>
                    <p style="margin-bottom: 8px;">This is an example fallback template, even if your customers, don't
                        have dynamic email enabled,
                        they
                        will
                        be able to see the items and go to checkout from here</p>
                    <p style="margin-bottom: 16px;font-weight:600">To enable dynamic email go to settings > all settings > enable
                        dynamic email</p>
                    <a href="{abandonedCheckoutURL}" class="btn" style="width: 100%;justify-content: center;margin-bottom: 24px;">Go To
                        Checkout</a>
                </div>
                <div>
                        {{products}}
                </div>
            </div>
        </div>

    </div>
</body>

</html>
`;

export const reviewTemplate = `
<!doctype html>
<html amp4email data-css-strict>

<head>
    <meta charset="utf-8">
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-list" src="https://cdn.ampproject.org/v0/amp-list-0.1.js"></script>
    <script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>
    <script async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js"></script>
    <script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"></script>
    <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>
    <style amp4email-boilerplate>
        body {
            visibility: hidden;
        }
    </style>

    <style amp-custom>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        h1 {
            font-size: 14px;
            font-weight: 600;
        }

        p {
            font-size: 12px;
            font-weight: 500;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
        }

        .product {
            width: 200px;
            align-self: stretch;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            padding-top: 16px;
            padding-bottom: 16px;
        }

        .productImage {
            object-fit: contain;
            margin: 0;
        }

        .productDetails {
            margin-top: 8px;
        }

        .productImages {
            border-radius: 8px;
        }

        .actions {
            margin-top: 16px;
        }

        .amp-carousel-button-prev,
        .amp-carousel-button-next {
            border-radius: 50%;
            cursor: pointer;
            outline: none;
        }

        input,
        textarea {
            width: 100%;
            padding: 10px 16px;
            border: 2px solid #aaabbb66;
            outline: none;
            border-radius: 8px;
        }

        .list-overflow {
            background: rgb(255, 255, 255);
            background: linear-gradient(to bottom, #ffffff00 0, #ffffffff 100%);
            bottom: 0%;
            width: 100%;
            height: 80px;
            z-index: 50;
            justify-content: center;
            align-items: end;
        }

        .btn {
            height: 40px;
            padding: 8px 16px;
            border: 2px solid #000;
            font-weight: 500;
            background: transparent;
            cursor: pointer;
            position: relative;
            display: flex;
            align-items: center;
            gap: 6px;
            border-radius: 6px;
            font-weight: 600;
        }

        .btn.filled {
            background-color: #000;
            color: #fff;
        }

        .btn:hover {
            background-color: #00000015;
        }

        .btn.filled:hover {
            background-color: #fff;
            color: #000;
        }

        .linkBtn {
            padding: 0;
            border: none;
            text-decoration: underline;
            color: #aaabbbff;
            font-size: 12px;
            font-weight: 400;
            cursor: pointer;
            height: auto;
        }

        .linkBtn:hover {
            background-color: transparent;
            color: #000;
        }

        a {
            width: 100%;
            text-align: center;
            text-decoration: none;
            color: inherit;
        }

        .quantityBtn {
            height: 32px;
            width: 32px;
            border-radius: 50%;
            border: 1px solid #000;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 24px;
            background-color: transparent;
            cursor: pointer;
        }

        .quantityBtn:hover {
            background-color: #00000015;
        }

        .ampListRecmmendation>div>div>div {
            display: flex;
            gap: 16px;
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            position: relative;
        }

        .cartButtonIcon {
            background: url('https://static.thenounproject.com/png/117629-200.png');
            height: 24px;
            width: 24px;
            background-size: contain;
            background-repeat: no-repeat;
        }

        .cartButtonIconLoader {
            background: url("https://i.gifer.com/origin/34/34338d26023e5515f6cc8969aa027bca.gif");
            height: 24px;
            width: 24px;
            background-size: contain;
            background-repeat: no-repeat;
        }

        .lineItemOuter {
            position: relative;

        }

        .lineItemLoader {
            background-color: #00000050;
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }


        .lineItemLoaderHidden {
            height: 0%;
        }


        .icon-close-white {
            width: 24px;
            height: 24px;
            background-size: 24px 24px;
            background-image: url(https://i.postimg.cc/mgZy82sq/icons8-close-48.png);
            background-repeat: no-repeat;
            display: inline-block
        }

        .interactive {
            padding: 0px 16px;
        }

        .interactiveInner {
            border-radius: 8px;
            box-shadow: rgba(0, 0, 0, 0.1) 0px 3px 8px;
            border: 1px solid #ebebeb;
        }

        .big-spinner {
            position: absolute;
            z-index: 20;
            left: 0;
            right: 0;
            margin-left: auto;
            margin-right: auto;
            height: 0px;
            width: 0px;
            border-radius: 50%;
            border: 6px solid #FF4B00;
            border-top: 5px solid transparent;
            background-color: transparent;
        }

        .btn-spinner {
            height: 0px;
            width: 0px;
            border-radius: 50%;
            border: 4px solid #FF4B00;
            border-top: 4px solid transparent;
            background-color: transparent;
        }

        .spinner-rotate {
            opacity: 1;
            transition: transform 100000s;
            transform: rotate(100000000deg);
            height: 20px;
            width: 20px;
        }

        .big-spinner-rotate {
            opacity: 1;
            transition: transform 100000s;
            transform: rotate(100000000deg);
            height: 45px;
            width: 45px;
        }

        .spinner-hide {
            border: transparent;
        }

        .custom-option-list {
            max-height: 200px;
            position: absolute;
            width: calc(100% - 2px);
            padding: 0;
            margin: 0;
            background: #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, .08), inset 0 0 0 1px rgba(0, 0, 0, .16);
            border-radius: 8px;
            z-index: 100;
            padding: 8px;
            margin-top: 4px;
            margin-left: -2px;
            overflow-y: scroll;
        }

        .custom-option {
            background: url(https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/down-arrow.png) no-repeat right calc(calc(18px * 0.7) - 4px) center/1rem;
            border-radius: 6px;
            border: 1px solid #aaabbb66;
            height: 40px;
            font-size: 14px;
            width: 100%;
            margin: 1px;
            color: #444444;
            appearance: none
        }

        .custom-option:hover {
            border: 1px solid #000;
        }

        .custom-option-selected {
            border: 1px solid #000;

        }


        .custom-option-container {
            height: 40px;
            z-index: 99;
            margin: 0;
            cursor: pointer;
            padding: 0 calc(18px * 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center
        }

        .custom-option-cell {
            height: 34px;
            padding: 2px 6px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background-color: transparent;
        }

        .custom-option-cell:hover {
            background: rgba(0, 0, 0, .08);
            border-radius: 4px
        }

        .item-option {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
            align-items: center;
            margin: calc(calc(18px * 0.4) - 2px) 0;
        }

        .outside-label {
            display: flex;
            position: absolute;
            top: 11px;
            right: 0;
            left: 8px;
            box-sizing: border-box;
            text-align: left;
            font-size: 14px;
            background-color: transparent;
            z-index: 4;
            transform-origin: left center;
            transform: scale(.7) translate(0, -28px);
            transition: transform .2s ease-in-out
        }

        .rating {
            display: flex;
            width: 100%;
            justify-content: center;
            overflow: hidden;
            flex-direction: row-reverse;
            position: relative;
        }

        .rating-0 {
            filter: grayscale(100%);
        }

        .rating>input {
            display: none;
        }

        .rating>label {
            cursor: pointer;
            width: 40px;
            height: 40px;
            background-image: url("https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/star-gray.png");
            background-repeat: no-repeat;
            background-position: center;
            background-size: 76%;
        }

        .rating>input:checked~label,
        .rating>input:checked~label~label {
            background-image: url("https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/star-yellow.png");
        }


        .rating>input:not(:checked)~label:hover,
        .rating>input:not(:checked)~label:hover~label {
            background-image: url("https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/star-dark-yellow.png");
        }

        textarea {
            resize: none;
        }

        form.amp-form-submit-success>input,
        form.amp-form-submit-success>textarea,
        form.amp-form-submit-success>label,
        form.amp-form-submit-success>button,
        form.amp-form-submit-success>div {
            display: none
        }


        @media (max-width:600px) {
            .slides-mobile {
                display: block;
            }

            .slides-desktop {
                display: none;
            }
        }

        @media (min-width:600px) {
            .slides-desktop {
                display: block;
            }

            .slides-mobile {
                display: none;
            }
        }
    </style>



</head>

<body>
    <amp-state id="zamaState">
        <script type="application/json">
        {
          "learnMoreOpen": false,
          "reviewingId":0,
          "rating":0
        }
      </script>
    </amp-state>

    <div class="banner">
        <div style="border-radius: 8px; background-color: #F4F4F6; font-size: 14px;">
            <div [hidden]="zamaState.learnMoreOpen" style="padding: 16px;">
                <div style="display: flex; align-items: center; justify-content: flex-start;">
                    <amp-img style="margin:-30px;" height="60" width="60" layout="fixed"
                        src="https://s6.gifyu.com/images/S6r3u.gif"></amp-img>
                    <div style="font-weight:300; margin: 0px 20px;">This is an
                        interactive email</div>
                    <div style="font-weight:500; margin-left:auto; cursor: pointer;" tabindex="1" role=""
                        on="tap:AMP.setState({ zamaState: { learnMoreOpen: true } })">
                        Learn More</div>
                </div>
            </div>
            <div hidden="" [hidden]="!zamaState.learnMoreOpen" class="slides-desktop"
                style="position:relative;padding: 16px;">
                <div class="close-button"
                    style="position: absolute;cursor:pointer; z-index: 10; background-color: rgba(0,0,0,.5); width: 32px; height: 32px; border-radius: 50%; top: 8px;right: 8px; display: flex; align-items: center; justify-content: center; "
                    tabindex="1" role="" on="tap:AMP.setState({zamaState: {learnMoreOpen: false}})">
                    <div class="icon-close-white"></div>
                </div>
                <div style="display: flex;align-items: center">
                    <div
                        style="padding: 12px;min-height:225px; min-width:300px;display: flex;flex-direction: column;justify-content: center;">
                        <amp-img style="border-radius: 8px" layout="responsive" height="225" width="400"
                            src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/sign/zama/assets/interactive.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ6YW1hL2Fzc2V0cy9pbnRlcmFjdGl2ZS53ZWJwIiwiaWF0IjoxNzA5NjU5NTcxLCJleHAiOjIwMjUwMTk1NzF9.24mXPhbpmqYgx3IKVzD6JeqAI7aWUscYEbOLPMmq9ZE"></amp-img>
                    </div>
                    <div>
                        <div style="padding: 12px;font-weight: 600; font-size: 24px; color: #444; text-align: left">
                            This is an interactive email
                        </div>
                        <div style="padding: 12px; font-weight: 300; font-size: 16px; color: #444; text-align: left">
                            You can now click on buttons, fill out forms, and more without leaving your inbox.
                        </div>
                    </div>
                </div>
            </div>
            <div hidden="" [hidden]="!zamaState.learnMoreOpen" class="slides-mobile"
                style="position:relative;padding: 16px;">
                <div class="close-button"
                    style="position: absolute;cursor:pointer; z-index: 10; background-color: rgba(0,0,0,.5); width: 32px; height: 32px; border-radius: 50%; top: 8px;right: 8px; display: flex; align-items: center; justify-content: center; "
                    tabindex="1" role="" on="tap:AMP.setState({zamaState: {learnMoreOpen: false}})">
                    <div class="icon-close-white"></div>
                </div>
                <div style="flex-direction: column;display: flex;align-items: center;">
                    <amp-img style="border-radius: 8px" height="225" width="400" layout="fixed"
                        src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/sign/zama/assets/interactive.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ6YW1hL2Fzc2V0cy9pbnRlcmFjdGl2ZS53ZWJwIiwiaWF0IjoxNzA5NjU5NTcxLCJleHAiOjIwMjUwMTk1NzF9.24mXPhbpmqYgx3IKVzD6JeqAI7aWUscYEbOLPMmq9ZE"></amp-img>
                </div>
                <div style="padding-top: 12px;font-weight: 600; font-size: 24px;text-align: center">
                    This is an interactive email
                </div>
                <div style="padding: 12px 18px 18px 18px; font-weight: 300; font-size: 16px;text-align: center">
                    You can now click on buttons, fill out forms, and more without leaving your inbox.
                </div>
            </div>
        </div>
        <div style="width: 100%; height:20px"></div>
    </div>
    <div class="outerContainer" style="padding: 16px;">
        <div class="container">
            <div style="padding: 16px;display: flex; justify-content: space-between;align-items: center;gap: 16px;">
                <div style="width: 150px;">
                    <amp-img
                        src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/zama_full.png"
                        height="38" width="112" layout="fixed"></amp-img>
                </div>
                <div style="display: flex;gap: 4px;flex-grow: 1;">

                    <a href="http://zama-merchant.myshopify.com" style="font-size: 14px;" target="_blank"
                        rel="noopener noreferrer">Shopify
                        Shop</a>
                    <a href="http://zama.agency" style="font-size: 14px;" target="_blank" rel="noopener noreferrer">Zama
                        (Product)</a>
                </div>
            </div>
            <div>
                <amp-img
                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/zama_banner.png"
                    alt="zama_banner" layout="responsive" height="200" width="600"></amp-img>
            </div>
            <div style="padding:16px;">
                <h1 style="font-size: 24px;margin-bottom: 24px;text-align: center;">
                    Let us know what you think!!
                </h1>
                <p style="font-size: 14px;margin-bottom: 8px;">Hey there,</p>
                <p style="font-size: 14px;margin-bottom: 8px;">Remember, feedback can refine products</p>
                <p style="font-size: 14px;margin-bottom: 8px;">Each comment or suggestion carries the weight of shaping
                    a better, more user-focused experience!</p>
                <p style="font-size: 14px;margin-bottom: 8px;">Leave us a review</p>

            </div>

            <div class="interactive">
                <div class="interactiveInner">
                    <div style="padding: 16px;border-bottom: 1px solid #ebebeb;">
                        <h1 style="font-size: 20px;font-weight: 500;">Your Shopping Cart</h1>
                    </div>
                    <div>
                        <amp-list id="checkout" class="ampListCheckout" layout="fixed-height" height="450"
                            binding="always"
                            src="{reviewLink}"
                            items=".">
                            <template type="amp-mustache">
                                {{#items}}
                                <div class="lineItemOuter">
                                    <div class="lineItem"
                                        style="margin-bottom: 8px;border-bottom: 1px solid #aaabbb66; padding: 16px;">
                                        <div style="margin-bottom: 16px;">
                                            <h1 title="{{name}}" style="font-size: 16px;font-weight: 600;">
                                                {{name}}</h1>
                                            <p title="{{description}}"
                                                style="font-size: 13px;font-weight: 400;margin-top: 4px;">
                                                {{{description}}}</p>
                                        </div>
                                        <div
                                            style="display: flex;align-items: center;justify-content: space-between;gap: 16px;">
                                            <div class="img" style="width: 250px;">
                                                <amp-carousel height="200" layout="fixed-height" type="slides"
                                                    role="region" aria-label="Basic usage carousel">
                                                    <amp-img src="{{img}}" layout="fill" class="productImage"
                                                        alt="{{imgAlt}}"></amp-img>
                                                </amp-carousel>
                                            </div>
                                            <div
                                                style="flex-grow: 1; align-self: stretch;display: flex;flex-direction: column; width: 100%; justify-content: space-between;">
                                                <div
                                                    style="display: flex; gap: 12px;align-items: center;margin-top: 16px;flex-direction: column;">
                                                    <form method="post"
                                                        action-xhr="{submitReviewLink}"
                                                        id="review_product_{{productId}}">
                                                        <div class="rating">
                                                            <input type="radio" name="rating"
                                                                id="{{productId}}-rating-5"
                                                                value="{{productId}}-rating-5">
                                                            <label for="{{productId}}-rating-5"></label>
                                                            <input type="radio" name="rating"
                                                                id="{{productId}}-rating-4"
                                                                value="{{productId}}-rating-4">
                                                            <label for="{{productId}}-rating-4"></label>
                                                            <input type="radio" name="rating"
                                                                id="{{productId}}-rating-3"
                                                                value="{{productId}}-rating-3">
                                                            <label for="{{productId}}-rating-3"></label>
                                                            <input type="radio" name="rating"
                                                                id="{{productId}}-rating-2"
                                                                value="{{productId}}-rating-2">
                                                            <label for="{{productId}}-rating-2"></label>
                                                            <input type="radio" name="rating"
                                                                id="{{productId}}-rating-1"
                                                                value="{{productId}}-rating-1">
                                                            <label for="{{productId}}-rating-1"></label>
                                                        </div>
                                                        <input type="text" name="productId" value="{{productId}}"
                                                            placeholder="Product Id" hidden />
                                                        <input type="text" name="customerName" value="{{customerName}}"
                                                            placeholder="Customer Name" hidden />
                                                        <input type="text" name="customerEmail"
                                                            value="{{customerEmail}}" placeholder="Customer Email"
                                                            hidden />
                                                            <input type="text" name="productName"
                                                            value="{{name}}" placeholder="Product Name"
                                                            hidden />
                                                        <input type="text" name="reviewTitle" placeholder="Review Title"
                                                            required style="margin-top: 4px;margin-bottom: 4px;" />
                                                        <textarea name="reviewDescription" rows="2"
                                                            placeholder="Review Description" required></textarea>

                                                        <button type="submit" class="btn"
                                                            style="width: 100%; justify-content: center; margin-top: 8px;">Submit</button>
                                                        <div submit-success>
                                                            <div style="display: flex; justify-content: center;">
                                                                <amp-img
                                                                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/done.webp"
                                                                    height="100" width="100" layout=fixed alt="done">
                                                            </div>
                                                            <p style="font-size: 16px;margin-top: 8px;">Successfully
                                                                submitted review
                                                            </p>
                                                        </div>
                                                        <div submit-error>
                                                            <p style="color:red;font-size: 16px;margin-top: 8px;">
                                                                *Something went wrong
                                                            </p>
                                                        </div>
                                                    </form>


                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {{/items}}
                            </template>
                            <div overflow class="list-overflow" style="display: flex;padding-bottom: 8px;">
                                <h1 style="font-size: 18;font-weight: 600;">
                                    See more
                                </h1>
                                <div
                                    style="background-image: url('https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/chevron-down.png');height: 24px;width: 24px;background-size: 24px 24px;background-repeat: no-repeat;">
                                </div>
                            </div>
                        </amp-list>
                    </div>
                    <!-- all the products and api -->
                </div>
            </div>
            <div style="height: 2px;width: 100%;margin: 40px 0px;padding: 0px 16px;">
                <div style="background-color: #00000015;height: 100%;width: 100%;"></div>
            </div>

            <div style="display: flex;flex-direction: column;align-items: center;padding-bottom: 32px;">
                <amp-img
                    src="https://pedhznquiyczmrlwdiqy.supabase.co/storage/v1/object/public/zama/assets/zama_full.png"
                    alt="zama full" width="150" height="51" layout="fixed"></amp-img>
                <p style="font-size: 14px;margin-top: 8px;">Boost conversions with an engaging inbox experience</p>
                <p style="font-size: 14px;margin-top: 24px;">2024 | All Rights Reserved</p>
                <p style="font-size: 14px;margin-top: 8px;">Built with ❤️ By <a href="https://twitter.com/hyvip_ai"
                        target="_blank" rel="noopener noreferrer">Rajat Mondal</a></p>
            </div>

        </div>
    </div>
</body>

</html>

`;

export const reviewFallbackTemplate = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
            padding: 16px;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
            margin:auto;
        }
    </style>
</head>

<body>
    <div class="outerContainer">
        <div class="container">
            <div style="padding:16px;">
                <div>
                    <h1 style="margin-bottom: 16px;">Hi</h1>
                    <p style="margin-bottom: 8px;">Hi, You have bough some things {dayDifference} days ago, from zama, please leave a review</p>
                </div>
            </div>
        </div>

    </div>
</body>

</html>
    
`;

export const welcomeEmail = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
            padding: 16px;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
            margin:auto;
        }
    </style>
</head>

<body>
    <div class="outerContainer">
        <div class="container">
            <div style="padding:16px;">
                <div>
                    <h1 style="margin-bottom: 16px;">Hi {name}</h1>
                    <p style="margin-bottom: 8px;">Welcome to zama, start increasing your conversion rates, connect your shopify store from <a href="https://zama.agency/integrations">here</a></p>
                </div>
            </div>
        </div>

    </div>
</body>

</html>
    
`;

export const forgotPasswordEmail = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
            padding: 16px;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
            margin:auto;
        }
    </style>
</head>

<body>
    <div class="outerContainer">
        <div class="container">
            <div style="padding:16px;">
                <div>
                    <h1 style="margin-bottom: 16px;">Hi {name}</h1>
                    <p style="margin-bottom: 8px;">You can reset you password from <a href="{resetPasswordLink}">here</a></p>
                </div>
            </div>
        </div>

    </div>
</body>

</html>
`;

export const shopifyIntegrationSuccessEmail = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
            padding: 16px;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
            margin:auto;
        }
    </style>
</head>

<body>
    <div class="outerContainer">
        <div class="container">
            <div style="padding:16px;">
                <div>
                    <h1 style="margin-bottom: 16px;">Hi {name}</h1>
                    <p style="margin-bottom: 8px;">You have successfully integrated shopify, for the next steps, go <a href="https://zama.agency/settings?index=1">here</a></p>
                </div>
            </div>
        </div>

    </div>
</body>

</html>
`;

export const judgeMeIntegrationSuccessEmail = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
            padding: 16px;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
            margin:auto;
        }
    </style>
</head>

<body>
    <div class="outerContainer">
        <div class="container">
            <div style="padding:16px;">
                <div>
                    <h1 style="margin-bottom: 16px;">Hi {name}</h1>
                    <p style="margin-bottom: 8px;">You have successfully integrated judge.me, you can start receiving reviews from email</p>
                </div>
            </div>
        </div>

    </div>
</body>

</html>
`;

export const emailIntegrationSuccessEmail = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
            padding: 16px;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
            margin:auto;
        }
    </style>
</head>

<body>
    <div class="outerContainer">
        <div class="container">
            <div style="padding:16px;">
                <div>
                    <h1 style="margin-bottom: 16px;">Hi {name}</h1>
                    <p style="margin-bottom: 8px;">You have successfully integrated {emailServiceProvider}, for the next steps, go <a href="https://zama.agency/settings?index=3">here</a></p>
                </div>
            </div>
        </div>

    </div>
</body>

</html>
`;

export const reviewPlatformIntegrationSuccessEmail = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
            padding: 16px;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
            margin:auto;
        }
    </style>
</head>

<body>
    <div class="outerContainer">
        <div class="container">
            <div style="padding:16px;">
                <div>
                    <h1 style="margin-bottom: 16px;">Hi {name}</h1>
                    <p style="margin-bottom: 8px;">You have successfully integrated {reviewPlatformName} review platform, for the next steps, go <a href="https://zama.agency/settings?index=2">here</a></p>
                </div>
            </div>
        </div>

    </div>
</body>

</html>
`;

export const contactSupportEmail = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }

        .outerContainer {
            display: flex;
            justify-content: center;
            background-color: #F5F5F5;
            padding: 16px;
        }

        .container {
            border-radius: 6px;
            min-width: 400px;
            max-width: 600px;
            flex-grow: 1;
            background-color: #fff;
            margin:auto;
        }
    </style>
</head>

<body>
    <div class="outerContainer">
        <div class="container">
            <div style="padding:16px;">
                <div>
                    <h1 style="margin-bottom: 16px;">Hi {name}</h1>
                    <p style="margin-bottom: 8px;">{email}</p>
                    <p style="margin-bottom: 8px;">{query}</p>
                </div>
            </div>
        </div>

    </div>
</body>

</html>
`;
