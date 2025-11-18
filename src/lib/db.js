import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const dbPath = path.join(process.cwd(), 'malopolska_outdoor.db');

class Database {
  constructor() {
    this.initPromise = new Promise((resolve, reject) => {
      this.initResolve = resolve;
      this.initReject = reject;
    });

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        if (this.initReject) {
          this.initReject(err);
        }
      } else {
        console.log('Connected to SQLite database');
        this.initialize()
          .then(() => {
            if (this.initResolve) {
              this.initResolve();
            }
          })
          .catch((error) => {
            console.error('Database initialization error:', error);
            if (this.initReject) {
              this.initReject(error);
            }
          });
      }
    });
  }

  rawRun(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  rawGet(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  rawAll(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async run(sql, params = []) {
    await this.initPromise;
    return this.rawRun(sql, params);
  }

  async get(sql, params = []) {
    await this.initPromise;
    return this.rawGet(sql, params);
  }

  async all(sql, params = []) {
    await this.initPromise;
    return this.rawAll(sql, params);
  }

  async initialize() {
    try {
      // Users table
      await this.rawRun(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User preferences table
      await this.rawRun(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          difficulty_levels TEXT,
          regions TEXT,
          activity_types TEXT,
          onboarding_completed BOOLEAN DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Add onboarding_completed column if it doesn't exist (for existing databases)
      try {
        await this.rawRun(`ALTER TABLE user_preferences ADD COLUMN onboarding_completed BOOLEAN DEFAULT 0`);
      } catch (e) {
        // Column already exists, ignore error
      }

      // Ensure user_id is unique so ON CONFLICT(user_id) works correctly
      await this.rawRun(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_user_id
        ON user_preferences(user_id)
      `);

      // Activities table
      await this.rawRun(`
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          region TEXT NOT NULL,
          activity_type TEXT NOT NULL,
          location TEXT NOT NULL,
          duration TEXT,
          distance TEXT,
          elevation TEXT,
          image_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User progress table
      await this.rawRun(`
        CREATE TABLE IF NOT EXISTS user_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          activity_id INTEGER NOT NULL,
          completed BOOLEAN DEFAULT 0,
          completed_at DATETIME,
          rating INTEGER,
          notes TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
          UNIQUE(user_id, activity_id)
        )
      `);

      // Challenges table
      await this.rawRun(`
        CREATE TABLE IF NOT EXISTS challenges (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          target_count INTEGER NOT NULL,
          period TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User challenges table
      await this.rawRun(`
        CREATE TABLE IF NOT EXISTS user_challenges (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          challenge_id INTEGER NOT NULL,
          current_count INTEGER DEFAULT 0,
          completed BOOLEAN DEFAULT 0,
          started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
        )
      `);

      await this.seedActivities();
      await this.seedChallenges();

      console.log('Database initialized successfully');
    } catch (error) {
      throw error;
    }
  }

  async seedActivities() {
    const count = await this.rawGet('SELECT COUNT(*) as count FROM activities');

    if (count.count > 0) return;

    const activities = [
      {
        name: 'Szlak na Giewont',
        description: 'Kultowy szczyt Tatr z charakterystycznym krzyżem na szczycie. Wspaniałe widoki na Dolinę Kościeliską i panoramę Tatr. Wymagający podejście przez Kondracką Przełęcz.',
        difficulty: 'trudny',
        region: 'Podhale',
        activity_type: 'góry',
        location: 'Zakopane, Tatry',
        duration: '6-7 godzin',
        distance: '10 km',
        elevation: '1300 m w górę',
        image_url: '/images/giewont.jpg'
      },
      {
        name: 'Ścieżka nad Reglami',
        description: 'Malowniczy szlak rowerowy prowadzący przez urokliwe wioski podhalańskie. Idealna trasa dla rodzin z dziećmi, łagodne wzniesienia i piękne widoki na Tatry.',
        difficulty: 'łatwy',
        region: 'Podhale',
        activity_type: 'rower',
        location: 'Zakopane - Chochołów',
        duration: '3-4 godziny',
        distance: '35 km',
        elevation: '200 m w górę',
        image_url: '/images/regiel.jpg'
      },
      {
        name: 'Morskie Oko',
        description: 'Największe i najpiękniejsze jezioro w Tatrach Polskich. Łatwy spacer asfaltem, dostępny dla każdego. Możliwość kontynuacji do Czarnego Stawu pod Rysami.',
        difficulty: 'łatwy',
        region: 'Podhale',
        activity_type: 'spacer',
        location: 'Palenica Białczańska',
        duration: '2-3 godziny',
        distance: '9 km (tam i z powrotem)',
        elevation: '200 m w górę',
        image_url: '/images/morskie-oko.jpg'
      },
      {
        name: 'Spływ Dunajcem',
        description: 'Tradycyjny spływ tratwami przez Przełom Dunajca w Pieninach. Malownicze widoki na skały, zamek w Czorsztynie i Trzech Koron. Doświadczeni fliśacy opowiadają legendy.',
        difficulty: 'łatwy',
        region: 'Pieniny',
        activity_type: 'woda',
        location: 'Sromowce - Szczawnica',
        duration: '2 godziny',
        distance: '18 km',
        elevation: 'N/A',
        image_url: '/images/dunajec.jpg'
      },
      {
        name: 'Trzy Korony',
        description: 'Najbardziej znany szczyt Pienin z przepięknymi widokami na Przełom Dunajca. Mozaiwa ścieżka, miejscami strome podejścia, ale nagroda w postaci panoramy jest niesamowita.',
        difficulty: 'średni',
        region: 'Pieniny',
        activity_type: 'góry',
        location: 'Szczawnica',
        duration: '4-5 godzin',
        distance: '8 km',
        elevation: '500 m w górę',
        image_url: '/images/trzy-korony.jpg'
      },
      {
        name: 'Rowerem po Krakowie',
        description: 'Miejska trasa rowerowa przez najważniejsze zabytki Krakowa: Rynek Główny, Wawel, Kazimierz, bulwary wiślane. Płaska trasa, idealna na rodzinny wypad.',
        difficulty: 'łatwy',
        region: 'Kraków',
        activity_type: 'rower',
        location: 'Kraków - centrum',
        duration: '2-3 godziny',
        distance: '20 km',
        elevation: '50 m w górę',
        image_url: '/images/krakow-bike.jpg'
      },
      {
        name: 'Kopiec Kościuszki',
        description: 'Spacer na najwyższy kopiec w Krakowie. Piękna panorama miasta, fortyfikacje z XIX wieku, muzeum. Przyjemna wycieczka dla całej rodziny.',
        difficulty: 'łatwy',
        region: 'Kraków',
        activity_type: 'spacer',
        location: 'Kraków - Zwierzyniec',
        duration: '1-2 godziny',
        distance: '3 km',
        elevation: '100 m w górę',
        image_url: '/images/kopiec.jpg'
      },
      {
        name: 'Babia Góra',
        description: 'Najwyższy szczyt poza Tatrami (1725 m n.p.m.). Wymagający szlak przez Markowe Szczawiny, przepiękne widoki, często powyżej chmur. Dla wprawionych turystów.',
        difficulty: 'trudny',
        region: 'Beskidy',
        activity_type: 'góry',
        location: 'Zawoja',
        duration: '7-8 godzin',
        distance: '14 km',
        elevation: '1100 m w górę',
        image_url: '/images/babia-gora.jpg'
      },
      {
        name: 'Jezioro Czorsztyńskie',
        description: 'Kajaki i SUP na spokojnych wodach zbiornika. Widoki na Pieniny i Gorce, malownicze zatoczki. Możliwość wypożyczenia sprzętu na miejscu.',
        difficulty: 'łatwy',
        region: 'Pieniny',
        activity_type: 'woda',
        location: 'Czorsztyn',
        duration: '2-4 godziny',
        distance: 'dowolna',
        elevation: 'N/A',
        image_url: '/images/czorsztyn.jpg'
      },
      {
        name: 'Szlak Orlich Gniazd',
        description: 'Rowerowy szlak przez Jurę Krakowsko-Częstochowską, zamki: Ojców, Pieskowa Skała, Rabsztyn. Umiarkowanie trudny, ale piękne krajobrazy krasowe.',
        difficulty: 'średni',
        region: 'Jura',
        activity_type: 'rower',
        location: 'Ojców - Olsztyn',
        duration: '5-6 godzin',
        distance: '45 km',
        elevation: '600 m w górę',
        image_url: '/images/orle-gniazda.jpg'
      }
    ];

    for (const activity of activities) {
      await this.rawRun(
        `INSERT INTO activities (name, description, difficulty, region, activity_type, location, duration, distance, elevation, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          activity.name,
          activity.description,
          activity.difficulty,
          activity.region,
          activity.activity_type,
          activity.location,
          activity.duration,
          activity.distance,
          activity.elevation,
          activity.image_url
        ]
      );
    }

    console.log('Activities seeded successfully');
  }

  async seedChallenges() {
    const count = await this.rawGet('SELECT COUNT(*) as count FROM challenges');

    if (count.count > 0) return;

    const challenges = [
      {
        title: 'Pięć Szczytów',
        description: 'Zdobądź 5 różnych szczytów w ciągu miesiąca',
        target_count: 5,
        period: 'month'
      },
      {
        title: 'Mistrz Rowerów',
        description: 'Przejedź 100 km rowerem w ciągu miesiąca',
        target_count: 100,
        period: 'month'
      },
      {
        title: 'Odkrywca Małopolski',
        description: 'Odwiedź 3 różne regiony w ciągu miesiąca',
        target_count: 3,
        period: 'month'
      }
    ];

    for (const challenge of challenges) {
      await this.rawRun(
        `INSERT INTO challenges (title, description, target_count, period)
         VALUES (?, ?, ?, ?)`,
        [challenge.title, challenge.description, challenge.target_count, challenge.period]
      );
    }

    console.log('Challenges seeded successfully');
  }
}

const db = new Database();
export default db;