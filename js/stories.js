"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let starsEmpty = true;
let favorites = JSON.parse(localStorage.getItem('favoriteSet'));
let myStories;
if (!favorites) {
  // favorites list hasn't been initialized yet
  favorites = []
  localStorage.setItem('favoriteSet', JSON.stringify([]))
}

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function addStarSpans() {
  if (currentUser && starsEmpty) {
    console.debug('addStarSpans')
    starsEmpty = false;
    let displayedStories = $allStoriesList.children();
    let newSpan
    for (let currentStory of displayedStories) {
      let starType = favorites.includes(currentStory.id) ? 'fas' : 'far'
      newSpan = $(`<span>
                      <i class='fa-star ${starType}'></i> 
                       </span>`)
      newSpan.prependTo(currentStory);
    }
  }
}
function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName(); // font-awesome star taken from working code

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

function putStoriesOnPage(onlyFavorites = false) {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();
  starsEmpty = true;
  // loop through all of our stories and generate HTML for them
  let isFavorite;
  for (let story of storyList.stories) {
    isFavorite = (onlyFavorites && favorites.includes(story.storyId))
    if (isFavorite || !onlyFavorites) {
      const $story = generateStoryMarkup(story);
      $allStoriesList.append($story);
    }
  }
  addStarSpans();
  $allStoriesList.show();
}

async function submitStory(evt) {
  evt.preventDefault();
  let title = $('#story-title').val();
  let url = $('#story-url').val();

  let submittedStory = { title, url, author: currentUser.username };

  // add story to the database
  await storyList.addStory(currentUser, submittedStory)
  // get all stories, including all new ones, overwrite old storylist
  getAndShowStoriesOnStart()
  $storyForm.hide();

}

$storyForm.on("submit", submitStory)

function toggleFavorite(faStarElement) {
  faStarElement.classList.toggle('fas'); // golden
  faStarElement.classList.toggle('far'); // gray
}

function toggleFavoriteInLocalStorage(faStarElement) {
  let id = faStarElement.parentElement.parentElement.id
  let isFavorite = faStarElement.classList.contains('fas');
  if (isFavorite) {
    favorites.push(id);
  } else {
    favorites = favorites.filter(value => value != id)
  }
  localStorage.setItem('favoriteSet', JSON.stringify(favorites));
}


function handleStoryListClick(evt) {
  let target = evt.target
  let validStarIcon = target.classList.contains('fa-star')
  if (currentUser && validStarIcon) {
    // toggle the color classes
    toggleFavorite(target);
    toggleFavoriteInLocalStorage(target);
  }
}

$allStoriesList.on('click', handleStoryListClick);