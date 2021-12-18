"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}
$navLogin.on("click", navLoginClick);

function navSubmitClick(evt) {
  if (currentUser) {
    console.debug('navSubmitClick', evt);
    //hidePageComponents();
    $storyForm.show();
  } else {
    navLoginClick()
  }
}
$navSubmit.on("click", navSubmitClick)

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $loginForm.hide();
  $signupForm.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function navFavorites() {
  console.debug('navFavorites')
  hidePageComponents()
  putStoriesOnPage(true)
}

$navFavorites.on('click', navFavorites)

function navStories() {
  console.debug('navStories')
  hidePageComponents()
}

$navStories.on('click', navStories)
