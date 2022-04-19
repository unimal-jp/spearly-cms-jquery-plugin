# Spearly CMS jQuery Plugin

his package allows to easily implement Spearly in your jQuery codes!

## Getting Started

### Load

#### Use npm or Yarn and webpack

1. Install with the following command:
   ```
   // npm
   $ npm i -S @spearly/jquery-plugin
   
   // yarn
   $ yarn add @spearly/jquery-plugin
   ```
2. Add the following to `webpack.config.js`:
   ```js
   ...
   plugins: [
     new webpack.ProvidePlugin({
       $: 'jquery',
       jQuery: 'jquery',
       'window.jQuery': 'jquery',
     }),
   ],
   ...
   ```
3. Add an import statement to your js file.
   ```js
   import '@spearly/jquery-plugin'
   ```

#### Use CDN

Put the following code under the jQuery script tag.

```html
<script src="/jquery.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@spearly/jquery-plugin@1.0.0/dist/spearly-plugin.js" defer></script>
```

## How to Use

### Initialize setup

Get the API Key from Spearly CMS and set up as follows.

```js
$(function() {
  $.spearly.init({ apiKey: 'YOUR_API_KEY' })
})
```


### Get Content Lists

```js
async function() {
  // basic
  const contents =  await $.spearly.getList(CONTENT_TYPE_ID)

  // when using some options
  const filteredContents =  await $.spearly.getList(CONTENT_TYPE_ID, { limit: 10, offset: 20 })
}
```

#### Filtered Options

- `limit` (number, 10)
- `offset` (number, 0)
- `order` ('desc' | 'asc', 'desc')
- `order_by` ('latest' | 'popular' | string)
- `filter_by` (string)
- `filter_value` (string)
- `filter_ref` (string)
- `range_to` (string)
- `range_from` (string)

### Get Content

```js
async function() {
  const content = await $.spearly.getContent(CONTENT_ID)
}
```

### Get Content Preview

```js
async function() {
  const content = await $.spearly.getContentPreview(CONTENT_ID, PREVIEW_TOKEN)
}
```

`PREVIEW_TOKEN` can be obtained on the content edit page of the Spearly CMS.

### Get Form

```js
async function() {
  const form = await $.spearly.getFormLatest(FORM_ID)
}
```

`FORM_ID` is for **Form ID for embedding** in Spearly CMS.

### Submit Form

```js
async function() {
  const submit = await $.spearly.postFormAnswers(FORM_VERSION_ID, { ...YOUR_FORM_FIRLD_ANSWERS, _spearly_gotcha: '' })
}
```

- `FORM_VERSION_ID` is the ID to be obtained by **Get Form**.
- `YOUR_FORM_FIELD_ANSWERS` is an object whose key is the form field ID and whose value is the content.  
  For example, If the form has name, email, and content, and you answer 'James', 'email@example.com', and 'Hello world!', here is:
  ```js
  {
    name: 'James',
    email: 'email@example.com',
    content: 'Hello world!'
  }
  ```
- `_spearly_gotcha` is an anti-spam field. Be sure to add it to YOUR_FORM_FIELD_ANSWERS.  
  Don't forget to install it in an invisible field on your form.
