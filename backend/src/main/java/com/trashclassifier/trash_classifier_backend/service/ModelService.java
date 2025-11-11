package com.trashclassifier.trash_classifier_backend.service;

import ai.onnxruntime.*;
import com.trashclassifier.trash_classifier_backend.model.PredictionResponse;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;
import java.util.List;

@Service
public class ModelService {

    private OrtEnvironment env;
    private OrtSession session;
    private List<String> labels;

    @PostConstruct
    public void loadModel() throws Exception {
        System.out.println("🔄 Loading ONNX model...");
        
        // 1. Load ONNX model
        env = OrtEnvironment.getEnvironment();
        ClassPathResource modelResource = new ClassPathResource("model_effb0_mixup.onnx");
        
        try (InputStream modelStream = modelResource.getInputStream()) {
            byte[] modelBytes = modelStream.readAllBytes();
            session = env.createSession(modelBytes);
            System.out.println("✅ ONNX model loaded successfully!");
        }

        // 2. Load labels
        ClassPathResource labelsResource = new ClassPathResource("labels.txt");
        labels = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(labelsResource.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                labels.add(line.trim());
            }
        }
        System.out.println("✅ Labels loaded: " + labels);
    }

    public PredictionResponse predict(byte[] imageBytes) throws Exception {
        // 1. Preprocess image
        BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
        float[][][][] tensor = preprocessImage(originalImage);

        // 2. Run ONNX inference
        OnnxTensor inputTensor = OnnxTensor.createTensor(env, tensor);
        Map<String, OnnxTensor> inputs = Collections.singletonMap(
            session.getInputNames().iterator().next(), 
            inputTensor
        );

        try (OrtSession.Result results = session.run(inputs)) {
            float[][] output = (float[][]) results.get(0).getValue();
            float[] predictions = output[0];

            // 3. Find top prediction
            int maxIndex = 0;
            float maxScore = predictions[0];
            for (int i = 1; i < predictions.length; i++) {
                if (predictions[i] > maxScore) {
                    maxScore = predictions[i];
                    maxIndex = i;
                }
            }

            // 4. Create response
            String predictedClass = labels.get(maxIndex);
            double confidence = maxScore;

            Map<String, Double> allScores = new LinkedHashMap<>();
            for (int i = 0; i < labels.size(); i++) {
                allScores.put(labels.get(i), (double) predictions[i]);
            }

            inputTensor.close();
            return new PredictionResponse(predictedClass, confidence, allScores);
        }
    }

    private float[][][][] preprocessImage(BufferedImage originalImage) {
        // 1. Resize to 224x224
        BufferedImage resizedImage = new BufferedImage(224, 224, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = resizedImage.createGraphics();
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics.drawImage(originalImage, 0, 0, 224, 224, null);
        graphics.dispose();
        
        // 2. Convert to float tensor - keep pixels in 0-255 range
        float[][][][] tensor = new float[1][224][224][3];
        
        for (int y = 0; y < 224; y++) {
            for (int x = 0; x < 224; x++) {
                int rgb = resizedImage.getRGB(x, y);
                
                // Extract RGB values (0-255) and keep as-is
                tensor[0][y][x][0] = ((rgb >> 16) & 0xFF);  // R
                tensor[0][y][x][1] = ((rgb >> 8) & 0xFF);   // G
                tensor[0][y][x][2] = (rgb & 0xFF);          // B
            }
        }
        
        return tensor;
    }
}