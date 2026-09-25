import { useState, useEffect } from 'react';
import {
  Bell, BellOff, Phone, CheckCircle, AlertCircle,
  Save, MessageSquare, Shield, Clock, Settings as SettingsIcon, Loader2
} from 'lucide-react';
import { smartAlertService } from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Phone verification state
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [isChangingPhone, setIsChangingPhone] = useState(false);

  // Form fields (controlled)
  const [form, setForm] = useState({
    enabled: false,
    progressThreshold: 50,
    startTime: '19:00',
    endTime: '23:00',
    repeatIntervalMinutes: 60,
    maxAlertsPerDay: 4,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await smartAlertService.getSettings();
      const s = res.data;
      setSettings(s);
      setForm({
        enabled: s.enabled || false,
        progressThreshold: s.progressThreshold || 50,
        startTime: s.startTime || '19:00',
        endTime: s.endTime || '23:00',
        repeatIntervalMinutes: s.repeatIntervalMinutes || 60,
        maxAlertsPerDay: s.maxAlertsPerDay || 4,
      });
    } catch (err) {
      showMessage('Failed to load settings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await smartAlertService.updateSettings(form);
      setSettings(res.data);
      showMessage('Settings saved successfully.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save settings.';
      showMessage(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async () => {
    // UI debug logs
    console.log('[PHASE12 UI] Alerts toggle clicked');
    console.log('[PHASE12 UI] Current enabled:', form.enabled);
    try {
      setSaving(true);
      const newEnabled = !form.enabled;
      console.log('[PHASE12 UI] New enabled:', newEnabled);

      // Optimistic UI update
      setForm(f => ({ ...f, enabled: newEnabled }));

      // Request must include the existing settings
      const payload = { ...form, enabled: newEnabled };
      const res = await smartAlertService.updateSettings(payload);
      console.log('[PHASE12 API] PUT /api/smart-alerts/settings', res.status);
      setSettings(res.data);
      showMessage('Settings updated.', 'success');
    } catch (err) {
      console.error('[PHASE12 API ERROR] PUT request failed', err);
      // Revert UI on failure
      setForm(f => ({ ...f, enabled: !f.enabled }));
      const msg = err.response?.data?.message || 'Failed to update settings.';
      showMessage(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestOtp = async () => {
    try {
      setPhoneLoading(true);
      const res = await smartAlertService.requestVerification(phoneInput);
      setOtpRequested(true);
      showMessage(res.data.message, 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP.';
      showMessage(msg, 'error');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setPhoneLoading(true);
      const res = await smartAlertService.verifyPhone(otpInput);
      showMessage(res.data.message, 'success');
      setOtpRequested(false);
      setOtpInput('');
      setPhoneInput('');
      setIsChangingPhone(false);
      await loadSettings();
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed.';
      showMessage(msg, 'error');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleTestSms = async () => {
    console.log('[PHASE12 TEST SMS NEW CLICK]');
    console.log('[PHASE12 TEST SMS REQUEST]');
    console.log('POST /api/smart-alerts/test');
    try {
      setSaving(true);
      const res = await smartAlertService.sendTestSms();
      console.log('[PHASE12 TEST SMS RESPONSE]');
      console.log('Status:', res.status);
      console.log('Response:', res.data);
      showMessage(res.data.message || 'Test SMS sent successfully', 'success');
    } catch (err) {
      console.error('[PHASE12 TEST SMS ERROR]');
      console.error('Status:', err.response?.status);
      console.error('Response:', err.response?.data);
      console.error('Message:', err.message);
      const msg = err.response?.data?.message || 'Test SMS failed.';
      showMessage(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  const isVerified = settings?.mobileVerified;
  const isSmsConfigured = settings?.smsConfigured;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your productivity preferences</p>
        </div>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-md flex items-start gap-2 ${
          message.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {message.type === 'error'
            ? <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            : <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Smart Accountability Alerts Section */}
      <div className="card p-6 border border-border shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Smart Accountability Alerts</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Receive SMS reminders when your daily progress is below your target during the evening hours.
        </p>

        {/* SMS Provider Status */}
        {!isSmsConfigured && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-700">
              SMS service is not configured yet. Alerts will be logged to the server console in development mode.
              Configure Twilio credentials in the backend to enable real SMS.
            </p>
          </div>
        )}

        {/* Mobile Number */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            <Phone className="inline h-4 w-4 mr-1" />
            Mobile Number
          </label>

          {isVerified && !isChangingPhone ? (
            <div className="flex items-center gap-3">
              <span className="text-foreground font-mono bg-secondary px-3 py-2 rounded-md text-sm">
                {settings.mobileNumberMasked}
              </span>
              <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                <CheckCircle className="h-4 w-4" /> Verified
              </span>
              <button
                type="button"
                className="text-xs text-muted-foreground underline hover:text-foreground"
                onClick={() => { setOtpRequested(false); setPhoneInput(''); setOtpInput(''); setIsChangingPhone(true); }}
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  placeholder="+919876543210"
                  className="flex-1 min-w-[180px] px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={phoneLoading || !phoneInput}
                  className="btn btn-primary text-sm px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {phoneLoading && !otpRequested ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {otpRequested ? 'Resend OTP' : 'Request OTP'}
                </button>
                {isChangingPhone && (
                  <button
                    type="button"
                    onClick={() => { setIsChangingPhone(false); setOtpRequested(false); setPhoneInput(''); setOtpInput(''); }}
                    className="btn text-sm px-4 border border-border bg-background text-foreground hover:bg-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Format: +CountryCodeNumber e.g. +919876543210</p>

              {otpRequested && (
                <div className="space-y-2">
                  <p className="text-xs text-green-700 font-medium">OTP sent — check the server console (development mode).</p>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={otpInput}
                      onChange={e => setOtpInput(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="w-40 px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={phoneLoading || otpInput.length !== 6}
                      className="btn btn-primary text-sm px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {phoneLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
                      Verify
                    </button>
                  </div>
                </div>
              )}

              {!isVerified && !isChangingPhone && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Add and verify a mobile number to enable SMS alerts.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <hr className="border-border mb-6" />

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Progress Threshold */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Alert when progress is below
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={100}
                value={form.progressThreshold}
                onChange={e => setForm(f => ({ ...f, progressThreshold: Number(e.target.value) }))}
                className="w-24 px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          {/* Repeat Interval */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              <Clock className="inline h-3 w-3 mr-1" />Repeat every
            </label>
            <select
              value={form.repeatIntervalMinutes}
              onChange={e => setForm(f => ({ ...f, repeatIntervalMinutes: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Start alerts at</label>
            <input
              type="time"
              value={form.startTime}
              onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Stop alerts at</label>
            <input
              type="time"
              value={form.endTime}
              onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          {/* Max Alerts */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Maximum alerts per day</label>
            <select
              value={form.maxAlertsPerDay}
              onChange={e => setForm(f => ({ ...f, maxAlertsPerDay: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              {[1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} alert{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Alert Status */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleToggleEnabled}
              disabled={!isVerified || saving}
              className={`w-full px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                form.enabled && isVerified
                  ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {form.enabled && isVerified
                ? <><Bell className="h-4 w-4" /> Alerts ON</>
                : <><BellOff className="h-4 w-4" /> Alerts OFF</>}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>

          <button
            type="button"
            onClick={handleTestSms}
            disabled={saving || !isVerified}
            title={!isVerified ? 'Verify your mobile number first' : 'Send a test SMS to your verified number'}
            className="btn flex items-center gap-2 border border-border bg-background hover:bg-secondary text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare className="h-4 w-4" />
            Send Test SMS
          </button>
        </div>

        {!isSmsConfigured && (
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Development mode: SMS alerts are logged to server console instead of being sent.
          </p>
        )}
      </div>

      {/* Info card */}
      <div className="mt-4 p-4 bg-muted/30 rounded-md border border-border">
        <p className="text-xs text-muted-foreground">
          <strong>How it works:</strong> The system checks your progress during your configured window.
          If your daily consistency is below the threshold and meaningful work remains,
          an SMS is sent to your verified number. Alerts stop automatically when you complete your work or reach your target.
        </p>
      </div>
    </div>
  );
}
