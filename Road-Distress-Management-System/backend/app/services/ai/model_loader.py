"""
Model loader service responsible for managing weights loading and YOLO instance singleton.
Falls back to a simulated Ultralytics interface on missing files or dependencies.
"""

import os
import logging
import random
from typing import Any, List

logger = logging.getLogger(__name__)

# Try to import Ultralytics YOLO to support production weights loading
try:
    from ultralytics import YOLO
    ULTRALYTICS_AVAILABLE = True
except ImportError:
    ULTRALYTICS_AVAILABLE = False
    YOLO = None


class MockBoxItem:
    """
    Simulates a single detection box item returned by YOLO.
    """
    def __init__(self, xyxy: List[float], conf: float, cls: int):
        self._xyxy = xyxy
        self._conf = conf
        self._cls = cls

    @property
    def xyxy(self) -> Any:
        # Mimics a tensor list structure supporting .tolist()
        class XYXYList(list):
            def tolist(self):
                return self
        return XYXYList([self._xyxy])

    @property
    def conf(self) -> Any:
        # Mimics a tensor scalar item structure supporting .item()
        class ConfItem(float):
            def item(self):
                return float(self)
            def __getitem__(self, idx):
                return self
        return ConfItem(self._conf)

    @property
    def cls(self) -> Any:
        # Mimics a tensor scalar item structure supporting .item()
        class ClsItem(float):
            def item(self):
                return float(self)
            def __getitem__(self, idx):
                return self
        return ClsItem(self._cls)


class MockBoxes:
    """
    Simulates a list of boxes matching the .boxes property of a YOLO result.
    """
    def __init__(self, items: List[MockBoxItem]):
        self.items = items

    def __len__(self) -> int:
        return len(self.items)

    def __iter__(self):
        return iter(self.items)

    def __getitem__(self, idx: int) -> MockBoxItem:
        return self.items[idx]

    @property
    def xyxy(self) -> Any:
        class XYXYOuterList(list):
            def tolist(self):
                return self
        return XYXYOuterList([item._xyxy for item in self.items])

    @property
    def conf(self) -> List[float]:
        return [item._conf for item in self.items]

    @property
    def cls(self) -> List[int]:
        return [item._cls for item in self.items]


class MockResult:
    """
    Simulates a YOLO inference output result object.
    """
    def __init__(self, boxes: MockBoxes):
        self.boxes = boxes


class MockYOLO:
    """
    Mimics the YOLO model executor in the absence of weights or dependencies.
    """
    def __init__(self, model_path: str):
        self.model_path = model_path
        logger.info(f"MockYOLO initialized mimicking path: {model_path}")

    def __call__(self, frame: Any, **kwargs) -> List[MockResult]:
        """
        Executes mock inference. Returns a list containing a single MockResult
        holding between 0 and 3 randomized bounding boxes.
        """
        # Read frame height/width to scale coordinate values (defaulting to 1280x720)
        h, w = 720, 1280
        if hasattr(frame, "shape"):
            h, w = frame.shape[:2]

        num_detections = random.randint(0, 3)
        box_items = []

        for _ in range(num_detections):
            # Generate random bounding boxes that fall within the image boundary
            x1 = random.uniform(50.0, w * 0.6)
            y1 = random.uniform(50.0, h * 0.6)
            x2 = min(x1 + random.uniform(40.0, 250.0), float(w - 10.0))
            y2 = min(y1 + random.uniform(40.0, 200.0), float(h - 10.0))
            conf = random.uniform(0.45, 0.98)
            # Support class indexes matching potholes, cracks, rutting, raveling
            cls_id = random.choice([0, 1, 2, 3])

            box_items.append(MockBoxItem(xyxy=[x1, y1, x2, y2], conf=conf, cls=cls_id))

        return [MockResult(MockBoxes(box_items))]


class ModelLoader:
    """
    Singleton class managing lazy loading of the AI model.
    """
    _instance = None
    _model = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance

    def load_model(self, model_path: str = "backend/models/best.pt") -> Any:
        """
        Lazy loads the YOLO model from best.pt.
        If best.pt does not exist, fallback to MockYOLO instance.
        """
        if self._model is not None:
            return self._model

        # Build absolute path to weights file from project backend root
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        full_model_path = os.path.join(base_dir, "models", "best.pt")

        if os.path.exists(full_model_path) and ULTRALYTICS_AVAILABLE:
            try:
                logger.info(f"Loading real YOLO model from {full_model_path}...")
                self._model = YOLO(full_model_path)
            except Exception as e:
                logger.warning(f"Error loading real YOLO model. Falling back to MockYOLO: {e}")
                self._model = MockYOLO(full_model_path)
        else:
            if not ULTRALYTICS_AVAILABLE:
                logger.warning("Ultralytics package not available. Creating MockYOLO model.")
            else:
                logger.warning(f"YOLO model file not found at {full_model_path}. Creating MockYOLO model.")
            self._model = MockYOLO(full_model_path)

        return self._model
