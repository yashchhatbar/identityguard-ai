import { Camera, RefreshCcw, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

export default function ImageUploader({
    onCapture,
    label = 'Face capture',
    helper = 'Upload a portrait, use camera, or paste an image URL.'
}) {
    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);

    const [mode, setMode] = useState('upload'); // upload | camera | url
    const [preview, setPreview] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [urlError, setUrlError] = useState('');

    function setPreviewFromFile(file) {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return objectUrl;
    }

    function applyFile(file) {
        if (!file) return;

        const objectUrl = setPreviewFromFile(file);
        setUrlError('');
        onCapture(file, objectUrl);
    }

    function handleFileChange(event) {
        applyFile(event.target.files?.[0]);
    }

    async function captureFromCamera() {
        const screenshot = webcamRef.current?.getScreenshot();
        if (!screenshot) return;

        const response = await fetch(screenshot);
        const blob = await response.blob();
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });

        setPreview(screenshot);
        setUrlError('');
        onCapture(file, screenshot);
    }

    function buildFileName(url, mimeType) {
        try {
            const parsed = new URL(url);
            const lastSegment = parsed.pathname.split('/').filter(Boolean).pop();
            if (lastSegment && /\.[a-z0-9]+$/i.test(lastSegment)) {
                return lastSegment;
            }
        } catch {
        }

        const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
        return `url-image.${extension}`;
    }

    async function handleUrlUpload() {
        const trimmedUrl = imageUrl.trim();
        if (!trimmedUrl) {
            setUrlError('Paste an image URL to continue.');
            return;
        }

        setLoading(true);
        setUrlError('');

        try {
            const parsed = new URL(trimmedUrl);
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                throw new Error('Use a valid http or https image URL.');
            }

            const res = await fetch(trimmedUrl);
            if (!res.ok) {
                throw new Error('The image URL could not be loaded.');
            }

            const contentType = res.headers.get('content-type') || '';
            if (!contentType.startsWith('image/')) {
                throw new Error('The provided URL does not point to an image.');
            }

            const blob = await res.blob();
            if (!blob.type.startsWith('image/')) {
                throw new Error('The fetched file is not a supported image.');
            }

            const file = new File([blob], buildFileName(trimmedUrl, blob.type), { type: blob.type });
            const previewUrl = setPreviewFromFile(file);
            onCapture(file, previewUrl);
        } catch (err) {
            setUrlError(err instanceof Error ? err.message : 'Failed to load image from URL.');
        } finally {
            setLoading(false);
        }
    }

    function reset() {
        setPreview('');
        setImageUrl('');
        setUrlError('');
        onCapture(null, '');
    }

    useEffect(() => {
        return () => {
            if (preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    return (
        <div className="surface-card p-5">
            {/* Header */}
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-950">{label}</h3>
                    <p className="mt-1 text-sm text-slate-500">{helper}</p>
                </div>

                <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm">
                    {['upload', 'camera', 'url'].map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMode(m)}
                            className={`rounded-full px-3 py-1.5 ${mode === m ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
                                }`}
                        >
                            {m === 'upload' && 'Upload'}
                            {m === 'camera' && 'Camera'}
                            {m === 'url' && 'URL'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview */}
            {preview ? (
                <div className="space-y-4">
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
                        <img src={preview} alt="Face preview" className="aspect-[4/3] w-full object-cover" />
                    </div>

                    <button type="button" onClick={reset} className="btn-secondary w-full">
                        <RefreshCcw className="h-4 w-4" />
                        Reset
                    </button>
                </div>

            ) : mode === 'camera' ? (
                <div className="space-y-4">
                    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            mirrored
                            screenshotFormat="image/jpeg"
                            className="aspect-[4/3] w-full object-cover"
                        />
                    </div>

                    <button onClick={captureFromCamera} className="btn-primary w-full">
                        <Camera className="h-4 w-4" />
                        Capture
                    </button>
                </div>

            ) : mode === 'url' ? (
                <div className="space-y-4">
                    <input
                        type="url"
                        placeholder="Paste image URL (https://...)"
                        className="w-full rounded-xl border border-slate-300 p-3"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />

                    {urlError ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                            {urlError}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">
                            Paste a direct image link. We fetch it, convert it to a file, and send it through the existing upload flow.
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={handleUrlUpload}
                        className="btn-primary w-full"
                        disabled={loading}
                    >
                        <LinkIcon className="h-4 w-4" />
                        {loading ? 'Fetching...' : 'Upload from URL'}
                    </button>
                </div>

            ) : (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <UploadCloud className="h-6 w-6" />

                    <p className="mt-4 font-semibold">Upload image</p>
                    <p className="text-sm text-gray-500">JPEG, PNG up to 5MB</p>
                </button>
            )}
        </div>
    );
}
