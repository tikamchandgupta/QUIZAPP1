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
{ name: "Rohit Sharma", question: "Why can ElementNotInteractableException occur?", answer: "Element is overlapped by another element", optionA: "Element is hidden", optionB: "Element is disabled", optionC: "Element is outside viewport", optionD: "Element is overlapped by another element", price: 2000000 },

{ name: "Virat Kohli", question: "Which is the MOST correct statement about getText()?", answer: "Returns rendered text as seen by user", optionA: "Returns visible text", optionB: "Ignores hidden elements", optionC: "Returns rendered text as seen by user", optionD: "Extracts text based on browser layout engine", price: 2000000 },

{ name: "Tilak Verma", question: "Why can visibilityOfElementLocated still fail even when element is visible in browser?", answer: "All of the above", optionA: "CSS opacity 0", optionB: "Element outside viewport", optionC: "Element inside shadow DOM", optionD: "All of the above", price: 1500000 },

{ name: "MS Dhoni", question: "What is returned when getText() is called on a hidden element?", answer: "Empty String", optionA: "Null", optionB: "Exception", optionC: "Empty String", optionD: "Hidden text", price: 2000000 },

{ name: "Sanju Samson", question: "Why does this code sometimes throw ElementClickInterceptedException? driver.findElement(By.id(\"login\")).click();", answer: "Another element overlaps it", optionA: "Element not visible", optionB: "Another element overlaps it", optionC: "Element inside iframe", optionD: "DOM refreshed", price: 1500000 },

{ name: "Harshal Patel", question: "What happens if findElement() does not find any matching element?", answer: "Throws NoSuchElementException", optionA: "Returns null", optionB: "Returns empty list", optionC: "Throws NoSuchElementException", optionD: "Waits indefinitely", price: 1000000 },

{ name: "Riyan Parag", question: "What does findElements() return if no elements are found?", answer: "Empty List", optionA: "null", optionB: "Empty List", optionC: "Throws NoSuchElementException", optionD: "Throws TimeoutException", price: 1000000 },

{ name: "Unknown", question: "What is the difference between presenceOfElementLocated and visibilityOfElementLocated?", answer: "Presence checks DOM only; Visibility checks display status", optionA: "No difference", optionB: "Presence checks DOM only; Visibility checks display status", optionC: "Visibility ignores DOM", optionD: "Presence checks CSS", price: 1000000 },

{ name: "Hardik Pandya", question: "What is returned when getText() is called on a hidden element?", answer: "Empty String", optionA: "Null", optionB: "Exception", optionC: "Empty String", optionD: "Hidden text", price: 1500000 },

{ name: "Sunil Narine", question: "What happens here? driver.switchTo().frame(0); driver.switchTo().defaultContent(); driver.switchTo().frame(0);", answer: "Frame switches successfully", optionA: "Frame switches successfully", optionB: "Exception", optionC: "Nested frame issue", optionD: "Frame already selected", price: 1500000 },

{ name: "Jasprit Bumrah", question: "What will this code do? WebElement element = driver.findElement(By.id(\"login\")); driver.navigate().refresh(); element.click();", answer: "Throws StaleElementReferenceException", optionA: "Works normally", optionB: "Throws NoSuchElementException", optionC: "Throws StaleElementReferenceException", optionD: "Click ignored", price: 2000000 },

{ name: "Unknown", question: "Which of the following ensures logging only when validation fails?", answer: "log().ifValidationFails()", optionA: "log().all()", optionB: "log().ifError()", optionC: "log().ifValidationFails()", optionD: "log().ifFails()", price: 1500000 },

{ name: "Unknown", question: "What does this code return? Response res = given().when().get(\"/users\"); System.out.println(res.path(\"data.id\"));", answer: "[1,2]", optionA: "1", optionB: "[1,2]", optionC: "null", optionD: "Exception", price: 1000000 },

{ name: "Unknown", question: "What request is sent? given().pathParam(\"id\",5).queryParam(\"id\",10).when().get(\"/users/{id}\")", answer: "/users/5?id=10", optionA: "/users/5?id=10", optionB: "/users/10?id=5", optionC: "/users/5?id=5", optionD: "/users/10?id=10", price: 1000000 },

{ name: "Unknown", question: "If content-type is not set while sending body Map.of(\"id\",10) in POST request, what happens?", answer: "Automatically converted to JSON", optionA: "Request fails", optionB: "Automatically converted to JSON", optionC: "Sent as plain text", optionD: "Sent as form data", price: 1500000 },

{ name: "Unknown", question: "Extract vs Assert Trick: In REST Assured extraction with validation, what happens first?", answer: "Validation happens before extraction", optionA: "Assertion happens after extraction", optionB: "Extraction happens before validation", optionC: "Validation happens before extraction", optionD: "Both run simultaneously", price: 1500000 }
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
