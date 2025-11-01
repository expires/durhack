const users = [];

class UserModel {
  constructor(email, code, expiration) {
    this.email = email;
    this.code = code;
    this.expiration = expiration;
  }

  static createUserOrUpdate(email, code, expiration) {
    const existingUser = this.findUserByEmail(email);

    if (existingUser) {
      existingUser.code = code;
      existingUser.expiration = expiration;
      return existingUser;
    } else {
      const newUser = new UserModel(email, code, expiration);
      users.push(newUser);
      return newUser;
    }
  }

  static findUserByEmail(email) {
    return users.find((user) => user.email === email);
  }
  static deleteUserByEmail(email) {
    const index = users.findIndex((user) => user.email === email);

    if (index !== -1) {
      users.splice(index, 1);
    }
    console.log(users);
  }
  static printUsers() {
    console.log(users);
  }
}

module.exports = UserModel;
