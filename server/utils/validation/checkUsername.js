module.exports = (username) => {
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  return usernameRegex.test(username) && username.length > 3;
};
