const db = require('./config');

function createGame(room, white, black) {
  const sql = `
    INSERT INTO ongoing_games (room_name, white_player, black_player)
    VALUES (?, ?, ?)
  `;
  return db.promise().execute(sql, [room, white, black]);
}

function updateMoveHistory(room, moveHistory, currentTurn) {
  const sql = `
    UPDATE ongoing_games
    SET move_history = ?, current_turn = ?, last_updated = NOW()
    WHERE room_name = ?
  `;
  return db.promise().execute(sql, [JSON.stringify(moveHistory), currentTurn, room]);
}

module.exports = {
  createGame,
  updateMoveHistory
};
