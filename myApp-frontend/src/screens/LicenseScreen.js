import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Linking,
  Modal,
  Platform,
  useWindowDimensions,
  RefreshControl,
  KeyboardAvoidingView,
  
} from 'react-native';
import secureStorage from '../utils/secureStorage';
import { licenseClient } from '../api/licenseClient';
import { useAuth } from '../context/AuthContext';

export default function LicenseScreen() {
  const [licenseKey, setLicenseKey] = useState('');
  const [status, setStatus] = useState(null);
  const [token, setToken] = useState(null);
  const [introspect, setIntrospect] = useState(null);

  const [validating, setValidating] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [introspecting, setIntrospecting] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [assignSeatsModalVisible, setAssignSeatsModalVisible] = useState(false);
  const [seatsToAssign, setSeatsToAssign] = useState(1);
  const [licenseRevealed, setLicenseRevealed] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const [checkoutPolling, setCheckoutPolling] = useState(false);
  const [pollingMessage, setPollingMessage] = useState('');
  const [purchaseSession, setPurchaseSession] = useState(null);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [pollCanceled, setPollCanceled] = useState(false);

  const [accountPlan, setAccountPlan] = useState({
    name: 'Free',
    status: 'Active',
    seats: 1,
    seatsUsed: 1,
    memberSince: null,
    lastSync: null,
    licenseKey: null,
  });

  const [invoices] = useState([]);

  const { width } = useWindowDimensions();
  
  const isWide = width >= 900;

  const { user, token: authToken } = useAuth();

  const validateCounter = useRef(0);
  const refreshingRef = useRef(false);

  const PLANS = useMemo(() => [
    { id: 'free', title: 'Free', price: 0, seats: 1, features: ['Basic Feed', 'Storefront'] },
    { id: 'pro', title: 'Pro', price: 29.99, seats: 5, features: ['Analytics', 'API Access', 'Team Seats'] },
    { id: 'enterprise', title: 'Enterprise', price: 199.99, seats: 'Unlimited', features: ['SSO', 'White Label', 'Dedicated Support'] },
  ], []);

  useEffect(() => {
    (async () => {
      const saved = await secureStorage.getItem('license_token');
      if (saved) setToken(saved);
    })();
  }, []);

  useEffect(() => {
    if (!authToken) return;
    (async () => {
      try {
        const res = await licenseClient.getMyLicense();
        const data = res?.data || res;
        if (data) {
          setAccountPlan((s) => ({
            ...s,
            name: (data.plan || data.meta?.plan || s.name).toString(),
            status: data.revoked ? 'Revoked' : 'Active',
            seats: data.seats || data.seats_count || s.seats,
            seatsUsed: data.used_seats || data.used || s.seatsUsed,
            memberSince: data.created_at || s.memberSince,
            lastSync: Date.now(),
            licenseKey: data.key || data.license_key || data.sub || s.licenseKey,
          }));
          setSeatsToAssign(data.seats || data.seats_count || 1);
        }
      } catch (_e) {}
    })();
  }, [authToken]);

  useEffect(() => {
    if (!toastVisible) return;
    const t = setTimeout(() => setToastVisible(false), 2500);
    return () => clearTimeout(t);
  }, [toastVisible]);

  const maskKey = (k) => {
    if (!k) return '—';
    if (k.length <= 10) return k.replace(/.(?=.{4})/g, '•');
    const first = k.slice(0, 6);
    const last = k.slice(-4);
    return `${first}…${last}`;
  };

  const getStatusColor = (s, expTs) => {
    const st = (s || '').toLowerCase();
    if (st === 'revoked') return '#6b7280';
    if (st === 'active') {
      if (expTs) {
        const days = Math.ceil((expTs * 1000 - Date.now()) / (24 * 3600 * 1000));
        if (days <= 0) return '#e11d48';
        if (days <= 14) return '#f59e0b';
      }
      return '#10b981';
    }
    return '#6b7280';
  };

  useEffect(() => {
    if (!licenseKey?.trim()) { setStatus(null); return; }
    const id = ++validateCounter.current;
    const timeout = setTimeout(async () => {
      setValidating(true);
      try {
        const res = await licenseClient.validate(licenseKey.trim());
        if (id === validateCounter.current) setStatus(res);
      } catch (_e) {
        if (id === validateCounter.current) setStatus(null);
      } finally {
        if (id === validateCounter.current) setValidating(false);
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [licenseKey]);

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    (async () => {
      setIntrospecting(true);
      try {
        const res = await licenseClient.introspect(token);
        if (mounted) setIntrospect(res);
      } catch (_e) {
        if (mounted) setIntrospect(null);
      } finally {
        if (mounted) setIntrospecting(false);
      }
    })();
    return () => { mounted = false; };
  }, [token]);

  const refreshAll = async () => {
    try {
      refreshingRef.current = true;
      if (authToken) {
        const me = await licenseClient.getMyLicense();
        const data = me?.data || me;
        if (data) setAccountPlan((s) => ({ ...s, lastSync: Date.now(), name: data.plan || s.name }));
      }
      if (licenseKey) {
        setValidating(true);
        const v = await licenseClient.validate(licenseKey.trim());
        setStatus(v);
        setValidating(false);
      }
      if (token) {
        setIntrospecting(true);
        const i = await licenseClient.introspect(token);
        setIntrospect(i);
        setIntrospecting(false);
      }
      setToastMessage('License data refreshed'); setToastVisible(true);
    } catch (_e) {
      setToastMessage('Refresh failed'); setToastVisible(true);
    } finally {
      refreshingRef.current = false;
    }
  };

  const handleValidate = async () => {
    if (!licenseKey.trim()) return setToastMessage('Enter a license key'), setToastVisible(true);
    setValidating(true);
    try {
      const res = await licenseClient.validate(licenseKey.trim());
      setStatus(res);
      setToastMessage('License validated'); setToastVisible(true);
    } catch (_err) {
      setToastMessage('Validation failed'); setToastVisible(true);
    } finally { setValidating(false); }
  };

  const handleGetToken = async () => {
    if (!licenseKey.trim()) return setToastMessage('Enter a license key'), setToastVisible(true);
    setTokenLoading(true);
    try {
      const res = await licenseClient.tokenWithLicense(licenseKey.trim(), 'mobile-app');
      const accessToken = res.access_token || res.token || res.data?.token || res;
      if (accessToken) {
        await secureStorage.setItem('license_token', accessToken);
        setToken(accessToken);
        setToastMessage('Token saved'); setToastVisible(true);
      } else {
        setToastMessage('No token returned'); setToastVisible(true);
      }
    } catch (_err) {
      setToastMessage('Token request failed'); setToastVisible(true);
    } finally { setTokenLoading(false); }
  };

  const handleIntrospect = async () => {
    const t = token || (await secureStorage.getItem('license_token'));
    if (!t) return setToastMessage('No token available'), setToastVisible(true);
    setIntrospecting(true);
    try {
      const res = await licenseClient.introspect(t);
      setIntrospect(res);
      setToastMessage('Token introspected'); setToastVisible(true);
    } catch (_err) {
      setToastMessage('Introspect failed'); setToastVisible(true);
    } finally { setIntrospecting(false); }
  };

  const handleClear = async () => {
    await secureStorage.removeItem('license_token');
    setToken(null); setIntrospect(null); setStatus(null);
    setToastMessage('Cleared'); setToastVisible(true);
  };

  const submitAssignSeats = async () => {
    if (!user || !authToken) return setToastMessage('Sign in required'), setToastVisible(true);
    const count = parseInt(seatsToAssign, 10);
    if (!count || count < 1) return setToastMessage('Enter a valid seats number'), setToastVisible(true);
    setAssigning(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ profile: { seats: count } }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || j.message || `HTTP ${res.status}`);
      setAccountPlan((s) => ({ ...s, seats: count }));
      setAssignSeatsModalVisible(false);
      setToastMessage('Seats updated'); setToastVisible(true);
    } catch (_err) {
      setToastMessage('Assign failed'); setToastVisible(true);
    } finally { setAssigning(false); }
  };

  const handlePurchase = async (planId) => {
    setPurchasing(true);
    try {
      const res = await licenseClient.purchasePlan(planId, { site: 'mobile-app' });
      if (res && res.redirect_url) {
        const session = { provider: res.provider, session_id: res.session_id || res.sessionId || res.id, id: res.id, redirect_url: res.redirect_url };
        setPurchaseSession(session); setCheckoutPolling(true); setPollingMessage('Opening checkout...');
        try { await Linking.openURL(session.redirect_url); } catch (_e) {}
        setPurchasing(false);
        const pollRes = await pollPurchaseComplete(session);
        setCheckoutPolling(false);
        if (pollRes) {
          const license_key = pollRes.license_key || pollRes.licenseKey || pollRes.key;
          const accessToken = pollRes.access_token || pollRes.token || pollRes.accessToken || pollRes.data?.token;
          if (license_key) setLicenseKey(license_key);
          if (accessToken) { await secureStorage.setItem('license_token', accessToken); setToken(accessToken); }
          if (license_key) { try { const s = await licenseClient.validate(license_key); setStatus(s); } catch (_e) {} }
          if (accessToken) { try { const i = await licenseClient.introspect(accessToken); setIntrospect(i); } catch (_e) {} }
          setShowLicenseModal(true); setToastMessage('Purchase complete'); setToastVisible(true);
          return;
        }
        setToastMessage('Activation pending'); setToastVisible(true);
        return;
      }
      const license_key = res.license_key || res.licenseKey || res.key;
      const accessToken = res.access_token || res.token || res.accessToken || res.data?.token;
      if (license_key) setLicenseKey(license_key);
      if (accessToken) { await secureStorage.setItem('license_token', accessToken); setToken(accessToken); }
      if (license_key) setShowLicenseModal(true);
      if (license_key) { try { const s = await licenseClient.validate(license_key); setStatus(s); } catch (_e) {} }
      if (accessToken) { try { const i = await licenseClient.introspect(accessToken); setIntrospect(i); } catch (_e) {} }
      setToastMessage('Purchase successful'); setToastVisible(true);
    } catch (_err) {
      setToastMessage('Purchase failed'); setToastVisible(true);
    } finally { setPurchasing(false); }
  };

  const copyLicenseToClipboard = async (keyArg) => {
    const key = keyArg || licenseKey || accountPlan.licenseKey;
    if (!key) return setToastMessage('No license to copy'), setToastVisible(true);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(key);
        setToastMessage('License key copied'); setToastVisible(true); return;
      }
      setToastMessage('Copy key: ' + maskKey(key)); setToastVisible(true);
      return;
    } catch (_err) { setToastMessage('Copy failed'); setToastVisible(true); return; }
  };

  const toggleReveal = () => setLicenseRevealed((v) => !v);

  const assignToAccount = async () => {
    if (!user || !authToken) return setToastMessage('Sign in required'), setToastVisible(true);
    if (!licenseKey) return setToastMessage('No license to assign'), setToastVisible(true);
    setAssigning(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/users/${user.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ profile: { licenseKey } }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
      setShowLicenseModal(false); setToastMessage('License assigned'); setToastVisible(true);
    } catch (_err) { setToastMessage('Assign failed'); setToastVisible(true); } finally { setAssigning(false); }
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const pollPurchaseComplete = async (session) => {
    const maxAttempts = 6; let attempt = 0; setPollCanceled(false);
    while (attempt < maxAttempts && !pollCanceled) {
      attempt += 1; setPollAttempts(attempt); setPollingMessage(`Checking purchase (attempt ${attempt}/${maxAttempts})`);
      try {
        const body = { provider: session?.provider, session_id: session?.session_id || session?.sessionId || session?.id, purchase_reference: session?.purchase_reference || session?.reference || session?.id };
        const res = await licenseClient.purchaseComplete(body);
        const license_key = res?.license_key || res?.licenseKey || res?.key;
        if (res && (license_key || res?.access_token || res?.success === true || res?.activated || res?.status === 'completed')) return res;
      } catch (_err) {}
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); await sleep(delay);
    }
    return null;
  };

  const cancelPolling = () => { setPollCanceled(true); setCheckoutPolling(false); setPollingMessage(''); setPurchaseSession(null); setPollAttempts(0); };

  const busy = validating || tokenLoading || introspecting || purchasing || assigning;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={false} onRefresh={refreshAll} />}>
        <Text style={styles.heading}>License & Subscription</Text>

        <View style={[styles.panels, isWide ? styles.panelsRow : null]}>
          {/* Left column */}
          <View style={[styles.column, isWide ? styles.columnHalf : null]}>
            <View style={styles.card} accessibilityRole="summary">
              <View style={styles.cardHeader}><Text style={styles.cardTitle}>Current Plan</Text>
                <View style={[styles.statusChip, { backgroundColor: getStatusColor(accountPlan.status) }]}><Text style={styles.statusChipText}>{accountPlan.status}</Text></View>
              </View>
              <Text style={styles.cardLine}>Plan: {accountPlan.name}</Text>
              <Text style={styles.cardLine}>Seats: {accountPlan.seatsUsed} / {accountPlan.seats}</Text>
              <Text style={styles.cardLine}>Member Since: {accountPlan.memberSince ? new Date(accountPlan.memberSince).toLocaleDateString() : '—'}</Text>
              <Text style={styles.cardLine}>Last Sync: {accountPlan.lastSync ? `${Math.round((Date.now()-accountPlan.lastSync)/60000)} mins ago` : '—'}</Text>
              <View style={styles.rowButtons}>
                <Button title="Upgrade Plan" onPress={() => {}} disabled={busy} />
                <View style={{ width: 12 }} />
                <Button title="Refresh License" onPress={refreshAll} disabled={busy} />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>License Health</Text>
              <Text style={styles.cardLine}>License ID: {accountPlan.licenseKey ? maskKey(accountPlan.licenseKey) : '—'}</Text>
              <Text style={styles.cardLine}>Validation: {status ? (status.valid ? 'Success' : 'Failed') : '—'}</Text>
              <Text style={styles.cardLine}>Last Validation: {status?.checked_at ? new Date(status.checked_at).toLocaleString() : '—'}</Text>
              <Text style={styles.cardLine}>Expiration: {status?.exp ? new Date(status.exp * 1000).toLocaleDateString() : 'Never'}</Text>
              <Text style={styles.cardLine}>Introspect: {introspect ? (introspect.active ? 'Active' : 'Inactive') : '—'}</Text>
              <View style={{ height: 8 }} />
              <Text style={[styles.badge, { backgroundColor: status && status.valid ? '#10b981' : '#f59e0b' }]}>{status && status.valid ? '🟢 Active' : '⚠️ Check'}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>License Management</Text>
              <Text style={styles.cardLine}>License Key: {licenseRevealed ? (accountPlan.licenseKey || '—') : maskKey(accountPlan.licenseKey)}</Text>
              <View style={styles.rowButtons}>
                <Button title={licenseRevealed ? 'Hide' : 'Reveal'} onPress={toggleReveal} />
                <View style={{ width: 12 }} />
                <Button title="Copy" onPress={() => copyLicenseToClipboard(accountPlan.licenseKey)} />
                <View style={{ width: 12 }} />
                <Button title="Assign" onPress={assignToAccount} disabled={!authToken} />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Team Seats</Text>
              <Text style={styles.cardLine}>Seats Used: {accountPlan.seatsUsed} / {accountPlan.seats}</Text>
              <Text style={styles.cardLine}>Owner: {user?.name || '—'}</Text>
              <View style={styles.rowButtons}><Button title="Invite User" onPress={() => {}} /></View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Activity</Text>
              <Text>• Account Created</Text>
              <Text>• Free License Issued</Text>
              <Text>• License Validated</Text>
            </View>
          </View>

          {/* Right column */}
          <View style={[styles.column, isWide ? styles.columnHalf : null]}>
            <View style={styles.plansContainer}>
              {PLANS.map((p) => (
                <View key={p.id} style={[styles.planCard, isWide ? styles.planCardHalf : null, p.id === accountPlan.name.toLowerCase() ? styles.planCardActive : null]}>
                  <Text style={styles.planTitle}>{p.title} — ${p.price}</Text>
                  <Text style={styles.planSub}>{p.seats} Seats</Text>
                  {p.features.map((f, i) => <Text key={i}>• {f}</Text>)}
                  <View style={{ height: 8 }} />
                  <Button title={p.id === accountPlan.name.toLowerCase() ? 'Current' : `Buy ${p.title}`} onPress={() => handlePurchase(p.id)} disabled={busy || purchasing} />
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Feature Comparison</Text>
              <View style={styles.matrixRow}><Text style={styles.matrixFeature}>Analytics</Text><Text style={styles.matrixCell}>✗</Text><Text style={styles.matrixCell}>✓</Text><Text style={styles.matrixCell}>✓</Text></View>
              <View style={styles.matrixRow}><Text style={styles.matrixFeature}>API Access</Text><Text style={styles.matrixCell}>✗</Text><Text style={styles.matrixCell}>✓</Text><Text style={styles.matrixCell}>✓</Text></View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Advanced Licensing Tools</Text>
              <View style={styles.rowButtons}>
                <Button title="Validate License" onPress={handleValidate} disabled={busy || validating} />
                <View style={{ width: 12 }} />
                <Button title="Issue Token" onPress={handleGetToken} disabled={busy || tokenLoading} />
                <View style={{ width: 12 }} />
                <Button title="Introspect Token" onPress={handleIntrospect} disabled={busy || introspecting || !token} />
                <View style={{ width: 12 }} />
                <Button title="Clear Token" onPress={handleClear} />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Billing</Text>
              <Text style={styles.cardLine}>Payment Provider: {invoices?.length ? invoices[0].provider : 'Paystack'}</Text>
              <Text style={styles.cardLine}>Last Payment: {invoices?.[0]?.amount ? `$${invoices[0].amount}` : '—'}</Text>
              <Text style={styles.cardLine}>Next Renewal: —</Text>
              <View style={styles.rowButtons}><Button title="View Invoices" onPress={() => {}} /><View style={{ width: 12 }} /><Button title="Change Payment" onPress={() => {}} /></View>
            </View>
          </View>
        </View>

        <Modal visible={showLicenseModal} transparent animationType="fade" onRequestClose={() => setShowLicenseModal(false)}>
          <View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.cardTitle}>License Key</Text><Text style={styles.mono}>{licenseKey || '—'}</Text><View style={styles.rowButtons}><Button title="Copy" onPress={() => copyLicenseToClipboard()} /><View style={{ width: 12 }} /><Button title={assigning ? 'Assigning…' : 'Assign to account'} onPress={assignToAccount} disabled={assigning} /></View><View style={{ height: 10 }} /><Button title="Close" onPress={() => setShowLicenseModal(false)} /></View></View>
        </Modal>

        <Modal visible={assignSeatsModalVisible} transparent animationType="fade" onRequestClose={() => setAssignSeatsModalVisible(false)}>
          <View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.cardTitle}>Assign Seats</Text><Text style={{ marginBottom: 8 }}>Current seats: {accountPlan.seats}</Text><TextInput style={styles.input} keyboardType="number-pad" value={String(seatsToAssign || '')} onChangeText={(t) => setSeatsToAssign(t)} /><View style={styles.rowButtons}><Button title={assigning ? 'Assigning…' : 'Assign'} onPress={submitAssignSeats} disabled={assigning} /><View style={{ width: 12 }} /><Button title="Cancel" onPress={() => setAssignSeatsModalVisible(false)} /></View></View></View>
        </Modal>

        <Modal visible={checkoutPolling} transparent animationType="fade" onRequestClose={cancelPolling}>
          <View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.cardTitle}>Completing purchase</Text><Text>{pollingMessage}</Text><ActivityIndicator size="large" style={{ marginTop: 12 }} /><View style={styles.rowButtons}><Button title="Re-open checkout" onPress={() => purchaseSession?.redirect_url && Linking.openURL(purchaseSession.redirect_url)} /><View style={{ width: 12 }} /><Button title="Cancel" onPress={cancelPolling} /></View>{pollAttempts > 0 && <Text style={{ marginTop: 8, fontSize: 12 }}>Attempt {pollAttempts}/6</Text>}</View></View>
        </Modal>

        {toastVisible && (<View style={styles.toast} pointerEvents="none"><Text style={styles.toastText}>{toastMessage}</Text></View>)}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#e6e6e6', borderRadius: 8, padding: 10, marginBottom: 12 },
  card: { padding: 14, borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 10, marginBottom: 14, backgroundColor: '#fff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '700', fontSize: 16, marginBottom: 8 },
  cardLine: { marginBottom: 6 },
  plansContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  planCard: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 10, backgroundColor: '#fff', width: '100%' },
  planCardHalf: { width: '48%' },
  planCardActive: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  planTitle: { fontWeight: '700', marginBottom: 6 },
  planSub: { fontSize: 12, color: '#666', marginBottom: 6 },
  rowButtons: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 520, backgroundColor: '#fff', padding: 16, borderRadius: 8 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusChipText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12, color: '#222' },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 24, backgroundColor: 'rgba(0,0,0,0.85)', padding: 12, borderRadius: 8, alignItems: 'center' },
  toastText: { color: '#fff', fontSize: 14 },
  badge: { color: '#fff', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', fontWeight: '700' },
  matrixRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  matrixFeature: { flex: 1 },
  matrixCell: { width: 48, textAlign: 'center' },
  /* Panels layout */
  panels: { flexDirection: 'column' },
  panelsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { flex: 1, paddingHorizontal: 6 },
  columnHalf: { width: '50%', paddingHorizontal: 6 },
  /* Horizontal spacing helper for two-column layouts */
  twoColumnSpacer: { width: 12 },
});
