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
  gapi.client.setApiKey(constants.API_KEY);
  addEventHandlers();
  addSearchConstraint();
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

var templates = {};
function getTemplate(templateId) {
  if (!(templateId in templates)) {
    templates[templateId] = Handlebars.compile($('#' + templateId).html());
  }

  return templates[templateId];
}

// Takes a template id and the value for the template, renders it, and returns a new
// jQuery element.
function renderTemplate(templateId, templateValues) {
  var template = getTemplate(templateId);
  var html = template(templateValues);
  return $(html);
}

// Wires up various JavaScript event handlers for elements on the page.
function addEventHandlers() {
  $('#and').click(function(e) {
    e.preventDefault();
    $('<span class="inline-text">and</span>').insertBefore($('#and'));
    addSearchConstraint();
  });

  // Whenever a "change" event is fired for an element with class "selectpicker" that is a child of
  // "search-details", this handler will be fired. It creates a fresh autocomplete text element.
  $('#search-details').on('change', '.selectpicker', function() {
    var textElement = $(this).siblings('input[type=text]');
    textElement.remove();

    var searchPairElement = $(this).parent();
    searchPairElement.append('<input type="text">');
    addSuggestionsTo(searchPairElement);
  });
}

// Makes the Freebase and YouTube API calls needed to find videos that match the search criteria.
function findTrailers() {
  clearOutput();

  freebase.search('', freebase.buildFilter(), '(description)', function(data) {
    if (data.result && data.result.length > 0) {
      var movies = data.result;

      var movieTemplateValues = [];
      var deferreds = [];

      // Loop through all of the movies returned by the Freebase search.
      $.each(movies, function(index, movie) {
        var deferred = youtube.getVideoIdForMid(movie.mid).done(function(videoId) {
          if (videoId) {
            movieTemplateValues.push({
              title: movie.name,
              description: freebase.getDescription(movie),
              videoId: videoId,
              mid: movie.mid
            });
          }
        });

        // Add this deferred object to the list of all the deferreds we are waiting on.
        deferreds.push(deferred);
      });

      // The jQuery.when() method (http://api.jquery.com/jQuery.when/) will wait until all of the
      // promises are resolved, and then invoke the .done() handler.
      // This allows us to defer execution until all of the youtube.getVideoIdForMid() calls are done.
      // The .apply() syntax is needed since .when() doesn't accept an array as a parameter—it expects
      // an argument list of promises, not an array.
      $.when.apply($, deferreds).done(function() {
        if (movieTemplateValues.length > 0) {
          // Sort the results alphabetically by movie title before displaying them.
          movieTemplateValues = movieTemplateValues.sort(function(a, b) {
            return a.title.localeCompare(b.title);
          });

          var movieElement = renderTemplate('movie-template', {
            movies: movieTemplateValues
          });

          $('#movies-list').append(movieElement);
        } else {
          // If there were results from the Freebase search, but there were no YouTube videos
          // associated with any of the movies, display this error.
          showMessage('No videos found.');
        }
      });
    } else {
      // If there no results returned from Freebase, display this error.
      showMessage('No videos found.');
    }
  });
}

// Adds a new search constraint to the page.
function addSearchConstraint() {
  // Renders the inline Handlebars template and gets back a jQuery element.
  var newSearchPair = renderTemplate('search-pair-template');

  var newSelect = newSearchPair.children('select');
  // selectpicker() creates a Bootstrap-styled select element.
  newSelect.selectpicker({
    style: 'btn-inverse',
    size: 4
  });

  // Add the new search element to the DOM before the "and" button.
  newSearchPair.insertBefore($('#and'));

  addSuggestionsTo(newSearchPair);
}

// Takes in a search-pair element, and adds in the Freebase Search Widget logic and event handlers.
function addSuggestionsTo(searchPair) {
  var select = searchPair.children('select:first');
  var relation = select.children('option:selected').val();
  var textField = searchPair.children('input[type=text]:first');
  textField.val('');
  var hiddenField = searchPair.children('input[type=hidden]:first');

  var filter = freebase.getFilterByRelation(relation);

  // .suggest() sets up the Freebase Search Widget's auto-completion logic.
  textField.suggest({
    key: constants.API_KEY,
    filter: filter
  }).bind('fb-select', function(e, data) {
    e.stopPropagation();
    hiddenField.val(data.mid);
    findTrailers();
  });
}