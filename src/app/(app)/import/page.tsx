'use client';

// ═══════════════════════════════════════════════════════
// CSV Import Page
// ═══════════════════════════════════════════════════════

import { useState, useRef, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Info,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { parseLinkedInCSV, detectChanges, type ParsedContact } from '@/lib/csv-parser';
import type { ImportResult, ImportError } from '@/lib/types';

type ImportStage = 'upload' | 'parsing' | 'importing' | 'complete' | 'error';

export default function ImportPage() {
  const [stage, setStage] = useState<ImportStage>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [, setParsedContacts] = useState<ParsedContact[]>([]);
  const [parseErrors, setParseErrors] = useState<ImportError[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Please upload a CSV file');
      setStage('error');
      return;
    }

    setFileName(file.name);
    setStage('parsing');

    try {
      const { contacts, errors } = await parseLinkedInCSV(file);
      setParsedContacts(contacts);
      setParseErrors(errors);

      if (contacts.length === 0) {
        setErrorMessage('No valid contacts found in the CSV. Make sure it\'s a LinkedIn connections export.');
        setStage('error');
        return;
      }

      // Proceed to import
      await importContacts(contacts);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to parse CSV');
      setStage('error');
    }
  };

  const importContacts = async (contacts: ParsedContact[]) => {
    setStage('importing');
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Load existing contacts for dedup
      const { data: existing } = await supabase
        .from('contacts')
        .select('id, full_name, company, title, linkedin_url')
        .eq('user_id', user.id);

      interface ExistingContact {
        id: string;
        full_name: string;
        company: string | null;
        title: string | null;
        linkedin_url: string | null;
      }

      const existingMap = new Map<string, ExistingContact>();
      (existing as ExistingContact[] | null)?.forEach(c => {
        // Key by linkedin_url if available, otherwise by full_name+company
        const key = c.linkedin_url || `${c.full_name}||${c.company || ''}`;
        existingMap.set(key.toLowerCase(), c);
      });

      const result: ImportResult = { total: contacts.length, created: 0, updated: 0, unchanged: 0, errors: [] };
      const batchSize = 50;

      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize);
        const toInsert: Record<string, unknown>[] = [];
        const toUpdate: { id: string; data: Record<string, unknown> }[] = [];

        for (const contact of batch) {
          const key = contact.linkedin_url
            ? contact.linkedin_url.toLowerCase()
            : `${contact.full_name}||${contact.company || ''}`.toLowerCase();

          const existingContact = existingMap.get(key);

          if (existingContact) {
            // Check for changes
            const { changed } = detectChanges(
              existingContact as { full_name: string; company: string; title: string },
              contact
            );

            if (changed) {
              toUpdate.push({
                id: existingContact.id,
                data: {
                  company: contact.company || existingContact.company,
                  title: contact.title || existingContact.title,
                  previous_company: existingContact.company,
                  previous_title: existingContact.title,
                  last_bulk_synced_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              });
              result.updated++;
            } else {
              result.unchanged++;
            }
          } else {
            toInsert.push({
              user_id: user.id,
              full_name: contact.full_name,
              email: contact.email,
              company: contact.company,
              title: contact.title,
              linkedin_url: contact.linkedin_url,
              source: 'linkedin',
              relationship_tier: 'warm', // Default new imports to 'warm'
              last_bulk_synced_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            result.created++;
          }
        }

        // Batch insert
        if (toInsert.length > 0) {
          const { error } = await supabase.from('contacts').insert(toInsert);
          if (error) {
            result.errors.push({
              row: i,
              name: `Batch ${Math.floor(i / batchSize) + 1}`,
              message: error.message,
            });
          }
        }

        // Batch update
        for (const { id, data } of toUpdate) {
          const { error } = await supabase.from('contacts').update(data).eq('id', id);
          if (error) {
            result.errors.push({ row: i, name: id, message: error.message });
          }
        }

        setProgress(Math.round(((i + batch.length) / contacts.length) * 100));
      }

      setImportResult(result);
      setStage('complete');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Import failed');
      setStage('error');
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setStage('upload');
    setFileName('');
    setParsedContacts([]);
    setParseErrors([]);
    setImportResult(null);
    setErrorMessage('');
    setProgress(0);
  };

  return (
    <div className="page-container">
      <div className="page-header animate-fade-in">
        <h1>Import Connections</h1>
        <p>Upload your LinkedIn connections CSV to populate your contact database</p>
      </div>

      {/* Instructions */}
      <div className="card animate-fade-in-up" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Info size={20} style={{ color: 'var(--np-accent)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.9375rem' }}>How to export from LinkedIn</p>
            <ol style={{ color: 'var(--np-text-secondary)', fontSize: '0.875rem', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Go to <strong>LinkedIn Settings → Data Privacy</strong></li>
              <li>Click <strong>&quot;Get a copy of your data&quot;</strong></li>
              <li>Select <strong>Connections</strong> and request the archive</li>
              <li>Download the CSV when ready and upload it here</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Upload Stage */}
      {stage === 'upload' && (
        <div
          className={`drop-zone animate-fade-in-up ${dragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <div className="drop-icon">
            <Upload size={24} />
          </div>
          <h3>Drop your LinkedIn CSV here</h3>
          <p>or click to browse • Supports LinkedIn&apos;s Connections.csv format</p>
        </div>
      )}

      {/* Parsing / Importing Stage */}
      {(stage === 'parsing' || stage === 'importing') && (
        <div className="card animate-scale-in">
          <div className="card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <RefreshCw
              size={32}
              style={{
                color: 'var(--np-accent)',
                animation: 'spin 1s linear infinite',
                marginBottom: 16,
              }}
            />
            <h3 style={{ fontWeight: 600, marginBottom: 4 }}>
              {stage === 'parsing' ? 'Parsing CSV...' : 'Importing contacts...'}
            </h3>
            <p style={{ color: 'var(--np-text-secondary)', fontSize: '0.875rem' }}>
              {fileName}
            </p>
            {stage === 'importing' && (
              <div style={{ marginTop: 20, maxWidth: 400, margin: '20px auto 0' }}>
                <div style={{
                  height: 6,
                  background: 'var(--np-bg-tertiary)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'var(--np-accent)',
                    borderRadius: 3,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--np-text-tertiary)', marginTop: 8 }}>
                  {progress}% complete
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complete Stage */}
      {stage === 'complete' && importResult && (
        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
              <CheckCircle2 size={48} style={{ color: 'var(--np-success)', marginBottom: 16 }} />
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: 8 }}>
                Import Complete!
              </h3>
              <p style={{ color: 'var(--np-text-secondary)', marginBottom: 24 }}>
                Processed {importResult.total} contacts from {fileName}
              </p>

              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 12,
                maxWidth: 500,
                margin: '0 auto 28px',
              }}>
                <div className="card" style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--np-success)' }}>
                    {importResult.created}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--np-text-secondary)' }}>
                    New
                  </div>
                </div>
                <div className="card" style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--np-accent)' }}>
                    {importResult.updated}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--np-text-secondary)' }}>
                    Updated
                  </div>
                </div>
                <div className="card" style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--np-text-tertiary)' }}>
                    {importResult.unchanged}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--np-text-secondary)' }}>
                    Unchanged
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => router.push('/')} className="btn btn-primary">
                  View Digest <ArrowRight size={16} />
                </button>
                <button onClick={reset} className="btn btn-secondary">
                  Import Another
                </button>
              </div>
            </div>
          </div>

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <div className="card">
              <div className="card-body">
                <h4 style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--np-warning)' }}>
                  <AlertTriangle size={16} />
                  {parseErrors.length} rows had issues
                </h4>
                <div style={{ maxHeight: 200, overflow: 'auto', fontSize: '0.8125rem' }}>
                  {parseErrors.slice(0, 20).map((error, i) => (
                    <div key={i} style={{
                      padding: '8px 0',
                      borderBottom: '1px solid var(--np-border-light)',
                      color: 'var(--np-text-secondary)',
                    }}>
                      <strong>Row {error.row}</strong> ({error.name}): {error.message}
                    </div>
                  ))}
                  {parseErrors.length > 20 && (
                    <p style={{ marginTop: 8, color: 'var(--np-text-tertiary)' }}>
                      ...and {parseErrors.length - 20} more
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Stage */}
      {stage === 'error' && (
        <div className="card animate-scale-in">
          <div className="card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <XCircle size={48} style={{ color: 'var(--np-danger)', marginBottom: 16 }} />
            <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Import Failed</h3>
            <p style={{ color: 'var(--np-text-secondary)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
              {errorMessage}
            </p>
            <button onClick={reset} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
