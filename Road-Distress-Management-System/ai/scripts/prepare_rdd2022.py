"""
ai/scripts/prepare_rdd2022.py

Filters RDD2022 to relevant countries/classes, converts Pascal VOC XML
annotations to YOLO txt format, splits into train/val.

CONFIRMED real folder structure on Drive:
  rdd2022/RDD2022/<Country>/train/images/*.jpg
  rdd2022/RDD2022/<Country>/train/annotations/xmls/*.xml

Run in Google Colab — see ai/notebooks/02_prepare_rdd2022.ipynb
"""

import os
import random
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

CLASS_MAP = {
    "D00": 0,
    "D10": 1,
    "D20": 2,
    "D40": 3,
}

COUNTRIES_TO_USE = ["India", "Japan", "Czech", "United_States"]
VAL_SPLIT   = 0.2
RANDOM_SEED = 42


def convert_xml_to_yolo(xml_path: str, img_w: int, img_h: int) -> list[str]:
    tree = ET.parse(xml_path)
    root = tree.getroot()
    lines = []
    for obj in root.findall("object"):
        name = obj.find("name").text
        if name not in CLASS_MAP:
            continue
        cls  = CLASS_MAP[name]
        bbox = obj.find("bndbox")
        xmin = float(bbox.find("xmin").text)
        ymin = float(bbox.find("ymin").text)
        xmax = float(bbox.find("xmax").text)
        ymax = float(bbox.find("ymax").text)
        cx = ((xmin + xmax) / 2) / img_w
        cy = ((ymin + ymax) / 2) / img_h
        w  = (xmax - xmin) / img_w
        h  = (ymax - ymin) / img_h
        lines.append(f"{cls} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")
    return lines


def main():
    DRIVE_BASE = "/content/drive/MyDrive/ELC/pavement-shm-data"
    RDD_DIR    = f"{DRIVE_BASE}/rdd2022/RDD2022"
    OUTPUT_DIR = f"{DRIVE_BASE}/annotated"

    for split in ["train", "val"]:
        os.makedirs(f"{OUTPUT_DIR}/{split}/images", exist_ok=True)
        os.makedirs(f"{OUTPUT_DIR}/{split}/labels", exist_ok=True)

    all_pairs = []
    for country in COUNTRIES_TO_USE:
        img_dir = os.path.join(RDD_DIR, country, "train", "images")
        ann_dir = os.path.join(RDD_DIR, country, "train", "annotations", "xmls")
        if not os.path.exists(img_dir) or not os.path.exists(ann_dir):
            print(f"Skipping {country} — folder not found")
            continue
        for img_file in os.listdir(img_dir):
            if not img_file.endswith(".jpg"):
                continue
            xml_path = os.path.join(ann_dir, img_file.replace(".jpg", ".xml"))
            if os.path.exists(xml_path):
                all_pairs.append((os.path.join(img_dir, img_file), xml_path))
        print(f"{country}: collected pairs")

    random.seed(RANDOM_SEED)
    random.shuffle(all_pairs)
    split_idx = int(len(all_pairs) * (1 - VAL_SPLIT))
    splits = {"train": all_pairs[:split_idx], "val": all_pairs[split_idx:]}

    for split_name, pairs in splits.items():
        saved = skipped = 0
        for img_path, xml_path in pairs:
            img_name = Path(img_path).name
            tree = ET.parse(xml_path)
            size = tree.getroot().find("size")
            img_w, img_h = int(size.find("width").text), int(size.find("height").text)
            lines = convert_xml_to_yolo(xml_path, img_w, img_h)
            if not lines:
                skipped += 1
                continue
            shutil.copy(img_path, f"{OUTPUT_DIR}/{split_name}/images/{img_name}")
            label_name = img_name.replace(".jpg", ".txt")
            with open(f"{OUTPUT_DIR}/{split_name}/labels/{label_name}", "w") as f:
                f.write("\n".join(lines))
            saved += 1
        print(f"{split_name}: saved {saved}, skipped {skipped}")

    yaml_content = f"""path: {OUTPUT_DIR}
train: train/images
val:   val/images

nc: {len(CLASS_MAP)}
names:
  0: longitudinal_crack
  1: transverse_crack
  2: alligator_crack
  3: pothole
"""
    with open(f"{DRIVE_BASE}/pavement.yaml", "w") as f:
        f.write(yaml_content)

    print("Done. Dataset ready for YOLO training.")


if __name__ == "__main__":
    main()
