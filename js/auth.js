/**
 * Kanakita - Authentication & User State Management
 * Manages user profile, mastered Kana tracking, streak counter, high score, and badges.
 */

const STORAGE_KEY = 'kanakita_user_profile';
const ACCOUNTS_STORAGE_KEY = 'kanakita_accounts';

const DEFAULT_USER = {
  isLoggedIn: false,
  username: 'Tamu (Guest)',
  email: '',
  avatar: '⛩️',
  masteredKana: [], // Array of character strings, e.g. ['あ', 'い', 'ア']
  quizHistory: [],  // Array of { date, score, total, accuracy, mode }
  highScore: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedBadges: ['first_step']
};

class AuthController {
  constructor() {
    this.accounts = this.loadAccounts();
    this.user = this.loadUser();
    this.checkStreak();
  }

  loadAccounts() {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) || '{}');
    } catch (e) {
      console.error('Error loading account records:', e);
      return {};
    }
  }

  saveAccounts() {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(this.accounts));
    } catch (e) {
      console.error('Error saving account records:', e);
      return false;
    }
    return true;
  }

  async hashPassword(password, salt) {
    if (!window.crypto?.subtle || !window.crypto?.getRandomValues) {
      throw new Error('Browser tidak mendukung penyimpanan kata sandi yang aman.');
    }

    const saltBytes = salt ? Uint8Array.from(atob(salt), char => char.charCodeAt(0)) : window.crypto.getRandomValues(new Uint8Array(16));
    const key = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: 120000, hash: 'SHA-256' }, key, 256);
    const hash = Array.from(new Uint8Array(bits), byte => String.fromCharCode(byte)).join('');
    return {
      salt: salt || btoa(String.fromCharCode(...saltBytes)),
      hash: btoa(hash)
    };
  }

  loadUser() {
    try {
      const dataStr = localStorage.getItem(STORAGE_KEY);
      if (dataStr) {
        return { ...this.createDefaultUser(), ...JSON.parse(dataStr) };
      }
    } catch (e) {
      console.error('Error loading user state:', e);
    }
    return this.createDefaultUser();
  }

  createDefaultUser() {
    return {
      ...DEFAULT_USER,
      masteredKana: [],
      quizHistory: [],
      unlockedBadges: [...DEFAULT_USER.unlockedBadges]
    };
  }

  saveUser() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user));
      if (this.user.isLoggedIn && this.user.email && this.accounts[this.user.email]) {
        this.accounts[this.user.email].profile = { ...this.user };
        this.saveAccounts();
      }
    } catch (e) {
      console.error('Error saving user state:', e);
    }
  }

  updateUsername(username) {
    const trimmedUsername = username.trim();
    if (!this.user.isLoggedIn || !this.user.email) {
      return { success: false, message: 'Masuk ke akun untuk mengubah username.' };
    }
    if (!trimmedUsername) {
      return { success: false, message: 'Username tidak boleh kosong.' };
    }
    if (trimmedUsername.length > 24) {
      return { success: false, message: 'Username maksimal 24 karakter.' };
    }

    this.user.username = trimmedUsername;
    if (this.accounts[this.user.email]) {
      this.accounts[this.user.email].username = trimmedUsername;
    }
    this.saveUser();
    return { success: true, message: 'Username berhasil diperbarui.' };
  }

  async register(username, email, password) {
    if (!username || !email || !password) {
      return { success: false, message: 'Harap isi semua kolom pendaftaran.' };
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (this.accounts[normalizedEmail]) {
      return { success: false, message: 'Email ini sudah terdaftar. Silakan masuk.' };
    }

    try {
      const credentials = await this.hashPassword(password);
      const startingProfile = this.user.isLoggedIn ? this.createDefaultUser() : this.user;
      const profile = {
        ...startingProfile,
        isLoggedIn: true,
        username: username.trim(),
        email: normalizedEmail,
        avatar: '🦊',
        masteredKana: [...startingProfile.masteredKana],
        quizHistory: [...startingProfile.quizHistory],
        unlockedBadges: [...startingProfile.unlockedBadges]
      };
      this.accounts[normalizedEmail] = { username: profile.username, ...credentials, profile };
      if (!this.saveAccounts()) {
        delete this.accounts[normalizedEmail];
        return { success: false, message: 'Akun tidak dapat disimpan di browser ini.' };
      }
      this.user = profile;
      this.saveUser();
    } catch (e) {
      console.error('Error registering account:', e);
      return { success: false, message: e.message || 'Pendaftaran gagal. Silakan coba lagi.' };
    }
    return { success: true, message: 'Pendaftaran berhasil! Selamat datang di Kanakita.' };
  }

  async login(email, password) {
    if (!email || !password) {
      return { success: false, message: 'Harap isi email dan password.' };
    }
    const normalizedEmail = email.trim().toLowerCase();
    const account = this.accounts[normalizedEmail];
    if (!account) {
      return { success: false, message: 'Email atau kata sandi salah.' };
    }

    try {
      const credentials = await this.hashPassword(password, account.salt);
      if (credentials.hash !== account.hash) {
        return { success: false, message: 'Email atau kata sandi salah.' };
      }
      this.saveUser();
      this.user = {
        ...DEFAULT_USER,
        ...account.profile,
        isLoggedIn: true,
        username: account.username,
        email: normalizedEmail
      };
      this.saveUser();
      return { success: true, message: `Selamat datang kembali, ${this.user.username}!` };
    } catch (e) {
      console.error('Error logging in:', e);
      return { success: false, message: e.message || 'Gagal masuk. Silakan coba lagi.' };
    }
  }

  logout() {
    this.saveUser();
    this.user.isLoggedIn = false;
    this.user.username = 'Tamu (Guest)';
    this.user.email = '';
    this.user.avatar = '⛩️';
    this.saveUser();
  }

  checkStreak() {
    const today = new Date().toISOString().split('T')[0];
    if (!this.user.lastActiveDate) {
      this.user.lastActiveDate = today;
      this.user.streakDays = 1;
    } else if (this.user.lastActiveDate !== today) {
      const lastDate = new Date(this.user.lastActiveDate);
      const currDate = new Date(today);
      const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        this.user.streakDays += 1;
        if (this.user.streakDays >= 3) {
          this.unlockBadge('streak_3');
        }
      } else if (diffDays > 1) {
        this.user.streakDays = 1;
      }
      this.user.lastActiveDate = today;
      this.saveUser();
    }
  }

  toggleMasteredKana(char) {
    const index = this.user.masteredKana.indexOf(char);
    if (index > -1) {
      this.user.masteredKana.splice(index, 1);
    } else {
      this.user.masteredKana.push(char);
    }

    // Check Badge unlocks
    if (this.user.masteredKana.length >= 46) {
      this.unlockBadge('hiragana_master');
    }

    this.saveUser();
    return index === -1; // returns true if now mastered
  }

  isKanaMastered(char) {
    return this.user.masteredKana.includes(char);
  }

  recordQuizResult(score, totalQuestions, accuracy, mode) {
    const result = {
      id: Date.now(),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      score,
      total: totalQuestions,
      accuracy,
      mode
    };

    this.user.quizHistory.unshift(result);
    if (this.user.quizHistory.length > 20) {
      this.user.quizHistory.pop();
    }

    if (score > this.user.highScore) {
      this.user.highScore = score;
    }

    if (accuracy === 100) {
      this.unlockBadge('quiz_champion');
    }

    this.saveUser();
  }

  unlockBadge(badgeId) {
    if (!this.user.unlockedBadges.includes(badgeId)) {
      this.user.unlockedBadges.push(badgeId);
      this.saveUser();
      return true;
    }
    return false;
  }
}

const authController = new AuthController();
