import db from './database.js';

export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Teams table
      db.run(`
        CREATE TABLE IF NOT EXISTS teams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          initial_purse INTEGER NOT NULL,
          remaining_purse INTEGER NOT NULL,
          players_count INTEGER NOT NULL DEFAULT 0,
          score INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Players table
      db.run(`
        CREATE TABLE IF NOT EXISTS players (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cricketer_name TEXT NOT NULL,
          question_text TEXT NOT NULL,
          answer_text TEXT NOT NULL,
          option_a TEXT,
          option_b TEXT,
          option_c TEXT,
          option_d TEXT,
          base_price INTEGER NOT NULL,
          sold_to_team_id INTEGER,
          sold_price INTEGER,
          status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'SOLD')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(sold_to_team_id) REFERENCES teams(id)
        )
      `);

      // Auction history table for undo functionality
      db.run(`
        CREATE TABLE IF NOT EXISTS auction_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          player_id INTEGER NOT NULL,
          team_id INTEGER,
          sold_price INTEGER,
          action TEXT NOT NULL CHECK(action IN ('SOLD', 'UNDONE')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(player_id) REFERENCES players(id),
          FOREIGN KEY(team_id) REFERENCES teams(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

export const seedInitialData = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Check if data already exists
      db.get('SELECT COUNT(*) as count FROM teams', (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count > 0) {
          console.log('Database already seeded');
          resolve();
          return;
        }

        const initialPurse = parseInt(process.env.INITIAL_PURSE) || 10000;

        // Insert teams
        const teams = ['Mumbai Indians', 'Delhi Capitals', 'Royal Challengers', 'Kolkata Knight Riders'];
        teams.forEach((team) => {
          db.run(
            'INSERT INTO teams (name, initial_purse, remaining_purse) VALUES (?, ?, ?)',
            [team, initialPurse, initialPurse]
          );
        });

        // Insert players (cricketers and questions)
        const players = [
          { name: 'Virat Kohli', question: 'What is the capital of France?', answer: 'Paris', optionA: 'London', optionB: 'Paris', optionC: 'Berlin', optionD: 'Madrid', price: 1600 },
          { name: 'Rohit Sharma', question: 'What is 2 + 2?', answer: '4', optionA: '3', optionB: '4', optionC: '5', optionD: '6', price: 1500 },
          { name: 'KL Rahul', question: 'Who wrote Romeo and Juliet?', answer: 'William Shakespeare', optionA: 'Jane Austen', optionB: 'William Shakespeare', optionC: 'Mark Twain', optionD: 'Charles Dickens', price: 1400 },
          { name: 'Rishabh Pant', question: 'What is the largest planet?', answer: 'Jupiter', optionA: 'Saturn', optionB: 'Mars', optionC: 'Jupiter', optionD: 'Neptune', price: 1300 },
          { name: 'Jasprit Bumrah', question: 'What is the chemical symbol for gold?', answer: 'Au', optionA: 'Go', optionB: 'Gd', optionC: 'Au', optionD: 'Ag', price: 1200 },
          { name: 'Ravichandran Ashwin', question: 'In what year did World War 2 end?', answer: '1945', optionA: '1943', optionB: '1944', optionC: '1945', optionD: '1946', price: 1100 },
          { name: 'Hardik Pandya', question: 'What is the smallest country in the world?', answer: 'Vatican City', optionA: 'Monaco', optionB: 'Vatican City', optionC: 'Liechtenstein', optionD: 'San Marino', price: 1000 },
          { name: 'Yuzvendra Chahal', question: 'What is the speed of light?', answer: '299,792,458 m/s', optionA: '150,000,000 m/s', optionB: '299,792,458 m/s', optionC: '300,000,000 m/s', optionD: '250,000,000 m/s', price: 900 },
          { name: 'Suryakumar Yadav', question: 'Who is the author of Harry Potter?', answer: 'J.K. Rowling', optionA: 'J.R.R. Tolkien', optionB: 'J.K. Rowling', optionC: 'Stephenie Meyer', optionD: 'Suzanne Collins', price: 800 },
          { name: 'Siraj Mohammad', question: 'What is the boiling point of water?', answer: '100°C', optionA: '50°C', optionB: '100°C', optionC: '150°C', optionD: '200°C', price: 700 },
          { name: 'Arjun Tendulkar', question: 'What is the longest river in the world?', answer: 'The Nile', optionA: 'The Amazon', optionB: 'The Yangtze', optionC: 'The Nile', optionD: 'The Mississippi', price: 600 },
          { name: 'Deepak Chahar', question: 'How many continents are there?', answer: '7', optionA: '5', optionB: '6', optionC: '7', optionD: '8', price: 500 },
          { name: 'Harshal Patel', question: 'What is the currency of Japan?', answer: 'Yen', optionA: 'Pound', optionB: 'Euro', optionC: 'Yen', optionD: 'Dollar', price: 400 },
          { name: 'Avesh Khan', question: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci', optionA: 'Michelangelo', optionB: 'Leonardo da Vinci', optionC: 'Raphael', optionD: 'Donatello', price: 300 },
          { name: 'Umran Malik', question: 'What is the largest ocean?', answer: 'Pacific Ocean', optionA: 'Atlantic Ocean', optionB: 'Indian Ocean', optionC: 'Pacific Ocean', optionD: 'Arctic Ocean', price: 250 },
          { name: 'Riyan Parag', question: 'How many strings does a standard guitar have?', answer: '6', optionA: '4', optionB: '5', optionC: '6', optionD: '8', price: 200 }
        ];

        players.forEach((player) => {
          db.run(
            'INSERT INTO players (cricketer_name, question_text, answer_text, option_a, option_b, option_c, option_d, base_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [player.name, player.question, player.answer, player.optionA, player.optionB, player.optionC, player.optionD, player.price]
          );
        });

        db.exec('', (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database seeded successfully');
            resolve();
          }
        });
      });
    });
  });
};
