"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;


/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/*
A function to check if a story has been favorited, returns true (is favorited) or false (otherwise)
*/

function favoritesIncludes(currentStory) {
  return currentUser.favorites.some(story => story.storyId === currentStory.id)
}

/*
 * A render method to render HTML for a favorite icon
 * Only works if user is logged in, and if no favorite stars are already drawn on the page
 * Checks to see if a story has been favorited, and colors the favorite star accordingly.
 * No return value
*/
function addStarSpans() {
  let starIndicatorClass = 'is-a-fav-star'                                                     // place in <i> element to identify favorite stars in document query (or jquery)
  let noStarsDrawn = $(`.${starIndicatorClass}`).length === 0 ? true : false;                  // check to see if stars already displayed on page
  if (currentUser && noStarsDrawn) {
    // place favorite star icons on the page if none already drawn
    console.debug('addStarSpans')
    let displayedStoryHtmlElement = $allStoriesList.children();                                // find all stories currently drawn on the page 
    let newSpan                                                                                // initialize variable for filling with star elements

    for (let currentStoryElement of displayedStoryHtmlElement) {
      let starClass = favoritesIncludes(currentStoryElement) ? 'fas' : 'far'                   // /determine color of star
      newSpan = $(`<span> <i class='${starIndicatorClass} fa-star ${starClass}'></i> </span>`) // create element with star
      newSpan.prependTo(currentStoryElement);                                                  // add to the dom
    }
  }
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  console.log(hostName)

  let newLi = $(`
  <li id="${story.storyId}">
    <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <small class="story-author">by ${story.author}</small>
    <small class="story-user">posted by ${story.username}</small>
  </li>
`)
  return newLi
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(onlyFavorites = false, onlyUserStories = false) {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  let storiesOfInterest
  if (onlyFavorites) {
    storiesOfInterest = currentUser.favorites;
  } else if (onlyUserStories) {
    storiesOfInterest = currentUser.ownStories;
  } else {
    storiesOfInterest = storyList.stories;
  }

  for (let currentStory of storiesOfInterest) {
    const $story = generateStoryMarkup(currentStory);
    $allStoriesList.append($story);
  }
  addStarSpans();
  $allStoriesList.show();
}

/* Submit a story to the API, no return value
Function called when a user submits a story form (takes event as input)
Pulls data from the form, creates a stotry object
And stores it in a data structure containing all stories the user created */

async function submitStory(evt) {
  evt.preventDefault();
  // get data from form submission
  let title = $('#story-title').val();
  let url = $('#story-url').val();

  // package data into the correct object structure for addStory
  let submittedStory = { title, url, author: currentUser.username };

  // add story to the database, and get a Story object in return
  let newStory = await storyList.addStory(currentUser, submittedStory)
  currentUser.ownStories.push(newStory); // add to the user's own story list w/o doing another query

  // get all stories, including ones created since user uploaded their own content, overwrite old storylist
  getAndShowStoriesOnStart()
  $storyForm.hide();

}

/* Add an event listener for submitting the story form*/

$storyForm.on("submit", submitStory)

/* Function to toggle the font-awesome color whenever a user clicks and adds/removes a favorite */
function toggleFavorite(faStarElement) {
  faStarElement.classList.toggle('fas'); // golden
  faStarElement.classList.toggle('far'); // gray
}



/* create a function to handle when a user toggles on/off a favorite
verifies that a user is logged in, and has clicked on a star representing a favorite-icon.
If so, it toggles the favorite icon in the HTML by swapping a CSS class,
it toggles the favorite in the API, and in the currentUser object
*/
async function handleStoryListClick(evt) {
  if (!currentUser) return
  let target = evt.target
  console.debug('handleStoryListClick', evt)
  let storyId = evt.target.parentNode.parentNode.id
  let validStarIcon = target.classList.contains('fa-star')
  if (currentUser && validStarIcon) {
    // toggle the color classes
    toggleFavorite(target);                           // update the html class list to be fas / far (UI)
    let isFavorite = target.classList.contains('fas') // if it is a favorite, we will add to api, otherwise delete
    currentUser.toggleFavoriteInApi(storyId, isFavorite);
  }
}

/* Add an event listener to look for a user's attempt to toggle on/off a favorite story*/

$allStoriesList.on('click', handleStoryListClick);