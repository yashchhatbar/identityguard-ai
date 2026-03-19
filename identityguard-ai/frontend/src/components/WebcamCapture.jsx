import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';

const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "user"
};

const WebcamCapture = ({ onCapture, buttonText = "Capture Face" }) => {
    const webcamRef = useRef(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            // Convert base64 to blob
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    onCapture(file, imageSrc);
                });
        }
    }, [webcamRef, onCapture]);

    return (
        <div className="d-flex flex-column align-items-center w-100">
            <div className="position-relative overflow-hidden rounded-4 shadow-sm mb-4" style={{ width: '100%', maxWidth: '400px', aspectRatio: '1/1' }}>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="w-100 h-100 object-fit-cover"
                    mirrored={true}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3)'
                }}></div>
            </div>

            <button
                type="button"
                onClick={capture}
                className="btn btn-modern w-100 py-3"
                style={{ maxWidth: '400px' }}
            >
                <Camera size={20} /> {buttonText}
            </button>
        </div>
    );
};

export default WebcamCapture;
