import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Button, Modal, Alert, Badge } from './Common';
import { getDisplayTeamName } from '../utils/teamNames';

export const PlayerList = ({ onSelectPlayer }) => {
  const { availablePlayers, players, loading } = useAuction();

  if (loading) {
    return <div className="loading">Loading players...</div>;
  }

  const availableCount = availablePlayers.length;
  const soldCount = players.length - availableCount;

  return (
    <div className="player-list">
      <div className="list-header">
        <h3>Players ({availableCount} Available, {soldCount} Sold)</h3>
      </div>
      <div className="players-grid">
        {players.map((player) => (
          <div
            key={player.id}
            className={`player-item ${player.status === 'SOLD' ? 'sold' : 'available'}`}
            onClick={() => player.status === 'AVAILABLE' && onSelectPlayer(player)}
          >
            <div className="player-name">{player.cricketer_name}</div>
            <div className="player-price">Base: ₹{player.base_price}</div>
            {player.status === 'SOLD' ? (
              <div className="player-sold">
                <span>Sold to {getDisplayTeamName(player.team_name)}</span>
                <span>₹{player.sold_price}</span>
              </div>
            ) : (
              <Badge text="Available" variant="available" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const TeamStatus = () => {
  const { teams } = useAuction();

  return (
    <div className="team-status">
      <h3>Teams Status</h3>
      <div className="teams-grid">
        {teams.map((team) => (
          <div key={team.id} className={`team-card ${team.players_count === 5 ? 'full' : ''}`}>
            <div className="team-name">{getDisplayTeamName(team.name)}</div>
            <div className="team-stat">
              {team.players_count}/5 Players
              {team.players_count === 5 && <Badge text="Full" variant="danger" />}
            </div>
            <div className="team-purse">₹ {team.remaining_purse.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BidForm = ({ selectedPlayer, onAssign, loading }) => {
  const { teams } = useAuction();
  const [selectedTeam, setSelectedTeam] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!selectedPlayer) {
    return <div className="bid-form empty">Select a player to start bidding</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      await onAssign(parseInt(selectedPlayer.id), parseInt(selectedTeam), parseInt(bidAmount));
      setSelectedTeam('');
      setBidAmount('');
      setShowConfirm(false);
    } catch (error) {
      console.error('Error assigning player:', error);
    }
  };

  const selectedTeamData = teams.find(t => t.id === parseInt(selectedTeam));
  const canBid = selectedTeamData && 
                 selectedTeamData.remaining_purse >= parseInt(bidAmount) && 
                 selectedTeamData.players_count < 5;

  return (
    <>
      <div className="bid-form">
        <h3>Assign Player</h3>
        <div className="selected-player">
          <div className="player-info">
            <h4>{selectedPlayer.cricketer_name}</h4>
            <p className="question">Q: {selectedPlayer.question_text}</p>
            <p className="answer">Ans: {selectedPlayer.answer_text}</p>
            <p className="base-price">Base Price: ₹{selectedPlayer.base_price}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              required
            >
              <option value="">-- Select Team --</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id} disabled={team.players_count >= 5}>
                  {team.name} ({team.players_count}/5) - ₹{team.remaining_purse.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Bid Amount</label>
            <input
              type="number"
              min={selectedPlayer.base_price}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={selectedPlayer.base_price}
              required
            />
          </div>

          {selectedTeamData && bidAmount && (
            <div className="bid-info">
              <p>Remaining after bid: ₹{(selectedTeamData.remaining_purse - parseInt(bidAmount)).toLocaleString()}</p>
            </div>
          )}

          <Button type="submit" disabled={!canBid || loading} variant="primary">
            {loading ? 'Assigning...' : 'Assign Player'}
          </Button>
        </form>
      </div>

      <Modal
        isOpen={showConfirm}
        title="Confirm Assignment"
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        confirmText="Confirm"
        cancelText="Cancel"
      >
        <div className="confirm-details">
          <p><strong>{selectedPlayer.cricketer_name}</strong></p>
          <p>Team: <strong>{selectedTeamData && getDisplayTeamName(selectedTeamData.name)}</strong></p>
          <p>Bid Amount: <strong>₹{parseInt(bidAmount).toLocaleString()}</strong></p>
          <p>Remaining Purse: <strong>₹{(selectedTeamData?.remaining_purse - parseInt(bidAmount)).toLocaleString()}</strong></p>
        </div>
      </Modal>
    </>
  );
};
