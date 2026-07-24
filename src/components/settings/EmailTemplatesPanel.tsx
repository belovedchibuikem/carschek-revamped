'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Mail, Eye, Save, RefreshCw, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { settingsApi } from '@/lib/api/services';
import {
  listTemplateSummaries,
  loadLocalTemplates,
  mergeTemplateVars,
  sampleVariablesFor,
} from '@/lib/settings/templatesCatalog';

const EmailHtmlEditor = dynamic(() => import('@/components/settings/EmailHtmlEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-[#E5E7EB] rounded-lg min-h-[280px] bg-white px-3 py-2 text-sm text-[#9CA3AF]">
      Loading editor…
    </div>
  ),
});

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30';

type Summary = ReturnType<typeof listTemplateSummaries>[number];

type Props = {
  initialTemplates?: Array<Record<string, unknown>>;
};

export default function EmailTemplatesPanel({ initialTemplates = [] }: Props) {
  const [templates, setTemplates] = useState<Summary[]>(() =>
    initialTemplates.length
      ? (initialTemplates as Summary[])
      : listTemplateSummaries(loadLocalTemplates())
  );
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    subject: '',
    html_body: '',
    text_body: '',
    is_active: true,
    variables: [] as string[],
    name: '',
    description: '',
  });
  const [previewHtml, setPreviewHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTemplates.length) {
      setTemplates(initialTemplates as Summary[]);
    }
  }, [initialTemplates]);

  const active = useMemo(() => templates.find(t => t.slug === activeSlug) ?? null, [templates, activeSlug]);

  const openTemplate = async (slug: string) => {
    setActiveSlug(slug);
    try {
      const t = await settingsApi.getTemplate(slug);
      const variables = Array.isArray(t.variables) ? (t.variables as string[]) : [];
      setDraft({
        subject: String(t.subject ?? ''),
        html_body: String(t.html_body ?? ''),
        text_body: String(t.text_body ?? ''),
        is_active: t.is_active !== false,
        variables,
        name: String(t.name ?? slug),
        description: String(t.description ?? ''),
      });
      const samples = sampleVariablesFor({ variables });
      setPreviewVars(samples);
      try {
        const preview = await settingsApi.previewTemplate(slug, samples);
        setPreviewHtml(preview.html || mergeTemplateVars(String(t.html_body ?? ''), samples));
      } catch {
        setPreviewHtml(mergeTemplateVars(String(t.html_body ?? ''), samples));
      }
    } catch (e) {
      // Local catalog fallback
      const local = loadLocalTemplates().find(x => x.slug === slug);
      if (!local) {
        toast.error(e instanceof Error ? e.message : 'Could not load template');
        return;
      }
      setDraft({
        subject: local.subject,
        html_body: local.html_body,
        text_body: local.text_body,
        is_active: local.is_active,
        variables: local.variables,
        name: local.name,
        description: local.description,
      });
      const samples = sampleVariablesFor(local);
      setPreviewVars(samples);
      setPreviewHtml(mergeTemplateVars(local.html_body, samples));
    }
  };

  const refreshPreview = async () => {
    if (!activeSlug) return;
    try {
      const preview = await settingsApi.previewTemplate(activeSlug, previewVars);
      setPreviewHtml(preview.html || mergeTemplateVars(draft.html_body, previewVars));
    } catch {
      setPreviewHtml(mergeTemplateVars(draft.html_body, previewVars));
    }
  };

  const save = async () => {
    if (!activeSlug) return;
    setSaving(true);
    try {
      await settingsApi.updateTemplate(activeSlug, {
        subject: draft.subject,
        html_body: draft.html_body,
        text_body: draft.text_body,
        is_active: draft.is_active,
      });
      setTemplates(prev =>
        prev.map(t =>
          t.slug === activeSlug
            ? { ...t, subject: draft.subject, is_active: draft.is_active, updated_at: new Date().toISOString() }
            : t
        )
      );
      toast.success('Email template saved');
      await refreshPreview();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!activeSlug && templates.length) {
      void openTemplate(String(templates[0].slug));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates.length]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-heading font-semibold text-[#1F2937] flex items-center gap-2">
              <Mail size={18} className="text-[#ff5722]" />
              Email templates
            </h2>
            <p className="text-sm text-[#6B7280] mt-1">
              Transactional emails sent for OTP, bookings, assignments, and reports. Use{' '}
              <code className="text-[11px] bg-[#F4F6F8] px-1 rounded">{'{{variable}}'}</code> placeholders.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#6B7280] bg-[#F4F6F8] border border-[#E5E7EB] px-2.5 py-1 rounded-full">
            {templates.length} templates
          </span>
        </div>

        {templates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#E5E7EB] px-4 py-10 text-center">
            <p className="text-sm font-medium text-[#1F2937]">No email templates loaded</p>
            <p className="text-xs text-[#6B7280] mt-1 mb-3">Load the built-in Carschek catalog to get started.</p>
            <button
              type="button"
              onClick={() => {
                const local = listTemplateSummaries(loadLocalTemplates());
                setTemplates(local);
                void openTemplate(local[0].slug);
              }}
              className="px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg"
            >
              Load default templates
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4 space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {templates.map(t => {
                const selected = activeSlug === t.slug;
                return (
                  <button
                    key={String(t.slug)}
                    type="button"
                    onClick={() => void openTemplate(String(t.slug))}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selected ? 'border-[#ff5722] bg-orange-50' : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1F2937]">{String(t.name)}</p>
                      {t.is_active !== false ? (
                        <CheckCircle2 size={14} className="text-[#1A7A4A] shrink-0 mt-0.5" />
                      ) : (
                        <Circle size={14} className="text-[#9CA3AF] shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{String(t.description || t.subject)}</p>
                    <p className="text-[10px] font-mono text-[#9CA3AF] mt-1.5">{String(t.slug)}</p>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-8 space-y-4">
              {active ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1F2937]">{draft.name || active.name}</h3>
                      <p className="text-xs text-[#6B7280]">{draft.description || String(active.description || '')}</p>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#374151]">
                      <input
                        type="checkbox"
                        checked={draft.is_active}
                        onChange={e => setDraft(p => ({ ...p, is_active: e.target.checked }))}
                      />
                      Active
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Subject line</label>
                    <input
                      className={inputClass}
                      value={draft.subject}
                      onChange={e => setDraft(p => ({ ...p, subject: e.target.value }))}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold mb-1.5">Insert variable</p>
                    <div className="flex flex-wrap gap-1.5">
                      {draft.variables.map(v => (
                        <button
                          key={v}
                          type="button"
                          className="text-[11px] px-2.5 py-1 rounded-full bg-[#F4F6F8] border border-[#E5E7EB] font-mono hover:border-[#ff5722]"
                          onClick={() =>
                            setDraft(p => ({
                              ...p,
                              html_body: `${p.html_body}<span>{{${v}}}</span>`,
                            }))
                          }
                        >
                          {`{{${v}}}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold mb-1.5">HTML body</p>
                      <EmailHtmlEditor
                        value={draft.html_body}
                        onChange={html => setDraft(p => ({ ...p, html_body: html }))}
                      />
                    </div>
                    <div className="border border-[#E5E7EB] rounded-lg overflow-hidden bg-[#F9FAFB] flex flex-col min-h-[280px]">
                      <div className="px-3 py-2 text-xs font-semibold border-b border-[#E5E7EB] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Eye size={12} /> Live preview
                        </span>
                        <button
                          type="button"
                          onClick={() => void refreshPreview()}
                          className="text-[#ff5722] font-semibold inline-flex items-center gap-1"
                        >
                          <RefreshCw size={12} /> Refresh
                        </button>
                      </div>
                      <iframe title="email-preview" className="w-full flex-1 min-h-[240px] bg-white" srcDoc={previewHtml} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Plain-text / SMS body
                      <span className="font-normal text-[#6B7280]"> — also used when SMS is enabled for this event</span>
                    </label>
                    <textarea
                      className={`${inputClass} font-mono text-xs min-h-[88px]`}
                      value={draft.text_body}
                      onChange={e => setDraft(p => ({ ...p, text_body: e.target.value }))}
                      maxLength={480}
                    />
                    <p className="text-[11px] text-[#9CA3AF] mt-1">{draft.text_body.length}/480 characters</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void save()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg disabled:opacity-60"
                    >
                      <Save size={15} />
                      {saving ? 'Saving…' : 'Save template'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-[#E5E7EB] px-4 py-12 text-center text-sm text-[#6B7280]">
                  Select a template to edit
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
