import { Team } from '../models/Team.js';
import { Player } from '../models/Player.js';
import { AuctionHistory } from '../models/AuctionHistory.js';

export class AuctionService {
  static async assignPlayerToTeam(playerId, teamId, soldPrice) {
    try {
      // Validate player exists and is available
      const player = await Player.getById(playerId);
      if (!player) {
        throw new Error('Player not found');
      }
      if (player.status === 'SOLD') {
        throw new Error('Player already sold');
      }

      // Validate team exists
      const team = await Team.getById(teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      // Check if team already has 5 players
      const playerCount = await Player.countTeamPlayers(teamId);
      if (playerCount >= 5) {
        throw new Error('Team already has 5 players');
      }

      // Check if team has sufficient purse
      if (team.remaining_purse < soldPrice) {
        throw new Error('Insufficient purse');
      }

      // Deduct from purse
      await Team.updatePurse(teamId, soldPrice);

      // Increment player count
      await Team.incrementPlayerCount(teamId);

      // Assign player to team
      await Player.assignToTeam(playerId, teamId, soldPrice);

      // Record transaction
      await AuctionHistory.addEntry(playerId, teamId, soldPrice, 'SOLD');

      return {
        success: true,
        message: 'Player assigned successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  static async undoLastAuction() {
    try {
      const lastAuction = await AuctionHistory.getLatest();

      if (!lastAuction) {
        throw new Error('No auction to undo');
      }

      const playerId = lastAuction.player_id;
      const teamId = lastAuction.team_id;
      const soldPrice = lastAuction.sold_price;

      // Unassign player
      await Player.unassignFromTeam(playerId);

      // Restore purse
      await Team.updatePurse(teamId, -soldPrice); // Negative to restore (add back)

      // Decrement player count
      await Team.decrementPlayerCount(teamId);

      // Record undo
      await AuctionHistory.addEntry(playerId, teamId, soldPrice, 'UNDONE');

      return {
        success: true,
        player: lastAuction.cricketer_name,
        team: lastAuction.team_name,
        soldPrice
      };
    } catch (error) {
      throw error;
    }
  }

  static async resetAuction() {
    try {
      // Clear all player assignments
      const db = (await import('../config/database.js')).default;
      
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          // Reset players
          db.run('UPDATE players SET sold_to_team_id = NULL, status = "AVAILABLE", sold_price = NULL');

          // Reset teams
          db.run('UPDATE teams SET remaining_purse = 10000000, players_count = 0, score = 0');

          // Clear history
          db.run('DELETE FROM auction_history', function(err) {
            if (err) reject(err);
            else resolve({ success: true, message: 'Auction reset successfully' });
          });
        });
      });
    } catch (error) {
      throw error;
    }
  }

  static async validateBid(teamId, bidAmount) {
    try {
      const team = await Team.getById(teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      if (team.remaining_purse < bidAmount) {
        throw new Error('Insufficient purse');
      }

      return { valid: true };
    } catch (error) {
      throw error;
    }
  }

  static async getAuctionStatus() {
    try {
      const teams = await Team.getAll();
      const players = await Player.getAll();
      const available = await Player.getAvailable();

      const teamStats = teams.map(team => ({
        ...team,
        players: players.filter(p => p.sold_to_team_id === team.id)
      }));

      return {
        teams: teamStats,
        totalPlayers: players.length,
        availablePlayers: available.length,
        soldPlayers: players.length - available.length
      };
    } catch (error) {
      throw error;
    }
  }
}
