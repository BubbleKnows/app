/*
  Copyright 2013 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// Callback invoked when the Google APIs Client Library for JavaScript is ready.
// At this point, we can set the event handlers for different UI elements, since we're ready
// to make API calls.
function onJSClientLoad() {
  showMessage('All systems go!');
}

// Removes any messages and movies that are already on the page.
// Leave the <script> Handlebars template, though.
function clearOutput() {
  $('#message').empty();
  $('#movies-list').children(':not(script)').remove();
}

// Displays a message to the user.
function showMessage(message) {
  $('#message').text(message);
}