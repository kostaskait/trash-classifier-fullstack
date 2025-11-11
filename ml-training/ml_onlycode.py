# ==========================================================
# Trash Classification — EfficientNetB0 + MixUp + Fine-tuning
# Split σε train/val/test, MixUp, 2-στάδια training, TTA αξιολόγηση,
# αποθήκευση σε .keras και TFLite (FP16/INT8) με "σιωπηλή" μετατροπή.
# ==========================================================

# ----------------------------- [LOG/WARNINGS] -----------------------------
# Βάζουμε αυτά ΠΡΙΝ από το import tensorflow για να ισχύσουν παντού.
import os, warnings, io, contextlib  # io/contextlib για "σίγαση" stdout/stderr

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"  # 1: κρύβει INFO, 2: +WARNING, 3: +ERROR (από TF C++ backend)

# Φιλτράρουμε μερικά συνήθη προειδοποιητικά μηνύματα που δεν μας αφορούν
warnings.filterwarnings("ignore", message=r"Your `PyDataset` class.*")  # από Keras data adapters
warnings.filterwarnings("ignore", message=r"This ImageDataGenerator specifies `featurewise_center`.*")  # legacy προειδοποίηση
warnings.filterwarnings("ignore", message=r"Glyph .* missing from current font")  # matplotlib glyph warning
warnings.filterwarnings("ignore", message=r".*quantized inputs were expected.*")  # TFLite INT8 generic warning
# -------------------------------------------------------------------------


# ----------------------------- [IMPORTS / SEEDS] --------------------------
import random, shutil, glob, math, json, pathlib   # τυπικά utilities
import numpy as np                                  # αριθμητικά
import matplotlib.pyplot as plt                     # γραφήματα
import tensorflow as tf                             # TF/Keras
from tensorflow.keras import layers, models, regularizers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from sklearn.metrics import classification_report, f1_score, confusion_matrix, ConfusionMatrixDisplay
from PIL import Image

tf.get_logger().setLevel("ERROR")  # μόνο ERROR από τον Python logger του TF (λιγότερη φλυαρία)

SEED = 42
random.seed(SEED); np.random.seed(SEED); tf.random.set_seed(SEED)  # σταθερά αποτελέσματα όπου γίνεται
# -------------------------------------------------------------------------


# ----------------------------- [HELPERS ΓΙΑ "ΣΙΩΠΗ"] ----------------------
@contextlib.contextmanager
def suppress_tf_io():
    """Κρύβει stdout/stderr ΜΟΝΟ μέσα στο with-block (για save/convert)."""
    buf_out, buf_err = io.StringIO(), io.StringIO()       # προσωρινά buffers
    with contextlib.redirect_stdout(buf_out), contextlib.redirect_stderr(buf_err):
        yield                                             # ό,τι τρέχει μέσα, δεν τυπώνει στο output

def save_tflite_quiet(converter: tf.lite.TFLiteConverter, out_path: str):
    """Μετατρέπει σε .tflite χωρίς να γεμίσει το output με Captures/W0000."""
    with suppress_tf_io():                                # κρύψε εσωτερικά prints του converter
        tfl = converter.convert()                         # κάνει compile το flatbuffer (.tflite) στη μνήμη
    with open(out_path, "wb") as f:                       # γράφει σε αρχείο δυαδικά
        f.write(tfl)

def print_tflite_io(path: str):
    """Γρήγορο, καθαρό summary για σχήματα/τύπους εισόδου-εξόδου ενός .tflite."""
    interp = tf.lite.Interpreter(model_path=path)         # φορτώνει interpreter
    interp.allocate_tensors()                             # κάνει allocate tensors
    ide = interp.get_input_details()[0]                   # 1 είσοδος: dict με 'shape','dtype', ...
    ode = interp.get_output_details()[0]                  # 1 έξοδος
    print(f"📦 {os.path.basename(path)}")
    print(f"   input : shape {ide['shape']} dtype {ide['dtype']}")   # π.χ. [1 224 224 3], float32/int8
    print(f"   output: shape {ode['shape']} dtype {ode['dtype']}")   # π.χ. [1 5], float32/int8
# -------------------------------------------------------------------------


# ----------------------------- [PATHS / SPLIT] ----------------------------
ORIGINAL_DATASET = "/kaggle/input/trash-dataset/dataset"  # αρχικό dataset (φακελοι/κλάσεις)
SPLIT_DATASET    = "/kaggle/working/dataset_split"        # πού θα γραφτεί το split
OUT_DIR          = "/kaggle/working"                       # έξοδοι (.keras, .tflite, labels.txt)

print("📁 ORIGINAL_DATASET contains:", os.listdir(ORIGINAL_DATASET))  # δείξε τι φακέλους έχει

# Ποσοστά για train/val/test
train_split, val_split, test_split = 0.70, 0.15, 0.15     # 70/15/15

# Αν υπάρχει ήδη παλιό split, καθάρισέ το (για να μην αναμειχθούν αρχεία)
if os.path.exists(SPLIT_DATASET):
    shutil.rmtree(SPLIT_DATASET)                          # διαγραφή φακέλου αναδρομικά

# Δημιουργία κενών φακέλων προορισμού για κάθε split και κάθε κλάση
for s in ['train','validation','test']:
    for c in os.listdir(ORIGINAL_DATASET):
        os.makedirs(os.path.join(SPLIT_DATASET, s, c), exist_ok=True)  # exist_ok: μην σκάσεις αν υπάρχει

# Πραγματική αντιγραφή εικόνων με shuffle
for c in os.listdir(ORIGINAL_DATASET):
    src = os.path.join(ORIGINAL_DATASET, c)
    if not os.path.isdir(src):            # αν είναι αρχείο και όχι φάκελος, αγνόησέ το
        continue
    imgs = os.listdir(src); random.shuffle(imgs)          # ανακάτεψε λίστα εικόνων
    n = len(imgs); a = int(train_split*n); b = a + int(val_split*n)  # indices κοψίματος
    for i in imgs[:a]:
        shutil.copyfile(os.path.join(src, i), os.path.join(SPLIT_DATASET, "train", c, i))       # train copy
    for i in imgs[a:b]:
        shutil.copyfile(os.path.join(src, i), os.path.join(SPLIT_DATASET, "validation", c, i))  # val copy
    for i in imgs[b:]:
        shutil.copyfile(os.path.join(src, i), os.path.join(SPLIT_DATASET, "test", c, i))        # test copy

print("✅ Split done.")
print("📂 Υποφάκελοι:", os.listdir(SPLIT_DATASET))        # αναμένουμε ['train','validation','test']
# -------------------------------------------------------------------------


# ----------------------------- [GENERATORS / AUGMENT] ---------------------
IMG_SIZE   = (224, 224)                   # μέγεθος εισόδου προς EfficientNetB0
BATCH_SIZE = 32                           # πόσα δείγματα ανά batch
EPOCHS_STAGE1 = 8                         # εκπαίδευση "κεφαλής"
EPOCHS_STAGE2 = 22                        # fine-tuning κορμού
FINE_TUNE_AT  = 60                        # από ποιο layer index και πάνω θα ξεπαγώσουμε

# Συλλογή ονομάτων κλάσεων από το split (ταξινομημένα για σταθερό mapping)
CATEGORIES = sorted([
    c for c in os.listdir(os.path.join(SPLIT_DATASET, "train"))
    if os.path.isdir(os.path.join(SPLIT_DATASET, "train", c)) and not c.startswith("trash")
])
NUM_CLASSES = len(CATEGORIES)
print("🔍 Classes:", CATEGORIES)

# TRAIN: δυνατά αλλά ρεαλιστικά augmentations + σωστό normalize για EfficientNet
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,   # ΜΕΓΑΛΗ σημασία: ίδιο normalization με το pretrain
    featurewise_center=False, samplewise_center=False,  # σιγή warnings
    rotation_range=25, width_shift_range=0.15, height_shift_range=0.15,
    zoom_range=0.25, shear_range=0.12, horizontal_flip=True,
    brightness_range=(0.75, 1.25), channel_shift_range=10.0,
    fill_mode='nearest'
)
# VAL/TEST: μόνο normalize (καμία αλλοίωση)
valtest_datagen = ImageDataGenerator(preprocessing_function=preprocess_input)

# Δημιουργία ροών από φακέλους (Keras θα φροντίσει να κάνει on-the-fly augment/resize)
train_gen = train_datagen.flow_from_directory(
    os.path.join(SPLIT_DATASET, "train"),
    target_size=IMG_SIZE, batch_size=BATCH_SIZE,
    classes=CATEGORIES, class_mode='categorical', seed=SEED
)
val_gen = valtest_datagen.flow_from_directory(
    os.path.join(SPLIT_DATASET, "validation"),
    target_size=IMG_SIZE, batch_size=BATCH_SIZE,
    classes=CATEGORIES, class_mode='categorical', seed=SEED
)
test_gen = valtest_datagen.flow_from_directory(
    os.path.join(SPLIT_DATASET, "test"),
    target_size=IMG_SIZE, batch_size=BATCH_SIZE,
    classes=CATEGORIES, class_mode='categorical', shuffle=False  # shuffle=False για σωστές μετρικές
)
# -------------------------------------------------------------------------


# ----------------------------- [CLASS WEIGHTS -> SAMPLE WEIGHT] -----------
# Μετράμε πόσα δείγματα έχει κάθε κλάση στο TRAIN για να ζυγίσουμε σωστά τη συνεισφορά τους.
train_counts = np.bincount(train_gen.classes, minlength=NUM_CLASSES)  # πλήθος ανά class id
tot = int(train_counts.sum())                                         # σύνολο δειγμάτων
raw = {i: float(tot/(NUM_CLASSES*max(1, c))) for i, c in enumerate(train_counts)}  # αντιστρόφως ανάλογα
class_weights = {i: float(np.clip(w, 0.7, 1.6)) for i, w in raw.items()}           # clip για σταθερότητα
print("📊 Train counts:", dict(zip(CATEGORIES, train_counts.tolist())))
print("⚖️ Class weights (clipped):", class_weights)

# Θα χρειαστούμε ένα vector [C] με weights για να βγάζουμε sample_weight σε MixUp
weight_vec = np.array([class_weights[i] for i in range(NUM_CLASSES)], dtype=np.float32)
# -------------------------------------------------------------------------


# ----------------------------- [MIXUP GENERATOR] --------------------------
def mixup_same_batch_generator(gen, weight_vec, alpha=0.4):
    """
    Παράγει άπειρα batches MixUp από έναν ImageDataGenerator.
    Επιστρέφει τριάδα (x_mix, y_mix, sample_weight) ώστε το model.fit να την δεχτεί κανονικά.
    """
    while True:
        x, y = next(gen)                                # x: (B,H,W,3) float32, y: (B,C) one-hot
        B = x.shape[0]                                  # μέγεθος batch (μπορεί να είναι μικρότερο στο τέλος)
        idx = np.random.permutation(B)                  # τυχαία αντιστοίχιση για "ζευγάρια" δειγμάτων
        lam = np.random.beta(alpha, alpha, size=(B,)).astype(np.float32)  # λ ~ Beta(α,α)
        lam_x = lam.reshape(B, 1, 1, 1)                 # reshape για broadcast σε εικόνες
        lam_y = lam.reshape(B, 1)                       # reshape για broadcast σε labels

        x2, y2 = x[idx], y[idx]                         # τα shuffled "ζευγάρια"
        x_mix = lam_x * x + (1.0 - lam_x) * x2         # MixUp εικόνων
        y_mix = lam_y * y + (1.0 - lam_y) * y2         # MixUp labels (soft labels)

        # sample_weight: υπολογίζουμε βάρος ανά δείγμα -> (y_mix * class_weight).sum(axis=1)
        sw = (y_mix * weight_vec).sum(axis=1).astype(np.float32)  # shape: (B,)
        yield x_mix, y_mix, sw
# Δημιουργία του mixup generator
mix_gen = mixup_same_batch_generator(train_gen, weight_vec, alpha=0.4)
# -------------------------------------------------------------------------


# ----------------------------- [ΜΟΝΤΕΛΟ] ----------------------------------
# EfficientNetB0 backbone (προεκπαιδευμένο στο ImageNet) χωρίς το top classifier
base = EfficientNetB0(weights='imagenet', include_top=False,
                      input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3))
base.trainable = False                                   # Stage 1: παγωμένος κορμός

# Head: GAP -> Dropout -> Dense(192, swish, L2) -> Dense(NUM_CLASSES, softmax)
inp = layers.Input(shape=(IMG_SIZE[0], IMG_SIZE[1], 3))  # ορισμός input layer
x = base(inp, training=False)                            # training=False για σωστό BN behavior στο frozen
x = layers.GlobalAveragePooling2D()(x)                   # συμπύκνωση χωρικών διαστάσεων
x = layers.Dropout(0.35)(x)                              # τακτική regularization
x = layers.Dense(192, activation='swish',
                 kernel_regularizer=regularizers.l2(1e-5))(x)  # μικρό L2 για σταθερότητα
out = layers.Dense(NUM_CLASSES, activation='softmax')(x) # logits -> πιθανότητες κλάσεων
model = models.Model(inp, out)                           # Model(inputs, outputs)
model.summary()                                          # εκτύπωση σύνοψης δικτύου
# -------------------------------------------------------------------------


# ----------------------------- [TRAINING — STAGE 1] -----------------------
steps_per_epoch = len(train_gen)                         # πόσα batches/epoch από τον generator
total_steps = (EPOCHS_STAGE1 + EPOCHS_STAGE2) * steps_per_epoch  # για το cosine decay
cosine = tf.keras.optimizers.schedules.CosineDecay(
    initial_learning_rate=1e-3,                         # αρχικό LR
    decay_steps=total_steps                             # πόσα βήματα μέχρι το minimum
)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=cosine),  # Adam με cosine schedule
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.05),  # label smoothing για γενίκευση
    metrics=['accuracy']                                       # accuracy στο train/val
)

ckpt1 = os.path.join(OUT_DIR, "best_effb0_stage1.keras")       # διαδρομή best μοντέλου stage1
cbs1 = [
    ReduceLROnPlateau(monitor='val_loss', factor=0.4, patience=2, verbose=1),  # αν "κολλήσει", ρίξε LR
    EarlyStopping(monitor='val_loss', patience=4, restore_best_weights=True, verbose=1),  # σταμάτα νωρίς
    ModelCheckpoint(ckpt1, monitor='val_loss', save_best_only=True, verbose=1)  # κράτα το καλύτερο
]

history1 = model.fit(
    mix_gen,                                                   # (x, y, sample_weight) από MixUp
    steps_per_epoch=steps_per_epoch,
    epochs=EPOCHS_STAGE1,
    validation_data=val_gen,                                   # val χωρίς MixUp
    callbacks=cbs1,
    verbose=1
)

# φόρτωσε τα καλύτερα weights του stage1 (σύμφωνα με val_loss)
if os.path.exists(ckpt1):
    model = tf.keras.models.load_model(ckpt1)
# -------------------------------------------------------------------------


# ----------------------------- [TRAINING — STAGE 2] -----------------------
# Unfreeze backbone ΜΕΡΙΚΑ layers: από FINE_TUNE_AT και πάνω
base.trainable = True
for i, layer in enumerate(base.layers):
    layer.trainable = (i >= FINE_TUNE_AT)                      # True μόνο στα "τελευταία" layers

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-5),                  # πολύ μικρό LR για fine-tune
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.05),
    metrics=['accuracy']
)

ckpt2 = os.path.join(OUT_DIR, "best_effb0_stage2.keras")
cbs2 = [
    ReduceLROnPlateau(monitor='val_loss', factor=0.4, patience=3, verbose=1),
    EarlyStopping(monitor='val_loss', patience=6, restore_best_weights=True, verbose=1),
    ModelCheckpoint(ckpt2, monitor='val_loss', save_best_only=True, verbose=1)
]

history2 = model.fit(
    mix_gen,
    steps_per_epoch=steps_per_epoch,
    epochs=EPOCHS_STAGE2,
    validation_data=val_gen,
    callbacks=cbs2,
    verbose=1
)

if os.path.exists(ckpt2):
    model = tf.keras.models.load_model(ckpt2)                 # φόρτωσε το καλύτερο του stage2
# -------------------------------------------------------------------------


# ----------------------------- [EVALUATION — TTA] -------------------------
def predict_tta(model, generator, tta_times=5):
    """
    Απλό TTA: 5 περάσματα, στα μονά t εφαρμόζουμε horizontal flip.
    Μαζεύουμε προβλέψεις και επιστρέφουμε τον μέσο όρο.
    """
    preds = []
    for t in range(tta_times):
        generator.reset()                                      # επανεκκίνηση generator για συνεπή batches
        batch_preds = []
        for _ in range(len(generator)):                         # τόσα βήματα όσα batches έχει το generator
            x, _ = next(generator)                              # παίρνουμε εικόνες (labels δε χρειάζονται)
            if t % 2 == 1:
                x = x[:, :, ::-1, :]                           # οριζόντιο flip (W axis αντιστρέφεται)
            p = model.predict(x, verbose=0)                     # προβλέψεις (B, C)
            batch_preds.append(p)
        preds.append(np.vstack(batch_preds))                    # (N, C)
    return np.mean(preds, axis=0)                               # μέσος όρος πάνω στα tta passes -> (N, C)

test_probs = predict_tta(model, test_gen, tta_times=5)          # πιθανότητες για ΟΛΟ το test set
y_pred = np.argmax(test_probs, axis=1)                          # predicted class id
y_true = test_gen.classes                                       # ground truth ids (από generator)

test_acc = (y_pred == y_true).mean()                            # accuracy
print(f"\n✅ Test Accuracy (TTA): {test_acc:.4f}")
# -------------------------------------------------------------------------


# ----------------------------- [PLOTS / REPORTS] --------------------------
def plot_hist(h1, h2):
    """Ενιαίο plot για train/val accuracy (stage1+stage2)."""
    acc = h1.history['accuracy'] + h2.history['accuracy']      # λίστες εποχών κολλημένες
    val = h1.history['val_accuracy'] + h2.history['val_accuracy']
    plt.figure(figsize=(6, 4))
    plt.plot(acc, label='Train'); plt.plot(val, label='Val')
    plt.title("EfficientNetB0 — Training & Validation")
    plt.xlabel("Epochs"); plt.ylabel("Accuracy")
    plt.grid(True); plt.legend(); plt.show()

plot_hist(history1, history2)

labels = list(test_gen.class_indices.keys())                    # mapping id->όνομα κλάσης
print("\n📄 Classification Report:")
print(classification_report(y_true, y_pred, target_names=labels))          # precision/recall/f1 ανά κλάση
print("🔢 Weighted F1:", f1_score(y_true, y_pred, average='weighted'))     # σταθμισμένο F1

cm = confusion_matrix(y_true, y_pred)                           # πιν. σύγχυσης
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=labels)
disp.plot(cmap=plt.cm.Blues, xticks_rotation=45)
plt.title("📊 Confusion Matrix"); plt.grid(False); plt.show()
# -------------------------------------------------------------------------


# ----------------------------- [SAVE MODEL & LABELS] ----------------------
model_path = os.path.join(OUT_DIR, "model_effb0_mixup.keras")
with suppress_tf_io():                                          # κόβει verbose "Captures" από SavedModel
    model.save(model_path, include_optimizer=False)             # σώζουμε χωρίς optimizer (πιο μικρό)
print("💾 Saved:", model_path)

with open(os.path.join(OUT_DIR, "labels.txt"), "w") as f:       # σώζω labels (μία ανά γραμμή)
    for lb in labels:
        f.write(lb + "\n")
# -------------------------------------------------------------------------


# ----------------------------- [TFLITE EXPORTS] --------------------------
# (α) FP16: πολύ καλή ισορροπία ακρίβειας/μέγεθος/ταχύτητα σε πολ. συσκευές
fp16_path = os.path.join(OUT_DIR, "model_effb0_mixup_fp16.tflite")
conv = tf.lite.TFLiteConverter.from_keras_model(model)          # converter από keras model
conv.optimizations = [tf.lite.Optimize.DEFAULT]                 # ενεργοποίηση default optimizations
conv.target_spec.supported_types = [tf.float16]                 # FP16 βάρη/υπολογισμοί
save_tflite_quiet(conv, fp16_path)                              # σιωπηλά
print_tflite_io(fp16_path)                                      # καθαρό summary Ι/Ο

# (β) INT8 (προαιρετικό): μικρότερο/γρηγορότερο. Θέλει representative dataset για calibration.
def rep_gen():
    files = []
    for c in labels:
        files += glob.glob(os.path.join(SPLIT_DATASET, "train", c, "*"))[:60]  # ~60 εικόνες/κλάση
    for fp in files:
        im = Image.open(fp).convert("RGB").resize(IMG_SIZE, Image.BILINEAR)    # resize HxW
        arr = np.array(im).astype(np.float32)                                  # σε float32
        arr = preprocess_input(arr)                                            # ΠΑΝΤΑ ίδιο preprocessing
        yield [np.expand_dims(arr, 0)]                                         # batch=1, shape (1,H,W,3)

int8_path = os.path.join(OUT_DIR, "model_effb0_mixup_int8.tflite")
try:
    conv_i8 = tf.lite.TFLiteConverter.from_keras_model(model)
    conv_i8.optimizations = [tf.lite.Optimize.DEFAULT]                          # ενεργοποίηση quantization pass
    conv_i8.representative_dataset = rep_gen                                    # calibration samples
    conv_i8.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]   # καθαρό INT8 graph
    conv_i8.inference_input_type = tf.int8                                      # είσοδος INT8
    conv_i8.inference_output_type = tf.int8                                     # έξοδος INT8
    save_tflite_quiet(conv_i8, int8_path)                                       # σιωπηλά
    print_tflite_io(int8_path)
except Exception as e:
    print("⚠️ INT8 conversion skipped:", e)                                     # π.χ. αν λείπουν ops
# --------------------------------------------------------------------------



# ============================================
# ONNX CONVERSION (για Java backend)
# ============================================

print("\n🔄 Converting model to ONNX format...")

# 1) Install tf2onnx (Kaggle δεν το έχει by default)
import subprocess
subprocess.run(["pip", "install", "-q", "tf2onnx", "onnx"], check=True)

import tf2onnx
import onnx

# 2) Load το Keras model που μόλις σώσαμε
model_for_onnx = tf.keras.models.load_model(model_path)

# 3) Define input signature (224x224x3 RGB image)
spec = (tf.TensorSpec((None, 224, 224, 3), tf.float32, name="input"),)

# 4) Convert σε ONNX
onnx_path = os.path.join(OUT_DIR, "model_effb0_mixup.onnx")

model_proto, _ = tf2onnx.convert.from_keras(
    model_for_onnx,
    input_signature=spec,
    opset=13,  # ONNX opset version
    output_path=onnx_path
)

print(f"✅ ONNX model saved: {onnx_path}")

# 5) Verify το ONNX model
onnx_model = onnx.load(onnx_path)
onnx.checker.check_model(onnx_model)
print("✅ ONNX model verified successfully!")

# 6) Print ONNX model info
import onnxruntime as ort
session = ort.InferenceSession(onnx_path)
input_info = session.get_inputs()[0]
output_info = session.get_outputs()[0]

print("\n📦 ONNX Model Info:")
print(f"   Input : {input_info.name} | shape: {input_info.shape} | type: {input_info.type}")
print(f"   Output: {output_info.name} | shape: {output_info.shape} | type: {output_info.type}")