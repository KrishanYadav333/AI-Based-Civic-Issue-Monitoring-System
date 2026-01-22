const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const logger = require('./utils/logger');
const { sendNotification } = require('./routes/notifications');

let wss;
const userConnections = new Map(); // userId -> Set of WebSocket connections

function initializeWebSocket(server) {
  wss = new WebSocket.Server({ 
    server,
    path: '/ws'
  });

  wss.on('connection', async (ws, req) => {
    try {
      // Extract token from query string
      const url = new URL(req.url, 'http://localhost');
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.userId;
      ws.userRole = decoded.role;
      ws.isAlive = true;

      // Store connection
      if (!userConnections.has(ws.userId)) {
        userConnections.set(ws.userId, new Set());
      }
      userConnections.get(ws.userId).add(ws);

      logger.info('WebSocket connection established', { userId: ws.userId });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connected successfully',
        userId: ws.userId
      }));

      // Handle incoming messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          handleMessage(ws, data);
        } catch (error) {
          logger.error('Error handling WebSocket message', { error: error.message });
        }
      });

      // Handle pong responses for heartbeat
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle disconnection
      ws.on('close', () => {
        const connections = userConnections.get(ws.userId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            userConnections.delete(ws.userId);
          }
        }
        logger.info('WebSocket connection closed', { userId: ws.userId });
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket error', { userId: ws.userId, error: error.message });
      });

    } catch (error) {
      logger.error('WebSocket authentication failed', { error: error.message });
      ws.close(1008, 'Authentication failed');
    }
  });

  // Heartbeat to detect broken connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000); // 30 seconds

  wss.on('close', () => {
    clearInterval(interval);
  });

  logger.info('WebSocket server initialized');
}

function handleMessage(ws, data) {
  const { type, payload } = data;

  switch (type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;

    case 'subscribe':
      // Subscribe to specific channels (e.g., ward updates)
      ws.subscribedChannels = payload.channels || [];
      break;

    case 'location_update':
      // Handle live location updates from surveyors
      if (ws.userRole === 'surveyor') {
        broadcastToRole('admin', {
          type: 'surveyor_location',
          userId: ws.userId,
          location: payload.location,
          timestamp: new Date()
        });
      }
      break;

    default:
      logger.warn('Unknown WebSocket message type', { type });
  }
}

// Broadcast to specific user
function broadcastToUser(userId, message) {
  const connections = userConnections.get(userId);
  if (connections) {
    const payload = JSON.stringify(message);
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }
}

// Broadcast to all users with specific role
function broadcastToRole(role, message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN && ws.userRole === role) {
      ws.send(payload);
    }
  });
}

// Broadcast to all connected users
function broadcastToAll(message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

// Broadcast to users in specific ward
function broadcastToWard(wardId, message) {
  const payload = JSON.stringify(message);
  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN && ws.wardId === wardId) {
      ws.send(payload);
    }
  });
}

// Notify about new issue
function notifyNewIssue(issue) {
  // Notify assigned engineer
  if (issue.assigned_engineer_id) {
    broadcastToUser(issue.assigned_engineer_id, {
      type: 'issue_assigned',
      issue: issue,
      timestamp: new Date()
    });
  }

  // Notify admins
  broadcastToRole('admin', {
    type: 'issue_created',
    issue: issue,
    timestamp: new Date()
  });
}

// Notify about issue resolution
function notifyIssueResolved(issue) {
  // Notify creator
  if (issue.created_by) {
    broadcastToUser(issue.created_by, {
      type: 'issue_resolved',
      issue: issue,
      timestamp: new Date()
    });
  }

  // Notify admins
  broadcastToRole('admin', {
    type: 'issue_resolved',
    issue: issue,
    timestamp: new Date()
  });
}

// Notify about SLA breach
function notifySLABreach(issue) {
  broadcastToRole('admin', {
    type: 'sla_breach',
    issue: issue,
    timestamp: new Date()
  });
}

// Get connection stats
function getStats() {
  return {
    totalConnections: wss ? wss.clients.size : 0,
    uniqueUsers: userConnections.size,
    connectionsByRole: {
      surveyor: Array.from(wss?.clients || []).filter(ws => ws.userRole === 'surveyor').length,
      engineer: Array.from(wss?.clients || []).filter(ws => ws.userRole === 'engineer').length,
      admin: Array.from(wss?.clients || []).filter(ws => ws.userRole === 'admin').length
    }
  };
}

module.exports = {
  initializeWebSocket,
  broadcastToUser,
  broadcastToRole,
  broadcastToAll,
  broadcastToWard,
  notifyNewIssue,
  notifyIssueResolved,
  notifySLABreach,
  getStats
};
