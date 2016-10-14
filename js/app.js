//global
var endPoint = "https://api.stackexchange.com/2.2/questions/unanswered";

// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function(question) {

  // clone our result template code
  var result = $('.templates .question').clone();

  // Set the question properties in result
  var questionElem = result.find('.question-text a');
  // console.log(questionElem,'ques elem');
  questionElem.attr('href', question.link);
  questionElem.text(question.title);

  // set the date asked property in result
  var asked = result.find('.asked-date');
  var date = new Date(1000 * question.creation_date);
  asked.text(date.toString());

  // set the .viewed for question property in result
  var viewed = result.find('.viewed');
  viewed.text(question.view_count);

  // set some properties related to asker
  var asker = result.find('.asker');
  asker.html('<p>Name: <a target="_blank" ' +
    'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
    question.owner.display_name +
    '</a></p>' +
    '<p>Reputation: ' + question.owner.reputation + '</p>'
  );

  return result;
};

// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
  var results = resultNum + ' results for <strong>' + query + '</strong>';
  return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error) {
  var errorElem = $('.templates .error').clone();
  var errorText = '<p>' + error + '</p>';
  errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {

  // the parameters we need to pass in our request to StackOverflow's API
  var request = {
    tagged: tags,
    site: 'stackoverflow',
    order: 'desc',
    sort: 'creation'
  };

  $.ajax({
      url: endPoint,
      data: request,
      dataType: "jsonp", //use jsonp to avoid cross origin issues
      type: "GET",
    })
    .done(function(result) { //this waits for the ajax to return with a succesful promise object
      var searchResults = showSearchResults(request.tagged, result.items.length);

      $('.search-results').html(searchResults);
      //$.each is a higher order function. It takes an array and a function as an argument.
      //The function is executed once for each item in the array.
      $.each(result.items, function(i, item) {
        var question = showQuestion(item);
        $('.results').append(question);
      });
    })
    .fail(function(jqXHR, error) { //this waits for the ajax to return with an error promise object
      var errorElem = showError(error);
      $('.search-results').append(errorElem);
    });
};

var showTopAnswerers = function(topPeople) {

  // clone the template
  var resultTemplate = $('.template2 .answerers').clone();

  // fill in the template//
  var answerersName = resultTemplate.find('.answerers-name a');
  answerersName.html('<p>Name: <a href=http://stackoverflow.com/users/' + topPeople.owner.user_id + ' >' +
    topPeople.owner.display_name + '</a></p>');

  // answerersName.html('<p>Name: ' + topPeople.owner.display_name + ', </p> ' + topPeople.owner.user_id);
  // +'<br><p><a href=http://stackoverflow.com/users/'  ' >' + '</a></p>'

  console.log(topPeople.owner.display_name, 'name');
  console.log(topPeople.owner.user_id, 'user id');

  var answerersRep = resultTemplate.find('.reputation')
  answerersRep.text(topPeople.owner.reputation);

  var answerersViews = resultTemplate.find('.viewed')
  answerersViews.text(topPeople.view_count);
  // console.log(topPeople.view_count, 'view #');

  // var votes =  $('.votes').

  return resultTemplate;
};

var topAnswerers = function(topAns) {

  var params = {
    tagged: topAns,
    site: 'stackoverflow',
    order: 'desc',
    sort: 'votes',
    // url: endPoint
  };

  $.ajax({
      url: endPoint,
      dataType: 'jsonp',
      type: 'GET',
      data: params
    })
    .done(function(result) {
      var yourResults = 'Your ' + topAns + ' search, returned ' + result.items.length + ' results.';
      $('.search-results').html('<br>' + '<b>' + yourResults + '</b>');

      $.each(result.items, function(i, item) {
        var postData = showTopAnswerers(item);
        $('.results').append(postData);
      });
    });

};

$(function() {
  $('.unanswered-getter').submit(function(e) {
    e.preventDefault();
    // zero out results if previous search has run
    $('.results').html('');
    // get the value of the tags the user submitted
    var tags = $(this).find("input[name='tags']").val();
    getUnanswered(tags);
  });

  $('.inspiration-getter').on('submit', function(e) {
    e.preventDefault();

    var topAns = $(this).find("input[name='answerers']").val();
    topAnswerers(topAns);
  });

});