require('dotenv').config();
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const { parse } = require('csv-parse/sync');
const Question = require('../src/models/Question');

const GITHUB_API = 'https://api.github.com/repos/hardeepmty/Company-Wise-DSA/contents';

const HEADERS = {
  'User-Agent': 'DSA-Tracker-Seed',
  Authorization: process.env.GITHUB_TOKEN
    ? `token ${process.env.GITHUB_TOKEN}`
    : undefined
};

const DIFFICULTY_MAP = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard'
};

// ===== DB =====
async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
}

// ===== FETCH COMPANIES =====
async function fetchGitHubCompanies() {
  try {
    const res = await fetch(GITHUB_API, { headers: HEADERS });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const contents = await res.json();

    return contents
      .filter(item => item.type === 'dir')
      .map(item => item.name);

  } catch (err) {
    console.warn('⚠️ GitHub fetch failed:', err.message);
    return [];
  }
}

// ===== FETCH CSV =====
async function fetchCompanyCSV(company) {
  try {
    const url = `${GITHUB_API}/${encodeURIComponent(company)}`;

    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;

    const files = await res.json();

    const allFile = files.find(f =>
      f.name.toLowerCase().includes('all') &&
      f.name.endsWith('.csv')
    );

    if (!allFile) return null;

    const raw = await fetch(allFile.download_url, { headers: HEADERS });
    if (!raw.ok) return null;

    return await raw.text();

  } catch {
    return null;
  }
}

// ===== FETCH README =====
async function fetchCompanyMarkdown(company) {
  try {
    const url = `https://raw.githubusercontent.com/hardeepmty/Company-Wise-DSA/main/${encodeURIComponent(company)}/README.md`;

    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;

    return await res.text();
  } catch {
    return null;
  }
}

// ===== PARSE CSV =====
function parseCSV(csvText, company) {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const questions = [];

  for (const record of records) {
    const keys = Object.keys(record);

    const title = record[keys.find(k => k.toLowerCase().includes('title')) || keys[0]];
    if (!title) continue;

    let link = record[keys.find(k => k.toLowerCase().includes('link'))];
    if (!link) {
      const slug = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
      link = `https://leetcode.com/problems/${slug}/`;
    }

    const rawDiff = record[keys.find(k => k.toLowerCase().includes('diff'))] || '';
    const difficulty = DIFFICULTY_MAP[rawDiff.toLowerCase()] || 'Unknown';

    questions.push({
      title: title.trim(),
      link: link.trim(),
      difficulty,
      frequency: 0,
      company
    });
  }

  return questions;
}

// ===== PARSE MARKDOWN =====
function parseMarkdown(md, company) {
  const lines = md.split('\n');
  const questions = [];

  for (let line of lines) {
    if (line.includes('leetcode.com/problems')) {
      const match = line.match(/\[(.*?)\]\((.*?)\)/);
      if (!match) continue;

      let difficulty = 'Unknown';
      if (/easy/i.test(line)) difficulty = 'Easy';
      else if (/medium/i.test(line)) difficulty = 'Medium';
      else if (/hard/i.test(line)) difficulty = 'Hard';

      questions.push({
        title: match[1].trim(),
        link: match[2].trim(),
        difficulty,
        frequency: 0,
        company
      });
    }
  }

  return questions;
}

// ===== MAIN =====
async function seed() {
  await connectDB();

  console.log('🗑️ Clearing existing questions...');
  await Question.deleteMany({});

  const questionMap = new Map();

  console.log('📡 Fetching companies from GitHub...');
  const companies = await fetchGitHubCompanies();

  console.log(`📋 Found ${companies.length} companies`);

  let processed = 0;

  for (const company of companies) {
    let questions = [];

    const csvText = await fetchCompanyCSV(company);

    if (csvText) {
      questions = parseCSV(csvText, company);
    } else {
      const md = await fetchCompanyMarkdown(company);
      if (md) {
        questions = parseMarkdown(md, company);
      }
    }

    for (const q of questions) {
      const key = q.title.toLowerCase();

      if (questionMap.has(key)) {
        const existing = questionMap.get(key);

        if (!existing.companies.includes(company)) {
          existing.companies.push(company);
        }

      } else {
        questionMap.set(key, {
          title: q.title,
          titleSlug: q.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'),
          link: q.link,
          difficulty: q.difficulty,
          companies: [company],
          frequency: q.frequency
        });
      }
    }

    processed++;
    if (processed % 20 === 0) {
      console.log(`⚙️ Processed ${processed}/${companies.length}`);
    }

    // avoid rate limit
    await new Promise(r => setTimeout(r, 120));
  }

  // ===== FALLBACK ONLY IF EMPTY =====
  if (questionMap.size === 0) {
    console.log('⚠️ GitHub failed — using fallback dataset');

    const fallback = [
      { title: 'Two Sum', link: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy', companies: ['Google'] }
    ];

    fallback.forEach(q => {
      questionMap.set(q.title.toLowerCase(), {
        ...q,
        titleSlug: q.title.toLowerCase().replace(/\s+/g, '-'),
        frequency: 0
      });
    });
  }

  const questions = Array.from(questionMap.values());

  console.log(`💾 Inserting ${questions.length} questions...`);

  await Question.insertMany(questions, { ordered: false });

  console.log('✅ Done!');
  console.log(`📊 Questions: ${questions.length}`);

  const companyCount = await Question.aggregate([
    { $unwind: '$companies' },
    { $group: { _id: '$companies' } },
    { $count: 'total' }
  ]);

  console.log(`🏢 Companies: ${companyCount[0]?.total || 0}`);

  process.exit();
}

// RUN
seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});