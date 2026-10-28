import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Interface for embedded store
export interface StorageState {
  users: any[];
  employees: any[];
  leaveRequests: any[];
  attendance: any[];
  announcements: any[];
  trainingPrograms: any[];
}

class DatabaseManager {
  private isMongoConnected = false;
  private state: StorageState = {
    users: [],
    employees: [],
    leaveRequests: [],
    attendance: [],
    announcements: [],
    trainingPrograms: [],
  };

  constructor() {
    this.ensureDataDir();
    this.loadState();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }
  }

  private loadState() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing local database file, initializing clean state.', err);
    }
  }

  public saveState() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving local database state:', err);
    }
  }

  public getState(): StorageState {
    return this.state;
  }

  public get isConnected(): boolean {
    return this.isMongoConnected;
  }

  public async connect(): Promise<boolean> {
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      try {
        console.log(`Attempting to connect to MongoDB at ${mongoUri.replace(/:([^:@]+)@/, ':****@')}...`);
        // Fast timeout if not reachable
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 3000,
        });
        this.isMongoConnected = true;
        console.log('Successfully connected to MongoDB via Mongoose!');
        return true;
      } catch (error: any) {
        console.warn('MongoDB connection failed or timed out:', error.message);
        console.log('Operating in Embedded MongoDB document store mode with persistent JSON backup.');
        this.isMongoConnected = false;
      }
    } else {
      console.log('No MONGODB_URI provided. Running with integrated MongoDB document store with full persistence.');
      this.isMongoConnected = false;
    }
    return false;
  }
}

export const dbManager = new DatabaseManager();
