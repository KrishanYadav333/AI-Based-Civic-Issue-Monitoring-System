const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const db = require('../services/database');
const { authMiddleware, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * Generate PDF report for issues
 */
router.post('/export/pdf', authMiddleware, authorize('engineer', 'admin'), async (req, res) => {
  try {
    const { ward_id, status, priority, start_date, end_date, type } = req.body;

    // Build query
    let query = `
      SELECT 
        i.id, i.type, i.status, i.priority, i.description,
        i.latitude, i.longitude, i.created_at, i.resolved_at,
        w.name as ward_name, w.number as ward_number,
        u_creator.name as created_by_name, u_creator.email as created_by_email,
        u_engineer.name as assigned_engineer_name
      FROM issues i
      LEFT JOIN wards w ON i.ward_id = w.id
      LEFT JOIN users u_creator ON i.created_by = u_creator.id
      LEFT JOIN users u_engineer ON i.assigned_engineer_id = u_engineer.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (ward_id) {
      query += ` AND i.ward_id = $${paramCount}`;
      params.push(ward_id);
      paramCount++;
    }

    if (status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (priority) {
      query += ` AND i.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    if (type) {
      query += ` AND i.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (start_date) {
      query += ` AND i.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND i.created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += ' ORDER BY i.created_at DESC LIMIT 1000';

    const result = await db.query(query, params);
    const issues = result.rows;

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=civic-issues-report-${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add header
    doc.fontSize(20).text('Vadodara Municipal Corporation', { align: 'center' });
    doc.fontSize(16).text('Civic Issues Report', { align: 'center' });
    doc.moveDown();

    // Add report metadata
    doc.fontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, { align: 'right' });
    doc.text(`Total Issues: ${issues.length}`, { align: 'right' });
    if (ward_id) {
      const ward = issues[0]?.ward_name || 'Unknown';
      doc.text(`Ward: ${ward}`, { align: 'right' });
    }
    doc.moveDown();

    // Add statistics summary
    const stats = {
      pending: issues.filter(i => i.status === 'pending').length,
      in_progress: issues.filter(i => i.status === 'in_progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      high_priority: issues.filter(i => i.priority === 'high').length,
      medium_priority: issues.filter(i => i.priority === 'medium').length,
      low_priority: issues.filter(i => i.priority === 'low').length
    };

    doc.fontSize(12).text('Summary Statistics', { underline: true });
    doc.fontSize(10);
    doc.text(`Pending: ${stats.pending} | In Progress: ${stats.in_progress} | Resolved: ${stats.resolved}`);
    doc.text(`High Priority: ${stats.high_priority} | Medium: ${stats.medium_priority} | Low: ${stats.low_priority}`);
    doc.moveDown(2);

    // Add issues table
    doc.fontSize(12).text('Issues List', { underline: true });
    doc.moveDown();

    issues.forEach((issue, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      doc.fontSize(10);
      doc.text(`${index + 1}. Issue #${issue.id}`, { bold: true });
      doc.fontSize(9);
      doc.text(`Type: ${issue.type} | Priority: ${issue.priority} | Status: ${issue.status}`);
      doc.text(`Ward: ${issue.ward_name} (Ward ${issue.ward_number})`);
      doc.text(`Location: ${issue.latitude.toFixed(6)}, ${issue.longitude.toFixed(6)}`);
      doc.text(`Created: ${new Date(issue.created_at).toLocaleString('en-IN')}`);
      doc.text(`Reported by: ${issue.created_by_name} (${issue.created_by_email})`);
      
      if (issue.assigned_engineer_name) {
        doc.text(`Assigned to: ${issue.assigned_engineer_name}`);
      }
      
      if (issue.resolved_at) {
        doc.text(`Resolved: ${new Date(issue.resolved_at).toLocaleString('en-IN')}`);
      }
      
      if (issue.description) {
        doc.text(`Description: ${issue.description.substring(0, 100)}...`);
      }
      
      doc.moveDown();
    });

    // Add footer
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8);
      doc.text(
        `Page ${i + 1} of ${pages.count}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }

    // Finalize PDF
    doc.end();

    logger.info('PDF report generated', { issueCount: issues.length, userId: req.user.userId });
  } catch (error) {
    logger.error('Error generating PDF report', { error: error.message });
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

/**
 * Generate Excel report for issues
 */
router.post('/export/excel', authMiddleware, authorize('engineer', 'admin'), async (req, res) => {
  try {
    const { ward_id, status, priority, start_date, end_date, type } = req.body;

    // Build query (same as PDF)
    let query = `
      SELECT 
        i.id, i.type, i.status, i.priority, i.description,
        i.latitude, i.longitude, i.created_at, i.resolved_at,
        w.name as ward_name, w.number as ward_number,
        u_creator.name as created_by_name, u_creator.email as created_by_email,
        u_engineer.name as assigned_engineer_name,
        d.name as department_name
      FROM issues i
      LEFT JOIN wards w ON i.ward_id = w.id
      LEFT JOIN users u_creator ON i.created_by = u_creator.id
      LEFT JOIN users u_engineer ON i.assigned_engineer_id = u_engineer.id
      LEFT JOIN departments d ON i.department_id = d.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (ward_id) {
      query += ` AND i.ward_id = $${paramCount}`;
      params.push(ward_id);
      paramCount++;
    }

    if (status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (priority) {
      query += ` AND i.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    if (type) {
      query += ` AND i.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (start_date) {
      query += ` AND i.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND i.created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    query += ' ORDER BY i.created_at DESC';

    const result = await db.query(query, params);
    const issues = result.rows;

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    
    // Add metadata
    workbook.creator = 'Vadodara Municipal Corporation';
    workbook.created = new Date();

    // Create Issues worksheet
    const worksheet = workbook.addWorksheet('Issues');

    // Define columns
    worksheet.columns = [
      { header: 'Issue ID', key: 'id', width: 10 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Ward Name', key: 'ward_name', width: 20 },
      { header: 'Ward Number', key: 'ward_number', width: 12 },
      { header: 'Department', key: 'department_name', width: 20 },
      { header: 'Latitude', key: 'latitude', width: 12 },
      { header: 'Longitude', key: 'longitude', width: 12 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Created By', key: 'created_by_name', width: 20 },
      { header: 'Creator Email', key: 'created_by_email', width: 25 },
      { header: 'Assigned Engineer', key: 'assigned_engineer_name', width: 20 },
      { header: 'Created At', key: 'created_at', width: 20 },
      { header: 'Resolved At', key: 'resolved_at', width: 20 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    issues.forEach(issue => {
      worksheet.addRow({
        id: issue.id,
        type: issue.type,
        status: issue.status,
        priority: issue.priority,
        ward_name: issue.ward_name,
        ward_number: issue.ward_number,
        department_name: issue.department_name,
        latitude: issue.latitude,
        longitude: issue.longitude,
        description: issue.description,
        created_by_name: issue.created_by_name,
        created_by_email: issue.created_by_email,
        assigned_engineer_name: issue.assigned_engineer_name,
        created_at: new Date(issue.created_at).toLocaleString('en-IN'),
        resolved_at: issue.resolved_at ? new Date(issue.resolved_at).toLocaleString('en-IN') : ''
      });
    });

    // Add conditional formatting for status
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const statusCell = row.getCell('status');
        switch (statusCell.value) {
          case 'resolved':
            statusCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF10B981' }
            };
            break;
          case 'in_progress':
            statusCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF59E0B' }
            };
            break;
          case 'pending':
            statusCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFEF4444' }
            };
            break;
        }

        const priorityCell = row.getCell('priority');
        if (priorityCell.value === 'high') {
          priorityCell.font = { bold: true, color: { argb: 'FFEF4444' } };
        }
      }
    });

    // Create Summary worksheet
    const summarySheet = workbook.addWorksheet('Summary');
    
    const stats = {
      total: issues.length,
      pending: issues.filter(i => i.status === 'pending').length,
      in_progress: issues.filter(i => i.status === 'in_progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      high_priority: issues.filter(i => i.priority === 'high').length,
      medium_priority: issues.filter(i => i.priority === 'medium').length,
      low_priority: issues.filter(i => i.priority === 'low').length
    };

    summarySheet.addRow(['Civic Issues Report Summary']);
    summarySheet.getRow(1).font = { size: 16, bold: true };
    summarySheet.addRow([]);
    summarySheet.addRow(['Generated:', new Date().toLocaleString('en-IN')]);
    summarySheet.addRow(['Total Issues:', stats.total]);
    summarySheet.addRow([]);
    summarySheet.addRow(['Status Breakdown:']);
    summarySheet.addRow(['Pending:', stats.pending]);
    summarySheet.addRow(['In Progress:', stats.in_progress]);
    summarySheet.addRow(['Resolved:', stats.resolved]);
    summarySheet.addRow([]);
    summarySheet.addRow(['Priority Breakdown:']);
    summarySheet.addRow(['High:', stats.high_priority]);
    summarySheet.addRow(['Medium:', stats.medium_priority]);
    summarySheet.addRow(['Low:', stats.low_priority]);

    summarySheet.getColumn(1).width = 20;
    summarySheet.getColumn(2).width = 15;

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=civic-issues-report-${Date.now()}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

    logger.info('Excel report generated', { issueCount: issues.length, userId: req.user.userId });
  } catch (error) {
    logger.error('Error generating Excel report', { error: error.message });
    res.status(500).json({ error: 'Failed to generate Excel report' });
  }
});

/**
 * Generate ward performance report (PDF)
 */
router.get('/export/ward-performance', authMiddleware, authorize('admin'), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM ward_performance_summary
      ORDER BY ward_number
    `);

    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ward-performance-${Date.now()}.pdf`);

    doc.pipe(res);

    doc.fontSize(20).text('Ward Performance Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString('en-IN')}`, { align: 'right' });
    doc.moveDown(2);

    // Table headers
    const startY = doc.y;
    const colWidths = [50, 100, 80, 80, 80, 80, 100, 100];
    let xPos = 50;

    const headers = ['Ward #', 'Ward Name', 'Total', 'Resolved', 'Pending', 'Overdue', 'Avg Resolution', 'Resolution %'];
    
    doc.fontSize(9).fillColor('#000');
    headers.forEach((header, i) => {
      doc.text(header, xPos, startY, { width: colWidths[i], align: 'center' });
      xPos += colWidths[i];
    });

    doc.moveDown();
    let yPos = doc.y;

    result.rows.forEach(ward => {
      if (yPos > 500) {
        doc.addPage();
        yPos = 50;
      }

      xPos = 50;
      const values = [
        ward.ward_number,
        ward.ward_name,
        ward.total_issues,
        ward.resolved_issues,
        ward.pending_issues,
        ward.overdue_issues,
        `${ward.avg_resolution_hours || 0} hrs`,
        `${ward.resolution_rate || 0}%`
      ];

      doc.fontSize(8);
      values.forEach((value, i) => {
        doc.text(value.toString(), xPos, yPos, { width: colWidths[i], align: 'center' });
        xPos += colWidths[i];
      });

      yPos += 20;
    });

    doc.end();

    logger.info('Ward performance report generated', { userId: req.user.userId });
  } catch (error) {
    logger.error('Error generating ward performance report', { error: error.message });
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
