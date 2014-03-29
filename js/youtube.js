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

window.youtube = {
  // Given a Freebase mid (http://wiki.freebase.com/wiki/Machine_ID), perform a search.list() call
  // to find the top-ranked video that matches it and includes the the word 'trailer'.
  // search.list() docs: https://developers.google.com/youtube/v3/docs/search/list
  // Returns a Promise, which could then be resolved to process the response, which is the videoId
  // that best corresponds to the mid, or null if none was found.
  // More info on Promises: http://net.tutsplus.com/tutorials/javascript-ajax/wrangle-async-tasks-with-jquery-promises/
  getVideoIdForMid: function(mid) {
    var deferred = $.Deferred();

    var request = gapi.client.request({
      path: [constants.YOUTUBE_API_SERVICE, constants.YOUTUBE_API_VERSION, 'search'].join('/'),
      params: {
        topicId: mid,
        q: 'trailer',
        type: 'video',
        maxResults: 1,
        part: 'id',
        videoEmbeddable: true
      },
      callback: function(response) {
        var videoId = null;

        // If the API returned a response, we'll want to return the videoId.
        if (response.items && response.items.length > 0) {
          videoId = response.items[0].id.videoId;
        }

        // Regardless of whether anything was found, call resolve() to return the response.
        deferred.resolve(videoId);
      }
    });

    return deferred.promise();
  }
};