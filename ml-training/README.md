# Trash Classifier - Machine Learning Training

Python notebook for training the trash classification model using TensorFlow/Keras.

## Overview

This notebook trains an EfficientNetB0-based image classifier to categorize trash into 5 classes:
- Cardboard
- Glass
- Metal
- Paper
- Plastic

## Tech Stack

- **Language:** Python 3.x
- **Framework:** TensorFlow 2.x / Keras
- **Base Model:** EfficientNetB0 (ImageNet pre-trained)
- **Training Platform:** Kaggle Notebooks
- **GPU:** Tesla P100
- **Libraries:**
  - NumPy (numerical operations)
  - Matplotlib (visualizations)
  - scikit-learn (metrics)
  - Pillow (image processing)

## Dataset

- **Source:** Custom trash dataset from Kaggle
- **Total Images:** ~2,500
- **Classes:** 5 (balanced distribution)
- **Split:**
  - Training: 70%
  - Validation: 15%
  - Test: 15%
- **Image Size:** 224x224 pixels (RGB)

## Model Architecture

### Base Model
- **EfficientNetB0** (transfer learning from ImageNet)
- Pre-trained weights frozen initially
- Fine-tuned in stage 2

### Custom Head
```
EfficientNetB0 (frozen/unfrozen)
    ↓
GlobalAveragePooling2D
    ↓
Dropout(0.35)
    ↓
Dense(192, activation='swish', L2=1e-5)
    ↓
Dense(5, activation='softmax')
```

## Training Strategy

### Two-Stage Training

**Stage 1: Head Training (8 epochs)**
- Freeze EfficientNetB0 backbone
- Train only custom head layers
- Learning rate: Cosine decay from 1e-3
- Early stopping with patience=4

**Stage 2: Fine-tuning (22 epochs)**
- Unfreeze layers from index 60 onwards
- Fine-tune backbone + head
- Learning rate: 1e-5 (fixed)
- Early stopping with patience=6

### Data Augmentation

Applied during training:
- Rotation: ±25 degrees
- Width/Height shift: ±15%
- Zoom: ±25%
- Shear: ±12%
- Horizontal flip: 50%
- Brightness: 0.75-1.25x
- Channel shift: ±10

### Advanced Techniques

**MixUp Augmentation**
- Alpha: 0.4
- Blends images and labels within same batch
- Improves generalization

**Label Smoothing**
- Factor: 0.05
- Prevents overconfidence
- Better calibration

**Class Imbalance Handling**
- Compute class weights from training distribution
- Apply sample weights during training
- Clip weights to [0.7, 1.6] range

**Test Time Augmentation (TTA)**
- 5 passes with horizontal flips
- Average predictions for final result

## Training Configuration
```python
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS_STAGE1 = 8
EPOCHS_STAGE2 = 22
FINE_TUNE_AT = 60  # Layer index for unfreezing
```

## Results

### Performance Metrics

- **Training Accuracy:** 90-91%
- **Validation Accuracy:** ~90%
- **Test Accuracy (with TTA):** 90.6%
- **Weighted F1-Score:** 0.90

### Per-Class Performance

| Class     | Precision | Recall | F1-Score | Support |
|-----------|-----------|--------|----------|---------|
| Cardboard | 0.92      | 0.95   | 0.94     | 61      |
| Glass     | 0.95      | 0.83   | 0.89     | 76      |
| Metal     | 0.85      | 0.94   | 0.89     | 62      |
| Paper     | 0.93      | 0.91   | 0.92     | 90      |
| Plastic   | 0.86      | 0.90   | 0.88     | 73      |

### Confusion Matrix

The model shows strong performance across all classes with minimal confusion between categories.

## Model Export

### Formats

**1. Keras (.keras)**
- Full model with architecture + weights
- Size: ~20 MB
- Used for ONNX conversion

**2. ONNX (.onnx)**
- Cross-platform format
- Size: ~16 MB
- Used in production (Java backend)
- Opset version: 13

**3. TensorFlow Lite (.tflite)**
- Mobile/edge deployment
- FP16 variant: ~8 MB
- INT8 variant: ~4 MB (quantized)

### Export Commands
```python
# Save Keras model
model.save('model_effb0_mixup.keras')

# Convert to ONNX
import tf2onnx
spec = (tf.TensorSpec((None, 224, 224, 3), tf.float32),)
tf2onnx.convert.from_keras(model, input_signature=spec, 
                            output_path='model_effb0_mixup.onnx')
```

## Preprocessing Pipeline

### Training
1. Resize to 224x224
2. Data augmentation (random transforms)
3. Pixel values: 0-255 (no normalization)
4. MixUp blending

### Inference
1. Resize to 224x224
2. Convert to RGB
3. Pixel values: 0-255 (no normalization)
4. No augmentation

**Important:** EfficientNet preprocessing in this implementation keeps pixels in 0-255 range. Do NOT apply standard ImageNet normalization (mean/std).

## Running the Notebook

### On Kaggle

1. Go to [Kaggle Notebooks](https://www.kaggle.com/code)
2. Upload `trash_classification.ipynb`
3. Add dataset: [trash-dataset](https://www.kaggle.com/datasets/...)
4. Enable GPU (P100 recommended)
5. Run all cells
6. Download outputs from Output tab

### Locally (requires GPU)
```bash
pip install tensorflow numpy matplotlib scikit-learn pillow
jupyter notebook trash_classification.ipynb
```

**Note:** Training requires ~4GB GPU memory and takes ~30-40 minutes on Tesla P100.

## Key Hyperparameters

| Parameter              | Value          |
|------------------------|----------------|
| Learning Rate (Stage 1)| Cosine decay   |
| Learning Rate (Stage 2)| 1e-5           |
| Batch Size             | 32             |
| Dropout Rate           | 0.35           |
| L2 Regularization      | 1e-5           |
| Label Smoothing        | 0.05           |
| MixUp Alpha            | 0.4            |

## Troubleshooting

### Out of Memory
- Reduce batch size to 16
- Use EfficientNetB0 instead of larger variants

### Overfitting
- Increase dropout rate
- Add more data augmentation
- Increase L2 regularization

### Low Accuracy
- Train for more epochs
- Adjust learning rate
- Check data quality and labels

## Future Improvements

Potential enhancements:
- Try EfficientNetV2 or ConvNeXt architectures
- Implement CutMix augmentation
- Use focal loss for class imbalance
- Add more diverse training data
- Ensemble multiple models

## References

- [EfficientNet Paper](https://arxiv.org/abs/1905.11946)
- [MixUp Paper](https://arxiv.org/abs/1710.09412)
- [Label Smoothing](https://arxiv.org/abs/1906.02629)

## Files

- `trash_classification.ipynb` - Main training notebook
- `model_effb0_mixup.keras` - Saved Keras model (output)
- `model_effb0_mixup.onnx` - ONNX model (output)
- `labels.txt` - Class labels (output)

## License

Educational project