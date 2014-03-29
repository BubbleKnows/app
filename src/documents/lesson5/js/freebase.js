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

window.freebase = {
  // Maps a specific Freebase relationship to a search filter used by the jQuery Freebase widget.
  getFilterByRelation: function(relation) {
    return {
      '/film/film/directed_by': '(all type:/film/director)',
      'contributor': '(all type:/film/actor)',
      '/film/film/genre': '(all type:/film/film_genre)',
      'certification': '(all type:/award/award_category)'
    }[relation];
  },

  // searchResult['output']['description'] is the parent object that contains the description(s)
  // for a given film. The descriptions are either in the 'wikipedia' or 'freebase' properties,
  // depending on the source of the metadata. 'wikipedia' or 'freebase' are arrays, and we care
  // about the first item in the array.
  // For display purposes, limit the text to constants.MAX_DESCRIPTION_LENGTH characters.
  getDescription: function(searchResult) {
    var descriptions = searchResult['output']['description'];
    var description = '';
    if (descriptions != null) {
      if (descriptions['wikipedia'] != null) description = descriptions['wikipedia'][0];
      else if (descriptions['freebase'] != null) description = descriptions['freebase'][0];
    }

    description = description.substring(0, constants.MAX_DESCRIPTION_LENGTH);
    if (description.length == constants.MAX_DESCRIPTION_LENGTH) {
      description = description.substring(0, description.lastIndexOf(' ')) + '...';
    }

    return description;
  },

  // Given the user input via the jQuery Freebase widget, construct a search filter appropriate
  // for using with the Freebase Search API.
  // Freebase Search cookbook: https://developers.google.com/freebase/v1/search-cookbook
  buildFilter: function() {
    var filter = '(all type:/film/film';
    $('.search-pair').each(function() {
      var relation = $(this).find('select').val();
      var value = $(this).find('input[type=hidden]').val();
      filter += ' ' + relation + ':' + value;
    });

    return filter + ')';
  },

  // Calls the Freebase Search API with the provided parameters.
  // Freebase Search API docs: https://developers.google.com/freebase/v1/search-overview
  search: function(query, filter, output, callback) {
    $.getJSON(constants.FREEBASE_API_URL, {
      key: constants.API_KEY,
      query: query,
      filter: filter,
      output: output,
      limit: constants.MAX_FREEBASE_RESULTS
    }, callback);
  }
};