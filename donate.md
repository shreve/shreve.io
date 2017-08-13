---
permalink: /donate
title: Donate to Jacob Shreve
---

# Donate

<script src="https://checkout.stripe.com/checkout.js"></script>

<div class="centered">
  <label for="amount">How much would you like to donate?</label>
  <div class="input-group">
    <div class="currency-input">
      <input id="amount" type="number" name="amount" value="5.00"/>
    </div>
    <button id="customButton">Donate</button>
  </div>

  <p id="success-message" style="display: none">Your payment has completed. Thank you very much.</p>
</div>

<script>
 var buildPayload = function(object, prefix) {
   if (!prefix) { prefix = '' }

   var pairs = [];
   for (var key in object) {
     if (!object.hasOwnProperty(key)) { continue }

     var value = object[key];
     if (typeof value === 'object') {
       pairs.push(buildPayload(value, key))
       continue
     }

     var nkey = key;
     if (prefix != '') { nkey = '[' + nkey + ']' }
     nkey = prefix + nkey;
     pairs.push(encodeURIComponent(nkey) + '=' + encodeURIComponent(value));
   }

   return pairs.join('&')
 }

 var submitPayment = function(token) {
   // You can access the token ID with `token.id`.
   // Get the token ID to your server-side code for use.
   var xhr = new XMLHttpRequest();

   token.amount = parseInt(document.getElementById('amount').value) * 100 || 2500;

   xhr.open('POST', 'https://shreve-checkout.herokuapp.com/charge', true);
   xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
   xhr.onreadystatechange = function() {
     if (xhr.readyState === XMLHttpRequest.DONE) {
       if (xhr.status === 200) {
         document.getElementById('success-message').style.display = 'inherit';
       }
     }
   }
   xhr.send(buildPayload(token));
 }

 var handler = StripeCheckout.configure({
   key: 'pk_live_5rKbBtR5Yi0Q1OGq3eE01Xym',
   image: 'https://s3.amazonaws.com/stripe-uploads/acct_14sFRaCsYbApDjydmerchant-icon-1434318889311-jacob-evan-shreve-bw.jpg',
   locale: 'auto',
   token: submitPayment,
   bitcoin: true
 });

 document.getElementById('customButton').addEventListener('click', function(e) {
   e.preventDefault();

   var amount = parseInt(document.getElementById('amount').value) * 100 || 2500;

   // Open Checkout with further options:
   handler.open({
     name: 'Jacob Shreve',
     description: 'Donation',
     zipCode: false,
     amount: amount
   });
 });

 // Close Checkout on page navigation:
 window.addEventListener('popstate', function() {
   handler.close();
 });
</script>
