"""
PDF Report Generation Service.
Utilizes ReportLab to build highly professional, print-ready PDF reports compiling
video analysis logs, distress analytics, GIS coordinates, maintenance actions, and inline screenshots.
"""

import os
import logging
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from sqlalchemy.orm import Session

from app.models.video import UploadedVideo
from app.models.distress import RoadDistress
from app.models.maintenance import MaintenanceTask

logger = logging.getLogger(__name__)


def generate_video_pdf_report(db: Session, video_id: int) -> str:
    """
    Compiles a comprehensive PDF report for a processed video session.
    
    Args:
        db (Session): Database session.
        video_id (int): ID of the processed video.
        
    Returns:
        str: Relative path of the generated PDF file.
    """
    # 1. Fetch data from DB
    video = db.query(UploadedVideo).filter(UploadedVideo.id == video_id).first()
    if not video:
        raise ValueError(f"Video with ID {video_id} not found.")

    distresses = db.query(RoadDistress).filter(RoadDistress.video_id == video_id).all()
    
    # Resolve directories
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    generated_dir = os.path.join(base_dir, "reports", "generated")
    os.makedirs(generated_dir, exist_ok=True)
    
    # 2. Build report naming & filepath
    timestamp_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    report_filename = f"report_video_{video_id}_{timestamp_str}.pdf"
    full_pdf_path = os.path.join(generated_dir, report_filename)
    relative_pdf_path = os.path.relpath(full_pdf_path, base_dir).replace("\\", "/")
    
    # 3. Setup document
    # Margins: 0.5 inch (36 points) for maximum space usage
    doc = SimpleDocTemplate(
        full_pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    story = []
    
    # 4. Setup Styles
    styles = getSampleStyleSheet()
    
    # Custom color palette
    primary_color = colors.HexColor("#1e3a8a")     # Navy Blue
    secondary_color = colors.HexColor("#4f46e5")   # Indigo
    text_color = colors.HexColor("#1e293b")        # Slate Dark
    light_bg = colors.HexColor("#f8fafc")          # Light gray
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=text_color,
        spaceAfter=8
    )

    bold_body_style = ParagraphStyle(
        'BoldBodyTextCustom',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=text_color
    )
    
    table_cell_header = ParagraphStyle(
        'TableCellHeader',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=colors.white
    )
    
    # 5. Header Section
    story.append(Paragraph("Road Distress Management System", subtitle_style))
    story.append(Paragraph("Video Analysis & Rehabilitation Report", title_style))
    
    # Meta Details Layout (using Table for clean grid alignment)
    meta_data = [
        [
            Paragraph("<b>Project:</b> Infrastructure Safety Audit", body_style),
            Paragraph(f"<b>Generated Date:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", body_style)
        ],
        [
            Paragraph(f"<b>Video File:</b> {video.filename}", body_style),
            Paragraph(f"<b>Video ID:</b> {video_id}", body_style)
        ],
        [
            Paragraph(f"<b>Processing Status:</b> {video.processing_status.capitalize()}", body_style),
            Paragraph(f"<b>Total Distresses Logged:</b> {len(distresses)} anomalies", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[260, 260])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, -1), (-1, -1), 1.5, primary_color),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))
    
    # 6. Executive Summary Section
    story.append(Paragraph("Executive Summary", h1_style))
    
    # Gather statistics
    severities = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    categories = {}
    total_rehab_cost = 0
    
    for d in distresses:
        sev = d.severity.lower()
        if sev in severities:
            severities[sev] += 1
            
        dtype = d.distress_type.capitalize()
        categories[dtype] = categories.get(dtype, 0) + 1
        
        # Query repair task
        task = db.query(MaintenanceTask).filter(MaintenanceTask.distress_id == d.id).first()
        if task and task.estimated_cost:
            total_rehab_cost += task.estimated_cost

    summary_text = (
        f"A total of <b>{len(distresses)} road distress anomalies</b> were identified during the automated processing of "
        f"surveillance feed <i>{video.filename}</i>. Based on the model classification results, "
        f"{severities['critical']} distresses require immediate <b>Critical/Emergency (P1)</b> response, "
        f"{severities['high']} are classified as <b>High (P2)</b> severity, and {severities['medium'] + severities['low']} "
        f"fall under routine maintenance parameters."
    )
    story.append(Paragraph(summary_text, body_style))
    
    # Stats Summary Table Cards
    stats_card_data = [
        [
            Paragraph("<b>Total Distress count</b>", body_style),
            Paragraph("<b>Critical Items</b>", body_style),
            Paragraph("<b>Estimated Rehab Cost</b>", body_style)
        ],
        [
            Paragraph(f"<font size=14 color='#1e3a8a'><b>{len(distresses)}</b></font>", body_style),
            Paragraph(f"<font size=14 color='#ef4444'><b>{severities['critical']}</b></font>", body_style),
            Paragraph(f"<font size=14 color='#22c55e'><b>₹{total_rehab_cost:,}</b></font>", body_style)
        ]
    ]
    stats_table = Table(stats_card_data, colWidths=[173, 173, 174])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 15))
    
    # 7. Distribution Breakdown Grid
    story.append(Paragraph("Severity & Distress Distributions", h1_style))
    sev_text = f"<b>Critical:</b> {severities['critical']} | <b>High:</b> {severities['high']} | <b>Medium:</b> {severities['medium']} | <b>Low:</b> {severities['low']}"
    cat_text = " | ".join([f"<b>{k}:</b> {v}" for k, v in categories.items()])
    story.append(Paragraph(f"<b>Severity Tally:</b> {sev_text}", body_style))
    story.append(Paragraph(f"<b>Categories Identified:</b> {cat_text}", body_style))
    story.append(Spacer(1, 10))

    # 8. Detailed Detections Table
    story.append(Paragraph("Detailed Distress & Maintenance Log", h1_style))
    
    # Headers matching the requested: type, severity, confidence, location, maintenance actions, priority rankings
    table_headers = [
        Paragraph("<b>Type / Severity</b>", table_cell_header),
        Paragraph("<b>GIS Coordinates</b>", table_cell_header),
        Paragraph("<b>Confidence</b>", table_cell_header),
        Paragraph("<b>Action Recommendation</b>", table_cell_header),
        Paragraph("<b>Priority</b>", table_cell_header)
    ]
    
    logs_data = [table_headers]
    
    for d in distresses:
        # Fetch related task recommendations
        task = db.query(MaintenanceTask).filter(MaintenanceTask.distress_id == d.id).first()
        rec_action = task.recommendation if task else "Inspect and formulate patching schedule."
        rec_priority = task.priority if task else "P4"
        
        # Color coding priority rankings
        priority_color = "#ef4444" if rec_priority == "P1" else ("#f97316" if rec_priority == "P2" else ("#eab308" if rec_priority == "P3" else "#3b82f6"))
        
        row = [
            Paragraph(f"<b>{d.distress_type.capitalize()}</b><br/><font size=7 color='#64748b'>{d.severity.upper()}</font>", table_cell_style),
            Paragraph(f"Lat: {d.latitude:.5f}<br/>Lon: {d.longitude:.5f}", table_cell_style),
            Paragraph(f"{d.confidence_score * 100:.1f}%", table_cell_style),
            Paragraph(f"{rec_action}", table_cell_style),
            Paragraph(f"<font color='{priority_color}'><b>{rec_priority}</b></font>", table_cell_style)
        ]
        logs_data.append(row)
        
    if len(distresses) == 0:
        logs_data.append([
            Paragraph("No distresses detected.", table_cell_style),
            "", "", "", ""
        ])

    # Table layout width sums to 520 (total printable width in letter size with 36pt margins is 612 - 72 = 540)
    log_table = Table(logs_data, colWidths=[100, 100, 60, 210, 50])
    log_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, light_bg]),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(log_table)
    
    # 9. Detection Images Showcase
    # Embed images in page breaks if there are images available
    annotated_frames = [d.detection_image_path for d in distresses if d.detection_image_path]
    unique_frames = list(set(annotated_frames))  # Avoid embedding the exact same frame multiple times
    
    if unique_frames:
        story.append(PageBreak())
        story.append(Paragraph("Annotated AI Detection Showcase", h1_style))
        story.append(Paragraph("The following inline frames show visual bounding boxes drawn by the YOLO detection pipeline during analysis:", body_style))
        story.append(Spacer(1, 10))
        
        for idx, rel_img_path in enumerate(unique_frames):
            full_img_path = os.path.join(base_dir, rel_img_path)
            
            if os.path.exists(full_img_path):
                # Title caption
                story.append(Paragraph(f"<b>Figure {idx + 1}: Detection frame from analysis sector</b>", bold_body_style))
                story.append(Paragraph(f"Source file path: <font size=7 color='#64748b'>{rel_img_path}</font>", body_style))
                story.append(Spacer(1, 4))
                
                try:
                    # Renders inline image scaled nicely to fit document printable width
                    img_flow = Image(full_img_path, width=420, height=236)
                    story.append(img_flow)
                    story.append(Spacer(1, 15))
                except Exception as img_err:
                    story.append(Paragraph(f"<font color='red'>Failed to embed image block: {img_err}</font>", body_style))
            else:
                story.append(Paragraph(f"<font color='red'>Annotated image file not found on server disk: {rel_img_path}</font>", body_style))
                
    # Build PDF
    doc.build(story)
    logger.info(f"Generated professional PDF report saved at: {full_pdf_path}")
    return relative_pdf_path
