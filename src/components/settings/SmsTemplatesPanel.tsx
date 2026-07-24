'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Save } from 'lucide-react';
import { toast } from 'sonner';
import { settingsApi } from '@/lib/api/services';
import {
  listTemplateSummaries,
  loadLocalTemplates,
  mergeTemplateVars,
  sampleVariablesFor,
} from '@/lib/settings/templatesCatalog';

const inputClass =
  'w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8a65]/30';

type Summary = ReturnType<typeof listTemplateSummaries>[number];

type Props = {
  initialTemplates?: Array<Record<string, unknown>>;
};

export default function SmsTemplatesPanel({ initialTemplates = [] }: Props) {
  const [templates, setTemplates] = useState<Summary[]>(() => {
    const source = initialTemplates.length
      ? (initialTemplates as Summary[])
      : listTemplateSummaries(loadLocalTemplates());
    return source.filter(t => t.sms_enabled_default !== false || ['booking_confirmed', 'inspection_assigned', 'report_ready', 'login_otp'].includes(String(t.slug)));
  });
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [textBody, setTextBody] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialTemplates.length) return;
    const source = initialTemplates as Summary[];
    setTemplates(
      source.filter(
        t =>
          t.sms_enabled_default === true ||
          ['booking_confirmed', 'inspection_assigned', 'report_ready', 'login_otp', 'password_reset'].includes(String(t.slug))
      )
    );
  }, [initialTemplates]);

  const smsTemplates = useMemo(() => {
    if (templates.length) return templates;
    return listTemplateSummaries(loadLocalTemplates()).filter(t => t.sms_enabled_default);
  }, [templates]);

  const open = async (slug: string) => {
    setActiveSlug(slug);
    try {
      const t = await settingsApi.getTemplate(slug);
      const vars = Array.isArray(t.variables) ? (t.variables as string[]) : [];
      const body = String(t.text_body ?? '');
      setTextBody(body);
      setVariables(vars);
      setPreview(mergeTemplateVars(body, sampleVariablesFor({ variables: vars })));
    } catch {
      const local = loadLocalTemplates().find(x => x.slug === slug);
      if (!local) {
        toast.error('Could not load SMS template');
        return;
      }
      setTextBody(local.text_body);
      setVariables(local.variables);
      setPreview(mergeTemplateVars(local.text_body, sampleVariablesFor(local)));
    }
  };

  useEffect(() => {
    if (!activeSlug && smsTemplates.length) void open(String(smsTemplates[0].slug));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smsTemplates.length]);

  useEffect(() => {
    setPreview(mergeTemplateVars(textBody, sampleVariablesFor({ variables })));
  }, [textBody, variables]);

  const save = async () => {
    if (!activeSlug) return;
    setSaving(true);
    try {
      await settingsApi.updateTemplate(activeSlug, { text_body: textBody });
      toast.success('SMS template saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-heading font-semibold text-[#1F2937] flex items-center gap-2">
            <MessageSquare size={18} className="text-[#ff5722]" />
            SMS templates
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Plain-text messages (max ~320 chars recommended). These use the same events as email — enable SMS per event under
            Notifications.
          </p>
        </div>
        <span className="text-xs font-semibold text-[#6B7280] bg-[#F4F6F8] border border-[#E5E7EB] px-2.5 py-1 rounded-full">
          {smsTemplates.length} messages
        </span>
      </div>

      {smsTemplates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E5E7EB] px-4 py-10 text-center text-sm text-[#6B7280]">
          No SMS templates available. Open Email Templates first to seed the catalog.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 space-y-2">
            {smsTemplates.map(t => (
              <button
                key={String(t.slug)}
                type="button"
                onClick={() => void open(String(t.slug))}
                className={`w-full text-left p-3 rounded-lg border ${
                  activeSlug === t.slug ? 'border-[#ff5722] bg-orange-50' : 'border-[#E5E7EB] hover:bg-[#F9FAFB]'
                }`}
              >
                <p className="text-sm font-semibold text-[#1F2937]">{String(t.name)}</p>
                <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{String(t.description || '')}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 space-y-3">
            {activeSlug ? (
              <>
                <div>
                  <p className="text-xs font-semibold mb-1.5">Insert variable</p>
                  <div className="flex flex-wrap gap-1.5">
                    {variables.map(v => (
                      <button
                        key={v}
                        type="button"
                        className="text-[11px] px-2.5 py-1 rounded-full bg-[#F4F6F8] border border-[#E5E7EB] font-mono"
                        onClick={() => setTextBody(p => `${p}{{${v}}}`)}
                      >
                        {`{{${v}}}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5">Message body</label>
                  <textarea
                    className={`${inputClass} font-mono text-xs min-h-[120px]`}
                    value={textBody}
                    onChange={e => setTextBody(e.target.value)}
                    maxLength={480}
                  />
                  <div className="flex justify-between text-[11px] text-[#9CA3AF] mt-1">
                    <span>{textBody.length}/480</span>
                    <span className={textBody.length > 320 ? 'text-[#D35400]' : ''}>
                      SMS segment guide: keep under 320 characters
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Preview</p>
                  <div className="max-w-sm mx-auto">
                    <div className="bg-[#1E3A5F] text-white text-sm rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm whitespace-pre-wrap break-words">
                      {preview || '—'}
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] text-center mt-2">Sample values · Carschek sender</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void save()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ff5722] text-white text-sm font-semibold rounded-lg disabled:opacity-60"
                >
                  <Save size={15} />
                  {saving ? 'Saving…' : 'Save SMS template'}
                </button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
