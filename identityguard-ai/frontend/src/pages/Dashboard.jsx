import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Clock3, Fingerprint, ScanFace, SlidersHorizontal, Sparkles, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ImageUploader from '../components/ImageUploader';
import Sidebar from '../components/Sidebar';
import Tabs from '../components/Tabs';
import Topbar from '../components/Topbar';
import UploadResultCard from '../components/UploadResultCard';
import HistoryPanel from '../components/dashboard/HistoryPanel';
import InsightsPanel from '../components/dashboard/InsightsPanel';
import MultiCompare from '../components/dashboard/MultiCompare';
import { useNotifications } from '../components/NotificationsProvider';
import { apiRequest } from '../lib/api';
import { clearSession, getStoredToken, getStoredUser } from '../lib/auth';

function buildFormData(image, threshold) {
  const data = new FormData();
  data.append('image', image);
  data.append('threshold', String(threshold));
  return data;
}

const UPLOAD_HISTORY_KEY = 'identityguard.upload-history';

function loadUploadHistory() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(UPLOAD_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistUploadHistory(items) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(items));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Failed to read uploaded image.'));
    reader.readAsDataURL(file);
  });
}

async function loadDemoFile(path, filename) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error('Demo image could not be loaded.');
  }

  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || 'image/jpeg' });
}

function Panel({ children, id }) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  );
}

const PROCESSING_STEPS = [
  'Detecting face...',
  'Generating embeddings...',
  'Comparing with database...',
];

function normalizeFaceError(message) {
  const normalized = String(message || '').toLowerCase();

  if (normalized.includes('no face')) {
    return 'No face detected. Please upload a clear image.';
  }

  if (normalized.includes('multiple face') || normalized.includes('multiple faces')) {
    return 'Multiple faces detected. Upload a single face image.';
  }

  if (
    normalized.includes('quality too low') ||
    normalized.includes('low quality') ||
    normalized.includes('resolution') ||
    normalized.includes('blurry')
  ) {
    return 'Image quality too low. Try a clearer image.';
  }

  if (
    normalized.includes('network') ||
    normalized.includes('fetch') ||
    normalized.includes('server') ||
    normalized.includes('internal') ||
    normalized.includes('request failed')
  ) {
    return 'Something went wrong. Please try again.';
  }

  return message || 'Something went wrong. Please try again.';
}

function ProcessingPanel({ title, message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="surface-card flex min-h-[320px] flex-col items-center justify-center p-6 text-center"
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-sky-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-sky-600 border-r-sky-300" />
        <Sparkles className="h-8 w-8 text-sky-700" />
      </div>
      <p className="section-label mt-6">{title}</p>
      <h3 className="mt-3 text-2xl font-semibold text-slate-950">{message}</h3>
      <div className="mt-6 flex gap-2">
        {PROCESSING_STEPS.map((step) => (
          <span
            key={step}
            className={`h-2.5 w-14 rounded-full transition ${
              step === message ? 'bg-sky-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
        The AI pipeline is actively processing your image and preparing a similarity decision.
      </p>
    </motion.div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [uploadImage, setUploadImage] = useState(null);
  const [verifyImage, setVerifyImage] = useState(null);
  const [threshold, setThreshold] = useState(0.72);
  const [uploadResult, setUploadResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [busy, setBusy] = useState('');
  const [uploadHistory, setUploadHistory] = useState(() => loadUploadHistory());
  const [processingMessage, setProcessingMessage] = useState(PROCESSING_STEPS[0]);
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);

  useEffect(() => {
    if (!busy) {
      setProcessingMessage(PROCESSING_STEPS[0]);
      return undefined;
    }

    let stepIndex = 0;
    setProcessingMessage(PROCESSING_STEPS[stepIndex]);

    const interval = window.setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, PROCESSING_STEPS.length - 1);
      setProcessingMessage(PROCESSING_STEPS[stepIndex]);
    }, 950);

    return () => window.clearInterval(interval);
  }, [busy]);

  function getAuthHeaders() {
    return { Authorization: `Bearer ${getStoredToken()}` };
  }

  function renderErrorMessage(error) {
    return normalizeFaceError(error?.message || error);
  }

  async function handleFaceUpload(imageOverride = null) {
    const selectedImage = imageOverride || uploadImage;

    if (!selectedImage) {
      notify('Please select an image first', 'info');
      return;
    }

    if (selectedImage.size > 2 * 1024 * 1024) {
      notify('Large image detected. Processing may take a moment.', 'warning');
    }

    notify('Processing face with the AI pipeline.', 'info');
    setBusy('upload');
    setUploadError('');

    try {
      const payload = await apiRequest('/face/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: buildFormData(selectedImage, threshold),
      });

      setUploadResult(payload.data);
      try {
        const image = await fileToDataUrl(selectedImage);
        const nextHistory = [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            image,
            result: payload.data,
            timestamp: new Date().toISOString(),
          },
          ...uploadHistory,
        ].slice(0, 8);
        setUploadHistory(nextHistory);
        persistUploadHistory(nextHistory);
      } catch {
      }
      setActiveTab('upload');
      notify(
        payload.data.duplicate_detected ? 'Duplicate detected' : 'Face uploaded successfully',
        payload.data.duplicate_detected ? 'error' : 'success'
      );
    } catch (error) {
      const message = renderErrorMessage(error);
      setUploadError(message);
      notify(message, 'error');
    } finally {
      setBusy('');
    }
  }

  async function handleDemoUpload(path, filename) {
    setActiveTab('upload');

    try {
      const file = await loadDemoFile(path, filename);
      setUploadImage(file);
      notify('Demo image loaded. Running upload flow.', 'info');
      await handleFaceUpload(file);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Demo image could not be loaded.', 'error');
    }
  }

  async function handleVerify() {
    if (!verifyImage) {
      notify('Please select image for verification', 'info');
      return;
    }

    notify('Verifying face against stored records.', 'info');
    setBusy('verify');
    setVerifyError('');

    try {
      const payload = await apiRequest('/face/verify', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: buildFormData(verifyImage, threshold),
      });

      setVerifyResult(payload.data);
      setActiveTab('verify');
      notify(payload.data.verified ? 'Verification success' : 'No match found', payload.data.verified ? 'success' : 'info');
    } catch (error) {
      const message = renderErrorMessage(error);
      setVerifyError(message);
      notify(message, 'error');
    } finally {
      setBusy('');
    }
  }

  function logout() {
    clearSession();
    navigate('/login');
  }

  const insights = [
    { label: 'Threshold', value: `${Math.round(threshold * 100)}%`, detail: 'Current similarity sensitivity', icon: SlidersHorizontal },
    { label: 'Upload status', value: uploadResult ? (uploadResult.duplicate_detected ? 'Duplicate' : 'Unique') : 'Pending', detail: uploadError || 'Latest upload decision', icon: UploadCloud },
    { label: 'Verification', value: verifyResult ? (verifyResult.verified ? 'Matched' : 'No match') : 'Pending', detail: verifyError || 'Latest verification outcome', icon: Fingerprint },
  ];

  function clearUploadHistory() {
    setUploadHistory([]);
    persistUploadHistory([]);
    notify('Upload history cleared', 'info');
  }

  return (
    <section className="app-shell py-10">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar activeTab={activeTab} onSelect={setActiveTab} />
        <div className="min-w-0">
          <Topbar user={user} onLogout={logout} />
          <Tabs activeTab={activeTab} onChange={setActiveTab} />
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <Panel id="dashboard">
                <div className="grid gap-4 xl:grid-cols-3">
                  {[
                    {
                      label: 'Upload readiness',
                      title: uploadImage ? 'Image selected' : 'Awaiting capture',
                      text: 'Start a new identity scan with a clean frontal face image and adjustable threshold controls.',
                      icon: UploadCloud,
                      tone: 'bg-sky-50 text-sky-700',
                    },
                    {
                      label: 'Verification state',
                      title: verifyResult ? (verifyResult.verified ? 'Verified' : 'Needs review') : 'Ready',
                      text: 'Compare a candidate face against stored identities with the current confidence threshold.',
                      icon: ScanFace,
                      tone: 'bg-emerald-50 text-emerald-700',
                    },
                    {
                      label: 'Workspace insight',
                      title: `${Math.round(threshold * 100)}% threshold`,
                      text: 'Tune sensitivity to reduce false positives or tighten duplicate detection confidence.',
                      icon: Sparkles,
                      tone: 'bg-slate-100 text-slate-900',
                    },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <motion.div key={card.label} whileHover={{ y: -3 }} className="surface-card p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="section-label">{card.label}</p>
                            <h2 className="mt-4 text-2xl font-semibold text-slate-950">{card.title}</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{card.text}</p>
                          </div>
                          <div className={`rounded-2xl p-3 ${card.tone}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="surface-card p-6">
                    <p className="section-label">Workspace overview</p>
                    <h3 className="mt-4 text-2xl font-semibold text-slate-950">Everything needed to review a face session</h3>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                      The dashboard groups upload, verification, insights, and history into one operator-friendly surface so users can move through the flow without context switching.
                    </p>
                  </div>
                  <div className="surface-card p-6">
                    <p className="section-label">Quick actions</p>
                    <div className="mt-5 space-y-3">
                      {[
                        ['upload', 'Open upload flow', UploadCloud],
                        ['verify', 'Open verification flow', Fingerprint],
                        ['insights', 'Review insights', Activity],
                      ].map(([id, label, Icon]) => (
                        <button key={id} type="button" onClick={() => setActiveTab(id)} className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-left text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-sm">
                          {label}
                          <Icon className="h-4 w-4 text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Panel>
            ) : null}

            {activeTab === 'upload' ? (
              <Panel id="upload">
                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="surface-card p-6">
                    <p className="section-label">Upload</p>
                    <h2 className="mt-4 text-2xl font-semibold text-slate-950">Submit a new face capture</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">Keep the current API flow intact while presenting a cleaner operator experience.</p>

                    <div className="mt-6">
                      <ImageUploader onCapture={(file) => setUploadImage(file)} label="Upload Face" helper="Upload, camera, or URL" />
                    </div>

                    <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Demo mode</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Instant test data for product walkthroughs. Each demo image runs through the same upload pipeline.
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => handleDemoUpload('/demo/demo-1.jpg', 'demo-1.jpg')}
                          disabled={busy === 'upload'}
                          className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Try Demo 1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDemoUpload('/demo/demo-2.jpg', 'demo-2.jpg')}
                          disabled={busy === 'upload'}
                          className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Try Demo 2
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white p-2 shadow-sm">
                          <SlidersHorizontal className="h-4 w-4 text-slate-700" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Similarity threshold</p>
                          <p className="text-sm text-slate-500">Adjust duplicate sensitivity without changing the API contract.</p>
                        </div>
                      </div>
                      <input type="range" min="0.5" max="0.95" step="0.01" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} className="mt-5 w-full accent-slate-950" />
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                        <span>Balanced</span>
                        <span className="font-semibold text-slate-950">{Math.round(threshold * 100)}%</span>
                      </div>
                    </div>

                    <button type="button" onClick={handleFaceUpload} disabled={busy === 'upload'} className="btn-primary mt-6 w-full">
                      <UploadCloud />
                      {busy === 'upload' ? 'Processing AI...' : 'Upload & Detect'}
                    </button>

                    {uploadError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{uploadError}</div> : null}
                  </div>

                  <div className="space-y-6">
                    <AnimatePresence mode="wait">
                      {busy === 'upload' ? (
                        <ProcessingPanel key="upload-processing" title="AI upload analysis" message={processingMessage} />
                      ) : (
                        <motion.div
                          key="upload-results"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6"
                        >
                          <UploadResultCard title="Upload result" result={uploadResult} emptyState="The latest duplicate detection result will appear here after you submit a face image." />
                          <InsightsPanel result={uploadResult} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Panel>
            ) : null}

            {activeTab === 'verify' ? (
              <Panel id="verify">
                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="surface-card p-6">
                    <p className="section-label">Verify</p>
                    <h2 className="mt-4 text-2xl font-semibold text-slate-950">Compare against stored identities</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">Run the existing verification request flow in a clearer operator workspace.</p>

                    <div className="mt-6">
                      <ImageUploader onCapture={(file) => setVerifyImage(file)} label="Verify Face" helper="Optional verification" />
                    </div>

                    <button type="button" onClick={handleVerify} disabled={busy === 'verify'} className="btn-primary mt-6 w-full">
                      <Fingerprint />
                      {busy === 'verify' ? 'Verifying...' : 'Verify'}
                    </button>

                    {verifyError ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{verifyError}</div> : null}
                  </div>

                  <AnimatePresence mode="wait">
                    {busy === 'verify' ? (
                      <ProcessingPanel key="verify-processing" title="AI verification" message={processingMessage} />
                    ) : (
                      <motion.div
                        key="verify-results"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <UploadResultCard title="Verification result" result={verifyResult} emptyState="Verification output will appear here after you submit a candidate face image." />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Panel>
            ) : null}

            {activeTab === 'insights' ? (
              <Panel id="insights">
                <div className="grid gap-4 lg:grid-cols-3">
                  {insights.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.div key={item.label} whileHover={{ y: -3 }} className="surface-card p-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                          <div className="rounded-2xl bg-slate-50 p-2 text-slate-700">
                            <Icon className="h-4 w-4" />
                          </div>
                        </div>
                        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{item.value}</h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
                      </motion.div>
                    );
                  })}
                </div>
                <MultiCompare />
              </Panel>
            ) : null}

            {activeTab === 'history' ? (
              <Panel id="history">
                <HistoryPanel items={uploadHistory} onClear={clearUploadHistory} />
              </Panel>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
