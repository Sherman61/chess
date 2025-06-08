function generateRoomName(user1, user2) {
    const base = `${user1}-${user2}`;
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
  }
  
  module.exports = {
    generateRoomName
  };
  