/**
 * Cluster Service
 * Groups nearby issues into "Work Batches" for efficiency
 */

const db = require('./database');
const logger = require('../utils/logger');

/**
 * Find Clusters
 * Identifies groups of pending issues within radius
 * @param {number} radiusMeters - Grouping distance
 */
async function findWorkClusters(radiusMeters = 200) {
    try {
        // Use PostGIS ST_ClusterDBSCAN
        // eps := distance (convert meters to degrees approx or use geography)
        // minpoints := 2

        // Note: For accurate meters with DBSCAN on simple geometry, we project or use approximate degree conversion.
        // 1 degree lat ~= 111km. 200m ~= 0.0018 degrees.

        const query = `
            SELECT 
                ST_ClusterDBSCAN(location, eps := 0.0018, minpoints := 2) OVER () AS cid,
                id, issue_type_code, priority, latitude, longitude
            FROM issues
            WHERE status = 'pending' OR status = 'assigned'
        `;

        const result = await db.query(query);

        // Process results into groups
        const clusters = {};

        result.rows.forEach(row => {
            if (row.cid !== null) {
                if (!clusters[row.cid]) {
                    clusters[row.cid] = {
                        id: row.cid,
                        issues: [],
                        centroid: { lat: 0, lng: 0 },
                        type_mix: {}
                    };
                }
                clusters[row.cid].issues.push(row);

                // Count types
                clusters[row.cid].type_mix[row.issue_type_code] = (clusters[row.cid].type_mix[row.issue_type_code] || 0) + 1;
            }
        });

        // Calculate centroids
        Object.values(clusters).forEach(cluster => {
            let latSum = 0, lngSum = 0;
            cluster.issues.forEach(i => {
                latSum += parseFloat(i.latitude);
                lngSum += parseFloat(i.longitude);
            });
            cluster.centroid = {
                lat: latSum / cluster.issues.length,
                lng: lngSum / cluster.issues.length
            };
        });

        return Object.values(clusters);

    } catch (error) {
        logger.error('Error finding clusters:', error);
        return [];
    }
}

module.exports = {
    findWorkClusters
};
