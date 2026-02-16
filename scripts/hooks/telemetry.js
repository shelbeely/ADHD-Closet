#!/usr/bin/env node
/**
 * Telemetry System
 * 
 * Lightweight session tracking and metrics collection
 * Stores data in .github/telemetry/ (gitignored)
 */

const fs = require('fs');
const path = require('path');

const TELEMETRY_DIR = path.join(__dirname, '../../.github/telemetry');
const SESSIONS_DIR = path.join(TELEMETRY_DIR, 'sessions');
const METRICS_FILE = path.join(TELEMETRY_DIR, 'metrics.jsonl');

/**
 * Ensure telemetry directories exist
 */
function ensureTelemetryDirs() {
  if (!fs.existsSync(TELEMETRY_DIR)) {
    fs.mkdirSync(TELEMETRY_DIR, { recursive: true });
  }
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

/**
 * Get current session ID
 * Uses GitHub Actions run ID if available, otherwise generates one
 */
function getSessionId() {
  return process.env.GITHUB_RUN_ID || `local-${Date.now()}`;
}

/**
 * Get session file path
 */
function getSessionFile(sessionId) {
  return path.join(SESSIONS_DIR, `${sessionId}.json`);
}

/**
 * Initialize session
 */
function initSession(sessionId, data = {}) {
  ensureTelemetryDirs();
  
  const sessionFile = getSessionFile(sessionId);
  const session = {
    sessionId,
    startTime: Date.now(),
    startTimestamp: new Date().toISOString(),
    ...data,
    events: [],
  };
  
  fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
  return session;
}

/**
 * Load session
 */
function loadSession(sessionId) {
  const sessionFile = getSessionFile(sessionId);
  if (!fs.existsSync(sessionFile)) {
    return null;
  }
  
  try {
    return JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
  } catch (error) {
    console.error('[Telemetry] Failed to load session:', error.message);
    return null;
  }
}

/**
 * Add event to session
 */
function addEvent(sessionId, event) {
  let session = loadSession(sessionId);
  if (!session) {
    session = initSession(sessionId);
  }
  
  session.events.push({
    timestamp: Date.now(),
    time: new Date().toISOString(),
    ...event,
  });
  
  const sessionFile = getSessionFile(sessionId);
  fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
  
  return session;
}

/**
 * Update session data
 */
function updateSession(sessionId, data) {
  let session = loadSession(sessionId);
  if (!session) {
    session = initSession(sessionId);
  }
  
  Object.assign(session, data);
  
  const sessionFile = getSessionFile(sessionId);
  fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
  
  return session;
}

/**
 * End session
 */
function endSession(sessionId, data = {}) {
  let session = loadSession(sessionId);
  if (!session) {
    console.warn('[Telemetry] Session not found, creating placeholder');
    session = initSession(sessionId);
  }
  
  session.endTime = Date.now();
  session.endTimestamp = new Date().toISOString();
  session.duration = session.endTime - session.startTime;
  Object.assign(session, data);
  
  const sessionFile = getSessionFile(sessionId);
  fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
  
  // Append to metrics
  appendMetric({
    type: 'session',
    sessionId,
    duration: session.duration,
    eventCount: session.events?.length || 0,
    ...data,
  });
  
  return session;
}

/**
 * Append metric to metrics log
 */
function appendMetric(metric) {
  ensureTelemetryDirs();
  
  const line = JSON.stringify({
    timestamp: Date.now(),
    time: new Date().toISOString(),
    ...metric,
  });
  
  fs.appendFileSync(METRICS_FILE, line + '\n');
}

/**
 * Get session summary
 */
function getSessionSummary(sessionId) {
  const session = loadSession(sessionId);
  if (!session) {
    return null;
  }
  
  const events = session.events || [];
  const eventTypes = {};
  events.forEach(e => {
    eventTypes[e.type] = (eventTypes[e.type] || 0) + 1;
  });
  
  return {
    sessionId: session.sessionId,
    startTime: session.startTimestamp,
    endTime: session.endTimestamp,
    duration: session.duration,
    eventCount: events.length,
    eventTypes,
    filesChanged: session.filesChanged || [],
    commandsExecuted: session.commandsExecuted || [],
    errorsOccurred: session.errorsOccurred || [],
  };
}

module.exports = {
  getSessionId,
  initSession,
  loadSession,
  addEvent,
  updateSession,
  endSession,
  appendMetric,
  getSessionSummary,
  TELEMETRY_DIR,
};
