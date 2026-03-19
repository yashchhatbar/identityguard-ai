import { motion } from 'framer-motion';
import { Grid2X2, ImagePlus, RefreshCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

async function buildVectorFromFile(file) {
  const src = await fileToDataUrl(file);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const size = 16;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Canvas is not available in this browser.'));
        return;
      }

      context.drawImage(image, 0, 0, size, size);
      const pixels = context.getImageData(0, 0, size, size).data;
      const vector = [];

      for (let index = 0; index < pixels.length; index += 4) {
        const grayscale =
          (pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114) / 255;
        vector.push(grayscale);
      }

      const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
      resolve({
        preview: src,
        vector: vector.map((value) => value / magnitude),
      });
    };
    image.onerror = () => reject(new Error('Could not process one of the selected images.'));
    image.src = src;
  });
}

function cosineSimilarity(a, b) {
  let total = 0;
  for (let index = 0; index < a.length; index += 1) {
    total += a[index] * b[index];
  }
  return Math.max(0, Math.min(1, total));
}

function getTone(score) {
  if (score >= 0.8) {
    return 'bg-emerald-100 text-emerald-800';
  }
  if (score >= 0.5) {
    return 'bg-amber-100 text-amber-800';
  }
  return 'bg-slate-100 text-slate-700';
}

export default function MultiCompare() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(event) {
    const files = Array.from(event.target.files || []).slice(0, 6);
    if (!files.length) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const processed = await Promise.all(
        files.map(async (file) => {
          const derived = await buildVectorFromFile(file);
          return {
            id: `${file.name}-${file.lastModified}`,
            name: file.name,
            preview: derived.preview,
            vector: derived.vector,
          };
        })
      );
      setItems(processed);
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : 'Failed to compare images.');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  }

  function reset() {
    setItems([]);
    setError('');
  }

  const matrix = useMemo(() => {
    return items.map((itemA) =>
      items.map((itemB) => cosineSimilarity(itemA.vector, itemB.vector))
    );
  }, [items]);

  return (
    <div className="surface-card p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="section-label">Multi-image compare</p>
          <h3 className="mt-4 text-2xl font-semibold text-slate-950">Upload multiple faces and compare all pairs</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            This client-side explorer computes a lightweight similarity matrix so users can inspect how close multiple uploaded images appear to one another.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="btn-primary cursor-pointer">
            <ImagePlus className="h-4 w-4" />
            Add images
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          </label>
          <button type="button" onClick={reset} className="btn-secondary" disabled={!items.length && !error}>
            <RefreshCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm font-medium text-slate-600">
          Building similarity matrix...
        </div>
      ) : null}

      {!loading && items.length ? (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
                  <img src={item.preview} alt={item.name} className="aspect-square w-full object-cover" />
                </div>
                <p className="mt-3 truncate text-sm font-semibold text-slate-950">{item.name}</p>
              </motion.div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[160px_repeat(var(--count),minmax(120px,1fr))]" style={{ '--count': items.length }}>
                <div className="border-b border-r border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                  Similarity
                </div>
                {items.map((item) => (
                  <div key={`head-${item.id}`} className="border-b border-r border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900">
                    {item.name}
                  </div>
                ))}

                {items.map((rowItem, rowIndex) => (
                  <>
                    <div key={`row-${rowItem.id}`} className="border-b border-r border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900">
                      {rowItem.name}
                    </div>
                    {matrix[rowIndex].map((score, columnIndex) => (
                      <div key={`${rowItem.id}-${items[columnIndex].id}`} className="border-b border-r border-slate-200 p-4">
                        <div className={`inline-flex rounded-2xl px-3 py-2 text-sm font-semibold ${getTone(score)}`}>
                          {(score * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && !items.length && !error ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Grid2X2 className="h-5 w-5 text-slate-700" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-900">No comparison loaded yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Add between 2 and 6 images to explore pairwise similarity and visual clustering.
          </p>
        </div>
      ) : null}
    </div>
  );
}
