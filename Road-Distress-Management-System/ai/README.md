# AI Module

This folder contains the AI and computer vision work for road distress detection.

## Purpose

The AI module processes dashcam video or images, detects road distresses such as cracks, potholes, rutting, ravelling, and road signages, and prepares detection results for the backend.

## Folder Guide

```text
datasets/       Dataset notes, labels, and lightweight sample references
scripts/        Training, inference, preprocessing, and evaluation scripts
models/         Model configuration files and lightweight references
notebooks/      Experiments and research notebooks
```

## Suggested Responsibilities

The AI member should focus on:

- YOLOv11 training and evaluation
- OpenCV video frame processing
- Detection confidence and severity logic
- Exporting GPS-tagged detection output for backend integration
- Keeping large datasets and model weights outside Git

