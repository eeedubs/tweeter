"use strict";
// Helps create a random user's identification

const Chance = require("chance");
const chance = new Chance();

const md5 = require('md5');

module.exports = {

  generateUserAvatars: (handle) => {
    let userAvatar = `https://vanillicon.com/${md5(handle)}`;
    let avatars = {
      small: `${userAvatar}_50.png`,
      regular: `${userAvatar}.png`,
      large: `${userAvatar}_200.png`
    }
    return avatars;
  },

  generateRandomUser: () => {
    const gender    = chance.gender();
    const firstName = chance.first({gender: gender});
    const lastName  = chance.last();
    const userName  = firstName + " " + lastName;

    let userHandle = "@";
    if (Math.random() > 0.5) {
      let prefix    = chance.prefix({gender: gender});
      prefix = prefix.replace(".", "");
      userHandle += prefix
    }

    userHandle += lastName;

    if (Math.random() > 0.5) {
      const suffix = Math.round(Math.random() * 100);
      userHandle += suffix;
    }

    const avatarUrlPrefix = `https://vanillicon.com/${md5(userHandle)}`;
    const avatars = {
      small:   `${avatarUrlPrefix}_50.png`,
      regular: `${avatarUrlPrefix}.png`,
      large:   `${avatarUrlPrefix}_200.png`
    }

    return {
      name: userName,
      handle: userHandle,
      avatars: avatars
    };
  }
};
