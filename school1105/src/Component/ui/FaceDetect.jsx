import * as faceapi from "face-api.js";
import React, { useEffect, useRef } from "react";
import Webcam from "react-webcam";

const FaceDetect = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // LOAD MODELS
  const loadModels = async () => {
    const MODEL_URL = "/models";

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    startVideo();
  };

  // START CAMERA
  const startVideo = () => {
    setInterval(async () => {
      if (!webcamRef.current) return;

      const video = webcamRef.current.video;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const canvas = canvasRef.current;
      const displaySize = {
        width: video.videoWidth,
        height: video.videoHeight,
      };

      faceapi.matchDimensions(canvas, displaySize);

      const resized = faceapi.resizeResults(detections, displaySize);

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      faceapi.draw.drawDetections(canvas, resized);
    }, 1000);
  };

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <div style={{ position: "relative", width: "400px" }}>
      <Webcam ref={webcamRef} style={{ width: "100%" }} />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
};

export default FaceDetect;
